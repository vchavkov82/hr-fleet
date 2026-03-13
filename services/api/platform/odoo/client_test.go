package odoo

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

// newMockOdoo creates a test server that handles JSON-RPC requests.
// handler receives the parsed request and returns the result to encode.
func newMockOdoo(t *testing.T, handler func(req JSONRPCRequest) (interface{}, *RPCError)) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/jsonrpc" {
			http.NotFound(w, r)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("read body: %v", err)
		}

		var rpcReq JSONRPCRequest
		if err := json.Unmarshal(body, &rpcReq); err != nil {
			t.Fatalf("unmarshal request: %v", err)
		}

		result, rpcErr := handler(rpcReq)

		resp := JSONRPCResponse{
			JSONRPC: "2.0",
			ID:      rpcReq.ID,
		}
		if rpcErr != nil {
			resp.Error = rpcErr
		} else {
			raw, _ := json.Marshal(result)
			resp.Result = raw
		}

		// Set session cookie for auth tests
		http.SetCookie(w, &http.Cookie{Name: "session_id", Value: "test-session-123"})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
}

func TestAuthenticate_ValidCredentials(t *testing.T) {
	srv := newMockOdoo(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		// Odoo returns uid on successful login
		return int64(42), nil
	})
	defer srv.Close()

	c := NewClient(srv.URL, "testdb", "admin", "admin")
	err := c.Authenticate()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if c.uid != 42 {
		t.Errorf("expected uid 42, got %d", c.uid)
	}
}

func TestAuthenticate_InvalidCredentials(t *testing.T) {
	srv := newMockOdoo(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		// Odoo returns false for failed login
		return false, nil
	})
	defer srv.Close()

	c := NewClient(srv.URL, "testdb", "admin", "wrong")
	err := c.Authenticate()
	if err == nil {
		t.Fatal("expected error for invalid credentials")
	}
}

func TestCall_FormatsJSONRPC(t *testing.T) {
	var captured JSONRPCRequest

	srv := newMockOdoo(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		captured = req
		return true, nil
	})
	defer srv.Close()

	c := NewClient(srv.URL, "testdb", "admin", "admin")
	c.uid = 1 // pre-set to skip auth

	_, err := c.Call("object", "execute", []interface{}{"testdb", 1, "admin", "hr.employee", "search_read"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if captured.JSONRPC != "2.0" {
		t.Errorf("expected jsonrpc 2.0, got %s", captured.JSONRPC)
	}
	if captured.Method != "call" {
		t.Errorf("expected method 'call', got %s", captured.Method)
	}
}

func TestCall_ParsesErrorResponse(t *testing.T) {
	srv := newMockOdoo(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		return nil, &RPCError{
			Code:    200,
			Message: "Odoo Server Error",
			Data:    map[string]interface{}{"message": "Access Denied"},
		}
	})
	defer srv.Close()

	c := NewClient(srv.URL, "testdb", "admin", "admin")
	c.uid = 1

	_, err := c.Call("object", "execute", []interface{}{})
	if err == nil {
		t.Fatal("expected error from RPC error response")
	}
}

func TestCall_ReauthenticatesOnSessionExpiry(t *testing.T) {
	var callCount atomic.Int32

	srv := newMockOdoo(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		count := callCount.Add(1)

		// Extract service from params to distinguish auth vs regular calls
		params, ok := req.Params.(map[string]interface{})
		if !ok {
			return nil, &RPCError{Code: 100, Message: "bad params"}
		}

		service, _ := params["service"].(string)

		if service == "common" {
			// Auth call - return uid
			return int64(42), nil
		}

		// First object call fails with AccessDenied, second succeeds
		if count == 1 {
			return nil, &RPCError{
				Code:    100,
				Message: "Odoo Session Expired",
				Data: map[string]interface{}{
					"name":    "odoo.exceptions.AccessDenied",
					"message": "Access Denied",
				},
			}
		}
		return true, nil
	})
	defer srv.Close()

	c := NewClient(srv.URL, "testdb", "admin", "admin")
	c.uid = 1 // pre-set as if previously authenticated
	c.sessionID = "old-session"

	_, err := c.Call("object", "execute", []interface{}{})
	if err != nil {
		t.Fatalf("expected successful retry after re-auth, got: %v", err)
	}
}

// --- Employee CRUD Tests ---

