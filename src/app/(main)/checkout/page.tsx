"use client";

import { Elements } from "@stripe/react-stripe-js";
import { usePaymentContext } from "@/contexts/PaymentContext";
import getStripe from "@/lib/stripe";

export default function CheckoutPage() {
  const { paymentIntentData } = usePaymentContext();

  if (!paymentIntentData) {
    return (
      <div className="page min-h-screen">
        <div className="border border-white text-center rounded-lg p-4">
          <h1>No payment intent data found</h1>
          <p>Please go back to your cart and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[600] text-blue-500 text-2xl">
        Complete your purchase
      </h1>
      <Elements
        stripe={getStripe()}
        options={{
          clientSecret: paymentIntentData?.client_secret,
        }}
      >
        <div>Payment form</div>
      </Elements>
    </div>
  );
}
