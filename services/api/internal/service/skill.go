package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// SkillOdooClient defines the Odoo interface for skill operations.
type SkillOdooClient interface {
	ListEmployeeSkills(employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error)
	CreateEmployeeSkill(employeeID, skillID, skillLevelID int64) (int64, error)
	ListSkills(domain []any, limit, offset int) ([]odoo.Skill, int, error)
	DeleteEmployeeSkill(id int64) error
}

// SkillService provides business logic for employee skill operations.
type SkillService struct {
	odoo  SkillOdooClient
	cache *cache.Cache
}

// NewSkillService creates a new SkillService.
func NewSkillService(odoo SkillOdooClient, cache *cache.Cache) *SkillService {
	return &SkillService{odoo: odoo, cache: cache}
}

// ListEmployeeSkills retrieves skills for a specific employee.
func (s *SkillService) ListEmployeeSkills(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.EmployeeSkill, int, error) {
	skills, total, err := s.odoo.ListEmployeeSkills(employeeID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list employee skills: %w", err)
	}
	return skills, total, nil
}

// AddEmployeeSkill adds a skill to an employee.
func (s *SkillService) AddEmployeeSkill(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error) {
	id, err := s.odoo.CreateEmployeeSkill(employeeID, skillID, skillLevelID)
	if err != nil {
		return 0, fmt.Errorf("add employee skill: %w", err)
	}
	return id, nil
}

// DeleteEmployeeSkill deletes an employee skill record.
func (s *SkillService) DeleteEmployeeSkill(ctx context.Context, id int64) error {
	if err := s.odoo.DeleteEmployeeSkill(id); err != nil {
		return fmt.Errorf("delete employee skill %d: %w", id, err)
	}
	return nil
}

// ListSkills retrieves all available skills.
func (s *SkillService) ListSkills(ctx context.Context, limit, offset int) ([]odoo.Skill, int, error) {
	skills, total, err := s.odoo.ListSkills(nil, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list skills: %w", err)
	}
	return skills, total, nil
}
