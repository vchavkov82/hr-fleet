package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
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

type createAPIKeyRequest struct {
	Name   string   `json:"name"`
	Scopes []string `json:"scopes"`
}

// HandleLogin handles POST /auth/login.
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

	access, refresh, expiresIn, err := h.authSvc.Login(r.Context(), req.Email, req.Password, ip, ua)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid email or password")
		return
	}

	RespondJSON(w, http.StatusOK, tokenResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
	})
}

// HandleRefresh handles POST /auth/refresh.
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

	userID := parseUUID(userIDStr)
	plainKey, apiKey, err := h.authSvc.CreateAPIKey(r.Context(), userID, req.Name, req.Scopes)
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
func (h *AuthHandler) HandleListAPIKeys(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userIDStr, _ := claims["sub"].(string)
	if userIDStr == "" {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Missing user identity")
		return
	}

	userID := parseUUID(userIDStr)
	keys, err := h.queries.ListAPIKeysByUser(r.Context(), userID)
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
func (h *AuthHandler) HandleDeleteAPIKey(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id := parseUUID(idStr)

	if err := h.queries.DeactivateAPIKey(r.Context(), id); err != nil {
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
