import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/styles/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";

export const metadata: Metadata = {
  title: {
    default: "A Paramount Engineering Works — Crafting Divine Elegance",
    template: "%s · A Paramount",
  },
  description:
    "Since 1968, Mumbai. Makers of Jain Derasar and Hindu temple accessories — exquisite craftsmanship that blends devotion, tradition and timeless beauty.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="min-h-full bg-background font-body text-foreground antialiased">
        {/* Header sits OUTSIDE #smooth-wrapper so it stays pinned to the viewport. */}
        <Header />
        <SmoothScrollProvider>
          <main>{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
