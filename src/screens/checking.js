// Checking screen (DESIGN.md §8, CONTENT.md §7): three readout lines with the
// learner's real skill scores, then on to results automatically.
// Phase 5a is static; the typed lines and count-ups come in Phase 5b.
import { MESSAGES } from "../data/messages.js";
import { esc, fromHTML } from "../dom.js";
import { themeToggleHTML } from "../components/themeToggle.js";

const T = MESSAGES.checking;
// DESIGN.md §8: shown for 1.6 s. (ARCHITECTURE.md §11 says "1.5 s"; DESIGN.md is
// the more specific file for timings, so it wins.)
const READOUT_MS = 1600;
const timers = new WeakMap();
const actionsFor = new WeakMap();

export function render(state, actions) {
  // The scores come from the result object only (LOGIC.md §8): nothing is recalculated here.
  const lines = T.lines
    .map((l) => {
      const score = state.result?.skills[l.section]?.score ?? 0;
      return `<li class="readout__line">
        <span class="readout__label">${esc(l.label)}</span>
        <span class="readout__leader" aria-hidden="true"></span>
        <span class="readout__value">${score}%</span>
      </li>`;
    })
    .join("");
  const el = fromHTML(`
    <section class="screen checking">
      <div class="row row--end checking__top">${themeToggleHTML()}</div>
      <div class="checking__column">
        <h1 class="label checking__title">${esc(T.title)}</h1>
        <ul class="plain-list readout">${lines}</ul>
      </div>
    </section>
  `);
  actionsFor.set(el, actions);
  return el;
}

// The timer starts after the entrance so finish() never fires mid-transition.
export function enter(el) {
  clearTimeout(timers.get(el)); // a debug "replay" must not leave two timers running
  timers.set(el, setTimeout(() => actionsFor.get(el)?.finish(), READOUT_MS));
  return Promise.resolve();
}

export function exit() {
  return Promise.resolve();
}

export function destroy(el) {
  clearTimeout(timers.get(el));
  timers.delete(el);
  actionsFor.delete(el);
}
