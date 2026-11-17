// Skill bars (DESIGN.md §9.3): one row per section, in sections.js order, with
// a dashed line at the "every skill" ready line (config.js, 60 today).
// A bar below that line is red AND says so in text (colour is never the only signal).
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { CONFIG } from "../data/config.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const R = MESSAGES.results;

export function skillBarsHTML(result, values) {
  const line = CONFIG.verdict.ready.minEverySkill;
  const rows = SECTIONS.map((s, i) => {
    const sk = result.skills[s.id];
    const below = sk.score < line;
    // Rows are placed explicitly in the grid (row 1 holds the line label), so
    // the dashed line can span the bar column of all three rows on wide screens.
    return `
      <div class="skill${below ? " is-below" : ""}" style="--row: ${i + 2}">
        <p class="skill__name"><span>${esc(s.name)}</span> <span class="label" lang="de">${esc(s.de)}</span></p>
        <div class="skill__bar" role="img" aria-label="${esc(`${s.name} ${sk.score}%`)}">
          <div class="skill__fill" style="transform: scaleX(${sk.score / 100})"></div>
        </div>
        <p class="skill__score"><span class="skill__value" data-count>${sk.score}%</span>
          <span class="muted"> · ${esc(fill(R.skillRight, sk))}</span></p>
      </div>`;
  }).join("");

  return `
    <section class="results-block" aria-labelledby="skills-title">
      <h2 id="skills-title" class="h2">${esc(R.skillsTitle)}</h2>
      <div class="skills" style="--line: ${line}%">
        <p class="label skills__line-label">${esc(fill(R.skillLine, values))}</p>
        <span class="skills__line" aria-hidden="true"></span>
        ${rows}
      </div>
    </section>`;
}
