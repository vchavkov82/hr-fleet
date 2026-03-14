package handler

import (
	"encoding/json"
	"math"
	"net/http"
)

// ErrorResponse is the standardized error response format.
type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

// ErrorBody contains the error details.
type ErrorBody struct {
	Code    string       `json:"code"`
	Message string       `json:"message"`
	Details []FieldError `json:"details,omitempty"`
}

// FieldError represents a validation error on a specific field.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ListMeta contains pagination metadata.
type ListMeta struct {
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	TotalPages int   `json:"total_pages"`
}

// ListResponse is the standardized paginated list response.
type ListResponse struct {
	Data any      `json:"data"`
	Meta ListMeta `json:"meta"`
}

// RespondJSON writes a JSON response with the given status code.
func RespondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		_ = json.NewEncoder(w).Encode(data)
	}
}

// RespondError writes a standardized error response.
func RespondError(w http.ResponseWriter, status int, code, message string, details ...FieldError) {
	resp := ErrorResponse{
		Error: ErrorBody{
			Code:    code,
			Message: message,
		},
	}
	if len(details) > 0 {
		resp.Error.Details = details
	}
	RespondJSON(w, status, resp)
}

// RespondList writes a paginated list response.
func RespondList(w http.ResponseWriter, items any, total int64, page, perPage int) {
	totalPages := int(math.Ceil(float64(total) / float64(perPage)))
	resp := ListResponse{
		Data: items,
		Meta: ListMeta{
			Total:      total,
			Page:       page,
			PerPage:    perPage,
			TotalPages: totalPages,
		},
	}
	RespondJSON(w, http.StatusOK, resp)
}
