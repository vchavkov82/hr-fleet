package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// SkillServicer defines the interface the handler needs from the service layer.
type SkillServicer interface {
	ListEmployeeSkills(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error)
	AddEmployeeSkill(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error)
	ListSkills(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error)
	DeleteEmployeeSkill(ctx context.Context, id int64) error
}

// SkillHandler handles HTTP requests for skill operations.
type SkillHandler struct {
	svc SkillServicer
}

// NewSkillHandler creates a new SkillHandler.
func NewSkillHandler(svc SkillServicer) *SkillHandler {
	return &SkillHandler{svc: svc}
}

// HandleListEmployeeSkills handles GET /api/v1/employees/{id}/skills
// @Summary List employee skills
// @Description List skills for a specific employee
// @Tags Skills
// @Produce json
// @Param id path integer true "Employee ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees/{id}/skills [get]
func (h *SkillHandler) HandleListEmployeeSkills(w http.ResponseWriter, r *http.Request) {
	employeeID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	skills, total, err := h.svc.ListEmployeeSkills(r.Context(), employeeID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list employee skills")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  skills,
		"total": total,
	})
}

// HandleAddEmployeeSkill handles POST /api/v1/employees/{id}/skills
// @Summary Add a skill to an employee
// @Description Add a skill with a skill level to an employee
// @Tags Skills
// @Accept json
// @Produce json
// @Param id path integer true "Employee ID"
// @Param body body object true "Skill assignment" example({"skill_id": 1, "skill_level_id": 2})
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /employees/{id}/skills [post]
func (h *SkillHandler) HandleAddEmployeeSkill(w http.ResponseWriter, r *http.Request) {
	employeeID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	var req struct {
		SkillID      int64 `json:"skill_id"`
		SkillLevelID int64 `json:"skill_level_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.SkillID <= 0 {
		respondError(w, http.StatusBadRequest, "skill_id must be greater than 0")
		return
	}
	if req.SkillLevelID <= 0 {
		respondError(w, http.StatusBadRequest, "skill_level_id must be greater than 0")
		return
	}

	id, err := h.svc.AddEmployeeSkill(r.Context(), employeeID, req.SkillID, req.SkillLevelID)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to add employee skill")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleListSkills handles GET /api/v1/skills
// @Summary List all skills
// @Description List all available skills in the system
// @Tags Skills
// @Produce json
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 100)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /skills [get]
func (h *SkillHandler) HandleListSkills(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 100)
	offset := (page - 1) * perPage

	skills, total, err := h.svc.ListSkills(r.Context(), perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list skills")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  skills,
		"total": total,
	})
}
