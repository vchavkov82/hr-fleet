package odoo

import "fmt"

// ListProjects retrieves project.project records from Odoo with optional domain filters.
func (c *Client) ListProjects(domain []any, limit, offset int) ([]Project, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("project.project", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list projects count: %w", err)
	}

	records, err := c.SearchRead("project.project", domain, projectFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list projects: %w", err)
	}

	projects := make([]Project, 0, len(records))
	for _, rec := range records {
		projects = append(projects, parseProject(rec))
	}

	return projects, int(count), nil
}

// GetProject retrieves a single project.project by ID.
func (c *Client) GetProject(id int64) (*Project, error) {
	records, err := c.Read("project.project", []int64{id}, projectFields)
	if err != nil {
		return nil, fmt.Errorf("get project %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("project %d not found", id)
	}

	p := parseProject(records[0])
	return &p, nil
}

// ListProjectTasks retrieves project.task records for a project.
func (c *Client) ListProjectTasks(projectID int64, limit, offset int) ([]ProjectTask, int, error) {
	domain := []any{}
	if projectID > 0 {
		domain = append(domain, []any{"project_id", "=", projectID})
	}

	count, err := c.SearchCount("project.task", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list project tasks count: %w", err)
	}

	records, err := c.SearchRead("project.task", domain, projectTaskFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list project tasks: %w", err)
	}

	tasks := make([]ProjectTask, 0, len(records))
	for _, rec := range records {
		tasks = append(tasks, parseProjectTask(rec))
	}

	return tasks, int(count), nil
}

// GetProjectTask retrieves a single project.task by ID.
func (c *Client) GetProjectTask(id int64) (*ProjectTask, error) {
	records, err := c.Read("project.task", []int64{id}, projectTaskFields)
	if err != nil {
		return nil, fmt.Errorf("get project task %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("project task %d not found", id)
	}

	t := parseProjectTask(records[0])
	return &t, nil
}

// parseProject converts a raw Odoo record map into a Project struct.
func parseProject(rec map[string]any) Project {
	return Project{
		ID:          toInt64(rec["id"]),
		Name:        toString(rec["name"]),
		Active:      toBool(rec["active"]),
		PartnerID:   parseMany2One(rec["partner_id"]),
		UserID:      parseMany2One(rec["user_id"]),
		DateStart:   toString(rec["date_start"]),
		Date:        toString(rec["date"]),
		Description: toString(rec["description"]),
		TaskCount:   toInt64(rec["task_count"]),
		CompanyID:   parseMany2One(rec["company_id"]),
	}
}

// parseProjectTask converts a raw Odoo record map into a ProjectTask struct.
func parseProjectTask(rec map[string]any) ProjectTask {
	return ProjectTask{
		ID:             toInt64(rec["id"]),
		Name:           toString(rec["name"]),
		ProjectID:      parseMany2One(rec["project_id"]),
		UserIDs:        toInt64Slice(rec["user_ids"]),
		StageID:        parseMany2One(rec["stage_id"]),
		DateDeadline:   toString(rec["date_deadline"]),
		Description:    toString(rec["description"]),
		Priority:       toString(rec["priority"]),
		State:          toString(rec["state"]),
		PlannedHours:   toFloat64(rec["planned_hours"]),
		EffectiveHours: toFloat64(rec["effective_hours"]),
	}
}
