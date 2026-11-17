// The briefing's seatbelt pledge (DESIGN.md §5b): a cabin-style "FASTEN
// SEATBELT" sign, and a card that is one big <label> around a real (visually
// hidden) checkbox — so a click anywhere on the card, or Space on the focused
// checkbox, fastens it. The tongue and buckle are drawn in SVG, 40px apart.
//
// Fastened / unfastened is decided by state.accepted; setSeatbelt() shows a
// state at once, motion/seatbeltMotion.js animates the change.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";

const B = MESSAGES.briefing;
// How far the tongue slides: the 40px gap, plus the depth it goes into the buckle.
export const TONGUE_TRAVEL = 52;

const SEAT_ICON = `<svg class="seatbelt-sign__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
  <circle cx="12" cy="4.5" r="2.5"/><path d="M8 21 V12 Q8 8.5 12 8.5 Q16 8.5 16 12 V21"/><path d="M7 11.5 L17 18.5"/><rect x="10.5" y="13.4" width="3.5" height="2.6" rx=".6"/></svg>`;

const BUCKLE = `<svg class="belt" viewBox="0 0 150 44" width="150" height="44" aria-hidden="true" focusable="false">
  <g class="belt__tongue">
    <rect class="belt__strap" x="-60" y="16" width="88" height="12" rx="2"/>
    <rect class="belt__plate" x="26" y="11" width="32" height="22" rx="4"/>
    <rect x="33" y="18" width="12" height="8" rx="2"/>
    <rect class="belt__tip" x="56" y="15" width="16" height="14" rx="2"/>
  </g>
  <g class="belt__buckle">
    <rect class="belt__housing" x="112" y="7" width="36" height="30" rx="7"/>
    <rect class="belt__release" x="121" y="15" width="16" height="14" rx="3"/>
  </g>
</svg>`;

export function seatbeltHTML(accepted) {
  return `
    <div class="seatbelt${accepted ? " is-fastened" : ""}">
      <div class="seatbelt-sign" aria-hidden="true">${SEAT_ICON}<span>${esc(B.seatbeltSign)}</span></div>
      <label class="pledge">
        <input class="sr-only pledge__input" type="checkbox"${accepted ? " checked" : ""}>
        ${BUCKLE}
        <span class="pledge__text">${esc(B.pledge)}</span>
      </label>
    </div>`;
}

// Show a state at once (render, reduced motion, or a change while animating).
export function setSeatbelt(root, on) {
  root.querySelector(".seatbelt").classList.toggle("is-fastened", on);
  root.querySelector(".pledge__input").checked = on;
  // An SVG attribute, not CSS: GSAP animates SVG transforms through the attribute.
  root.querySelector(".belt__tongue").setAttribute("transform", `translate(${on ? TONGUE_TRAVEL : 0} 0)`);
}
