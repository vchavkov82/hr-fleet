package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// AttendanceOdooClient defines the Odoo interface for attendance operations.
type AttendanceOdooClient interface {
	ListAttendance(domain []any, limit, offset int) ([]odoo.AttendanceRecord, int, error)
	CheckIn(employeeID int64) (int64, error)
	CheckOut(attendanceID int64) error
}

// AttendanceService provides business logic for attendance operations.
type AttendanceService struct {
	odoo  AttendanceOdooClient
	cache *cache.Cache
}

// NewAttendanceService creates a new AttendanceService.
func NewAttendanceService(odoo AttendanceOdooClient, cache *cache.Cache) *AttendanceService {
	return &AttendanceService{odoo: odoo, cache: cache}
}

// List retrieves attendance records with optional filtering.
func (s *AttendanceService) List(ctx context.Context, employeeID int64, limit, offset int) ([]odoo.AttendanceRecord, int, error) {
	domain := []any{}
	if employeeID > 0 {
		domain = append(domain, []any{"employee_id", "=", employeeID})
	}

	records, total, err := s.odoo.ListAttendance(domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list attendance: %w", err)
	}
	return records, total, nil
}

// CheckIn records an employee check-in.
func (s *AttendanceService) CheckIn(ctx context.Context, employeeID int64) (int64, error) {
	id, err := s.odoo.CheckIn(employeeID)
	if err != nil {
		return 0, fmt.Errorf("check in: %w", err)
	}
	return id, nil
}

// CheckOut records a check-out for an attendance record.
func (s *AttendanceService) CheckOut(ctx context.Context, attendanceID int64) error {
	if err := s.odoo.CheckOut(attendanceID); err != nil {
		return fmt.Errorf("check out: %w", err)
	}
	return nil
}
