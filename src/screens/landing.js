// Landing screen (DESIGN.md §5). Layout from components/, motion from
// motion/landingMotion.js and the globe singleton from motion/globe.js.
import { fromHTML, onAction } from "../dom.js";
import { reducedMotion } from "../motion/prefs.js";
import * as globe from "../motion/globe.js";
import { playEntrance, revealBelowFold, playExit } from "../motion/landingMotion.js";
import { heroHTML } from "../components/landingHero.js";
import { sectionsHTML } from "../components/landingSections.js";

// Per-element handles so destroy() can stop everything this screen started (§10 rule 4).
const live = new WeakMap();

// "How it works" (nav link and hero button) scrolls to the section, then moves
// keyboard focus to its heading so Tab continues from there.
function scrollToHow(root) {
  const section = root.querySelector("#how-it-works");
  if (!section) return;
  section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  const heading = section.querySelector("h2");
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

function stopMotion(el) {
  const h = live.get(el);
  if (!h) return;
  h.entrance?.stop();
  h.entrance?.tl?.kill();
  h.stopReveal?.();
  h.exitTl?.kill();
}

export function render(state, actions) {
  const el = fromHTML(`
    <div class="screen landing">
      ${heroHTML(actions.getResumeInfo())}
      ${sectionsHTML()}
    </div>
  `);

  const offActions = onAction(el, {
    start: () => actions.start(),
    resume: () => actions.resume(),
    startOver: () => actions.startOver(),
    how: (_target, e) => {
      e.preventDefault(); // the nav link is a real anchor (works without JS); JS adds smooth scroll
      scrollToHow(el);
    },
  });
  live.set(el, { offActions, actions });
  return el;
}

// Same screen, new state: only "Start over" changes the landing (the banner goes).
// Updating in place keeps the globe and the entrance running instead of restarting them.
export function update(el) {
  if (!live.get(el)?.actions.getResumeInfo()) el.querySelector(".resume-bar")?.remove();
}

// Resolves at once: the entrance keeps playing, but the learner can already
// press Start (main.js blocks input until enter() resolves).
export function enter(el) {
  stopMotion(el); // debug "Replay" calls enter() again on the same element
  const h = live.get(el);
  globe.mount(el.querySelector(".globe-slot"), { mode: "landing" });
  h.entrance = playEntrance(el);
  h.stopReveal = revealBelowFold(el);
  return Promise.resolve();
}

export function exit(el) {
  const h = live.get(el);
  // Finish the entrance first so the glitch-out starts from the full headline.
  h?.entrance?.stop();
  h?.entrance?.tl?.progress(1);
  // Resolves halfway through the glitch-out so the glow can start (§5.4);
  // the timeline is kept so destroy() can stop whatever is left of it.
  const { tl, ready } = playExit(el);
  if (h) h.exitTl = tl;
  return ready;
}

// Called under the glow (§5.4 step 4: the globe stops once it is covered).
export function destroy(el) {
  stopMotion(el);
  globe.unmount();
  live.get(el)?.offActions();
  live.delete(el);
}
