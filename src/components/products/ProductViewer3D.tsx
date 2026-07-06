"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

const KALASH_TEXTURE_URL = "/kalash/kalash-texture.png";
/** height / maxRadius of the vessel (from kalash-profile.json). */
const KALASH_ASPECT = 2.4727;
/** Silhouette [y, r] pairs, y: 1=top → 0=bottom, r: 0..1 of max radius. */
const KALASH_PROFILE: [number, number][] = [
  [1, 0.1364], [0.9972, 0.3409], [0.9926, 0.5], [0.9871, 0.5636],
  [0.9743, 0.6182], [0.9559, 0.6477], [0.9191, 0.625], [0.8961, 0.6182],
  [0.8824, 0.6295], [0.8686, 0.6182], [0.8575, 0.55], [0.8474, 0.5045],
  [0.841, 0.4886], [0.7904, 0.4818], [0.7445, 0.4659], [0.7215, 0.5341],
  [0.6939, 0.7045], [0.6618, 0.8295], [0.6158, 0.9091], [0.5607, 0.9591],
  [0.4963, 0.9818], [0.4412, 1], [0.4044, 0.9955], [0.3493, 0.9727],
  [0.3125, 0.9545], [0.239, 0.9205], [0.1654, 0.8636], [0.1287, 0.8136],
  [0.0919, 0.7386], [0.0551, 0.6364], [0.0276, 0.5114], [0.0092, 0.4318],
  [0, 0.3636],
];
/** World max radius — height becomes R * KALASH_ASPECT ≈ 2.2 (matches the old procedural size). */
const KALASH_R = 0.9;
/** Horizontal half-extent sampled from the texture. Deliberately inside the
    alpha bbox (u 0.011–0.989): the outer few % is the feathered cutout edge,
    and sampling it smears a white fringe along the 3D silhouette. */
const TEX_U_HALF = 0.45;

function PhotoKalash() {
  const gl = useThree((s) => s.gl);
  const texture = useTexture(KALASH_TEXTURE_URL);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
  }, [texture, gl]);

  const geometry = useMemo(() => {
    const height = KALASH_R * KALASH_ASPECT;
    // Close the top rim with a near-axis point so no hole shows from above.
    const pts = [new THREE.Vector2(0.001, height)].concat(
      KALASH_PROFILE.map(
        ([y, r]) => new THREE.Vector2(Math.max(r * KALASH_R, 0.001), y * height),
      ),
    );
    const geo = new THREE.LatheGeometry(pts, 64);

    // Planar photo projection: the front photo maps onto the front half and
    // mirrors onto the back (theta = atan2(x, z), 0 = facing the camera).
    // The ornate repeat pattern makes the mirror seam invisible in motion.
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const localR = Math.hypot(x, z);
      const theta = Math.atan2(x, z);
      const u = 0.5 + TEX_U_HALF * Math.sin(theta) * (localR / KALASH_R);
      const v = y / height;
      uv.setXY(i, u, v);
    }
    uv.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  // The photo carries baked studio lighting — an unlit, un-tone-mapped basic
  // material preserves it 1:1 (standard material muddied the silver's sheen).
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
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

/**
 * Continuous slow turntable. Pauses while the user drags (OrbitControls takes
 * over), resumes the moment the drag ends — no easing hiccups, just delta time.
 */
function Turntable({
  paused,
  children,
}: {
  paused: React.RefObject<boolean>;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!paused.current && group.current) {
      group.current.rotation.y += delta * 0.45;
    }
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ modelUrl }: { modelUrl?: string }) {
  const dragging = useRef(false);
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} />
      <directionalLight position={[0, 4, -8]} intensity={0.7} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <Center>
            <Turntable paused={dragging}>
              {modelUrl ? (
                <GLTFModel url={modelUrl} />
              ) : (
                <>
                  <PhotoKalash />
                  <GroundShadow />
                </>
              )}
            </Turntable>
          </Center>
        </Bounds>
        {/* Procedural studio environment — no external HDR fetch (lights the GLB path). */}
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 3, 2]} scale={6} color="#fff6e0" />
          <Lightformer intensity={1} position={[-4, 1, -2]} scale={5} color="#ffffff" />
          <Lightformer intensity={0.8} position={[4, 0, 3]} scale={4} color="#f3e4c8" />
        </Environment>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        onStart={() => (dragging.current = true)}
        onEnd={() => (dragging.current = false)}
      />
    </>
  );
}

/**
 * ProductViewer3D (build-plan Prompt G). Lazy-mounts the R3F canvas when in
 * view; a photo-lathe of the real silver kalash (real product photo projected
 * onto its lathe-turned silhouette) auto-rotates as a turntable — user drag
 * pauses it, releasing resumes. Falls back to the brand motif when WebGL is
 * unavailable. GLBs from `product.model3d` still take precedence.
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
      {webgl && hasEntered ? (
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
