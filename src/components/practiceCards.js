// "Practise these before you book" (DESIGN.md §9.6): one card per
// recommendation, in the order logic/recommend.js ranked them (max 3).
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";

const R = MESSAGES.results;
// LOGIC.md §6.1 step 3: the recommendation's reason → the chip text key.
const CHIP = { sureWrong: "sureWrong", guessedWrong: "wrong", unknown: "unknown", guessedRight: "guessed" };

export function practiceCardsHTML(result) {
  const recs = result.recommendations;
  const body = recs.length
    ? `<ol class="plain-list practice">${recs
        .map(
          (r, i) => `
        <li class="practice__card">
          <span class="practice__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
          <div class="practice__text">
            <h3 class="practice__topic">${esc(r.label)}</h3>
            <span class="chip chip--${esc(r.reason)}">${esc(R.reason[CHIP[r.reason]])}</span>
            <p class="practice__tip">${esc(r.tip)}</p>
          </div>
        </li>`,
        )
        .join("")}</ol>`
    : `<p class="body-lg">${esc(R.practiceNone)}</p>`;

  return `
    <section class="results-block" aria-labelledby="practice-title">
      <h2 id="practice-title" class="h2">${esc(R.practiceTitle)}</h2>
      ${body}
    </section>`;
}
