import { Product as Prd } from "@/app/definitions";
import { useProducts } from "@/hooks/useProducts";
import Product from "./Product";

/*
  TODO: cache the products in the browser
  so that we don't have to fetch them on every page load
  unless the products change
*/

export default function Products() {
  const { products, loadingProducts, productsError } = useProducts();

  return (
    <div>
      {loadingProducts ? (
        /* We could add a loading state, but most of the
        loading is handled by the server checking page */
        <></>
      ) : productsError ? (
        <p>{productsError}</p>
      ) : (
        <ul className="flex flex-wrap gap-4 justify-center">
          {products.map((product: Prd) => (
            <Product key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
