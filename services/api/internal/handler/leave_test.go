package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockLeaveService struct {
	listAllocationsFunc func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.LeaveAllocation, int, error)
	listRequestsFunc    func(ctx context.Context, employeeID int64, status string, page, perPage int) ([]odoo.LeaveRequest, int, error)
	createRequestFunc   func(ctx context.Context, req odoo.LeaveCreateRequest) (int64, error)
	approveRequestFunc  func(ctx context.Context, leaveID int64, approverUserID string) error
	rejectRequestFunc   func(ctx context.Context, leaveID int64, reason, rejecterUserID string) error
	cancelRequestFunc   func(ctx context.Context, leaveID int64) error
}

func (m *mockLeaveService) ListAllocations(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.LeaveAllocation, int, error) {
	if m.listAllocationsFunc != nil {
		return m.listAllocationsFunc(ctx, employeeID, page, perPage)
	}
	return nil, 0, nil
}

func (m *mockLeaveService) ListRequests(ctx context.Context, employeeID int64, status string, page, perPage int) ([]odoo.LeaveRequest, int, error) {
	if m.listRequestsFunc != nil {
		return m.listRequestsFunc(ctx, employeeID, status, page, perPage)
	}
	return nil, 0, nil
}

func (m *mockLeaveService) CreateRequest(ctx context.Context, req odoo.LeaveCreateRequest) (int64, error) {
	if m.createRequestFunc != nil {
		return m.createRequestFunc(ctx, req)
	}
	return 0, nil
}

func (m *mockLeaveService) ApproveRequest(ctx context.Context, leaveID int64, approverUserID string) error {
	if m.approveRequestFunc != nil {
		return m.approveRequestFunc(ctx, leaveID, approverUserID)
	}
	return nil
}

func (m *mockLeaveService) RejectRequest(ctx context.Context, leaveID int64, reason, rejecterUserID string) error {
	if m.rejectRequestFunc != nil {
		return m.rejectRequestFunc(ctx, leaveID, reason, rejecterUserID)
	}
	return nil
}

func (m *mockLeaveService) CancelRequest(ctx context.Context, leaveID int64) error {
	if m.cancelRequestFunc != nil {
		return m.cancelRequestFunc(ctx, leaveID)
	}
	return nil
}

func setupLeaveRouter(mock *mockLeaveService) http.Handler {
	h := NewLeaveHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Route("/leave", func(r chi.Router) {
			r.Get("/allocations", h.HandleListAllocations)
			r.Get("/requests", h.HandleListRequests)
			r.Post("/requests", h.HandleCreateRequest)
			r.Post("/requests/{id}/approve", h.HandleApproveRequest)
			r.Post("/requests/{id}/reject", h.HandleRejectRequest)
			r.Delete("/requests/{id}", h.HandleCancelRequest)
		})
	})
	return r
}

func TestLeaveHandleListAllocations_Success(t *testing.T) {
	mock := &mockLeaveService{
		listAllocationsFunc: func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.LeaveAllocation, int, error) {
			return []odoo.LeaveAllocation{
				{ID: 1, NumberOfDays: 20},
			}, 1, nil
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/leave/allocations", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleListAllocations_ServiceUnavailable(t *testing.T) {
	mock := &mockLeaveService{
		listAllocationsFunc: func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.LeaveAllocation, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/leave/allocations", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleListRequests_Success(t *testing.T) {
	mock := &mockLeaveService{
		listRequestsFunc: func(ctx context.Context, employeeID int64, status string, page, perPage int) ([]odoo.LeaveRequest, int, error) {
			return []odoo.LeaveRequest{
				{ID: 1, State: "confirm"},
				{ID: 2, State: "validate"},
			}, 10, nil
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/leave/requests?status=confirm", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleCreateRequest_Success(t *testing.T) {
	mock := &mockLeaveService{
		createRequestFunc: func(ctx context.Context, req odoo.LeaveCreateRequest) (int64, error) {
			return 77, nil
		},
	}

	body := `{"employee_id":1,"holiday_status_id":2,"date_from":"2026-04-01","date_to":"2026-04-05"}`
	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Fatalf("status = %d, want 201. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["id"] != float64(77) {
		t.Errorf("id = %v, want 77", resp["id"])
	}
}

func TestLeaveHandleCreateRequest_ValidationError(t *testing.T) {
	mock := &mockLeaveService{}

	body := `{"employee_id":0}`
	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleApproveRequest_Success(t *testing.T) {
	mock := &mockLeaveService{
		approveRequestFunc: func(ctx context.Context, leaveID int64, approverUserID string) error {
			return nil
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests/5/approve", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleApproveRequest_InvalidID(t *testing.T) {
	mock := &mockLeaveService{}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests/abc/approve", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleApproveRequest_ServiceError(t *testing.T) {
	mock := &mockLeaveService{
		approveRequestFunc: func(ctx context.Context, leaveID int64, approverUserID string) error {
			return errors.New("approval failed")
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests/5/approve", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleRejectRequest_Success(t *testing.T) {
	mock := &mockLeaveService{
		rejectRequestFunc: func(ctx context.Context, leaveID int64, reason, rejecterUserID string) error {
			return nil
		},
	}

	body := `{"reason":"insufficient balance"}`
	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests/5/reject", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleRejectRequest_InvalidID(t *testing.T) {
	mock := &mockLeaveService{}

	body := `{"reason":"test"}`
	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/leave/requests/abc/reject", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleCancelRequest_Success(t *testing.T) {
	mock := &mockLeaveService{
		cancelRequestFunc: func(ctx context.Context, leaveID int64) error {
			return nil
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("DELETE", "/api/v1/leave/requests/5", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleCancelRequest_InvalidID(t *testing.T) {
	mock := &mockLeaveService{}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("DELETE", "/api/v1/leave/requests/abc", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestLeaveHandleCancelRequest_ServiceError(t *testing.T) {
	mock := &mockLeaveService{
		cancelRequestFunc: func(ctx context.Context, leaveID int64) error {
			return errors.New("cancel failed")
		},
	}

	router := setupLeaveRouter(mock)
	req := httptest.NewRequest("DELETE", "/api/v1/leave/requests/5", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}
