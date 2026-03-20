package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	fmt.Println("worker starting")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	waitForShutdown(ctx)
	fmt.Println("worker shutting down")
}

func waitForShutdown(ctx context.Context) {
	<-ctx.Done()
}
