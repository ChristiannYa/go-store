"use client";
import HomePageHeader from "@/components/HomePageHeader";
import HomePageFooter from "@/components/HomePageFooter";
import ProductsList from "./products/ProductsList";

export default function Home() {
  return (
    <div className="font-mono grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-dvh gap-4 p-4">
      <HomePageHeader />
      <div className="mx-auto w-[min(96%,12000px)] pt-6 pb-4">
        <ProductsList />
      </div>
      <HomePageFooter />
    </div>
  );
}
