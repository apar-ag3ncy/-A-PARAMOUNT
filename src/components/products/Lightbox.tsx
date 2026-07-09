"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Fullscreen image viewer. Opens when `index` is non-null; the caller owns the
 * image list and the open index. Honors the user's own swipe direction (drag
 * left → next, drag right → previous), arrow keys, Esc, and a click on the
 * backdrop. The image is shown UNCROPPED (object-contain) so the whole piece is
 * visible whatever its aspect. Body scroll is locked while open.
 */
export default function Lightbox({
  images,
  index,
  caption,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number | null;
  caption?: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const open = index !== null;
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [dx, setDx] = useState(0);

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      onIndex((index + dir + images.length) % images.length);
    },
    [index, images.length, onIndex],
  );

  // keyboard + body-scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go, onClose]);

  if (!open || index === null) return null;

  // swipe follows the finger: a leftward drag advances (natural direction).
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag.current) setDx(e.clientX - drag.current.x);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const moved = e.clientX - drag.current.x;
    const dy = Math.abs(e.clientY - drag.current.y);
    drag.current = null;
    setDx(0);
    if (Math.abs(moved) > 60 && Math.abs(moved) > dy) go(moved < 0 ? 1 : -1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption ? `${caption} — image viewer` : "Image viewer"}
      className="fixed inset-0 z-[200] flex flex-col bg-espresso/95 backdrop-blur-sm"
      style={{ animation: "pm-fade-in 0.25s ease-out both" }}
      onClick={onClose}
    >
      {/* top bar */}
      <div
        className="flex items-center justify-between px-5 py-4 sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-display text-[11px] tracking-[0.24em] text-cream/70 uppercase">
          {caption ? `${caption} · ` : ""}
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* stage */}
      <div
        className="relative flex flex-1 touch-pan-y items-center justify-center overflow-hidden px-4 pb-8 select-none sm:px-16"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          drag.current = null;
          setDx(0);
        }}
      >
        {images.length > 1 && (
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 z-10 grid size-11 place-items-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream sm:left-5"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        )}

        <div
          className="relative h-full w-full"
          style={{ transform: `translateX(${dx}px)`, transition: dx ? "none" : "transform 0.3s ease" }}
        >
          <Image
            key={images[index]}
            src={images[index]}
            alt={caption ?? "Product photograph"}
            fill
            sizes="100vw"
            className="object-contain"
            priority
            draggable={false}
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 z-10 grid size-11 place-items-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream sm:right-5"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
