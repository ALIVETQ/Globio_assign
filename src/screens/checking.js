// Checking screen — PHASE 0 PLACEHOLDER: title and section lines, then on to
// results automatically after the 1.5 s readout (ARCHITECTURE.md §11, Phase 5).
// The typed lines and count-ups come in Phase 5.
import { MESSAGES } from "../data/messages.js";
import { esc, fromHTML } from "../dom.js";

const T = MESSAGES.checking;
const READOUT_MS = 1500; // ARCHITECTURE.md Phase 5: "the 1.5 s checking readout"
const timers = new WeakMap();
const actionsFor = new WeakMap();

export function render(state, actions) {
  const lines = T.lines
    .map((l) => `<li class="label">${esc(l.label)} · ${state.result?.skills[l.section]?.score ?? 0}</li>`)
    .join("");
  const el = fromHTML(`
    <section class="screen placeholder">
      <h1 class="h2">${esc(T.title)}</h1>
      <ul class="plain-list">${lines}</ul>
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
