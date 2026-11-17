// Results blocks below the fold (DESIGN.md §9.11, second table). Each block
// animates once, when 15% of it scrolls into view. Phase 5b part 1: skill bars.
//
// Skill bars: rows fade up (y 12) 120 ms apart; each fill grows from 0 (0.9 s,
// power3.out) while its score counts up; the 60% dashed line draws top → bottom
// (0.4 s). A bar below the line then pulses red twice (0.6 s each).
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";
import { countUp, showZero } from "./countUp.js";

const ROW_STEP = 0.12, GROW = 0.9, LINE = 0.4, PULSE = 0.6;
const RED = "rgba(220,38,38,.25)"; // §9.11 exact value
const RED_OFF = "rgba(220,38,38,0)";

// On wide screens a row is `display: contents` (one shared grid), so its parts
// are animated, not the row itself.
const rowParts = (row) => row.querySelectorAll(".skill__name, .skill__bar, .skill__score");

function hideSkills(block) {
  const skills = block.querySelector(".skills");
  gsap.set(skills, { "--line-draw": 0 });
  gsap.set(block.querySelector(".skills__line-label"), { opacity: 0 });
  for (const row of block.querySelectorAll(".skill")) {
    gsap.set(rowParts(row), { opacity: 0 });
    gsap.set(row.querySelector(".skill__fill"), { scaleX: 0 });
    gsap.set(row.querySelector(".skill__bar"), { clearProps: "boxShadow" }); // a pulse cut short by Replay
    showZero(row.querySelector(".skill__value"), { suffix: "%" });
  }
}

function playSkills(block, result) {
  const tl = gsap.timeline();
  tl.to(block.querySelector(".skills"), { "--line-draw": 1, duration: LINE, ease: "power2.out" }, 0);
  tl.to(block.querySelector(".skills__line-label"), { opacity: 1, duration: LINE, clearProps: "opacity" }, 0);
  block.querySelectorAll(".skill").forEach((row, i) => {
    const t = i * ROW_STEP;
    const score = result.skills[row.dataset.skill].score;
    const bar = row.querySelector(".skill__bar");
    tl.fromTo(rowParts(row), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: "soft", clearProps: "opacity,transform" }, t);
    tl.to(row.querySelector(".skill__fill"), { scaleX: score / 100, duration: GROW, ease: "power3.out" }, t);
    tl.add(countUp(row.querySelector(".skill__value"), score, { suffix: "%", duration: GROW }), t);
    if (row.classList.contains("is-below")) {
      // A red glow swells to 6px and fades, twice, once the bar has finished.
      tl.fromTo(
        bar,
        { boxShadow: `0 0 0 0px ${RED}` },
        {
          keyframes: [
            { boxShadow: `0 0 0 6px ${RED}`, duration: PULSE / 2 },
            { boxShadow: `0 0 0 0px ${RED_OFF}`, duration: PULSE / 2 },
          ],
          repeat: 1,
          ease: "sine.inOut",
          immediateRender: false,
          clearProps: "boxShadow",
        },
        t + GROW,
      );
    }
  });
  return tl;
}

// Hides the blocks now and plays each one as it scrolls in. Returns a cleanup
// function for destroy(). Under reduced motion nothing is hidden or played.
export function revealResults(root, result) {
  if (reducedMotion) return () => {};
  const timelines = [];
  // block element → its animation. Part 2 of Phase 5b adds the lower blocks here.
  const skills = root.querySelector(".skills").closest(".results-block");
  const blocks = new Map([[skills, () => playSkills(skills, result)]]);
  hideSkills(skills);

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const tl = blocks.get(e.target)();
        // Switched to reduced motion while waiting: show the final state at once.
        if (reducedMotion) tl.progress(1);
        timelines.push(tl);
      }
    },
    { threshold: 0.15 },
  );
  blocks.forEach((_, el) => io.observe(el));
  return () => {
    io.disconnect();
    timelines.forEach((t) => t.kill());
  };
}
