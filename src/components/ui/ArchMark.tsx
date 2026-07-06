import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * ArchMark — the brand's logo mark: a tall pointed (ogee) gothic arch enclosing
 * a small `A`, drawn as a double outline. Stroke-based and rendered in
 * `currentColor`, so tint it with a text-* utility on the parent
 * (e.g. `text-olive/40`, `text-[#E2CA82]/70`).
 *
 * Traced to the deck watermark (p06) + damask column mark (p118): the legs rise
 * vertically, curve inward through an ogee shoulder and meet in a point; an inner
 * arch echoes the outer; a small crossbarred `A` sits inside.
 */
export default function ArchMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 44 60"
      className={cn("h-[60px] w-[44px]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Outer ogee arch: up the left leg, ogee shoulder to the apex point,
          ogee shoulder down to the right leg. Open feet at the bottom. */}
      <path d="M4 58 L4 30 C4 18 9 10 22 3 C35 10 40 18 40 30 L40 58" />
      {/* Inner ogee arch, echoing the outer (double-outline signature). */}
      <path
        d="M11 58 L11 31 C11 22 15 16 22 11 C29 16 33 22 33 31 L33 58"
        strokeWidth={1.6}
      />
      {/* Crossbarred `A` inside the arch. */}
      <path d="M16.5 50 L22 33 L27.5 50" strokeWidth={1.7} />
      <path d="M18.7 43.2 L25.3 43.2" strokeWidth={1.5} />
    </svg>
  );
}
