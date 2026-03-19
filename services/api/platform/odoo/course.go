package odoo

import (
	"context"
	"fmt"
)

// ListCourses retrieves hr.course records from Odoo with optional domain filters.
func (c *Client) ListCourses(ctx context.Context, domain []any, limit, offset int) ([]Course, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount(ctx, "hr.course", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list courses count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.course", domain, courseFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list courses: %w", err)
	}

	courses := make([]Course, 0, len(records))
	for _, rec := range records {
		courses = append(courses, parseCourse(rec))
	}

	return courses, int(count), nil
}

// GetCourse retrieves a single hr.course by ID.
func (c *Client) GetCourse(ctx context.Context, id int64) (*Course, error) {
	records, err := c.Read(ctx, "hr.course", []int64{id}, courseFields)
	if err != nil {
		return nil, fmt.Errorf("get course %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("course %d not found", id)
	}

	course := parseCourse(records[0])
	return &course, nil
}

// CreateCourse creates a new hr.course record in Odoo.
func (c *Client) CreateCourse(ctx context.Context, req CourseCreateRequest) (int64, error) {
	vals := map[string]any{
		"name":        req.Name,
		"category_id": req.CategoryID,
		"permanence":  req.Permanence,
	}
	if req.Content != "" {
		vals["content"] = req.Content
	}
	if req.Objective != "" {
		vals["objective"] = req.Objective
	}

	id, err := c.Create(ctx, "hr.course", vals)
	if err != nil {
		return 0, fmt.Errorf("create course: %w", err)
	}
	return id, nil
}

// UpdateCourse updates an existing hr.course record.
func (c *Client) UpdateCourse(ctx context.Context, id int64, vals map[string]any) error {
	if err := c.Write(ctx, "hr.course", id, vals); err != nil {
		return fmt.Errorf("update course %d: %w", id, err)
	}
	return nil
}

// ListCourseCategories retrieves hr.course.category records.
func (c *Client) ListCourseCategories(ctx context.Context, limit, offset int) ([]CourseCategory, int, error) {
	count, err := c.SearchCount(ctx, "hr.course.category", []any{})
	if err != nil {
		return nil, 0, fmt.Errorf("list course categories count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.course.category", []any{}, courseCategoryFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list course categories: %w", err)
	}

	categories := make([]CourseCategory, 0, len(records))
	for _, rec := range records {
		categories = append(categories, CourseCategory{
			ID:   toInt64(rec["id"]),
			Name: toString(rec["name"]),
		})
	}

	return categories, int(count), nil
}

// ListCourseSchedules retrieves hr.course.schedule records with optional domain filters.
func (c *Client) ListCourseSchedules(ctx context.Context, domain []any, limit, offset int) ([]CourseSchedule, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount(ctx, "hr.course.schedule", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list course schedules count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.course.schedule", domain, courseScheduleFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list course schedules: %w", err)
	}

	schedules := make([]CourseSchedule, 0, len(records))
	for _, rec := range records {
		schedules = append(schedules, parseCourseSchedule(rec))
	}

	return schedules, int(count), nil
}

// GetCourseSchedule retrieves a single hr.course.schedule by ID.
func (c *Client) GetCourseSchedule(ctx context.Context, id int64) (*CourseSchedule, error) {
	records, err := c.Read(ctx, "hr.course.schedule", []int64{id}, courseScheduleFields)
	if err != nil {
		return nil, fmt.Errorf("get course schedule %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("course schedule %d not found", id)
	}

	schedule := parseCourseSchedule(records[0])
	return &schedule, nil
}

// CreateCourseSchedule creates a new hr.course.schedule record.
func (c *Client) CreateCourseSchedule(ctx context.Context, req CourseScheduleCreateRequest) (int64, error) {
	vals := map[string]any{
		"name":          req.Name,
		"course_id":     req.CourseID,
		"start_date":    req.StartDate,
		"end_date":      req.EndDate,
		"cost":          req.Cost,
		"authorized_by": req.AuthorizedBy,
	}
	if len(req.AttendantIDs) > 0 {
		vals["attendant_ids"] = []any{[]any{6, 0, req.AttendantIDs}}
	}
	if req.Place != "" {
		vals["place"] = req.Place
	}

	id, err := c.Create(ctx, "hr.course.schedule", vals)
	if err != nil {
		return 0, fmt.Errorf("create course schedule: %w", err)
	}
	return id, nil
}

// UpdateCourseSchedule updates an existing hr.course.schedule record.
func (c *Client) UpdateCourseSchedule(ctx context.Context, id int64, vals map[string]any) error {
	if err := c.Write(ctx, "hr.course.schedule", id, vals); err != nil {
		return fmt.Errorf("update course schedule %d: %w", id, err)
	}
	return nil
}

// CourseScheduleDraft2Waiting moves schedule from draft to waiting_attendees state.
func (c *Client) CourseScheduleDraft2Waiting(ctx context.Context, id int64) error {
	return c.CallAction(ctx, "hr.course.schedule", []int64{id}, "draft2waiting")
}

// CourseScheduleWaiting2InProgress moves schedule from waiting_attendees to in_progress.
func (c *Client) CourseScheduleWaiting2InProgress(ctx context.Context, id int64) error {
	return c.CallAction(ctx, "hr.course.schedule", []int64{id}, "waiting2inprogress")
}

// CourseScheduleInProgress2Validation moves schedule from in_progress to in_validation.
func (c *Client) CourseScheduleInProgress2Validation(ctx context.Context, id int64) error {
	return c.CallAction(ctx, "hr.course.schedule", []int64{id}, "inprogress2validation")
}

// CourseScheduleValidation2Complete moves schedule from in_validation to completed.
func (c *Client) CourseScheduleValidation2Complete(ctx context.Context, id int64) error {
	return c.CallAction(ctx, "hr.course.schedule", []int64{id}, "validation2complete")
}

// CourseScheduleBack2Draft moves schedule back to draft state.
func (c *Client) CourseScheduleBack2Draft(ctx context.Context, id int64) error {
	return c.CallAction(ctx, "hr.course.schedule", []int64{id}, "back2draft")
}

// CourseScheduleCancel cancels the course schedule.
func (c *Client) CourseScheduleCancel(ctx context.Context, id int64) error {
	return c.CallAction(ctx, "hr.course.schedule", []int64{id}, "cancel_course")
}

// ListCourseAttendees retrieves hr.course.attendee records for a schedule.
func (c *Client) ListCourseAttendees(ctx context.Context, scheduleID int64, limit, offset int) ([]CourseAttendee, int, error) {
	domain := []any{[]any{"course_schedule_id", "=", scheduleID}}

	count, err := c.SearchCount(ctx, "hr.course.attendee", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list course attendees count: %w", err)
	}

	records, err := c.SearchRead(ctx, "hr.course.attendee", domain, courseAttendeeFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list course attendees: %w", err)
	}

	attendees := make([]CourseAttendee, 0, len(records))
	for _, rec := range records {
		attendees = append(attendees, parseCourseAttendee(rec))
	}

	return attendees, int(count), nil
}

// UpdateCourseAttendeeResult updates the result of a course attendee.
func (c *Client) UpdateCourseAttendeeResult(ctx context.Context, id int64, result string) error {
	if err := c.Write(ctx, "hr.course.attendee", id, map[string]any{"result": result}); err != nil {
		return fmt.Errorf("update course attendee result %d: %w", id, err)
	}
	return nil
}

// parseCourse converts a raw Odoo record map into a Course struct.
func parseCourse(rec map[string]any) Course {
	return Course{
		ID:             toInt64(rec["id"]),
		Name:           toString(rec["name"]),
		CategoryID:     parseMany2One(rec["category_id"]),
		Permanence:     toBool(rec["permanence"]),
		PermanenceTime: toString(rec["permanence_time"]),
		Content:        toString(rec["content"]),
		Objective:      toString(rec["objective"]),
	}
}

// parseCourseSchedule converts a raw Odoo record map into a CourseSchedule struct.
func parseCourseSchedule(rec map[string]any) CourseSchedule {
	return CourseSchedule{
		ID:           toInt64(rec["id"]),
		Name:         toString(rec["name"]),
		CourseID:     parseMany2One(rec["course_id"]),
		StartDate:    toString(rec["start_date"]),
		EndDate:      toString(rec["end_date"]),
		Cost:         toFloat64(rec["cost"]),
		AuthorizedBy: parseMany2One(rec["authorized_by"]),
		State:        toString(rec["state"]),
		AttendantIDs: toInt64Slice(rec["attendant_ids"]),
		Place:        toString(rec["place"]),
	}
}

// parseCourseAttendee converts a raw Odoo record map into a CourseAttendee struct.
func parseCourseAttendee(rec map[string]any) CourseAttendee {
	return CourseAttendee{
		ID:               toInt64(rec["id"]),
		CourseScheduleID: parseMany2One(rec["course_schedule_id"]),
		EmployeeID:       parseMany2One(rec["employee_id"]),
		Result:           toString(rec["result"]),
		Active:           toBool(rec["active"]),
	}
}
