package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockCourseService struct {
	listCoursesFunc      func(ctx context.Context, categoryID int64, limit, offset int) ([]odoo.Course, int, error)
	getCourseFunc        func(ctx context.Context, id int64) (*odoo.Course, error)
	createCourseFunc     func(ctx context.Context, req odoo.CourseCreateRequest) (int64, error)
	updateCourseFunc     func(ctx context.Context, id int64, vals map[string]any) error
	listCategoriesFunc   func(ctx context.Context, limit, offset int) ([]odoo.CourseCategory, int, error)
	listSchedulesFunc    func(ctx context.Context, courseID int64, state string, limit, offset int) ([]odoo.CourseSchedule, int, error)
	getScheduleFunc      func(ctx context.Context, id int64) (*odoo.CourseSchedule, error)
	createScheduleFunc   func(ctx context.Context, req odoo.CourseScheduleCreateRequest) (int64, error)
	updateScheduleFunc   func(ctx context.Context, id int64, vals map[string]any) error
	advanceScheduleFunc  func(ctx context.Context, id int64, currentState string) error
	resetScheduleFunc    func(ctx context.Context, id int64) error
	cancelScheduleFunc   func(ctx context.Context, id int64) error
	listAttendeesFunc    func(ctx context.Context, scheduleID int64, limit, offset int) ([]odoo.CourseAttendee, int, error)
	updateAttendeeResFunc func(ctx context.Context, id int64, result string) error
}

func (m *mockCourseService) ListCourses(ctx context.Context, categoryID int64, limit, offset int) ([]odoo.Course, int, error) {
	if m.listCoursesFunc != nil {
		return m.listCoursesFunc(ctx, categoryID, limit, offset)
	}
	return []odoo.Course{}, 0, nil
}

func (m *mockCourseService) GetCourse(ctx context.Context, id int64) (*odoo.Course, error) {
	if m.getCourseFunc != nil {
		return m.getCourseFunc(ctx, id)
	}
	return &odoo.Course{ID: id}, nil
}

func (m *mockCourseService) CreateCourse(ctx context.Context, req odoo.CourseCreateRequest) (int64, error) {
	if m.createCourseFunc != nil {
		return m.createCourseFunc(ctx, req)
	}
	return 1, nil
}

func (m *mockCourseService) UpdateCourse(ctx context.Context, id int64, vals map[string]any) error {
	if m.updateCourseFunc != nil {
		return m.updateCourseFunc(ctx, id, vals)
	}
	return nil
}

func (m *mockCourseService) ListCategories(ctx context.Context, limit, offset int) ([]odoo.CourseCategory, int, error) {
	if m.listCategoriesFunc != nil {
		return m.listCategoriesFunc(ctx, limit, offset)
	}
	return []odoo.CourseCategory{}, 0, nil
}

func (m *mockCourseService) ListSchedules(ctx context.Context, courseID int64, state string, limit, offset int) ([]odoo.CourseSchedule, int, error) {
	if m.listSchedulesFunc != nil {
		return m.listSchedulesFunc(ctx, courseID, state, limit, offset)
	}
	return []odoo.CourseSchedule{}, 0, nil
}

func (m *mockCourseService) GetSchedule(ctx context.Context, id int64) (*odoo.CourseSchedule, error) {
	if m.getScheduleFunc != nil {
		return m.getScheduleFunc(ctx, id)
	}
	return &odoo.CourseSchedule{ID: id, State: "draft"}, nil
}

func (m *mockCourseService) CreateSchedule(ctx context.Context, req odoo.CourseScheduleCreateRequest) (int64, error) {
	if m.createScheduleFunc != nil {
		return m.createScheduleFunc(ctx, req)
	}
	return 1, nil
}

func (m *mockCourseService) UpdateSchedule(ctx context.Context, id int64, vals map[string]any) error {
	if m.updateScheduleFunc != nil {
		return m.updateScheduleFunc(ctx, id, vals)
	}
	return nil
}

func (m *mockCourseService) AdvanceSchedule(ctx context.Context, id int64, currentState string) error {
	if m.advanceScheduleFunc != nil {
		return m.advanceScheduleFunc(ctx, id, currentState)
	}
	return nil
}

func (m *mockCourseService) ResetSchedule(ctx context.Context, id int64) error {
	if m.resetScheduleFunc != nil {
		return m.resetScheduleFunc(ctx, id)
	}
	return nil
}

func (m *mockCourseService) CancelSchedule(ctx context.Context, id int64) error {
	if m.cancelScheduleFunc != nil {
		return m.cancelScheduleFunc(ctx, id)
	}
	return nil
}

func (m *mockCourseService) ListAttendees(ctx context.Context, scheduleID int64, limit, offset int) ([]odoo.CourseAttendee, int, error) {
	if m.listAttendeesFunc != nil {
		return m.listAttendeesFunc(ctx, scheduleID, limit, offset)
	}
	return []odoo.CourseAttendee{}, 0, nil
}

func (m *mockCourseService) UpdateAttendeeResult(ctx context.Context, id int64, result string) error {
	if m.updateAttendeeResFunc != nil {
		return m.updateAttendeeResFunc(ctx, id, result)
	}
	return nil
}

