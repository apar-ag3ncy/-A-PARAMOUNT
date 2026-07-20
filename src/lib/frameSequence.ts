/**
 * A progressive image-sequence store — the engine behind both scrubbed films on
 * this site (`DoorScroll`'s 241-frame door, `KalashOrbit`'s 96-frame turntable).
 * Both had hand-rolled their own copy of this; the two drifted apart in decode
 * order, concurrency and nearest-frame search, so it now lives here once.
 *
 * Two ideas make a frame sequence feel instant:
 *
 *  1. Decode OFF the main thread (`createImageBitmap` on a fetched blob), so a
 *     scrub or a drag never waits on a JPEG decoder. A plain <img> is the
 *     fallback when that path fails; the painter treats both alike.
 *
 *  2. Decode COARSE-TO-FINE. Walking 0,1,2,… would leave the tail unscrubbable
 *     for seconds. Striding 16,8,4,2,1 instead means the whole film is roughly
 *     scrubbable after a handful of fetches, and `nearest()` covers the gaps by
 *     drawing the closest frame that has actually landed.
 *
 * Nothing here touches React or the DOM beyond Image/fetch, so it is testable in
 * isolation — see the decodeOrder/nearest tests.
 */

/** Either decode target; `frameSize` reads dimensions from both. */
export type Frame = ImageBitmap | HTMLImageElement;

export interface FrameSequenceOptions {
  /** Number of frames, indexed 0…count-1. */
  count: number;
  /** Maps a frame index to its URL. */
  src: (i: number) => string;
  /**
   * Coarse-to-fine decode strides. Default [16, 8, 4, 2, 1].
   * The first stride decides how quickly the whole span becomes scrubbable.
   */
  strides?: number[];
  /** Max decodes in flight. Enough to saturate the link, few enough to leave
   *  the main thread alone. Default 6. */
  concurrency?: number;
  /** True for a looping turntable (nearest may wrap 95 → 0), false for a film. */
  wrap?: boolean;
  /**
   * Downscale each frame to this pixel width AT DECODE TIME (createImageBitmap
   * resizeWidth), preserving aspect. Slashes decoded-bitmap memory (the store
   * holds every frame) and GPU fill for a long film whose source frames are far
   * larger than the canvas ever draws. Omit to decode at native size.
   */
  decodeWidth?: number;
  /**
   * Max decoded frames kept resident. Omit to keep every frame forever (the
   * turntable does — 96 small frames is nothing).
   *
   * A long film cannot: an ImageBitmap costs w*h*4 bytes of GPU-side memory that
   * the GC will not reclaim, so ~200 frames at a sharp decode width is ~700MB
   * resident. MEASURED consequence: scrubbing after the whole film had landed
   * was WORSE than scrubbing while it was still loading (136 long tasks / 21.8s
   * vs 90 / 8.6s) — the browser was thrashing, not decoding. Retaining a window
   * around `focus()` and closing the rest bounds that, so the film can be decoded
   * SHARP without the store ever growing big enough to thrash.
   */
  retain?: number;
  /** Fired when a frame lands. `first` is true only for the very first one. */
  onFrame?: (index: number, first: boolean) => void;
}

export interface FrameSequence {
  /** The decoded frame, or null if it has not landed yet. */
  get(index: number): Frame | null;
  /** Closest decoded frame to `index`, or -1 when none have landed. */
  nearest(index: number): number;
  /** Begin fetching. Idempotent — later calls are no-ops. */
  start(): void;
  /**
   * Tell the sequence where the playhead is, so a `retain` window can follow it:
   * frames near `index` are fetched first (and re-fetched if they were evicted),
   * frames far from it are closed. No-op without `retain`. Cheap enough to call
   * every frame of a scrub.
   */
  focus(index: number): void;
  /** Cancel in-flight work, suppress further callbacks, free the bitmaps. */
  dispose(): void;
}

/** Intrinsic size of either frame kind. */
export function frameSize(frame: Frame): { w: number; h: number } {
  return frame instanceof HTMLImageElement
    ? { w: frame.naturalWidth, h: frame.naturalHeight }
    : { w: frame.width, h: frame.height };
}

/**
 * Indices to decode, coarse-to-fine and duplicate-free.
 * decodeOrder(8, [4, 2, 1]) -> [0, 4, 2, 6, 1, 3, 5, 7]
 */
export function decodeOrder(count: number, strides: number[]): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const stride of strides) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

/**
 * Nearest decoded index to `i`, searching outwards. `wrap` makes the search
 * circular, which is what a 360° turntable wants and a film does not.
 */
export function nearestDecoded(
  frames: readonly (Frame | null)[],
  i: number,
  wrap: boolean,
): number {
  const n = frames.length;
  if (n === 0) return -1;
  const at = (k: number) => ((k % n) + n) % n;
  if (frames[wrap ? at(i) : i]) return wrap ? at(i) : i;
  for (let d = 1; d < n; d++) {
    if (wrap) {
      if (frames[at(i + d)]) return at(i + d);
      if (frames[at(i - d)]) return at(i - d);
    } else {
      if (i - d >= 0 && frames[i - d]) return i - d;
      if (i + d < n && frames[i + d]) return i + d;
    }
  }
  return -1;
}

