// Confidence dots reveal (DESIGN.md §9.11, below the fold), run by resultsReveal.js:
// all 15 dots first sit in one row in question order above the four columns
// (shown for 0.3 s), then Flip into their groups (0.8 s, power3.inOut, 35 ms
// stagger) while each group's count counts up.
//
// The Flip is built up front, inside the timeline (like the email in Phase 4b),
// so the whole reveal can be stopped, replayed or jumped to its end in one go.
import { gsap, Flip } from "./gsap.js";
import { countUp, showZero } from "./countUp.js";

const ROW_HOLD = 0.3, FLIP = 0.8, STAGGER = 0.035, FADE = 0.15;

export function hideDots(block) {
  gsap.set(block.querySelector(".dots"), { opacity: 0 });
  block.querySelectorAll(".dots__count").forEach((c) => showZero(c));
}

export function playDots(block, result) {
  const dotsEl = block.querySelector(".dots");
  const byId = new Map([...dotsEl.querySelectorAll(".dot")].map((d) => [d.dataset.id, d]));
  const inOrder = result.perQuestion.map((p) => byId.get(p.id)).filter(Boolean);
  const homes = [...dotsEl.querySelectorAll(".dots__row")].map((row) => [row, [...row.children]]);
  // A Flip cut short (Replay mid-reveal) leaves its offsets on the dots; measure
  // from their true places, or every offset would be counted twice.
  gsap.set(inOrder, { clearProps: "transform" });

  // 1. Measure the starting row: a temporary row in the gap above the columns
  //    (absolutely placed, so the columns never move).
  //    The block's height is held while the dots are out of their columns:
  //    otherwise it shrinks, the browser's scroll anchoring shifts the page to
  //    compensate, and the row is measured that far off (54px on a phone).
  dotsEl.style.minHeight = `${dotsEl.offsetHeight}px`;
  const stage = document.createElement("div");
  stage.className = "dots__stage";
  dotsEl.append(stage);
  stage.append(...inOrder);
  const row = Flip.getState(inOrder);
  // 2. Put every dot back in its group, and let Flip animate row → groups.
  homes.forEach(([el, kids]) => el.append(...kids));
  stage.remove();
  dotsEl.style.minHeight = "";
  const flip = Flip.from(row, { duration: FLIP, ease: "power3.inOut", stagger: STAGGER });

  const tl = gsap.timeline();
  tl.fromTo(dotsEl, { opacity: 0 }, { opacity: 1, duration: FADE, clearProps: "opacity" }, 0);
  tl.add(flip, ROW_HOLD);
  dotsEl.querySelectorAll(".dots__group").forEach((g) => {
    const count = g.querySelector(".dots__count");
    tl.add(countUp(count, g.querySelectorAll(".dot").length, { duration: FLIP }), ROW_HOLD);
  });
  return tl;
}
