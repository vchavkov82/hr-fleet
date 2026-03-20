package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/testutil"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

type mockFleetService struct {
	listVehiclesFunc    func(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error)
	getVehicleFunc      func(ctx context.Context, id int64) (*odoo.FleetVehicle, error)
	listVehicleLogsFunc func(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error)
}

func (m *mockFleetService) ListVehicles(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error) {
	if m.listVehiclesFunc != nil {
		return m.listVehiclesFunc(ctx, driverID, active, limit, offset)
	}
	return []odoo.FleetVehicle{}, 0, nil
}

func (m *mockFleetService) GetVehicle(ctx context.Context, id int64) (*odoo.FleetVehicle, error) {
	if m.getVehicleFunc != nil {
		return m.getVehicleFunc(ctx, id)
	}
	return &odoo.FleetVehicle{ID: id}, nil
}

func (m *mockFleetService) ListVehicleLogs(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error) {
	if m.listVehicleLogsFunc != nil {
		return m.listVehicleLogsFunc(ctx, vehicleID, limit, offset)
	}
	return []odoo.FleetVehicleLog{}, 0, nil
}

func setupFleetRouter(mock *mockFleetService) http.Handler {
	h := NewFleetHandler(mock)
	r := chi.NewRouter()
	r.Get("/fleet/vehicles", h.HandleListVehicles)
	r.Get("/fleet/vehicles/{id}", h.HandleGetVehicle)
	r.Get("/fleet/vehicles/{id}/logs", h.HandleListVehicleLogs)
	return r
}

func TestFleetHandler_HandleListVehicles_Success(t *testing.T) {
	mock := &mockFleetService{
		listVehiclesFunc: func(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error) {
			return []odoo.FleetVehicle{
				{ID: 1, Name: "Toyota Camry"},
				{ID: 2, Name: "Honda Accord"},
			}, 2, nil
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
	testutil.AssertHasField(t, resp, "total")
}

func TestFleetHandler_HandleListVehicles_WithFilters(t *testing.T) {
	var capturedDriverID int64
	var capturedActive *bool
	mock := &mockFleetService{
		listVehiclesFunc: func(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error) {
			capturedDriverID = driverID
			capturedActive = active
			return []odoo.FleetVehicle{}, 0, nil
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles?driver_id=42&active=true", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	if capturedDriverID != 42 {
		t.Errorf("driver_id = %d, want 42", capturedDriverID)
	}
	if capturedActive == nil || *capturedActive != true {
		t.Error("expected active=true")
	}
}

func TestFleetHandler_HandleListVehicles_ServiceUnavailable(t *testing.T) {
	mock := &mockFleetService{
		listVehiclesFunc: func(ctx context.Context, driverID int64, active *bool, limit, offset int) ([]odoo.FleetVehicle, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
	testutil.AssertErrorCode(t, w, "service_unavailable")
}

func TestFleetHandler_HandleGetVehicle_Success(t *testing.T) {
	mock := &mockFleetService{
		getVehicleFunc: func(ctx context.Context, id int64) (*odoo.FleetVehicle, error) {
			return &odoo.FleetVehicle{ID: id, Name: "Toyota Camry", LicensePlate: "CA 1234 AB"}, nil
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
}

func TestFleetHandler_HandleGetVehicle_InvalidID(t *testing.T) {
	mock := &mockFleetService{}
	router := setupFleetRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/not-a-number", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestFleetHandler_HandleGetVehicle_NotFound(t *testing.T) {
	mock := &mockFleetService{
		getVehicleFunc: func(ctx context.Context, id int64) (*odoo.FleetVehicle, error) {
			return nil, errors.New("not found")
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/999", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusNotFound)
}

func TestFleetHandler_HandleGetVehicle_ServiceUnavailable(t *testing.T) {
	mock := &mockFleetService{
		getVehicleFunc: func(ctx context.Context, id int64) (*odoo.FleetVehicle, error) {
			return nil, service.ErrServiceUnavailable
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
}

func TestFleetHandler_HandleListVehicleLogs_Success(t *testing.T) {
	mock := &mockFleetService{
		listVehicleLogsFunc: func(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error) {
			return []odoo.FleetVehicleLog{
				{ID: 1, Description: "Oil change"},
				{ID: 2, Description: "Tire rotation"},
			}, 2, nil
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/1/logs", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusOK)
	resp := testutil.AssertJSONResponse(t, w)
	testutil.AssertHasField(t, resp, "data")
}

func TestFleetHandler_HandleListVehicleLogs_InvalidVehicleID(t *testing.T) {
	mock := &mockFleetService{}
	router := setupFleetRouter(mock)

	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/xyz/logs", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusBadRequest)
	testutil.AssertErrorCode(t, w, "invalid_id")
}

func TestFleetHandler_HandleListVehicleLogs_ServiceUnavailable(t *testing.T) {
	mock := &mockFleetService{
		listVehicleLogsFunc: func(ctx context.Context, vehicleID int64, limit, offset int) ([]odoo.FleetVehicleLog, int, error) {
			return nil, 0, service.ErrServiceUnavailable
		},
	}

	router := setupFleetRouter(mock)
	req := httptest.NewRequest(http.MethodGet, "/fleet/vehicles/1/logs", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	testutil.AssertStatus(t, w, http.StatusServiceUnavailable)
}
