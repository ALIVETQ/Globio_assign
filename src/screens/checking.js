// Checking screen (DESIGN.md §8, CONTENT.md §7): three readout lines with the
// learner's real skill scores, then on to results automatically. The readout
// animation (and its timing, 1.6 s in all) is in motion/checkingMotion.js.
import { MESSAGES } from "../data/messages.js";
import { esc, fromHTML } from "../dom.js";
import { themeToggleHTML } from "../components/themeToggle.js";
import { prepareReadout, playReadout } from "../motion/checkingMotion.js";

const T = MESSAGES.checking;
const live = new WeakMap();

export function render(state, actions) {
  // The scores come from the result object only (LOGIC.md §8): nothing is recalculated here.
  const lines = T.lines
    .map((l) => {
      const score = state.result?.skills[l.section]?.score ?? 0;
      return `<li class="readout__line">
        <span class="readout__label">${esc(l.label)}</span>
        <span class="readout__leader" aria-hidden="true"></span>
        <span class="readout__value" data-score="${score}">${score}%</span>
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
  prepareReadout(el);
  live.set(el, { actions, anim: null });
  return el;
}

// The readout starts once the screen is in (after the glow), and moves on to
// results when it ends, so finish() never fires mid-transition. Its timing
// (DESIGN.md §8: 1.6 s; ARCHITECTURE.md §11 says 1.5 s, but DESIGN.md is the
// more specific file for timings) lives in motion/checkingMotion.js.
export function enter(el) {
  const h = live.get(el);
  h.anim?.kill(); // a debug "replay" must not leave two readouts running
  h.anim = playReadout(el, () => h.actions.finish());
  return Promise.resolve();
}

export function exit() {
  return Promise.resolve();
}

export function destroy(el) {
  live.get(el)?.anim?.kill();
  live.delete(el);
}
