// Ads passage (DESIGN.md §7.5.2) — question r3. The two ad cards ARE the
// options: each is an option button (radio) carrying its display position, so
// selection, keyboard (1/2, A/B), the drawn stroke and scoring all work exactly
// like any other option. a/b never shuffle (LOGIC.md §9), so badge "a" is
// always option "a".
import { esc } from "../dom.js";
import { PASSAGES } from "../data/questions.js";

export function adsOptionsHTML(question) {
  const ads = PASSAGES[question.passage].ads;
  return question.optionOrder
    .map((orig, i) => {
      const letter = question.options[orig]; // "a" | "b"
      const ad = ads.find((a) => a.badge === letter);
      return `
      <button type="button" class="option option--ad" role="radio" aria-checked="false" data-index="${i}" data-action="select" lang="de">
        <span class="keycap ad__badge" aria-hidden="true">${esc(ad.badge)}</span>
        <span class="option__text ad__text">
          <span class="ad__title">${esc(ad.title)}</span>
          ${ad.lines.map((l) => `<span class="ad__line">${esc(l)}</span>`).join("")}
        </span>
        <svg class="option__stroke" aria-hidden="true"><rect x="1" y="1" rx="11" ry="11"/></svg>
      </button>`;
    })
    .join("");
}
