import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { usePaymentContext } from "@/contexts/PaymentContext";
import { useCartTab } from "@/hooks/useRedux";
import { CartItem } from "@/app/definitions";

export default function useCheckout() {
  const { handleCartTabStatus } = useCartTab();
  const router = useRouter();
  const { user } = useUser();

  const {
    setPaymentIntentData,
    paymentError,
    setPaymentError,
    isPaymentLoading,
    setIsPaymentLoading,
  } = usePaymentContext();

  const handlePayment = async ({
    cartItems,
  }: {
    cartItems: CartItem[];
  }): Promise<void> => {
    if (!user) {
      setPaymentError("You must be logged in to checkout");
      setIsPaymentLoading(false);
      handleCartTabStatus();
      return;
    }

    setIsPaymentLoading(true);
    setPaymentError(null);

    try {
      const response = await apiClient.post(
        "/api/stripe/create-payment-intent",
        {
          cart_items: cartItems,
          user: {
            email: user.email,
            name: `${user.name} ${user.last_name}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        setPaymentError(data.message || "Error creating payment intent");
        setIsPaymentLoading(false);
        handleCartTabStatus();
        return;
      }

      setPaymentIntentData(data);
      setIsPaymentLoading(false);
      handleCartTabStatus();
      router.push("/checkout");
    } catch (error) {
      console.log(error);
      setPaymentError(
        "A network error occurred when creating the payment intent"
      );
      setIsPaymentLoading(false);
      handleCartTabStatus();
    }
  };

  const resetCheckoutState = () => {
    setPaymentError(null);
  };

  return {
    handlePayment,
    isPaymentLoading,
    paymentError,
    resetCheckoutState,
  };
}
