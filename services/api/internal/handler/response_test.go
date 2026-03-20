package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRespondJSON(t *testing.T) {
	w := httptest.NewRecorder()
	RespondJSON(w, http.StatusTeapot, map[string]string{"hello": "world"})

	if w.Code != http.StatusTeapot {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusTeapot)
	}
	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Fatalf("Content-Type = %q, want application/json", ct)
	}
	var got map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatal(err)
	}
	if got["hello"] != "world" {
		t.Fatalf("body = %#v", got)
	}
}

func TestRespondError(t *testing.T) {
	w := httptest.NewRecorder()
	RespondError(w, http.StatusBadRequest, "CODE", "msg",
		FieldError{Field: "email", Message: "required"},
	)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d", w.Code)
	}
	var body ErrorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Error.Code != "CODE" || body.Error.Message != "msg" {
		t.Fatalf("error = %#v", body.Error)
	}
	if len(body.Error.Details) != 1 || body.Error.Details[0].Field != "email" {
		t.Fatalf("details = %#v", body.Error.Details)
	}
}

func TestRespondList(t *testing.T) {
	w := httptest.NewRecorder()
	RespondList(w, []string{"a", "b"}, 25, 2, 10)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d", w.Code)
	}
	var body ListResponse
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body.Meta.Total != 25 || body.Meta.Page != 2 || body.Meta.PerPage != 10 || body.Meta.TotalPages != 3 {
		t.Fatalf("meta = %#v", body.Meta)
	}
}
