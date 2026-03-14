package middleware

import (
	"github.com/vchavkov/hr/services/api/internal/auth"
)

// RequirePermission returns middleware that checks if the user's role has a specific permission.
// Re-exports from auth package for convenience in route definitions.
var RequirePermission = auth.RequirePermission
