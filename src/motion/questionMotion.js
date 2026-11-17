// Question screen motion (DESIGN.md §7.6). The screen (screens/question.js)
// decides WHEN; this file decides HOW. Everything is skipped under reduced motion.
//
// Timing budget: question → question ≤ 0.6 s (DESIGN.md §10 rule 3).
// Exit 0.22 s + enter 0.32 s = 0.54 s. The button feedback (sure sweep 0.22 s,
// guessed wobble 0.22 s, don't-know fade 0.15 s) starts WITH the exit rather
// than before it, and each one finishes by the time the screen swaps.
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { fadeUp } from "./fadeUp.js";

export const ENTER_S = 0.32;
export const EXIT_S = 0.22;
const SHIFT = 24; // px
const FRAME = 1 / 60;
const GHOST = "-2px 0 rgba(47,99,255,.5)";

// dir 1 = forward (in from the right), −1 = Back (in from the left).
// Returns { tl, ready }: `ready` resolves when the column has landed (0.32 s);
// the options' fade-up may still be finishing, but the learner can already act.
// `skipOptions`: the options have their own entrance (the ad cards, §7.6).
export function playEnter(root, dir = 1, { skipOptions = false } = {}) {
  if (reducedMotion) return { tl: null, ready: Promise.resolve() };
  const body = root.querySelector(".q-body");
  const col = root.querySelector(".q-column");
  const tl = gsap.timeline();
  tl.fromTo(body, { x: SHIFT * dir, opacity: 0 }, { x: 0, opacity: 1, duration: ENTER_S, ease: "power3.out", clearProps: "transform,opacity" }, 0);
  // Two-frame glitch at the start: ±3px jitter with a cobalt ghost, then clean.
  tl.set(col, { x: 3, textShadow: GHOST }, 0)
    .set(col, { x: -3 }, FRAME)
    .set(col, { x: 0, textShadow: "none", clearProps: "transform,textShadow" }, 2 * FRAME);
  if (!skipOptions) root.querySelectorAll(".option").forEach((o, i) => tl.add(fadeUp(o, { y: 8 }), i * 0.05));
  const ready = new Promise((resolve) => tl.call(resolve, null, ENTER_S));
  return { tl, ready };
}

// "I'm sure": a white-to-cobalt fill sweeps left → right (clip-path). The button
// turns white with a cobalt outline, and a cobalt copy of it is wiped in on top.
function sweep(btn) {
  const overlay = document.createElement("span");
  overlay.className = "btn__sweep";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = btn.innerHTML;
  btn.classList.add("is-sweeping");
  btn.append(overlay);
  return gsap.fromTo(overlay, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.22 });
}

// command: "sure" | "guessed" | "unknown" | "back" | null. Returns { tl, done }.
export function playExit(root, { command = null, dir = 1 } = {}) {
  if (reducedMotion) return { tl: null, done: Promise.resolve() };
  const tl = gsap.timeline();
  tl.to(root.querySelector(".q-body"), { x: -SHIFT * dir, opacity: 0, duration: EXIT_S, ease: "power2.in" }, 0);
  if (command === "sure") tl.add(sweep(root.querySelector('[data-action="sure"]')), 0);
  if (command === "guessed") {
    // Full wobble in the exit's 0.22 s (spec'd at 0.35 s; sped up so it isn't cut off).
    tl.to(root.querySelector('[data-action="guessed"]'), { keyframes: { rotation: [0, -3, 3, -1.5, 0] }, duration: EXIT_S, ease: "power1.inOut" }, 0);
  }
  if (command === "unknown") tl.to(root.querySelectorAll(".option"), { opacity: 0.4, duration: 0.15 }, 0);
  const done = new Promise((resolve) => tl.call(resolve, null, EXIT_S));
  return { tl, done };
}

// ── Option stroke (DrawSVG) ──

// Fit the stroke rect to the option's current size (the SVG covers its border box).
export function sizeStroke(option) {
  const rect = option.querySelector(".option__stroke rect");
  const w = option.offsetWidth, h = option.offsetHeight;
  if (!rect || !w) return;
  rect.setAttribute("width", w - 2);
  rect.setAttribute("height", h - 2);
}

// Selected: the 2px cobalt stroke draws itself 0 → 100% (0.28 s, power2.out).
// Deselected: it reverses to 0 (0.15 s). `animate` false = jump to the end state.
export function setStroke(option, on, animate) {
  const rect = option.querySelector(".option__stroke rect");
  if (!rect) return;
  gsap.killTweensOf(rect);
  // Measure now, not only on resize: a sentence option may have wrapped to two
  // lines since the last measurement, and DrawSVG reads the length at tween start.
  sizeStroke(option);
  if (!animate || reducedMotion) {
    gsap.set(rect, { drawSVG: on ? "100%" : "0%" });
  } else if (on) {
    gsap.fromTo(rect, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.28, ease: "power2.out" });
  } else {
    gsap.to(rect, { drawSVG: "0%", duration: 0.15 });
  }
}

// When the first option is chosen: both main buttons fade 35% → 100% (0.2 s)
// and the primary pulses 1 → 1.03 → 1 (0.3 s).
export function pulseEnable(buttons, primary) {
  if (reducedMotion) return;
  gsap.fromTo(buttons, { opacity: 0.35 }, { opacity: 1, duration: 0.2, clearProps: "opacity" });
  gsap.fromTo(primary, { scale: 1 }, { scale: 1.03, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut", clearProps: "transform" });
}
