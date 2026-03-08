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
