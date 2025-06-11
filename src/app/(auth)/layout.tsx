import type { Metadata } from "next";
import AuthFormLayout from "@/components/layout/AuthFormLayout";

export const metadata: Metadata = {
  title: "Authentication - Go Store",
  description: "Login or register for Go Store",
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthFormLayout>{children}</AuthFormLayout>;
}
