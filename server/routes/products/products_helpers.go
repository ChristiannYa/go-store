package products

import (
	"encoding/json"
	"go-store/server/models"
	"net/http"
)

// For error responses
func WriteMessageResponse(
	w http.ResponseWriter,
	statusCode int,
	message string,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

// For products data responses
func WriteProductsResponse(
	w http.ResponseWriter,
	statusCode int,
	products []models.Product,
) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(products)
}
