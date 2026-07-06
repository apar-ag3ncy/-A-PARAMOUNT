"use client";

/* eslint-disable @next/next/no-img-element -- raw <img> by design: these four
   sprites are manually preloaded + decoded before the timeline starts, and the
   component unmounts forever afterwards — next/image adds nothing here. */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, ScrollSmoother } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const SESSION_KEY = "pm-door-intro";
/** LoadingScreen's session flag — set it too, so the mantra overlay never
 *  replays mid-session after the door was the first impression. */
const LOADED_KEY = "pm-loaded";
const DOOR_ASSETS = [
  "/door/facade.webp",
  "/door/door-left.webp",
  "/door/door-right.webp",
  "/door/interior.webp",
];
// Brand art is part of the text reveal — decode it up front so it never pops in late.
const PRELOAD_ASSETS = [
  ...DOOR_ASSETS,
  "/brand/a-mark-white.png",
  "/brand/paramount-word-white.png",
];

/** Doorway rectangle, as percentages of the 2752×1536 scene box. */
const DOORWAY: React.CSSProperties = {
  left: "35.79%",
  top: "27.21%",
  width: "28.71%",
  height: "62.30%",
};

const GOLD = "#E2CA82";

/**
 * DoorIntro — cinematic temple-door opening (DOOR_INTRO_SPEC.md).
 *
 * The client's temple-gate render opens toward the visitor: both carved leaves
 * push inward, golden light floods out, the camera dollies through the doorway
 * and hands off to CinematicHero via the `pm:doors-open` event. Plays once per
 * browser session; any pointerdown / wheel / keydown fast-forwards elegantly
 * (timeScale, no jump cut).
 *
 * Rendered through a portal onto <body>: #smooth-content carries a transform
 * (ScrollSmoother), which would hijack position:fixed's containing block.
 * Performance: transforms + opacity only — no filters, no canvas, no per-frame
 * JS outside GSAP's ticker.
 */
