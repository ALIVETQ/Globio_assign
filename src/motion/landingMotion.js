// Landing choreography (DESIGN.md §5.3 entrance, §5.4 on Start). The screen file
// (screens/landing.js) owns the lifecycle; this file only builds timelines.
// Every function respects reduced motion: no entrance, no exit, final values.
import { gsap } from "./gsap.js";
import { reducedMotion, timeScale } from "./prefs.js";
import { fadeUp } from "./fadeUp.js";
import { countUp, showZero } from "./countUp.js";
import { hideForGlitch, glitchInLines, glitchOut } from "./glitch.js";

const FAILSAFE_MS = 4000;

const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];

// Final state of the meta numbers (reduced motion, failsafe).
function showMetaValues(root) {
  for (const n of $$(root, ".meta__num")) n.textContent = n.dataset.value;
}

// §5.3. Returns { tl, stop } — `stop` clears the failsafe timer.
export function playEntrance(root) {
  if (reducedMotion) {
    showMetaValues(root);
    return { tl: null, stop: () => {} };
  }
  const lines = $$(root, ".hero__line");
  const nums = $$(root, ".meta__num");
  hideForGlitch(lines);
  nums.forEach((n) => showZero(n)); // the zero form first (§4.5)

  const tl = gsap.timeline();
  tl.add(fadeUp($(root, ".topbar"), { y: 8 }), 0);
  // The resume banner sits above the overline, so it arrives with it.
  tl.add(fadeUp($$(root, ".resume-bar, .hero__copy > .overline"), { y: 10 }), 0.15);
  tl.add(glitchInLines(lines), 0.26); // lines at 260 / 390 / 520 ms
  tl.add(fadeUp($(root, ".hero__lede"), { y: 14 }), 0.9);
  tl.add(fadeUp($(root, ".hero__ctas"), { y: 14 }), 1.04);
  tl.add(fadeUp($(root, ".meta"), { y: 8 }), 1.18);
  // "then each number counts up": after the meta line's 0.7 s fade-up.
  nums.forEach((n) => tl.add(countUp(n, Number(n.dataset.value), { duration: 0.9 }), 1.88));

  // If something stalls (throttled background tab), show everything anyway.
  // Scaled by slow-mo so ?slow=0.25 can still be watched to the end.
  const timer = setTimeout(() => {
    tl.progress(1);
    showMetaValues(root);
  }, FAILSAFE_MS / timeScale);
  return { tl, stop: () => clearTimeout(timer) };
}

// Below the fold: each block fades up (y 16) once 15% of it is in view.
// How-it-works cards stagger 90 ms. Returns a cleanup function.
export function revealBelowFold(root) {
  if (reducedMotion) return () => {};
  const tweens = [];
  const singles = $$(root, ".why, .how > h2, .sample, .coverage-note, .second-cta, .landing-footer");
  const cards = $(root, ".how__cards");
  const targets = [...singles, cards];
  // Hidden now; fadeUp's fromTo would also do it, but only once it is created.
  gsap.set([...singles, ...cards.children], { opacity: 0 });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const els = e.target === cards ? [...cards.children] : [e.target];
        if (reducedMotion) {
          gsap.set(els, { opacity: 1, clearProps: "transform" }); // toggled on since load
          continue;
        }
        els.forEach((el, i) => tweens.push(fadeUp(el, { y: 16, delay: i * 0.09 })));
      }
    },
    { threshold: 0.15 },
  );
  targets.forEach((t) => io.observe(t));
  return () => {
    io.disconnect();
    tweens.forEach((t) => t.kill());
  };
}

// §5.4 steps 1–2: buttons and meta fade out (0.2 s), then the headline glitches
// out. The glow (step 3) is run by main.js around the screen swap.
export function playExit(root) {
  if (reducedMotion) return Promise.resolve();
  const tl = gsap.timeline();
  tl.to($$(root, ".hero__ctas, .meta, .resume-bar"), { opacity: 0, duration: 0.2 });
  tl.add(glitchOut($(root, ".hero__headline")));
  return tl.then();
}
