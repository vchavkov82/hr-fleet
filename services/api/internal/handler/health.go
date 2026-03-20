package handler

import (
	"context"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// HealthHandler handles readiness health checks.
type HealthHandler struct {
	pool  *pgxpool.Pool
	cache *cache.Cache
	odoo  *odoo.Client
}

// NewHealthHandler creates a new HealthHandler.
func NewHealthHandler(pool *pgxpool.Pool, cache *cache.Cache, odoo *odoo.Client) *HealthHandler {
	return &HealthHandler{pool: pool, cache: cache, odoo: odoo}
}

type checkResult struct {
	Status         string `json:"status"`
	CircuitBreaker string `json:"circuit_breaker,omitempty"`
}

type readinessResponse struct {
	Status string                 `json:"status"`
	Checks map[string]checkResult `json:"checks"`
}

// computeReadinessStatus maps failed dependency counts to HTTP status (used by tests and HandleReady).
func computeReadinessStatus(failures, totalChecks int) (status string, httpStatus int) {
	status = "ok"
	httpStatus = http.StatusOK
	if totalChecks <= 0 {
		return status, httpStatus
	}
	if failures > 0 && failures < totalChecks {
		status = "degraded"
		httpStatus = http.StatusServiceUnavailable
	} else if failures == totalChecks {
		status = "unavailable"
		httpStatus = http.StatusServiceUnavailable
	}
	return status, httpStatus
}

// HandleReady checks Odoo, Redis, and PostgreSQL connectivity.
func (h *HealthHandler) HandleReady(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	checks := make(map[string]checkResult, 3)
	failures := 0

	// Check PostgreSQL
	checks["database"] = h.checkDB(ctx)
	if checks["database"].Status != "ok" {
		failures++
	}

	// Check Redis
	checks["redis"] = h.checkRedis(ctx)
	if checks["redis"].Status != "ok" {
		failures++
	}

	// Check Odoo
	checks["odoo"] = h.checkOdoo()
	if checks["odoo"].Status != "ok" {
		failures++
	}

	status, httpStatus := computeReadinessStatus(failures, len(checks))

	RespondJSON(w, httpStatus, readinessResponse{
		Status: status,
		Checks: checks,
	})
}

func (h *HealthHandler) checkDB(ctx context.Context) checkResult {
	if err := h.pool.Ping(ctx); err != nil {
		return checkResult{Status: "error"}
	}
	return checkResult{Status: "ok"}
}

func (h *HealthHandler) checkRedis(ctx context.Context) checkResult {
	if err := h.cache.Ping(ctx); err != nil {
		return checkResult{Status: "error"}
	}
	return checkResult{Status: "ok"}
}

func (h *HealthHandler) checkOdoo() checkResult {
	cbState := h.odoo.CircuitBreakerState()
	if err := h.odoo.Healthy(); err != nil {
		return checkResult{Status: "error", CircuitBreaker: cbState}
	}
	return checkResult{Status: "ok", CircuitBreaker: cbState}
}
