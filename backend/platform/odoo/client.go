package odoo

import (
	"encoding/json"
	"net/http"
	"sync"
)

// Client is the Odoo JSON-RPC client.
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
		baseURL:  baseURL,
		db:       db,
		username: username,
		password: password,
		client:   &http.Client{},
	}
}

// Call sends a JSON-RPC call to Odoo. Stub - not yet implemented.
func (c *Client) Call(service, method string, args []interface{}) (json.RawMessage, error) {
	panic("not implemented")
}

// SearchRead performs a search_read operation on the given model. Stub.
func (c *Client) SearchRead(model string, domain []interface{}, fields []string, limit, offset int) ([]map[string]interface{}, error) {
	panic("not implemented")
}

// Create creates a new record in the given model. Stub.
func (c *Client) Create(model string, vals map[string]interface{}) (int64, error) {
	panic("not implemented")
}

// Write updates an existing record in the given model. Stub.
func (c *Client) Write(model string, id int64, vals map[string]interface{}) error {
	panic("not implemented")
}
