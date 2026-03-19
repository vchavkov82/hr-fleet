package service

import (
	"context"
	"fmt"
	"log"
)

// ProvisioningOdooClient defines the Odoo operations needed for provisioning.
type ProvisioningOdooClient interface {
	Create(ctx context.Context, model string, vals map[string]any) (int64, error)
}

// ProvisioningService handles Odoo company and user auto-provisioning on sign-up.
type ProvisioningService struct {
	odoo ProvisioningOdooClient
}

// NewProvisioningService creates a new ProvisioningService.
func NewProvisioningService(odoo ProvisioningOdooClient) *ProvisioningService {
	return &ProvisioningService{odoo: odoo}
}

// ProvisionCompany creates a new res.company and res.users record in Odoo.
// Returns the company ID and user ID for the caller to store in the app database.
// If user creation fails after company creation, the error is logged but the company
// record remains (requires manual cleanup).
func (s *ProvisioningService) ProvisionCompany(ctx context.Context, companyName, adminEmail, adminName string) (companyID int64, userID int64, err error) {
	// Create the company
	companyID, err = s.odoo.Create(ctx, "res.company", map[string]any{
		"name": companyName,
	})
	if err != nil {
		return 0, 0, fmt.Errorf("create company %q: %w", companyName, err)
	}

	// Create the admin user with the new company
	userID, err = s.odoo.Create(ctx, "res.users", map[string]any{
		"name":       adminName,
		"login":      adminEmail,
		"email":      adminEmail,
		"company_id": companyID,
	})
	if err != nil {
		// Company was created but user failed -- log for cleanup
		log.Printf("ERROR: provisioning user failed for company %d (%s): %v -- company needs cleanup", companyID, companyName, err)
		return 0, 0, fmt.Errorf("create admin user for company %d: %w", companyID, err)
	}

	return companyID, userID, nil
}

// ProvisionDefaults creates default departments and leave types in Odoo
// for a newly provisioned company.
func (s *ProvisioningService) ProvisionDefaults(ctx context.Context, companyID int64) error {
	// Default departments
	departments := []string{"HR", "Engineering", "Sales", "Finance", "Operations"}
	for _, name := range departments {
		_, err := s.odoo.Create(ctx, "hr.department", map[string]any{
			"name":       name,
			"company_id": companyID,
		})
		if err != nil {
			log.Printf("ERROR: provisioning department %q for company %d: %v", name, companyID, err)
			return fmt.Errorf("create department %q: %w", name, err)
		}
	}

	// Default leave types
	leaveTypes := []struct {
		name string
		code string
	}{
		{"Annual Leave", "ANNUAL"},
		{"Sick Leave", "SICK"},
		{"Unpaid Leave", "UNPAID"},
	}
	for _, lt := range leaveTypes {
		_, err := s.odoo.Create("hr.leave.type", map[string]any{
			"name":       lt.name,
			"code":       lt.code,
			"company_id": companyID,
		})
		if err != nil {
			log.Printf("ERROR: provisioning leave type %q for company %d: %v", lt.name, companyID, err)
			return fmt.Errorf("create leave type %q: %w", lt.name, err)
		}
	}

	return nil
}
