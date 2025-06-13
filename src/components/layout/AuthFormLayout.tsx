"use client";

import HomePageFooter from "@/components/layout/HomePageFooter";

export default function AuthFormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-dvh py-3 grid grid-rows-[1fr_auto]">
        <main className="h-full">{children}</main>
        <HomePageFooter />
      </div>
    </>
  );
}
