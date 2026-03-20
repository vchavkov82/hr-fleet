package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockAppraisalService struct {
	listAppraisalsFunc   func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error)
	getAppraisalFunc     func(ctx context.Context, id int64) (*odoo.Appraisal, error)
	createAppraisalFunc  func(ctx context.Context, req odoo.AppraisalCreateRequest) (int64, error)
	updateAppraisalFunc  func(ctx context.Context, id int64, vals map[string]any) error
	confirmAppraisalFunc func(ctx context.Context, id int64) error
	completeAppraisalFn  func(ctx context.Context, id int64) error
	resetAppraisalFunc   func(ctx context.Context, id int64) error
	listTemplatesFunc    func(ctx context.Context, limit, offset int) ([]odoo.AppraisalTemplate, int, error)
}

func (m *mockAppraisalService) ListAppraisals(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error) {
	if m.listAppraisalsFunc != nil {
		return m.listAppraisalsFunc(ctx, employeeID, state, limit, offset)
	}
	return []odoo.Appraisal{}, 0, nil
}

func (m *mockAppraisalService) GetAppraisal(ctx context.Context, id int64) (*odoo.Appraisal, error) {
	if m.getAppraisalFunc != nil {
		return m.getAppraisalFunc(ctx, id)
	}
	return &odoo.Appraisal{ID: id}, nil
}

func (m *mockAppraisalService) CreateAppraisal(ctx context.Context, req odoo.AppraisalCreateRequest) (int64, error) {
	if m.createAppraisalFunc != nil {
		return m.createAppraisalFunc(ctx, req)
	}
	return 1, nil
}

func (m *mockAppraisalService) UpdateAppraisal(ctx context.Context, id int64, vals map[string]any) error {
	if m.updateAppraisalFunc != nil {
		return m.updateAppraisalFunc(ctx, id, vals)
	}
	return nil
}

func (m *mockAppraisalService) ConfirmAppraisal(ctx context.Context, id int64) error {
	if m.confirmAppraisalFunc != nil {
		return m.confirmAppraisalFunc(ctx, id)
	}
	return nil
}

func (m *mockAppraisalService) CompleteAppraisal(ctx context.Context, id int64) error {
	if m.completeAppraisalFn != nil {
		return m.completeAppraisalFn(ctx, id)
	}
	return nil
}

func (m *mockAppraisalService) ResetAppraisal(ctx context.Context, id int64) error {
	if m.resetAppraisalFunc != nil {
		return m.resetAppraisalFunc(ctx, id)
	}
	return nil
}

func (m *mockAppraisalService) ListTemplates(ctx context.Context, limit, offset int) ([]odoo.AppraisalTemplate, int, error) {
	if m.listTemplatesFunc != nil {
		return m.listTemplatesFunc(ctx, limit, offset)
	}
	return []odoo.AppraisalTemplate{}, 0, nil
}

func setupAppraisalRouter(mock *mockAppraisalService) http.Handler {
	h := NewAppraisalHandler(mock)
	r := chi.NewRouter()
	r.Get("/appraisals", h.HandleList)
	r.Get("/appraisals/templates", h.HandleListTemplates)
	r.Get("/appraisals/{id}", h.HandleGet)
	r.Post("/appraisals", h.HandleCreate)
	r.Put("/appraisals/{id}", h.HandleUpdate)
	r.Post("/appraisals/{id}/confirm", h.HandleConfirm)
	r.Post("/appraisals/{id}/complete", h.HandleComplete)
	r.Post("/appraisals/{id}/reset", h.HandleReset)
	return r
}

