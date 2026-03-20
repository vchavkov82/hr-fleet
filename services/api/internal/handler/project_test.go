package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockProjectService struct {
	listProjectsFunc func(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error)
	getProjectFunc   func(ctx context.Context, id int64) (*odoo.Project, error)
	listTasksFunc    func(ctx context.Context, projectID int64, limit, offset int) ([]odoo.ProjectTask, int, error)
	getTaskFunc      func(ctx context.Context, id int64) (*odoo.ProjectTask, error)
}

func (m *mockProjectService) ListProjects(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error) {
	if m.listProjectsFunc != nil {
		return m.listProjectsFunc(ctx, active, limit, offset)
	}
	return []odoo.Project{}, 0, nil
}

func (m *mockProjectService) GetProject(ctx context.Context, id int64) (*odoo.Project, error) {
	if m.getProjectFunc != nil {
		return m.getProjectFunc(ctx, id)
	}
	return &odoo.Project{ID: id}, nil
}

func (m *mockProjectService) ListTasks(ctx context.Context, projectID int64, limit, offset int) ([]odoo.ProjectTask, int, error) {
	if m.listTasksFunc != nil {
		return m.listTasksFunc(ctx, projectID, limit, offset)
	}
	return []odoo.ProjectTask{}, 0, nil
}

func (m *mockProjectService) GetTask(ctx context.Context, id int64) (*odoo.ProjectTask, error) {
	if m.getTaskFunc != nil {
		return m.getTaskFunc(ctx, id)
	}
	return &odoo.ProjectTask{ID: id}, nil
}

func setupProjectRouter(mock *mockProjectService) http.Handler {
	h := NewProjectHandler(mock)
	r := chi.NewRouter()
	r.Get("/projects", h.HandleList)
	r.Get("/projects/{id}", h.HandleGet)
	r.Get("/projects/{id}/tasks", h.HandleListTasks)
	r.Get("/tasks/{id}", h.HandleGetTask)
	return r
}

func TestProjectHandler_HandleList_Success(t *testing.T) {
	mock := &mockProjectService{
		listProjectsFunc: func(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error) {
			return []odoo.Project{
				{ID: 1, Name: "Project Alpha"},
				{ID: 2, Name: "Project Beta"},
			}, 2, nil
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/projects", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
	testutil.AssertHasField(t, resp, "total")
}

func TestProjectHandler_HandleList_WithActiveFilter(t *testing.T) {
	var capturedActive *bool
	mock := &mockProjectService{
		listProjectsFunc: func(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error) {
			capturedActive = active
			return []odoo.Project{}, 0, nil
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/projects?active=true", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	if capturedActive == nil || *capturedActive != true {
		t.Error("expected active=true to be passed to service")
	}
}

func TestProjectHandler_HandleList_ServiceUnavailable(t *testing.T) {
	mock := &mockProjectService{
		listProjectsFunc: func(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/projects", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
	testutil.AssertErrorCode(t, w, "service_unavailable")
}

func TestProjectHandler_HandleGet_Success(t *testing.T) {
	mock := &mockProjectService{
		getProjectFunc: func(ctx context.Context, id int64) (*odoo.Project, error) {
			return &odoo.Project{ID: id, Name: "Test Project"}, nil
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/projects/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestProjectHandler_HandleGet_InvalidID(t *testing.T) {
	mock := &mockProjectService{}
	router := setupProjectRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/projects/not-a-number", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestProjectHandler_HandleGet_NotFound(t *testing.T) {
	mock := &mockProjectService{
		getProjectFunc: func(ctx context.Context, id int64) (*odoo.Project, error) {
			return nil, errors.New("not found")
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/projects/999", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusNotFound)
}

func TestProjectHandler_HandleListTasks_Success(t *testing.T) {
	mock := &mockProjectService{
		listTasksFunc: func(ctx context.Context, projectID int64, limit, offset int) ([]odoo.ProjectTask, int, error) {
			return []odoo.ProjectTask{
				{ID: 1, Name: "Task 1", ProjectID: odoo.Many2One{ID: projectID, Name: "Project"}},
				{ID: 2, Name: "Task 2", ProjectID: odoo.Many2One{ID: projectID, Name: "Project"}},
			}, 2, nil
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/projects/1/tasks", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
}

func TestProjectHandler_HandleListTasks_InvalidProjectID(t *testing.T) {
	mock := &mockProjectService{}
	router := setupProjectRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/projects/abc/tasks", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestProjectHandler_HandleGetTask_Success(t *testing.T) {
	mock := &mockProjectService{
		getTaskFunc: func(ctx context.Context, id int64) (*odoo.ProjectTask, error) {
			return &odoo.ProjectTask{ID: id, Name: "Test Task"}, nil
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/tasks/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestProjectHandler_HandleGetTask_InvalidID(t *testing.T) {
	mock := &mockProjectService{}
	router := setupProjectRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/tasks/xyz", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestProjectHandler_HandleGetTask_ServiceUnavailable(t *testing.T) {
	mock := &mockProjectService{
		getTaskFunc: func(ctx context.Context, id int64) (*odoo.ProjectTask, error) {
			return nil, service.ErrServiceUnavailable
		},
	}

	router := setupProjectRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/tasks/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
}
