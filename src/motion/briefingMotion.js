// Safety briefing motion (DESIGN.md §5b). Seconds from screen enter:
//   0     header fades up quickly (0.3 s, 40 ms apart) with the action bar — the
//         landing's glitch-out half (0.285 s) + this = the ≤ 0.6 s Start transition
//   0.1   the six panels fade up 70 ms apart, unfolding slightly (rotateX 8° → 0)
//   0.84  panel 3's coin flips once (once its panel is in)
//   1.05  panel 2's demo starts (all panels in): the cursor dot taps option 2
//         (its outline draws), then "I'M SURE" (its fill sweeps); every 3.5 s,
//         3 times, ending on the final frame.
// TAKE OFF: the button lifts 3px (0.15 s), then main.js runs the horizon glow.
// Reduced motion: none of this; the markup is the final frame (the demo too).
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";

const HEAD = 0.3, HEAD_STEP = 0.04;
const PANELS_AT = 0.1, PANEL_STEP = 0.07, PANEL = 0.6;
const LOOP = 3.5, LOOPS = 3;
const $ = (root, sel) => root.querySelector(sel);

function quickFadeUp(el) {
  return gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: HEAD, ease: "soft", clearProps: "opacity,transform" });
}

function coinFlip(root) {
  const coin = $(root, ".coin");
  const tl = gsap.timeline();
  // Edge-on and back (a flip seen from the front), with a small toss upwards.
  tl.to(coin, { keyframes: [{ scaleX: 0.05, duration: 0.2, ease: "power1.in" }, { scaleX: 1, duration: 0.2, ease: "power1.out" }], transformOrigin: "50% 50%" }, 0);
  tl.to(coin, { keyframes: { y: [0, -6, 0] }, duration: 0.4, ease: "power1.inOut" }, 0);
  return tl;
}

// The demo's start frame (option not outlined, button not filled, cursor away).
function demoStart(parts) {
  gsap.set(parts.outline, { drawSVG: "0%" });
  gsap.set(parts.fill, { scaleX: 0, transformOrigin: "0% 50%" });
  gsap.set(parts.label, { fill: "var(--cobalt)" });
  gsap.set(parts.cursor, { x: 196, y: 64, scale: 1, opacity: 0, transformOrigin: "50% 50%" });
}

function demo(root) {
  const parts = {
    outline: $(root, ".demo__outline"),
    fill: $(root, ".demo__fill"),
    label: $(root, ".demo__label"),
    cursor: $(root, ".demo__cursor"),
  };
  demoStart(parts); // shown while the panels come in
  const tap = (t) => d.to(parts.cursor, { scale: 0.7, duration: 0.08, yoyo: true, repeat: 1 }, t);
  const d = gsap.timeline({ repeat: LOOPS - 1, onRepeat: () => demoStart(parts) });
  d.to(parts.cursor, { opacity: 1, duration: 0.2 }, 0);
  d.to(parts.cursor, { x: 64, y: 36, duration: 0.6, ease: "power2.inOut" }, 0.2); // to option 2
  tap(0.8);
  d.to(parts.outline, { drawSVG: "100%", duration: 0.45, ease: "power1.inOut" }, 0.85);
  d.to(parts.cursor, { x: 173, y: 36, duration: 0.5, ease: "power2.inOut" }, 1.4); // to "I'M SURE"
  tap(1.9);
  d.to(parts.fill, { scaleX: 1, duration: 0.35, ease: "power2.out" }, 1.95);
  d.set(parts.label, { fill: "var(--paper)" }, 2.1); // white text once the fill is under it
  d.to(parts.cursor, { opacity: 0, duration: 0.3 }, 3.1);
  d.set({}, {}, LOOP); // each loop lasts exactly 3.5 s
  return d;
}

// Returns the entrance timeline, or null under reduced motion.
export function playBriefing(root) {
  if (reducedMotion) return null;
  const tl = gsap.timeline();
  root.querySelectorAll(".briefing__head > *").forEach((el, i) => tl.add(quickFadeUp(el), i * HEAD_STEP));
  tl.add(quickFadeUp($(root, ".briefing__actions")), 0);
  const panels = root.querySelectorAll(".panel");
  panels.forEach((panel, i) => {
    tl.fromTo(
      panel,
      { opacity: 0, y: 16, rotationX: 8, transformPerspective: 700, transformOrigin: "50% 0%" },
      { opacity: 1, y: 0, rotationX: 0, duration: PANEL, ease: "soft", clearProps: "opacity,transform" },
      PANELS_AT + i * PANEL_STEP,
    );
  });
  const allIn = PANELS_AT + (panels.length - 1) * PANEL_STEP + PANEL;
  tl.add(quickFadeUp($(root, ".seatbelt")), PANELS_AT + panels.length * PANEL_STEP);
  tl.add(coinFlip(root), PANELS_AT + 2 * PANEL_STEP + PANEL);
  tl.add(demo(root), allIn);
  return tl;
}

// TAKE OFF: a small lift before the glow. Resolves when it is done.
export function playTakeOff(button) {
  if (reducedMotion || !button) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.to(button, { y: -3, duration: 0.15, ease: "power2.out", onComplete: resolve });
  });
}
