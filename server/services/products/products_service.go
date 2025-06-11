package services

import (
	"database/sql"
)

type ProductsService struct {
	db *sql.DB
}

func NewProductsService(db *sql.DB) *ProductsService {
	return &ProductsService{db: db}
}
