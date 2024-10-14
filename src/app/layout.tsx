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
  title: "LakbAI App",
  description:
    "An AI powered itinerary creator web app with collaboration capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClerkProvider>
          <TripsContextProvider>
            <ActivitiesContextProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
              <Toaster />
            </ActivitiesContextProvider>
          </TripsContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
