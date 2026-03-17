package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockAttendanceService struct {
	listFunc     func(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.AttendanceRecord, int, error)
	checkInFunc  func(ctx context.Context, employeeID int64) (int64, error)
	checkOutFunc func(ctx context.Context, attendanceID int64) error
}

func (m *mockAttendanceService) List(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.AttendanceRecord, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, employeeID, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockAttendanceService) CheckIn(ctx context.Context, employeeID int64) (int64, error) {
	if m.checkInFunc != nil {
		return m.checkInFunc(ctx, employeeID)
	}
	return 0, nil
}

func (m *mockAttendanceService) CheckOut(ctx context.Context, attendanceID int64) error {
	if m.checkOutFunc != nil {
		return m.checkOutFunc(ctx, attendanceID)
	}
	return nil
}

func setupAttendanceRouter(mock *mockAttendanceService) http.Handler {
	h := NewAttendanceHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Get("/attendance", h.HandleList)
		r.Post("/attendance/check-in", h.HandleCheckIn)
		r.Post("/attendance/{id}/check-out", h.HandleCheckOut)
	})
	return r
}

func TestAttendanceHandleList_Success(t *testing.T) {
	mock := &mockAttendanceService{
		listFunc: func(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.AttendanceRecord, int, error) {
			return []odoo.AttendanceRecord{
				{ID: 1, CheckIn: "2026-03-17 09:00:00"},
				{ID: 2, CheckIn: "2026-03-17 10:00:00"},
			}, 2, nil
		},
	}

	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/attendance", nil)
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
		t.Errorf("expected 2 records, got %v", resp["data"])
	}
}

func TestAttendanceHandleList_ServiceError(t *testing.T) {
	mock := &mockAttendanceService{
		listFunc: func(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.AttendanceRecord, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/attendance", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestAttendanceHandleCheckIn_Success(t *testing.T) {
	mock := &mockAttendanceService{
		checkInFunc: func(ctx context.Context, employeeID int64) (int64, error) {
			return 99, nil
		},
	}

	body := `{"employee_id": 1}`
	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/attendance/check-in", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Fatalf("status = %d, want 201. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["id"] != float64(99) {
		t.Errorf("id = %v, want 99", resp["id"])
	}
}

func TestAttendanceHandleCheckIn_MissingEmployeeID(t *testing.T) {
	mock := &mockAttendanceService{}

	body := `{}`
	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/attendance/check-in", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestAttendanceHandleCheckIn_ServiceError(t *testing.T) {
	mock := &mockAttendanceService{
		checkInFunc: func(ctx context.Context, employeeID int64) (int64, error) {
			return 0, service.ErrServiceUnavailable
		},
	}

	body := `{"employee_id": 1}`
	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/attendance/check-in", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestAttendanceHandleCheckOut_Success(t *testing.T) {
	mock := &mockAttendanceService{
		checkOutFunc: func(ctx context.Context, attendanceID int64) error {
			return nil
		},
	}

	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/attendance/1/check-out", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestAttendanceHandleCheckOut_InvalidID(t *testing.T) {
	mock := &mockAttendanceService{}

	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/attendance/abc/check-out", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestAttendanceHandleCheckOut_ServiceError(t *testing.T) {
	mock := &mockAttendanceService{
		checkOutFunc: func(ctx context.Context, attendanceID int64) error {
			return fmt.Errorf("internal error")
		},
	}

	router := setupAttendanceRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/attendance/1/check-out", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}
