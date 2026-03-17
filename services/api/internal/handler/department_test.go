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

type mockDepartmentService struct {
	listFunc func(ctx context.Context, limit, offset int) ([]odoo.Department, int, error)
	getFunc  func(ctx context.Context, id int64) (*odoo.Department, error)
}

func (m *mockDepartmentService) List(ctx context.Context, limit, offset int) ([]odoo.Department, int, error) {
	if m.listFunc != nil {
		return m.listFunc(ctx, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockDepartmentService) Get(ctx context.Context, id int64) (*odoo.Department, error) {
	if m.getFunc != nil {
		return m.getFunc(ctx, id)
	}
	return nil, nil
}

func setupDepartmentRouter(mock *mockDepartmentService) http.Handler {
	h := NewDepartmentHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Route("/departments", func(r chi.Router) {
			r.Get("/", h.HandleList)
			r.Get("/{id}", h.HandleGet)
		})
	})
	return r
}

func TestDepartmentHandleList_Success(t *testing.T) {
	mock := &mockDepartmentService{
		listFunc: func(ctx context.Context, limit, offset int) ([]odoo.Department, int, error) {
			return []odoo.Department{
				{ID: 1, Name: "Engineering"},
				{ID: 2, Name: "HR"},
			}, 2, nil
		},
	}

	router := setupDepartmentRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/departments", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestDepartmentHandleList_ServiceUnavailable(t *testing.T) {
	mock := &mockDepartmentService{
		listFunc: func(ctx context.Context, limit, offset int) ([]odoo.Department, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupDepartmentRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/departments", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestDepartmentHandleList_ServiceError(t *testing.T) {
	mock := &mockDepartmentService{
		listFunc: func(ctx context.Context, limit, offset int) ([]odoo.Department, int, error) {
			return nil, 0, errors.New("db error")
		},
	}

	router := setupDepartmentRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/departments", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 500 {
		t.Fatalf("status = %d, want 500. Body: %s", w.Code, w.Body.String())
	}
}

func TestDepartmentHandleGet_Success(t *testing.T) {
	mock := &mockDepartmentService{
		getFunc: func(ctx context.Context, id int64) (*odoo.Department, error) {
			return &odoo.Department{ID: id, Name: "Engineering"}, nil
		},
	}

	router := setupDepartmentRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/departments/1", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
}

func TestDepartmentHandleGet_InvalidID(t *testing.T) {
	mock := &mockDepartmentService{}

	router := setupDepartmentRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/departments/abc", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestDepartmentHandleGet_NotFound(t *testing.T) {
	mock := &mockDepartmentService{
		getFunc: func(ctx context.Context, id int64) (*odoo.Department, error) {
			return nil, errors.New("not found")
		},
	}

	router := setupDepartmentRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/departments/999", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 404 {
		t.Fatalf("status = %d, want 404. Body: %s", w.Code, w.Body.String())
	}
}
