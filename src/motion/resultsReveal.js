// Results blocks below the fold (DESIGN.md §9.11, second table). Each block is
// hidden on enter and animates once, when 15% of it scrolls into view.
//
// The block animations live in revealSkills.js, revealDots.js and
// revealCards.js; the lucky-guess warning is small enough to live here: it
// slides in from x −16 (0.4 s) while its dice icon turns 180° (0.6 s, back.out(2)).
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { hideSkills, playSkills } from "./revealSkills.js";
import { hideDots, playDots } from "./revealDots.js";
import { hidePractice, playPractice, hideCoverage, playCoverage } from "./revealCards.js";

function hideLucky(block) {
  gsap.set(block, { opacity: 0 });
}

function playLucky(block) {
  const tl = gsap.timeline();
  tl.fromTo(block, { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "transform,opacity" }, 0);
  // The dice looks the same turned 180°, so it can simply stay there.
  tl.fromTo(block.querySelector(".lucky__icon"), { rotation: 0 }, { rotation: 180, duration: 0.6, ease: "back.out(2)", transformOrigin: "50% 50%" }, 0);
  return tl;
}

// Every block that reveals on scroll: [element, hide, play]. play(el, result,
// onCleanup) returns a timeline; onCleanup takes extra stop functions (the
// coverage shimmer). Blocks that aren't on the page (no warning) are skipped.
function blocksOf(root) {
  const block = (sel) => root.querySelector(sel)?.closest(".results-block, .lucky");
  return [
    [block(".skills"), hideSkills, playSkills],
    [root.querySelector(".lucky"), hideLucky, playLucky],
    [block(".dots"), hideDots, playDots],
    [block(".practice"), hidePractice, playPractice], // none when nothing to practise
    [block(".tiles"), hideCoverage, playCoverage],
  ].filter(([el]) => el);
}

// Hides the blocks now and plays each one as it scrolls in. Returns a cleanup
// function for destroy(). Under reduced motion nothing is hidden or played.
export function revealResults(root, result) {
  if (reducedMotion) return () => {};
  const timelines = [];
  const stops = [];
  const onCleanup = (fn) => stops.push(fn);
  const blocks = new Map(blocksOf(root).map(([el, hide, play]) => [el, play]));
  blocksOf(root).forEach(([el, hide]) => hide(el));

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const tl = blocks.get(e.target)(e.target, result, onCleanup);
        // Switched to reduced motion while waiting: show the final state at once.
        if (reducedMotion) tl.progress(1);
        timelines.push(tl);
      }
    },
    { threshold: 0.15 },
  );
  blocks.forEach((_, el) => io.observe(el));
  return () => {
    io.disconnect();
    timelines.forEach((t) => t.kill());
    stops.forEach((stop) => stop());
  };
}
