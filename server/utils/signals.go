package utils

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"go-store/server/config"
)

// SetupGracefulShutdown sets up signal handling for graceful shutdown
func SetupGracefulShutdown() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("🛑 Shutting down...")
		config.CloseDB()
		os.Exit(0)
	}()
}
