package service

import (
	"context"
	"fmt"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// FleetOdooClient defines the Odoo interface for fleet operations.
type FleetOdooClient interface {
	ListFleetVehicles(ctx context.Context, domain []any, limit, offset int) ([]odoo.FleetVehicle, int, error)
	GetFleetVehicle(ctx context.Context, id int64) (*odoo.FleetVehicle, error)
	ListFleetVehicleLogs(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error)
	Healthy() error
}

// FleetService provides business logic for fleet operations.
type FleetService struct {
	odoo  FleetOdooClient
	cache *cache.Cache
}

// NewFleetService creates a new FleetService.
func NewFleetService(odoo FleetOdooClient, cache *cache.Cache) *FleetService {
	return &FleetService{odoo: odoo, cache: cache}
}

// ListVehicles retrieves fleet vehicles with optional filters.
func (s *FleetService) ListVehicles(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	domain := []any{}
	if driverID > 0 {
		domain = append(domain, []any{"driver_id", "=", driverID})
	}
	if active != nil {
		domain = append(domain, []any{"active", "=", *active})
	}

	vehicles, total, err := s.odoo.ListFleetVehicles(ctx, domain, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list fleet vehicles: %w", err)
	}
	return vehicles, total, nil
}

// GetVehicle retrieves a single vehicle by ID.
func (s *FleetService) GetVehicle(ctx context.Context, id int64) (*odoo.FleetVehicle, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, ErrServiceUnavailable
	}

	vehicle, err := s.odoo.GetFleetVehicle(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get fleet vehicle: %w", err)
	}
	return vehicle, nil
}

// ListVehicleLogs retrieves service logs for a vehicle.
func (s *FleetService) ListVehicleLogs(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error) {
	if err := s.odoo.Healthy(); err != nil {
		return nil, 0, ErrServiceUnavailable
	}

	logs, total, err := s.odoo.ListFleetVehicleLogs(ctx, vehicleID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list fleet vehicle logs: %w", err)
	}
	return logs, total, nil
}
