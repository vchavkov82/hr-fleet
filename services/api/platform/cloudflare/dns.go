package cloudflare

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

const baseURL = "https://api.cloudflare.com/client/v4"

// Client talks to the Cloudflare API v4 using a scoped API token.
type Client struct {
	zoneID string
	token  string
	http   *http.Client
}

// NewClient creates a Cloudflare client for a single DNS zone.
func NewClient(apiToken, zoneID string) *Client {
	return &Client{
		zoneID: zoneID,
		token:  apiToken,
		http: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// DNSRecord represents a Cloudflare DNS record.
type DNSRecord struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Name      string    `json:"name"`
	Content   string    `json:"content"`
	TTL       int       `json:"ttl"`
	Proxied   bool      `json:"proxied"`
	Priority  *int      `json:"priority,omitempty"`
	Comment   string    `json:"comment,omitempty"`
	CreatedOn time.Time `json:"created_on"`
	ModifiedOn time.Time `json:"modified_on"`
}

// CreateRecordInput is the payload for creating a DNS record.
type CreateRecordInput struct {
	Type     string `json:"type"`
	Name     string `json:"name"`
	Content  string `json:"content"`
	TTL      int    `json:"ttl,omitempty"`
	Proxied  *bool  `json:"proxied,omitempty"`
	Priority *int   `json:"priority,omitempty"`
	Comment  string `json:"comment,omitempty"`
}

// UpdateRecordInput is the payload for updating a DNS record.
type UpdateRecordInput struct {
	Type     string `json:"type"`
	Name     string `json:"name"`
	Content  string `json:"content"`
	TTL      int    `json:"ttl,omitempty"`
	Proxied  *bool  `json:"proxied,omitempty"`
	Priority *int   `json:"priority,omitempty"`
	Comment  string `json:"comment,omitempty"`
}

// apiResponse is the envelope Cloudflare wraps every response in.
type apiResponse struct {
	Success  bool            `json:"success"`
	Errors   []apiError      `json:"errors"`
	Messages []apiMessage    `json:"messages"`
	Result   json.RawMessage `json:"result"`
	ResultInfo *resultInfo   `json:"result_info,omitempty"`
}

type apiError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type apiMessage struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type resultInfo struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	TotalPages int `json:"total_pages"`
	Count      int `json:"count"`
	TotalCount int `json:"total_count"`
}

// ListRecords returns DNS records, optionally filtered by type and/or name.
func (c *Client) ListRecords(ctx context.Context, recordType, name string, page, perPage int) ([]DNSRecord, int, error) {
	params := url.Values{}
	if recordType != "" {
		params.Set("type", recordType)
	}
	if name != "" {
		params.Set("name", name)
	}
	if page > 0 {
		params.Set("page", fmt.Sprintf("%d", page))
	}
	if perPage > 0 {
		params.Set("per_page", fmt.Sprintf("%d", perPage))
	}

	endpoint := fmt.Sprintf("%s/zones/%s/dns_records?%s", baseURL, c.zoneID, params.Encode())
	resp, err := c.do(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, 0, err
	}

	var records []DNSRecord
	if err := json.Unmarshal(resp.Result, &records); err != nil {
		return nil, 0, fmt.Errorf("decode records: %w", err)
	}

	total := len(records)
	if resp.ResultInfo != nil {
		total = resp.ResultInfo.TotalCount
	}
	return records, total, nil
}

// GetRecord retrieves a single DNS record by ID.
func (c *Client) GetRecord(ctx context.Context, recordID string) (*DNSRecord, error) {
	endpoint := fmt.Sprintf("%s/zones/%s/dns_records/%s", baseURL, c.zoneID, recordID)
	resp, err := c.do(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	var rec DNSRecord
	if err := json.Unmarshal(resp.Result, &rec); err != nil {
		return nil, fmt.Errorf("decode record: %w", err)
	}
	return &rec, nil
}

// CreateRecord creates a new DNS record in the zone.
func (c *Client) CreateRecord(ctx context.Context, input CreateRecordInput) (*DNSRecord, error) {
	endpoint := fmt.Sprintf("%s/zones/%s/dns_records", baseURL, c.zoneID)
	body, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("encode input: %w", err)
	}

	resp, err := c.do(ctx, http.MethodPost, endpoint, body)
	if err != nil {
		return nil, err
	}

	var rec DNSRecord
	if err := json.Unmarshal(resp.Result, &rec); err != nil {
		return nil, fmt.Errorf("decode created record: %w", err)
	}
	return &rec, nil
}

// UpdateRecord replaces a DNS record by ID.
func (c *Client) UpdateRecord(ctx context.Context, recordID string, input UpdateRecordInput) (*DNSRecord, error) {
	endpoint := fmt.Sprintf("%s/zones/%s/dns_records/%s", baseURL, c.zoneID, recordID)
	body, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("encode input: %w", err)
	}

	resp, err := c.do(ctx, http.MethodPut, endpoint, body)
	if err != nil {
		return nil, err
	}

	var rec DNSRecord
	if err := json.Unmarshal(resp.Result, &rec); err != nil {
		return nil, fmt.Errorf("decode updated record: %w", err)
	}
	return &rec, nil
}

// DeleteRecord removes a DNS record by ID.
func (c *Client) DeleteRecord(ctx context.Context, recordID string) error {
	endpoint := fmt.Sprintf("%s/zones/%s/dns_records/%s", baseURL, c.zoneID, recordID)
	_, err := c.do(ctx, http.MethodDelete, endpoint, nil)
	return err
}

// ZoneDetails returns basic zone metadata (name, status, nameservers).
type ZoneDetails struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Status      string   `json:"status"`
	Nameservers []string `json:"name_servers"`
}

// GetZone returns metadata about the configured zone.
func (c *Client) GetZone(ctx context.Context) (*ZoneDetails, error) {
	endpoint := fmt.Sprintf("%s/zones/%s", baseURL, c.zoneID)
	resp, err := c.do(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	var zone ZoneDetails
	if err := json.Unmarshal(resp.Result, &zone); err != nil {
		return nil, fmt.Errorf("decode zone: %w", err)
	}
	return &zone, nil
}

func (c *Client) do(ctx context.Context, method, endpoint string, body []byte) (*apiResponse, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}

	req, err := http.NewRequestWithContext(ctx, method, endpoint, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Content-Type", "application/json")

	httpResp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("cloudflare request: %w", err)
	}
	defer httpResp.Body.Close()

	respBody, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	var apiResp apiResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("decode response (status %d): %w", httpResp.StatusCode, err)
	}

	if !apiResp.Success {
		msg := "unknown error"
		if len(apiResp.Errors) > 0 {
			msg = apiResp.Errors[0].Message
		}
		return nil, fmt.Errorf("cloudflare API error (%d): %s", httpResp.StatusCode, msg)
	}

	return &apiResp, nil
}
