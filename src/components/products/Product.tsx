import { Product as Prd } from "@/app/definitions";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  addItemToCart,
  removeItemFromCart,
  selectIsItemInCart,
} from "@/lib/features/cart/cartSlice";

export default function Product({ product }: { product: Prd }) {
  const dispatch = useAppDispatch();

  const isProductInBag = useAppSelector((state) =>
    selectIsItemInCart(state, product.id)
  );

  const handleAddToBag = () => {
    if (!isProductInBag) {
      dispatch(
        addItemToCart({
          id: product.id,
          item: product.name,
          price: product.price,
        })
      );
      return;
    }

    dispatch(removeItemFromCart(product.id));
  };

  return (
    <li
      key={product.id}
      className="bg-slate-600/20 rounded-lg w-[300px] p-4 grid grid-rows-[auto_auto_1fr_auto]"
    >
      <h2 className="uppercase text-blue-500">{product.name}</h2>
      <p className="text-slate-400 leading-none mb-1">{product.category}</p>
      <p>{product.description}</p>
      <div className="flex justify-between items-center mt-1">
        <p className="text-lg">${product.price}</p>
        <button
          onClick={handleAddToBag}
          className={`text-sm px-2 py-0.5 rounded-md ${
            isProductInBag
              ? "bg-blue-700"
              : "bg-slate-300/10 hover:bg-blue-700 text-slate-300"
          }`}
        >
          {isProductInBag ? "In cart" : "Add to cart"}
        </button>
      </div>
    </li>
  );
}
