package odoo

import (
	"context"
	"fmt"
)

// ListFleetVehicles retrieves fleet.vehicle records from Odoo with optional domain filters.
func (c *Client) ListFleetVehicles(ctx context.Context, domain []any, limit, offset int) ([]FleetVehicle, int, error) {
	if domain == nil {
		domain = []any{}
	}

	count, err := c.SearchCount(ctx, "fleet.vehicle", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list fleet vehicles count: %w", err)
	}

	records, err := c.SearchRead(ctx, "fleet.vehicle", domain, fleetVehicleFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list fleet vehicles: %w", err)
	}

	vehicles := make([]FleetVehicle, 0, len(records))
	for _, rec := range records {
		vehicles = append(vehicles, parseFleetVehicle(rec))
	}

	return vehicles, int(count), nil
}

// GetFleetVehicle retrieves a single fleet.vehicle by ID.
func (c *Client) GetFleetVehicle(ctx context.Context, id int64) (*FleetVehicle, error) {
	records, err := c.Read(ctx, "fleet.vehicle", []int64{id}, fleetVehicleFields)
	if err != nil {
		return nil, fmt.Errorf("get fleet vehicle %d: %w", id, err)
	}

	if len(records) == 0 {
		return nil, fmt.Errorf("fleet vehicle %d not found", id)
	}

	v := parseFleetVehicle(records[0])
	return &v, nil
}

// ListFleetVehicleLogs retrieves fleet.vehicle.log.services records for a vehicle.
func (c *Client) ListFleetVehicleLogs(ctx context.Context, vehicleID int64, limit, offset int) ([]FleetVehicleLog, int, error) {
	domain := []any{[]any{"vehicle_id", "=", vehicleID}}

	count, err := c.SearchCount(ctx, "fleet.vehicle.log.services", domain)
	if err != nil {
		return nil, 0, fmt.Errorf("list fleet logs count: %w", err)
	}

	records, err := c.SearchRead(ctx, "fleet.vehicle.log.services", domain, fleetVehicleLogFields, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list fleet logs: %w", err)
	}

	logs := make([]FleetVehicleLog, 0, len(records))
	for _, rec := range records {
		logs = append(logs, parseFleetVehicleLog(rec))
	}

	return logs, int(count), nil
}

// parseFleetVehicle converts a raw Odoo record map into a FleetVehicle struct.
func parseFleetVehicle(rec map[string]any) FleetVehicle {
	return FleetVehicle{
		ID:              toInt64(rec["id"]),
		Name:            toString(rec["name"]),
		LicensePlate:    toString(rec["license_plate"]),
		ModelID:         parseMany2One(rec["model_id"]),
		DriverID:        parseMany2One(rec["driver_id"]),
		FuelType:        toString(rec["fuel_type"]),
		Odometer:        toFloat64(rec["odometer"]),
		State:           parseMany2One(rec["state_id"]),
		CompanyID:       parseMany2One(rec["company_id"]),
		AcquisitionDate: toString(rec["acquisition_date"]),
		Active:          toBool(rec["active"]),
	}
}

// parseFleetVehicleLog converts a raw Odoo record map into a FleetVehicleLog struct.
func parseFleetVehicleLog(rec map[string]any) FleetVehicleLog {
	return FleetVehicleLog{
		ID:          toInt64(rec["id"]),
		VehicleID:   parseMany2One(rec["vehicle_id"]),
		ServiceType: parseMany2One(rec["service_type_id"]),
		Date:        toString(rec["date"]),
		Description: toString(rec["description"]),
		Cost:        toFloat64(rec["amount"]),
		Odometer:    toFloat64(rec["odometer"]),
		State:       toString(rec["state"]),
	}
}
