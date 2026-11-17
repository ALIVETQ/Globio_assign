// Confidence bar (DESIGN.md §7.3): on a solid panel, "I'M SURE" and "I GUESSED"
// (each with an icon, a sub-line with its points, and a key chip), disabled
// until an option is chosen, and the ghost button "I don't know this yet".
// Key chips show on desktop only (CSS). Styles: styles/confidence.css.
import { MESSAGES } from "../data/messages.js";
import { CONFIG } from "../data/config.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const Q = MESSAGES.question;
// Points as the learner reads them: 0.5 is "½".
const points = (n) => (n === 0.5 ? "½" : String(n));

function main(kind, icon, label, sub, key) {
  return `
    <button type="button" class="conf conf--${kind}" data-action="${kind}" data-needs-choice>
      <span class="conf__icon" aria-hidden="true">${icon}</span>
      <span class="conf__text"><span class="conf__label">${esc(label)}</span><span class="conf__sub">${esc(sub)}</span></span>
      <span class="conf__key" aria-hidden="true">${esc(key)}</span>
    </button>`;
}

export function confidenceBarHTML() {
  const sure = fill(Q.sureSub, { creditSure: points(CONFIG.credit.correctSure) });
  const guessed = fill(Q.guessedSub, { creditGuessed: points(CONFIG.credit.correctGuessed) });
  return `
    <div class="confidence">
      <div class="confidence__panel">
        <p class="confidence__label" aria-hidden="true">${esc(Q.confidenceLabel)}</p>
        <p id="confidence-help" class="sr-only">${esc(Q.disabledHelp)}</p>
        <div class="confidence__main">
          ${main("sure", "✓", Q.sure, sure, Q.keyHints.sure)}
          ${main("guessed", "?", Q.guessed, guessed, Q.keyHints.guessed)}
        </div>
        <button type="button" class="conf-unknown" data-action="unknown">
          <span class="conf__icon" aria-hidden="true">○</span>${esc(Q.unknown)}<span class="conf__key" aria-hidden="true">${esc(Q.keyHints.unknown)}</span>
        </button>
      </div>
    </div>`;
}

// Main buttons are disabled until a choice exists; the reason is shown as the
// line above them ("Choose an answer first" instead of "HOW SURE ARE YOU?"),
// as a tooltip, and for screen readers through aria-describedby.
// Returns true when the buttons have just switched on (for the enable pulse).
export function updateConfidenceBar(root, hasChoice) {
  const buttons = root.querySelectorAll("[data-needs-choice]");
  const switchedOn = hasChoice && buttons[0]?.disabled;
  buttons.forEach((btn) => {
    btn.disabled = !hasChoice;
    if (hasChoice) {
      btn.removeAttribute("aria-describedby");
      btn.removeAttribute("title");
    } else {
      btn.setAttribute("aria-describedby", "confidence-help");
      btn.setAttribute("title", Q.disabledHelp);
    }
  });
  const label = root.querySelector(".confidence__label");
  if (label) label.textContent = hasChoice ? Q.confidenceLabel : Q.disabledHelp;
  return switchedOn;
}
