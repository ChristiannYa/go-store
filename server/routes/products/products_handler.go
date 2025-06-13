package products

import (
	"go-store/config"
	services "go-store/services/products"
	"net/http"
)

func Products(w http.ResponseWriter, r *http.Request) {
	productService := services.NewProductsService(config.DB)

	products, err := productService.GetProducts()
	if err != nil {
		WriteMessageResponse(
			w,
			http.StatusInternalServerError,
			"Failed to fetch products",
		)
		return
	}

	WriteProductsResponse(
		w,
		http.StatusOK,
		products,
	)
}