export default function DoorIntro() {
  const [play, setPlay] = useState(false);
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  // Session gate — runs before paint. On a repeat visit the hero must never
  // wait, so the handoff event is dispatched synchronously on mount.
  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(LOADED_KEY, "1");
      if (!fired.current) {
        fired.current = true;
        window.dispatchEvent(new CustomEvent("pm:doors-open"));
      }
      setDone(true);
      return;
    }
    setPlay(true);
  }, []);

  // The show itself — mounted only when the session gate says "play".
  useIsomorphicLayoutEffect(() => {
    if (!play || done) return;
    const el = root.current;
    if (!el) return;

    let finished = false;
    let skipped = false;
    let failsafe = 0;
    let ctx: gsap.Context | undefined;
    const tlRef: { current: gsap.core.Timeline | null } = { current: null };

    const fireDoorsOpen = () => {
      if (fired.current) return;
      fired.current = true;
      window.dispatchEvent(new CustomEvent("pm:doors-open"));
    };

    // First interaction = elegant fast-forward, never a jump cut. Listeners are
    // live from the moment the failsafe is armed, so even the preload window is
    // skippable — a pre-begin skip is honored when the timeline is created.
    const skip = () => {
      if (skipped) return;
      skipped = true;
      removeSkipListeners();
      tlRef.current?.timeScale(3.2);
    };
    const addSkipListeners = () => {
      window.addEventListener("pointerdown", skip, { passive: true });
      window.addEventListener("wheel", skip, { passive: true });
      window.addEventListener("keydown", skip);
    };
    const removeSkipListeners = () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("keydown", skip);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(failsafe);
      removeSkipListeners();
      document.removeEventListener("visibilitychange", onVisible);
      sessionStorage.setItem(SESSION_KEY, "1");
      sessionStorage.setItem(LOADED_KEY, "1");
      fireDoorsOpen();
      ScrollSmoother.get()?.paused(false);
      // Kill (not revert) — the whole subtree unmounts on the next render, so
      // restoring inline styles would only flash the scene back for a frame.
      ctx?.kill();
      setDone(true);
    };

    const begin = () => {
      if (finished) return;
      // While the doors play, wheel means "skip" — never "scroll". Rewind any
      // scroll that slipped in during the preload window BEFORE freezing: the
      // hero's pinned intro needs scroll=0 at handoff.
      const smoother = ScrollSmoother.get();
      smoother?.scrollTo(0, false);
      smoother?.paused(true);

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add(
          {
            reduce: "(prefers-reduced-motion: reduce)",
            mobile: "(prefers-reduced-motion: no-preference) and (max-width: 1023px)",
            desktop: "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
          },
          (mctx) => {
            const cond = (mctx.conditions ?? {}) as {
              reduce?: boolean;
              mobile?: boolean;
            };

            // ---- Reduced motion: static closed-door tableau. Fade in, hold,
            // fade away. Same events, same flags, no 3D, no dolly. ----
            if (cond.reduce) {
              gsap.set(el, { opacity: 0 });
              gsap.set(".di-flash", { opacity: 0 });
              gsap.set(".di-text > *", { opacity: 1, y: 0 });
              gsap.set(".di-lamp", { opacity: 0.55 });
              gsap.set(".di-hint", { opacity: 0.6 });
              const tl = gsap
                .timeline({ onComplete: finish })
                .to(el, { opacity: 1, duration: 1, ease: "power2.out" }, 0)
                .call(fireDoorsOpen, undefined, 2.2)
                .to(el, { opacity: 0, duration: 0.8, ease: "power2.in" }, 2.2);
              if (skipped) tl.timeScale(3.2); // skip arrived during preload
              tlRef.current = tl;
              return;
            }

            const doorsDur = cond.mobile ? 2.2 : 2.7;
            const dollyDur = cond.mobile ? 1.7 : 2.0;

            // ---- Initial states (flash covers the stage until 0.0) ----
            gsap.set(".di-doors", {
              perspective: cond.mobile ? 1100 : 1500,
            });
            gsap.set(".di-scene", { scale: 1.05, transformOrigin: "50% 58.36%" });
            gsap.set(".di-leaf-l", { rotationY: 0, transformOrigin: "left center" });
            gsap.set(".di-leaf-r", { rotationY: 0, transformOrigin: "right center" });
            gsap.set(".di-shade", { opacity: 0 });
            gsap.set(".di-bloom", { opacity: 0.55, scale: 1, transformOrigin: "50% 50%" });
            gsap.set(".di-ray", { opacity: 0 });
            gsap.set(".di-lamp", { opacity: 0.45, transformOrigin: "50% 50%" });
            gsap.set(".di-text > *", { opacity: 0, y: 26 });
            gsap.set(".di-hint", { opacity: 0 });
            gsap.set(".di-flash", { opacity: 1 });

            // ---- Living diya flames (independent gentle yoyo, killed w/ ctx) ----
            gsap.to(".di-lamp-a", {
              opacity: 0.75,
              scale: 1.02,
              duration: 2.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
            gsap.to(".di-lamp-b", {
              opacity: 0.75,
              scale: 1.02,
              duration: 2.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: 1.2,
            });

            // ---- Master timeline ----
            const tl = gsap.timeline({ onComplete: finish });
            tl
              // 0.0 — cream wash lifts, scene settles from 1.05 → 1
              .to(".di-flash", { opacity: 0, duration: 1.4, ease: "power2.out" }, 0)
              .to(".di-scene", { scale: 1, duration: 1.8, ease: "power2.out" }, 0)
              // 0.9 — text apparition
              .to(
                [".di-mark", ".di-word"],
                { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 },
                0.9,
              )
              .to(
                [".di-div", ".di-serif", ".di-caps"],
                { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.1 },
                1.25,
              )
              .to(".di-hint", { opacity: 0.7, duration: 0.9, ease: "power2.out" }, 1.5)
              // 2.1 — DOORS OPEN (the hero beat). Origin-left: +rotationY pushes
              // the free edge away from the viewer; origin-right: negative does.
              .to(".di-leaf-l", { rotationY: 84, duration: doorsDur, ease: "power2.inOut" }, 2.1)
              .to(".di-leaf-r", { rotationY: -84, duration: doorsDur, ease: "power2.inOut" }, 2.1)
              .to(".di-shade", { opacity: 0.5, duration: doorsDur, ease: "power2.inOut" }, 2.1)
              .to(
                ".di-bloom",
                { opacity: 1, scale: 1.3, duration: doorsDur, ease: "power2.inOut" },
                2.1,
              )
              .to(".di-ray", { opacity: 0.45, duration: doorsDur, ease: "power2.inOut" }, 2.1)
              // faint gold edge-glow sweeping each leaf as it turns
              .fromTo(
                ".di-sweep-l",
                { xPercent: -160 },
                { xPercent: 320, duration: doorsDur * 0.85, ease: "power2.inOut" },
                2.25,
              )
              .fromTo(
                ".di-sweep-r",
                { xPercent: 320 },
                { xPercent: -160, duration: doorsDur * 0.85, ease: "power2.inOut" },
                2.25,
              )
              // 2.6 — text exits (gone before the dolly)
              .to(
                ".di-text > *",
                { y: -30, opacity: 0, duration: 0.9, ease: "power2.in", stagger: 0.05 },
                2.6,
              )
              .to(".di-hint", { opacity: 0, duration: 0.6, ease: "power2.in" }, 3.6)
              // 4.0 — DOLLY-THROUGH the doorway (origin = doorway center)
              .to(".di-scene", { scale: 3.15, duration: dollyDur, ease: "power2.in" }, 4.0)
              // 4.6 — handoff: hero intro is already mid-flight underneath
              .call(fireDoorsOpen, undefined, 4.6)
              // 4.9 — cream flash swallows the frame
              .to(".di-flash", { opacity: 1, duration: 0.7, ease: "power2.in" }, 4.9)
              // 6.0 — the component fades itself out, then unmounts
              .to(el, { opacity: 0, duration: 0.5, ease: "power2.out" }, 6.0);
            if (skipped) tl.timeScale(3.2); // skip arrived during preload
            tlRef.current = tl;
          },
        );
      }, el);
    };

    // In a background tab the whole cinematic would play unseen — hold until
    // the user actually looks at it, then run the full show.
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      begin();
    };

    // Preload + decode the sprites + brand art. FAILSAFE: a slow dev build must
    // never block the site — if not decoded in 3.5s, skip (flag + event +
    // unmount). Skip listeners are live from here, so even the preload window
    // is skippable.
    failsafe = window.setTimeout(finish, 3500);
    addSkipListeners();
    const imgs = PRELOAD_ASSETS.map((src) => {
      const im = new window.Image();
      im.decoding = "async";
      im.src = src;
      return im;
    });
    Promise.all(imgs.map((im) => im.decode()))
      .then(() => {
        if (finished) return;
        window.clearTimeout(failsafe);
        if (document.hidden) {
          // Background tab — the show waits for the user's first look.
          document.addEventListener("visibilitychange", onVisible);
          return;
        }
        begin();
      })
      .catch(finish);

    return () => {
      finished = true; // block any late decode/timeline callbacks
      window.clearTimeout(failsafe);
      removeSkipListeners();
      document.removeEventListener("visibilitychange", onVisible);
      ScrollSmoother.get()?.paused(false);
      ctx?.revert();
    };
  }, [play]);

  if (done || !play) return null;

  return createPortal(
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[250] flex cursor-pointer items-center justify-center overflow-hidden bg-espresso select-none"
    >
      {/* scene box — covers the viewport keeping the 2752×1536 render's ratio */}
      <div
        className="di-scene relative flex-none will-change-transform"
        style={{ aspectRatio: "2752 / 1536", minWidth: "100vw", minHeight: "100vh" }}
      >
        {/* 1 — golden bloom + god-rays + interior hall (seen through the doorway) */}
        <div
          className="absolute"
          style={{ left: "50%", top: "58.36%", width: "46%", transform: "translate(-50%, -50%)" }}
        >
          <div
            className="di-bloom aspect-square w-full will-change-transform"
            style={{
              background:
                "radial-gradient(circle, #FFF6DC 0%, #E2CA82 38%, rgba(226,202,130,0) 68%)",
              opacity: 0.55,
            }}
          />
        </div>
        <div
          className="di-ray absolute"
          style={{
            left: "46.5%",
            top: "30%",
            width: "7%",
            height: "52%",
            transform: "skewX(-12deg)",
            background: "linear-gradient(to bottom, rgba(226,202,130,0.55), rgba(226,202,130,0))",
            opacity: 0,
          }}
        />
        <div
          className="di-ray absolute"
          style={{
            left: "51%",
            top: "30%",
            width: "9%",
            height: "58%",
            transform: "skewX(9deg)",
            background: "linear-gradient(to bottom, rgba(255,246,220,0.5), rgba(226,202,130,0))",
            opacity: 0,
          }}
        />
        <img
          src="/door/interior.webp"
          alt=""
          draggable={false}
          className="absolute"
          style={{ ...DOORWAY, objectFit: "fill" }}
        />

        {/* 2 — the doors (3D stage exactly on the doorway rect) */}
        <div className="di-doors absolute" style={{ ...DOORWAY, perspectiveOrigin: "50% 50%" }}>
          <div
            className="di-leaf-l absolute inset-y-0 left-0 w-1/2 will-change-transform"
            style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
          >
            <img
              src="/door/door-left.webp"
              alt=""
              draggable={false}
              className="h-full w-full"
              style={{ objectFit: "fill" }}
            />
            {/* fake recede-light as the leaf turns */}
            <div
              className="di-shade absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(46,35,19,0.85), rgba(46,35,19,0) 75%)",
                opacity: 0,
              }}
            />
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="di-sweep-l absolute inset-y-0 left-0 w-2/5 will-change-transform"
                style={{
                  background:
                    "linear-gradient(100deg, rgba(226,202,130,0) 0%, rgba(254,244,218,0.38) 50%, rgba(226,202,130,0) 100%)",
                  transform: "translateX(-160%)",
                }}
              />
            </div>
          </div>
          <div
            className="di-leaf-r absolute inset-y-0 right-0 w-1/2 will-change-transform"
            style={{ transformOrigin: "right center", backfaceVisibility: "hidden" }}
          >
            <img
              src="/door/door-right.webp"
              alt=""
              draggable={false}
              className="h-full w-full"
              style={{ objectFit: "fill" }}
            />
            <div
              className="di-shade absolute inset-0"
              style={{
                background:
                  "linear-gradient(to left, rgba(46,35,19,0.85), rgba(46,35,19,0) 75%)",
                opacity: 0,
              }}
            />
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="di-sweep-r absolute inset-y-0 left-0 w-2/5 will-change-transform"
                style={{
                  background:
                    "linear-gradient(100deg, rgba(226,202,130,0) 0%, rgba(254,244,218,0.38) 50%, rgba(226,202,130,0) 100%)",
                  transform: "translateX(320%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* 3 — the facade (its feathered doorway hole reveals layers 1–2) */}
        <img
          src="/door/facade.webp"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: "fill" }}
        />

        {/* 4 — living diya flames over the facade lamps */}
        <div
          className="absolute"
          style={{ left: "20.35%", top: "80.4%", width: "12%", transform: "translate(-50%, -50%)" }}
        >
          <div
            className="di-lamp di-lamp-a aspect-square w-full will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(226,202,130,0.85) 0%, rgba(226,202,130,0.25) 45%, rgba(226,202,130,0) 70%)",
              opacity: 0.45,
            }}
          />
        </div>
        <div
          className="absolute"
          style={{ left: "79.58%", top: "80.4%", width: "12%", transform: "translate(-50%, -50%)" }}
        >
          <div
            className="di-lamp di-lamp-b aspect-square w-full will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(226,202,130,0.85) 0%, rgba(226,202,130,0.25) 45%, rgba(226,202,130,0) 70%)",
              opacity: 0.45,
            }}
          />
        </div>

        {/* 5 — brand text column at the doorway center */}
        <div
          className="di-text absolute flex flex-col items-center text-center"
          style={{
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            textShadow: "0 0 26px rgba(226,202,130,0.55)",
          }}
        >
          <img
            src="/brand/a-mark-white.png"
            alt=""
            draggable={false}
            className="di-mark h-[8vh] w-auto will-change-transform"
            style={{ opacity: 0 }}
          />
          <img
            src="/brand/paramount-word-white.png"
            alt="A Paramount"
            draggable={false}
            className="di-word mt-[3vh] h-auto will-change-transform"
            style={{ width: "clamp(260px, 30vw, 500px)", opacity: 0 }}
          />
          <div
            className="di-div mt-[3vh] flex items-center gap-3 will-change-transform"
            style={{ color: GOLD, opacity: 0 }}
          >
            <span className="h-px w-12 bg-current" />
            <span className="text-[12px]">✦</span>
            <span className="h-px w-12 bg-current" />
          </div>
          <p
            className="di-serif mt-[2.5vh] font-serif text-xl text-cream italic will-change-transform sm:text-2xl"
            style={{ opacity: 0 }}
          >
            The doors have been opening since 1968.
          </p>
          <p
            className="di-caps mt-[2vh] font-display text-[11px] tracking-[0.28em] uppercase will-change-transform"
            style={{ color: GOLD, opacity: 0 }}
          >
            Temple Artefacts · Crafted in Mumbai
          </p>
        </div>
      </div>

      {/* 6 — full-screen cream wash (entry + exit) */}
      <div className="di-flash pointer-events-none absolute inset-0 bg-cream" style={{ opacity: 1 }} />

      {/* 7 — skip hint */}
      <div
        className="di-hint pointer-events-none absolute right-6 bottom-6 font-display text-[10px] tracking-[0.3em] text-cream/60 uppercase"
        style={{ opacity: 0 }}
      >
        Tap to enter
      </div>
    </div>,
    document.body,
  );
}
