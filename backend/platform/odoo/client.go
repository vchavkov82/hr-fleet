package odoo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
)

// Client is the Odoo JSON-RPC client with session management.
type Client struct {
	baseURL   string
	db        string
	uid       int64
	username  string
	password  string
	client    *http.Client
	sessionID string
	mu        sync.Mutex
	requestID int
}

// NewClient creates a new Odoo JSON-RPC client.
func NewClient(baseURL, db, username, password string) *Client {
	return &Client{
		baseURL:  strings.TrimRight(baseURL, "/"),
		db:       db,
		username: username,
		password: password,
		client:   &http.Client{},
	}
}

// nextID returns a monotonically increasing request ID.
func (c *Client) nextID() int {
	c.requestID++
	return c.requestID
}

// Call sends a JSON-RPC call to Odoo's /jsonrpc endpoint.
// service is "common", "object", or "db".
// method is the RPC method (e.g., "login", "execute").
// args are the positional arguments.
//
// On session expiry (AccessDenied), Call will re-authenticate once and retry.
func (c *Client) Call(service, method string, args []any) (json.RawMessage, error) {
	result, err := c.doCall(service, method, args)
	if err != nil && isSessionExpired(err) && c.uid > 0 {
		// Re-authenticate and retry once
		if authErr := c.Authenticate(); authErr != nil {
			return nil, fmt.Errorf("re-auth failed: %w", authErr)
		}
		return c.doCall(service, method, args)
	}
	return result, err
}

// doCall performs a single JSON-RPC call without retry logic.
func (c *Client) doCall(service, method string, args []any) (json.RawMessage, error) {
	params := map[string]any{
		"service": service,
		"method":  method,
		"args":    args,
	}

	rpcReq := JSONRPCRequest{
		JSONRPC: "2.0",
		Method:  "call",
		Params:  params,
		ID:      c.nextID(),
	}

	body, err := json.Marshal(rpcReq)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.baseURL+"/jsonrpc", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	// Attach session cookie if we have one
	if c.sessionID != "" {
		httpReq.AddCookie(&http.Cookie{Name: "session_id", Value: c.sessionID})
	}

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	// Store session cookie from response
	for _, cookie := range resp.Cookies() {
		if cookie.Name == "session_id" {
			c.sessionID = cookie.Value
		}
	}

	var rpcResp JSONRPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	if rpcResp.Error != nil {
		return nil, rpcResp.Error
	}

	return rpcResp.Result, nil
}

// isSessionExpired checks if an error indicates an expired Odoo session.
func isSessionExpired(err error) bool {
	if rpcErr, ok := err.(*RPCError); ok {
		msg := strings.ToLower(rpcErr.Message)
		if strings.Contains(msg, "access denied") || strings.Contains(msg, "session expired") {
			return true
		}
		// Check data field for AccessDenied exception
		if data, ok := rpcErr.Data.(map[string]any); ok {
			name, _ := data["name"].(string)
			if strings.Contains(name, "AccessDenied") {
				return true
			}
		}
	}
	return false
}

// SearchRead performs a search_read operation on the given Odoo model.
func (c *Client) SearchRead(model string, domain []any, fields []string, limit, offset int) ([]map[string]any, error) {
	if err := c.EnsureAuthenticated(); err != nil {
		return nil, err
	}

	kwargs := map[string]any{
		"fields": fields,
		"limit":  limit,
		"offset": offset,
	}

	args := []any{
		c.db, c.uid, c.password,
		model, "search_read",
		[]any{domain},
		kwargs,
	}

	result, err := c.Call("object", "execute_kw", args)
	if err != nil {
		return nil, fmt.Errorf("search_read %s: %w", model, err)
	}

	var records []map[string]any
	if err := json.Unmarshal(result, &records); err != nil {
		return nil, fmt.Errorf("parse search_read result: %w", err)
	}

	return records, nil
}

// SearchCount returns the count of records matching the domain.
func (c *Client) SearchCount(model string, domain []any) (int64, error) {
	if err := c.EnsureAuthenticated(); err != nil {
		return 0, err
	}

	args := []any{
		c.db, c.uid, c.password,
		model, "search_count",
		[]any{domain},
	}

	result, err := c.Call("object", "execute_kw", args)
	if err != nil {
		return 0, fmt.Errorf("search_count %s: %w", model, err)
	}

	var count int64
	if err := json.Unmarshal(result, &count); err != nil {
		return 0, fmt.Errorf("parse search_count result: %w", err)
	}

	return count, nil
}

// Create creates a new record in the given Odoo model and returns its ID.
func (c *Client) Create(model string, vals map[string]any) (int64, error) {
	if err := c.EnsureAuthenticated(); err != nil {
		return 0, err
	}

	args := []any{
		c.db, c.uid, c.password,
		model, "create",
		[]any{vals},
	}

	result, err := c.Call("object", "execute_kw", args)
	if err != nil {
		return 0, fmt.Errorf("create %s: %w", model, err)
	}

	var id int64
	if err := json.Unmarshal(result, &id); err != nil {
		return 0, fmt.Errorf("parse create result: %w", err)
	}

	return id, nil
}

// Write updates an existing record in the given Odoo model.
func (c *Client) Write(model string, id int64, vals map[string]any) error {
	if err := c.EnsureAuthenticated(); err != nil {
		return err
	}

	args := []any{
		c.db, c.uid, c.password,
		model, "write",
		[]any{[]int64{id}, vals},
	}

	_, err := c.Call("object", "execute_kw", args)
	if err != nil {
		return fmt.Errorf("write %s/%d: %w", model, id, err)
	}

	return nil
}

// Read fetches records by IDs from the given Odoo model.
func (c *Client) Read(model string, ids []int64, fields []string) ([]map[string]any, error) {
	if err := c.EnsureAuthenticated(); err != nil {
		return nil, err
	}

	args := []any{
		c.db, c.uid, c.password,
		model, "read",
		[]any{ids},
		map[string]any{"fields": fields},
	}

	result, err := c.Call("object", "execute_kw", args)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", model, err)
	}

	var records []map[string]any
	if err := json.Unmarshal(result, &records); err != nil {
		return nil, fmt.Errorf("parse read result: %w", err)
	}

	return records, nil
}
