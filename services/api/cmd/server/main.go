package main

import (
	"context"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	httpSwagger "github.com/swaggo/http-swagger/v2"

	"github.com/vchavkov/hr/services/api/internal/cache"
	"github.com/vchavkov/hr/services/api/internal/config"
	"github.com/vchavkov/hr/services/api/internal/db"
	_ "github.com/vchavkov/hr/services/api/docs"
	"github.com/vchavkov/hr/services/api/internal/handler"
	"github.com/vchavkov/hr/services/api/internal/middleware"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/worker"
	"github.com/vchavkov/hr/services/api/platform/odoo"
)

// @title HR Platform API
// @version 1.0
// @description REST API for HR Platform with Bulgarian payroll
// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @securityDefinitions.apikey APIKeyAuth
// @in header
// @name X-API-Key

func main() {
	mode := flag.String("mode", "api", "Run mode: api, worker, or both")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Database pool
	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	queries := db.New(pool)

	// Redis cache
	redisCache, err := cache.NewCache(cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis cache: %v", err)
	}

	// Asynq client (for enqueuing tasks)
	asynqClient := asynq.NewClient(asynq.RedisClientOpt{Addr: redisAddrFromURL(cfg.RedisURL)})
	defer asynqClient.Close()

	// Odoo client
	odooClient := odoo.NewClient(cfg.OdooURL, cfg.OdooDB, cfg.OdooUser, cfg.OdooPassword)

	// JWT auth
	tokenAuth, err := initJWTAuth(cfg)
	if err != nil {
		log.Fatalf("jwt: %v", err)
	}

	// Services
	webhookSvc := service.NewWebhookService(queries, asynqClient)
	authSvc := service.NewAuthService(queries, tokenAuth)
	employeeSvc := service.NewEmployeeService(odooClient, redisCache, queries, webhookSvc)
	contractSvc := service.NewContractService(odooClient, redisCache, queries)
	leaveSvc := service.NewLeaveService(odooClient, redisCache, queries, webhookSvc)
	payrollSvc := service.NewPayrollService(queries, asynqClient)
	payslipSvc := service.NewPayslipService(queries)
	reportSvc := service.NewReportService(queries)

	// OCA-backed services
	departmentSvc := service.NewDepartmentService(odooClient, redisCache)
	skillSvc := service.NewSkillService(odooClient, redisCache)
	payrollOCASvc := service.NewPayrollOCAService(odooClient, redisCache)
	timesheetSvc := service.NewTimesheetService(odooClient, redisCache)
	attendanceSvc := service.NewAttendanceService(odooClient, redisCache)
	expenseSvc := service.NewExpenseService(odooClient, redisCache)
	appraisalSvc := service.NewAppraisalService(odooClient, redisCache)
	courseSvc := service.NewCourseService(odooClient, redisCache)
	projectSvc := service.NewProjectService(odooClient, redisCache)
	fleetSvc := service.NewFleetService(odooClient, redisCache)

	// Signal handling
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	switch *mode {
	case "api":
		runAPI(cfg, pool, redisCache, odooClient, tokenAuth, asynqClient, authSvc, employeeSvc, contractSvc, leaveSvc, payrollSvc, payslipSvc, reportSvc, webhookSvc,
			departmentSvc, skillSvc, payrollOCASvc, timesheetSvc, attendanceSvc, expenseSvc, appraisalSvc, courseSvc, projectSvc, fleetSvc, sigCh)
	case "worker":
		runWorker(cfg, queries, sigCh)
	case "both":
		go runWorker(cfg, queries, sigCh)
		runAPI(cfg, pool, redisCache, odooClient, tokenAuth, asynqClient, authSvc, employeeSvc, contractSvc, leaveSvc, payrollSvc, payslipSvc, reportSvc, webhookSvc,
			departmentSvc, skillSvc, payrollOCASvc, timesheetSvc, attendanceSvc, expenseSvc, appraisalSvc, courseSvc, projectSvc, fleetSvc, sigCh)
	default:
		log.Fatalf("unknown mode: %s (use api, worker, or both)", *mode)
	}
}

