// Answer options (DESIGN.md §7.2), a radiogroup of real buttons.
//
// Display position i shows options[optionOrder[i]] (LOGIC.md §9). The buttons
// carry the DISPLAY position; state.js turns it into the original index, so
// nothing here ever stores or scores a display position.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";
import { adsOptionsHTML } from "./passageAds.js";

const Q = MESSAGES.question;

// Keycap per display position. 1–4 normally; Richtig/Falsch shows R/F and the
// ads question a/b, because that's what those keys do (§7.2).
export function keycapFor(question, displayIndex) {
  if (question.format === "trueFalse") return displayIndex === 0 ? Q.trueFalse.keyTrue : Q.trueFalse.keyFalse;
  if (question.format === "ads") return question.options[question.optionOrder[displayIndex]];
  return String(displayIndex + 1);
}

// Layouts by format (§7.2): a vertical list; Richtig/Falsch side by side;
// for the ads question the two ad cards are the options.
export function optionListHTML(question) {
  if (question.format === "ads") {
    return `<div class="options options--ads" role="radiogroup" aria-label="${esc(Q.optionsAria)}">${adsOptionsHTML(question)}</div>`;
  }
  const items = question.optionOrder
    .map(
      (orig, i) => `
      <button type="button" class="option" role="radio" aria-checked="false" data-action="select" data-index="${i}" lang="de">
        <span class="keycap" aria-hidden="true">${esc(keycapFor(question, i))}</span>
        <span class="option__text">${esc(question.options[orig])}</span>
        <svg class="option__stroke" aria-hidden="true"><rect x="1" y="1" rx="13" ry="13"/></svg>
      </button>`,
    )
    .join("");
  return `<div class="options options--${esc(question.format)}" role="radiogroup" aria-label="${esc(Q.optionsAria)}">${items}</div>`;
}

// Mark the option whose ORIGINAL index is `pendingChoice` as selected.
// `onChange(btn, selected)` is called for each option whose state changed
// (the screen uses it to draw or reverse the cobalt stroke).
export function updateOptionList(root, question, pendingChoice, onChange = () => {}) {
  root.querySelectorAll(".option").forEach((btn) => {
    const selected = question.optionOrder[Number(btn.dataset.index)] === pendingChoice;
    const was = btn.classList.contains("is-selected");
    btn.setAttribute("aria-checked", String(selected));
    btn.classList.toggle("is-selected", selected);
    if (was !== selected) onChange(btn, selected);
  });
}
