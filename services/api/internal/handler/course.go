package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// CourseServicer defines the interface the handler needs from the service layer.
type CourseServicer interface {
	ListCourses(ctx context.Context, categoryID int64, limit, offset int) ([]odoo.Course, int, error)
	GetCourse(ctx context.Context, id int64) (*odoo.Course, error)
	CreateCourse(ctx context.Context, req odoo.CourseCreateRequest) (int64, error)
	UpdateCourse(ctx context.Context, id int64, vals map[string]any) error
	ListCategories(ctx context.Context, limit, offset int) ([]odoo.CourseCategory, int, error)
	ListSchedules(ctx context.Context, courseID int64, state string, limit, offset int) ([]odoo.CourseSchedule, int, error)
	GetSchedule(ctx context.Context, id int64) (*odoo.CourseSchedule, error)
	CreateSchedule(ctx context.Context, req odoo.CourseScheduleCreateRequest) (int64, error)
	UpdateSchedule(ctx context.Context, id int64, vals map[string]any) error
	AdvanceSchedule(ctx context.Context, id int64, currentState string) error
	ResetSchedule(ctx context.Context, id int64) error
	CancelSchedule(ctx context.Context, id int64) error
	ListAttendees(ctx context.Context, scheduleID int64, limit, offset int) ([]odoo.CourseAttendee, int, error)
	UpdateAttendeeResult(ctx context.Context, id int64, result string) error
}

// CourseHandler handles HTTP requests for course operations.
type CourseHandler struct {
	svc CourseServicer
}

// NewCourseHandler creates a new CourseHandler.
func NewCourseHandler(svc CourseServicer) *CourseHandler {
	return &CourseHandler{svc: svc}
}

// HandleListCourses handles GET /api/v1/courses
// @Summary List courses
// @Description List training courses with optional filters
// @Tags Courses
// @Produce json
// @Param category_id query integer false "Filter by category ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses [get]
func (h *CourseHandler) HandleListCourses(w http.ResponseWriter, r *http.Request) {
	categoryID := int64QueryParam(r, "category_id", 0)
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	courses, total, err := h.svc.ListCourses(r.Context(), categoryID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list courses")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  courses,
		"total": total,
	})
}

// HandleGetCourse handles GET /api/v1/courses/{id}
// @Summary Get course by ID
// @Description Retrieve a single course by its ID
// @Tags Courses
// @Produce json
// @Param id path integer true "Course ID"
// @Success 200 {object} odoo.Course
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/{id} [get]
func (h *CourseHandler) HandleGetCourse(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid course ID")
		return
	}

	course, err := h.svc.GetCourse(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Course not found")
		return
	}

	respondJSON(w, http.StatusOK, course)
}

// HandleCreateCourse handles POST /api/v1/courses
// @Summary Create a new course
// @Description Create a new training course
// @Tags Courses
// @Accept json
// @Produce json
// @Param body body odoo.CourseCreateRequest true "Course data"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses [post]
func (h *CourseHandler) HandleCreateCourse(w http.ResponseWriter, r *http.Request) {
	var req odoo.CourseCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.CategoryID <= 0 {
		respondError(w, http.StatusBadRequest, "category_id is required")
		return
	}

	id, err := h.svc.CreateCourse(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create course")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleUpdateCourse handles PUT /api/v1/courses/{id}
// @Summary Update a course
// @Description Update course details
// @Tags Courses
// @Accept json
// @Produce json
// @Param id path integer true "Course ID"
// @Param body body map[string]any true "Fields to update"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/{id} [put]
func (h *CourseHandler) HandleUpdateCourse(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid course ID")
		return
	}

	var vals map[string]any
	if err := json.NewDecoder(r.Body).Decode(&vals); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.svc.UpdateCourse(r.Context(), id, vals); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update course")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Course updated successfully"})
}

// HandleListCategories handles GET /api/v1/courses/categories
// @Summary List course categories
// @Description List available course categories
// @Tags Courses
// @Produce json
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 100)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/categories [get]
func (h *CourseHandler) HandleListCategories(w http.ResponseWriter, r *http.Request) {
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 100)
	offset := (page - 1) * perPage

	categories, total, err := h.svc.ListCategories(r.Context(), perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list course categories")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  categories,
		"total": total,
	})
}

// HandleListSchedules handles GET /api/v1/courses/schedules
// @Summary List course schedules
// @Description List course schedules with optional filters
// @Tags Courses
// @Produce json
// @Param course_id query integer false "Filter by course ID"
// @Param state query string false "Filter by state"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 50)"
// @Success 200 {object} map[string]any
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules [get]
func (h *CourseHandler) HandleListSchedules(w http.ResponseWriter, r *http.Request) {
	courseID := int64QueryParam(r, "course_id", 0)
	state := r.URL.Query().Get("state")
	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 50)
	offset := (page - 1) * perPage

	schedules, total, err := h.svc.ListSchedules(r.Context(), courseID, state, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list course schedules")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  schedules,
		"total": total,
	})
}

