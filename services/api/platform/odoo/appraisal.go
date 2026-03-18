package odoo

import "fmt"

// ListAppraisals retrieves hr.appraisal records from Odoo with optional domain filters.
func (c *Client) ListAppraisals(domain []any, limit, offset int) ([]Appraisal, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount("hr.appraisal", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list appraisals count: %w", err)
	}

	records, err := c.SearchRead("hr.appraisal", domain, appraisalFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list appraisals: %w", err)
	}

	appraisals := make([]Appraisal, 0, len(records))
	for _, rec := range records {
		appraisals = append(appraisals, parseAppraisal(rec))
	}

	return appraisals, int(count), nil
}

// GetAppraisal retrieves a single hr.appraisal by ID.
func (c *Client) GetAppraisal(id int64) (*Appraisal, error) {
	records, err := c.Read("hr.appraisal", []int64{id}, appraisalFields)
	if err != nil {
		return nil, fmt.Errorf("get appraisal %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("appraisal %d not found", id)
	}

	a := parseAppraisal(records[0])
	return &a, nil
}

// CreateAppraisal creates a new hr.appraisal record in Odoo.
func (c *Client) CreateAppraisal(req AppraisalCreateRequest) (int64, error) {
	vals := map[string]any{
		"employee_id": req.EmployeeID,
		"date_close":  req.DateClose,
	}
	if req.TemplateID > 0 {
		vals["appraisal_template_id"] = req.TemplateID
	}

	id, err := c.Create("hr.appraisal", vals)
	if err != nil {
		return 0, fmt.Errorf("create appraisal: %w", err)
	}
	return id, nil
}

// UpdateAppraisal updates an existing hr.appraisal record.
func (c *Client) UpdateAppraisal(id int64, vals map[string]any) error {
	if err := c.Write("hr.appraisal", id, vals); err != nil {
		return fmt.Errorf("update appraisal %d: %w", id, err)
	}
	return nil
}

// ConfirmAppraisal triggers action_confirm on an hr.appraisal record.
func (c *Client) ConfirmAppraisal(id int64) error {
	return c.CallAction("hr.appraisal", []int64{id}, "action_confirm")
}

// CompleteAppraisal triggers action_done on an hr.appraisal record.
func (c *Client) CompleteAppraisal(id int64) error {
	return c.CallAction("hr.appraisal", []int64{id}, "action_done")
}

// ResetAppraisal triggers action_back on an hr.appraisal record.
func (c *Client) ResetAppraisal(id int64) error {
	return c.CallAction("hr.appraisal", []int64{id}, "action_back")
}

// ListAppraisalTemplates retrieves hr.appraisal.template records.
func (c *Client) ListAppraisalTemplates(limit, offset int) ([]AppraisalTemplate, int, error) {
	count, err := c.SearchCount("hr.appraisal.template", []any{})
	if err != nil {
		return nil, 0, fmt.Errorf("list appraisal templates count: %w", err)
	}

	records, err := c.SearchRead("hr.appraisal.template", []any{}, appraisalTemplateFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list appraisal templates: %w", err)
	}

	templates := make([]AppraisalTemplate, 0, len(records))
	for _, rec := range records {
		templates = append(templates, parseAppraisalTemplate(rec))
	}

	return templates, int(count), nil
}

// parseAppraisal converts a raw Odoo record map into an Appraisal struct.
func parseAppraisal(rec map[string]any) Appraisal {
	return Appraisal{
		ID:                        toInt64(rec["id"]),
		EmployeeID:                parseMany2One(rec["employee_id"]),
		ManagerIDs:                toInt64Slice(rec["manager_ids"]),
		DateClose:                 toString(rec["date_close"]),
		State:                     toString(rec["state"]),
		EmployeeFeedback:          toString(rec["employee_feedback"]),
		ManagerFeedback:           toString(rec["manager_feedback"]),
		EmployeeFeedbackPublished: toBool(rec["employee_feedback_published"]),
		ManagerFeedbackPublished:  toBool(rec["manager_feedback_published"]),
		DepartmentID:              parseMany2One(rec["department_id"]),
		JobID:                     parseMany2One(rec["job_id"]),
		TemplateID:                parseMany2One(rec["appraisal_template_id"]),
		Note:                      toString(rec["note"]),
		CreateDate:                toString(rec["create_date"]),
		WriteDate:                 toString(rec["write_date"]),
	}
}

// parseAppraisalTemplate converts a raw Odoo record map into an AppraisalTemplate struct.
func parseAppraisalTemplate(rec map[string]any) AppraisalTemplate {
	return AppraisalTemplate{
		ID:                   toInt64(rec["id"]),
		Description:          toString(rec["description"]),
		CompanyID:            parseMany2One(rec["company_id"]),
		EmployeeFeedbackTmpl: toString(rec["appraisal_employee_feedback_template"]),
		ManagerFeedbackTmpl:  toString(rec["appraisal_manager_feedback_template"]),
	}
}

