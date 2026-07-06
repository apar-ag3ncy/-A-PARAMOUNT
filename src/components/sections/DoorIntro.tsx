"use client";

/* eslint-disable @next/next/no-img-element -- raw <img> by design: the brand
   art is manually preloaded + decoded before the show starts, and the whole
   component unmounts forever afterwards — next/image adds nothing here. */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, ScrollSmoother } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const SESSION_KEY = "pm-door-intro";
/** LoadingScreen's session flag — set it too, so the mantra overlay never
 *  replays mid-session after the door was the first impression. */
const LOADED_KEY = "pm-loaded";

/** The door opening is a PRE-RENDERED FILM (offline composite of the client's
 *  temple-gate render — same layers, same beats, baked at 30fps). Playback is
 *  hardware-decoded video: one composited layer, physically cannot jank,
 *  guaranteed slow-mo-smooth on any machine. The brand text stays DOM so it is
 *  razor-sharp at every DPI. */
const FILM = "/door/door-open.mp4";
const FILM_SM = "/door/door-open-540.mp4"; // lighter variant for small screens
const FILM_POSTER = "/door/door-open-poster.jpg";
/** Film beat map (seconds on the film's own 9.0s clock). */
const BEATS = {
  textIn: 1.0,
  hintIn: 1.6,
  textOut: 4.6,
  hintOut: 5.2,
  doorsOpen: 7.6, // dispatch pm:doors-open — hero mid-flight when flash clears
  end: 9.0,
};

// Brand art is part of the text reveal — decode it up front so it never pops in late.
const PRELOAD_ASSETS = ["/brand/a-mark-white.png", "/brand/paramount-word-white.png"];

const GOLD = "#E2CA82";

/**
 * DoorIntro — cinematic temple-door opening (DOOR_INTRO_SPEC.md).
 *
 * The client's temple-gate render opens toward the visitor: both carved leaves
 * push inward, golden light floods out, the camera dollies through the doorway
 * and hands off to CinematicHero via the `pm:doors-open` event. Plays once per
 * browser session; any pointerdown / wheel / keydown fast-forwards elegantly
 * (video playbackRate + timeline timeScale, no jump cut).
 *
 * Rendered through a portal onto <body>: #smooth-content carries a transform
 * (ScrollSmoother), which would hijack position:fixed's containing block.
 */
