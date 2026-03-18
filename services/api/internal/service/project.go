package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// ProjectOdooClient defines the Odoo interface for project operations.
type ProjectOdooClient interface {
	ListProjects(domain []any, limit, offset int) ([]odoo.Project, int, error)
	GetProject(id int64) (*odoo.Project, error)
	ListProjectTasks(projectID int64, limit, offset int) ([]odoo.ProjectTask, int, error)
	GetProjectTask(id int64) (*odoo.ProjectTask, error)
	Healthy() error
}

// ProjectService provides business logic for project operations.
type ProjectService struct {
	odoo  ProjectOdooClient
	cache *cache.Cache
}

// NewProjectService creates a new ProjectService.
func NewProjectService(odoo ProjectOdooClient, cache *cache.Cache) *ProjectService {
	return &ProjectService{odoo: odoo, cache: cache}
}

// ListProjects retrieves projects with optional filters.
func (s *ProjectService) ListProjects(ctx context.Context, active *bool, limit, offset int) ([]odoo.Project, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	domain := []any{}
	if active != nil {
		domain = append(domain, []any{"active", "=", *active})
	}

	projects, total, err := s.odoo.ListProjects(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list projects: %w", err)
	}
	return projects, total, nil
}

// GetProject retrieves a single project by ID.
func (s *ProjectService) GetProject(ctx context.Context, id int64) (*odoo.Project, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, ErrServiceUnavailable
	}

	project, err := s.odoo.GetProject(id)
	if err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	return project, nil
}

// ListTasks retrieves tasks for a project.
func (s *ProjectService) ListTasks(ctx context.Context, projectID int64, limit, offset int) ([]odoo.ProjectTask, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	tasks, total, err := s.odoo.ListProjectTasks(projectID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list project tasks: %w", err)
	}
	return tasks, total, nil
}

// GetTask retrieves a single task by ID.
func (s *ProjectService) GetTask(ctx context.Context, id int64) (*odoo.ProjectTask, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, ErrServiceUnavailable
	}

	task, err := s.odoo.GetProjectTask(id)
	if err != nil {
		return nil, fmt.Errorf("get project task: %w", err)
	}
	return task, nil
}
