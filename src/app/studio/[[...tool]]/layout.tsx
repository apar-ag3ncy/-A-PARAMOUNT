import type { Metadata, Viewport } from "next";

// Server layout carries the route config + metadata so the page can be a client
// component (required: sanity's `import useSWR from "swr"` has no default export
// under Turbopack's react-server condition, so it must stay out of the RSC graph).
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
