package service

import (
	"context"
	"fmt"
	"testing"

	"github.com/vchavkov/hr/services/api/platform/cloudflare"
)

type mockDNSClient struct {
	records []cloudflare.DNSRecord
	zone    *cloudflare.ZoneDetails
	err     error
}

func (m *mockDNSClient) ListRecords(_ context.Context, _, _ string, _, _ int) ([]cloudflare.DNSRecord, int, error) {
	if m.err != nil {
		return nil, 0, m.err
	}
	return m.records, len(m.records), nil
}

func (m *mockDNSClient) GetRecord(_ context.Context, id string) (*cloudflare.DNSRecord, error) {
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

func (m *mockDNSClient) CreateRecord(_ context.Context, input cloudflare.CreateRecordInput) (*cloudflare.DNSRecord, error) {
	if m.err != nil {
		return nil, m.err
	}
	rec := cloudflare.DNSRecord{
		ID:      "new-id",
		Type:    input.Type,
		Name:    input.Name,
		Content: input.Content,
		TTL:     input.TTL,
	}
	return &rec, nil
}

func (m *mockDNSClient) UpdateRecord(_ context.Context, id string, input cloudflare.UpdateRecordInput) (*cloudflare.DNSRecord, error) {
	if m.err != nil {
		return nil, m.err
	}
	rec := cloudflare.DNSRecord{
		ID:      id,
		Type:    input.Type,
		Name:    input.Name,
		Content: input.Content,
		TTL:     input.TTL,
	}
	return &rec, nil
}

func (m *mockDNSClient) DeleteRecord(_ context.Context, _ string) error {
	return m.err
}

func (m *mockDNSClient) GetZone(_ context.Context) (*cloudflare.ZoneDetails, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.zone, nil
}

func TestDNSService_ListRecords(t *testing.T) {
	mock := &mockDNSClient{
		records: []cloudflare.DNSRecord{
			{ID: "r1", Type: "A", Name: "test.assistance.bg", Content: "1.2.3.4"},
			{ID: "r2", Type: "CNAME", Name: "www.assistance.bg", Content: "assistance.bg"},
		},
	}
	svc := NewDNSService(mock)

	records, total, err := svc.ListRecords(context.Background(), "", "", 1, 50)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if total != 2 {
		t.Errorf("expected total=2, got %d", total)
	}
	if len(records) != 2 {
		t.Errorf("expected 2 records, got %d", len(records))
	}
}

func TestDNSService_CreateRecord_Validation(t *testing.T) {
	svc := NewDNSService(&mockDNSClient{})

	tests := []struct {
		name    string
		input   cloudflare.CreateRecordInput
		wantErr bool
	}{
		{
			name:    "empty type",
			input:   cloudflare.CreateRecordInput{Type: "", Name: "test.assistance.bg", Content: "1.2.3.4"},
			wantErr: true,
		},
		{
			name:    "unsupported type",
			input:   cloudflare.CreateRecordInput{Type: "PTR", Name: "test.assistance.bg", Content: "1.2.3.4"},
			wantErr: true,
		},
		{
			name:    "empty name",
			input:   cloudflare.CreateRecordInput{Type: "A", Name: "", Content: "1.2.3.4"},
			wantErr: true,
		},
		{
			name:    "empty content",
			input:   cloudflare.CreateRecordInput{Type: "A", Name: "test.assistance.bg", Content: ""},
			wantErr: true,
		},
		{
			name:    "valid A record",
			input:   cloudflare.CreateRecordInput{Type: "A", Name: "test.assistance.bg", Content: "1.2.3.4"},
			wantErr: false,
		},
		{
			name:    "valid lowercase type normalized",
			input:   cloudflare.CreateRecordInput{Type: "cname", Name: "www.assistance.bg", Content: "assistance.bg"},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := svc.CreateRecord(context.Background(), tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("CreateRecord() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDNSService_CreateRecord_DefaultTTL(t *testing.T) {
	mock := &mockDNSClient{}
	svc := NewDNSService(mock)

	rec, err := svc.CreateRecord(context.Background(), cloudflare.CreateRecordInput{
		Type:    "A",
		Name:    "test.assistance.bg",
		Content: "1.2.3.4",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rec.TTL != 1 {
		t.Errorf("expected TTL=1 (automatic), got %d", rec.TTL)
	}
}

func TestDNSService_GetZone(t *testing.T) {
	mock := &mockDNSClient{
		zone: &cloudflare.ZoneDetails{
			ID:          "zone-123",
			Name:        "assistance.bg",
			Status:      "active",
			Nameservers: []string{"alice.ns.cloudflare.com", "bob.ns.cloudflare.com"},
		},
	}
	svc := NewDNSService(mock)

	zone, err := svc.GetZone(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if zone.Name != "assistance.bg" {
		t.Errorf("expected zone name 'assistance.bg', got %q", zone.Name)
	}
	if zone.Status != "active" {
		t.Errorf("expected zone status 'active', got %q", zone.Status)
	}
}

func TestDNSService_DeleteRecord(t *testing.T) {
	mock := &mockDNSClient{}
	svc := NewDNSService(mock)

	if err := svc.DeleteRecord(context.Background(), "r1"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestDNSService_DeleteRecord_Error(t *testing.T) {
	mock := &mockDNSClient{err: fmt.Errorf("API failure")}
	svc := NewDNSService(mock)

	err := svc.DeleteRecord(context.Background(), "r1")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
