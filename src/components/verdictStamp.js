// The verdict stamp (DESIGN.md §9.2): the verdict word in a rotated box, with an
// "ink" texture so it looks stamped rather than typed.
//
// The texture is an SVG filter, not an image (ARCHITECTURE.md §7): fractal
// noise (baseFrequency .9, 2 octaves) is turned into an alpha mask that knocks
// out roughly 12% of the stamp's pixels in small specks.
import { esc } from "../dom.js";

// Noise → alpha: alpha = 9·R − 2.9, so only the darkest ~12% of the noise
// (R below ≈ 0.32) becomes fully transparent; everything else stays solid ink.
const INK_FILTER = `
  <svg class="stamp__defs" width="0" height="0" aria-hidden="true" focusable="false">
    <filter id="stamp-ink" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
      <feColorMatrix in="noise" type="matrix" result="mask"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -2.9" />
      <feComposite in="SourceGraphic" in2="mask" operator="in" />
    </filter>
  </svg>`;

// verdict: "ready" | "almost" | "notYet". The stamp is the page's heading, so
// screen readers hear the verdict first.
export function verdictStampHTML(verdict, text) {
  // The ring (the "impact" ripple, DESIGN.md §9.11) sits beside the h1, not in
  // it: inside, the ink filter would texture it and clip it to the stamp's box.
  return `${INK_FILTER}
    <div class="stamp-wrap">
      <h1 class="stamp stamp--${esc(verdict)}"><span class="stamp__word">${esc(text)}</span></h1>
      <span class="stamp__ring" aria-hidden="true"></span>
    </div>`;
}
