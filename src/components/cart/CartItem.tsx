"use client";

import {
  incrementQuantity,
  decrementQuantity,
  removeItemFromCart,
} from "@/lib/features/cart/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { CartItem as CrtIt } from "@/app/definitions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const CartItem = ({ item }: { item: CrtIt }) => {
  const dispatch = useAppDispatch();

  return (
    <div className="w-full">
      <div className="bg-gray-200/10 rounded-xs px-2.5 py-2 flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-y-2">
        <div className="space-y-1">
          <div className="flex gap-x-1 items-center">
            <h3 className="font-[500] text-gray-300">{item.name}</h3>
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faXmark}
                className="text-gray-300/65 text-[0.6rem]"
              />
              <p className="text-gray-300/65">{item.quantity}</p>
            </div>
          </div>
          <p className="text-gray-300 border-l-2 leading-tight w-fit pl-1">
            ${item.price.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-x-3 max-md:mt-1">
          <div className="bg-white-fg/3 rounded-full p-1.5 flex gap-x-2.5 items-center">
            <button
              className="hover:bg-white/10 rounded-full cursor-pointer w-[1.625rem] h-[1.625rem] flex justify-center items-center"
              onClick={() => dispatch(decrementQuantity(item.id))}
            >
              <FontAwesomeIcon icon={faMinus} className="text-white-fg/90" />
            </button>
            <button
              className="hover:bg-white/10 rounded-full cursor-pointer w-[1.625rem] h-[1.625rem] flex justify-center items-center"
              onClick={() => dispatch(incrementQuantity(item.id))}
            >
              <FontAwesomeIcon icon={faPlus} className="text-white-fg/90" />
            </button>
          </div>
          <button
            onClick={() => dispatch(removeItemFromCart(item.id))}
            className="hover:bg-white/10 rounded-full cursor-pointer w-[1.625rem] h-[1.625rem] flex justify-center items-center"
          >
            <FontAwesomeIcon icon={faXmark} className="text-white-fg/90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
