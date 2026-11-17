// Confidence bar (DESIGN.md §7.3): "I'M SURE →" and "I GUESSED →", disabled until
// an option is chosen, and "I don't know this yet", always available.
// Keyboard hints (S / G / D) show on desktop only (CSS).
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";

const Q = MESSAGES.question;
const ARROW = `<span aria-hidden="true">→</span>`;

export function confidenceBarHTML() {
  return `
    <div class="confidence">
      <p class="label confidence__label">${esc(Q.confidenceLabel)}</p>
      <p id="confidence-help" class="sr-only">${esc(Q.disabledHelp)}</p>
      <div class="confidence__main">
        <div class="confidence__item">
          <button type="button" class="btn btn--primary" data-action="sure" data-needs-choice>${esc(Q.sure)}${ARROW}</button>
          <span class="keyhint" aria-hidden="true">${esc(Q.keyHints.sure)}</span>
        </div>
        <div class="confidence__item">
          <button type="button" class="btn btn--secondary" data-action="guessed" data-needs-choice>${esc(Q.guessed)}${ARROW}</button>
          <span class="keyhint" aria-hidden="true">${esc(Q.keyHints.guessed)}</span>
        </div>
      </div>
      <div class="confidence__item">
        <button type="button" class="btn btn--link confidence__unknown" data-action="unknown">${esc(Q.unknown)}</button>
        <span class="keyhint" aria-hidden="true">${esc(Q.keyHints.unknown)}</span>
      </div>
    </div>`;
}

// Main buttons are disabled until a choice exists; the reason is given as a
// tooltip and, for screen readers, through aria-describedby.
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
  return switchedOn;
}