func setupCourseRouter(mock *mockCourseService) http.Handler {
	h := NewCourseHandler(mock)
	r := chi.NewRouter()
	r.Get("/courses", h.HandleListCourses)
	r.Get("/courses/categories", h.HandleListCategories)
	r.Get("/courses/{id}", h.HandleGetCourse)
	r.Post("/courses", h.HandleCreateCourse)
	r.Put("/courses/{id}", h.HandleUpdateCourse)
	r.Get("/courses/schedules", h.HandleListSchedules)
	r.Get("/courses/schedules/{id}", h.HandleGetSchedule)
	r.Post("/courses/schedules", h.HandleCreateSchedule)
	r.Post("/courses/schedules/{id}/advance", h.HandleAdvanceSchedule)
	r.Post("/courses/schedules/{id}/reset", h.HandleResetSchedule)
	r.Post("/courses/schedules/{id}/cancel", h.HandleCancelSchedule)
	r.Get("/courses/schedules/{id}/attendees", h.HandleListAttendees)
	r.Patch("/courses/attendees/{id}", h.HandleUpdateAttendeeResult)
	return r
}

func TestCourseHandler_HandleListCourses_Success(t *testing.T) {
	mock := &mockCourseService{
		listCoursesFunc: func(ctx context.Context, categoryID int64, limit, offset int) ([]odoo.Course, int, error) {
			return []odoo.Course{{ID: 1, Name: "Go Fundamentals"}}, 1, nil
		},
	}

	router := setupCourseRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/courses", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
}

func TestCourseHandler_HandleListCourses_ServiceUnavailable(t *testing.T) {
	mock := &mockCourseService{
		listCoursesFunc: func(ctx context.Context, categoryID int64, limit, offset int) ([]odoo.Course, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupCourseRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/courses", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
}

func TestCourseHandler_HandleGetCourse_InvalidID(t *testing.T) {
	mock := &mockCourseService{}
	router := setupCourseRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/courses/abc", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestCourseHandler_HandleCreateCourse_InvalidJSON(t *testing.T) {
	mock := &mockCourseService{}
	router := setupCourseRouter(mock)

	req := testutil.NewTestRequest(http.MethodPost, "/courses", "{bad")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
}

func TestCourseHandler_HandleCreateCourse_MissingName(t *testing.T) {
	mock := &mockCourseService{}
	router := setupCourseRouter(mock)

	body := map[string]any{"category_id": 1}
	req := testutil.NewTestRequest(http.MethodPost, "/courses", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "validation_error")
}

func TestCourseHandler_HandleCreateCourse_MissingCategoryID(t *testing.T) {
	mock := &mockCourseService{}
	router := setupCourseRouter(mock)

	body := map[string]any{"name": "Test Course"}
	req := testutil.NewTestRequest(http.MethodPost, "/courses", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "validation_error")
}

func TestCourseHandler_HandleCreateCourse_Success(t *testing.T) {
	mock := &mockCourseService{
		createCourseFunc: func(ctx context.Context, req odoo.CourseCreateRequest) (int64, error) {
			return 42, nil
		},
	}

	router := setupCourseRouter(mock)
	body := map[string]any{"name": "New Course", "category_id": 1}
	req := testutil.NewTestRequest(http.MethodPost, "/courses", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusCreated)
}

func TestCourseHandler_HandleListCategories_Success(t *testing.T) {
	mock := &mockCourseService{
		listCategoriesFunc: func(ctx context.Context, limit, offset int) ([]odoo.CourseCategory, int, error) {
			return []odoo.CourseCategory{{ID: 1, Name: "Technical"}}, 1, nil
		},
	}

	router := setupCourseRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/courses/categories", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestCourseHandler_HandleCreateSchedule_MissingFields(t *testing.T) {
	mock := &mockCourseService{}
	router := setupCourseRouter(mock)

	body := map[string]any{"name": "Q1 Session"}
	req := testutil.NewTestRequest(http.MethodPost, "/courses/schedules", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "validation_error")
}

func TestCourseHandler_HandleAdvanceSchedule_Success(t *testing.T) {
	mock := &mockCourseService{
		getScheduleFunc: func(ctx context.Context, id int64) (*odoo.CourseSchedule, error) {
			return &odoo.CourseSchedule{ID: id, State: "draft"}, nil
		},
		advanceScheduleFunc: func(ctx context.Context, id int64, currentState string) error {
			return nil
		},
	}

	router := setupCourseRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/courses/schedules/1/advance", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestCourseHandler_HandleResetSchedule_Success(t *testing.T) {
	mock := &mockCourseService{
		resetScheduleFunc: func(ctx context.Context, id int64) error {
			return nil
		},
	}

	router := setupCourseRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/courses/schedules/1/reset", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestCourseHandler_HandleCancelSchedule_Success(t *testing.T) {
	mock := &mockCourseService{
		cancelScheduleFunc: func(ctx context.Context, id int64) error {
			return nil
		},
	}

	router := setupCourseRouter(mock)
	req := httptest.NewRequest(http.MethodPost, "/courses/schedules/1/cancel", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestCourseHandler_HandleUpdateAttendeeResult_MissingResult(t *testing.T) {
	mock := &mockCourseService{}
	router := setupCourseRouter(mock)

	body := map[string]any{}
	req := testutil.NewTestRequest(http.MethodPatch, "/courses/attendees/1", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "validation_error")
}

func TestCourseHandler_HandleUpdateAttendeeResult_Success(t *testing.T) {
	mock := &mockCourseService{
		updateAttendeeResFunc: func(ctx context.Context, id int64, result string) error {
			return nil
		},
	}

	router := setupCourseRouter(mock)
	body := map[string]any{"result": "passed"}
	req := testutil.NewTestRequest(http.MethodPatch, "/courses/attendees/1", body)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}
