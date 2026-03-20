package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode"

	"github.com/go-chi/jwtauth/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/auth"
	"github.com/vchavkov/hr/services/api/internal/db"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrAPIKeyInactive     = errors.New("API key is inactive or expired")
	ErrNoOrganization     = errors.New("user has no organization membership")
	ErrNotOrgMember       = errors.New("user is not a member of the selected organization")
	ErrEmailTaken         = errors.New("email is already registered")
	ErrProvisioning       = errors.New("organization provisioning failed")
)

// AuthPrincipal is the authenticated identity for API key requests.
type AuthPrincipal struct {
	UserID         pgtype.UUID
	Role           string
	OrganizationID pgtype.UUID
	OdooCompanyID  int64
}

// AuthService handles authentication operations.
type AuthService struct {
	queries      *db.Queries
	jwtAuth      *jwtauth.JWTAuth
	provisioning *ProvisioningService
}

// NewAuthService creates a new AuthService. provisioning may be nil (register disabled).
func NewAuthService(queries *db.Queries, jwtAuth *jwtauth.JWTAuth, provisioning *ProvisioningService) *AuthService {
	return &AuthService{
		queries:      queries,
		jwtAuth:      jwtAuth,
		provisioning: provisioning,
	}
}

// Login authenticates a user. preferredOrg (from X-Organization-Id) selects tenant when the user has several memberships.
func (s *AuthService) Login(ctx context.Context, email, password, ip, userAgent string, preferredOrg pgtype.UUID) (accessToken, refreshToken string, expiresIn int, err error) {
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

	org, jwtRole, err := s.resolveLoginOrganization(ctx, user, preferredOrg)
	if err != nil {
		return "", "", 0, err
	}

	return s.issueTokenPair(ctx, user, org, jwtRole, ip, userAgent, true)
}

func (s *AuthService) resolveLoginOrganization(ctx context.Context, user db.User, preferredOrg pgtype.UUID) (db.Organization, string, error) {
	isSuper := user.Role == "super_admin"

	if preferredOrg.Valid {
		org, err := s.queries.GetOrganizationByID(ctx, preferredOrg)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return db.Organization{}, "", ErrNotOrgMember
			}
			return db.Organization{}, "", err
		}
		if isSuper {
			return org, "super_admin", nil
		}
		membership, err := s.queries.GetMembership(ctx, db.GetMembershipParams{
			UserID:         user.ID,
			OrganizationID: preferredOrg,
		})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return db.Organization{}, "", ErrNotOrgMember
			}
			return db.Organization{}, "", err
		}
		return org, membership.Role, nil
	}

	memberships, err := s.queries.ListMembershipsByUser(ctx, user.ID)
	if err == nil && len(memberships) > 0 {
		m0 := memberships[0]
		org, err := s.queries.GetOrganizationByID(ctx, m0.OrganizationID)
		if err != nil {
			return db.Organization{}, "", err
		}
		if isSuper {
			return org, "super_admin", nil
		}
		return org, m0.Role, nil
	}

	if isSuper {
		org, err := s.queries.GetFirstActiveOrganization(ctx)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return db.Organization{}, "", ErrNoOrganization
			}
			return db.Organization{}, "", err
		}
		return org, "super_admin", nil
	}

	return db.Organization{}, "", ErrNoOrganization
}

func (s *AuthService) issueTokenPair(ctx context.Context, user db.User, org db.Organization, jwtRole, ip, userAgent string, auditLogin bool) (accessToken, refreshToken string, expiresIn int, err error) {
	userID := uuidToString(user.ID)
	orgStr := uuidToString(org.ID)
	accessToken, err = auth.GenerateAccessToken(s.jwtAuth, userID, user.Email, jwtRole, org.OdooCompanyID, orgStr)
	if err != nil {
		return "", "", 0, fmt.Errorf("generate access token: %w", err)
	}

	plainRefresh, refreshHash, err := auth.GenerateRefreshToken()
	if err != nil {
		return "", "", 0, fmt.Errorf("generate refresh token: %w", err)
	}

	_, err = s.queries.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
		UserID:         user.ID,
		TokenHash:      refreshHash,
		ExpiresAt:      pgtype.Timestamptz{Time: time.Now().Add(7 * 24 * time.Hour), Valid: true},
		OrganizationID: org.ID,
	})
	if err != nil {
		return "", "", 0, fmt.Errorf("store refresh token: %w", err)
	}

	if auditLogin {
		details, _ := json.Marshal(map[string]string{"ip": ip, "user_agent": userAgent})
		_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
			UserID:         user.ID,
			Action:         "auth.login",
			ResourceType:   "user",
			ResourceID:     userID,
			Details:        details,
			OrganizationID: org.ID,
		})
	}

	return accessToken, plainRefresh, 900, nil
}

