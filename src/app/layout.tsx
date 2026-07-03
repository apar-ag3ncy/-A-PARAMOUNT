import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/styles/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
      <body className="flex min-h-full flex-col bg-background font-body text-foreground antialiased">
        {/* TODO(PARAMOUNT_SCROLL_UI_PROMPT.md §0): wrap in SmoothScrollProvider
            + #smooth-wrapper / #smooth-content when the animation layer lands. */}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
