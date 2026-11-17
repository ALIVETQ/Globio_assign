// Journey bar motion (DESIGN.md §7.6): on every confirm the cobalt line extends
// to the next dot and the plane flies along the path to it (MotionPath, 0.5 s,
// power2.inOut); the dot it leaves pops 1 → 1.4 → 1 (0.25 s). On Back the
// plane flies backwards (no pop). Reduced motion: the plane just jumps.
//
// Positions are "progress by length" along the path (0–1), which is what both
// MotionPathPlugin and DrawSVG use, so plane, line and dots always agree.
import { gsap, MotionPathPlugin } from "./gsap.js";
import { reducedMotion } from "./prefs.js";

export const FLY_S = 0.5;
const POP_S = 0.25;

export function rawPathOf(pathEl) {
  const raw = MotionPathPlugin.getRawPath(pathEl);
  MotionPathPlugin.cacheRawPathMeasurements(raw);
  return raw;
}

// Put the plane at progress p, pointing along the path.
export function placePlane(plane, raw, p) {
  const { x, y, angle } = MotionPathPlugin.getPositionOnPath(raw, p, true);
  plane.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
}

// The travelled (cobalt) part of the line: 0 → p of its length.
export function setDone(donePath, p) {
  gsap.set(donePath, { drawSVG: `0% ${(p * 100).toFixed(3)}%` });
}

// Fly from progress `from` to `to`. `leftDot` pops if moving forward.
export function flyPlane({ plane, donePath, raw, from, to, leftDot }) {
  if (reducedMotion || from === to) {
    placePlane(plane, raw, to);
    setDone(donePath, to);
    return null;
  }
  const s = { p: from };
  const tl = gsap.timeline();
  tl.to(s, {
    p: to,
    duration: FLY_S,
    ease: "power2.inOut",
    onUpdate: () => {
      placePlane(plane, raw, s.p);
      setDone(donePath, s.p);
    },
  });
  if (to > from && leftDot) {
    tl.fromTo(
      leftDot,
      { scale: 1 },
      { scale: 1.4, duration: POP_S / 2, yoyo: true, repeat: 1, ease: "power1.out", transformOrigin: "50% 50%" },
      0,
    );
  }
  // Start the plane where it was, even before the first tick.
  placePlane(plane, raw, from);
  setDone(donePath, from);
  return tl;
}
