package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/platform/cloudflare"
)

// DNSServicer defines the interface the handler needs from the DNS service layer.
type DNSServicer interface {
	ListRecords(ctx context.Context, recordType, name string, page, perPage int) ([]cloudflare.DNSRecord, int, error)
	GetRecord(ctx context.Context, id string) (*cloudflare.DNSRecord, error)
	CreateRecord(ctx context.Context, input cloudflare.CreateRecordInput) (*cloudflare.DNSRecord, error)
	UpdateRecord(ctx context.Context, id string, input cloudflare.UpdateRecordInput) (*cloudflare.DNSRecord, error)
	DeleteRecord(ctx context.Context, id string) error
	GetZone(ctx context.Context) (*cloudflare.ZoneDetails, error)
}

// DNSHandler handles HTTP requests for DNS record management.
type DNSHandler struct {
	svc DNSServicer
}

// NewDNSHandler creates a new DNSHandler.
func NewDNSHandler(svc DNSServicer) *DNSHandler {
	return &DNSHandler{svc: svc}
}

// HandleGetZone handles GET /api/v1/dns/zone
// @Summary Get DNS zone details
// @Description Returns zone metadata (name, status, nameservers)
// @Tags DNS
// @Produce json
// @Success 200 {object} cloudflare.ZoneDetails
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /dns/zone [get]
func (h *DNSHandler) HandleGetZone(w http.ResponseWriter, r *http.Request) {
	zone, err := h.svc.GetZone(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "zone_error", "Failed to retrieve zone details")
		return
	}
	RespondJSON(w, http.StatusOK, zone)
}

// HandleListRecords handles GET /api/v1/dns/records
// @Summary List DNS records
// @Description List DNS records with optional type/name filters and pagination
// @Tags DNS
// @Produce json
// @Param type query string false "Record type (A, AAAA, CNAME, MX, TXT, SRV, NS, CAA)"
// @Param name query string false "Record name filter"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50, max 100)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /dns/records [get]
func (h *DNSHandler) HandleListRecords(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	if page < 1 {
		page = 1
	}
	if perPage > 100 {
		perPage = 100
	}

	recordType := r.URL.Query().Get("type")
	name := r.URL.Query().Get("name")

	records, total, err := h.svc.ListRecords(r.Context(), recordType, name, page, perPage)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "list_failed", "Failed to list DNS records")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]any{
		"data":  records,
		"total": total,
		"page":  page,
	})
}

// HandleGetRecord handles GET /api/v1/dns/records/{id}
// @Summary Get a DNS record by ID
// @Description Retrieve a single DNS record
// @Tags DNS
// @Produce json
// @Param id path string true "Cloudflare record ID"
// @Success 200 {object} cloudflare.DNSRecord
// @Failure 404 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /dns/records/{id} [get]
func (h *DNSHandler) HandleGetRecord(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Record ID is required")
		return
	}

	rec, err := h.svc.GetRecord(r.Context(), id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "not_found", "DNS record not found")
		return
	}

	RespondJSON(w, http.StatusOK, rec)
}

// HandleCreateRecord handles POST /api/v1/dns/records
// @Summary Create a DNS record
// @Description Create a new DNS record in the zone
// @Tags DNS
// @Accept json
// @Produce json
// @Param body body cloudflare.CreateRecordInput true "Record to create"
// @Success 201 {object} cloudflare.DNSRecord
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /dns/records [post]
func (h *DNSHandler) HandleCreateRecord(w http.ResponseWriter, r *http.Request) {
	var input cloudflare.CreateRecordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_body", "Invalid request body")
		return
	}

	rec, err := h.svc.CreateRecord(r.Context(), input)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "create_failed", err.Error())
		return
	}

	RespondJSON(w, http.StatusCreated, rec)
}

// HandleUpdateRecord handles PUT /api/v1/dns/records/{id}
// @Summary Update a DNS record
// @Description Replace an existing DNS record
// @Tags DNS
// @Accept json
// @Produce json
// @Param id path string true "Cloudflare record ID"
// @Param body body cloudflare.UpdateRecordInput true "Updated record"
// @Success 200 {object} cloudflare.DNSRecord
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /dns/records/{id} [put]
func (h *DNSHandler) HandleUpdateRecord(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Record ID is required")
		return
	}

	var input cloudflare.UpdateRecordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		RespondError(w, http.StatusBadRequest, "invalid_body", "Invalid request body")
		return
	}

	rec, err := h.svc.UpdateRecord(r.Context(), id, input)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "update_failed", err.Error())
		return
	}

	RespondJSON(w, http.StatusOK, rec)
}

// HandleDeleteRecord handles DELETE /api/v1/dns/records/{id}
// @Summary Delete a DNS record
// @Description Remove a DNS record by ID
// @Tags DNS
// @Param id path string true "Cloudflare record ID"
// @Success 204
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /dns/records/{id} [delete]
func (h *DNSHandler) HandleDeleteRecord(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		RespondError(w, http.StatusBadRequest, "invalid_id", "Record ID is required")
		return
	}

	if err := h.svc.DeleteRecord(r.Context(), id); err != nil {
		RespondError(w, http.StatusInternalServerError, "delete_failed", "Failed to delete DNS record")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
