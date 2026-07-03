import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/styles/fonts";

export const metadata: Metadata = {
  title: {
    default: "A Paramount Engineering Works — Crafting Divine Elegance",
    template: "%s · A Paramount",
  },
  description:
    "Since 1968, Mumbai. Makers of Jain Derasar and Hindu temple accessories — exquisite craftsmanship that blends devotion, tradition and timeless beauty.",
};

// Minimal root layout — site chrome lives in app/(site)/layout.tsx so the
// embedded Studio at /studio renders without Header/Footer/ScrollSmoother.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="min-h-full bg-background font-body text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
