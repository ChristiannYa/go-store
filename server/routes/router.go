package routes

import (
	"go-auth/server/routes/auth"
	"go-auth/server/routes/website"
	"net/http"
)

func SetupRoutes(mux *http.ServeMux) {
	SetupAuthRoutes(mux)
	SetupWebsiteRoutes(mux)
}

func SetupAuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/auth/register", auth.Register)
	mux.HandleFunc("/api/auth/login", auth.Login)
}

func SetupWebsiteRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/website/protected", website.Protected)
}
