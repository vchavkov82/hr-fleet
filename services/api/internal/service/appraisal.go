package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// AppraisalOdooClient defines the Odoo interface for appraisal operations.
type AppraisalOdooClient interface {
	ListAppraisals(domain []any, limit, offset int) ([]odoo.Appraisal, int, error)
	GetAppraisal(id int64) (*odoo.Appraisal, error)
	CreateAppraisal(req odoo.AppraisalCreateRequest) (int64, error)
	UpdateAppraisal(id int64, vals map[string]any) error
	ConfirmAppraisal(id int64) error
	CompleteAppraisal(id int64) error
	ResetAppraisal(id int64) error
	ListAppraisalTemplates(limit, offset int) ([]odoo.AppraisalTemplate, int, error)
	Healthy() error
}

// AppraisalService provides business logic for appraisal operations.
type AppraisalService struct {
	odoo  AppraisalOdooClient
	cache *cache.Cache
}

// NewAppraisalService creates a new AppraisalService.
func NewAppraisalService(odoo AppraisalOdooClient, cache *cache.Cache) *AppraisalService {
	return &AppraisalService{odoo: odoo, cache: cache}
}

// ListAppraisals retrieves appraisals with optional filters.
func (s *AppraisalService) ListAppraisals(ctx context.Context, employeeID int64, state string, limit, offset int) ([]odoo.Appraisal, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	domain := []any{}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}
	if state != "" {
		domain = append(domain, []any{"state", "=", state})
	}

	appraisals, total, err := s.odoo.ListAppraisals(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list appraisals: %w", err)
	}
	return appraisals, total, nil
}

// GetAppraisal retrieves a single appraisal by ID.
func (s *AppraisalService) GetAppraisal(ctx context.Context, id int64) (*odoo.Appraisal, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, ErrServiceUnavailable
	}

	appraisal, err := s.odoo.GetAppraisal(id)
	if err != nil {
		return nil, fmt.Errorf("get appraisal: %w", err)
	}
	return appraisal, nil
}

// CreateAppraisal creates a new appraisal.
func (s *AppraisalService) CreateAppraisal(ctx context.Context, req odoo.AppraisalCreateRequest) (int64, error) {
	if err := s.odoo.Healthy(); err != nil {
		return 0, ErrServiceUnavailable
	}

	id, err := s.odoo.CreateAppraisal(req)
	if err != nil {
		return 0, fmt.Errorf("create appraisal: %w", err)
	}
	return id, nil
}

// UpdateAppraisal updates an existing appraisal.
func (s *AppraisalService) UpdateAppraisal(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.UpdateAppraisal(id, vals); err != nil {
		return fmt.Errorf("update appraisal: %w", err)
	}
	return nil
}

// ConfirmAppraisal sends the appraisal to the employee for feedback.
func (s *AppraisalService) ConfirmAppraisal(ctx context.Context, id int64) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.ConfirmAppraisal(id); err != nil {
		return fmt.Errorf("confirm appraisal: %w", err)
	}
	return nil
}

// CompleteAppraisal marks the appraisal as done.
func (s *AppraisalService) CompleteAppraisal(ctx context.Context, id int64) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.CompleteAppraisal(id); err != nil {
		return fmt.Errorf("complete appraisal: %w", err)
	}
	return nil
}

// ResetAppraisal resets the appraisal back to draft state.
func (s *AppraisalService) ResetAppraisal(ctx context.Context, id int64) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.ResetAppraisal(id); err != nil {
		return fmt.Errorf("reset appraisal: %w", err)
	}
	return nil
}

// ListTemplates retrieves available appraisal templates.
func (s *AppraisalService) ListTemplates(ctx context.Context, limit, offset int) ([]odoo.AppraisalTemplate, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	templates, total, err := s.odoo.ListAppraisalTemplates(limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list appraisal templates: %w", err)
	}
	return templates, total, nil
}
