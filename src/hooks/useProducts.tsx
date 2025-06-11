import { useState, useEffect } from "react";
import { longApiTimeout } from "@/constants/apiCall";
import { Product } from "@/app/definitions";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
          {
            method: "GET",
            signal: AbortSignal.timeout(longApiTimeout),
          }
        );

        if (!response.ok) {
          setProductsError("Failed to load products");
          return;
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products", err);
        setProductsError("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loadingProducts, productsError };
};
