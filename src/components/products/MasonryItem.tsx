import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import { cn } from "@/lib/utils";

interface MasonryItemProps {
  caption: string;
  ratio: string;
  href?: string;
  /** Small material tag pinned to the frame. */
  material?: string;
  depth?: number;
  priority?: boolean;
  /** Toggled by the category material filter (FLIP animates the change). */
  hidden?: boolean;
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
  material,
  depth,
  priority,
  hidden,
}: MasonryItemProps) {
  const inner = (
    <div className="group block">
      <div className="relative transition-transform duration-[400ms] ease-out group-hover:-translate-y-1.5">
        <AssetFrame
          image={null}
          ratio={ratio}
          depth={depth}
          priority={priority}
          frameClassName="transition-colors duration-[400ms] group-hover:border-olive"
        />
        {material && (
          <span className="absolute top-3 left-3 rounded-button bg-cream/85 px-2.5 py-1 font-display text-[10px] tracking-[0.14em] text-olive-deep uppercase backdrop-blur-sm">
            {material}
          </span>
        )}
      </div>
      <div className="mt-3 flex justify-center">
        <span className="bg-gradient-to-r from-olive-deep to-olive-deep bg-[length:0_1px] bg-[position:left_bottom] bg-no-repeat pb-1 font-display text-xs tracking-[0.18em] text-olive-deep uppercase transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_1px]">
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
