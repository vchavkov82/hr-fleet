package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ContractServicer defines the interface the handler needs from the contract service.
type ContractServicer interface {
	List(ctx context.Context, employeeID int64, page, perPage int) ([]odoo.Contract, int, error)
	Get(ctx context.Context, id int64) (*odoo.Contract, error)
	Create(ctx context.Context, req odoo.ContractCreateRequest) (int64, error)
}

// ContractHandler handles HTTP requests for contract operations.
type ContractHandler struct {
	svc ContractServicer
}

// NewContractHandler creates a new ContractHandler.
func NewContractHandler(svc ContractServicer) *ContractHandler {
	return &ContractHandler{svc: svc}
}

// HandleList handles GET /api/v1/contracts.
// @Summary List contracts
// @Description List contracts with optional employee filter and pagination
// @Tags Contracts
// @Produce json
// @Param employee_id query integer false "Filter by employee ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 20, max 100)"
// @Success 200 {object} ListResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /contracts [get]
func (h *ContractHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	employeeID, _ := strconv.ParseInt(r.URL.Query().Get("employee_id"), 10, 64)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 20)
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	contracts, total, err := h.svc.List(r.Context(), employeeID, page, perPage)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", "HR service temporarily unavailable")
			return
		}
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list contracts")
		return
	}

	RespondList(w, contracts, int64(total), page, perPage)
}

// HandleGet handles GET /api/v1/contracts/{id}.
// @Summary Get contract by ID
// @Description Retrieve a single contract by ID
// @Tags Contracts
// @Produce json
// @Param id path integer true "Contract ID"
// @Success 200 {object} odoo.Contract
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /contracts/{id} [get]
func (h *ContractHandler) HandleGet(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid contract ID")
		return
	}

	contract, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			RespondError(w, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", "HR service temporarily unavailable")
			return
		}
		RespondError(w, http.StatusNotFound, "NOT_FOUND", "Contract not found")
		return
	}

	RespondJSON(w, http.StatusOK, contract)
}

// HandleCreate handles POST /api/v1/contracts.
// @Summary Create a new contract
// @Description Create a new employment contract
// @Tags Contracts
// @Accept json
// @Produce json
// @Param body body odoo.ContractCreateRequest true "Contract details"
// @Success 201 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /contracts [post]
func (h *ContractHandler) HandleCreate(w http.ResponseWriter, r *http.Request) {
	var req odoo.ContractCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	var errs []string
	if req.EmployeeID <= 0 {
		errs = append(errs, "employee_id is required")
	}
	if len(strings.TrimSpace(req.Name)) < 2 {
		errs = append(errs, "name is required (min 2 characters)")
	}
	if req.DateStart == "" {
		errs = append(errs, "date_start is required")
	}
	if req.Wage <= 0 {
		errs = append(errs, "wage must be positive")
	}
	if len(errs) > 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", strings.Join(errs, "; "))
		return
	}

	id, err := h.svc.Create(r.Context(), req)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create contract")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]any{
		"id":      id,
		"message": "Contract created successfully",
	})
}
