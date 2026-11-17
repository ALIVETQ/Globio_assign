// The canvas globe (DESIGN.md §3) — a singleton: one canvas, created once,
// shown on the landing page. (The results page used to show it too; it now
// shows a boarding pass instead, components/boardingPass.js.)
//
// API: mount(container), unmount(), pause(), resume().
//
// It runs its own requestAnimationFrame loop (not GSAP), so slow-mo is applied
// by scaling its clock with prefs.timeScale. The loop stops whenever the canvas
// is off-screen, the tab is hidden, or reduced motion is on (then one still
// frame is drawn instead).
import { gsap } from "./gsap.js";
import { reducedMotion, lowPower, timeScale, onPrefsChange } from "./prefs.js";
import { buildDots, drawFrame, VIEW_LON } from "./globeDraw.js";
import { MESSAGES } from "../data/messages.js";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const arcEase = gsap.parseEase("power2.inOut");
const planeEase = gsap.parseEase("power1.inOut");

// §3.6 timings, in seconds of globe time
const ARC_START = 1.1, ARC_DUR = 1.4;
const FLY = 3.2, REST = 1.2, PULSE = 0.8;
const TRAIL = 14; // positions, one per 60 fps frame
const PHONE_MARGIN = 16; // px each side of the phone globe

let canvas = null, ctx = null, dots = null, colors = null;
let container = null;
let clock = 0, lastTs = null, rafId = null;
let onScreen = true, manualPause = false;
let resizeObs = null, intersectObs = null, unsubPrefs = null;
let box = { w: 0, h: 0, cx: 0, cy: 0, R: 0 };

function readColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: v("--ink", "#111111"),
    paper: v("--paper", "#ffffff"),
    cobalt: v("--cobalt", "#2f63ff"),
    monoFont: v("--font-mono", "monospace"),
    dark: document.documentElement.dataset.theme === "dark",
  };
}

// The theme can change while the globe is on screen: re-read the colours and
// redraw at once (the loop, if running, picks them up on its next frame too).
function onTheme() {
  colors = readColors();
  draw();
}

// §3.5 placement. The slot's CSS decides its size; this decides where in it the
// globe sits and how big it is.
function layout() {
  const w = container.clientWidth, h = container.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (window.innerWidth >= 1024) {
    box = { w, h, cx: w - 0.27 * w, cy: 0.56 * h, R: Math.min(0.42 * h, 0.3 * w) };
  } else if (window.innerWidth >= 640) {
    box = { w, h, cx: 0.55 * w, cy: 0.58 * h, R: Math.min(0.62 * w, 340) };
  } else {
    // Phone: the whole globe fits the width with a 16px margin each side, so
    // India, Germany and the arc are never cut off by the screen edge.
    box = { w, h, cx: 0.5 * w, cy: 0.58 * h, R: Math.min(w / 2 - PHONE_MARGIN, 340) };
  }
}

// What the frame shows at globe time t (§3.6). Reduced motion = the end state.
function frameAt(t) {
  const still = reducedMotion;
  const f = {
    ...box,
    dots,
    colors,
    labels: { from: MESSAGES.globe.labelFrom, to: MESSAGES.globe.labelTo },
    alpha: still ? 1 : 1 - (1 - clamp01(t / 1.1)) ** 3,
    viewLon: still ? VIEW_LON : VIEW_LON + 10 * Math.sin((2 * Math.PI * t) / 40),
    pins: still ? { from: 1, to: 1 } : { from: clamp01((t - 0.8) / 0.6), to: clamp01((t - 0.96) / 0.6) },
    arc: 0,
    plane: null,
    trail: [],
    pulse: null,
  };

  f.arc = still ? 1 : arcEase(clamp01((t - ARC_START) / ARC_DUR));
  if (still) {
    f.plane = 1; // plane at the tip, no trail
    return f;
  }
  const flyStart = ARC_START + ARC_DUR;
  if (t >= flyStart) {
    const c = (t - flyStart) % (FLY + REST);
    if (c < FLY) {
      f.plane = planeEase(c / FLY);
      for (let i = 1; i <= TRAIL; i++) {
        const ct = c - i / 60;
        if (ct < 0) break;
        f.trail.push(planeEase(ct / FLY));
      }
    } else {
      f.plane = 1; // resting at Germany
      const p = (c - FLY) / PULSE;
      if (p < 1) f.pulse = p;
    }
  }
  return f;
}

function draw() {
  if (canvas && box.R > 0) drawFrame(ctx, frameAt(clock));
}

function tick(ts) {
  rafId = null;
  if (!shouldRun()) return;
  // Clamp big gaps (tab switch, breakpoint) so the animation doesn't jump.
  const dt = lastTs === null ? 0 : Math.min((ts - lastTs) / 1000, 0.1);
  lastTs = ts;
  clock += dt * timeScale;
  draw();
  rafId = requestAnimationFrame(tick);
}

function shouldRun() {
  return Boolean(container) && onScreen && !document.hidden && !manualPause && !reducedMotion;
}

// Start or stop the loop to match the current conditions.
function update() {
  if (shouldRun()) {
    if (rafId === null) {
      lastTs = null;
      rafId = requestAnimationFrame(tick);
    }
  } else {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    draw(); // reduced motion: one still frame; paused: keep the last frame
  }
}

function onVisibility() {
  update();
}

export function mount(el) {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "globe-canvas";
    canvas.setAttribute("aria-hidden", "true"); // its meaning is given in text
    ctx = canvas.getContext("2d");
    dots = buildDots(lowPower);
  }
  if (container) unmount();
  container = el;
  clock = 0; // replay the intro on every mount
  colors = readColors();
  el.append(canvas);
  layout();

  resizeObs = new ResizeObserver(() => {
    layout();
    draw();
  });
  resizeObs.observe(el);
  intersectObs = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    update();
  });
  intersectObs.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("examready:theme", onTheme);
  unsubPrefs = onPrefsChange(update);
  // Canvas text needs the mono font; redraw once it has loaded (matters for still frames).
  document.fonts?.ready.then(() => container === el && draw());
  update();
}

export function unmount() {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  resizeObs?.disconnect();
  intersectObs?.disconnect();
  unsubPrefs?.();
  document.removeEventListener("visibilitychange", onVisibility);
  window.removeEventListener("examready:theme", onTheme);
  resizeObs = intersectObs = unsubPrefs = null;
  canvas?.remove();
  container = null;
  manualPause = false;
}

export function pause() {
  manualPause = true;
  update();
}

export function resume() {
  manualPause = false;
  update();
}
