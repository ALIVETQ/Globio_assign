// Count-up (DESIGN.md §4.5): 0 → `to`, default 1.4 s, power3.out. The zero form
// ("0", "0%") is shown first so the layout never jumps. Tabular numerals keep
// the digits the same width while they change.
import { gsap } from "./gsap.js";

function format(value, decimals, suffix) {
  return `${value.toFixed(decimals)}${suffix}`;
}

// Show the zero form now (call before the count-up starts).
export function showZero(el, { decimals = 0, suffix = "" } = {}) {
  el.style.fontVariantNumeric = "tabular-nums";
  el.textContent = format(0, decimals, suffix);
}

export function countUp(el, to, { decimals = 0, suffix = "", duration = 1.4 } = {}) {
  showZero(el, { decimals, suffix });
  const counter = { value: 0 };
  return gsap.to(counter, {
    value: to,
    duration,
    ease: "power3.out",
    onUpdate: () => {
      el.textContent = format(counter.value, decimals, suffix);
    },
    // Land exactly on the final value: rounding mid-tween must never leave "14".
    onComplete: () => {
      el.textContent = format(to, decimals, suffix);
    },
  });
}