func runAPI(
	cfg *config.Config,
	pool *pgxpool.Pool,
	redisCache *cache.Cache,
	odooClient *odoo.Client,
	tokenAuth *jwtauth.JWTAuth,
	asynqClient *asynq.Client,
	authSvc *service.AuthService,
	employeeSvc *service.EmployeeService,
	contractSvc *service.ContractService,
	leaveSvc *service.LeaveService,
	payrollSvc *service.PayrollService,
	payslipSvc *service.PayslipService,
	reportSvc *service.ReportService,
	webhookSvc *service.WebhookService,
	departmentSvc *service.DepartmentService,
	skillSvc *service.SkillService,
	payrollOCASvc *service.PayrollOCAService,
	timesheetSvc *service.TimesheetService,
	attendanceSvc *service.AttendanceService,
	expenseSvc *service.ExpenseService,
	appraisalSvc *service.AppraisalService,
	courseSvc *service.CourseService,
	projectSvc *service.ProjectService,
	fleetSvc *service.FleetService,
	sigCh <-chan os.Signal,
) {
	// Handlers
	authHandler := handler.NewAuthHandler(authSvc, nil)
	employeeHandler := handler.NewEmployeeHandler(employeeSvc)
	contractHandler := handler.NewContractHandler(contractSvc)
	leaveHandler := handler.NewLeaveHandler(leaveSvc)
	payrollHandler := handler.NewPayrollHandler(payrollSvc)
	payslipHandler := handler.NewPayslipHandler(payslipSvc)
	reportHandler := handler.NewReportHandler(reportSvc)
	webhookHandler := handler.NewWebhookHandler(webhookSvc)

	// OCA handlers
	departmentHandler := handler.NewDepartmentHandler(departmentSvc)
	skillHandler := handler.NewSkillHandler(skillSvc)
	payrollOCAHandler := handler.NewPayrollOCAHandler(payrollOCASvc)
	timesheetHandler := handler.NewTimesheetHandler(timesheetSvc)
	attendanceHandler := handler.NewAttendanceHandler(attendanceSvc)
	expenseHandler := handler.NewExpenseHandler(expenseSvc)
	appraisalHandler := handler.NewAppraisalHandler(appraisalSvc)
	courseHandler := handler.NewCourseHandler(courseSvc)
	projectHandler := handler.NewProjectHandler(projectSvc)
	fleetHandler := handler.NewFleetHandler(fleetSvc)

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(middleware.DefaultLogger())
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.PublicRateLimit())
	r.Use(middleware.Metrics())
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

	// Readiness check (public) — verifies Odoo, Redis, and PostgreSQL
	healthHandler := handler.NewHealthHandler(pool, redisCache, odooClient)
	r.Get("/health/ready", healthHandler.HandleReady)

	// Metrics (public)
	r.Handle("/metrics", promhttp.Handler())

	// Swagger docs
	r.Get("/api/docs/*", httpSwagger.WrapHandler)

	// API v1 routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public auth routes
		r.Group(func(r chi.Router) {
			r.Post("/auth/login", authHandler.HandleLogin)
			r.Post("/auth/refresh", authHandler.HandleRefresh)
		})

		// Protected routes (API key or JWT)
		r.Group(func(r chi.Router) {
			r.Use(middleware.APIKeyOrJWT(tokenAuth, authSvc))
			r.Use(middleware.AuthenticatedRateLimit())

			// Auth - API key management
			r.Post("/auth/api-keys", authHandler.HandleCreateAPIKey)
			r.Get("/auth/api-keys", authHandler.HandleListAPIKeys)
			r.Delete("/auth/api-keys/{id}", authHandler.HandleDeleteAPIKey)

			// Employees
			r.Route("/employees", func(r chi.Router) {
				r.Get("/", employeeHandler.HandleList)
				r.Post("/", employeeHandler.HandleCreate)
				r.Get("/{id}", employeeHandler.HandleGet)
				r.Put("/{id}", employeeHandler.HandleUpdate)
				r.Delete("/{id}", employeeHandler.HandleDelete)
			})

			// Contracts
			r.Route("/contracts", func(r chi.Router) {
				r.Get("/", contractHandler.HandleList)
				r.Post("/", contractHandler.HandleCreate)
				r.Get("/{id}", contractHandler.HandleGet)
				r.Put("/{id}", contractHandler.HandleUpdate)
			})

			// Leave
			r.Route("/leave", func(r chi.Router) {
				r.Get("/allocations", leaveHandler.HandleListAllocations)
				r.Get("/requests", leaveHandler.HandleListRequests)
				r.Post("/requests", leaveHandler.HandleCreateRequest)
				r.Delete("/requests/{id}", leaveHandler.HandleCancelRequest)
				r.Post("/requests/{id}/approve", leaveHandler.HandleApproveRequest)
				r.Post("/requests/{id}/reject", leaveHandler.HandleRejectRequest)
			})

			// Payroll
			r.Route("/payroll-runs", func(r chi.Router) {
				r.Get("/", payrollHandler.HandleList)
				r.Post("/", payrollHandler.HandleCreate)
				r.Get("/{id}", payrollHandler.HandleGetStatus)
				r.Post("/{id}/approve", payrollHandler.HandleApprove)
				r.Post("/{id}/process", payrollHandler.HandleProcess)
				r.Post("/{id}/cancel", payrollHandler.HandleCancel)
			})

			// Payslips
			r.Route("/payslips", func(r chi.Router) {
				r.Get("/", payslipHandler.HandleList)
				r.Get("/{id}", payslipHandler.HandleGet)
				r.Post("/{id}/confirm", payslipHandler.HandleConfirm)
			})

			// Reports
			r.Route("/reports", func(r chi.Router) {
				r.Get("/payroll-summary", reportHandler.HandlePayrollSummary)
				r.Get("/tax-liabilities", reportHandler.HandleTaxLiabilities)
			})

			// Webhooks
			r.Route("/webhooks", func(r chi.Router) {
				r.Get("/", webhookHandler.HandleList)
				r.Post("/", webhookHandler.HandleRegister)
				r.Delete("/{id}", webhookHandler.HandleDeactivate)
				r.Get("/{id}/deliveries", webhookHandler.HandleListDeliveries)
			})

			// OCA: Departments
			r.Route("/departments", func(r chi.Router) {
				r.Get("/", departmentHandler.HandleList)
				r.Get("/{id}", departmentHandler.HandleGet)
			})

			// OCA: Employee Skills (nested under employees)
			r.Route("/employees/{id}/skills", func(r chi.Router) {
				r.Get("/", skillHandler.HandleListEmployeeSkills)
				r.Post("/", skillHandler.HandleAddEmployeeSkill)
				r.Delete("/{skillId}", skillHandler.HandleDeleteEmployeeSkill)
			})
			r.Get("/skills", skillHandler.HandleListSkills)

			// OCA: Payroll structures and rules
			r.Route("/payroll", func(r chi.Router) {
				r.Get("/structures", payrollOCAHandler.HandleListStructures)
				r.Get("/structures/{id}", payrollOCAHandler.HandleGetStructure)
				r.Get("/rules", payrollOCAHandler.HandleListRules)
			})

			// OCA: Timesheets
			r.Route("/timesheets", func(r chi.Router) {
				r.Get("/", timesheetHandler.HandleList)
				r.Post("/", timesheetHandler.HandleCreate)
				r.Put("/{id}", timesheetHandler.HandleUpdate)
			})

			// OCA: Attendance
			r.Route("/attendance", func(r chi.Router) {
				r.Get("/", attendanceHandler.HandleList)
				r.Post("/check-in", attendanceHandler.HandleCheckIn)
				r.Post("/{id}/check-out", attendanceHandler.HandleCheckOut)
			})

			// OCA: Expenses
			r.Route("/expenses", func(r chi.Router) {
				r.Get("/", expenseHandler.HandleList)
				r.Post("/", expenseHandler.HandleCreate)
				r.Patch("/{id}", expenseHandler.HandleUpdate)
			})

			// OCA: Appraisals
			r.Route("/appraisals", func(r chi.Router) {
				r.Get("/", appraisalHandler.HandleList)
				r.Get("/templates", appraisalHandler.HandleListTemplates)
				r.Post("/", appraisalHandler.HandleCreate)
				r.Get("/{id}", appraisalHandler.HandleGet)
				r.Put("/{id}", appraisalHandler.HandleUpdate)
				r.Post("/{id}/confirm", appraisalHandler.HandleConfirm)
				r.Post("/{id}/complete", appraisalHandler.HandleComplete)
				r.Post("/{id}/reset", appraisalHandler.HandleReset)
			})

			// OCA: Training Courses
			r.Route("/courses", func(r chi.Router) {
				r.Get("/", courseHandler.HandleListCourses)
				r.Get("/categories", courseHandler.HandleListCategories)
				r.Post("/", courseHandler.HandleCreateCourse)
				r.Get("/{id}", courseHandler.HandleGetCourse)
				r.Put("/{id}", courseHandler.HandleUpdateCourse)
				r.Get("/schedules", courseHandler.HandleListSchedules)
				r.Post("/schedules", courseHandler.HandleCreateSchedule)
				r.Get("/schedules/{id}", courseHandler.HandleGetSchedule)
				r.Post("/schedules/{id}/advance", courseHandler.HandleAdvanceSchedule)
				r.Post("/schedules/{id}/reset", courseHandler.HandleResetSchedule)
				r.Post("/schedules/{id}/cancel", courseHandler.HandleCancelSchedule)
				r.Get("/schedules/{id}/attendees", courseHandler.HandleListAttendees)
				r.Patch("/attendees/{id}", courseHandler.HandleUpdateAttendeeResult)
			})

			// OCA: Projects
			r.Route("/projects", func(r chi.Router) {
				r.Get("/", projectHandler.HandleList)
				r.Get("/{id}", projectHandler.HandleGet)
				r.Get("/{id}/tasks", projectHandler.HandleListTasks)
			})
			r.Get("/tasks/{id}", projectHandler.HandleGetTask)

			// OCA: Fleet
			r.Route("/fleet", func(r chi.Router) {
				r.Get("/vehicles", fleetHandler.HandleListVehicles)
				r.Get("/vehicles/{id}", fleetHandler.HandleGetVehicle)
				r.Get("/vehicles/{id}/logs", fleetHandler.HandleListVehicleLogs)
			})
		})

		// Odoo Webhooks - outside auth group, uses HMAC token validation
		r.Post("/webhooks/odoo", handler.NewOdooWebhookHandler(asynqClient, cfg.OdooWebhookSecret).HandleWebhook)
	})

	addr := ":" + cfg.Port
	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("hr-api listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	<-sigCh
	log.Println("shutting down API server...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}
}

func runWorker(cfg *config.Config, queries *db.Queries, sigCh <-chan os.Signal) {
	redisAddr := redisAddrFromURL(cfg.RedisURL)
	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{
			Concurrency: 10,
			Queues: map[string]int{
				"default":  6,
				"critical": 3,
				"low":      1,
			},
			RetryDelayFunc: asynq.DefaultRetryDelayFunc,
		},
	)

	payrollProcessor := worker.NewPayrollProcessor(queries)
	webhookDeliverHandler := worker.NewWebhookDeliverHandler()
	odooSyncHandler := worker.NewOdooSyncHandler()

	mux := asynq.NewServeMux()
	mux.HandleFunc(service.TaskTypePayrollProcess, payrollProcessor.HandlePayrollProcess)
	mux.HandleFunc(service.TaskTypeWebhookDeliver, webhookDeliverHandler.ProcessTask)
	mux.HandleFunc(worker.TaskTypeOdooSync, odooSyncHandler.ProcessTask)

	go func() {
		log.Printf("asynq worker listening on %s", redisAddr)
		if err := srv.Run(mux); err != nil {
			log.Fatalf("worker: %v", err)
		}
	}()

	<-sigCh
	log.Println("shutting down worker...")
	srv.Shutdown()
}

func initJWTAuth(cfg *config.Config) (*jwtauth.JWTAuth, error) {
	if cfg.JWTPrivateKey != "" && cfg.JWTPublicKey != "" {
		privKey, err := os.ReadFile(cfg.JWTPrivateKey)
		if err != nil {
			return nil, err
		}
		pubKey, err := os.ReadFile(cfg.JWTPublicKey)
		if err != nil {
			return nil, err
		}
		ta, err := middleware.NewJWTAuth(privKey, pubKey)
		if err != nil {
			return nil, err
		}
		log.Println("JWT: using RS256 with RSA key pair")
		return ta, nil
	}
	log.Println("JWT: using HS256 (legacy mode)")
	return jwtauth.New("HS256", []byte(cfg.JWTSecret), nil), nil
}

// redisAddrFromURL extracts host:port from a redis:// URL.
func redisAddrFromURL(u string) string {
	// Strip redis:// prefix and any path/query
	addr := u
	if len(addr) > 8 && addr[:8] == "redis://" {
		addr = addr[8:]
	}
	// Remove path portion
	for i, c := range addr {
		if c == '/' {
			addr = addr[:i]
			break
		}
	}
	return addr
}
