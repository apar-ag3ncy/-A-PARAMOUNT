"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SanityImage } from "@/types/sanity";
import type { SanityImageSource } from "@sanity/image-url";
import { cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity/image";
import { productAspect } from "@/lib/productImageDims";

/**
 * ONE shared IntersectionObserver for every empty-state shimmer on the page
 * (50+ frames on /products — a per-frame observer each would be wasteful).
 * Created lazily on the client; toggles `data-shimmer-off` on observed frames
 * so the globals.css rule pauses the shimmer animation while offscreen.
 */
let shimmerObserver: IntersectionObserver | null = null;

function getShimmerObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return null;
  }
  if (!shimmerObserver) {
    shimmerObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.removeAttribute("data-shimmer-off");
          } else {
            entry.target.setAttribute("data-shimmer-off", "");
          }
        }
      },
      { rootMargin: "100px" },
    );
  }
  return shimmerObserver;
}

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
  /** Fill the parent (h-full) instead of using aspect-ratio — for heroes. */
  fill?: boolean;
  /**
   * Height-driven: the frame takes the PARENT's height and derives its width
   * from the photo's natural ratio (a justified equal-height row). Used by the
   * family carousel so every card is the same height and each photo still
   * fills its frame edge-to-edge, uncropped.
   */
  heightDriven?: boolean;
  /** Show the "Image coming soon" plate in the empty state. */
  showLabel?: boolean;
  /**
   * How the image sits in the frame. "contain" never crops — the product
   * floats in the frame with a little breathing room (client photography).
   */
  fit?: "cover" | "contain";
  /**
   * Force the given `ratio` and cover-fill instead of adopting the photo's
   * natural ratio. For uniform mood/cover tiles (e.g. the family arches) where
   * a consistent grid matters more than showing every edge of the shot.
   */
  crop?: boolean;
}

const DEFAULT_SIZES =
  "(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw";

// Resolves to a Sanity CDN URL once a project + image exist; null -> empty state.
function resolveSanityUrl(image?: SanityImage | null): string | null {
  if (!image?.asset?._ref) return null;
  const b = urlFor(image as SanityImageSource);
  return b ? b.width(1400).auto("format").url() : null;
}

/**
 * AssetFrame (PARAMOUNT_SCROLL_UI_PROMPT.md §1). One component, two states,
 * branching on whether a real image resolves — so the site fills in automatically
 * when photos are added in Sanity. The empty state is a gallery frame awaiting
 * art (motif + breath-slow shimmer), never a loading skeleton.
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
  fill = false,
  heightDriven = false,
  showLabel = true,
  fit = "cover",
  crop = false,
}: AssetFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const url = src ?? resolveSanityUrl(image);
  const hotspot = image?.hotspot;
  const objectPosition = hotspot
    ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
    : "center";
  const hasShimmer = !url;

  // When we know the client photo's true pixel ratio, the frame ADOPTS it:
  // the shot then fills the frame edge-to-edge with zero crop and zero empty
  // margin (object-cover on a matching ratio can't crop). Falls back to the
  // seeded `ratio` only for the empty state and Sanity images of unknown size.
  const naturalAspect = productAspect(src);
  const fitToPhoto = !fill && !crop && naturalAspect != null;
  const frameAspect = fitToPhoto ? String(naturalAspect) : ratio;
  // height-driven derives width from the parent height; aspect-driven derives
  // height from the parent width. Either way the frame matches the photo ratio.
  const useHeight = heightDriven && !fill;

  // Pause the shimmer while the frame is offscreen: register with the shared
  // observer only while the shimmer actually renders.
  useEffect(() => {
    if (!hasShimmer) return;
    const el = frameRef.current;
    if (!el) return;
    const io = getShimmerObserver();
    if (!io) return;
    io.observe(el);
    return () => {
      io.unobserve(el);
      el.removeAttribute("data-shimmer-off");
    };
  }, [hasShimmer]);

  return (
    <figure className={cn("group", fill && "h-full", useHeight && "w-fit", className)}>
      <div
        ref={frameRef}
        className={cn(
          "relative overflow-hidden rounded-image border border-olive/40 bg-gradient-to-b from-cream-deep to-[#E9DBC0] [contain:content]",
          fill && "h-full w-full",
          useHeight && "h-full w-auto",
          frameClassName,
        )}
        style={fill ? undefined : { aspectRatio: frameAspect }}
        data-speed={depth}
        // Start PAUSED; the shared observer lifts this on first intersection.
        data-shimmer-off={hasShimmer ? "" : undefined}
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
              className="w-[38%] max-w-[220px] text-olive opacity-[0.06]"
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

            {showLabel && (
              <span className="absolute right-0 bottom-4 left-0 text-center font-display text-[10px] tracking-[0.24em] text-olive/45 uppercase">
                Image coming soon
              </span>
            )}

            {/* slow diagonal shimmer — a breath, not a pulse (off under reduced-motion) */}
            {!url && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="pm-shimmer-anim absolute inset-y-0 left-0 w-1/2"
                  style={{
                    background:
                      "linear-gradient(100deg, transparent 0%, rgba(255,252,240,0.55) 50%, transparent 100%)",
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
            // onLoad misses images that are already complete when React
            // attaches (cached repeat visits) — the ref check covers those.
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setLoaded(true);
            }}
            onLoad={() => setLoaded(true)}
            className={cn(
              "transition-opacity duration-[600ms] ease-out",
              // Frame already matches the photo's ratio -> object-cover fills
              // it completely without cropping a single pixel. Otherwise fall
              // back: "contain" floats the shot with breathing room; "cover"
              // fills a mismatched frame (Sanity images of unknown ratio).
              fitToPhoto || fit === "cover" ? "object-cover" : "object-contain p-[6%]",
              loaded ? "opacity-100" : "opacity-0",
            )}
            style={fitToPhoto || fit === "cover" ? { objectPosition } : undefined}
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
