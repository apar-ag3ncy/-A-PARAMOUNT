/**
 * The DoorScroll → CinematicHero handoff.
 *
 * A bare `pm:doors-open` event is not enough. `<DoorScroll />` renders BEFORE
 * `<CinematicHero />`, and both run `useIsomorphicLayoutEffect`, so DoorScroll's
 * effect executes first. When a reload restores the scroll position past the
 * doors (or a deep link lands there), DoorScroll's ScrollTrigger `onRefresh`
 * fires the handoff during that first effect — before the hero has subscribed.
 * The hero's `{ once: true }` listener then never runs, its intro stays
 * `paused(0)`, and the wordmark sits at `opacity: 0` forever.
 *
 * So the state is kept here, where a late subscriber can ask for it. Module
 * state lives for the page load; DoorScroll calls `resetDoors()` when it mounts,
 * so a client-side navigation back to "/" starts with the doors shut again.
 */
let doorsOpen = false;

export function doorsAreOpen(): boolean {
  return doorsOpen;
}

/** Idempotent: opens the doors once and notifies anyone already listening. */
export function openDoors(): void {
  if (doorsOpen) return;
  doorsOpen = true;
  window.dispatchEvent(new CustomEvent("pm:doors-open"));
}

/** Called by DoorScroll on mount, so a remount replays the intro properly. */
export function resetDoors(): void {
  doorsOpen = false;
}

/**
 * Subscribe to the handoff. If the doors are ALREADY open, `cb` runs
 * synchronously — that is the whole point of this module.
 * Returns an unsubscribe function.
 */
export function onDoorsOpen(cb: () => void): () => void {
  if (doorsOpen) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener("pm:doors-open", handler, { once: true });
  return () => window.removeEventListener("pm:doors-open", handler);
}
