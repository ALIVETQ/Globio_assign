// Line illustrations for the six safety-briefing panels (DESIGN.md §5b).
// Each is 220×72 at 1:1, so the 1.5px strokes stay 1.5px. Ink parts use
// currentColor, accents use the .c (cobalt stroke) / .cf (cobalt fill) classes.
// All are aria-hidden: each panel's meaning is in its title and text.
//
// Panel 2's markup is its FINAL frame (option 2 outlined, "I'M SURE" filled,
// cursor hidden): that is what reduced motion shows; motion/briefingMotion.js
// rewinds it and plays the demo.
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { esc } from "../dom.js";

const svg = (body, cls = "") => `<svg class="art ${cls}" viewBox="0 0 220 72" aria-hidden="true" focusable="false">${body}</svg>`;
const PLANE = "M-7 -6 L7 0 L-7 6 L-4 0 Z"; // the journey bar's paper plane

// 01 Your route: a dotted flight path with the three stops, labelled in German.
function route() {
  const [v, g, r] = SECTIONS.map((s) => esc(s.de));
  return svg(`
    <path d="M12 52 C30 52 36 44 50 44 S94 28 110 28 S164 44 176 44 S200 38 208 30" stroke-dasharray="1 5" stroke-linecap="round"/>
    <path class="cf" transform="translate(12 52) rotate(-8)" d="${PLANE}"/>
    <circle class="cf" cx="50" cy="44" r="4"/><circle class="cf" cx="110" cy="28" r="4"/><circle class="cf" cx="176" cy="44" r="4"/>
    <path class="c" d="M208 30 V14 L218 18 L208 22"/>
    <text x="50" y="63" text-anchor="middle">${v}</text>
    <text x="110" y="15" text-anchor="middle">${g}</text>
    <text x="176" y="63" text-anchor="middle">${r}</text>`);
}

// 02 How to answer: three options and an "I'M SURE" button; a cursor dot taps
// option 2, then the button.
function demo() {
  const opt = (y) => `<rect class="m" x="8" y="${y}" width="112" height="16" rx="5"/><line class="m" x1="18" y1="${y + 8}" x2="${y === 28 ? 74 : 62}" y2="${y + 8}"/>`;
  return svg(`
    ${opt(4)}${opt(28)}${opt(52)}
    <rect class="c demo__outline" x="8" y="28" width="112" height="16" rx="5" stroke-width="2"/>
    <rect class="c" x="134" y="26" width="78" height="20" rx="10"/>
    <rect class="cf demo__fill" x="134" y="26" width="78" height="20" rx="10"/>
    <text class="demo__label" x="173" y="39.5" text-anchor="middle">${esc(MESSAGES.question.sure)}</text>
    <circle class="demo__cursor" cx="0" cy="0" r="5" transform="translate(173 36)"/>`, "art--demo");
}

// 03 Guesses count half: a coin marked ½ with a curved "flip" arrow.
function coin() {
  return svg(`
    <g class="coin">
      <circle class="c" cx="96" cy="36" r="22"/>
      <circle class="m" cx="96" cy="36" r="17"/>
      <text class="coin__half" x="96" y="43" text-anchor="middle">½</text>
    </g>
    <path d="M128 18 A30 30 0 0 1 130 54"/>
    <path d="M124 50 L130 55 L135 48"/>`);
}

// 04 Don't know? Say so: the "I don't know this yet" link, with a question mark.
function unknown() {
  return svg(`
    <circle class="c" cx="30" cy="36" r="13"/>
    <text class="art__q" x="30" y="41" text-anchor="middle">?</text>
    <text class="art__link" x="54" y="40">${esc(MESSAGES.question.unknown)}</text>`);
}

// 05 No help on board: a book and a phone, crossed out with one diagonal line.
function noHelp() {
  return svg(`
    <path d="M44 20 Q58 14 72 20 V56 Q58 50 44 56 Z"/><path d="M72 20 Q86 14 100 20 V56 Q86 50 72 56"/>
    <line class="m" x1="50" y1="30" x2="66" y2="27"/><line class="m" x1="50" y1="38" x2="66" y2="35"/>
    <line class="m" x1="78" y1="27" x2="94" y2="30"/><line class="m" x1="78" y1="35" x2="94" y2="38"/>
    <rect x="124" y="12" width="30" height="48" rx="5"/><line x1="134" y1="18" x2="144" y2="18"/><circle cx="139" cy="53" r="2"/>
    <line class="c" x1="36" y1="64" x2="166" y2="8" stroke-width="2" stroke-linecap="round"/>`);
}

// 06 You can go back: a back arrow and a small "saved / refresh" arrow.
function back() {
  return svg(`
    <path d="M100 36 H44 M58 22 L44 36 L58 50" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="c" d="M166 28 A14 14 0 1 0 168 42" stroke-linecap="round"/>
    <path class="c" d="M160 24 L167 28 L162 35" stroke-linecap="round" stroke-linejoin="round"/>`);
}

export const BRIEFING_ART = { route, answer: demo, guess: coin, unknown, noHelp, back };
