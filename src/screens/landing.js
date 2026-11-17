// Landing screen (DESIGN.md §5). Phase 1a: layout and content, no motion.
// The hero and the sections below it are built by components; this file wires
// up the buttons and owns the screen contract (render / enter / exit / destroy).
import { fromHTML, onAction } from "../dom.js";
import { reducedMotion } from "../motion/prefs.js";
import { heroHTML } from "../components/landingHero.js";
import { sectionsHTML } from "../components/landingSections.js";

const cleanups = new WeakMap();

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

export function render(state, actions) {
  const el = fromHTML(`
    <div class="screen landing">
      ${heroHTML(actions.getResumeInfo())}
      ${sectionsHTML()}
    </div>
  `);

  cleanups.set(
    el,
    onAction(el, {
      start: () => actions.start(),
      resume: () => actions.resume(),
      startOver: () => actions.startOver(),
      how: (_target, e) => {
        e.preventDefault(); // the nav link is a real anchor (works without JS); JS adds smooth scroll
        scrollToHow(el);
      },
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
