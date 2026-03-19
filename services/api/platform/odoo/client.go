package odoo

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/rs/zerolog"
	"github.com/sony/gobreaker"
)

// ClientOptions configures circuit breaker and connection pool settings.
type ClientOptions struct {
	MaxConcurrent      int
	CBMaxRequests      uint32
	CBIntervalSeconds  int
	CBTimeoutSeconds   int
	CBFailureThreshold int
	HTTPTimeoutSeconds int
}

// DefaultClientOptions returns production-ready defaults.
func DefaultClientOptions() ClientOptions {
	return ClientOptions{
		MaxConcurrent:      20,
		CBMaxRequests:      3,
		CBIntervalSeconds:  30,
		CBTimeoutSeconds:   10,
		CBFailureThreshold: 5,
		HTTPTimeoutSeconds: 30,
	}
}

// Client is the Odoo JSON-RPC client with session management,
// circuit breaker, and connection pooling.
type Client struct {
	baseURL        string
	db             string
	uid            int64
	username       string
	password       string
	client         *http.Client
	sessionID      string
	mu             sync.Mutex
	requestID      int
	cb             *gobreaker.CircuitBreaker
	sem            chan struct{}
	maxConcurrent  int
	logger         zerolog.Logger
}

// NewClient creates a new Odoo JSON-RPC client with default options.
func NewClient(baseURL, db, username, password string) *Client {
	return NewClientWithOptions(baseURL, db, username, password, DefaultClientOptions())
}

// NewClientWithOptions creates a new Odoo JSON-RPC client with custom options.
func NewClientWithOptions(baseURL, db, username, password string, opts ClientOptions) *Client {
	if opts.MaxConcurrent <= 0 {
		opts.MaxConcurrent = 20
	}

	failureThreshold := opts.CBFailureThreshold
	cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
		Name:        "odoo",
		MaxRequests: opts.CBMaxRequests,
		Interval:    time.Duration(opts.CBIntervalSeconds) * time.Second,
		Timeout:     time.Duration(opts.CBTimeoutSeconds) * time.Second,
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			return int(counts.ConsecutiveFailures) >= failureThreshold
		},
	})

	return &Client{
		baseURL:       strings.TrimRight(baseURL, "/"),
		db:            db,
		username:      username,
		password:      password,
		client:        &http.Client{},
		cb:            cb,
		sem:           make(chan struct{}, opts.MaxConcurrent),
		maxConcurrent: opts.MaxConcurrent,
	}
}

// MaxConcurrent returns the connection pool size limit.
func (c *Client) MaxConcurrent() int {
	return c.maxConcurrent
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
	// Acquire semaphore for connection pooling
	c.sem <- struct{}{}
	defer func() { <-c.sem }()

	// Execute through circuit breaker
	result, err := c.cb.Execute(func() (interface{}, error) {
		return c.doCall(service, method, args)
	})
	if err != nil {
		// Check for circuit breaker open
		if err == gobreaker.ErrOpenState || err == gobreaker.ErrTooManyRequests {
			return nil, fmt.Errorf("circuit breaker is open")
		}
		// Re-auth on session expiry
		if isSessionExpired(err) && c.uid > 0 {
			if authErr := c.Authenticate(); authErr != nil {
				return nil, fmt.Errorf("re-auth failed: %w", authErr)
			}
			retryResult, retryErr := c.cb.Execute(func() (interface{}, error) {
				return c.doCall(service, method, args)
			})
			if retryErr != nil {
				return nil, retryErr
			}
			if retryResult == nil {
				return nil, nil
			}
			return retryResult.(json.RawMessage), nil
		}
		return nil, err
	}
	if result == nil {
		return nil, nil
	}
	return result.(json.RawMessage), nil
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

// CallAction invokes a named action (e.g., action_approve) on a record.
func (c *Client) CallAction(model string, ids []int64, action string) error {
	if err := c.EnsureAuthenticated(); err != nil {
		return err
	}

	args := []any{
		c.db, c.uid, c.password,
		model, action,
		[]any{ids},
	}

	_, err := c.Call("object", "execute_kw", args)
	if err != nil {
		return fmt.Errorf("%s %s/%v: %w", action, model, ids, err)
	}

	return nil
}

// Healthy checks if the Odoo client circuit breaker is in a healthy state.
// Returns nil if closed or half-open, error if open.
func (c *Client) Healthy() error {
	state := c.cb.State()
	if state == gobreaker.StateOpen {
		return fmt.Errorf("circuit breaker is open")
	}
	return nil
}

// CircuitBreakerState returns the current circuit breaker state as a string.
func (c *Client) CircuitBreakerState() string {
	switch c.cb.State() {
	case gobreaker.StateClosed:
		return "closed"
	case gobreaker.StateHalfOpen:
		return "half-open"
	case gobreaker.StateOpen:
		return "open"
	default:
		return "unknown"
	}
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
