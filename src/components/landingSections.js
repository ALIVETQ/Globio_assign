// Landing sections below the hero (DESIGN.md §5.1 items 1–6): why check first,
// how it works, sample result, coverage note, second CTA, footer.
// Returns an HTML string; landing.js owns the listeners.
import { MESSAGES } from "../data/messages.js";
import { CONFIG } from "../data/config.js";
import { esc } from "../dom.js";
import { startButton } from "./landingHero.js";

const T = MESSAGES.landing;

function why() {
  return `
    <section class="landing-section why" aria-labelledby="why-title">
      <h2 id="why-title" class="label">${esc(T.whyTitle)}</h2>
      <p class="body-lg">${esc(T.whyBody)}</p>
    </section>`;
}

// Card 2's mini preview shows what the confidence buttons look like. It is a
// picture, not a control, so it is hidden from screen readers and can't be clicked.
function miniConfidence(step) {
  if (!step.previewSure) return "";
  return `
    <div class="mini-confidence" aria-hidden="true">
      <span class="btn btn--primary">${esc(step.previewSure)}</span>
      <span class="btn btn--secondary">${esc(step.previewGuessed)}</span>
    </div>`;
}

function how() {
  const cards = T.howSteps
    .map(
      (s) => `
      <li class="card how-card">
        <span class="how-card__number">${esc(s.number)}</span>
        <h3 class="how-card__title">${esc(s.title)}</h3>
        <p class="small muted">${esc(s.body)}</p>
        ${miniConfidence(s)}
      </li>`,
    )
    .join("");
  return `
    <section id="how-it-works" class="landing-section how" aria-labelledby="how-title">
      <h2 id="how-title" class="h2">${esc(T.howTitle)}</h2>
      <ol class="plain-list how__cards">${cards}</ol>
    </section>`;
}

// Fixed example values from CONTENT.md. Bars use the real skill line from
// config.js, so the sample colours match what a real result would show.
function miniResult() {
  const S = T.sample;
  const line = CONFIG.verdict.ready.minEverySkill;
  const bars = S.skills
    .map(
      (sk) => `
      <li class="mini-skill">
        <span class="mini-skill__name small">${esc(sk.name)}</span>
        <span class="mini-skill__track"><span class="mini-skill__fill${sk.score < line ? " is-low" : ""}" style="transform: scaleX(${sk.score / 100})"></span></span>
        <span class="mini-skill__score label">${sk.score}</span>
      </li>`,
    )
    .join("");
  return `
    <div class="mini-result">
      <span class="mini-stamp mini-stamp--${esc(S.verdict)}">${esc(S.stamp)}</span>
      <ul class="plain-list mini-skills">${bars}</ul>
      <p class="small mini-result__practice">${esc(S.practiceLine)}</p>
    </div>`;
}

function sample() {
  return `
    <section class="landing-section" aria-labelledby="sample-title">
      <div class="card sample">
        <div class="sample__text">
          <span class="label pill-tag">${esc(T.sampleTag)}</span>
          <h2 id="sample-title" class="h2">${esc(T.sampleTitle)}</h2>
          <p class="muted">${esc(T.sampleBody)}</p>
        </div>
        ${miniResult()}
      </div>
    </section>`;
}

const INFO_ICON = `<svg class="coverage-note__icon" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4.5M8 4.6v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

function coverage() {
  return `
    <section class="landing-section">
      <p class="small muted coverage-note">${INFO_ICON}<span>${esc(T.coverageNote)}</span></p>
      <div class="second-cta">${startButton()}</div>
    </section>`;
}

export function sectionsHTML() {
  return `
    <div class="landing-below">
      ${why()}
      ${how()}
      ${sample()}
      ${coverage()}
    </div>
    <footer class="landing-footer label">${esc(T.footer)}</footer>`;
}
