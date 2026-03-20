package handler

import (
	"net/http"
	"testing"
)

func TestComputeReadinessStatus(t *testing.T) {
	tests := []struct {
		name      string
		failures  int
		total     int
		wantStat  string
		wantHTTP  int
	}{
		{"all_ok", 0, 3, "ok", http.StatusOK},
		{"one_down", 1, 3, "degraded", http.StatusServiceUnavailable},
		{"two_down", 2, 3, "degraded", http.StatusServiceUnavailable},
		{"all_down", 3, 3, "unavailable", http.StatusServiceUnavailable},
		{"zero_checks", 0, 0, "ok", http.StatusOK},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			st, code := computeReadinessStatus(tt.failures, tt.total)
			if st != tt.wantStat || code != tt.wantHTTP {
				t.Fatalf("computeReadinessStatus(%d,%d) = (%q,%d), want (%q,%d)",
					tt.failures, tt.total, st, code, tt.wantStat, tt.wantHTTP)
			}
		})
	}
}
