package routes

import (
	"go-auth/server/middleware"
	"go-auth/server/routes/auth"
	"go-auth/server/routes/user"
	"net/http"
)

func SetupRoutes(mux *http.ServeMux) {
	SetupAuthRoutes(mux)
	SetupUserRoutes(mux)
}

func SetupAuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/register", auth.Register)
	mux.HandleFunc("POST /api/auth/login", auth.Login)
	mux.HandleFunc("POST /api/auth/refresh", auth.RefreshToken)
	mux.HandleFunc("POST /api/auth/logout", auth.Logout)
	mux.HandleFunc("POST /api/auth/verify", auth.VerifyToken)
}

func SetupUserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/user/me", middleware.AuthMiddleware(user.GetCurrentUser))
}
