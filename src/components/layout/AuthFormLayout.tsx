"use client";

import { useAppSelector } from "@/hooks/useRedux";
import { selectCartTabStatus } from "@/lib/features/cart/cartSlice";
import HomePageFooter from "@/components/layout/HomePageFooter";
import Cart from "@/components/cart/Cart";

export default function AuthFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartTabStatus = useAppSelector(selectCartTabStatus);

  return (
    <>
      <div
        className={`h-fit transition-all duration-500 ${
          cartTabStatus
            ? "-translate-x-64 blur-xs no-doc-scroll pointer-events-none"
            : "blur-none"
        }`}
      >
        <div className="min-h-dvh py-3 grid grid-rows-[1fr_auto]">
          <main className="h-full">{children}</main>
          <HomePageFooter />
        </div>
      </div>
      <Cart />
    </>
  );
}
