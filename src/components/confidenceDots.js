// Confidence dots (DESIGN.md §9.5): one dot per question, sorted into the four
// groups of result.groups. Hovering or focusing a dot shows "Q3 · Numbers 21–99".
//
// The tooltip is one shared element positioned by script, so it can be kept
// inside the screen on a 360px phone (a CSS-only tooltip would be cut off at
// the edges).
import { MESSAGES } from "../data/messages.js";
import { TOPICS } from "../data/topics.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const R = MESSAGES.results;
const GROUPS = ["sureRight", "guessedRight", "sureWrong", "notKnown"];
const EDGE = 8; // px the tooltip keeps from the screen edge

export function confidenceDotsHTML(result) {
  const byId = new Map(result.perQuestion.map((p) => [p.id, p]));
  const cols = GROUPS.map((g) => {
    const ids = result.groups[g];
    const dots = ids
      .map((id) => {
        const p = byId.get(id);
        const tip = fill(R.dotTooltip, { n: p.number, topicLabel: TOPICS[p.topic].label });
        return `<span class="dot dot--${g}" tabindex="0" role="img" aria-label="${esc(tip)}" data-tip="${esc(tip)}" data-id="${esc(id)}"></span>`;
      })
      .join("");
    return `
      <div class="dots__group">
        <p class="label dots__label"><span>${esc(R.dots[g])}</span> <span class="dots__count" data-count>${ids.length}</span></p>
        <div class="dots__row">${dots}</div>
      </div>`;
  }).join("");

  return `
    <section class="results-block" aria-labelledby="dots-title">
      <h2 id="dots-title" class="h2">${esc(R.dotsTitle)}</h2>
      <p class="muted results-block__intro">${esc(R.dotsSubtitle)}</p>
      <div class="dots">${cols}</div>
      <div class="dot-tip" role="tooltip" hidden></div>
    </section>`;
}

// Wires the tooltip. Returns a cleanup function for destroy().
export function mountConfidenceDots(root) {
  const tip = root.querySelector(".dot-tip");
  if (!tip) return () => {};
  const show = (dot) => {
    tip.textContent = dot.dataset.tip;
    tip.hidden = false;
    const d = dot.getBoundingClientRect();
    const w = tip.offsetWidth;
    const left = Math.min(Math.max(EDGE, d.left + d.width / 2 - w / 2), window.innerWidth - EDGE - w);
    // position: fixed, so viewport coordinates work directly.
    tip.style.left = `${left}px`;
    tip.style.top = `${d.top - tip.offsetHeight - 8}px`;
  };
  const hide = () => (tip.hidden = true);
  const over = (e) => {
    const dot = e.target.closest?.(".dot");
    if (dot) show(dot);
  };
  const out = (e) => {
    if (e.target.closest?.(".dot")) hide();
  };
  root.addEventListener("pointerover", over);
  root.addEventListener("pointerout", out);
  root.addEventListener("focusin", over);
  root.addEventListener("focusout", out);
  window.addEventListener("scroll", hide, { passive: true });
  return () => {
    root.removeEventListener("pointerover", over);
    root.removeEventListener("pointerout", out);
    root.removeEventListener("focusin", over);
    root.removeEventListener("focusout", out);
    window.removeEventListener("scroll", hide);
  };
}
