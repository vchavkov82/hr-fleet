package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/vchavkov/hr/services/api/internal/config"
	"github.com/vchavkov/hr/services/api/internal/db"
	"github.com/vchavkov/hr/services/api/internal/service"
	"github.com/vchavkov/hr/services/api/internal/worker"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	queries := db.New(pool)

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

	mux := asynq.NewServeMux()
	mux.HandleFunc(service.TaskTypePayrollProcess, payrollProcessor.HandlePayrollProcess)
	mux.HandleFunc(service.TaskTypeWebhookDeliver, webhookDeliverHandler.ProcessTask)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

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

// redisAddrFromURL extracts host:port from a redis:// URL.
func redisAddrFromURL(u string) string {
	addr := u
	if len(addr) > 8 && addr[:8] == "redis://" {
		addr = addr[8:]
	}
	for i, c := range addr {
		if c == '/' {
			addr = addr[:i]
			break
		}
	}
	return addr
}
