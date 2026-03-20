package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/platform/cloudflare"
)

type mockDNSService struct {
	records []cloudflare.DNSRecord
	zone    *cloudflare.ZoneDetails
	created *cloudflare.DNSRecord
	err     error
}

func (m *mockDNSService) ListRecords(_ context.Context, _, _ string, _, _ int) ([]cloudflare.DNSRecord, int, error) {
	if m.err != nil {
		return nil, 0, m.err
	}
	return m.records, len(m.records), nil
}

func (m *mockDNSService) GetRecord(_ context.Context, id string) (*cloudflare.DNSRecord, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, r := range m.records {
		if r.ID == id {
			return &r, nil
		}
	}
	return nil, fmt.Errorf("not found")
}

func (m *mockDNSService) CreateRecord(_ context.Context, input cloudflare.CreateRecordInput) (*cloudflare.DNSRecord, error) {
	if m.err != nil {
		return nil, m.err
	}
	rec := &cloudflare.DNSRecord{ID: "new-id", Type: input.Type, Name: input.Name, Content: input.Content}
	m.created = rec
	return rec, nil
}

func (m *mockDNSService) UpdateRecord(_ context.Context, id string, input cloudflare.UpdateRecordInput) (*cloudflare.DNSRecord, error) {
	if m.err != nil {
		return nil, m.err
	}
	return &cloudflare.DNSRecord{ID: id, Type: input.Type, Name: input.Name, Content: input.Content}, nil
}

func (m *mockDNSService) DeleteRecord(_ context.Context, _ string) error {
	return m.err
}

func (m *mockDNSService) GetZone(_ context.Context) (*cloudflare.ZoneDetails, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.zone, nil
}

func TestDNSHandler_HandleGetZone(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{
		zone: &cloudflare.ZoneDetails{ID: "z1", Name: "assistance.bg", Status: "active"},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/dns/zone", nil)
	rec := httptest.NewRecorder()
	h.HandleGetZone(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var zone cloudflare.ZoneDetails
	if err := json.NewDecoder(rec.Body).Decode(&zone); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if zone.Name != "assistance.bg" {
		t.Errorf("expected zone name 'assistance.bg', got %q", zone.Name)
	}
}

func TestDNSHandler_HandleGetZone_Error(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{err: fmt.Errorf("cf error")})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/dns/zone", nil)
	rec := httptest.NewRecorder()
	h.HandleGetZone(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}
}

func TestDNSHandler_HandleListRecords(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{
		records: []cloudflare.DNSRecord{
			{ID: "r1", Type: "A", Name: "test.assistance.bg", Content: "1.2.3.4"},
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/dns/records?type=A", nil)
	rec := httptest.NewRecorder()
	h.HandleListRecords(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestDNSHandler_HandleCreateRecord(t *testing.T) {
	mock := &mockDNSService{}
	h := NewDNSHandler(mock)

	body, _ := json.Marshal(cloudflare.CreateRecordInput{
		Type: "A", Name: "new.assistance.bg", Content: "5.6.7.8",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/dns/records", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.HandleCreateRecord(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestDNSHandler_HandleCreateRecord_BadBody(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/dns/records", bytes.NewReader([]byte("not json")))
	rec := httptest.NewRecorder()
	h.HandleCreateRecord(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestDNSHandler_HandleDeleteRecord(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{})

	r := chi.NewRouter()
	r.Delete("/dns/records/{id}", h.HandleDeleteRecord)

	req := httptest.NewRequest(http.MethodDelete, "/dns/records/r1", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestDNSHandler_HandleDeleteRecord_Error(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{err: fmt.Errorf("cf error")})

	r := chi.NewRouter()
	r.Delete("/dns/records/{id}", h.HandleDeleteRecord)

	req := httptest.NewRequest(http.MethodDelete, "/dns/records/r1", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}
}

func TestDNSHandler_HandleGetRecord(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{
		records: []cloudflare.DNSRecord{
			{ID: "r1", Type: "A", Name: "test.assistance.bg", Content: "1.2.3.4"},
		},
	})

	r := chi.NewRouter()
	r.Get("/dns/records/{id}", h.HandleGetRecord)

	req := httptest.NewRequest(http.MethodGet, "/dns/records/r1", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestDNSHandler_HandleUpdateRecord(t *testing.T) {
	h := NewDNSHandler(&mockDNSService{})

	body, _ := json.Marshal(cloudflare.UpdateRecordInput{
		Type: "A", Name: "test.assistance.bg", Content: "9.8.7.6",
	})

	r := chi.NewRouter()
	r.Put("/dns/records/{id}", h.HandleUpdateRecord)

	req := httptest.NewRequest(http.MethodPut, "/dns/records/r1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
}
