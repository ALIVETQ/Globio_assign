// Results screen — PHASE 0 PLACEHOLDER: verdict stamp text, the full result
// object as JSON (for checking presets against LOGIC.md §13), and the Retake and
// Home buttons. The real results page comes in Phase 5.
import { MESSAGES } from "../data/messages.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { themeToggleHTML } from "../components/themeToggle.js";

const cleanups = new WeakMap();

export function render(state, actions) {
  const r = state.result;
  const stamp = r ? MESSAGES.results.verdict[r.verdict].stamp : "";

  const el = fromHTML(`
    <section class="screen placeholder">
      <div class="row row--between">
        <p class="label">${esc(MESSAGES.results.label)}</p>
        ${themeToggleHTML()}
      </div>
      <h1 class="display">${esc(stamp)}</h1>
      <pre class="json">${esc(JSON.stringify(r, null, 2))}</pre>
      <div class="row">
        <button class="btn btn--primary" data-action="retake">${esc(MESSAGES.actions.retake)}<span aria-hidden="true">→</span></button>
        <button class="btn btn--secondary" data-action="home">${esc(MESSAGES.actions.home)}</button>
      </div>
    </section>
  `);

  cleanups.set(
    el,
    onAction(el, {
      retake: () => actions.retake(),
      home: () => actions.goHome(),
    }),
  );
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
