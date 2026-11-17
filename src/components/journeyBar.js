// Journey bar (DESIGN.md §7.4): INDIA ●──●──◉──○ … GERMANY. 15 dots on a gently
// arched path, with wider gaps between sections, and a paper plane at the
// current dot. When the bar appears at a new position in the same attempt, the
// plane flies there from the previous one (motion/journeyMotion.js).
//
// The SVG is drawn in real pixels from its measured width (not a stretched
// viewBox), so dots stay round and the plane follows the real path.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";
import { rawPathOf, placePlane, setDone, flyPlane } from "../motion/journeyMotion.js";
import { themeToggleHTML } from "./themeToggle.js";

const T = MESSAGES.journey;
const H = 44;
const PAD = 10; // room for the current dot's ring and the plane at both ends
const BASE_Y = 30; // dots sit here at the ends …
const RISE = 10; // … and 10px higher in the middle
const SECTION_GAP = 1.6; // spacing between sections, in normal spacings
const PLANE_LIFT = 12; // the plane sits just above its dot
// A 14px paper plane pointing right (+x), centred on 0,0, lifted above the path.
const PLANE = `<g transform="translate(0 -${PLANE_LIFT})"><path d="M-7 -6 L7 0 L-7 6 L-4 0 Z"/></g>`;

// Where the bar was last shown, so the next bar can fly the plane from there.
let last = null; // { attempt, index }

export function journeyBarHTML() {
  return `
    <div class="journey">
      <div class="journey__progress" role="progressbar" aria-valuemin="1">
        <span class="journey__end label" aria-hidden="true"><span class="journey__long">${esc(T.from)}</span><span class="journey__short">${esc(T.fromShort)}</span></span>
        <svg class="journey__track" height="${H}" aria-hidden="true"></svg>
        <span class="journey__end label" aria-hidden="true"><span class="journey__long">${esc(T.to)}</span><span class="journey__short">${esc(T.toShort)}</span></span>
      </div>
      ${themeToggleHTML()}
    </div>`;
}

// Quadratic Bézier with the control point at mid-width: x is linear in t, so
// evenly spaced x positions are evenly spaced t, and y = BASE_Y − 4·RISE·t(1−t).
function geometry(width, order) {
  const P0 = [PAD, BASE_Y];
  const P2 = [width - PAD, BASE_Y];
  const P1 = [width / 2, BASE_Y - 2 * RISE];
  const at = (t) => [P0[0] + (P2[0] - P0[0]) * t, BASE_Y - 4 * RISE * t * (1 - t)];
  // Spacing units between dots: 1, or 1.6 where the section changes.
  const steps = order.slice(1).map((q, i) => (q.section !== order[i].section ? SECTION_GAP : 1));
  const total = steps.reduce((a, b) => a + b, 0);
  let acc = 0;
  const ts = [0, ...steps.map((s) => (acc += s) / total)];
  return { P0, P1, P2, at, ts };
}

// Length-based progress (0–1) of each dot, so it matches MotionPath and DrawSVG.
function lengthProgress(at, ts) {
  const N = 400;
  const cum = [0];
  let prev = at(0);
  for (let i = 1; i <= N; i++) {
    const p = at(i / N);
    cum.push(cum[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  const L = cum[N];
  return ts.map((t) => {
    const f = t * N;
    const i = Math.min(N - 1, Math.floor(f));
    return (cum[i] + (cum[i + 1] - cum[i]) * (f - i)) / L;
  });
}

function draw(svg, order, index) {
  const width = svg.clientWidth;
  if (!width) return null;
  const { P0, P1, P2, at, ts } = geometry(width, order);
  const dots = ts
    .map((ti, i) => {
      const [x, y] = at(ti);
      const cls = i < index ? "is-done" : i === index ? "is-current" : "is-next";
      const r = i < index ? 4 : i === index ? 6 : 3.5;
      return `<circle class="journey__dot ${cls}" data-i="${i}" cx="${x}" cy="${y}" r="${r}"/>`;
    })
    .join("");
  const d = `M${P0} Q${P1} ${P2}`;
  svg.setAttribute("viewBox", `0 0 ${width} ${H}`);
  svg.innerHTML = `
    <path class="journey__path" d="${d}"/>
    <path class="journey__path is-done" d="${d}"/>
    ${dots}
    <g class="journey__plane">${PLANE}</g>`;
  const parts = {
    plane: svg.querySelector(".journey__plane"),
    donePath: svg.querySelector(".journey__path.is-done"),
    raw: rawPathOf(svg.querySelector(".journey__path")),
    progress: lengthProgress(at, ts),
  };
  placePlane(parts.plane, parts.raw, parts.progress[index]);
  setDone(parts.donePath, parts.progress[index]);
  return parts;
}

// Wire up a rendered bar. Returns { destroy() }.
export function mountJourney(root, order, index, attempt) {
  const bar = root.querySelector(".journey__progress");
  const svg = bar.querySelector("svg");
  bar.setAttribute("aria-valuemax", String(order.length));
  bar.setAttribute("aria-valuenow", String(index + 1));
  bar.setAttribute("aria-label", fill(T.ariaLabel, { n: index + 1, total: order.length }));

  // Fly from where the previous bar was, if it was this attempt (not after a retake).
  const from = last && last.attempt === attempt && last.index !== index ? last.index : null;
  last = { attempt, index };
  let tl = null;
  let first = true;

  // Drawn once the bar has a width (ResizeObserver fires before the first
  // paint), and again whenever the width changes (the flight then just snaps).
  const ro = new ResizeObserver(() => {
    tl?.kill();
    const parts = draw(svg, order, index);
    if (!parts || !first || from === null) return;
    first = false;
    tl = flyPlane({
      ...parts,
      from: parts.progress[from],
      to: parts.progress[index],
      leftDot: svg.querySelector(`.journey__dot[data-i="${from}"]`),
    });
  });
  ro.observe(svg);
  return {
    destroy() {
      ro.disconnect();
      tl?.kill();
    },
  };
}
