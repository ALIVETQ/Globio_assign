// "What this check can't see" (DESIGN.md §9.7): the four real exam sections.
// Lesen is tested here (tick); the other three get a self-check question.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";

const R = MESSAGES.results;
const C = MESSAGES.coverage;
// In real-exam order. Only Lesen is covered by this check.
const TILES = [
  { key: "lesen", covered: true },
  { key: "hoeren", covered: false },
  { key: "schreiben", covered: false },
  { key: "sprechen", covered: false },
];

const TICK = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="var(--paper)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const QUESTION = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="12" y="16.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor" font-family="inherit">?</text></svg>`;

export function examCoverageHTML() {
  const tiles = TILES.map(
    ({ key, covered }) => `
      <li class="tile${covered ? " is-covered" : ""}">
        <div class="tile__head">
          <span class="tile__icon">${covered ? TICK : QUESTION}</span>
          <span class="label">${esc(R.coveragePoints)}</span>
        </div>
        <h3 class="tile__title">${esc(C[key].title)}</h3>
        <p class="tile__body">${esc(C[key].body)}</p>
        ${covered ? "" : '<span class="tile__shimmer" aria-hidden="true"></span>'}
      </li>`,
  ).join("");

  return `
    <section class="results-block" aria-labelledby="coverage-title">
      <h2 id="coverage-title" class="h2">${esc(R.coverageTitle)}</h2>
      <p class="muted results-block__intro">${esc(R.coverageIntro)}</p>
      <ul class="plain-list tiles">${tiles}</ul>
    </section>`;
}
