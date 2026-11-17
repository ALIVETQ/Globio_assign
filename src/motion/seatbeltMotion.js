// Fastening the briefing seatbelt (DESIGN.md §5b): the tongue slides into the
// buckle (0.25 s, power3.in), the buckle gives a little click shake
// (x 0 → 2 → −2 → 0, 0.15 s) and the FASTEN SEATBELT sign lights up. Unfastening
// plays it back: the sign goes dim and the tongue slides out.
//
// The rest states live in the markup/CSS (components/seatbelt.js setSeatbelt,
// .is-fastened); these tweens only travel between them. Reduced motion: none.
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { TONGUE_TRAVEL } from "../components/seatbelt.js";

const SLIDE = 0.25, SHAKE = 0.15, LIGHT = 0.2;

// Call AFTER setSeatbelt(root, on). Returns the timeline (or null).
export function playSeatbelt(root, on) {
  if (reducedMotion) return null;
  const tongue = root.querySelector(".belt__tongue");
  const sign = root.querySelector(".seatbelt-sign");
  const tl = gsap.timeline();
  if (on) {
    tl.fromTo(tongue, { x: 0 }, { x: TONGUE_TRAVEL, duration: SLIDE, ease: "power3.in" }, 0);
    tl.to(root.querySelector(".belt"), { keyframes: { x: [0, 2, -2, 0] }, duration: SHAKE, ease: "none", clearProps: "transform" }, SLIDE);
    // The sign's brightness is the CSS variable --lit (0 dim → 1 lit, see briefing.css).
    tl.fromTo(sign, { "--lit": 0 }, { "--lit": 1, duration: LIGHT, ease: "power1.out", clearProps: "--lit" }, SLIDE);
  } else {
    tl.fromTo(sign, { "--lit": 1 }, { "--lit": 0, duration: LIGHT, ease: "power1.in", clearProps: "--lit" }, 0);
    tl.fromTo(tongue, { x: TONGUE_TRAVEL }, { x: 0, duration: SLIDE, ease: "power3.out" }, 0);
  }
  return tl;
}
