package middleware

import (
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

// NewJWTAuth creates a new JWTAuth instance with HS256 signing.
func NewJWTAuth(secret string) *jwtauth.JWTAuth {
	return jwtauth.New("HS256", []byte(secret), nil)
}

// UserClaims holds extracted JWT claims for the current request.
type UserClaims struct {
	Subject string
	Email   string
}

// GetUserFromContext extracts JWT claims from the request context.
func GetUserFromContext(r *http.Request) *UserClaims {
	_, claims, err := jwtauth.FromContext(r.Context())
	if err != nil {
		return nil
	}

	uc := &UserClaims{}
	if sub, ok := claims["sub"].(string); ok {
		uc.Subject = sub
	}
	if email, ok := claims["email"].(string); ok {
		uc.Email = email
	}

	return uc
}

// Ensure jwt import is used (needed for jwtauth token validation).
var _ = jwt.New
