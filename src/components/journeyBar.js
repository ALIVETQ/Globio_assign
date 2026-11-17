// Journey bar (DESIGN.md §7.4): INDIA ●──●──◉──○ … GERMANY. 15 dots on a gently
// arched path, with wider gaps between sections, and a paper plane at the
// current dot. Phase 2a: static (drawn for the current index).
//
// The SVG is drawn in real pixels from its measured width (not a stretched
// viewBox), so dots stay round and Phase 2b can fly the plane along the real path.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const T = MESSAGES.journey;
const H = 44;
const PAD = 10; // room for the current dot's ring and the plane at both ends
const BASE_Y = 30; // dots sit here at the ends …
const RISE = 10; // … and 10px higher in the middle
const SECTION_GAP = 1.6; // spacing between sections, in normal spacings
const PLANE_LIFT = 12; // the plane sits just above its dot
// A 14px paper plane pointing right (+x), centred on 0,0.
const PLANE = `<path d="M-7 -6 L7 0 L-7 6 L-4 0 Z"/>`;

export function journeyBarHTML() {
  return `
    <div class="journey" role="progressbar" aria-valuemin="1">
      <span class="journey__end label" aria-hidden="true"><span class="journey__long">${esc(T.from)}</span><span class="journey__short">${esc(T.fromShort)}</span></span>
      <svg class="journey__track" height="${H}" aria-hidden="true"></svg>
      <span class="journey__end label" aria-hidden="true"><span class="journey__long">${esc(T.to)}</span><span class="journey__short">${esc(T.toShort)}</span></span>
    </div>`;
}

// Quadratic Bézier with the control point at mid-width: x is linear in t, so
// evenly spaced x positions are also evenly spaced t, and y = BASE_Y − 4·RISE·t(1−t).
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

function draw(svg, order, index) {
  const width = svg.clientWidth;
  if (!width) return;
  const { P0, P1, P2, at, ts } = geometry(width, order);
  const t = ts[index];
  const [cx, cy] = at(t);
  // Split the curve at t (de Casteljau) for the cobalt "travelled" part.
  const Q1 = [P0[0] + (P1[0] - P0[0]) * t, P0[1] + (P1[1] - P0[1]) * t];

  const dots = ts
    .map((ti, i) => {
      const [x, y] = at(ti);
      if (i < index) return `<circle class="journey__dot is-done" cx="${x}" cy="${y}" r="4"/>`;
      if (i === index) return `<circle class="journey__dot is-current" cx="${x}" cy="${y}" r="6"/>`;
      return `<circle class="journey__dot is-next" cx="${x}" cy="${y}" r="3.5"/>`;
    })
    .join("");

  // The plane points along the path: tangent B'(t) = 2(1−t)(P1−P0) + 2t(P2−P1).
  const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
  const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  svg.setAttribute("viewBox", `0 0 ${width} ${H}`);
  svg.innerHTML = `
    <path class="journey__path" d="M${P0} Q${P1} ${P2}"/>
    <path class="journey__path is-done" d="M${P0} Q${Q1} ${cx},${cy}"/>
    ${dots}
    <g class="journey__plane" transform="translate(${cx} ${cy - PLANE_LIFT}) rotate(${angle.toFixed(2)})">${PLANE}</g>`;
}

// Wire up a rendered bar. Returns { update(index), destroy() }.
export function mountJourney(root, order, index) {
  const bar = root.querySelector(".journey");
  const svg = bar.querySelector("svg");
  let current = index;
  const label = () => {
    bar.setAttribute("aria-valuemax", String(order.length));
    bar.setAttribute("aria-valuenow", String(current + 1));
    bar.setAttribute("aria-label", fill(T.ariaLabel, { n: current + 1, total: order.length }));
  };
  label();
  // Drawn once the bar has a width (ResizeObserver fires before the first paint),
  // and again whenever the width changes.
  const ro = new ResizeObserver(() => draw(svg, order, current));
  ro.observe(svg);
  return {
    update(i) {
      current = i;
      label();
      draw(svg, order, current);
    },
    destroy() {
      ro.disconnect();
    },
  };
}
