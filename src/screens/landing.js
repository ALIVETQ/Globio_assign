// Landing screen — PHASE 0 PLACEHOLDER: heading, Start button and the resume
// banner, so the flow can be clicked through. The real layout comes in Phase 1.
import { MESSAGES } from "../data/messages.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";

const T = MESSAGES.landing;
const cleanups = new WeakMap();

export function render(state, actions) {
  const resume = actions.getResumeInfo();
  const banner = resume
    ? `<div class="resume card" role="status">
         <p>${esc(fill(T.resumeText, resume))}</p>
         <div class="row">
           <button class="btn btn--primary" data-action="resume">${esc(T.resumeYes)}<span aria-hidden="true">→</span></button>
           <button class="btn btn--secondary" data-action="startOver">${esc(T.resumeNo)}</button>
         </div>
       </div>`
    : "";

  const el = fromHTML(`
    <section class="screen placeholder">
      ${banner}
      <p class="overline">${esc(T.overline)}</p>
      <h1 class="hero">${T.headline.map(esc).join("<br>")}</h1>
      <p class="body-lg muted">${esc(T.lede)}</p>
      <div class="row">
        <button class="btn btn--primary" data-action="start">${esc(T.ctaStart)}<span aria-hidden="true">→</span></button>
      </div>
    </section>
  `);

  cleanups.set(
    el,
    onAction(el, {
      start: () => actions.start(),
      resume: () => actions.resume(),
      startOver: () => actions.startOver(),
    }),
  );
  return el;
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
