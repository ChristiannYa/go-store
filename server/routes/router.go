package routes

import (
	"go-auth/server/routes/auth"
	"go-auth/server/routes/user"
	"go-auth/server/routes/website"
	"net/http"
)

func SetupRoutes(mux *http.ServeMux) {
	SetupAuthRoutes(mux)
	SetupWebsiteRoutes(mux)
	SetupUserRoutes(mux)
}

func SetupAuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/register", auth.Register)
	mux.HandleFunc("POST /api/auth/login", auth.Login)
}

func SetupUserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/user/me", user.GetCurrentUser)
}

func SetupWebsiteRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/website/protected", website.Protected)
}