// RefreshToken validates a refresh token and returns a new token pair for the same organization.
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

	_ = s.queries.DeleteRefreshToken(ctx, tokenHash)

	user, err := s.queries.GetUserByID(ctx, stored.UserID)
	if err != nil {
		return "", "", 0, fmt.Errorf("get user: %w", err)
	}

	if !user.Active {
		return "", "", 0, ErrUserInactive
	}

	var org db.Organization
	var jwtRole string
	if stored.OrganizationID.Valid {
		org, err = s.queries.GetOrganizationByID(ctx, stored.OrganizationID)
		if err != nil {
			return "", "", 0, ErrInvalidRefreshToken
		}
		if user.Role == "super_admin" {
			jwtRole = "super_admin"
		} else {
			m, err := s.queries.GetMembership(ctx, db.GetMembershipParams{
				UserID:         user.ID,
				OrganizationID: stored.OrganizationID,
			})
			if err != nil {
				return "", "", 0, ErrInvalidRefreshToken
			}
			jwtRole = m.Role
		}
	} else {
		org, jwtRole, err = s.resolveLoginOrganization(ctx, user, pgtype.UUID{})
		if err != nil {
			return "", "", 0, err
		}
	}

	newAccess, newRefresh, expiresIn, err = s.issueTokenPair(ctx, user, org, jwtRole, "", "", false)
	return newAccess, newRefresh, expiresIn, err
}

// RegisterOrganization creates a new tenant: Odoo company, app org row, admin user, and tokens.
func (s *AuthService) RegisterOrganization(ctx context.Context, orgName, adminEmail, adminPassword, adminName, ip, userAgent string) (accessToken, refreshToken string, expiresIn int, err error) {
	if s.provisioning == nil {
		return "", "", 0, ErrProvisioning
	}
	if _, err := s.queries.GetUserByEmail(ctx, adminEmail); err == nil {
		return "", "", 0, ErrEmailTaken
	} else if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return "", "", 0, err
	}

	odooCompanyID, _, err := s.provisioning.ProvisionCompany(ctx, orgName, adminEmail, adminName)
	if err != nil {
		return "", "", 0, fmt.Errorf("%w: %v", ErrProvisioning, err)
	}

	if err := s.provisioning.ProvisionDefaults(ctx, odooCompanyID); err != nil {
		return "", "", 0, fmt.Errorf("%w defaults: %v", ErrProvisioning, err)
	}

	hash, err := auth.HashPassword(adminPassword)
	if err != nil {
		return "", "", 0, fmt.Errorf("hash password: %w", err)
	}

	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Email:        adminEmail,
		PasswordHash: hash,
		Role:         "viewer",
	})
	if err != nil {
		return "", "", 0, fmt.Errorf("create user: %w", err)
	}

	slug, err := s.allocateOrgSlug(ctx, orgName)
	if err != nil {
		return "", "", 0, err
	}

	org, err := s.queries.CreateOrganization(ctx, db.CreateOrganizationParams{
		Name:          orgName,
		Slug:          slug,
		OdooCompanyID: odooCompanyID,
		Status:        "active",
	})
	if err != nil {
		return "", "", 0, fmt.Errorf("create organization: %w", err)
	}

	if err := s.queries.AddOrganizationMember(ctx, db.AddOrganizationMemberParams{
		OrganizationID: org.ID,
		UserID:         user.ID,
		Role:           "admin",
	}); err != nil {
		return "", "", 0, fmt.Errorf("add member: %w", err)
	}

	return s.issueTokenPair(ctx, user, org, "admin", ip, userAgent, true)
}

func (s *AuthService) allocateOrgSlug(ctx context.Context, name string) (string, error) {
	base := slugify(name)
	if base == "" {
		base = "org"
	}
	for i := 0; i < 24; i++ {
		candidate := base
		if i > 0 {
			candidate = base + "-" + randomHex(4)
		}
		_, err := s.queries.GetOrganizationBySlug(ctx, candidate)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return candidate, nil
			}
			return "", err
		}
		// slug already taken
	}
	return "", fmt.Errorf("could not allocate unique slug")
}

