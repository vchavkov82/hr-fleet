package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/auth"
	"github.com/vchavkov/hr/services/api/internal/db"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrAPIKeyInactive     = errors.New("API key is inactive or expired")
)

// AuthService handles authentication operations.
type AuthService struct {
	queries  *db.Queries
	jwtAuth  *jwtauth.JWTAuth
}

// NewAuthService creates a new AuthService.
func NewAuthService(queries *db.Queries, jwtAuth *jwtauth.JWTAuth) *AuthService {
	return &AuthService{
		queries: queries,
		jwtAuth: jwtAuth,
	}
}

// Login authenticates a user and returns access and refresh tokens.
func (s *AuthService) Login(ctx context.Context, email, password, ip, userAgent string) (accessToken, refreshToken string, expiresIn int, err error) {
	user, err := s.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return "", "", 0, ErrInvalidCredentials
	}

	if !user.Active {
		return "", "", 0, ErrUserInactive
	}

	if err := auth.CheckPassword(user.PasswordHash, password); err != nil {
		return "", "", 0, ErrInvalidCredentials
	}

	// Generate access token
	userID := uuidToString(user.ID)
	accessToken, err = auth.GenerateAccessToken(s.jwtAuth, userID, user.Email, user.Role, 0)
	if err != nil {
		return "", "", 0, fmt.Errorf("generate access token: %w", err)
	}

	// Generate and store refresh token
	plainRefresh, refreshHash, err := auth.GenerateRefreshToken()
	if err != nil {
		return "", "", 0, fmt.Errorf("generate refresh token: %w", err)
	}

	_, err = s.queries.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
		UserID:    user.ID,
		TokenHash: refreshHash,
		ExpiresAt: pgtype.Timestamptz{Time: time.Now().Add(7 * 24 * time.Hour), Valid: true},
	})
	if err != nil {
		return "", "", 0, fmt.Errorf("store refresh token: %w", err)
	}

	// Audit log
	details, _ := json.Marshal(map[string]string{"ip": ip, "user_agent": userAgent})
	_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
		UserID:       user.ID,
		Action:       "auth.login",
		ResourceType: "user",
		ResourceID:   userID,
		Details:      details,
	})

	return accessToken, plainRefresh, 900, nil // 900 seconds = 15 minutes
}

// RefreshToken validates a refresh token and returns a new token pair.
func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (newAccess, newRefresh string, expiresIn int, err error) {
	tokenHash := hashToken(refreshToken)

	stored, err := s.queries.GetRefreshToken(ctx, tokenHash)
	if err != nil {
		return "", "", 0, ErrInvalidRefreshToken
	}

	if stored.ExpiresAt.Valid && stored.ExpiresAt.Time.Before(time.Now()) {
		_ = s.queries.DeleteRefreshToken(ctx, tokenHash)
		return "", "", 0, ErrInvalidRefreshToken
	}

	// Delete old refresh token (rotation)
	_ = s.queries.DeleteRefreshToken(ctx, tokenHash)

	// Get user for new token
	user, err := s.queries.GetUserByID(ctx, stored.UserID)
	if err != nil {
		return "", "", 0, fmt.Errorf("get user: %w", err)
	}

	if !user.Active {
		return "", "", 0, ErrUserInactive
	}

	userID := uuidToString(user.ID)
	newAccess, err = auth.GenerateAccessToken(s.jwtAuth, userID, user.Email, user.Role)
	if err != nil {
		return "", "", 0, fmt.Errorf("generate access token: %w", err)
	}

	plainRefresh, refreshHash, err := auth.GenerateRefreshToken()
	if err != nil {
		return "", "", 0, fmt.Errorf("generate refresh token: %w", err)
	}

	_, err = s.queries.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
		UserID:    user.ID,
		TokenHash: refreshHash,
		ExpiresAt: pgtype.Timestamptz{Time: time.Now().Add(7 * 24 * time.Hour), Valid: true},
	})
	if err != nil {
		return "", "", 0, fmt.Errorf("store refresh token: %w", err)
	}

	return newAccess, plainRefresh, 900, nil
}

// CreateAPIKey creates a new API key for a user.
func (s *AuthService) CreateAPIKey(ctx context.Context, userID pgtype.UUID, name string, scopes []string) (plainKey string, apiKey db.ApiKey, err error) {
	plain, keyHash, keyPrefix, err := auth.GenerateAPIKey()
	if err != nil {
		return "", db.ApiKey{}, fmt.Errorf("generate API key: %w", err)
	}

	apiKey, err = s.queries.CreateAPIKey(ctx, db.CreateAPIKeyParams{
		UserID:    userID,
		Name:      name,
		KeyHash:   keyHash,
		KeyPrefix: keyPrefix,
		Scopes:    scopes,
		ExpiresAt: pgtype.Timestamptz{Time: time.Now().Add(365 * 24 * time.Hour), Valid: true},
	})
	if err != nil {
		return "", db.ApiKey{}, fmt.Errorf("create API key: %w", err)
	}

	// Audit log
	_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
		UserID:       userID,
		Action:       "auth.apikey.created",
		ResourceType: "api_key",
		ResourceID:   uuidToString(apiKey.ID),
		Details:      []byte(`{}`),
	})

	return plain, apiKey, nil
}

// ValidateAPIKey checks an API key and returns the associated user info.
func (s *AuthService) ValidateAPIKey(ctx context.Context, plainKey string) (userID pgtype.UUID, role string, err error) {
	keyHash := hashToken(plainKey)
	apiKey, err := s.queries.GetAPIKeyByHash(ctx, keyHash)
	if err != nil {
		return pgtype.UUID{}, "", ErrAPIKeyInactive
	}

	if !apiKey.Active {
		return pgtype.UUID{}, "", ErrAPIKeyInactive
	}

	if apiKey.ExpiresAt.Valid && apiKey.ExpiresAt.Time.Before(time.Now()) {
		return pgtype.UUID{}, "", ErrAPIKeyInactive
	}

	// Update last used
	_ = s.queries.UpdateAPIKeyLastUsed(ctx, apiKey.ID)

	// Get user role
	user, err := s.queries.GetUserByID(ctx, apiKey.UserID)
	if err != nil {
		return pgtype.UUID{}, "", fmt.Errorf("get user: %w", err)
	}

	return user.ID, user.Role, nil
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

func uuidToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	b := u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
