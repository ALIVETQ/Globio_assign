// Fade-up (DESIGN.md §4.3): opacity 0 → 1 and translateY(y px) → 0, 0.7 s, ease "soft".
// fromTo renders the hidden start state at once, even when the tween is placed
// later in a timeline, so nothing flashes visible before its turn.
import { gsap } from "./gsap.js";

export function fadeUp(el, { y = 12, delay = 0 } = {}) {
  return gsap.fromTo(
    el,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration: 0.7, ease: "soft", delay, clearProps: "transform" },
  );
}
