package config

import (
	"errors"
	"os"
)

// Config holds environment-based configuration for the HR API server.
type Config struct {
	Port            string // PORT, default "8080"
	DatabaseURL     string // DATABASE_URL
	OdooURL         string // ODOO_URL
	OdooDB          string // ODOO_DB
	OdooUser        string // ODOO_USER
	OdooPassword    string // ODOO_PASSWORD, required
	RedisURL        string // REDIS_URL
	JWTSecret       string // JWT_SECRET (legacy HS256, kept for backward compat)
	JWTPrivateKey   string // JWT_PRIVATE_KEY_FILE, path to RSA private key PEM
	JWTPublicKey    string // JWT_PUBLIC_KEY_FILE, path to RSA public key PEM
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	cfg := &Config{
		Port:          envOrDefault("PORT", "8080"),
		DatabaseURL:   envOrDefault("DATABASE_URL", "postgres://hr:hr_dev_password@hr-db:5432/hr_platform?sslmode=disable"),
		OdooURL:       envOrDefault("ODOO_URL", "http://hr-odoo:8069"),
		OdooDB:        envOrDefault("ODOO_DB", "odoo"),
		OdooUser:      envOrDefault("ODOO_USER", "admin"),
		OdooPassword:  os.Getenv("ODOO_PASSWORD"),
		RedisURL:      envOrDefault("REDIS_URL", "redis://hr-redis:6379"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
		JWTPrivateKey: envOrDefault("JWT_PRIVATE_KEY_FILE", ""),
		JWTPublicKey:  envOrDefault("JWT_PUBLIC_KEY_FILE", ""),
	}

	var errs []error
	if cfg.OdooPassword == "" {
		errs = append(errs, errors.New("ODOO_PASSWORD is required"))
	}
	// Require either RSA key files or JWT_SECRET
	if cfg.JWTPrivateKey == "" && cfg.JWTPublicKey == "" && cfg.JWTSecret == "" {
		errs = append(errs, errors.New("JWT_PRIVATE_KEY_FILE and JWT_PUBLIC_KEY_FILE (or JWT_SECRET) are required"))
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
