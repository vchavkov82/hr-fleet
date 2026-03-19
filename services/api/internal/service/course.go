package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// CourseOdooClient defines the Odoo interface for course operations.
type CourseOdooClient interface {
	ListCourses(ctx context.Context, domain []any, limit, offset int) ([]odoo.Course, int, error)
	GetCourse(ctx context.Context, id int64) (*odoo.Course, error)
	CreateCourse(ctx context.Context, req odoo.CourseCreateRequest) (int64, error)
	UpdateCourse(ctx context.Context, id int64, vals map[string]any) error
	ListCourseCategories(ctx context.Context, limit, offset int) ([]odoo.CourseCategory, int, error)
	ListCourseSchedules(ctx context.Context, domain []any, limit, offset int) ([]odoo.CourseSchedule, int, error)
	GetCourseSchedule(ctx context.Context, id int64) (*odoo.CourseSchedule, error)
	CreateCourseSchedule(ctx context.Context, req odoo.CourseScheduleCreateRequest) (int64, error)
	UpdateCourseSchedule(ctx context.Context, id int64, vals map[string]any) error
	CourseScheduleDraft2Waiting(ctx context.Context, id int64) error
	CourseScheduleWaiting2InProgress(ctx context.Context, id int64) error
	CourseScheduleInProgress2Validation(ctx context.Context, id int64) error
	CourseScheduleValidation2Complete(ctx context.Context, id int64) error
	CourseScheduleBack2Draft(ctx context.Context, id int64) error
	CourseScheduleCancel(ctx context.Context, id int64) error
	ListCourseAttendees(ctx context.Context, scheduleID int64, limit, offset int) ([]odoo.CourseAttendee, int, error)
	UpdateCourseAttendeeResult(ctx context.Context, id int64, result string) error
	Healthy() error
}

// CourseService provides business logic for course operations.
type CourseService struct {
	odoo  CourseOdooClient
	cache *cache.Cache
}

// NewCourseService creates a new CourseService.
func NewCourseService(odoo CourseOdooClient, cache *cache.Cache) *CourseService {
	return &CourseService{odoo: odoo, cache: cache}
}

// ListCourses retrieves courses with optional filters.
func (s *CourseService) ListCourses(ctx context.Context, categoryID int64, limit, offset int) ([]odoo.Course, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	domain := []any{}
	if categoryID > 0 {
		domain = append(domain, []any{"category_id", "=", categoryID})
	}

	courses, total, err := s.odoo.ListCourses(ctx, domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list courses: %w", err)
	}
	return courses, total, nil
}

// GetCourse retrieves a single course by ID.
func (s *CourseService) GetCourse(ctx context.Context, id int64) (*odoo.Course, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, ErrServiceUnavailable
	}

	course, err := s.odoo.GetCourse(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get course: %w", err)
	}
	return course, nil
}

// CreateCourse creates a new course.
func (s *CourseService) CreateCourse(ctx context.Context, req odoo.CourseCreateRequest) (int64, error) {
	if err := s.odoo.Healthy(); err != nil {
		return 0, ErrServiceUnavailable
	}

	id, err := s.odoo.CreateCourse(ctx, req)
	if err != nil {
		return 0, fmt.Errorf("create course: %w", err)
	}
	return id, nil
}

// UpdateCourse updates an existing course.
func (s *CourseService) UpdateCourse(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.UpdateCourse(ctx, id, vals); err != nil {
		return fmt.Errorf("update course: %w", err)
	}
	return nil
}

// ListCategories retrieves available course categories.
func (s *CourseService) ListCategories(ctx context.Context, limit, offset int) ([]odoo.CourseCategory, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	categories, total, err := s.odoo.ListCourseCategories(ctx, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list course categories: %w", err)
	}
	return categories, total, nil
}

