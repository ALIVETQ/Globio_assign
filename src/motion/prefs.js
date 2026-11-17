// Motion preferences (ARCHITECTURE.md §6, DESIGN.md §10). Every animation asks
// this file whether to move, how much to draw, and how fast.
//
// Exports are live bindings: `import { reducedMotion } from "./prefs.js"` always
// sees the current value, including after the debug panel flips a toggle.
import { gsap } from "./gsap.js";

const hasWindow = typeof window !== "undefined";
const query = hasWindow && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

// Debug override (?debug=1 "Reduced motion" toggle). true = simulate the media
// query; false = follow the real system setting.
let forcedReduced = false;

// true → every timeline jumps to its end state, the globe draws one still frame,
// count-ups show their final value.
export let reducedMotion = Boolean(query?.matches);

// Mid-range Android phones are the main audience. On ≤ 4 cores or a narrow
// screen the globe draws half its dots. Decided once at load: the dot set is
// built once, and resizing a desktop window shouldn't rebuild it.
export const lowPower =
  hasWindow &&
  ((navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) || window.innerWidth < 600);

// ?slow=0.25 slows every GSAP animation for tuning. Anything not a positive
// number is ignored so a typo can't freeze the app (timeScale 0 = paused).
function parseSlow() {
  if (!hasWindow) return 1;
  const v = Number(new URLSearchParams(location.search).get("slow"));
  return Number.isFinite(v) && v > 0 ? v : 1;
}
export let timeScale = parseSlow();

const listeners = new Set();
export function onPrefsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  listeners.forEach((fn) => fn({ reducedMotion, timeScale, lowPower }));
}

// When motion gets switched off mid-animation, finish whatever is running so
// nothing is left half-drawn. Infinite loops are skipped: they have no end state.
function finishRunning() {
  for (const anim of gsap.globalTimeline.getChildren(false, true, true)) {
    if (anim.repeat() !== -1) anim.totalProgress(1);
  }
}

function updateReduced() {
  const next = forcedReduced || Boolean(query?.matches);
  if (next === reducedMotion) return;
  reducedMotion = next;
  // Mirrored on <html> so CSS can react too (e.g. [data-reduced-motion="true"]).
  document.documentElement.dataset.reducedMotion = String(reducedMotion);
  if (reducedMotion) finishRunning();
  notify();
}

export function setForcedReducedMotion(on) {
  forcedReduced = Boolean(on);
  updateReduced();
}

export function setTimeScale(value) {
  timeScale = Number.isFinite(value) && value > 0 ? value : 1;
  gsap.globalTimeline.timeScale(timeScale);
  notify();
}

// Use on every timeline a screen creates: under reduced motion it jumps
// straight to its final state instead of playing (DESIGN.md §10 rule 5).
export function respectMotion(tl) {
  if (reducedMotion) tl.progress(1);
  return tl;
}

// ── Apply at load ──
if (hasWindow) {
  document.documentElement.dataset.reducedMotion = String(reducedMotion);
  gsap.globalTimeline.timeScale(timeScale);
  // The learner can change the system setting while the page is open.
  query?.addEventListener?.("change", updateReduced);
}
