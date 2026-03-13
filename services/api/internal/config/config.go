package config

import (
	"errors"
	"os"
)

// Config holds environment-based configuration for the HR API server.
type Config struct {
	Port         string // PORT, default "8080"
	DatabaseURL  string // DATABASE_URL, default "postgres://hr:hr_dev_password@hr-db:5432/hr_platform?sslmode=disable"
	OdooURL      string // ODOO_URL, default "http://hr-odoo:8069"
	OdooDB       string // ODOO_DB, default "odoo"
	OdooUser     string // ODOO_USER, default "admin"
	OdooPassword string // ODOO_PASSWORD, required
	RedisURL     string // REDIS_URL, default "redis://hr-redis:6379"
	JWTSecret    string // JWT_SECRET, required
}

// Load reads configuration from environment variables.
// Required fields: ODOO_PASSWORD, JWT_SECRET.
func Load() (*Config, error) {
	cfg := &Config{
		Port:         envOrDefault("PORT", "8080"),
		DatabaseURL:  envOrDefault("DATABASE_URL", "postgres://hr:hr_dev_password@hr-db:5432/hr_platform?sslmode=disable"),
		OdooURL:      envOrDefault("ODOO_URL", "http://hr-odoo:8069"),
		OdooDB:       envOrDefault("ODOO_DB", "odoo"),
		OdooUser:     envOrDefault("ODOO_USER", "admin"),
		OdooPassword: os.Getenv("ODOO_PASSWORD"),
		RedisURL:     envOrDefault("REDIS_URL", "redis://hr-redis:6379"),
		JWTSecret:    os.Getenv("JWT_SECRET"),
	}

	var errs []error
	if cfg.OdooPassword == "" {
		errs = append(errs, errors.New("ODOO_PASSWORD is required"))
	}
	if cfg.JWTSecret == "" {
		errs = append(errs, errors.New("JWT_SECRET is required"))
	}

	if len(errs) > 0 {
		return nil, errors.Join(errs...)
	}

	return cfg, nil
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
