import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import VariantChip from "@/components/ui/VariantChip";
import { cn } from "@/lib/utils";
import type { SanityImage } from "@/types/sanity";

interface MasonryItemProps {
  caption: string;
  ratio: string;
  href?: string;
  image?: SanityImage | null;
  /** Local photo path (e.g. catalog `image`) — shown uncropped in the frame. */
  src?: string;
  /** Small material tag pinned to the frame. */
  material?: string;
  depth?: number;
  priority?: boolean;
  /** Toggled by the category material filter (FLIP animates the change). */
  hidden?: boolean;
  /** Temple-arch frame (rounded top) — use on tall ratios for rhythm. */
  arch?: boolean;
}

/**
 * One masonry card (PARAMOUNT_SCROLL_UI_PROMPT.md §2). Starts hidden (initial
 * state in globals.css `.masonry-item`) and is revealed by a ScrollTrigger.batch.
 * Hover: frame lifts, border brightens, caption underline draws in.
 */
export default function MasonryItem({
  caption,
  ratio,
  href,
  image,
  src,
  material,
  depth,
  priority,
  hidden,
  arch,
}: MasonryItemProps) {
  const inner = (
    <div className="group block">
      <div className="relative transition-transform duration-[400ms] ease-out group-hover:-translate-y-1.5">
        <AssetFrame
          image={image ?? null}
          src={src}
          fit={src ? "contain" : "cover"}
          ratio={ratio}
          depth={depth}
          priority={priority}
          frameClassName={cn(
            "transition-colors duration-[400ms] group-hover:border-olive",
            arch && "rounded-t-full",
          )}
        />
        {material && (
          <span className="absolute top-3 left-3 rounded-full bg-cream/90 px-2.5 py-1">
            <VariantChip label={material} />
          </span>
        )}
      </div>
      <div className="mt-3 flex justify-center">
        <span className="bg-gradient-to-r from-olive-deep to-olive-deep bg-[length:0_1px] bg-[position:left_bottom] bg-no-repeat pb-1 font-display pm-label text-olive-deep transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
          {caption}
        </span>
      </div>
    </div>
  );

  return (
    <div className={cn("masonry-item mb-6 break-inside-avoid", hidden && "hidden")}>
      {href ? (
        <Link href={href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}
