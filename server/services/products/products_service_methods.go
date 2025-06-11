package services

import (
	"go-store/server/models"
)

func (s *ProductsService) GetProducts() (
	[]models.Product, error,
) {
	getProductsQuery := `
		SELECT
			id,
			name,
			description,
			price,
			stock_quantity,
			category
		FROM products
	`

	rows, err := s.db.Query(getProductsQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product

	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.Price,
			&product.StockQuantity,
			&product.Category,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}
