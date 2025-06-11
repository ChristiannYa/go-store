import { useProducts } from "@/hooks/useProducts";
import { Product } from "../definitions";

export default function ProductsList() {
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
          {products.map((product: Product) => (
            <li
              key={product.id}
              className="bg-slate-600/20 rounded-lg w-[300px] p-4 grid grid-rows-[auto_auto_1fr_auto]"
            >
              <h2 className="uppercase text-blue-500">{product.name}</h2>
              <p className="text-slate-400 leading-none mb-1">
                {product.category}
              </p>
              <p>{product.description}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-lg">${product.price}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-sm px-2 py-0.5">
                  Add to cart
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
