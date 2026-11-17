// Boarding-pass entrance (DESIGN.md §9.11, from 1100 ms; the ticket itself is
// components/boardingPass.js). Seconds from the ticket's start:
//   0     the ticket "prints": slides up 40px while it is revealed top to
//         bottom (0.6 s, "soft")
//   0.6   the perforation draws (DrawSVG, 0.3 s)
//   0.9   the plane flies DEL → its place on the route, drawing a solid line
//         behind it (1.6 s, power2.out); at the same time the status word
//         split-flaps into place (≤ 0.9 s, motion/splitFlap.js)
//   2.5   "ready" only: the plane lands at BER with a small bump (0.3 s), then
//         the stub tears off a little: rotate 3°, x 8px (0.4 s, back.out)
// Returns a timeline for resultsMotion.js to place. Reduced motion never calls
// this: the ticket's markup + mountBoardingPass() are already the final state.
import { gsap } from "./gsap.js";
import { playSplitFlap } from "./splitFlap.js";
import { placePlane, setDone } from "./journeyMotion.js";
import { planeProgress } from "../components/boardingPass.js";

const PRINT = 0.6, PERF = 0.3, FLY = 1.6, FLAPS = 0.9, BUMP = 0.3, TEAR = 0.4;
const FLY_AT = PRINT + PERF;

// raw: the route path, measured by mountBoardingPass().
export function ticketTimeline(root, result, raw) {
  const ticket = root.querySelector(".ticket");
  const $ = (sel) => ticket.querySelector(sel);
  const plane = $(".ticket__plane");
  const flown = $(".ticket__flown");
  const to = planeProgress(result);
  const tl = gsap.timeline();

  // 1. Print. (clip-path: inset from the bottom 100% → 0 = revealed top to bottom.)
  tl.fromTo(
    $(".ticket__card"),
    { y: 40, clipPath: "inset(0% 0% 100% 0%)" },
    { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: PRINT, ease: "soft", clearProps: "transform,clipPath" },
    0,
  );

  // 2. Perforation: the mask line draws, uncovering the dashed line. Cleared at
  //    the end so a later resize (new line length) can't leave it half drawn.
  const perf = $(".ticket__perf-draw");
  const unDash = () => ["stroke-dasharray", "stroke-dashoffset"].forEach((p) => perf.style.removeProperty(p));
  tl.fromTo(perf, { drawSVG: "0%" }, { drawSVG: "100%", duration: PERF, ease: "power1.inOut", onComplete: unDash }, PRINT);

  // 3. Flight. Until it starts, the plane waits at DEL with nothing flown.
  placePlane(plane, raw, 0);
  setDone(flown, 0);
  const s = { p: 0 };
  tl.to(s, {
    p: to,
    duration: FLY,
    ease: "power2.out",
    onUpdate: () => {
      placePlane(plane, raw, s.p);
      setDone(flown, s.p);
    },
  }, FLY_AT);

  // 4. Status word, flap by flap (no fade: the ticket is already showing).
  const flaps = playSplitFlap($(".ticket__status"), { rows: ".flap-row", fade: 0, total: FLAPS });
  if (flaps) tl.add(flaps, FLY_AT);

  // 5. Ready: touch down at BER with a little hop, then tear the stub.
  if (result.verdict === "ready") {
    const land = FLY_AT + FLY;
    tl.to($(".ticket__plane-body"), { keyframes: { y: [0, -4, 0] }, duration: BUMP, ease: "power1.inOut" }, land);
    // The stub's torn position is also its CSS rest state (.ticket--ready), so
    // it starts untorn here and ends exactly where the CSS keeps it.
    tl.fromTo($(".ticket__stub"), { x: 0, rotation: 0 }, { x: 8, rotation: 3, duration: TEAR, ease: "back.out(2)" }, land + BUMP);
  }
  return tl;
}
