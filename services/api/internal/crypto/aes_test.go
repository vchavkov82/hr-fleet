package crypto

import (
	"crypto/rand"
	"testing"
)

func testKey(t *testing.T) []byte {
	t.Helper()
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		t.Fatal(err)
	}
	return key
}

func TestEncryptReturnsNonEmpty(t *testing.T) {
	key := testKey(t)
	ct, err := Encrypt([]byte("hello"), key)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}
	if ct == "" {
		t.Fatal("expected non-empty ciphertext")
	}
}

func TestDecryptRoundTrip(t *testing.T) {
	key := testKey(t)
	ct, err := Encrypt([]byte("hello"), key)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}
	pt, err := Decrypt(ct, key)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}
	if string(pt) != "hello" {
		t.Fatalf("expected 'hello', got %q", string(pt))
	}
}

func TestDecryptWrongKey(t *testing.T) {
	key1 := testKey(t)
	key2 := testKey(t)
	ct, err := Encrypt([]byte("hello"), key1)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}
	_, err = Decrypt(ct, key2)
	if err == nil {
		t.Fatal("expected error decrypting with wrong key")
	}
}

func TestEncryptInvalidKeyLength(t *testing.T) {
	shortKey := make([]byte, 16)
	_, err := Encrypt([]byte("hello"), shortKey)
	if err == nil {
		t.Fatal("expected error for invalid key length")
	}
}

func TestEncryptProducesDifferentCiphertext(t *testing.T) {
	key := testKey(t)
	ct1, _ := Encrypt([]byte("hello"), key)
	ct2, _ := Encrypt([]byte("hello"), key)
	if ct1 == ct2 {
		t.Fatal("expected different ciphertexts for same plaintext")
	}
}
