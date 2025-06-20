package api

import (
	"encoding/json"
	"net/http"
	"time"
)

func Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)

	response := map[string]any{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
	}

	json.NewEncoder(w).Encode(response)
}
