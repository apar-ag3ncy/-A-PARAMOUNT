"use client";

import Image from "next/image";
import { useState } from "react";
import type { SanityImage } from "@/types/sanity";
import { cn } from "@/lib/utils";

interface AssetFrameProps {
  /** Sanity image; null/undefined -> elegant placeholder frame. */
  image?: SanityImage | null;
  /** Direct URL (local/dev or pre-resolved); overrides `image`. */
  src?: string;
  alt?: string;
  /** "3/4" | "4/5" | "1/1" | "4/3" | "2/3" — drives the frame height. */
  ratio?: string;
  /** Product name — shown as a plate beneath the frame. */
  caption?: string;
  priority?: boolean;
  /** ScrollSmoother data-speed for masonry depth parallax (desktop). */
  depth?: number;
  sizes?: string;
  className?: string;
  /** Extra classes on the inner frame (e.g. group-hover border states). */
  frameClassName?: string;
}

const DEFAULT_SIZES =
  "(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw";

// TODO(Prompt B): swap for urlFor(image).width(1200).url() once the Sanity client lands.
function resolveSanityUrl(_image?: SanityImage | null): string | null {
  return null;
}

/**
 * AssetFrame (PARAMOUNT_SCROLL_UI_PROMPT.md §1).
 * One component, two states. Branches on whether a real image resolves — so the
 * whole site fills in automatically when photos are added in Sanity. The empty
 * state is a gallery frame awaiting art (motif + breath-slow shimmer), never a
 * loading skeleton.
 */
export default function AssetFrame({
  image,
  src,
  alt,
  ratio = "3/4",
  caption,
  priority = false,
  depth,
  sizes = DEFAULT_SIZES,
  className,
  frameClassName,
}: AssetFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const url = src ?? resolveSanityUrl(image);
  const hotspot = image?.hotspot;
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : "center";

  return (
    <figure className={cn("group", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-image border border-olive/40 bg-gradient-to-b from-cream-deep to-[#E9DBC0]",
          frameClassName,
        )}
        style={{ aspectRatio: ratio }}
        data-speed={depth}
      >
        {/* -- empty state: a frame awaiting art -- */}
        {(!url || !loaded) && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden={!!url}
          >
            {/* centered brand motif — arch monogram at 6% */}
            <svg
              viewBox="0 0 100 120"
              className="w-[38%] text-olive opacity-[0.06]"
              fill="none"
              stroke="currentColor"
              strokeWidth={4.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M50,4 l5,6 -5,6 -5,-6 z" fill="currentColor" stroke="none" />
              <path d="M22,112 L22,58 C22,34 35,18 50,12 C65,18 78,34 78,58 L78,112" />
              <path d="M33,112 L33,60 C33,41 41,28 50,23 C59,28 67,41 67,60 L67,112" />
              <path d="M50,44 L40,96 M50,44 L60,96 M44,78 L56,78" strokeWidth={3.6} />
            </svg>

            {/* status plate */}
            <span className="absolute right-0 bottom-4 left-0 text-center font-display text-[10px] tracking-[0.24em] text-olive/45 uppercase">
              Image coming soon
            </span>

            {/* slow diagonal shimmer — a breath, not a pulse (disabled under reduced-motion) */}
            {!url && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 w-1/2"
                  style={{
                    background:
                      "linear-gradient(100deg, transparent 0%, rgba(255,252,240,0.55) 50%, transparent 100%)",
                    animation: "pm-shimmer 5s ease-in-out infinite",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* -- filled state: crossfades in over the empty frame -- */}
        {url && (
          <Image
            src={url}
            alt={alt ?? image?.alt ?? caption ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            placeholder={image?.blurDataURL ? "blur" : "empty"}
            blurDataURL={image?.blurDataURL}
            onLoad={() => setLoaded(true)}
            className={cn(
              "object-cover transition-opacity duration-[600ms] ease-out",
              loaded ? "opacity-100" : "opacity-0",
            )}
            style={{ objectPosition }}
          />
        )}
      </div>

      {caption && (
        <figcaption className="mt-3 text-center font-display text-xs tracking-[0.18em] text-olive-deep uppercase">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
