package handler

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ProjectServicer defines the interface the handler needs from the service layer.
type ProjectServicer interface {
	ListProjects(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error)
	GetProject(ctx context.Context, id int64) (*odoo.Project, error)
	ListTasks(ctx context.Context, projectID int64, limit, offset int) ([]odoo.ProjectTask, int, error)
	GetTask(ctx context.Context, id int64) (*odoo.ProjectTask, error)
}

// ProjectHandler handles HTTP requests for project operations.
type ProjectHandler struct {
	svc ProjectServicer
}

// NewProjectHandler creates a new ProjectHandler.
func NewProjectHandler(svc ProjectServicer) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

// HandleList handles GET /api/v1/projects
// @Summary List projects
// @Description List projects with optional filters
// @Tags Projects
// @Produce json
// @Param active query boolean false "Filter by active status"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /projects [get]
func (h *ProjectHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	var active *bool
	if v := r.URL.Query().Get("active"); v != "" {
		b := v == "true"
		active = &b
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	projects, total, err := h.svc.ListProjects(r.Context(), active, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list projects")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"data":  projects,
		"total": total,
	})
}

// HandleGet handles GET /api/v1/projects/{id}
// @Summary Get project by ID
// @Description Retrieve a single project by its ID
// @Tags Projects
// @Produce json
// @Param id path integer true "Project ID"
// @Success 200 {object} odoo.Project
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /projects/{id} [get]
func (h *ProjectHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid project ID")
		return
	}

	project, err := h.svc.GetProject(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusNotFound, "not_found", "Project not found")
		return
	}

	RespondJSON(w, http.StatusOK, project)
}

// HandleListTasks handles GET /api/v1/projects/{id}/tasks
// @Summary List project tasks
// @Description List tasks for a specific project
// @Tags Projects
// @Produce json
// @Param id path integer true "Project ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /projects/{id}/tasks [get]
func (h *ProjectHandler) HandleListTasks(w http.ResponseWriter, r *http.Request) {
	projectID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid project ID")
		return
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	tasks, total, err := h.svc.ListTasks(r.Context(), projectID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list tasks")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"data":  tasks,
		"total": total,
	})
}

// HandleGetTask handles GET /api/v1/tasks/{id}
// @Summary Get task by ID
// @Description Retrieve a single task by its ID
// @Tags Projects
// @Produce json
// @Param id path integer true "Task ID"
// @Success 200 {object} odoo.ProjectTask
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /tasks/{id} [get]
func (h *ProjectHandler) HandleGetTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Invalid task ID")
		return
	}

	task, err := h.svc.GetTask(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "service_unavailable", "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		RespondError(w, http.StatusNotFound, "not_found", "Task not found")
		return
	}

	RespondJSON(w, http.StatusOK, task)
}
