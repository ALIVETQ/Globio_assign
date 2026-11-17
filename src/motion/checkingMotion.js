// Checking readout (DESIGN.md §8.2). Lines start 300 ms apart; in each line the
// label scrambles in (0.35 s), the dotted leader grows left → right (0.3 s) and
// the percentage counts up (0.4 s). After the third line: hold 0.4 s, then on.
//
// The three parts of a line overlap (leader from +0.15 s, count from +0.2 s), so
// one line takes 0.6 s and the whole screen lasts 0.6 + 0.6 + 0.4 = 1.6 s,
// which is the time §8 gives the screen.
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { countUp, showZero } from "./countUp.js";

const LINE_STEP = 0.3;
const SCRAMBLE = 0.35;
const LEADER_AT = 0.15, LEADER = 0.3;
const COUNT_AT = 0.2, COUNT = 0.4;
const HOLD = 0.4;
const REDUCED_WAIT = 0.8; // §8.2: final text shown, auto-advance after 0.8 s

const parts = (line) => ({
  label: line.querySelector(".readout__label"),
  leader: line.querySelector(".readout__leader"),
  value: line.querySelector(".readout__value"),
});

// Start states: nothing of a line shows before its turn. Called at render too,
// because the screen is already visible while the horizon glow fades away,
// before enter() starts the readout (main.js).
export function prepareReadout(root) {
  if (reducedMotion) return;
  for (const line of root.querySelectorAll(".readout__line")) {
    const { label, leader, value } = parts(line);
    // Kept on the element, so a replay mid-scramble never captures half a word.
    label.dataset.text ??= label.textContent;
    gsap.set(line, { opacity: 0 });
    gsap.set(leader, { scaleX: 0, transformOrigin: "left center" });
    label.textContent = "";
    showZero(value, { suffix: "%" });
  }
}

// Plays the readout and calls onDone at the end. Returns the timeline (or the
// delayed call under reduced motion) so destroy() can kill it.
export function playReadout(root, onDone) {
  if (reducedMotion) return gsap.delayedCall(REDUCED_WAIT, onDone);
  prepareReadout(root);
  const tl = gsap.timeline();
  const lines = [...root.querySelectorAll(".readout__line")];
  lines.forEach((line, i) => {
    const { label, leader, value } = parts(line);
    const t = i * LINE_STEP;
    tl.set(line, { opacity: 1 }, t);
    tl.to(label, { duration: SCRAMBLE, scrambleText: { text: label.dataset.text, chars: "upperCase", speed: 0.6 } }, t);
    tl.to(leader, { scaleX: 1, duration: LEADER, ease: "power2.out" }, t + LEADER_AT);
    tl.add(countUp(value, Number(value.dataset.score), { suffix: "%", duration: COUNT }), t + COUNT_AT);
  });
  const end = (lines.length - 1) * LINE_STEP + COUNT_AT + COUNT + HOLD; // 1.6 s with 3 lines
  tl.call(onDone, null, end);
  return tl;
}
