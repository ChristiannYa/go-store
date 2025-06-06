package user

import (
	"go-auth/server/config"
	"go-auth/server/middleware"
	"go-auth/server/services"
	"net/http"
)

func GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r)
	if !ok {
		WriteMessageResponse(
			w,
			http.StatusUnauthorized,
			"Unauthorized",
		)
		return
	}

	userService := services.NewUserService(config.DB)
	user, err := userService.GetUserByID(userID)
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Internal server error",
		)
		return
	}

	if user == nil {
		WriteMessageResponse(
			w,
			http.StatusNotFound,
			"User not found",
		)
		return
	}

	WriteUserResponse(
		w,
		http.StatusOK,
		user,
	)
}
