import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServerStatusProvider } from "@/contexts/ServerStatusContext";
import { TokenProvider } from "@/contexts/TokenContext";
import { UserProvider } from "@/contexts/UserContext";
import { StoreProvider } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Go Store",
  description: "Your one-stop shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServerStatusProvider>
          <StoreProvider>
            <TokenProvider>
              <UserProvider>{children}</UserProvider>
            </TokenProvider>
          </StoreProvider>
        </ServerStatusProvider>
      </body>
    </html>
  );
}
