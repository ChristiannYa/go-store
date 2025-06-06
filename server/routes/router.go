package routes

import (
	"go-auth/server/middleware"
	"go-auth/server/routes/api"
	"go-auth/server/routes/auth"
	"go-auth/server/routes/user"
	"net/http"
)

func SetupRoutes(mux *http.ServeMux) {
	SetupApiRoutes(mux)
	SetupAuthRoutes(mux)
	SetupUserRoutes(mux)
}

func SetupApiRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/health", middleware.JSONHandler(api.Health))
}

func SetupAuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/forgot-password", middleware.JSONHandler(auth.ForgotPassword))
	mux.HandleFunc("POST /api/auth/login", middleware.JSONHandler(auth.Login))
	mux.HandleFunc("POST /api/auth/logout", middleware.JSONHandler(auth.Logout))
	mux.HandleFunc("POST /api/auth/refresh", middleware.JSONHandler(auth.RefreshToken))
	mux.HandleFunc("POST /api/auth/register", middleware.JSONHandler(auth.Register))
	mux.HandleFunc("POST /api/auth/reset-password", middleware.JSONHandler(auth.ResetPassword))
	mux.HandleFunc("POST /api/auth/verify", middleware.JSONHandler(auth.VerifyToken))
}

func SetupUserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/user/me", middleware.JSONHandler(middleware.AuthMiddleware(user.GetMe)))
}