export function createFrameSequence(opts: FrameSequenceOptions): FrameSequence {
  const {
    count,
    src,
    strides = [16, 8, 4, 2, 1],
    concurrency = 6,
    wrap = false,
    decodeWidth,
    retain,
    onFrame,
  } = opts;

  const frames: (Frame | null)[] = Array(count).fill(null);
  const queue = decodeOrder(count, strides);
  let cursor = 0;
  let inFlight = 0;
  let disposed = false;
  let started = false;
  let landed = 0;

  // ---- retain window (only when `retain` is set) ----
  const at = (i: number) => ((i % count) + count) % count;
  /** Signed-shortest distance, so a wrapped turntable measures across the seam. */
  const dist = (i: number) => {
    const d = Math.abs(i - focusIdx);
    return wrap ? Math.min(d, count - d) : d;
  };
  let focusIdx = 0;
  let resident = 0;
  const urgent: number[] = []; // jumped-to frames, decoded before the bulk queue
  const queued = new Set<number>();

  const release = (i: number) => {
    const f = frames[i];
    if (!f) return;
    if ("close" in f) f.close(); // GPU memory the GC will not reclaim on its own
    frames[i] = null;
    resident--;
  };

  const decode = async (i: number): Promise<void> => {
    if (frames[i] || disposed) return;
    try {
      // Off-thread decode: scrolling and dragging never stutter. Optionally
      // downscale to decodeWidth so the store stays light and draws stay cheap.
      const blob = await (await fetch(src(i))).blob();
      frames[i] = decodeWidth
        ? await createImageBitmap(blob, {
            resizeWidth: decodeWidth,
            resizeQuality: "high",
          })
        : await createImageBitmap(blob);
    } catch {
      try {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src(i);
        await img.decode();
        frames[i] = img;
      } catch {
        return; // missing frame — nearest() covers the gap
      }
    }
    if (disposed || !frames[i]) return;
    resident++;
    onFrame?.(i, landed++ === 0);
  };

  /** Close whatever now sits outside the window, nearest-to-focus surviving. */
  const evict = () => {
    if (!retain || resident <= retain) return;
    const half = Math.max(1, Math.ceil(retain / 2));
    for (let i = 0; i < count && resident > retain; i++) {
      if (frames[i] && dist(i) > half) release(i);
    }
    // Still over budget (a tight window, or a huge jump): drop the farthest.
    if (resident > retain) {
      const held = [];
      for (let i = 0; i < count; i++) if (frames[i]) held.push(i);
      held.sort((a, b) => dist(b) - dist(a));
      for (const i of held) {
        if (resident <= retain) break;
        release(i);
      }
    }
  };

  // A worker pool rather than fixed batches: a slow frame never stalls the rest.
  const pump = () => {
    if (disposed) return;
    started = true;
    while (inFlight < concurrency) {
      // Frames the playhead is ON always beat the bulk coarse-to-fine queue,
      // otherwise a scrub into evicted territory waits behind the whole film.
      let i: number;
      if (urgent.length) i = urgent.shift() as number;
      else if (cursor < queue.length) i = queue[cursor++];
      else break;
      queued.delete(i);
      if (frames[i]) continue; // already resident (or re-queued after eviction)
      // With a retain window, NEVER decode what that window would immediately
      // evict. Without this the bulk coarse-to-fine queue keeps marching over the
      // whole film, so every decode is thrown away and the pool churns
      // decode->evict->decode forever — measured as the scrub getting WORSE the
      // longer the page sat (127 long tasks after 25s vs 41 after 2s). Past the
      // window the queue simply drains; `focus()` is what pulls frames in after.
      if (retain && dist(i) > Math.max(1, Math.ceil(retain / 2))) continue;
      inFlight++;
      void decode(i).finally(() => {
        inFlight--;
        evict();
        pump();
      });
    }
  };

  return {
    get: (i) => frames[i] ?? null,
    nearest: (i) => nearestDecoded(frames, i, wrap),
    // Idempotent: callers may start it from a matchMedia branch that re-runs.
    start: () => {
      if (!started) pump();
    },
    focus: (index) => {
      if (!retain || disposed) return;
      const next = wrap ? at(Math.round(index)) : Math.max(0, Math.min(count - 1, Math.round(index)));
      if (next === focusIdx) return;
      focusIdx = next;
      // Re-request anything missing inside the window, nearest first, so a scrub
      // that outruns the loader refills from where the eye actually is.
      const half = Math.max(1, Math.ceil(retain / 2));
      for (let d = 0; d <= half; d++) {
        for (const raw of d === 0 ? [focusIdx] : [focusIdx + d, focusIdx - d]) {
          const i = wrap ? at(raw) : raw;
          if (i < 0 || i >= count) continue;
          if (!frames[i] && !queued.has(i)) {
            queued.add(i);
            urgent.push(i);
          }
        }
      }
      evict();
      pump();
    },
    dispose: () => {
      disposed = true;
      queue.length = cursor = 0;
      // ImageBitmaps hold GPU-side memory the GC will not reclaim on its own.
      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        if (f && "close" in f) f.close();
        frames[i] = null;
      }
    },
  };
}
