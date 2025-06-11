package config

import (
	"log"
)

// Seed all tables with initial data
func SeedTables() {
	seedProducts()
}

// Seed products table with initial fruit cup data
func seedProducts() {
	// Check if products already exist
	var productsCount int
	countProductsQuery := "SELECT COUNT(*) FROM products"
	err := DB.QueryRow(countProductsQuery).Scan(&productsCount)
	if err != nil {
		log.Fatalf("❌ Failed to check products count: %v", err)
	}

	// Skip seeding if products already exist
	if productsCount > 0 {
		return
	}

	insertProductsQuery := `
		INSERT INTO products (name, description, price, stock_quantity, category) VALUES
		('Tropical Paradise Cup', 'Fresh pineapple, mango, and coconut fruit cup', 8.99, 50, 'Tropical'),
		('Island Breeze Cup', 'Papaya, guava, and star fruit with lime zest', 9.49, 45, 'Tropical'),
		('Berry Blast Cup', 'Mixed berries with strawberries, blueberries, and raspberries', 7.49, 75, 'Berry'),
		('Wild Berry Mix Cup', 'Blackberries, cranberries, and gooseberries', 7.99, 65, 'Berry'),
		('Citrus Sunrise Cup', 'Orange, grapefruit, and lime segments with mint', 6.99, 60, 'Citrus'),
		('Citrus Medley Cup', 'Grapefruit, blood orange, and yuzu with honey', 7.29, 55, 'Citrus'),
		('Garden Fresh Cup', 'Pear, apple, and grapes with cinnamon', 6.29, 90, 'Classic'),
		('Traditional Mix Cup', 'Banana, orange, and apple with lemon juice', 5.79, 95, 'Classic'),
		('Rare Fruit Cup', 'Rambutan, lychee, and longan with mint', 10.49, 25, 'Exotic'),
		('Tropical Exotic Cup', 'Durian, jackfruit, and mangosteen', 11.99, 20, 'Exotic'),
		('Autumn Harvest Cup', 'Persimmon, pomegranate, and figs', 8.49, 35, 'Seasonal'),
		('Spring Fresh Cup', 'Fresh apricots, plums, and early berries', 7.79, 45, 'Seasonal')
	`

	_, err = DB.Exec(insertProductsQuery)
	if err != nil {
		log.Fatalf("❌ Failed to seed products: %v", err)
	}

	log.Println("🌱 Products seeded successfully")
}
