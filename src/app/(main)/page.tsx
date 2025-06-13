"use client";

import Products from "@/components/products/Products";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col justify-center items-center">
      <div className="mx-auto w-[min(96%,12000px)] pt-6 pb-4">
        <Products />
      </div>
    </div>
  );
}
