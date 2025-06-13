"use client";

import { useState } from "react";
import { useCartTab } from "@/hooks/useRedux";
import { CartItem } from "@/app/definitions";

export default function useHandleCheckout() {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { handleCartTabStatus } = useCartTab();

  const handleCheckout = async ({
    cartItems,
  }: {
    cartItems: CartItem[];
  }): Promise<void> => {
    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart_items: cartItems,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Error creating payment intent", data);
        setCheckoutError(data.message || "Error creating payment intent");
        setIsCheckoutLoading(false);
        handleCartTabStatus();
        return;
      }

      console.log("Payment Intent:", data);
      setIsCheckoutLoading(false);
      handleCartTabStatus();
    } catch (error) {
      console.log(
        "A network error occurred when creating the payment intent",
        error
      );
      setCheckoutError(
        "A network error occurred when creating the payment intent"
      );
      setIsCheckoutLoading(false);
      handleCartTabStatus();
    }
  };

  const resetCheckoutState = () => {
    setCheckoutError(null);
  };

  return {
    handleCheckout,
    isCheckoutLoading,
    checkoutError,
    resetCheckoutState,
  };
}
