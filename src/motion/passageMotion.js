// Passage entrances (DESIGN.md §7.6). Each finishes within 1.2 s; after that
// nothing on the passage moves. Under reduced motion they don't run at all and
// the passage is simply in its final state.
import { gsap, Flip } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { fadeUp } from "./fadeUp.js";
import { playSplitFlap } from "./splitFlap.js";

// Email: a notification pill slides down from y −40 (0.4 s, back.out(1.4)),
// holds 0.15 s, then expands into the full card (Flip, 0.45 s, power3.inOut).
// Total 1.0 s.
function email(root) {
  const card = root.querySelector(".email");
  // Build the Flip up front, inside this timeline, so the whole entrance can be
  // stopped or jumped to its end in one go: record the pill, return to the full
  // layout, and let Flip.from animate pill → full.
  card.classList.add("is-pill");
  const pill = Flip.getState(card, { props: "borderRadius,padding" });
  card.classList.remove("is-pill");
  const expand = Flip.from(pill, {
    duration: 0.45,
    ease: "power3.inOut",
    scale: false, // grow the real height, so the text isn't stretched
  });
  card.classList.add("is-pill"); // looks like a notification until the expand starts

  const tl = gsap.timeline();
  tl.call(() => {
    card.classList.remove("is-pill");
    card.classList.add("is-expanding"); // content revealed top-down as it grows
  }, null, 0.55);
  tl.add(expand, 0.55);
  tl.fromTo(card, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)", clearProps: "opacity" }, 0);
  tl.call(() => {
    card.classList.remove("is-pill", "is-expanding");
    gsap.set(card, { clearProps: "width,height,padding,borderRadius,transform,opacity" });
  }, null, 1.0);
  return tl;
}

// Ads: the two cards fade up (y 16) 120 ms apart and land like pinned notes,
// rotation −1.2° / +1.2° → 0 (0.5 s, back.out(1.6)). Last one done at 0.82 s.
function ads(root) {
  const tl = gsap.timeline();
  root.querySelectorAll(".option--ad").forEach((card, i) => {
    tl.add(fadeUp(card, { y: 16 }), i * 0.12);
    // No clearProps here: the fade-up (0.7 s) is still moving y; it clears the transform when done.
    tl.fromTo(card, { rotation: i % 2 ? 1.2 : -1.2 }, { rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, i * 0.12);
  });
  return tl;
}

// Door sign: the hanger line draws down (0.2 s), then the plaque swings in from
// −14° around its top edge with an elastic settle (1.0 s). Total 1.2 s.
function sign(root) {
  const hanger = root.querySelector(".sign__hanger");
  const plaque = root.querySelector(".sign");
  const tl = gsap.timeline();
  tl.fromTo(hanger, { scaleY: 0 }, { scaleY: 1, duration: 0.2, ease: "power1.out", transformOrigin: "50% 0%", clearProps: "transform" }, 0);
  tl.fromTo(plaque, { rotation: -14, opacity: 0 }, { rotation: 0, duration: 1.0, ease: "elastic.out(1, 0.45)", transformOrigin: "50% 0%", clearProps: "transform" }, 0.2);
  tl.to(plaque, { opacity: 1, duration: 0.12, clearProps: "opacity" }, 0.2);
  return tl;
}

function board(root) {
  return playSplitFlap(root.querySelector(".board"));
}

const BY_TYPE = { email, ads, sign, board };

// type: "email" | "ads" | "sign" | "board". Returns the timeline or null.
export function playPassage(root, type) {
  if (reducedMotion || !BY_TYPE[type]) return null;
  return BY_TYPE[type](root);
}
