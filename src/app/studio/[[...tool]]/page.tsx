"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { hasSanity } from "@/lib/sanity/config";

/**
 * Embedded Sanity Studio (build-plan Prompt B). Client component so `sanity` stays
 * in the client/SSR graph (not RSC). Renders on the minimal root layout, outside
 * the (site) chrome group. Shows a configure notice until a project id is set.
 */
export default function StudioPage() {
  if (!hasSanity) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream px-6 text-center">
        <p className="font-body text-2xl text-olive-deep">Sanity Studio</p>
        <p className="max-w-md font-body text-sm text-espresso/70">
          Set <code className="text-olive">NEXT_PUBLIC_SANITY_PROJECT_ID</code> in{" "}
          <code className="text-olive">.env.local</code> to enable the embedded
          editor. The site runs on the bundled catalog until then.
        </p>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