func TestAppraisalHandler_HandleList_Success(t *testing.T) {
	mock := &mockAppraisalService{
		listAppraisalsFunc: func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error) {
			return []odoo.Appraisal{
				{ID: 1, State: "1_new"},
				{ID: 2, State: "2_pending"},
			}, 2, nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/appraisals", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
	testutil.AssertHasField(t, resp, "total")
}

func TestAppraisalHandler_HandleList_WithFilters(t *testing.T) {
	var capturedEmployeeID int64
	var capturedState string
	mock := &mockAppraisalService{
		listAppraisalsFunc: func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error) {
			capturedEmployeeID = employeeID
			capturedState = state
			return []odoo.Appraisal{}, 0, nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/appraisals?employee_id=42&state=1_new", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	if capturedEmployeeID != 42 {
		t.Errorf("employee_id = %d, want 42", capturedEmployeeID)
	}
	if capturedState != "1_new" {
		t.Errorf("state = %s, want 1_new", capturedState)
	}
}

func TestAppraisalHandler_HandleList_ServiceUnavailable(t *testing.T) {
	mock := &mockAppraisalService{
		listAppraisalsFunc: func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/appraisals", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
}

func TestAppraisalHandler_HandleGet_Success(t *testing.T) {
	mock := &mockAppraisalService{
		getAppraisalFunc: func(ctx context.Context, id int64) (*odoo.Appraisal, error) {
			return &odoo.Appraisal{ID: id, State: "1_new"}, nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/appraisals/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestAppraisalHandler_HandleGet_InvalidID(t *testing.T) {
	mock := &mockAppraisalService{}
	router := setupAppraisalRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/appraisals/invalid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestAppraisalHandler_HandleCreate_InvalidJSON(t *testing.T) {
	mock := &mockAppraisalService{}
	router := setupAppraisalRouter(mock)

	req := testutil.NewTestRequest(http.MethodPost, "/appraisals", "{invalid")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_request")
}

func TestAppraisalHandler_HandleCreate_MissingEmployeeID(t *testing.T) {
	mock := &mockAppraisalService{}
	router := setupAppraisalRouter(mock)

	body := map[string]any{"date_close": "2024-12-31"}
	req := testutil.NewTestRequest(http.MethodPost, "/appraisals", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "validation_error")
}

func TestAppraisalHandler_HandleCreate_MissingDateClose(t *testing.T) {
	mock := &mockAppraisalService{}
	router := setupAppraisalRouter(mock)

	body := map[string]any{"employee_id": 1}
	req := testutil.NewTestRequest(http.MethodPost, "/appraisals", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "validation_error")
}

func TestAppraisalHandler_HandleCreate_Success(t *testing.T) {
	mock := &mockAppraisalService{
		createAppraisalFunc: func(ctx context.Context, req odoo.AppraisalCreateRequest) (int64, error) {
			return 42, nil
		},
	}

	router := setupAppraisalRouter(mock)
	body := map[string]any{"employee_id": 1, "date_close": "2024-12-31"}
	req := testutil.NewTestRequest(http.MethodPost, "/appraisals", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusCreated)
	resp := testutil.AssertJSONResponse(t, w)
	if resp["id"] != float64(42) {
		t.Errorf("id = %v, want 42", resp["id"])
	}
}

func TestAppraisalHandler_HandleUpdate_InvalidID(t *testing.T) {
	mock := &mockAppraisalService{}
	router := setupAppraisalRouter(mock)

	body := map[string]any{"feedback": "Great work!"}
	req := testutil.NewTestRequest(http.MethodPut, "/appraisals/abc", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestAppraisalHandler_HandleUpdate_InvalidJSON(t *testing.T) {
	mock := &mockAppraisalService{}
	router := setupAppraisalRouter(mock)

	req := testutil.NewTestRequest(http.MethodPut, "/appraisals/1", "{bad")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestAppraisalHandler_HandleUpdate_Success(t *testing.T) {
	mock := &mockAppraisalService{
		updateAppraisalFunc: func(ctx context.Context, id int64, vals map[string]any) error {
			return nil
		},
	}

	router := setupAppraisalRouter(mock)
	body := map[string]any{"feedback": "Good progress"}
	req := testutil.NewTestRequest(http.MethodPut, "/appraisals/1", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestAppraisalHandler_HandleConfirm_Success(t *testing.T) {
	mock := &mockAppraisalService{
		confirmAppraisalFunc: func(ctx context.Context, id int64) error {
			return nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/appraisals/1/confirm", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestAppraisalHandler_HandleComplete_Success(t *testing.T) {
	mock := &mockAppraisalService{
		completeAppraisalFn: func(ctx context.Context, id int64) error {
			return nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/appraisals/1/complete", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestAppraisalHandler_HandleReset_Success(t *testing.T) {
	mock := &mockAppraisalService{
		resetAppraisalFunc: func(ctx context.Context, id int64) error {
			return nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/appraisals/1/reset", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestAppraisalHandler_HandleListTemplates_Success(t *testing.T) {
	mock := &mockAppraisalService{
		listTemplatesFunc: func(ctx context.Context, limit, offset int) ([]odoo.AppraisalTemplate, int, error) {
			return []odoo.AppraisalTemplate{
				{ID: 1, Description: "Standard Review"},
			}, 1, nil
		},
	}

	router := setupAppraisalRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/appraisals/templates", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}