// HandleGetSchedule handles GET /api/v1/courses/schedules/{id}
// @Summary Get course schedule by ID
// @Description Retrieve a single course schedule by its ID
// @Tags Courses
// @Produce json
// @Param id path integer true "Schedule ID"
// @Success 200 {object} odoo.CourseSchedule
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules/{id} [get]
func (h *CourseHandler) HandleGetSchedule(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid schedule ID")
		return
	}

	schedule, err := h.svc.GetSchedule(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Schedule not found")
		return
	}

	respondJSON(w, http.StatusOK, schedule)
}

// HandleCreateSchedule handles POST /api/v1/courses/schedules
// @Summary Create a new course schedule
// @Description Create a new course schedule
// @Tags Courses
// @Accept json
// @Produce json
// @Param body body odoo.CourseScheduleCreateRequest true "Schedule data"
// @Success 201 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules [post]
func (h *CourseHandler) HandleCreateSchedule(w http.ResponseWriter, r *http.Request) {
	var req odoo.CourseScheduleCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		respondError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.CourseID <= 0 {
		respondError(w, http.StatusBadRequest, "course_id is required")
		return
	}
	if req.AuthorizedBy <= 0 {
		respondError(w, http.StatusBadRequest, "authorized_by is required")
		return
	}

	id, err := h.svc.CreateSchedule(r.Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create schedule")
		return
	}

	respondJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// HandleAdvanceSchedule handles POST /api/v1/courses/schedules/{id}/advance
// @Summary Advance schedule state
// @Description Move schedule to the next state in workflow
// @Tags Courses
// @Produce json
// @Param id path integer true "Schedule ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules/{id}/advance [post]
func (h *CourseHandler) HandleAdvanceSchedule(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid schedule ID")
		return
	}

	schedule, err := h.svc.GetSchedule(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusNotFound, "Schedule not found")
		return
	}

	if err := h.svc.AdvanceSchedule(r.Context(), id, schedule.State); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to advance schedule")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Schedule advanced to next state"})
}

// HandleResetSchedule handles POST /api/v1/courses/schedules/{id}/reset
// @Summary Reset schedule to draft
// @Description Reset schedule back to draft state
// @Tags Courses
// @Produce json
// @Param id path integer true "Schedule ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules/{id}/reset [post]
func (h *CourseHandler) HandleResetSchedule(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid schedule ID")
		return
	}

	if err := h.svc.ResetSchedule(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to reset schedule")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Schedule reset to draft"})
}

// HandleCancelSchedule handles POST /api/v1/courses/schedules/{id}/cancel
// @Summary Cancel schedule
// @Description Cancel the course schedule
// @Tags Courses
// @Produce json
// @Param id path integer true "Schedule ID"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules/{id}/cancel [post]
func (h *CourseHandler) HandleCancelSchedule(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid schedule ID")
		return
	}

	if err := h.svc.CancelSchedule(r.Context(), id); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to cancel schedule")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Schedule cancelled"})
}

// HandleListAttendees handles GET /api/v1/courses/schedules/{id}/attendees
// @Summary List schedule attendees
// @Description List attendees for a course schedule
// @Tags Courses
// @Produce json
// @Param id path integer true "Schedule ID"
// @Param page query integer false "Page number (default 1)"
// @Param per_page query integer false "Items per page (default 100)"
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/schedules/{id}/attendees [get]
func (h *CourseHandler) HandleListAttendees(w http.ResponseWriter, r *http.Request) {
	scheduleID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid schedule ID")
		return
	}

	page := intQueryParam(r, "page", 1)
	perPage := intQueryParam(r, "per_page", 100)
	offset := (page - 1) * perPage

	attendees, total, err := h.svc.ListAttendees(r.Context(), scheduleID, perPage, offset)
	if err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to list attendees")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"data":  attendees,
		"total": total,
	})
}

// HandleUpdateAttendeeResult handles PATCH /api/v1/courses/attendees/{id}
// @Summary Update attendee result
// @Description Update the result of a course attendee
// @Tags Courses
// @Accept json
// @Produce json
// @Param id path integer true "Attendee ID"
// @Param body body object true "Result data" example({"result": "passed"})
// @Success 200 {object} map[string]any
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Security BearerAuth
// @Security APIKeyAuth
// @Router /courses/attendees/{id} [patch]
func (h *CourseHandler) HandleUpdateAttendeeResult(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid attendee ID")
		return
	}

	var req struct {
		Result string `json:"result"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Result == "" {
		respondError(w, http.StatusBadRequest, "result is required")
		return
	}

	if err := h.svc.UpdateAttendeeResult(r.Context(), id, req.Result); err != nil {
		if errors.Is(err, service.ErrServiceUnavailable) {
			respondError(w, http.StatusServiceUnavailable, "HR service temporarily unavailable. Please try again shortly.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to update attendee result")
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"message": "Attendee result updated"})
}
