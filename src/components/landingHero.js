// Landing hero (DESIGN.md §5.1–5.2): top bar, resume banner, overline,
// headline, lede, buttons, meta line, and an empty slot for the globe.
// Returns an HTML string; landing.js owns the listeners.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const T = MESSAGES.landing;
const B = MESSAGES.brand;

// "EXAM·READY": the "·" is drawn as a small cobalt dot (DESIGN.md §5.1). The full
// text stays in aria-label so screen readers still read the brand name.
function wordmark() {
  const [left, right] = B.wordmark.split("·");
  return `<span class="wordmark" role="img" aria-label="${esc(B.wordmark)}">${esc(left)}<span class="wordmark__dot" aria-hidden="true"></span>${esc(right)}</span>`;
}

function topBar() {
  return `
    <header class="topbar">
      <div class="topbar__brand">
        ${wordmark()}
        <span class="label pill-tag">${esc(B.tag)}</span>
      </div>
      <a class="btn btn--link" href="#how-it-works" data-action="how">${esc(T.navHowItWorks)}<span aria-hidden="true"> ↓</span></a>
    </header>`;
}

function resumeBanner(resume) {
  if (!resume) return "";
  return `
    <div class="resume-bar" role="status">
      <p class="small">${esc(fill(T.resumeText, resume))}</p>
      <div class="resume-bar__actions">
        <button class="btn btn--link" data-action="resume">${esc(T.resumeYes)}</button>
        <button class="btn btn--link" data-action="startOver">${esc(T.resumeNo)}</button>
      </div>
    </div>`;
}

// Numbers are separate spans so Phase 1b can count them up (DESIGN.md §5.3).
export function metaLine() {
  const items = T.meta.map((m) => {
    const num = m.value === undefined ? "" : `${esc(m.prefix ?? "")}<span class="meta__num" data-value="${m.value}">${m.value}</span> `;
    return `<span class="meta__item">${num}${esc(m.text)}</span>`;
  });
  return `<p class="label meta">${items.join('<span class="meta__sep" aria-hidden="true">·</span>')}</p>`;
}

export function startButton() {
  return `<button class="btn btn--primary" data-action="start">${esc(T.ctaStart)}<span aria-hidden="true">→</span></button>`;
}

export function heroHTML(resume) {
  // Each headline line is its own block span: the glitch reveal (§4.1) animates per line.
  const lines = T.headline.map((l) => `<span class="hero__line">${esc(l)}</span>`).join("");
  return `
    <div class="landing-hero">
      ${topBar()}
      <div class="hero__body">
        <div class="hero__copy">
          ${resumeBanner(resume)}
          <p class="overline">${esc(T.overline)}</p>
          <h1 class="hero hero__headline">${lines}</h1>
          <p class="body-lg muted hero__lede">${esc(T.lede)}</p>
          <div class="hero__ctas">
            ${startButton()}
            <button class="btn btn--secondary" data-action="how">${esc(T.ctaHow)}</button>
          </div>
          ${metaLine()}
        </div>
        <!-- Space reserved for the canvas globe (DESIGN.md §3.5); filled in Phase 1b. -->
        <div class="globe-slot" aria-hidden="true"></div>
      </div>
    </div>`;
}
