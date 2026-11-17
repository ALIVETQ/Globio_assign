// Results screen (DESIGN.md §9, CONTENT.md §8). The blocks follow §9.1 exactly:
// verdict → skill bars → lucky-guess warning (if any) → confidence dots →
// practice cards → what this check can't see → review → method → actions.
//
// It reads ONLY state.result, config.js and messages.js (plus display text from
// data/). Nothing is recalculated here (ARCHITECTURE.md §4.3). Animation lives
// in motion/resultsMotion.js (verdict block, globe) and motion/resultsReveal.js
// (blocks below the fold).
import { MESSAGES } from "../data/messages.js";
import { CONFIG } from "../data/config.js";
import { SECTIONS } from "../data/sections.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";
import { resultValues, verdictText, summaryText } from "../logic/resultText.js";
import { themeToggleHTML } from "../components/themeToggle.js";
import { verdictStampHTML } from "../components/verdictStamp.js";
import { scoreMeterHTML } from "../components/scoreMeter.js";
import { skillBarsHTML } from "../components/skillBars.js";
import { confidenceDotsHTML, mountConfidenceDots } from "../components/confidenceDots.js";
import { practiceCardsHTML } from "../components/practiceCards.js";
import { examCoverageHTML } from "../components/examCoverage.js";
import { answerReviewHTML, methodHTML } from "../components/answerReview.js";
import { createToast } from "../components/toast.js";
import * as globe from "../motion/globe.js";
import { playVerdict } from "../motion/resultsMotion.js";
import { revealResults } from "../motion/resultsReveal.js";

const R = MESSAGES.results;
const A = MESSAGES.actions;
const live = new WeakMap();

const DICE = `<svg class="lucky__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`;

function verdictBlock(result, values) {
  const v = verdictText(result, values, MESSAGES);
  // "Ready" reaches Germany, so the caption says so instead of a percentage.
  const caption = result.verdict === "ready" ? R.journeyCaptionReady : fill(R.journeyCaption, values);
  return `
    <div class="verdict verdict--${esc(result.verdict)}">
      <div class="verdict__main">
        <p class="label verdict__label">${esc(R.label)}</p>
        ${verdictStampHTML(result.verdict, v.stamp)}
        <p class="verdict__reason">${esc(v.reason)}</p>
        <p class="verdict__next">${esc(v.next)}</p>
        ${scoreMeterHTML(result, values)}
      </div>
      <figure class="verdict__globe">
        <div class="results-globe" aria-hidden="true"></div>
        <figcaption class="label verdict__caption">${esc(caption)}</figcaption>
      </figure>
    </div>`;
}

function luckyWarning(result, values) {
  if (!result.luckyGuesses.warn) return "";
  return `<div class="lucky" role="note">${DICE}<p>${esc(fill(R.luckyWarning, values))}</p></div>`;
}

function actionsRow() {
  return `
    <div class="results-actions">
      <button type="button" class="btn btn--primary" data-action="retake">${esc(A.retake)}<span aria-hidden="true">→</span></button>
      <button type="button" class="btn btn--secondary" data-action="home">${esc(A.home)}</button>
      <button type="button" class="btn btn--link" data-action="copy">${esc(A.copy)}</button>
    </div>`;
}

export function render(state, actions) {
  const result = state.result;
  const values = resultValues(result, { config: CONFIG, sections: SECTIONS });
  const el = fromHTML(`
    <section class="screen results">
      <div class="row row--end results__top">${themeToggleHTML()}</div>
      ${verdictBlock(result, values)}
      ${skillBarsHTML(result, values)}
      ${luckyWarning(result, values)}
      ${confidenceDotsHTML(result)}
      ${practiceCardsHTML(result)}
      ${examCoverageHTML()}
      ${answerReviewHTML(result)}
      ${methodHTML(values)}
      ${actionsRow()}
    </section>
  `);

  const toast = createToast();
  const copy = async () => {
    const text = summaryText(result, values, MESSAGES, location.origin + location.pathname);
    try {
      await navigator.clipboard.writeText(text);
      toast.show(A.copied);
    } catch {
      toast.show(A.copyFailed); // e.g. no clipboard permission, or not a secure page
    }
  };

  live.set(el, {
    result,
    toast,
    offActions: onAction(el, {
      retake: () => actions.retake(),
      home: () => actions.goHome(),
      copy,
    }),
    offDots: mountConfidenceDots(el),
  });
  return el;
}

function stopMotion(h) {
  h.verdictTl?.kill();
  h.stopReveal?.();
  globe.setPulse(null);
}

// The globe needs the screen on the page to measure its box, so it is mounted here.
// Resolves at once: the learner can scroll and act while the entrance plays.
export function enter(el) {
  const h = live.get(el);
  stopMotion(h); // debug "Replay" calls enter() again on the same element
  // Final arc first: a "ready" verdict reaches Germany (DESIGN.md §3.6). Under
  // reduced motion that is all the globe shows; otherwise the entrance redraws it from 0.
  globe.setArcProgress(h.result.verdict === "ready" ? 1 : h.result.overall / 100);
  globe.mount(el.querySelector(".results-globe"), { mode: "results" });
  h.verdictTl = playVerdict(el, h.result);
  h.stopReveal = revealResults(el, h.result);
  return Promise.resolve();
}

export function exit() {
  return Promise.resolve();
}

export function destroy(el) {
  const h = live.get(el);
  if (!h) return;
  stopMotion(h);
  globe.unmount();
  h.offActions();
  h.offDots();
  h.toast.destroy();
  live.delete(el);
}
