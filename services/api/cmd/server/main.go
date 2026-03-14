package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/internal/config"
	"github.com/vchavkov/hr/services/api/internal/handler"
	"github.com/vchavkov/hr/services/api/internal/middleware"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	// Initialize Odoo client
	odooClient := odoo.NewClient(cfg.OdooURL, cfg.OdooDB, cfg.OdooUser, cfg.OdooPassword)

	// Initialize Redis cache
	redisCache, err := cache.NewCache(cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis: %v", err)
	}

	// Initialize services
	employeeSvc := service.NewEmployeeService(odooClient, redisCache)
	provisioningSvc := service.NewProvisioningService(odooClient)

	// Initialize JWT auth (RS256 or HS256 fallback)
	var tokenAuth *jwtauth.JWTAuth
	if cfg.JWTPrivateKey != "" && cfg.JWTPublicKey != "" {
		privKey, err := os.ReadFile(cfg.JWTPrivateKey)
		if err != nil {
			log.Fatalf("read JWT private key: %v", err)
		}
		pubKey, err := os.ReadFile(cfg.JWTPublicKey)
		if err != nil {
			log.Fatalf("read JWT public key: %v", err)
		}
		tokenAuth, err = middleware.NewJWTAuth(privKey, pubKey)
		if err != nil {
			log.Fatalf("jwt auth: %v", err)
		}
		log.Println("JWT: using RS256 with RSA key pair")
	} else {
		tokenAuth = jwtauth.New("HS256", []byte(cfg.JWTSecret), nil)
		log.Println("JWT: using HS256 (legacy mode)")
	}

	// Initialize handlers
	employeeHandler := handler.NewEmployeeHandler(employeeSvc)

	// Initialize auth service and handler (requires DB queries - placeholder for now)
	// TODO: Wire db.Queries when database pool is connected in main
	_ = tokenAuth

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5010", "https://hr.vchavkov.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check (public)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// API v1 routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public auth routes
		r.Group(func(r chi.Router) {
			// Auth endpoints will be mounted here when DB is wired:
			// r.Post("/auth/login", authHandler.HandleLogin)
			// r.Post("/auth/refresh", authHandler.HandleRefresh)
		})

		// Protected routes (JWT or API key)
		r.Group(func(r chi.Router) {
			r.Use(jwtauth.Verifier(tokenAuth))
			r.Use(jwtauth.Authenticator(tokenAuth))

			// Employee routes
			r.Route("/employees", func(r chi.Router) {
				r.Get("/", employeeHandler.HandleList)
				r.Post("/", employeeHandler.HandleCreate)
				r.Get("/{id}", employeeHandler.HandleGet)
				r.Put("/{id}", employeeHandler.HandleUpdate)
			})

			// API key management
			// r.Post("/auth/api-keys", authHandler.HandleCreateAPIKey)
			// r.Get("/auth/api-keys", authHandler.HandleListAPIKeys)
			// r.Delete("/auth/api-keys/{id}", authHandler.HandleDeleteAPIKey)

			// Provisioning endpoint (admin-only, for sign-up flow)
			r.Post("/provision", func(w http.ResponseWriter, r *http.Request) {
				var req struct {
					CompanyName string `json:"company_name"`
					AdminEmail  string `json:"admin_email"`
					AdminName   string `json:"admin_name"`
				}
				if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
					return
				}

				companyID, userID, err := provisioningSvc.ProvisionCompany(r.Context(), req.CompanyName, req.AdminEmail, req.AdminName)
				if err != nil {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(map[string]string{"error": "Provisioning failed"})
					return
				}

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusCreated)
				json.NewEncoder(w).Encode(map[string]any{
					"company_id": companyID,
					"user_id":    userID,
					"message":    "Company provisioned successfully",
				})
			})
		})
	})

	addr := ":" + cfg.Port
	log.Printf("hr-api listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}
