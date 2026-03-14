package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"testing"
	"time"

	"github.com/go-chi/jwtauth/v5"
)

func generateTestKeys(t *testing.T) ([]byte, []byte) {
	t.Helper()
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("generate RSA key: %v", err)
	}
	privPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	})
	pubASN1, err := x509.MarshalPKIXPublicKey(&key.PublicKey)
	if err != nil {
		t.Fatalf("marshal public key: %v", err)
	}
	pubPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubASN1,
	})
	return privPEM, pubPEM
}

func TestNewJWTAuth(t *testing.T) {
	priv, pub := generateTestKeys(t)
	auth, err := NewJWTAuth(priv, pub)
	if err != nil {
		t.Fatalf("NewJWTAuth: %v", err)
	}
	if auth == nil {
		t.Fatal("expected non-nil JWTAuth")
	}
}

func TestGenerateAccessToken(t *testing.T) {
	priv, pub := generateTestKeys(t)
	auth, _ := NewJWTAuth(priv, pub)

	token, err := GenerateAccessToken(auth, "user-123", "test@example.com", "admin")
	if err != nil {
		t.Fatalf("GenerateAccessToken: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}

	// Verify the token and check claims
	tok, err := jwtauth.VerifyToken(auth, token)
	if err != nil {
		t.Fatalf("verify token: %v", err)
	}

	sub, ok := tok.Subject()
	if !ok || sub != "user-123" {
		t.Errorf("subject = %q, want %q", sub, "user-123")
	}

	// Check custom claims via Get (jwx v3: Get(name, &dst) error)
	var emailVal string
	if err := tok.Get("email", &emailVal); err != nil || emailVal != "test@example.com" {
		t.Errorf("email = %v, want test@example.com", emailVal)
	}
	var roleVal string
	if err := tok.Get("role", &roleVal); err != nil || roleVal != "admin" {
		t.Errorf("role = %v, want admin", roleVal)
	}

	// Check expiry is ~15 minutes
	exp, ok := tok.Expiration()
	if !ok {
		t.Fatal("no expiration set")
	}
	diff := time.Until(exp)
	if diff < 14*time.Minute || diff > 16*time.Minute {
		t.Errorf("expiry diff = %v, want ~15 min", diff)
	}
}

func TestGenerateRefreshToken(t *testing.T) {
	plain, hash, err := GenerateRefreshToken()
	if err != nil {
		t.Fatalf("GenerateRefreshToken: %v", err)
	}
	if len(plain) == 0 {
		t.Fatal("expected non-empty plain token")
	}
	if len(hash) == 0 {
		t.Fatal("expected non-empty hash")
	}
	if plain == hash {
		t.Fatal("plain and hash should differ")
	}
}

func TestVerifyToken_Invalid(t *testing.T) {
	priv, pub := generateTestKeys(t)
	auth, _ := NewJWTAuth(priv, pub)

	_, err := jwtauth.VerifyToken(auth, "invalid-token")
	if err == nil {
		t.Fatal("expected error for invalid token")
	}
}

func TestVerifyToken_Expired(t *testing.T) {
	priv, pub := generateTestKeys(t)
	auth, _ := NewJWTAuth(priv, pub)

	// Create a token that's already expired
	claims := map[string]interface{}{
		"sub":   "user-123",
		"email": "test@example.com",
		"role":  "admin",
	}
	jwtauth.SetExpiry(claims, time.Now().Add(-1*time.Hour))
	_, tokenStr, err := auth.Encode(claims)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}

	// VerifyToken should reject expired tokens
	_, err = jwtauth.VerifyToken(auth, tokenStr)
	if err == nil {
		t.Fatal("expected error for expired token")
	}
}
