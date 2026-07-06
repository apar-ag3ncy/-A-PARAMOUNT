"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Bounds,
  Center,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  /** GLB/GLTF URL (e.g. from Sanity). Omit to show the photo-real silver kalash. */
  modelUrl?: string;
  label?: string;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Photo-lathe kalash — a lathe body built from the real product       */
/* photo's silhouette, with the photo planar-projected onto it.        */
/* Assets: /public/kalash/kalash-texture.png (+ kalash-profile.json,   */
/* whose data is inlined below so no runtime fetch is needed).         */
/* ------------------------------------------------------------------ */

// The cylindrically-unwrapped photo (see geometry comment). Query param busts
// stale browser caches whenever the texture is regenerated.
const KALASH_TEXTURE_URL = "/kalash/kalash-unwrap.png?v=3";
/** height / maxRadius of the vessel (from kalash-profile.json). */
const KALASH_ASPECT = 2.3323;
/** Silhouette [y, r] pairs, y: 1=top → 0=bottom, r: 0..1 of max radius.
    Edge-refined per row against the actual product photo (gradient-snapped,
    conservative min-side radius so the texture never samples background). */
const KALASH_PROFILE: [number, number][] = [
  [1, 0.6264], [0.9744, 0.6174], [0.9487, 0.6515], [0.9231, 0.6519],
  [0.8974, 0.6362], [0.8718, 0.6218], [0.8462, 0.5099], [0.8205, 0.4603],
  [0.7949, 0.3996], [0.7692, 0.3845], [0.7436, 0.3847], [0.7179, 0.3974],
  [0.6923, 0.389], [0.6667, 0.4349], [0.641, 0.5839], [0.6154, 0.6791],
  [0.5897, 0.7876], [0.5641, 0.7824], [0.5385, 0.8325], [0.5128, 0.8931],
  [0.4872, 0.9069], [0.4615, 0.9326], [0.4359, 0.9601], [0.4103, 0.9563],
  [0.3846, 0.988], [0.359, 0.9826], [0.3333, 0.9952], [0.3077, 0.9809],
  [0.2821, 0.9809], [0.2564, 0.9725], [0.2308, 0.9457], [0.2051, 0.9186],
  [0.1795, 0.8861], [0.1538, 0.8797], [0.1282, 0.8797], [0.1026, 0.7979],
  [0.0769, 0.7979], [0.0513, 0.7567], [0.0256, 0.645], [0, 0.5311],
];
/** World max radius — height becomes R * KALASH_ASPECT ≈ 2.1 (matches the old procedural size). */
const KALASH_R = 0.9;