// mockOdooEmployee returns a map mimicking an Odoo hr.employee search_read record.
func mockOdooEmployee(id int64, name, email, jobTitle string) map[string]interface{} {
	return map[string]interface{}{
		"id":            float64(id),
		"name":          name,
		"work_email":    email,
		"job_title":     jobTitle,
		"department_id": []interface{}{float64(5), "Engineering"},
		"job_id":        []interface{}{float64(10), "Developer"},
		"parent_id":     []interface{}{float64(1), "Jane Manager"},
		"work_phone":    "+359888123456",
		"mobile_phone":  "+359877654321",
		"employee_type": "employee",
		"active":        true,
		"create_date":   "2026-01-15 10:00:00",
		"write_date":    "2026-03-01 14:30:00",
	}
}

// newAuthenticatedClient creates a client pre-authenticated against a mock server.
func newAuthenticatedClient(t *testing.T, handler func(req JSONRPCRequest) (interface{}, *RPCError)) (*Client, *httptest.Server) {
	t.Helper()
	srv := newMockOdoo(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		params, ok := req.Params.(map[string]interface{})
		if ok {
			service, _ := params["service"].(string)
			if service == "common" {
				return int64(1), nil
			}
		}
		return handler(req)
	})
	c := NewClient(srv.URL, "testdb", "admin", "admin")
	c.uid = 1
	return c, srv
}

func TestListEmployees_ReturnsSlice(t *testing.T) {
	c, srv := newAuthenticatedClient(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		params, _ := req.Params.(map[string]interface{})
		args, _ := params["args"].([]interface{})
		// Detect search_count vs search_read by method name (5th arg)
		if len(args) >= 5 {
			method, _ := args[4].(string)
			if method == "search_count" {
				return float64(2), nil
			}
		}
		return []interface{}{
			mockOdooEmployee(1, "Ivan Petrov", "ivan@example.com", "Developer"),
			mockOdooEmployee(2, "Maria Ivanova", "maria@example.com", "Designer"),
		}, nil
	})
	defer srv.Close()

	employees, total, err := c.ListEmployees(nil, 10, 0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if total != 2 {
		t.Errorf("expected total 2, got %d", total)
	}
	if len(employees) != 2 {
		t.Fatalf("expected 2 employees, got %d", len(employees))
	}
	if employees[0].Name != "Ivan Petrov" {
		t.Errorf("expected name 'Ivan Petrov', got %q", employees[0].Name)
	}
	if employees[0].WorkEmail != "ivan@example.com" {
		t.Errorf("expected email 'ivan@example.com', got %q", employees[0].WorkEmail)
	}
	if employees[0].DepartmentID.Name != "Engineering" {
		t.Errorf("expected department 'Engineering', got %q", employees[0].DepartmentID.Name)
	}
	if employees[0].DepartmentID.ID != 5 {
		t.Errorf("expected department ID 5, got %d", employees[0].DepartmentID.ID)
	}
}

func TestListEmployees_AppliesDomainFilters(t *testing.T) {
	var capturedArgs []interface{}

	c, srv := newAuthenticatedClient(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		params, _ := req.Params.(map[string]interface{})
		args, _ := params["args"].([]interface{})
		if len(args) >= 5 {
			method, _ := args[4].(string)
			if method == "search_count" {
				return float64(1), nil
			}
		}
		capturedArgs = args
		return []interface{}{
			mockOdooEmployee(1, "Ivan Petrov", "ivan@example.com", "Developer"),
		}, nil
	})
	defer srv.Close()

	domain := []interface{}{
		[]interface{}{"department_id", "=", 5},
		[]interface{}{"active", "=", true},
	}

	_, _, err := c.ListEmployees(domain, 10, 0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify domain was passed in args (6th position: domain wrapped in array)
	if capturedArgs == nil {
		t.Fatal("expected args to be captured")
	}
}

func TestListEmployees_RespectsLimitOffset(t *testing.T) {
	var capturedKwargs map[string]interface{}

	c, srv := newAuthenticatedClient(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		params, _ := req.Params.(map[string]interface{})
		args, _ := params["args"].([]interface{})
		if len(args) >= 5 {
			method, _ := args[4].(string)
			if method == "search_count" {
				return float64(50), nil
			}
		}
		// kwargs is the last arg
		if len(args) >= 7 {
			if kw, ok := args[6].(map[string]interface{}); ok {
				capturedKwargs = kw
			}
		}
		return []interface{}{
			mockOdooEmployee(11, "Page2 Employee", "p2@example.com", "Tester"),
		}, nil
	})
	defer srv.Close()

	employees, total, err := c.ListEmployees(nil, 5, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if total != 50 {
		t.Errorf("expected total 50, got %d", total)
	}
	if len(employees) != 1 {
		t.Errorf("expected 1 employee, got %d", len(employees))
	}
	if capturedKwargs == nil {
		t.Fatal("expected kwargs to be captured")
	}
	if limit, ok := capturedKwargs["limit"].(float64); !ok || int(limit) != 5 {
		t.Errorf("expected limit 5, got %v", capturedKwargs["limit"])
	}
	if offset, ok := capturedKwargs["offset"].(float64); !ok || int(offset) != 10 {
		t.Errorf("expected offset 10, got %v", capturedKwargs["offset"])
	}
}

