// Section break entrance (DESIGN.md §6.2). Returns the timeline, or null under
// reduced motion (giant word stays static, centred and clipped).
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { fadeUp } from "./fadeUp.js";
import { hideForGlitch, glitchIn } from "./glitch.js";

export const SLIDE_S = 1.8;

export function playSectionBreak(root) {
  if (reducedMotion) return null;
  const stage = root.querySelector(".sb-stage");
  const giant = root.querySelector(".sb-giant");
  const title = root.querySelector(".sb-copy h1");
  const vw = stage.clientWidth;
  const wordWidth = giant.offsetWidth;

  // The word enters from the right edge and slides left behind the copy, ending
  // with its right edge at 90% of the screen: x 100vw → −(wordWidth − 100vw) − 10vw.
  // Positioned from the left edge (not centred) while it moves.
  gsap.set(giant, { left: 0, xPercent: 0, yPercent: -50, x: vw });
  hideForGlitch([title]);

  const tl = gsap.timeline();
  tl.to(giant, { x: -(wordWidth - vw) - 0.1 * vw, duration: SLIDE_S, ease: "none" }, 0);
  tl.add(fadeUp(root.querySelector(".sb-counter"), { y: 8 }), 0.15);
  tl.add(glitchIn(title), 0.25);
  tl.add(fadeUp(root.querySelector(".sb-blurb"), { y: 8 }), 0.55);
  return tl;
}
