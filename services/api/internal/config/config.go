package config

import (
	"errors"
	"os"
	"strconv"
)

// Config holds environment-based configuration for the HR API server.
type Config struct {
	Port              string // PORT, default "8080"
	DatabaseURL       string // DATABASE_URL
	OdooURL           string // ODOO_URL
	OdooDB            string // ODOO_DB
	OdooUser          string // ODOO_USER
	OdooPassword      string // ODOO_PASSWORD, required
	OdooWebhookSecret  string // ODOO_WEBHOOK_SECRET, optional token for webhook validation
	OdooMaxConcurrent  int    // ODOO_MAX_CONCURRENT, default 20
	OdooTimeoutSeconds int    // ODOO_TIMEOUT_SECONDS, default 30
	OdooCBFailureThreshold int // ODOO_CB_FAILURE_THRESHOLD, default 5
	RedisURL           string // REDIS_URL
	JWTSecret         string // JWT_SECRET (legacy HS256, kept for backward compat)
	JWTPrivateKey     string // JWT_PRIVATE_KEY_FILE, path to RSA private key PEM
	JWTPublicKey      string // JWT_PUBLIC_KEY_FILE, path to RSA public key PEM
	// Stripe (optional SaaS billing)
	StripeSecretKey      string // STRIPE_SECRET_KEY
	StripeWebhookSecret  string // STRIPE_WEBHOOK_SECRET
	StripePriceID        string // STRIPE_PRICE_ID (recurring price)
	StripeSuccessURL     string // STRIPE_SUCCESS_URL
	StripeCancelURL      string // STRIPE_CANCEL_URL
	SubscriptionEnforce  bool   // SUBSCRIPTION_ENFORCE=true blocks writes when subscription is canceled
	// Cloudflare DNS management (optional)
	CloudflareAPIToken string // CF_API_TOKEN — scoped API token for DNS edits
	CloudflareZoneID   string // CF_ZONE_ID — zone ID for the managed domain
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	cfg := &Config{
		Port:              envOrDefault("PORT", "8080"),
		DatabaseURL:       envOrDefault("DATABASE_URL", "postgres://hr:hr_dev_password@hr-db:5432/hr_platform?sslmode=disable"),
		OdooURL:           envOrDefault("ODOO_URL", "http://hr-odoo:8069"),
		OdooDB:            envOrDefault("ODOO_DB", "odoo"),
		OdooUser:          envOrDefault("ODOO_USER", "admin"),
		OdooPassword:      os.Getenv("ODOO_PASSWORD"),
		OdooWebhookSecret:      os.Getenv("ODOO_WEBHOOK_SECRET"),
		OdooMaxConcurrent:      envOrDefaultInt("ODOO_MAX_CONCURRENT", 20),
		OdooTimeoutSeconds:     envOrDefaultInt("ODOO_TIMEOUT_SECONDS", 30),
		OdooCBFailureThreshold: envOrDefaultInt("ODOO_CB_FAILURE_THRESHOLD", 5),
		RedisURL:               envOrDefault("REDIS_URL", "redis://hr-redis:6379"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		JWTPrivateKey:     envOrDefault("JWT_PRIVATE_KEY_FILE", ""),
		JWTPublicKey:      envOrDefault("JWT_PUBLIC_KEY_FILE", ""),
		StripeSecretKey:   os.Getenv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		StripePriceID:     envOrDefault("STRIPE_PRICE_ID", ""),
		StripeSuccessURL:  envOrDefault("STRIPE_SUCCESS_URL", ""),
		StripeCancelURL:   envOrDefault("STRIPE_CANCEL_URL", ""),
		SubscriptionEnforce: os.Getenv("SUBSCRIPTION_ENFORCE") == "true",
		CloudflareAPIToken:  os.Getenv("CF_API_TOKEN"),
		CloudflareZoneID:    os.Getenv("CF_ZONE_ID"),
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

func envOrDefaultInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
