// Question screen (DESIGN.md §7.1–7.4), shared by all three sections.
// Phase 2a: layout, options, confidence bar, Back, static journey bar and
// keyboard shortcuts. Motion comes in 2b; passages in Phase 4.
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";
import { commandForKey } from "../logic/keys.js";
import { journeyBarHTML, mountJourney } from "../components/journeyBar.js";
import { optionListHTML, updateOptionList } from "../components/optionList.js";
import { confidenceBarHTML, updateConfidenceBar } from "../components/confidenceBar.js";

const Q = MESSAGES.question;
const live = new WeakMap();

// "___" in a prompt is drawn as a 3em cobalt underline (§7.1). The underscores
// stay in the text for screen readers, visually hidden.
function promptHTML(prompt) {
  return esc(prompt).replace(/_{3,}/g, '<span class="gap"><span class="sr-only">___</span></span>');
}

function labelText(state, q) {
  const s = SECTIONS.find((x) => x.id === q.section);
  return fill(Q.label, { sectionNumber: s.number, sectionEn: s.en, n: state.index + 1, total: state.order.length });
}

export function render(state, actions) {
  const q = state.order[state.index];
  const back =
    state.index > 0 // hidden on question 1 of the whole test
      ? `<button type="button" class="btn btn--link q-back" data-action="back"><span aria-hidden="true">← </span>${esc(Q.back)}</button>`
      : "<span></span>";

  const el = fromHTML(`
    <section class="screen question-screen">
      ${journeyBarHTML()}
      <div class="q-label-row">
        ${back}
        <p class="label">${esc(labelText(state, q))}</p>
      </div>
      <div class="q-column">
        <h1 class="prompt" lang="de">${promptHTML(q.prompt)}</h1>
        ${q.hint ? `<p class="q-hint small muted">${esc(q.hint)}</p>` : ""}
        ${optionListHTML(q)}
      </div>
      ${confidenceBarHTML()}
    </section>
  `);

  const run = (cmd) => {
    if (!cmd) return false;
    if (cmd.type === "select") actions.selectOption(cmd.index);
    else if (cmd.type === "sure") actions.confirm("sure");
    else if (cmd.type === "guessed") actions.confirm("guessed");
    else if (cmd.type === "unknown") actions.skip();
    else if (cmd.type === "back") actions.back();
    return true;
  };

  // Shortcuts work from anywhere on the page, except with modifier keys
  // (so browser shortcuts like Ctrl+R still work) or on a held-down key.
  const onKey = (e) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    if (run(commandForKey(e.key, q))) e.preventDefault();
  };
  document.addEventListener("keydown", onKey);

  live.set(el, {
    offClick: onAction(el, {
      select: (btn) => run({ type: "select", index: Number(btn.dataset.index) }),
      sure: () => run({ type: "sure" }),
      guessed: () => run({ type: "guessed" }),
      unknown: () => run({ type: "unknown" }),
      back: () => run({ type: "back" }),
    }),
    offKey: () => document.removeEventListener("keydown", onKey),
    journey: mountJourney(el, state.order, state.index),
  });
  update(el, state);
  return el;
}

// Same question, new selection: update in place (main.js calls this).
export function update(el, state) {
  const q = state.order[state.index];
  updateOptionList(el, q, state.pendingChoice);
  updateConfidenceBar(el, state.pendingChoice !== null);
}

export function enter() {
  return Promise.resolve();
}

export function exit() {
  return Promise.resolve();
}

export function destroy(el) {
  const h = live.get(el);
  if (!h) return;
  h.offClick();
  h.offKey();
  h.journey.destroy();
  live.delete(el);
}
