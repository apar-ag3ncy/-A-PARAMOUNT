"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  /** GLB/GLTF URL (e.g. from Sanity). Omit to show the procedural brass kalash. */
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

// A lathe-turned kalash silhouette — stands in until real GLBs are uploaded.
function KalashModel() {
  const geometry = useMemo(() => {
    const profile: [number, number][] = [
      [0, -1.05], [0.34, -1.02], [0.42, -0.9], [0.56, -0.62], [0.68, -0.28],
      [0.7, -0.02], [0.6, 0.2], [0.42, 0.38], [0.3, 0.5], [0.29, 0.6],
      [0.44, 0.72], [0.46, 0.82], [0.22, 0.86], [0.1, 0.96], [0.14, 1.06],
      [0, 1.18],
    ];
    const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#b8894a" metalness={1} roughness={0.26} />
    </mesh>
  );
}

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Scene({ modelUrl, autoRotate, onInteract }: {
  modelUrl?: string;
  autoRotate: boolean;
  onInteract: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} />
      <directionalLight position={[0, 4, -8]} intensity={0.7} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.15}>
          <Center>{modelUrl ? <GLTFModel url={modelUrl} /> : <KalashModel />}</Center>
        </Bounds>
        {/* Procedural studio environment — no external HDR fetch. */}
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
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        onStart={onInteract}
      />
    </>
  );
}

/**
 * ProductViewer3D (build-plan Prompt G). Lazy-mounts the R3F canvas when in view;
 * auto-rotates until the user interacts; procedural studio lighting + env for
 * realistic metal. Falls back to the brand motif when WebGL is unavailable.
 */
export default function ProductViewer3D({ modelUrl, label }: Props) {
  const [inView, setInView] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    setWebgl(hasWebGL());
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
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
      {webgl && inView ? (
        <Canvas
          camera={{ position: [0, 0.4, 4.2], fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <Scene
            modelUrl={modelUrl}
            autoRotate={autoRotate}
            onInteract={() => setAutoRotate(false)}
          />
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
      {label && (
        <span className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-display text-[10px] tracking-[0.24em] text-olive-deep/60 uppercase">
          {label} · drag to rotate
        </span>
      )}
    </div>
  );
}
