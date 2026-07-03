"use client";

import { cn } from "@/lib/utils";

interface Props {
  materials: string[];
  active: string;
  onSelect: (material: string) => void;
}

/** Material switcher for the product detail (PARAMOUNT_SCROLL_UI_PROMPT.md §3). */
export default function MaterialTabs({ materials, active, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Material"
      className="flex flex-wrap gap-2"
    >
      {materials.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={m === active}
          onClick={() => onSelect(m)}
          className={cn(
            "rounded-button border px-4 py-1.5 font-display text-[11px] tracking-[0.14em] uppercase transition-colors",
            m === active
              ? "border-olive bg-olive text-cream"
              : "border-olive/30 text-olive-deep hover:border-olive",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
