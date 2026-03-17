package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockPayrollOCAService struct {
	listStructuresFunc  func(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error)
	getStructureFunc    func(ctx context.Context, id int64) (*odoo.PayrollStructure, error)
	listRulesFunc       func(ctx context.Context, structID int64, limit, offset int) ([]odoo.SalaryRule, int, error)
	listPayslipsFunc    func(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.PayslipOCA, int, error)
	createPayslipRunFunc func(ctx context.Context, name, dateFrom, dateTo string) (int64, error)
	generatePayslipsFunc func(ctx context.Context, runID int64) error
	confirmPayslipRunFunc func(ctx context.Context, runID int64) error
}

func (m *mockPayrollOCAService) ListStructures(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error) {
	if m.listStructuresFunc != nil {
		return m.listStructuresFunc(ctx, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockPayrollOCAService) GetStructure(ctx context.Context, id int64) (*odoo.PayrollStructure, error) {
	if m.getStructureFunc != nil {
		return m.getStructureFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockPayrollOCAService) ListRules(ctx context.Context, structID int64, limit, offset int) ([]odoo.SalaryRule, int, error) {
	if m.listRulesFunc != nil {
		return m.listRulesFunc(ctx, structID, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockPayrollOCAService) ListPayslips(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.PayslipOCA, int, error) {
	if m.listPayslipsFunc != nil {
		return m.listPayslipsFunc(ctx, employeeID, state, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockPayrollOCAService) CreatePayslipRun(ctx context.Context, name, dateFrom, dateTo string) (int64, error) {
	if m.createPayslipRunFunc != nil {
		return m.createPayslipRunFunc(ctx, name, dateFrom, dateTo)
	}
	return 0, nil
}

func (m *mockPayrollOCAService) GeneratePayslips(ctx context.Context, runID int64) error {
	if m.generatePayslipsFunc != nil {
		return m.generatePayslipsFunc(ctx, runID)
	}
	return nil
}

func (m *mockPayrollOCAService) ConfirmPayslipRun(ctx context.Context, runID int64) error {
	if m.confirmPayslipRunFunc != nil {
		return m.confirmPayslipRunFunc(ctx, runID)
	}
	return nil
}

func setupPayrollOCARouter(mock *mockPayrollOCAService) http.Handler {
	h := NewPayrollOCAHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Route("/payroll", func(r chi.Router) {
			r.Get("/structures", h.HandleListStructures)
			r.Get("/structures/{id}", h.HandleGetStructure)
			r.Get("/rules", h.HandleListRules)
		})
	})
	return r
}

func TestPayrollOCAHandleListStructures_Success(t *testing.T) {
	mock := &mockPayrollOCAService{
		listStructuresFunc: func(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error) {
			return []odoo.PayrollStructure{
				{ID: 1, Name: "Basic", Code: "BASIC"},
			}, 1, nil
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/structures", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleListStructures_ServiceUnavailable(t *testing.T) {
	mock := &mockPayrollOCAService{
		listStructuresFunc: func(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/structures", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleListStructures_ServiceError(t *testing.T) {
	mock := &mockPayrollOCAService{
		listStructuresFunc: func(ctx context.Context, limit, offset int) ([]odoo.PayrollStructure, int, error) {
			return nil, 0, errors.New("db error")
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/structures", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleGetStructure_Success(t *testing.T) {
	mock := &mockPayrollOCAService{
		getStructureFunc: func(ctx context.Context, id int64) (*odoo.PayrollStructure, error) {
			return &odoo.PayrollStructure{ID: id, Name: "Basic", Code: "BASIC"}, nil
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/structures/1", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleGetStructure_InvalidID(t *testing.T) {
	mock := &mockPayrollOCAService{}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/structures/abc", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleGetStructure_NotFound(t *testing.T) {
	mock := &mockPayrollOCAService{
		getStructureFunc: func(ctx context.Context, id int64) (*odoo.PayrollStructure, error) {
			return nil, errors.New("not found")
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/structures/999", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 404 {
		t.Fatalf("status = %d, want 404. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleListRules_Success(t *testing.T) {
	mock := &mockPayrollOCAService{
		listRulesFunc: func(ctx context.Context, structID int64, limit, offset int) ([]odoo.SalaryRule, int, error) {
			return []odoo.SalaryRule{
				{ID: 1, Name: "Basic Salary", Code: "BASIC"},
			}, 1, nil
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/rules?struct_id=1", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestPayrollOCAHandleListRules_ServiceError(t *testing.T) {
	mock := &mockPayrollOCAService{
		listRulesFunc: func(ctx context.Context, structID int64, limit, offset int) ([]odoo.SalaryRule, int, error) {
			return nil, 0, errors.New("db error")
		},
	}

	router := setupPayrollOCARouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/payroll/rules", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}