func slugify(s string) string {
	var b strings.Builder
	lastDash := false
	for _, r := range strings.ToLower(strings.TrimSpace(s)) {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '-' || r == '_':
			if !lastDash && b.Len() > 0 {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}
	out := strings.Trim(b.String(), "-")
	for strings.Contains(out, "--") {
		out = strings.ReplaceAll(out, "--", "-")
	}
	return out
}

func randomHex(nBytes int) string {
	b := make([]byte, nBytes)
	if _, err := rand.Read(b); err != nil {
		return "x"
	}
	return hex.EncodeToString(b)
}

// CreateAPIKey creates a new API key scoped to an organization.
func (s *AuthService) CreateAPIKey(ctx context.Context, userID, organizationID pgtype.UUID, name string, scopes []string) (plainKey string, key db.ApiKey, err error) {
	plain, keyHash, keyPrefix, err := auth.GenerateAPIKey()
	if err != nil {
		return "", db.ApiKey{}, fmt.Errorf("generate API key: %w", err)
	}

	row, err := s.queries.CreateAPIKey(ctx, db.CreateAPIKeyParams{
		UserID:         userID,
		OrganizationID: organizationID,
		Name:           name,
		KeyHash:        keyHash,
		KeyPrefix:      keyPrefix,
		Scopes:         scopes,
		ExpiresAt:      pgtype.Timestamptz{Time: time.Now().Add(365 * 24 * time.Hour), Valid: true},
	})
	if err != nil {
		return "", db.ApiKey{}, fmt.Errorf("create API key: %w", err)
	}

	key = db.ApiKey{
		ID:             row.ID,
		UserID:         row.UserID,
		OrganizationID: row.OrganizationID,
		Name:           row.Name,
		KeyHash:        row.KeyHash,
		KeyPrefix:      row.KeyPrefix,
		Scopes:         row.Scopes,
		Active:         row.Active,
		LastUsedAt:     row.LastUsedAt,
		ExpiresAt:      row.ExpiresAt,
		CreatedAt:      row.CreatedAt,
	}

	_, _ = s.queries.CreateAuditEntry(ctx, db.CreateAuditEntryParams{
		UserID:         userID,
		Action:         "auth.apikey.created",
		ResourceType:   "api_key",
		ResourceID:     uuidToString(key.ID),
		Details:        []byte(`{}`),
		OrganizationID: organizationID,
	})

	return plain, key, nil
}

// ValidateAPIKeyPrincipal validates an API key and returns tenant-scoped principal data.
func (s *AuthService) ValidateAPIKeyPrincipal(ctx context.Context, plainKey string) (AuthPrincipal, error) {
	keyHash := hashToken(plainKey)
	apiKey, err := s.queries.GetAPIKeyByHash(ctx, keyHash)
	if err != nil {
		return AuthPrincipal{}, ErrAPIKeyInactive
	}

	if !apiKey.Active {
		return AuthPrincipal{}, ErrAPIKeyInactive
	}

	if apiKey.ExpiresAt.Valid && apiKey.ExpiresAt.Time.Before(time.Now()) {
		return AuthPrincipal{}, ErrAPIKeyInactive
	}

	_ = s.queries.UpdateAPIKeyLastUsed(ctx, apiKey.ID)

	user, err := s.queries.GetUserByID(ctx, apiKey.UserID)
	if err != nil {
		return AuthPrincipal{}, fmt.Errorf("get user: %w", err)
	}

	org, err := s.queries.GetOrganizationByID(ctx, apiKey.OrganizationID)
	if err != nil {
		return AuthPrincipal{}, ErrAPIKeyInactive
	}

	if user.Role == "super_admin" {
		return AuthPrincipal{
			UserID:         user.ID,
			Role:           "super_admin",
			OrganizationID: apiKey.OrganizationID,
			OdooCompanyID:  org.OdooCompanyID,
		}, nil
	}

	m, err := s.queries.GetMembership(ctx, db.GetMembershipParams{
		UserID:         user.ID,
		OrganizationID: apiKey.OrganizationID,
	})
	if err != nil {
		return AuthPrincipal{}, ErrAPIKeyInactive
	}

	return AuthPrincipal{
		UserID:         user.ID,
		Role:           m.Role,
		OrganizationID: apiKey.OrganizationID,
		OdooCompanyID:  org.OdooCompanyID,
	}, nil
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
