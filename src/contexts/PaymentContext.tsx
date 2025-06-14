"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem } from "@/app/definitions";

interface PaymentIntentData {
  client_secret: string;
  id: string;
  amount: number;
  currency: string;
  cart_items: CartItem[];
}

interface PaymentContextType {
  paymentIntentData: PaymentIntentData | null;
  setPaymentIntentData: (data: PaymentIntentData | null) => void;
  isPaymentLoading: boolean;
  setIsPaymentLoading: (loading: boolean) => void;
  paymentError: string | null;
  setPaymentError: (error: string | null) => void;
  resetPayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [paymentIntentData, setPaymentIntentData] =
    useState<PaymentIntentData | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const resetPayment = () => {
    setPaymentIntentData(null);
    setPaymentError(null);
    setIsPaymentLoading(false);
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentIntentData,
        setPaymentIntentData,
        isPaymentLoading,
        setIsPaymentLoading,
        paymentError,
        setPaymentError,
        resetPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePaymentContext must be used within PaymentProvider");
  }
  return context;
};
