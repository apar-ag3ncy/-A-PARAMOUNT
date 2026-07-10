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
    onFrame,
  } = opts;

  const frames: (Frame | null)[] = Array(count).fill(null);
  const queue = decodeOrder(count, strides);
  let cursor = 0;
  let inFlight = 0;
  let disposed = false;
  let started = false;
  let landed = 0;

  const decode = async (i: number): Promise<void> => {
    if (frames[i] || disposed) return;
    try {
      // Off-thread decode: scrolling and dragging never stutter.
      const blob = await (await fetch(src(i))).blob();
      frames[i] = await createImageBitmap(blob);
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
    onFrame?.(i, landed++ === 0);
  };

  // A worker pool rather than fixed batches: a slow frame never stalls the rest.
  const pump = () => {
    if (disposed) return;
    started = true;
    while (inFlight < concurrency && cursor < queue.length) {
      const i = queue[cursor++];
      inFlight++;
      void decode(i).finally(() => {
        inFlight--;
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