function PhotoKalash() {
  const gl = useThree((s) => s.gl);
  const texture = useTexture(KALASH_TEXTURE_URL);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    // The unwrap tiles around the revolve by mirroring — sampler-level, so
    // pattern reversal is C0-continuous with zero stretch anywhere.
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.needsUpdate = true;
  }, [texture, gl]);

  const geometry = useMemo(() => {
    const height = KALASH_R * KALASH_ASPECT;
    // Open at the rim (a dark mouth disk mesh sits just below it — a real
    // vessel reads dark inside); the BASE closes by curving to the axis so
    // nothing can be seen through the shell from any angle. The base verts
    // sample the texture's bottom rows, which fade to shadow.
    const baseR = KALASH_PROFILE[KALASH_PROFILE.length - 1][1] * KALASH_R;
    // Concave base (like a real spun vessel) that stays ABOVE y=0 — dipping
    // below let the ground-shadow plane slice visibly through the shell.
    const pts = KALASH_PROFILE.map(
      ([y, r]) => new THREE.Vector2(Math.max(r * KALASH_R, 0.001), y * height),
    ).concat([
      new THREE.Vector2(baseR * 0.55, 0.004 * height),
      new THREE.Vector2(0.001, 0.006 * height),
    ]);
    const geo = new THREE.LatheGeometry(pts, 64);

    // The texture is the photo CYLINDRICALLY UNWRAPPED (each row resampled by
    // arc length), so u maps LINEARLY around the revolve — uniform engraving
    // density at every rotation angle, no fold/stretch stripes (the flaw of
    // projecting the raw photo). u runs monotonically 0.5 → 2.5 by SEGMENT
    // INDEX (never atan2 — its ±π wrap puts an interpolation jump inside one
    // back segment); MirroredRepeat makes 2.5 ≡ 0.5, so the seam is invisible
    // and the pattern mirrors twice per revolve, imperceptible on ornament.
    const rowsPerCol = pts.length;
    const segments = 64;
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const col = Math.floor(i / rowsPerCol);
      const y = pos.getY(i);
      const u = 0.5 + 2 * (col / segments);
      // Slight v inset avoids bleeding at the texture's first/last rows.
      const v = 0.005 + 0.99 * (y / height);
      uv.setXY(i, u, v);
    }
    uv.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  // The photo carries baked studio lighting — an unlit, un-tone-mapped basic
  // material preserves it 1:1 (standard material muddied the silver's sheen).
  const height = KALASH_R * KALASH_ASPECT;
  const mouthR = KALASH_PROFILE[0][1] * KALASH_R;
  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Recessed dark mouth — a vessel's opening reads near-black inside.
          Sits just below the rim so only a thin dark ellipse shows. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height * 0.965, 0]}>
        <circleGeometry args={[mouthR * 0.96, 48]} />
        <meshBasicMaterial color="#221a10" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Soft radial-gradient contact shadow so the vessel doesn't float. */
