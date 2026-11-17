// Section break (DESIGN.md §6): shown before each section, then moves on by
// itself. Phase 2a: static — the giant word sits centred and clipped (the
// reduced-motion look); the slide comes in 2b.
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";
import { gsap } from "../motion/gsap.js";
import { reducedMotion } from "../motion/prefs.js";
import { journeyBarHTML, mountJourney } from "../components/journeyBar.js";

// Auto-advance (§6.2): 1.8 s, the length of the giant-word slide; 1.2 s under
// reduced motion. A GSAP delayedCall (not setTimeout) so ?slow= stretches it too.
const ADVANCE_S = 1.8;
const ADVANCE_REDUCED_S = 1.2;

const live = new WeakMap();

export function render(state, actions) {
  const s = SECTIONS.find((x) => x.id === state.order[state.index].section);
  const el = fromHTML(`
    <section class="screen section-break">
      ${journeyBarHTML()}
      <div class="sb-stage">
        <div class="sb-giant giant" aria-hidden="true" lang="de">${esc(s.de)}</div>
        <div class="sb-copy">
          <p class="label sb-counter">${esc(fill(MESSAGES.sectionBreak.counter, { number: s.number }))}</p>
          <h1 class="display">${esc(s.en)}</h1>
          <p class="sb-blurb muted">${esc(s.blurb)}</p>
        </div>
      </div>
      <button type="button" class="btn btn--link sb-skip" data-action="next">${esc(MESSAGES.sectionBreak.skip)}</button>
    </section>
  `);

  const next = () => actions.next();
  // Enter / Space skip from anywhere on this screen (focus starts on the heading).
  const onKey = (e) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      next();
    }
  };
  document.addEventListener("keydown", onKey);

  live.set(el, {
    actions,
    offClick: onAction(el, { next }),
    offKey: () => document.removeEventListener("keydown", onKey),
    journey: mountJourney(el, state.order, state.index),
  });
  return el;
}

// The timer starts after the screen is in place, so it can't fire mid-transition.
export function enter(el) {
  const h = live.get(el);
  h.timer?.kill(); // debug "Replay" calls enter() again
  h.timer = gsap.delayedCall(reducedMotion ? ADVANCE_REDUCED_S : ADVANCE_S, () => h.actions.next());
  return Promise.resolve();
}

export function exit() {
  return Promise.resolve();
}

export function destroy(el) {
  const h = live.get(el);
  if (!h) return;
  h.timer?.kill();
  h.offClick();
  h.offKey();
  h.journey.destroy();
  live.delete(el);
}
