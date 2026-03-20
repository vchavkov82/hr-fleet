package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAuthHandleLogin_InvalidJSON(t *testing.T) {
	h := &AuthHandler{}
	req := httptest.NewRequest(http.MethodPost, "/auth/login", strings.NewReader(`{`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.HandleLogin(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
}

func TestAuthHandleLogin_MissingFields(t *testing.T) {
	h := &AuthHandler{}
	body, _ := json.Marshal(map[string]string{"email": "", "password": ""})
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.HandleLogin(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
}

func TestAuthHandleRefresh_InvalidJSON(t *testing.T) {
	h := &AuthHandler{}
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", strings.NewReader(`not-json`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.HandleRefresh(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d", w.Code)
	}
}

func TestAuthHandleRefresh_EmptyToken(t *testing.T) {
	h := &AuthHandler{}
	body, _ := json.Marshal(map[string]string{"refresh_token": ""})
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.HandleRefresh(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d", w.Code)
	}
}

func TestAuthHandleCreateAPIKey_MissingIdentity(t *testing.T) {
	h := &AuthHandler{}
	body, _ := json.Marshal(map[string]string{"name": "k"})
	req := httptest.NewRequest(http.MethodPost, "/auth/api-keys", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.HandleCreateAPIKey(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, body = %s", w.Code, w.Body.String())
	}
}
