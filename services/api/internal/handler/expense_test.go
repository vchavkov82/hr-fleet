package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockExpenseService struct {
	listFunc    func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.ExpenseReport, int, error)
	createFunc  func(ctx context.Context, employeeID int64, name string, amount float64, date string) (int64, error)
	approveFunc func(ctx context.Context, id int64) error
	refuseFunc  func(ctx context.Context, id int64) error
}

func (m *mockExpenseService) List(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.ExpenseReport, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, employeeID, state, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockExpenseService) Create(ctx context.Context, employeeID int64, name string, amount float64, date string) (int64, error) {
	if m.createFunc != nil {
		return m.createFunc(ctx, employeeID, name, amount, date)
	}
	return 0, nil
}

func (m *mockExpenseService) Approve(ctx context.Context, id int64) error {
	if m.approveFunc != nil {
		return m.approveFunc(ctx, id)
	}
	return nil
}

func (m *mockExpenseService) Refuse(ctx context.Context, id int64) error {
	if m.refuseFunc != nil {
		return m.refuseFunc(ctx, id)
	}
	return nil
}

func setupExpenseRouter(mock *mockExpenseService) http.Handler {
	h := NewExpenseHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Get("/expenses", h.HandleList)
		r.Post("/expenses", h.HandleCreate)
		r.Patch("/expenses/{id}", h.HandleUpdate)
	})
	return r
}

func TestExpenseHandleList_Success(t *testing.T) {
	mock := &mockExpenseService{
		listFunc: func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.ExpenseReport, int, error) {
			return []odoo.ExpenseReport{{ID: 1, Name: "Travel"}, {ID: 2, Name: "Lunch"}}, 2, nil
		},
	}

	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/expenses", nil)
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
		t.Errorf("expected 2 expenses, got %v", resp["data"])
	}
}

func TestExpenseHandleList_WithFilters(t *testing.T) {
	var capturedEmpID int64
	var capturedState string
	mock := &mockExpenseService{
		listFunc: func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.ExpenseReport, int, error) {
			capturedEmpID = employeeID
			capturedState = state
			return nil, 0, nil
		},
	}

	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/expenses?employee_id=3&state=approved", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200", w.Code)
	}
	if capturedEmpID != 3 {
		t.Errorf("employee_id = %d, want 3", capturedEmpID)
	}
	if capturedState != "approved" {
		t.Errorf("state = %q, want %q", capturedState, "approved")
	}
}

func TestExpenseHandleCreate_Success(t *testing.T) {
	mock := &mockExpenseService{
		createFunc: func(ctx context.Context, employeeID int64, name string, amount float64, date string) (int64, error) {
			return 10, nil
		},
	}

	body := `{"employee_id":1,"name":"Hotel","amount":150.50,"date":"2026-03-17"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/expenses", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Fatalf("status = %d, want 201. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["id"] != float64(10) {
		t.Errorf("id = %v, want 10", resp["id"])
	}
}

func TestExpenseHandleCreate_MissingEmployeeID(t *testing.T) {
	mock := &mockExpenseService{}

	body := `{"name":"Hotel","amount":100,"date":"2026-03-17"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/expenses", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestExpenseHandleCreate_MissingName(t *testing.T) {
	mock := &mockExpenseService{}

	body := `{"employee_id":1,"amount":100,"date":"2026-03-17"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/expenses", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestExpenseHandleCreate_AmountZero(t *testing.T) {
	mock := &mockExpenseService{}

	body := `{"employee_id":1,"name":"Hotel","amount":0,"date":"2026-03-17"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/expenses", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestExpenseHandleUpdate_Approve(t *testing.T) {
	var approveCalled bool
	mock := &mockExpenseService{
		approveFunc: func(ctx context.Context, id int64) error {
			approveCalled = true
			return nil
		},
	}

	body := `{"action":"approve"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("PATCH", "/api/v1/expenses/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
	if !approveCalled {
		t.Error("expected Approve to be called")
	}
}

func TestExpenseHandleUpdate_Refuse(t *testing.T) {
	var refuseCalled bool
	mock := &mockExpenseService{
		refuseFunc: func(ctx context.Context, id int64) error {
			refuseCalled = true
			return nil
		},
	}

	body := `{"action":"refuse"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("PATCH", "/api/v1/expenses/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
	if !refuseCalled {
		t.Error("expected Refuse to be called")
	}
}

func TestExpenseHandleUpdate_InvalidAction(t *testing.T) {
	mock := &mockExpenseService{}

	body := `{"action":"delete"}`
	router := setupExpenseRouter(mock)
	req := httptest.NewRequest("PATCH", "/api/v1/expenses/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}
