// Glitch reveal and glitch-out for headlines (DESIGN.md §4.1, §4.2).
// Each headline line is its own block span; both effects work per line.
//
// The spec gives x and shadows in em. GSAP moves `x` in px, so em values are
// converted from each line's own font size (the headline is fluid, clamp()).
// clip-path and text-shadow always use the same number of parts in every
// keyframe so GSAP can interpolate them; "none" is written as transparent.
import { gsap } from "./gsap.js";

const em = (el) => parseFloat(getComputedStyle(el).fontSize) || 16;

const CLIP_HIDDEN = "inset(0% 100% 0% 0%)";
const CLIP_PART = "inset(0% 38% 0% 0%)";
const CLIP_FULL = "inset(0% 0% 0% 0%)";
const NO_SHADOW = "0em 0em 0em rgba(47,99,255,0), 0em 0em 0em rgba(17,17,17,0)";

// The 0% keyframe of §4.1, applied immediately so lines are hidden until their turn.
export function hideForGlitch(lines) {
  for (const line of lines) {
    gsap.set(line, {
      opacity: 0,
      clipPath: CLIP_HIDDEN,
      x: -0.05 * em(line),
      textShadow: "-0.12em 0em 0em rgba(47,99,255,0.8), 0.07em 0em 0em rgba(17,17,17,0.25)",
    });
  }
}

// One line, 0.9 s, steps(14) over the whole keyframe set (choppy on purpose).
export function glitchIn(line, { delay = 0 } = {}) {
  const e = em(line);
  return gsap.to(line, {
    delay,
    duration: 0.9,
    ease: "steps(14)",
    keyframes: {
      "30%": { opacity: 1, clipPath: CLIP_PART, x: 0.035 * e, textShadow: "0.09em 0em 0em rgba(47,99,255,0.65), -0.05em 0em 0em rgba(17,17,17,0.3)" },
      "55%": { opacity: 0.8, clipPath: CLIP_FULL, x: -0.018 * e, textShadow: "-0.045em 0em 0em rgba(47,99,255,0.55), 0.025em 0em 0em rgba(17,17,17,0.2)" },
      "78%": { opacity: 1, clipPath: CLIP_FULL, x: 0.008 * e, textShadow: "0.015em 0em 0em rgba(47,99,255,0.35), 0em 0em 0em rgba(17,17,17,0)" },
      "100%": { opacity: 1, clipPath: CLIP_FULL, x: 0, textShadow: NO_SHADOW },
      easeEach: "none",
    },
    clearProps: "clipPath,textShadow,transform",
  });
}

// Reveal every line of a headline, 130 ms apart.
export function glitchInLines(lines, { delay = 0 } = {}) {
  const tl = gsap.timeline({ delay });
  lines.forEach((line, i) => tl.add(glitchIn(line), i * 0.13));
  return tl;
}

// §4.2: 0.45 s, steps(8). Lines jitter ±0.06em (alternating sign), gain a cobalt
// ghost and are wiped to the left. Lines staggered 60 ms.
export function glitchOut(headline) {
  const lines = [...headline.querySelectorAll(":scope > *")];
  const tl = gsap.timeline();
  lines.forEach((line, i) => {
    const sign = i % 2 === 0 ? 1 : -1;
    tl.fromTo(
      line,
      { clipPath: CLIP_FULL, x: 0, textShadow: "0em 0em 0em rgba(47,99,255,0)" },
      {
        clipPath: CLIP_HIDDEN,
        x: sign * 0.06 * em(line),
        textShadow: "-0.12em 0em 0em rgba(47,99,255,0.8)",
        duration: 0.45,
        ease: "steps(8)",
      },
      i * 0.06,
    );
  });
  return tl;
}
