package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/pem"
	"fmt"
	"time"

	"github.com/go-chi/jwtauth/v5"
)

// NewJWTAuth creates a JWTAuth instance using RS256 with PEM-encoded RSA keys.
func NewJWTAuth(privateKeyPEM, publicKeyPEM []byte) (*jwtauth.JWTAuth, error) {
	privBlock, _ := pem.Decode(privateKeyPEM)
	if privBlock == nil {
		return nil, fmt.Errorf("failed to decode private key PEM")
	}
	privKey, err := x509.ParsePKCS1PrivateKey(privBlock.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse private key: %w", err)
	}

	pubBlock, _ := pem.Decode(publicKeyPEM)
	if pubBlock == nil {
		return nil, fmt.Errorf("failed to decode public key PEM")
	}
	pubKeyIface, err := x509.ParsePKIXPublicKey(pubBlock.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse public key: %w", err)
	}

	return jwtauth.New("RS256", privKey, pubKeyIface), nil
}

// GenerateAccessToken creates a signed RS256 JWT with 15-minute expiry.
// If companyID > 0, it is included in the token claims for multi-tenancy scoping.
func GenerateAccessToken(auth *jwtauth.JWTAuth, userID, email, role string, companyID int64) (string, error) {
	claims := map[string]interface{}{
		"sub":   userID,
		"email": email,
		"role":  role,
	}
	if companyID > 0 {
		claims["company_id"] = companyID
	}
	jwtauth.SetExpiry(claims, time.Now().Add(15*time.Minute))
	jwtauth.SetIssuedAt(claims, time.Now())

	_, tokenStr, err := auth.Encode(claims)
	return tokenStr, err
}

// GenerateRefreshToken creates a random 32-byte token and its SHA-256 hash.
func GenerateRefreshToken() (plainToken, tokenHash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", fmt.Errorf("generate random bytes: %w", err)
	}
	plain := hex.EncodeToString(b)
	h := sha256.Sum256([]byte(plain))
	return plain, hex.EncodeToString(h[:]), nil
}