// ListSchedules retrieves course schedules with optional filters.
func (s *CourseService) ListSchedules(ctx context.Context, courseID int64, state string, limit, offset int) ([]odoo.CourseSchedule, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	domain := []any{}
	if courseID > 0 {
		domain = append(domain, []any{"course_id", "=", courseID})
	}
	if state != "" {
		domain = append(domain, []any{"state", "=", state})
	}

	schedules, total, err := s.odoo.ListCourseSchedules(ctx, domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list course schedules: %w", err)
	}
	return schedules, total, nil
}

// GetSchedule retrieves a single course schedule by ID.
func (s *CourseService) GetSchedule(ctx context.Context, id int64) (*odoo.CourseSchedule, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, ErrServiceUnavailable
	}

	schedule, err := s.odoo.GetCourseSchedule(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get course schedule: %w", err)
	}
	return schedule, nil
}

// CreateSchedule creates a new course schedule.
func (s *CourseService) CreateSchedule(ctx context.Context, req odoo.CourseScheduleCreateRequest) (int64, error) {
	if err := s.odoo.Healthy(); err != nil {
		return 0, ErrServiceUnavailable
	}

	id, err := s.odoo.CreateCourseSchedule(ctx, req)
	if err != nil {
		return 0, fmt.Errorf("create course schedule: %w", err)
	}
	return id, nil
}

// UpdateSchedule updates an existing course schedule.
func (s *CourseService) UpdateSchedule(ctx context.Context, id int64, vals map[string]any) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.UpdateCourseSchedule(ctx, id, vals); err != nil {
		return fmt.Errorf("update course schedule: %w", err)
	}
	return nil
}

// AdvanceSchedule moves the schedule to the next state.
func (s *CourseService) AdvanceSchedule(ctx context.Context, id int64, currentState string) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	var err error
	switch currentState {
	case "draft":
		err = s.odoo.CourseScheduleDraft2Waiting(ctx, id)
	case "waiting_attendees":
		err = s.odoo.CourseScheduleWaiting2InProgress(ctx, id)
	case "in_progress":
		err = s.odoo.CourseScheduleInProgress2Validation(ctx, id)
	case "in_validation":
		err = s.odoo.CourseScheduleValidation2Complete(ctx, id)
	default:
		return fmt.Errorf("cannot advance from state: %s", currentState)
	}

	if err != nil {
		return fmt.Errorf("advance schedule: %w", err)
	}
	return nil
}

// ResetSchedule moves the schedule back to draft state.
func (s *CourseService) ResetSchedule(ctx context.Context, id int64) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.CourseScheduleBack2Draft(ctx, id); err != nil {
		return fmt.Errorf("reset schedule: %w", err)
	}
	return nil
}

// CancelSchedule cancels the course schedule.
func (s *CourseService) CancelSchedule(ctx context.Context, id int64) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	if err := s.odoo.CourseScheduleCancel(ctx, id); err != nil {
		return fmt.Errorf("cancel schedule: %w", err)
	}
	return nil
}

// ListAttendees retrieves attendees for a course schedule.
func (s *CourseService) ListAttendees(ctx context.Context, scheduleID int64, limit, offset int) ([]odoo.CourseAttendee, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	attendees, total, err := s.odoo.ListCourseAttendees(ctx, scheduleID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list course attendees: %w", err)
	}
	return attendees, total, nil
}

// UpdateAttendeeResult updates an attendee's result.
func (s *CourseService) UpdateAttendeeResult(ctx context.Context, id int64, result string) error {
	if err := s.odoo.Healthy(); err != nil {
		return ErrServiceUnavailable
	}

	validResults := map[string]bool{"passed": true, "failed": true, "absent": true, "pending": true}
	if !validResults[result] {
		return fmt.Errorf("invalid result: %s", result)
	}

	if err := s.odoo.UpdateCourseAttendeeResult(ctx, id, result); err != nil {
		return fmt.Errorf("update attendee result: %w", err)
	}
	return nil
}
