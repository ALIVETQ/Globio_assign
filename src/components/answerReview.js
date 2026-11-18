// The two collapsed sections at the bottom of the results page:
// "Review your answers" (DESIGN.md §9.8) and "How we calculate ready" (§9.9).
//
// The review reads result.perQuestion (already in the original question order)
// and looks up only the display text — prompt, option texts, explanation — in
// questions.js. Correctness comes from the result object, never recomputed.
import { MESSAGES } from "../data/messages.js";
import { QUESTIONS } from "../data/questions.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";
import { formatPoints } from "../logic/points.js";

const RV = MESSAGES.review;
const M = MESSAGES.method;
const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

const CHEVRON = `<svg class="fold__chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function row(p) {
  const q = byId.get(p.id);
  const yours = p.choice === null ? RV.noAnswer : q.options[p.choice];
  const mark = p.correct ? "✓" : "✗";
  return `
    <li class="review__row${p.correct ? " is-correct" : " is-wrong"}">
      <span class="review__num label">Q${p.number}</span>
      <div class="review__main">
        <p class="review__prompt" lang="de">${esc(q.prompt)}</p>
        <dl class="review__answers">
          <div><dt class="label">${esc(RV.yourAnswer)}</dt><dd lang="de">${esc(yours)}</dd></div>
          <div><dt class="label">${esc(RV.correctAnswer)}</dt><dd lang="de">${esc(q.options[p.answer])}</dd></div>
        </dl>
        <p class="review__explain">${esc(q.explain)}</p>
      </div>
      <div class="review__status">
        <span class="chip chip--conf">${esc(RV.chip[p.confidence])}</span>
        <span class="review__mark" aria-hidden="true">${mark}</span>
        ${p.credit < 0 ? `<span class="review__cost">${esc(formatPoints(p.credit))}</span>` : ""}
        <span class="sr-only">${esc(p.correct ? RV.srCorrect : RV.srWrong)}</span>
      </div>
    </li>`;
}

export function answerReviewHTML(result) {
  return `
    <details class="fold results-block">
      <summary class="fold__summary">
        <span class="fold__title">
          <span class="h2">${esc(RV.title)}</span>
          <span class="label">${esc(fill(RV.count, { total: result.perQuestion.length }))}</span>
        </span>
        ${CHEVRON}
      </summary>
      <ol class="plain-list review">${result.perQuestion.map(row).join("")}</ol>
    </details>`;
}

// Every number in the method text comes from config.js via `values`.
export function methodHTML(values) {
  return `
    <details class="fold results-block">
      <summary class="fold__summary">
        <span class="fold__title"><span class="h2">${esc(M.title)}</span></span>
        ${CHEVRON}
      </summary>
      <div class="method">${M.paragraphs.map((t) => `<p>${esc(fill(t, values))}</p>`).join("")}</div>
    </details>`;
}
