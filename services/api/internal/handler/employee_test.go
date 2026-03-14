package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/vchavkov/hr/services/api/platform/odoo"
	"github.com/vchavkov/hr/services/api/internal/service"
)

var testJWTAuth *jwtauth.JWTAuth

func init() {
	testJWTAuth = jwtauth.New("HS256", []byte("test-secret"), nil)
}

func makeTestToken() string {
	_, tokenString, _ := testJWTAuth.Encode(map[string]any{
		"sub":   "user-1",
		"email": "test@example.com",
		"exp":   time.Now().Add(time.Hour).Unix(),
	})
	return tokenString
}

// mockEmployeeService implements the EmployeeServicer interface for testing.
type mockEmployeeService struct {
	listFunc       func(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error)
	getFunc        func(ctx context.Context, id int64) (*odoo.Employee, error)
	createFunc     func(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error)
	updateFunc     func(ctx context.Context, id int64, vals map[string]any) error
	deactivateFunc func(ctx context.Context, id int64) error
}

func (m *mockEmployeeService) List(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, search, departmentID, activeOnly, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockEmployeeService) Get(ctx context.Context, id int64) (*odoo.Employee, error) {
	if m.getFunc != nil {
		return m.getFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockEmployeeService) Create(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error) {
	if m.createFunc != nil {
		return m.createFunc(ctx, req)
	}
	return 0, nil
}

func (m *mockEmployeeService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if m.updateFunc != nil {
		return m.updateFunc(ctx, id, vals)
	}
	return nil
}

func (m *mockEmployeeService) Deactivate(ctx context.Context, id int64) error {
	if m.deactivateFunc != nil {
		return m.deactivateFunc(ctx, id)
	}
	return nil
}

func setupTestRouter(mock *mockEmployeeService) http.Handler {
	h := NewEmployeeHandler(mock)

	r := chi.NewRouter()

	// Public routes for comparison
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	})

	// Protected API routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Route("/employees", func(r chi.Router) {
			r.Get("/", h.HandleList)
			r.Post("/", h.HandleCreate)
			r.Get("/{id}", h.HandleGet)
			r.Put("/{id}", h.HandleUpdate)
		})
	})

	return r
}

func TestHandleList_Returns200WithPagination(t *testing.T) {
	mock := &mockEmployeeService{
		listFunc: func(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
			return []odoo.Employee{
				{ID: 1, Name: "Alice"},
				{ID: 2, Name: "Bob"},
			}, 50, nil
		},
	}

	router := setupTestRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees?page=1&per_page=20", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)

	data, ok := resp["data"].([]any)
	if !ok || len(data) != 2 {
		t.Errorf("expected 2 employees, got %v", resp["data"])
	}

	pag, ok := resp["pagination"].(map[string]any)
	if !ok {
		t.Fatal("missing pagination")
	}
	if pag["total"] != float64(50) {
		t.Errorf("total = %v, want 50", pag["total"])
	}
}

func TestHandleList_SearchFilter(t *testing.T) {
	var capturedSearch string
	mock := &mockEmployeeService{
		listFunc: func(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
			capturedSearch = search
			return []odoo.Employee{{ID: 1, Name: "John"}}, 1, nil
		},
	}

	router := setupTestRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees?search=john", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200", w.Code)
	}
	if capturedSearch != "john" {
		t.Errorf("search = %q, want %q", capturedSearch, "john")
	}
}

func TestHandleList_DepartmentFilter(t *testing.T) {
	var capturedDept int64
	mock := &mockEmployeeService{
		listFunc: func(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
			capturedDept = departmentID
			return nil, 0, nil
		},
	}

	router := setupTestRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees?department_id=5", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200", w.Code)
	}
	if capturedDept != 5 {
		t.Errorf("department_id = %d, want 5", capturedDept)
	}
}

func TestHandleCreate_ValidBody_Returns201(t *testing.T) {
	mock := &mockEmployeeService{
		createFunc: func(ctx context.Context, req odoo.EmployeeCreateRequest) (int64, error) {
			return 42, nil
		},
	}

	body := `{"name":"New Employee","work_email":"new@company.com","job_title":"Developer"}`
	router := setupTestRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/employees", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Fatalf("status = %d, want 201. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["id"] != float64(42) {
		t.Errorf("id = %v, want 42", resp["id"])
	}
}

func TestHandleCreate_MissingFields_Returns400(t *testing.T) {
	mock := &mockEmployeeService{}

	body := `{"job_title":"Developer"}`
	router := setupTestRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/employees", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestHandleGet_Returns200(t *testing.T) {
	mock := &mockEmployeeService{
		getFunc: func(ctx context.Context, id int64) (*odoo.Employee, error) {
			return &odoo.Employee{ID: id, Name: "Alice"}, nil
		},
	}

	router := setupTestRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees/1", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestHandleUpdate_Returns200(t *testing.T) {
	mock := &mockEmployeeService{
		updateFunc: func(ctx context.Context, id int64, vals map[string]any) error {
			return nil
		},
	}

	body := `{"name":"Updated Name"}`
	router := setupTestRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/employees/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestAllRoutes_Return401WithoutJWT(t *testing.T) {
	mock := &mockEmployeeService{}
	router := setupTestRouter(mock)

	endpoints := []struct {
		method string
		path   string
	}{
		{"GET", "/api/v1/employees"},
		{"POST", "/api/v1/employees"},
		{"GET", "/api/v1/employees/1"},
		{"PUT", "/api/v1/employees/1"},
	}

	for _, ep := range endpoints {
		req := httptest.NewRequest(ep.method, ep.path, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != 401 {
			t.Errorf("%s %s: status = %d, want 401", ep.method, ep.path, w.Code)
		}
	}
}

func TestHandleList_ServiceUnavailable_Returns503(t *testing.T) {
	mock := &mockEmployeeService{
		listFunc: func(ctx context.Context, search string, departmentID int64, activeOnly bool, limit, offset int) ([]odoo.Employee, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupTestRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["error"] == nil || resp["error"] == "" {
		t.Error("expected error message in 503 response")
	}
}

// Ensure jwt import is used
var _ = jwt.New
