"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, useCartTab } from "@/hooks/useRedux";
import {
  selectCartItems,
  clearCart,
  selectCartTabStatus,
} from "@/lib/features/cart/cartSlice";
import useHandleCheckout from "@/hooks/useHandleCheckout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CartItem from "./CartItem";
import CartTotal from "./CartTotal";

export default function Cart() {
  const dispatch = useAppDispatch();
  const cartRef = useRef<HTMLDivElement | null>(null);
  const cartItems = useAppSelector(selectCartItems);
  const cartTabStatus = useAppSelector(selectCartTabStatus);
  const { handleCartTabStatus } = useCartTab();

  const {
    handleCheckout,
    isCheckoutLoading,
    checkoutError,
    resetCheckoutState,
  } = useHandleCheckout();

  const noCartItems = cartItems.length === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartTabStatus &&
        cartRef.current &&
        !cartRef.current.contains(event.target as Node)
      ) {
        handleCartTabStatus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleCartTabStatus, cartTabStatus]);

  useEffect(() => {
    if (checkoutError) {
      const timer = setTimeout(() => {
        resetCheckoutState();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [checkoutError, resetCheckoutState]);

  return (
    <>
      <div
        ref={cartRef}
        className={`bg-black-fg/10 dark:bg-white/5 backdrop-blur-xl transform transition-transform duration-500 w-[20.625rem] md:w-[25rem] h-full p-2 grid grid-rows-[60px_1fr_40px] fixed top-0 right-0 ${
          cartTabStatus === false ? "translate-x-full" : ""
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <h2 className="font-dream-avenue font-[500] text-3xl text-center">
            Your Bag
          </h2>
        </div>

        <div className="overflow-y-auto px-2 pb-3.5">
          {noCartItems ? (
            <p className="font-poppins font-[300] text-center">Empty</p>
          ) : (
            <div>
              <div className="space-y-2.5">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              <hr className="my-2 text-white/20" />
              <CartTotal />
              <div className="flex justify-end">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="bg-red-500 hover:bg-red-500/80 dark:hover:bg-red-600 text-white-fg dark:hover:text-red-100 rounded-full cursor-pointer w-[22px] h-[22px] flex justify-center items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[0.6rem]" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="font-dm-sans w-full flex gap-x-2">
          <button
            onClick={handleCartTabStatus}
            className="bg-neutral-900 hover:bg-[#1d1d1d] text-white-fg cursor-pointer w-full py-1"
          >
            Close
          </button>
          <button
            onClick={() => handleCheckout({ cartItems })}
            disabled={isCheckoutLoading || noCartItems}
            className={`bg-neutral-100 text-black text-black-fg w-full py-1 ${
              isCheckoutLoading || noCartItems
                ? "bg-opacity-20 cursor-default"
                : "hover:bg-neutral-300"
            }`}
          >
            {isCheckoutLoading ? "Loading..." : "Checkout"}
          </button>
        </div>
      </div>
      {/* Popup for checkout error. It should appear once the 
      cart is closed when there is an error because the cart tab
      takes a lot of space of the page, leaving no space for the
      error popup. */}
      {checkoutError && (
        <div className="bg-red-300 text-red-600 rounded-md w-[20rem] py-2 px-0.5 flex justify-center items-center fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <p className="font-poppins font-[500]">{checkoutError}</p>
        </div>
      )}
    </>
  );
}
