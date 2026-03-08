package service

import (
	"context"
	"errors"
	"testing"
)

// mockProvisioningOdoo implements ProvisioningOdooClient for testing.
type mockProvisioningOdoo struct {
	createFunc func(model string, vals map[string]any) (int64, error)
}

func (m *mockProvisioningOdoo) Create(model string, vals map[string]any) (int64, error) {
	if m.createFunc != nil {
		return m.createFunc(model, vals)
	}
	return 0, nil
}

func TestProvisionCompany_Success(t *testing.T) {
	callOrder := []string{}
	mock := &mockProvisioningOdoo{
		createFunc: func(model string, vals map[string]any) (int64, error) {
			callOrder = append(callOrder, model)
			switch model {
			case "res.company":
				return 10, nil
			case "res.users":
				return 20, nil
			default:
				return 0, nil
			}
		},
	}

	svc := NewProvisioningService(mock)
	companyID, userID, err := svc.ProvisionCompany(context.Background(), "Test Corp", "admin@test.com", "Admin")

	if err != nil {
		t.Fatalf("ProvisionCompany: %v", err)
	}
	if companyID != 10 {
		t.Errorf("companyID = %d, want 10", companyID)
	}
	if userID != 20 {
		t.Errorf("userID = %d, want 20", userID)
	}
	if len(callOrder) != 2 || callOrder[0] != "res.company" || callOrder[1] != "res.users" {
		t.Errorf("call order = %v, want [res.company, res.users]", callOrder)
	}
}

func TestProvisionCompany_CompanyCreationFails(t *testing.T) {
	mock := &mockProvisioningOdoo{
		createFunc: func(model string, vals map[string]any) (int64, error) {
			if model == "res.company" {
				return 0, errors.New("odoo error: company creation failed")
			}
			return 0, nil
		},
	}

	svc := NewProvisioningService(mock)
	_, _, err := svc.ProvisionCompany(context.Background(), "Test Corp", "admin@test.com", "Admin")

	if err == nil {
		t.Fatal("expected error when company creation fails")
	}
}

func TestProvisionCompany_UserCreationFails(t *testing.T) {
	mock := &mockProvisioningOdoo{
		createFunc: func(model string, vals map[string]any) (int64, error) {
			if model == "res.company" {
				return 10, nil
			}
			if model == "res.users" {
				return 0, errors.New("odoo error: user creation failed")
			}
			return 0, nil
		},
	}

	svc := NewProvisioningService(mock)
	_, _, err := svc.ProvisionCompany(context.Background(), "Test Corp", "admin@test.com", "Admin")

	if err == nil {
		t.Fatal("expected error when user creation fails after company created")
	}
}
