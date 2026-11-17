// Boarding pass, New Delhi → Berlin (DESIGN.md §9.2): the right side of the
// verdict block. A main part and a stub, split by a perforation with a notch
// cut out at each end. The plane on the route sits `result.overall`% of the
// way along (at BER for "ready"), and the status word shows on split-flap cells.
//
// The whole ticket is decorative (aria-hidden); screen readers get one
// sentence instead (`ticket.srText`). Motion: motion/ticketMotion.js.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";
import { rawPathOf, placePlane, setDone } from "../motion/journeyMotion.js";

const T = MESSAGES.results.ticket;
const NOTCH = 10; // px, radius of the perforation notches (matches --notch in ticket.css)

// The route: a gentle arc in its own viewBox, scaled evenly so the dots stay
// round. 120 units wide: about 1:1 on a wide ticket, and still readable (the
// plane ~8px) in the ~70px a phone leaves between DEL and BER.
const ROUTE_D = "M8 27 Q60 3 112 27";
// The journey bar's paper plane: 14 units, pointing right (+x), centred on 0,0.
const PLANE = '<path d="M-7 -6 L7 0 L-7 6 L-4 0 Z"/>';
const BRAND_PLANE = `<svg class="ticket__brand-plane" viewBox="-8 -8 16 16" width="14" height="14"><path d="M-7 -6 L7 0 L-7 6 L-4 0 Z"/></svg>`;

// Where the plane ends up: the score, or all the way to Berlin for "ready".
export const planeProgress = (result) => (result.verdict === "ready" ? 1 : result.overall / 100);

// Decorative barcode bars, generated from the result so the same result always
// gets the same barcode (a tiny seeded generator; no randomness).
function barcodeHTML(result) {
  let seed = result.overall * 7919 + Object.values(result.skills).reduce((a, s) => a * 31 + s.score, 17);
  const next = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const bars = [];
  for (let x = 0; x < 116; ) {
    const w = 1 + Math.floor(next() * 3); // bar 1–3 units
    bars.push(`<rect x="${x}" y="0" width="${w}" height="40"/>`);
    x += w + 1 + Math.floor(next() * 2); // gap 1–2 units
  }
  return `<svg class="ticket__barcode" viewBox="0 0 120 40" preserveAspectRatio="none">${bars.join("")}</svg>`;
}

// One flap per character; a blank flap between words (like the train board).
function flapsHTML(word) {
  return [...word]
    .map((ch) => (ch === " " ? '<span class="flap is-blank"></span>' : `<span class="flap">${esc(ch)}</span>`))
    .join("");
}

function place(p) {
  return `<div class="ticket__place${p === T.to ? " is-to" : ""}">
    <span class="ticket__code">${esc(p.code)}</span><span class="ticket__city">${esc(p.city)}</span></div>`;
}

export function boardingPassHTML(result, values) {
  const status = T.status[result.verdict];
  const fields = T.fields
    .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(fill(f.value, values))}</dd></div>`)
    .join("");
  return `
    <div class="ticket ticket--${esc(result.verdict)}">
      <p class="sr-only">${esc(fill(T.srText, { ...values, status }))}</p>
      <div class="ticket__card" aria-hidden="true">
        <div class="ticket__main">
          <div class="ticket__head">
            <span class="ticket__brand">${BRAND_PLANE}${esc(T.airline)}</span>
            <span class="label">${esc(T.title)}</span>
          </div>
          <div class="ticket__route">
            ${place(T.from)}
            <svg class="ticket__path" viewBox="0 0 120 36">
              <path class="ticket__dots" d="${ROUTE_D}"/>
              <path class="ticket__flown" d="${ROUTE_D}"/>
              <g class="ticket__plane"><g class="ticket__plane-body">${PLANE}</g></g>
            </svg>
            ${place(T.to)}
          </div>
          <dl class="ticket__fields">${fields}</dl>
          <div class="ticket__status">
            <span class="ticket__label">${esc(T.statusLabel)}</span>
            <div class="ticket__flaps flap-row">${flapsHTML(status)}</div>
          </div>
          <svg class="ticket__perf">
            <defs><mask id="ticket-perf-mask" maskUnits="userSpaceOnUse"><line class="ticket__perf-draw"/></mask></defs>
            <line class="ticket__perf-line" mask="url(#ticket-perf-mask)"/>
          </svg>
        </div>
        <div class="ticket__stub">
          <p class="ticket__stub-route">${esc(T.stubRoute)}</p>
          <p class="ticket__stub-status">${esc(status)}</p>
          ${barcodeHTML(result)}
          <p class="ticket__note">${esc(T.notReal)}</p>
        </div>
      </div>
    </div>`;
}

// The perforation is drawn in px, so its dashes keep their size: the SVG takes
// the size of the main part's edge (CSS), and its line runs between the two
// notches — down the right edge on wide screens, along the bottom on phones.
function layoutPerforation(svg) {
  const w = svg.clientWidth, h = svg.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const vertical = h > w;
  const coords = vertical
    ? { x1: w / 2, y1: NOTCH, x2: w / 2, y2: h - NOTCH }
    : { x1: NOTCH, y1: h / 2, x2: w - NOTCH, y2: h / 2 };
  for (const line of svg.querySelectorAll("line")) {
    for (const [k, v] of Object.entries(coords)) line.setAttribute(k, v.toFixed(1));
  }
}

// Puts the ticket in its final state (plane at its place, flown line drawn,
// perforation sized) and keeps the perforation sized on resize. The ticket must
// be on the page. Returns { raw, destroy }; raw is the route for the plane.
export function mountBoardingPass(root, result) {
  const ticket = root.querySelector(".ticket");
  const svg = ticket.querySelector(".ticket__perf");
  const raw = rawPathOf(ticket.querySelector(".ticket__dots"));
  const p = planeProgress(result);
  placePlane(ticket.querySelector(".ticket__plane"), raw, p);
  setDone(ticket.querySelector(".ticket__flown"), p);
  layoutPerforation(svg);
  const ro = new ResizeObserver(() => layoutPerforation(svg));
  ro.observe(ticket);
  return { raw, destroy: () => ro.disconnect() };
}
