// Package crypto provides PII encryption utilities using AES-256-GCM.
//
// Key versioning: if needed later, prepend a version byte before the nonce.
package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
)

const keyLen = 32

// Encrypt encrypts plaintext with AES-256-GCM using the given 32-byte key.
// Returns a base64-encoded string containing nonce + ciphertext.
func Encrypt(plaintext []byte, key []byte) (string, error) {
	if len(key) != keyLen {
		return "", fmt.Errorf("crypto: key must be %d bytes, got %d", keyLen, len(key))
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("crypto: new cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("crypto: new gcm: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("crypto: nonce generation: %w", err)
	}

	sealed := gcm.Seal(nonce, nonce, plaintext, nil)
	return base64.StdEncoding.EncodeToString(sealed), nil
}

// Decrypt decodes base64 ciphertext and decrypts with AES-256-GCM using the given 32-byte key.
func Decrypt(ciphertext string, key []byte) ([]byte, error) {
	if len(key) != keyLen {
		return nil, fmt.Errorf("crypto: key must be %d bytes, got %d", keyLen, len(key))
	}

	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, fmt.Errorf("crypto: base64 decode: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("crypto: new cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("crypto: new gcm: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, errors.New("crypto: ciphertext too short")
	}

	nonce, ct := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ct, nil)
	if err != nil {
		return nil, fmt.Errorf("crypto: decrypt: %w", err)
	}

	return plaintext, nil
}

// KeyFromEnv reads the PII_ENCRYPTION_KEY environment variable and validates it is 32 bytes.
func KeyFromEnv() ([]byte, error) {
	raw := os.Getenv("PII_ENCRYPTION_KEY")
	if raw == "" {
		return nil, errors.New("crypto: PII_ENCRYPTION_KEY not set")
	}
	key := []byte(raw)
	if len(key) != keyLen {
		return nil, fmt.Errorf("crypto: PII_ENCRYPTION_KEY must be %d bytes, got %d", keyLen, len(key))
	}
	return key, nil
}
