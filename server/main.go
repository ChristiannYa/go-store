package main

import (
	"log"
	"net/http"

	"go-store/server/config"
	"go-store/server/routes"
	"go-store/server/utils"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("🟡 no .env file found")
	}

	config.ConnectDB()
	defer config.CloseDB()

	go utils.StartTokenCleanup()

	// Setup routes
	mux := http.NewServeMux()
	routes.SetupRoutes(mux)

	// Setup CORS and wrap router
	corsHandler := config.SetupCORS()
	handler := corsHandler.Handler(mux)

	// Setup graceful shutdown
	utils.SetupGracefulShutdown()

	log.Println("🚀 Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
