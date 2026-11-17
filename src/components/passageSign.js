// Door sign passage (DESIGN.md §7.5.3) — question r4. A dark plaque with two
// screws, hanging from a short hairline. Opening hours in mono, times right-aligned.
import { esc } from "../dom.js";

export function passageSignHTML(p) {
  const hours = p.lines
    .map((l) => `<div class="sign__row"><dt>${esc(l.days)}</dt><dd>${esc(l.times)}</dd></div>`)
    .join("");
  return `
    <div class="sign-wrap">
      <span class="sign__hanger" aria-hidden="true"></span>
      <div class="sign" lang="de">
        <span class="sign__screw is-left" aria-hidden="true"></span>
        <span class="sign__screw is-right" aria-hidden="true"></span>
        <p class="sign__title">${esc(p.title)}</p>
        <p class="sign__subtitle">${esc(p.subtitle)}</p>
        <hr class="sign__divider">
        <p class="sign__heading">${esc(p.heading)}</p>
        <dl class="sign__hours">${hours}</dl>
      </div>
    </div>`;
}
