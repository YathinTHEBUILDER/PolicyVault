import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { RealtimeSync } from "@/components/layout/RealtimeSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolicyVault | Insurance Brokerage CRM",
  description: "Secure, production-ready CRM for insurance brokerages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RealtimeSync />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
