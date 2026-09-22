import PageEnter from "@/components/animations/PageEnter";

/**
 * Per-navigation enter transition. App Router remounts template.tsx on every
 * route change, so PageEnter plays its curtain wipe each time — skipped on the
 * initial load, which the LoadingScreen / home film already own.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
