// Question screen — PHASE 0 PLACEHOLDER: label, prompt, options and the three
// confidence buttons, wired to the real state actions. Passages, keyboard
// shortcuts, journey bar and styling come in Phases 2–4.
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";

const T = MESSAGES.question;
const cleanups = new WeakMap();

export function render(state, actions) {
  const q = state.order[state.index];
  const s = SECTIONS.find((x) => x.id === q.section);
  const label = fill(T.label, {
    sectionNumber: s.number,
    sectionEn: s.en,
    n: state.index + 1,
    total: state.order.length,
  });

  // Display position i shows options[optionOrder[i]] (LOGIC.md §9).
  const options = q.optionOrder
    .map(
      (orig, i) =>
        `<button class="option" role="radio" aria-checked="false" data-action="select" data-index="${i}" lang="de">${esc(q.options[orig])}</button>`,
    )
    .join("");

  const el = fromHTML(`
    <section class="screen placeholder">
      <div class="row row--between">
        <p class="label">${esc(label)}</p>
        ${state.index > 0 ? `<button class="btn btn--link" data-action="back">${esc(T.back)}</button>` : ""}
      </div>
      <h1 class="prompt" lang="de">${esc(q.prompt)}</h1>
      ${q.hint ? `<p class="muted">${esc(q.hint)}</p>` : ""}
      <div class="options" role="radiogroup" aria-label="${esc(T.optionsAria)}">${options}</div>
      <p id="disabled-help" class="sr-only">${esc(T.disabledHelp)}</p>
      <div class="row">
        <button class="btn btn--primary" data-action="sure" data-needs-choice>${esc(T.sure)}</button>
        <button class="btn btn--secondary" data-action="guessed" data-needs-choice>${esc(T.guessed)}</button>
        <button class="btn btn--link" data-action="unknown">${esc(T.unknown)}</button>
      </div>
    </section>
  `);

  update(el, state);
  cleanups.set(
    el,
    onAction(el, {
      select: (btn) => actions.selectOption(Number(btn.dataset.index)),
      sure: () => actions.confirm("sure"),
      guessed: () => actions.confirm("guessed"),
      unknown: () => actions.skip(),
      back: () => actions.back(),
    }),
  );
  return el;
}

// Called by main.js when only the selection changed, so the screen isn't rebuilt.
export function update(el, state) {
  const q = state.order[state.index];
  el.querySelectorAll(".option").forEach((btn) => {
    const selected = q.optionOrder[Number(btn.dataset.index)] === state.pendingChoice;
    btn.setAttribute("aria-checked", String(selected));
  });
  const noChoice = state.pendingChoice === null;
  el.querySelectorAll("[data-needs-choice]").forEach((btn) => {
    btn.disabled = noChoice;
    if (noChoice) btn.setAttribute("aria-describedby", "disabled-help");
    else btn.removeAttribute("aria-describedby");
  });
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
