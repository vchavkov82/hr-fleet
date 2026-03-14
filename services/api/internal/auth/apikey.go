package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
)

// GenerateAPIKey creates a random 32-byte API key, its SHA-256 hash, and an 8-char prefix.
func GenerateAPIKey() (plainKey, keyHash, keyPrefix string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", "", fmt.Errorf("generate random bytes: %w", err)
	}
	plain := hex.EncodeToString(b)
	h := sha256.Sum256([]byte(plain))
	return plain, hex.EncodeToString(h[:]), plain[:8], nil
}

// ValidateAPIKey hashes the plain key and compares it to the stored hash using constant-time comparison.
func ValidateAPIKey(plainKey, storedHash string) bool {
	h := sha256.Sum256([]byte(plainKey))
	computed := hex.EncodeToString(h[:])
	return subtle.ConstantTimeCompare([]byte(computed), []byte(storedHash)) == 1
}
