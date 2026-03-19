package odoo

import (
	"context"
	"fmt"
)

// ListEmployeeSkills retrieves hr.employee.skill records for a given employee.
// Returns the skill slice and total count for pagination.
func (c *Client) ListEmployeeSkills(ctx context.Context, employeeID int64, limit, offset int) ([]EmployeeSkill, int, error) {
	domain := []any{[]any{"employee_id", "=", employeeID}}

	count, err := c.SearchCount(ctx, "hr.employee.skill", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list employee skills count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.employee.skill", domain, employeeSkillFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list employee skills: %w", err)
	}

	skills := make([]EmployeeSkill, 0, len(records))
	for _, rec := range records {
		skills = append(skills, parseEmployeeSkill(rec))
	}

	return skills, int(count), nil
}

// CreateEmployeeSkill creates a new hr.employee.skill record in Odoo.
func (c *Client) CreateEmployeeSkill(ctx context.Context, employeeID, skillID, skillLevelID int64) (int64, error) {
	vals := map[string]any{
		"employee_id":    employeeID,
		"skill_id":       skillID,
		"skill_level_id": skillLevelID,
	}

	id, err := c.Create(ctx, "hr.employee.skill", vals)
	if err != nil {
		return 0, fmt.Errorf("create employee skill: %w", err)
	}

	return id, nil
}

// DeleteEmployeeSkill deletes an hr.employee.skill record from Odoo.
func (c *Client) DeleteEmployeeSkill(ctx context.Context, id int64) error {
	if err := c.CallAction(ctx, "hr.employee.skill", []int64{id}, "unlink"); err != nil {
		return fmt.Errorf("delete employee skill %d: %w", id, err)
	}
	return nil
}

// ListSkills retrieves hr.skill records from Odoo with optional domain filters.
// Returns the skill slice and total count for pagination.
func (c *Client) ListSkills(ctx context.Context, domain []any, limit, offset int) ([]Skill, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount(ctx, "hr.skill", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list skills count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.skill", domain, skillFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list skills: %w", err)
	}

	skills := make([]Skill, 0, len(records))
	for _, rec := range records {
		skills = append(skills, Skill{
			ID:          toInt64(rec["id"]),
			Name:        toString(rec["name"]),
			SkillTypeID: parseMany2One(rec["skill_type_id"]),
		})
	}

	return skills, int(count), nil
}

// parseEmployeeSkill converts a raw Odoo record map into an EmployeeSkill struct.
func parseEmployeeSkill(rec map[string]any) EmployeeSkill {
	return EmployeeSkill{
		ID:          toInt64(rec["id"]),
		EmployeeID:  parseMany2One(rec["employee_id"]),
		SkillID:     parseMany2One(rec["skill_id"]),
		SkillTypeID: parseMany2One(rec["skill_type_id"]),
		SkillLevel:  parseMany2One(rec["skill_level_id"]),
	}
}
