"use client";

import { Lexend } from "next/font/google";
import "./globals.css";
import TopHeader from "@/components/TopHeader";
import BottomNav from "@/components/BottomNav";
import UsabilityPanel from "@/components/UsabilityPanel";
import { Suspense } from "react";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lexend",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <title>Soilmate</title>
        <meta name="theme-color" content="#172F2C" />
      </head>
      <body className={`${lexend.variable} font-lexend`}>
        <div className="h-dvh bg-gray-300">
          <div className="mx-auto h-dvh w-full max-w-[420px] bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <TopHeader />
              <main className="no-scrollbar flex-1 overflow-y-auto pb-20">
                {children}
              </main>
              <BottomNav />
              <Suspense fallback={null}>
                <UsabilityPanel />
              </Suspense>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
