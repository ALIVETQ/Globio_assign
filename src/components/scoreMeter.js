// Overall score meter (DESIGN.md §9.2): the big number, a bar filled to the
// score in the verdict colour, and ticks at the "ready" and "almost" lines.
// The tick positions come from config.js, so changing a threshold moves them.
import { MESSAGES } from "../data/messages.js";
import { CONFIG } from "../data/config.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const R = MESSAGES.results;

export function scoreMeterHTML(result, values) {
  const ready = CONFIG.verdict.ready.minOverall;
  const almost = CONFIG.verdict.almost.minOverall;
  // The labels hang off opposite sides of their ticks (almost ← | → ready), so
  // they never overlap on a phone, where the two ticks are only ~50px apart.
  return `
    <div class="meter">
      <p class="meter__number"><span class="meter__value" data-count>${result.overall}</span><span class="meter__pct">%</span></p>
      <div class="meter__bar">
        <div class="meter__track">
          <div class="meter__fill" style="transform: scaleX(${result.overall / 100})"></div>
        </div>
        <span class="meter__tick meter__tick--almost" style="left: ${almost}%">
          <span class="meter__tick-label">${esc(fill(R.almostLine, values))}</span>
        </span>
        <span class="meter__tick meter__tick--ready" style="left: ${ready}%">
          <span class="meter__tick-label">${esc(fill(R.readyLine, values))}</span>
        </span>
      </div>
      <p class="meter__note">${esc(fill(R.passMarkNote, values))}</p>
    </div>`;
}
