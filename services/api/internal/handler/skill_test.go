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

type mockSkillService struct {
	listEmployeeSkillsFunc  func(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error)
	addEmployeeSkillFunc    func(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error)
	listSkillsFunc          func(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error)
	deleteEmployeeSkillFunc func(ctx context.Context, id int64) error
}

func (m *mockSkillService) ListEmployeeSkills(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error) {
	if m.listEmployeeSkillsFunc != nil {
		return m.listEmployeeSkillsFunc(ctx, employeeID, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockSkillService) AddEmployeeSkill(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error) {
	if m.addEmployeeSkillFunc != nil {
		return m.addEmployeeSkillFunc(ctx, employeeID, skillID, skillLevelID)
	}
	return 0, nil
}

func (m *mockSkillService) ListSkills(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error) {
	if m.listSkillsFunc != nil {
		return m.listSkillsFunc(ctx, limit, offset)
	}
	return nil, 0, nil
}

func (m *mockSkillService) DeleteEmployeeSkill(ctx context.Context, id int64) error {
	if m.deleteEmployeeSkillFunc != nil {
		return m.deleteEmployeeSkillFunc(ctx, id)
	}
	return nil
}

func setupSkillRouter(mock *mockSkillService) http.Handler {
	h := NewSkillHandler(mock)
	r := chi.NewRouter()
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(testJWTAuth))
		r.Use(jwtauth.Authenticator(testJWTAuth))
		r.Get("/employees/{id}/skills", h.HandleListEmployeeSkills)
		r.Post("/employees/{id}/skills", h.HandleAddEmployeeSkill)
		r.Delete("/employees/{id}/skills/{skillId}", h.HandleDeleteEmployeeSkill)
		r.Get("/skills", h.HandleListSkills)
	})
	return r
}

func TestSkillHandleListEmployeeSkills_Success(t *testing.T) {
	mock := &mockSkillService{
		listEmployeeSkillsFunc: func(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error) {
			return []odoo.EmployeeSkill{{ID: 1}, {ID: 2}}, 2, nil
		},
	}

	router := setupSkillRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees/1/skills", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	data, ok := resp["data"].([]any)
	if !ok || len(data) != 2 {
		t.Errorf("expected 2 skills, got %v", resp["data"])
	}
}

func TestSkillHandleListEmployeeSkills_InvalidID(t *testing.T) {
	mock := &mockSkillService{}

	router := setupSkillRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/employees/abc/skills", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestSkillHandleAddEmployeeSkill_Success(t *testing.T) {
	mock := &mockSkillService{
		addEmployeeSkillFunc: func(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error) {
			return 55, nil
		},
	}

	body := `{"skill_id":10,"skill_level_id":3}`
	router := setupSkillRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/employees/1/skills", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Fatalf("status = %d, want 201. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if resp["id"] != float64(55) {
		t.Errorf("id = %v, want 55", resp["id"])
	}
}

func TestSkillHandleAddEmployeeSkill_MissingSkillID(t *testing.T) {
	mock := &mockSkillService{}

	body := `{"skill_level_id":3}`
	router := setupSkillRouter(mock)
	req := httptest.NewRequest("POST", "/api/v1/employees/1/skills", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}

func TestSkillHandleListSkills_Success(t *testing.T) {
	mock := &mockSkillService{
		listSkillsFunc: func(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error) {
			return []odoo.Skill{{ID: 1, Name: "Go"}, {ID: 2, Name: "Python"}}, 2, nil
		},
	}

	router := setupSkillRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/skills", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}

	var resp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	data, ok := resp["data"].([]any)
	if !ok || len(data) != 2 {
		t.Errorf("expected 2 skills, got %v", resp["data"])
	}
}

func TestSkillHandleListSkills_ServiceError(t *testing.T) {
	mock := &mockSkillService{
		listSkillsFunc: func(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupSkillRouter(mock)
	req := httptest.NewRequest("GET", "/api/v1/skills", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 503 {
		t.Fatalf("status = %d, want 503. Body: %s", w.Code, w.Body.String())
	}
}

func TestSkillHandleDeleteEmployeeSkill_Success(t *testing.T) {
	var deletedID int64
	mock := &mockSkillService{
		deleteEmployeeSkillFunc: func(ctx context.Context, id int64) error {
			deletedID = id
			return nil
		},
	}

	router := setupSkillRouter(mock)
	req := httptest.NewRequest("DELETE", "/api/v1/employees/1/skills/5", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}
	if deletedID != 5 {
		t.Errorf("deleted ID = %d, want 5", deletedID)
	}
}

func TestSkillHandleDeleteEmployeeSkill_InvalidID(t *testing.T) {
	mock := &mockSkillService{}

	router := setupSkillRouter(mock)
	req := httptest.NewRequest("DELETE", "/api/v1/employees/1/skills/abc", nil)
	req.Header.Set("Authorization", "Bearer "+makeTestToken())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("status = %d, want 400. Body: %s", w.Code, w.Body.String())
	}
}
