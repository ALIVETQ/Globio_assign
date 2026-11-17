// Section break — PHASE 0 PLACEHOLDER: section number, names and a "next"
// button. The giant sliding letters come in Phase 2.
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";

const cleanups = new WeakMap();

export function render(state, actions) {
  const sectionId = state.order[state.index]?.section ?? SECTIONS[0].id;
  const s = SECTIONS.find((x) => x.id === sectionId);

  const el = fromHTML(`
    <section class="screen placeholder">
      <p class="label">${esc(fill(MESSAGES.sectionBreak.counter, { number: s.number }))}</p>
      <h1 class="display" lang="de">${esc(s.number)} ${esc(s.de)}</h1>
      <p class="overline">${esc(s.en)}</p>
      <p class="body-lg muted">${esc(s.blurb)}</p>
      <div class="row">
        <button class="btn btn--secondary" data-action="next">${esc(MESSAGES.sectionBreak.skip)}</button>
      </div>
    </section>
  `);

  cleanups.set(el, onAction(el, { next: () => actions.next() }));
  return el;
}

export function enter() {
  return Promise.resolve();
}

export function exit() {
  return Promise.resolve();
}

export function destroy(el) {
  cleanups.get(el)?.();
  cleanups.delete(el);
}
