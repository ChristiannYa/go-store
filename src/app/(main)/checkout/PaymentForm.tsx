"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { usePaymentContext } from "@/contexts/PaymentContext";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { paymentIntentData } = usePaymentContext();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL after payment completion
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setPaymentError(error.message || "An error occurred during payment");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900 text-white rounded-lg p-6">
        <h3 className="font-[600] text-lg mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="bg-red-200 border border-red-500 text-red-600 rounded px-3 py-2">
          {paymentError}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: ${((paymentIntentData?.amount || 0) / 100).toFixed(2)}
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`font-[600] rounded-lg px-6 py-3 ${
            !stripe || isProcessing
              ? "bg-gray-400/20 cursor-default"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
}
