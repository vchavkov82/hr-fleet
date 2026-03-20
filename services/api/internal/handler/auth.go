package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/tenant"
)

// AuthHandler handles authentication HTTP requests.
type AuthHandler struct {
	authSvc *service.AuthService
	queries *db.Queries
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authSvc *service.AuthService, queries *db.Queries) *AuthHandler {
	return &AuthHandler{authSvc: authSvc, queries: queries}
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type tokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type registerRequest struct {
	OrganizationName string `json:"organization_name"`
	AdminEmail       string `json:"admin_email"`
	AdminPassword    string `json:"admin_password"`
	AdminName        string `json:"admin_name"`
}

type createAPIKeyRequest struct {
	Name   string   `json:"name"`
	Scopes []string `json:"scopes"`
}

// HandleLogin handles POST /auth/login.
// @Summary Login with email and password
// @Description Authenticate user and return JWT access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body loginRequest true "Login credentials"
// @Success 200 {object} tokenResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Email and password are required")
		return
	}

	ip := r.RemoteAddr
	ua := r.UserAgent()

	var preferredOrg pgtype.UUID
	if orgHdr := r.Header.Get("X-Organization-Id"); orgHdr != "" {
		if err := preferredOrg.Scan(orgHdr); err != nil {
			RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid X-Organization-Id")
			return
		}
	}

	access, refresh, expiresIn, err := h.authSvc.Login(r.Context(), req.Email, req.Password, ip, ua, preferredOrg)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrNoOrganization), errors.Is(err, service.ErrNotOrgMember):
			RespondError(w, http.StatusForbidden, "ORG_ACCESS", err.Error())
		default:
			RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid email or password")
		}
		return
	}

	RespondJSON(w, http.StatusOK, tokenResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	})
}

// HandleRegister handles POST /auth/register (public SaaS signup).
func (h *AuthHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	if req.OrganizationName == "" || req.AdminEmail == "" || req.AdminPassword == "" || req.AdminName == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "organization_name, admin_email, admin_password, and admin_name are required")
		return
	}
	if len(req.AdminPassword) < 8 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at least 8 characters")
		return
	}

	ip := r.RemoteAddr
	ua := r.UserAgent()
	access, refresh, expiresIn, err := h.authSvc.RegisterOrganization(r.Context(), req.OrganizationName, req.AdminEmail, req.AdminPassword, req.AdminName, ip, ua)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrEmailTaken):
			RespondError(w, http.StatusConflict, "EMAIL_TAKEN", "Email is already registered")
		case errors.Is(err, service.ErrProvisioning):
			RespondError(w, http.StatusServiceUnavailable, "PROVISIONING_FAILED", err.Error())
		default:
			RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Registration failed")
		}
		return
	}

	RespondJSON(w, http.StatusCreated, tokenResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	})
}

// HandleRefresh handles POST /auth/refresh.
// @Summary Refresh access token
// @Description Exchange a refresh token for new access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body refreshRequest true "Refresh token"
// @Success 200 {object} tokenResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /auth/refresh [post]
func (h *AuthHandler) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	if req.RefreshToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Refresh token is required")
		return
	}

	access, refresh, expiresIn, err := h.authSvc.RefreshToken(r.Context(), req.RefreshToken)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid or expired refresh token")
		return
	}

	RespondJSON(w, http.StatusOK, tokenResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	})
}