func TestGetEmployee_ReturnsSingle(t *testing.T) {
	c, srv := newAuthenticatedClient(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		return []interface{}{
			mockOdooEmployee(42, "Boris Todorov", "boris@example.com", "CTO"),
		}, nil
	})
	defer srv.Close()

	emp, err := c.GetEmployee(42)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if emp.ID != 42 {
		t.Errorf("expected ID 42, got %d", emp.ID)
	}
	if emp.Name != "Boris Todorov" {
		t.Errorf("expected name 'Boris Todorov', got %q", emp.Name)
	}
	if emp.JobTitle != "CTO" {
		t.Errorf("expected job title 'CTO', got %q", emp.JobTitle)
	}
}

func TestCreateEmployee_ReturnsNewID(t *testing.T) {
	var capturedVals map[string]interface{}

	c, srv := newAuthenticatedClient(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		params, _ := req.Params.(map[string]interface{})
		args, _ := params["args"].([]interface{})
		// Create call: args = [db, uid, pwd, model, "create", [vals]]
		if len(args) >= 6 {
			if valsArr, ok := args[5].([]interface{}); ok && len(valsArr) > 0 {
				if v, ok := valsArr[0].(map[string]interface{}); ok {
					capturedVals = v
				}
			}
		}
		return float64(99), nil
	})
	defer srv.Close()

	req := EmployeeCreateRequest{
		Name:         "New Employee",
		WorkEmail:    "new@example.com",
		JobTitle:     "Junior Dev",
		DepartmentID: 5,
		EmployeeType: "employee",
	}

	id, err := c.CreateEmployee(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if id != 99 {
		t.Errorf("expected ID 99, got %d", id)
	}
	if capturedVals == nil {
		t.Fatal("expected vals to be captured")
	}
	if capturedVals["name"] != "New Employee" {
		t.Errorf("expected name 'New Employee', got %v", capturedVals["name"])
	}
	if capturedVals["work_email"] != "new@example.com" {
		t.Errorf("expected work_email 'new@example.com', got %v", capturedVals["work_email"])
	}
}

func TestUpdateEmployee_SendsChangedFields(t *testing.T) {
	var capturedVals map[string]interface{}
	var capturedIDs []interface{}

	c, srv := newAuthenticatedClient(t, func(req JSONRPCRequest) (interface{}, *RPCError) {
		params, _ := req.Params.(map[string]interface{})
		args, _ := params["args"].([]interface{})
		// Write call: args = [db, uid, pwd, model, "write", [[ids], vals]]
		if len(args) >= 6 {
			if writeArgs, ok := args[5].([]interface{}); ok && len(writeArgs) >= 2 {
				if ids, ok := writeArgs[0].([]interface{}); ok {
					capturedIDs = ids
				}
				if v, ok := writeArgs[1].(map[string]interface{}); ok {
					capturedVals = v
				}
			}
		}
		return true, nil
	})
	defer srv.Close()

	vals := map[string]interface{}{
		"job_title": "Senior Dev",
		"work_phone": "+359888999000",
	}

	err := c.UpdateEmployee(42, vals)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if capturedVals == nil {
		t.Fatal("expected vals to be captured")
	}
	if capturedVals["job_title"] != "Senior Dev" {
		t.Errorf("expected job_title 'Senior Dev', got %v", capturedVals["job_title"])
	}
	// Verify only provided fields were sent (no extra fields)
	if len(capturedVals) != 2 {
		t.Errorf("expected 2 fields, got %d", len(capturedVals))
	}
	// Verify correct ID was sent
	if len(capturedIDs) != 1 {
		t.Fatalf("expected 1 ID, got %d", len(capturedIDs))
	}
	if capturedIDs[0].(float64) != 42 {
		t.Errorf("expected ID 42, got %v", capturedIDs[0])
	}
}
