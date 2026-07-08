"use client";

import { useRef } from "react";
import AssetFrame from "@/components/ui/AssetFrame";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import type { SanityImage } from "@/types/sanity";

interface Props {
  title: string;
  material: string;
  ratio?: string;
  image?: SanityImage | null;
  /** Local photo path (catalog `image`) — shown uncropped, like MasonryItem. */
  src?: string;
}

/**
 * Product gallery (PARAMOUNT_SCROLL_UI_PROMPT.md §3). Crossfades in place when
 * the active material changes (400ms) — structurally correct today with empty
 * frames, cinematic once photography lands.
 */
export default function ProductGallery({
  title,
  material,
  ratio = "4/5",
  image,
  src,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(ref.current, { opacity: 1 });
      return;
    }
    gsap.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
    );
  }, [material]);

  return (
    <div ref={ref}>
      <AssetFrame
        image={image ?? null}
        src={src}
        alt={title}
        fit={src ? "contain" : "cover"}
        ratio={ratio}
        caption={material === "Standard" ? title : `${title} · ${material}`}
        priority
      />
    </div>
  );
}
