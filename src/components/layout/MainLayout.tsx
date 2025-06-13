"use client";

import { useAppSelector } from "@/hooks/useRedux";
import { selectCartTabStatus } from "@/lib/features/cart/cartSlice";
import HomePageHeader from "@/components/layout/HomePageHeader";
import HomePageFooter from "@/components/layout/HomePageFooter";
import Cart from "@/components/cart/Cart";

export default function MainLayout({
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
            ? "-translate-x-64 blur-lg no-doc-scroll pointer-events-none"
            : "blur-none"
        }`}
      >
        <div className="min-h-dvh py-3 grid grid-rows-[auto_1fr_auto]">
          <HomePageHeader />
          <main className="h-full">{children}</main>
          <HomePageFooter />
        </div>
      </div>
      <Cart />
    </>
  );
}
