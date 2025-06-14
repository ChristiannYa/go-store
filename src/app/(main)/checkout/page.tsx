"use client";

import { Elements } from "@stripe/react-stripe-js";
import { usePaymentContext } from "@/contexts/PaymentContext";
import getStripe from "@/lib/stripe";
import PaymentForm from "./PaymentForm";
import HomeButton from "@/components/HomeButton";

export default function CheckoutPage() {
  const { paymentIntentData } = usePaymentContext();

  if (!paymentIntentData) {
    return (
      <div className="page min-h-screen">
        <div className="border border-white text-center rounded-lg p-4">
          <h1>No payment data found</h1>
        </div>
        <HomeButton />
      </div>
    );
  }

  const appearance = {
    theme: "night" as const,
    labels: "floating" as const,
    variables: {
      colorPrimary: "rgba(255, 255, 255)",
      colorBackground: "oklch(27.9% 0.041 260.031)",
      colorText: "oklch(87.2% 0.01 258.338)",
      colorDanger: "oklch(57.7% 0.245 27.325)",
      borderRadius: "0.4rem",
      fontFamily: "monospace",
    },
  };

  return (
    <div className="page min-h-full">
      <div className="mx-auto w-[min(96%,600px)]">
        <h1 className="font-[600] text-2xl text-center mb-4">
          Complete your purchase
        </h1>
        <Elements
          stripe={getStripe()}
          options={{
            clientSecret: paymentIntentData?.client_secret,
            appearance,
          }}
        >
          <PaymentForm />
        </Elements>
        <div className="flex justify-start">
          <HomeButton />
        </div>
      </div>
    </div>
  );
}
