// The passage beside (desktop) or above (phone) a reading question
// (DESIGN.md §7.5): the format label, then the object itself.
// r3's ads are not a side passage: they are the options (see passageAds.js).
import { MESSAGES } from "../data/messages.js";
import { PASSAGES } from "../data/questions.js";
import { esc } from "../dom.js";
import { passageEmailHTML } from "./passageEmail.js";
import { passageSignHTML } from "./passageSign.js";
import { passageBoardHTML } from "./passageBoard.js";

const RENDER = { email: passageEmailHTML, sign: passageSignHTML, board: passageBoardHTML };

// True if this question shows a passage column (r1, r2, r4, r5).
export function hasSidePassage(question) {
  const p = question.passage && PASSAGES[question.passage];
  return Boolean(p && RENDER[p.type]);
}

export function passageHTML(question) {
  const p = PASSAGES[question.passage];
  return `
    <section class="passage passage--${esc(p.type)}" aria-label="${esc(MESSAGES.reading.passageAria[p.type])}" data-passage="${esc(question.passage)}">
      <div class="passage__scroll">
        <p class="label passage__format">${esc(p.formatLabel)}</p>
        ${RENDER[p.type](p)}
      </div>
    </section>`;
}

// The format label shown above r3's ad cards (its "passage" is the options).
export function formatLabelHTML(question) {
  const p = question.passage && PASSAGES[question.passage];
  return p ? `<p class="label passage__format">${esc(p.formatLabel)}</p>` : "";
}

// Phones: the passage box is capped at 45% of the screen and scrolls inside.
// The soft bottom fade shows only while there is more to read below.
// `keepScroll` carries the scroll position from r1 to r2 (same email).
export function mountPassageScroll(root, keepScroll = 0) {
  const box = root.querySelector(".passage__scroll");
  if (!box) return () => {};
  const update = () => {
    const more = box.scrollHeight - box.clientHeight - box.scrollTop > 2;
    box.classList.toggle("has-more", more);
  };
  box.scrollTop = keepScroll;
  box.addEventListener("scroll", update, { passive: true });
  const ro = new ResizeObserver(() => {
    if (keepScroll && box.scrollTop === 0) box.scrollTop = keepScroll; // first layout
    update();
  });
  ro.observe(box);
  return () => {
    box.removeEventListener("scroll", update);
    ro.disconnect();
  };
}