function GroundShadow() {
  const shadowTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2,
    );
    g.addColorStop(0, "rgba(58, 50, 26, 0.42)");
    g.addColorStop(0.45, "rgba(58, 50, 26, 0.18)");
    g.addColorStop(1, "rgba(58, 50, 26, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const r = KALASH_R * 1.25;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <planeGeometry args={[r * 2, r * 2]} />
      <meshBasicMaterial
        map={shadowTexture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Scene({ modelUrl }: { modelUrl?: string }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} />
      <directionalLight position={[0, 4, -8]} intensity={0.7} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <Center>
            {modelUrl ? (
              <GLTFModel url={modelUrl} />
            ) : (
              <>
                <PhotoKalash />
                <GroundShadow />
              </>
            )}
          </Center>
        </Bounds>
        {/* Procedural studio environment — no external HDR fetch (lights the GLB path). */}
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 3, 2]} scale={6} color="#fff6e0" />
          <Lightformer intensity={1} position={[-4, 1, -2]} scale={5} color="#ffffff" />
          <Lightformer intensity={0.8} position={[4, 0, 3]} scale={4} color="#f3e4c8" />
        </Environment>
      </Suspense>

      {/* Rotation ONLY on drag — the vessel rests photo-still otherwise.
          Elevation is LOCKED at the photo's own near-eye-level viewpoint, so
          dragging is a pure horizontal 360 and the top/underside (where a
          photo projection can't be true) are never exposed. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        minPolarAngle={1.5}
        maxPolarAngle={1.5}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* KalashSpin — a pre-rendered 48-frame turntable of the real product  */
/* photo (sprite sheet baked offline from the verified simulator).     */
/* Every frame is a finished image: nothing can smear, clip or break   */
/* at runtime, and three.js never loads for the default showcase.      */
/* ------------------------------------------------------------------ */

const SPIN_URL = "/kalash/kalash-spin.webp?v=1";
const SPIN = { frames: 48, cols: 8, rows: 6, fw: 500, fh: 620 };
/** Horizontal drag pixels per frame step — full 360° ≈ one frame-width drag. */
const PX_PER_FRAME = 10;

function KalashSpin() {
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const drag = useRef<{ startX: number; startFrame: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const img = new window.Image();
    img.src = SPIN_URL;
    const done = () => setReady(true);
    if (img.decode) img.decode().then(done).catch(done);
    else img.onload = done;
  }, []);

  const show = (f: number) => {
    const el = stageRef.current;
    if (!el) return;
    const idx = ((Math.round(f) % SPIN.frames) + SPIN.frames) % SPIN.frames;
    frameRef.current = idx;
    const col = idx % SPIN.cols;
    const row = Math.floor(idx / SPIN.cols);
    el.style.backgroundPosition = `${(col / (SPIN.cols - 1)) * 100}% ${(row / (SPIN.rows - 1)) * 100}%`;
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center touch-pan-y"
      style={{ cursor: "grab" }}
      onPointerDown={(e) => {
        drag.current = { startX: e.clientX, startFrame: frameRef.current };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        e.currentTarget.style.cursor = "grabbing";
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.startX;
        show(drag.current.startFrame + dx / PX_PER_FRAME);
      }}
      onPointerUp={(e) => {
        drag.current = null;
        e.currentTarget.style.cursor = "grab";
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <div
        ref={stageRef}
        className="transition-opacity duration-500"
        style={{
          aspectRatio: `${SPIN.fw}/${SPIN.fh}`,
          height: "88%",
          backgroundImage: `url(${SPIN_URL})`,
          backgroundSize: `${SPIN.cols * 100}% ${SPIN.rows * 100}%`,
          backgroundPosition: "0% 0%",
          opacity: ready ? 1 : 0,
        }}
      />
      {!ready && (
        <span className="absolute font-display text-[10px] tracking-[0.24em] text-olive/50 uppercase">
          Loading…
        </span>
      )}
    </div>
  );
}

/**
 * ProductViewer3D (build-plan Prompt G). The default showcase is a
 * pre-rendered 48-frame spin of the real silver kalash (drag to rotate —
 * rests photo-still otherwise; every frame is a baked image, so the look is
 * identical at every angle by construction). GLBs from `product.model3d`
 * still render through the lazy R3F canvas.
 */
export default function ProductViewer3D({ modelUrl, label }: Props) {
  const [inView, setInView] = useState(false);
  // Once true, stays true — the canvas mounts once and is never torn down on
  // scroll-out (recreating a WebGL context is far more expensive than keeping it).
  const [hasEntered, setHasEntered] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // The showcase now renders the REAL silver kalash — normalise any stale
  // "brass" label from callers and default the caption for the built-in model.
  const displayLabel = modelUrl
    ? label
    : (label ?? "Silver Kalash").replace(/brass/gi, "Silver");

  useIsomorphicLayoutEffect(() => {
    setWebgl(hasWebGL());
    const el = ref.current;
    if (!el) return;
    // Observer lives for the component's lifetime: it keeps `inView` current so
    // the frameloop can be suspended whenever the viewer scrolls offscreen.
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-card border border-olive/25 bg-gradient-to-b from-cream-deep to-[#E9DBC0]"
    >
      {!modelUrl && hasEntered ? (
        // Default showcase: baked sprite spin — no WebGL, no three.js chunk.
        <KalashSpin />
      ) : modelUrl && webgl && hasEntered ? (
        <Canvas
          camera={{ position: [0, 0.4, 4.2], fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          frameloop={inView ? "always" : "never"}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <svg
            viewBox="0 0 100 120"
            className="w-[30%] text-olive opacity-[0.12]"
            fill="none"
            stroke="currentColor"
            strokeWidth={4.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M50,4 l5,6 -5,6 -5,-6 z" fill="currentColor" stroke="none" />
            <path d="M22,112 L22,58 C22,34 35,18 50,12 C65,18 78,34 78,58 L78,112" />
            <path d="M50,44 L40,96 M50,44 L60,96 M44,78 L56,78" strokeWidth={3.6} />
          </svg>
          <span className="font-display text-[10px] tracking-[0.24em] text-olive/50 uppercase">
            {webgl ? "Loading 3D…" : "3D preview unavailable"}
          </span>
        </div>
      )}
      {displayLabel && (
        <span className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-display text-[10px] tracking-[0.24em] text-olive-deep/60 uppercase">
          {displayLabel} · drag to rotate
        </span>
      )}
    </div>
  );
}
