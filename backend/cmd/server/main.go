package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/vchavkov/hr-backend/internal/cache"
	"github.com/vchavkov/hr-backend/internal/config"
	"github.com/vchavkov/hr-backend/internal/handler"
	"github.com/vchavkov/hr-backend/internal/middleware"
	"github.com/vchavkov/hr-backend/internal/service"
	"github.com/vchavkov/hr-backend/platform/odoo"
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

	// Initialize handlers
	employeeHandler := handler.NewEmployeeHandler(employeeSvc)

	// Initialize JWT auth
	tokenAuth := middleware.NewJWTAuth(cfg.JWTSecret)

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5010", "https://hr.vchavkov.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
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

	// API v1 routes (JWT protected)
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(jwtauth.Verifier(tokenAuth))
		r.Use(jwtauth.Authenticator(tokenAuth))

		// Employee routes
		r.Route("/employees", func(r chi.Router) {
			r.Get("/", employeeHandler.HandleList)
			r.Post("/", employeeHandler.HandleCreate)
			r.Get("/{id}", employeeHandler.HandleGet)
			r.Put("/{id}", employeeHandler.HandleUpdate)
		})

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

	addr := ":" + cfg.Port
	log.Printf("hr-api listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}
