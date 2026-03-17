package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// SkillServicer defines the interface the handler needs from the service layer.
type SkillServicer interface {
	ListEmployeeSkills(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error)
	AddEmployeeSkill(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error)
	ListSkills(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error)
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
func (h *SkillHandler) HandleListEmployeeSkills(w http.ResponseWriter, r *http.Request) {
	employeeID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid employee id"}`, http.StatusBadRequest)
		return
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	skills, total, err := h.svc.ListEmployeeSkills(r.Context(), employeeID, perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list skills"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  skills,
		"total": total,
	})
}

// HandleAddEmployeeSkill handles POST /api/v1/employees/{id}/skills
func (h *SkillHandler) HandleAddEmployeeSkill(w http.ResponseWriter, r *http.Request) {
	employeeID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid employee id"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		SkillID      int64 `json:"skill_id"`
		SkillLevelID int64 `json:"skill_level_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	id, err := h.svc.AddEmployeeSkill(r.Context(), employeeID, req.SkillID, req.SkillLevelID)
	if err != nil {
		http.Error(w, `{"error":"failed to add skill"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"id": id})
}

// HandleListSkills handles GET /api/v1/skills
func (h *SkillHandler) HandleListSkills(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 100)
	offset := (page - 1) * perPage

	skills, total, err := h.svc.ListSkills(r.Context(), perPage, offset)
	if err != nil {
		http.Error(w, `{"error":"failed to list skills"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"data":  skills,
		"total": total,
	})
}