// HandleCreateAPIKey handles POST /auth/api-keys.
// @Summary Create a new API key
// @Description Generate a new API key for the authenticated user
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body createAPIKeyRequest true "API key details"
// @Success 201 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Security BearerAuth
// @Router /auth/api-keys [post]
func (h *AuthHandler) HandleCreateAPIKey(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userIDStr, _ := claims["sub"].(string)
	if userIDStr == "" {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing user identity")
		return
	}

	var req createAPIKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	if req.Name == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "API key name is required")
		return
	}

	orgID, ok := tenant.OrganizationID(r.Context())
	if !ok || !orgID.Valid {
		RespondError(w, http.StatusBadRequest, "TENANT_REQUIRED", "Organization context required")
		return
	}

	userID := parseUUID(userIDStr)
	plainKey, apiKey, err := h.authSvc.CreateAPIKey(r.Context(), userID, orgID, req.Name, req.Scopes)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to create API key")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]any{
		"key":        plainKey,
		"id":         uuidToString(apiKey.ID),
		"name":       apiKey.Name,
		"key_prefix": apiKey.KeyPrefix,
		"scopes":     apiKey.Scopes,
		"created_at": apiKey.CreatedAt.Time,
	})
}

// HandleListAPIKeys handles GET /auth/api-keys.
// @Summary List API keys
// @Description List all API keys for the authenticated user
// @Tags Auth
// @Produce json
// @Success 200 {object} map[string]any
// @Failure 401 {object} ErrorResponse
// @Security BearerAuth
// @Router /auth/api-keys [get]
func (h *AuthHandler) HandleListAPIKeys(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userIDStr, _ := claims["sub"].(string)
	if userIDStr == "" {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing user identity")
		return
	}

	orgID, ok := tenant.OrganizationID(r.Context())
	if !ok || !orgID.Valid {
		RespondError(w, http.StatusBadRequest, "TENANT_REQUIRED", "Organization context required")
		return
	}

	userID := parseUUID(userIDStr)
	keys, err := h.queries.ListAPIKeysByUser(r.Context(), db.ListAPIKeysByUserParams{
		UserID:         userID,
		OrganizationID: orgID,
	})
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to list API keys")
		return
	}

	// Mask key hashes
	type maskedKey struct {
		ID        string  `json:"id"`
		Name      string  `json:"name"`
		KeyPrefix string  `json:"key_prefix"`
		Scopes    []string `json:"scopes"`
		Active    bool    `json:"active"`
		CreatedAt any     `json:"created_at"`
		LastUsed  any     `json:"last_used_at,omitempty"`
	}

	result := make([]maskedKey, len(keys))
	for i, k := range keys {
		result[i] = maskedKey{
			ID:        uuidToString(k.ID),
			Name:      k.Name,
			KeyPrefix: k.KeyPrefix,
			Scopes:    k.Scopes,
			Active:    k.Active,
			CreatedAt: k.CreatedAt.Time,
		}
		if k.LastUsedAt.Valid {
			result[i].LastUsed = k.LastUsedAt.Time
		}
	}

	RespondJSON(w, http.StatusOK, map[string]any{"data": result})
}

// HandleDeleteAPIKey handles DELETE /auth/api-keys/{id}.
// @Summary Deactivate an API key
// @Description Deactivate an API key by ID
// @Tags Auth
// @Produce json
// @Param id path string true "API Key ID (UUID)"
// @Success 200 {object} map[string]string
// @Failure 400 {object} ErrorResponse
// @Security BearerAuth
// @Router /auth/api-keys/{id} [delete]
func (h *AuthHandler) HandleDeleteAPIKey(w http.ResponseWriter, r *http.Request) {
	orgID, ok := tenant.OrganizationID(r.Context())
	if !ok || !orgID.Valid {
		RespondError(w, http.StatusBadRequest, "TENANT_REQUIRED", "Organization context required")
		return
	}

	idStr := chi.URLParam(r, "id")
	id := parseUUID(idStr)

	if err := h.queries.DeactivateAPIKey(r.Context(), db.DeactivateAPIKeyParams{
		ID:             id,
		OrganizationID: orgID,
	}); err != nil {
		RespondError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to deactivate API key")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]string{"message": "API key deactivated"})
}

func parseUUID(s string) pgtype.UUID {
	var u pgtype.UUID
	if err := u.Scan(s); err != nil {
		return pgtype.UUID{}
	}
	return u
}

func uuidToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
