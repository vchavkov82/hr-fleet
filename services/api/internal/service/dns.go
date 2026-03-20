package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/vchavkov/hr/services/api/platform/cloudflare"
)

// DNSClient defines the Cloudflare operations the DNS service needs.
type DNSClient interface {
	ListRecords(ctx context.Context, recordType, name string, page, perPage int) ([]cloudflare.DNSRecord, int, error)
	GetRecord(ctx context.Context, recordID string) (*cloudflare.DNSRecord, error)
	CreateRecord(ctx context.Context, input cloudflare.CreateRecordInput) (*cloudflare.DNSRecord, error)
	UpdateRecord(ctx context.Context, recordID string, input cloudflare.UpdateRecordInput) (*cloudflare.DNSRecord, error)
	DeleteRecord(ctx context.Context, recordID string) error
	GetZone(ctx context.Context) (*cloudflare.ZoneDetails, error)
}

// DNSService provides business logic for DNS record management.
type DNSService struct {
	cf DNSClient
}

// NewDNSService creates a new DNSService.
func NewDNSService(cf DNSClient) *DNSService {
	return &DNSService{cf: cf}
}

var allowedRecordTypes = map[string]bool{
	"A": true, "AAAA": true, "CNAME": true, "MX": true,
	"TXT": true, "SRV": true, "NS": true, "CAA": true,
}

// ListRecords returns DNS records with optional type/name filter.
func (s *DNSService) ListRecords(ctx context.Context, recordType, name string, page, perPage int) ([]cloudflare.DNSRecord, int, error) {
	records, total, err := s.cf.ListRecords(ctx, recordType, name, page, perPage)
	if err != nil {
		return nil, 0, fmt.Errorf("list dns records: %w", err)
	}
	return records, total, nil
}

// GetRecord retrieves a single DNS record.
func (s *DNSService) GetRecord(ctx context.Context, id string) (*cloudflare.DNSRecord, error) {
	rec, err := s.cf.GetRecord(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get dns record: %w", err)
	}
	return rec, nil
}

// CreateRecord validates and creates a new DNS record.
func (s *DNSService) CreateRecord(ctx context.Context, input cloudflare.CreateRecordInput) (*cloudflare.DNSRecord, error) {
	input.Type = strings.ToUpper(input.Type)
	if !allowedRecordTypes[input.Type] {
		return nil, fmt.Errorf("unsupported record type: %s", input.Type)
	}
	if input.Name == "" {
		return nil, fmt.Errorf("record name is required")
	}
	if input.Content == "" {
		return nil, fmt.Errorf("record content is required")
	}
	if input.TTL == 0 {
		input.TTL = 1 // 1 = automatic in Cloudflare
	}

	rec, err := s.cf.CreateRecord(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("create dns record: %w", err)
	}
	return rec, nil
}

// UpdateRecord validates and updates an existing DNS record.
func (s *DNSService) UpdateRecord(ctx context.Context, id string, input cloudflare.UpdateRecordInput) (*cloudflare.DNSRecord, error) {
	input.Type = strings.ToUpper(input.Type)
	if !allowedRecordTypes[input.Type] {
		return nil, fmt.Errorf("unsupported record type: %s", input.Type)
	}
	if input.Name == "" {
		return nil, fmt.Errorf("record name is required")
	}
	if input.Content == "" {
		return nil, fmt.Errorf("record content is required")
	}
	if input.TTL == 0 {
		input.TTL = 1
	}

	rec, err := s.cf.UpdateRecord(ctx, id, input)
	if err != nil {
		return nil, fmt.Errorf("update dns record: %w", err)
	}
	return rec, nil
}

// DeleteRecord removes a DNS record by ID.
func (s *DNSService) DeleteRecord(ctx context.Context, id string) error {
	if err := s.cf.DeleteRecord(ctx, id); err != nil {
		return fmt.Errorf("delete dns record: %w", err)
	}
	return nil
}

// GetZone returns zone metadata.
func (s *DNSService) GetZone(ctx context.Context) (*cloudflare.ZoneDetails, error) {
	z, err := s.cf.GetZone(ctx)
	if err != nil {
		return nil, fmt.Errorf("get zone: %w", err)
	}
	return z, nil
}
