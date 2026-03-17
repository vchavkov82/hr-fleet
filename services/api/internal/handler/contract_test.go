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

type mockContractService struct {
	listFunc   func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error)
	getFunc    func(ctx context.Context, id int64) (*odoo.Contract, error)
	createFunc func(ctx context.Context, req odoo.ContractCreateRequest) (int64, error)
	updateFunc func(ctx context.Context, id int64, vals map[string]any) error
}

func (m *mockContractService) List(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, employeeID, page, perPage)
	}
	return nil, 0, nil
}

func (m *mockContractService) Get(ctx context.Context, id int64) (*odoo.Contract, error) {
	if m.getFunc != nil {
		return m.getFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockContractService) Create(ctx context.Context, req odoo.ContractCreateRequest) (int64, error) {
	if m.createFunc != nil {
		return m.createFunc(ctx, req)
	}
	return 0, nil
}

func (m *mockContractService) Update(ctx context.Context, id int64, vals map[string]any) error {
	if m.updateFunc != nil {
		return m.updateFunc(ctx, id, vals)
	}
	return nil
}

func setupContractRouter(mock *mockContractService) http.Handler {
	h := NewContractHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Route("/contracts", func(r chi.Router) {
			r.Get("/", h.HandleList)
			r.Post("/", h.HandleCreate)
			r.Get("/{id}", h.HandleGet)
			r.Put("/{id}", h.HandleUpdate)
		})
	})
	return r
}

func TestContractHandleList_Success(t *testing.T) {
	mock := &mockContractService{
		listFunc: func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error) {
			return []odoo.Contract{
				{ID: 1, Name: "Contract A"},
				{ID: 2, Name: "Contract B"},
			}, 30, nil
		},
	}

	router := setupContractRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/contracts?page=1&per_page=20", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}

	var resp ListResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Meta.Total != 30 {
		t.Errorf("total = %d, want 30", resp.Meta.Total)
	}
}

func TestContractHandleList_ServiceError(t *testing.T) {
	mock := &mockContractService{
		listFunc: func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error) {
			return nil, 0, errors.New("db error")
		},
	}

	router := setupContractRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/contracts", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleList_ServiceUnavailable(t *testing.T) {
	mock := &mockContractService{
		listFunc: func(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupContractRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/contracts", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleGet_Success(t *testing.T) {
	mock := &mockContractService{
		getFunc: func(ctx context.Context, id int64) (*odoo.Contract, error) {
			return &odoo.Contract{ID: id, Name: "Test Contract"}, nil
		},
	}

	router := setupContractRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/contracts/42", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleGet_InvalidID(t *testing.T) {
	mock := &mockContractService{}

	router := setupContractRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/contracts/abc", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleGet_NotFound(t *testing.T) {
	mock := &mockContractService{
		getFunc: func(ctx context.Context, id int64) (*odoo.Contract, error) {
			return nil, errors.New("not found")
		},
	}

	router := setupContractRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/contracts/999", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 404 {
		t.Fatalf("status = %d, want 404. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleCreate_Success(t *testing.T) {
	mock := &mockContractService{
		createFunc: func(ctx context.Context, req odoo.ContractCreateRequest) (int64, error) {
			return 99, nil
		},
	}

	body := `{"employee_id":1,"name":"New Contract","date_start":"2026-01-01","wage":5000}`
	router := setupContractRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/contracts", bytes.NewBufferString(body))
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

func TestContractHandleCreate_ValidationErrors(t *testing.T) {
	mock := &mockContractService{}

	// Missing all required fields
	body := `{"name":"X"}`
	router := setupContractRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/contracts", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleCreate_MissingFields(t *testing.T) {
	mock := &mockContractService{}

	body := `{}`
	router := setupContractRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/contracts", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleUpdate_Success(t *testing.T) {
	mock := &mockContractService{
		updateFunc: func(ctx context.Context, id int64, vals map[string]any) error {
			return nil
		},
	}

	body := `{"wage":6000}`
	router := setupContractRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/contracts/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleUpdate_InvalidID(t *testing.T) {
	mock := &mockContractService{}

	body := `{"wage":6000}`
	router := setupContractRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/contracts/abc", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestContractHandleUpdate_ServiceError(t *testing.T) {
	mock := &mockContractService{
		updateFunc: func(ctx context.Context, id int64, vals map[string]any) error {
			return errors.New("update failed")
		},
	}

	body := `{"wage":6000}`
	router := setupContractRouter(mock)
	req := httptest.NewRequest("PUT", "/api/v1/contracts/1", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}
