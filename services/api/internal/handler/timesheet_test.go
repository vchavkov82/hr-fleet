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
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockTimesheetService struct {
	listFunc   func(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error)
	createFunc func(ctx context.Context, employeeID int64, date, name string, hours float64, projectID, taskID int64) (int64, error)
	updateFunc func(ctx context.Context, id int64, vals map[string]any) error
}

func (m *mockTimesheetService) List(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, employeeID, dateFrom, dateTo, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockTimesheetService) Create(ctx context.Context, employeeID int64, date, name string, hours float64, projectID, taskID int64) (int64, error) {
	if m.createFunc != nil {
		return m.createFunc(ctx, employeeID, date, name, hours, projectID, taskID)
	}
	return 0, nil
}

func (m *mockTimesheetService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if m.updateFunc != nil {
		return m.updateFunc(ctx, id, vals)
	}
	return nil
}

func setupTimesheetRouter(mock *mockTimesheetService) http.Handler {
	h := NewTimesheetHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Get("/timesheets", h.HandleList)
		r.Post("/timesheets", h.HandleCreate)
		r.Put("/timesheets/{id}", h.HandleUpdate)
	})
	return r
}

func TestTimesheetHandleList_Success(t *testing.T) {
	mock := &mockTimesheetService{
		listFunc: func(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error) {
			return []odoo.TimesheetEntry{{ID: 1}, {ID: 2}}, 10, nil
		},
	}

	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/timesheets", nil)
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
		t.Errorf("expected 2 entries, got %v", resp["data"])
	}
	if resp["total"] != float64(10) {
		t.Errorf("total = %v, want 10", resp["total"])
	}
}

func TestTimesheetHandleList_WithFilters(t *testing.T) {
	var capturedFrom, capturedTo string
	var capturedEmpID int64
	mock := &mockTimesheetService{
		listFunc: func(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error) {
			capturedEmpID = employeeID
			capturedFrom = dateFrom
			capturedTo = dateTo
			return nil, 0, nil
		},
	}

	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/timesheets?employee_id=5&date_from=2026-01-01&date_to=2026-01-31", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200", w.Code)
	}
	if capturedEmpID != 5 {
		t.Errorf("employee_id = %d, want 5", capturedEmpID)
	}
	if capturedFrom != "2026-01-01" {
		t.Errorf("date_from = %q, want %q", capturedFrom, "2026-01-01")
	}
	if capturedTo != "2026-01-31" {
		t.Errorf("date_to = %q, want %q", capturedTo, "2026-01-31")
	}
}

func TestTimesheetHandleList_ServiceError(t *testing.T) {
	mock := &mockTimesheetService{
		listFunc: func(ctx context.Context, employeeID int64, dateFrom, dateTo string, limit, offset int) ([]odoo.TimesheetEntry, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/timesheets", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleCreate_Success(t *testing.T) {
	mock := &mockTimesheetService{
		createFunc: func(ctx context.Context, employeeID int64, date, name string, hours float64, projectID, taskID int64) (int64, error) {
			return 42, nil
		},
	}

	body := `{"employee_id":1,"date":"2026-03-17","name":"Development","hours":8}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/timesheets", bytes.NewBufferString(body))
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

func TestTimesheetHandleCreate_MissingEmployeeID(t *testing.T) {
	mock := &mockTimesheetService{}

	body := `{"date":"2026-03-17","hours":8}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/timesheets", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleCreate_MissingDate(t *testing.T) {
	mock := &mockTimesheetService{}

	body := `{"employee_id":1,"hours":8}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/timesheets", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleCreate_HoursZero(t *testing.T) {
	mock := &mockTimesheetService{}

	body := `{"employee_id":1,"date":"2026-03-17","hours":0}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/timesheets", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleCreate_HoursOver24(t *testing.T) {
	mock := &mockTimesheetService{}

	body := `{"employee_id":1,"date":"2026-03-17","hours":25}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/timesheets", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleUpdate_Success(t *testing.T) {
	mock := &mockTimesheetService{
		updateFunc: func(ctx context.Context, id int64, vals map[string]any) error {
			return nil
		},
	}

	body := `{"name":"Updated task","hours":4}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/timesheets/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleUpdate_InvalidID(t *testing.T) {
	mock := &mockTimesheetService{}

	body := `{"name":"Updated"}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/timesheets/abc", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestTimesheetHandleUpdate_NoFields(t *testing.T) {
	mock := &mockTimesheetService{}

	body := `{}`
	router := setupTimesheetRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/timesheets/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}
