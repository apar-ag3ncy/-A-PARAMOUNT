"use client";

import { usePathname } from "next/navigation";

/** Routes that deliberately end on their content, with no footer. */
const NO_FOOTER = new Set(["/gallery"]);

/**
 * The site layout is a Server Component, so it can't branch on the route. This
 * thin client wrapper can: it takes the (server-rendered) <Footer /> as children
 * and drops it on the routes that own their own ending. /gallery is one long
 * pinned Cover Flow — a footer after it would land mid-scroll-runway and break
 * the showcase.
 */
export default function ConditionalFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname && NO_FOOTER.has(pathname)) return null;
  return <>{children}</>;
}
