import MainLayout from "@/components/layout/MainLayout";

export default function AppMainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
