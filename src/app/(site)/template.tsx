/**
 * Per-navigation enter transition (build-plan Prompt H). App Router remounts
 * template.tsx on every route change; the CSS fade replays each time. Opacity
 * only — no transform — so it never creates a containing block that would break
 * ScrollSmoother/ScrollTrigger pins. Auto-instant under reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="pm-page-enter">{children}</div>;
}
