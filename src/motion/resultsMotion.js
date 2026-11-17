// Results entrance, top of the page (DESIGN.md §9.11). Seconds from
// screen enter:
//   0     verdict block fades in (0.3 s)
//   0.1   label fades up (y 8)
//   0.25  the stamp slams in (0.42 s, power4.in); on impact (0.67) the block
//         shakes and a ring of the verdict colour ripples out
//   0.8   reason, 0.9 next action: fade up (y 10)
//   1.0   score counts up and the bar fills (1.4 s); ticks fade in at 1.2
//   1.1   the boarding pass prints, the plane flies to the score and the
//         status flips in (motion/ticketMotion.js)
// Under reduced motion nothing plays: the markup is already the final state.
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { fadeUp } from "./fadeUp.js";
import { countUp } from "./countUp.js";
import { ticketTimeline } from "./ticketMotion.js";

const STAMP_AT = 0.25, STAMP = 0.42;
const IMPACT = STAMP_AT + STAMP;
const SCORE_AT = 1.0, SCORE = 1.4, TICKS_AT = 1.2;
const TICKET_AT = 1.1;
// The stamp keeps its ink texture while it is blurred: both live in `filter`.
const INK = "url(#stamp-ink)";

function stamp(tl, root) {
  const block = root.querySelector(".verdict");
  const el = root.querySelector(".stamp");
  const ring = root.querySelector(".stamp__ring");
  tl.fromTo(
    el,
    { scale: 1.6, rotation: -10, opacity: 0, filter: `${INK} blur(4px)` },
    { scale: 1, rotation: -4, opacity: 1, filter: `${INK} blur(0px)`, duration: STAMP, ease: "power4.in", clearProps: "filter,opacity" },
    STAMP_AT,
  );
  // Impact: the block jolts (x 0 → 4 → −3 → 2 → 0 px over 0.25 s) …
  tl.to(block, { keyframes: { x: [0, 4, -3, 2, 0] }, duration: 0.25, ease: "none", clearProps: "transform" }, IMPACT);
  // … and the ink ripples outwards from the stamp's centre.
  // (Not rendered before impact: at rest the ring is invisible.)
  tl.fromTo(ring, { scale: 0.6, opacity: 0.35 }, { scale: 1.6, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, IMPACT);
}

function meter(tl, root, result) {
  const value = root.querySelector(".meter__value");
  const fill = root.querySelector(".meter__fill");
  const ticks = root.querySelectorAll(".meter__tick, .meter__note");
  // fromTo: each start state (hidden number, empty bar, no ticks) is rendered
  // at once and belongs to the timeline, so Replay and seeking restore it too.
  tl.fromTo(value.parentElement, { opacity: 0 }, { opacity: 1, duration: 0.15, clearProps: "opacity" }, SCORE_AT);
  tl.add(countUp(value, result.overall, { duration: SCORE }), SCORE_AT);
  tl.fromTo(fill, { scaleX: 0 }, { scaleX: result.overall / 100, duration: SCORE, ease: "power3.out" }, SCORE_AT);
  tl.fromTo(ticks, { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: "opacity" }, TICKS_AT);
}

// Builds and plays the entrance. Call after mountBoardingPass() (raw = its
// route path). Returns the timeline, or null under reduced motion.
export function playVerdict(root, result, raw) {
  if (reducedMotion) return null;
  const tl = gsap.timeline();
  tl.fromTo(root.querySelector(".verdict"), { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: "opacity" }, 0);
  tl.add(fadeUp(root.querySelector(".verdict__label"), { y: 8 }), 0.1);
  stamp(tl, root);
  tl.add(fadeUp(root.querySelector(".verdict__reason"), { y: 10 }), 0.8);
  tl.add(fadeUp(root.querySelector(".verdict__next"), { y: 10 }), 0.9);
  meter(tl, root, result);
  tl.add(ticketTimeline(root, result, raw), TICKET_AT);
  return tl;
}
