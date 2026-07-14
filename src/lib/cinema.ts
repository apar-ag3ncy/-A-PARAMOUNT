/**
 * Who is currently holding the site header off the screen.
 *
 * The home page opens with a THREE-ACT film — the doors (`DoorScroll`), then the
 * arrival + the landing inside the mandir (`CinematicHero`) — and the header must
 * stay away for ALL of it, returning only once the brand has resolved. Two
 * different sections therefore need to hide the same bar, across a seam.
 *
 * A single `classList.toggle("pm-intro", …)` per section can't express that: as
 * the doors hand over to the hero, DoorScroll's trigger goes inactive and would
 * REMOVE the class while the hero still wants it — the bar would flash in for a
 * frame in the middle of the film. So the hold is a SET: the class is on while
 * anyone holds it, and only comes off when the last holder lets go.
 */
const holders = new Set<string>();

/** Hold (or release) the header for `key`. The bar hides while ANY key holds. */
export function holdHeader(key: string, on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) holders.add(key);
  else holders.delete(key);
  document.documentElement.classList.toggle("pm-intro", holders.size > 0);
}

/** Drop every hold — used on unmount so a client-side nav can't strand the bar. */
export function releaseHeader(key: string): void {
  holdHeader(key, false);
}
