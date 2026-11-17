// Practice cards and coverage tiles reveal (DESIGN.md §9.11, below the fold),
// run by resultsReveal.js.
//
// Practice cards slide in from x 40px, 140 ms apart (0.6 s, "soft"). Each tip
// is painted with a gradient clipped to the text (transparent → cobalt → ink,
// see .is-sweeping in resultsBlocks.css); sliding the gradient from 100% to 0%
// over 0.8 s makes the words sweep in cobalt and settle to ink.
//
// Coverage tiles fade up (y 12), 80 ms apart; then the three untested ones
// start their shimmer (motion/shimmer.js).
import { gsap } from "./gsap.js";
import { fadeUp } from "./fadeUp.js";
import { startShimmer } from "./shimmer.js";

const CARD_STEP = 0.14, CARD = 0.6, SWEEP = 0.8, TILE_STEP = 0.08;

export function hidePractice(block) {
  gsap.set(block.querySelectorAll(".practice__card"), { opacity: 0 });
  block.querySelectorAll(".practice__tip").forEach((t) => t.classList.add("is-sweeping"));
}

export function playPractice(block) {
  const tl = gsap.timeline();
  block.querySelectorAll(".practice__card").forEach((card, i) => {
    const tip = card.querySelector(".practice__tip");
    const t = i * CARD_STEP;
    tl.fromTo(card, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: CARD, ease: "soft", clearProps: "transform,opacity" }, t);
    tl.fromTo(
      tip,
      { backgroundPosition: "100% 0%" },
      {
        backgroundPosition: "0% 0%",
        duration: SWEEP,
        ease: "power1.inOut",
        // Back to plain ink text once the sweep has passed.
        onComplete: () => tip.classList.remove("is-sweeping"),
        clearProps: "backgroundPosition",
      },
      t,
    );
  });
  return tl;
}

export function hideCoverage(block) {
  gsap.set(block.querySelectorAll(".tile"), { opacity: 0 });
}

// onCleanup(fn) registers the shimmer's stop() with the results screen.
export function playCoverage(block, result, onCleanup) {
  const tl = gsap.timeline({
    onComplete: () => onCleanup(startShimmer(block.querySelectorAll(".tile__shimmer"))),
  });
  block.querySelectorAll(".tile").forEach((tile, i) => tl.add(fadeUp(tile, { y: 12 }), i * TILE_STEP));
  return tl;
}
