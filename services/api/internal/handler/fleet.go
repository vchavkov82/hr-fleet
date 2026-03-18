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

// FleetServicer defines the interface the handler needs from the service layer.
type FleetServicer interface {
	ListVehicles(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error)
	GetVehicle(ctx context.Context, id int64) (*odoo.FleetVehicle, error)
	ListVehicleLogs(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error)
}

// FleetHandler handles HTTP requests for fleet operations.
type FleetHandler struct {
	svc FleetServicer
}

// NewFleetHandler creates a new FleetHandler.
func NewFleetHandler(svc FleetServicer) *FleetHandler {
	return &FleetHandler{svc: svc}
}

// HandleListVehicles handles GET /api/v1/fleet/vehicles
// @Summary List fleet vehicles
// @Description List fleet vehicles with optional filters
// @Tags Fleet
// @Produce json
// @Param driver_id query integer false "Filter by driver employee ID"
// @Param active query boolean false "Filter by active status"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /fleet/vehicles [get]
func (h *FleetHandler) HandleListVehicles(w http.ResponseWriter, r *http.Request) {
	driverID := int64QueryParam(r, "driver_id", 0)
	var active *bool
	if v := r.URL.Query().Get("active"); v != "" {
		b := v == "true"
		active = &b
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	vehicles, total, err := h.svc.ListVehicles(r.Context(), driverID, active, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list vehicles")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  vehicles,
		"total": total,
	})
}

// HandleGetVehicle handles GET /api/v1/fleet/vehicles/{id}
// @Summary Get vehicle by ID
// @Description Retrieve a single vehicle by its ID
// @Tags Fleet
// @Produce json
// @Param id path integer true "Vehicle ID"
// @Success 200 {object} odoo.FleetVehicle
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /fleet/vehicles/{id} [get]
func (h *FleetHandler) HandleGetVehicle(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid vehicle ID")
		return
	}

	vehicle, err := h.svc.GetVehicle(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Vehicle not found")
		return
	}

	respondJSON(w, http.StatusOK, vehicle)
}

// HandleListVehicleLogs handles GET /api/v1/fleet/vehicles/{id}/logs
// @Summary List vehicle service logs
// @Description List service logs for a specific vehicle
// @Tags Fleet
// @Produce json
// @Param id path integer true "Vehicle ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /fleet/vehicles/{id}/logs [get]
func (h *FleetHandler) HandleListVehicleLogs(w http.ResponseWriter, r *http.Request) {
	vehicleID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid vehicle ID")
		return
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	logs, total, err := h.svc.ListVehicleLogs(r.Context(), vehicleID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list vehicle logs")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  logs,
		"total": total,
	})
}