export default function DoorIntro() {
  const [play, setPlay] = useState(false);
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fired = useRef(false);

  // Session gate — runs before paint. On a repeat visit the hero must never
  // wait, so the handoff event is dispatched synchronously on mount.
  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(LOADED_KEY, "1");
      // Repeat visit: no show — lift the server-rendered cream cover now.
      document.getElementById("pm-precover")?.remove();
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
    const vid = video.current;
    if (!el || !vid) return;

    let finished = false;
    let skipped = false;
    let failsafe = 0;
    let ctx: gsap.Context | undefined;
    const tlRef: { current: gsap.core.Timeline | null } = { current: null };

    const fireDoorsOpen = () => {
      // The page beneath is hidden for the whole show (its compositing cost
      // caused visible lag). Restore it exactly at handoff so the hero is
      // live for the reveal.
      const wrapper = document.getElementById("smooth-wrapper");
      if (wrapper) wrapper.style.visibility = "";
      if (fired.current) return;
      fired.current = true;
      window.dispatchEvent(new CustomEvent("pm:doors-open"));
    };

    // First interaction = elegant fast-forward, never a jump cut: the film
    // races at 4x (still hardware-smooth) and the text timeline keeps pace.
    const skip = () => {
      if (skipped) return;
      skipped = true;
      removeSkipListeners();
      try {
        vid.playbackRate = 4;
      } catch {
        /* some engines clamp playbackRate — timeline still races */
      }
      tlRef.current?.timeScale(4);
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
      vid.pause();
      // Kill (not revert) — the whole subtree unmounts on the next render.
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
      // Our stage covers everything — retire the server-rendered cream
      // precover and hide the page beneath. fireDoorsOpen restores it.
      document.getElementById("pm-precover")?.remove();
      const wrapper = document.getElementById("smooth-wrapper");
      if (wrapper) wrapper.style.visibility = "hidden";

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add(
          {
            reduce: "(prefers-reduced-motion: reduce)",
            motion: "(prefers-reduced-motion: no-preference)",
          },
          (mctx) => {
            const cond = (mctx.conditions ?? {}) as { reduce?: boolean };

            // ---- Reduced motion: static closed-door tableau (the film's
            // poster frame, unplayed). Fade in, hold, fade away. ----
            if (cond.reduce) {
              gsap.set(el, { opacity: 0 });
              gsap.set(".di-text > *", { opacity: 1, y: 0 });
              gsap.set(".di-hint", { opacity: 0.6 });
              const tl = gsap
                .timeline({ onComplete: finish })
                .to(el, { opacity: 1, duration: 1, ease: "power2.out" }, 0)
                .call(fireDoorsOpen, undefined, 2.2)
                .to(el, { opacity: 0, duration: 0.8, ease: "power2.in" }, 2.2);
              if (skipped) tl.timeScale(3.2);
              tlRef.current = tl;
              return;
            }

            // ---- Full show: the film plays; GSAP drives only the DOM text
            // overlay + events on the film's 9s clock. ----
            gsap.set(".di-text > *", { opacity: 0, y: 26 });
            gsap.set(".di-hint", { opacity: 0 });

            const tl = gsap.timeline({ onComplete: finish });
            tl
              .to(
                [".di-mark", ".di-word"],
                { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.14 },
                BEATS.textIn,
              )
              .to(
                [".di-div", ".di-serif", ".di-caps"],
                { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.12 },
                BEATS.textIn + 0.4,
              )
              .to(".di-hint", { opacity: 0.7, duration: 0.9, ease: "power2.out" }, BEATS.hintIn)
              .to(
                ".di-text > *",
                { y: -28, opacity: 0, duration: 1.0, ease: "power2.in", stagger: 0.05 },
                BEATS.textOut,
              )
              .to(".di-hint", { opacity: 0, duration: 0.6, ease: "power2.in" }, BEATS.hintOut)
              .call(fireDoorsOpen, undefined, BEATS.doorsOpen)
              .to(el, { opacity: 0, duration: 0.45, ease: "power2.out" }, BEATS.end - 0.35);
            if (skipped) {
              tl.timeScale(4);
              try {
                vid.playbackRate = 4;
              } catch {
                /* noop */
              }
            }
            tlRef.current = tl;

            // Roll the film. If playback is refused (ancient browser/policy —
            // we're muted+playsInline so this is rare), finish gracefully.
            vid.play().catch(finish);
            // Belt & braces: if the film somehow ends before the timeline
            // (drift, throttling), finish on its `ended` too.
            vid.addEventListener("ended", finish, { once: true });
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

    // Preload: brand art decode + enough film buffered to play through.
    // FAILSAFE: a slow network must never block the site — if not ready in
    // 4s while the user is actually LOOKING, skip (flag + event + unmount).
    // In a hidden tab the browser deprioritizes video buffering, so the
    // countdown would misfire on a show nobody has seen yet — hold instead
    // and re-arm when the tab becomes visible. Skip listeners live from here.
    const armFailsafe = () => {
      failsafe = window.setTimeout(() => {
        if (document.hidden) {
          const rearm = () => {
            document.removeEventListener("visibilitychange", rearm);
            if (!finished) armFailsafe();
          };
          document.addEventListener("visibilitychange", rearm);
          return;
        }
        finish();
      }, 4000);
    };
    armFailsafe();
    addSkipListeners();

    const artReady = Promise.all(
      PRELOAD_ASSETS.map((src) => {
        const im = new window.Image();
        im.decoding = "async";
        im.src = src;
        return im.decode().catch(() => undefined);
      }),
    );
    const filmReady = new Promise<void>((resolve) => {
      if (vid.readyState >= 3) return resolve(); // HAVE_FUTURE_DATA
      vid.addEventListener("canplaythrough", () => resolve(), { once: true });
      vid.addEventListener("canplay", () => resolve(), { once: true });
      vid.load();
    });

    Promise.all([artReady, filmReady])
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
      finished = true; // block any late callbacks
      window.clearTimeout(failsafe);
      removeSkipListeners();
      document.removeEventListener("visibilitychange", onVisible);
      ScrollSmoother.get()?.paused(false);
      // Unmounted mid-show (e.g. client navigation)? Never leave the page
      // hidden or covered.
      const wrapper = document.getElementById("smooth-wrapper");
      if (wrapper) wrapper.style.visibility = "";
      document.getElementById("pm-precover")?.remove();
      vid.pause();
      ctx?.revert();
    };
  }, [play]);

  if (done || !play) return null;

  // Small screens get the lighter encode — same film, same clock.
  const src =
    typeof window !== "undefined" && window.innerWidth < 768 ? FILM_SM : FILM;

  return createPortal(
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[250] cursor-pointer overflow-hidden bg-cream select-none"
    >
      {/* 1 — THE FILM: the entire door-opening shot, hardware-decoded. */}
      <video
        ref={video}
        src={src}
        poster={FILM_POSTER}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 2 — brand text column at the doorway center (DOM = razor sharp) */}
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

      {/* 3 — skip hint */}
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
