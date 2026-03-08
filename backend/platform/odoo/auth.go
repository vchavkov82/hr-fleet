package odoo

import (
	"encoding/json"
	"fmt"
)

// Authenticate logs into Odoo via the common service login method.
// On success, it stores the user ID (uid) and session cookie for subsequent calls.
func (c *Client) Authenticate() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	args := []interface{}{c.db, c.username, c.password}

	result, err := c.doCall("common", "login", args)
	if err != nil {
		return fmt.Errorf("authenticate: %w", err)
	}

	// Odoo returns false (as JSON) for failed logins
	var uid int64
	if err := json.Unmarshal(result, &uid); err != nil {
		// Check if result is literally false
		var boolResult bool
		if json.Unmarshal(result, &boolResult) == nil && !boolResult {
			return fmt.Errorf("authenticate: invalid credentials for user %q", c.username)
		}
		return fmt.Errorf("authenticate: unexpected response: %s", string(result))
	}

	if uid <= 0 {
		return fmt.Errorf("authenticate: invalid uid %d", uid)
	}

	c.uid = uid
	return nil
}

// EnsureAuthenticated checks if the client has a valid session.
// If not authenticated, it performs authentication.
func (c *Client) EnsureAuthenticated() error {
	if c.uid > 0 {
		return nil
	}
	return c.Authenticate()
}
