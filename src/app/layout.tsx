import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ActivitiesContextProvider,
  TripsContextProvider,
} from "./_context/AppContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LakbAI",
  description:
    "An AI powered trip planner application with collaboration capabilities.",
  keywords: ["itinerary creator", "trip planner"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.95em%22 font-size=%2280%22>🐸</text></svg>"
        />
      </head>
      <body className={`${inter.className} grainy-light antialiased`}>
        <ClerkProvider>
          <TripsContextProvider>
            <ActivitiesContextProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
              <Toaster />
              <Footer />
            </ActivitiesContextProvider>
          </TripsContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
