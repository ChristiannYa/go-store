"use client";

import ProductsList from "@/app/products/ProductsList";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col justify-center items-center">
      <div className="mx-auto w-[min(96%,12000px)] pt-6 pb-4">
        <ProductsList />
      </div>
    </div>
  );
}
