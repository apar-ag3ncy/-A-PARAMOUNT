"use client";

import Button from "@/components/ui/Button";

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
        <Button
          key={m}
          variant={m === active ? "solid" : "outline"}
          size="sm"
          role="tab"
          aria-selected={m === active}
          onClick={() => onSelect(m)}
        >
          {m}
        </Button>
      ))}
    </div>
  );
}
