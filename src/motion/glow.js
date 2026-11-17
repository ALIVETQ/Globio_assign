// Horizon glow transition (DESIGN.md §4.4): a cobalt horizon rises from the
// bottom of the screen, the screen swaps under full white, then the overlay
// fades. Used for landing → first section break (later also Q15 → checking and
// results → retake). main.js runs it around the screen swap.
import { gsap } from "./gsap.js";
import { reducedMotion } from "./prefs.js";

// [multiple of Rx, colour]. Inside the ellipse is clear; outside it turns blue,
// then white. As the ellipse rises off the top, the screen fills with white.
const STOPS = [
  [0, "rgba(255,255,255,0)"],
  [0.985, "rgba(238,242,255,0)"],
  [1.0, "rgba(214,224,255,.6)"],
  [1.06, "#9fb2ff"],
  [1.14, "#5a80ff"],
  [1.236, "#2f63ff"],
  [1.32, "#5a80ff"],
  [1.42, "#a9bcff"],
  [1.53, "#dfe6ff"],
  [1.65, "#ffffff"],
];

// Dark mode (DESIGN.md §2.6): same positions, but the horizon fades into the
// dark page colour instead of white, so the swap happens under "full dark"
// rather than flashing the screen white.
const DARK_STOPS = [
  [0, "rgba(14,16,22,0)"],
  [0.985, "rgba(14,16,22,0)"],
  [1.0, "rgba(60,90,200,.35)"],
  [1.06, "#2a3b80"],
  [1.14, "#3d63e0"],
  [1.236, "#5b84ff"],
  [1.32, "#3d63e0"],
  [1.42, "#2a3b80"],
  [1.53, "#161c33"],
  [1.65, "#0e1016"],
];

const RY_SHARE = 0.72; // Ry = 0.72·vh
const WHITE_AT = STOPS[STOPS.length - 1][0]; // 1.65: from here outwards it's pure white

// Where the rise must end for the WHOLE screen to be white at the swap.
// The screen point nearest the ellipse is the top edge, at distance −cy from its
// centre, i.e. (−cy / Ry) in gradient units. Needing that ≥ 1.65 with
// cy = edge·vh − Ry gives edge ≤ −(1.65 − 1)·0.72 = −0.468. A hair beyond, for rounding.
const END_EDGE = -(WHITE_AT - 1) * RY_SHARE - 0.002;

export function glowTransition(swapFn) {
  if (reducedMotion) {
    swapFn(); // no overlay, instant swap
    return Promise.resolve();
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const Rx = Math.max(0.75 * vw, 0.9 * vh);
  const Ry = RY_SHARE * vh;
  const palette = document.documentElement.dataset.theme === "dark" ? DARK_STOPS : STOPS;
  const stops = palette.map(([m, c]) => `${c} ${(m * Rx).toFixed(1)}px`).join(", ");

  const overlay = document.createElement("div");
  overlay.className = "glow";
  overlay.setAttribute("aria-hidden", "true");
  const state = { edge: 1.25 };
  // The ellipse's bottom sits at `edge` (in viewport heights).
  const paint = () => {
    const cy = state.edge * vh - Ry;
    overlay.style.background = `radial-gradient(${Rx.toFixed(1)}px ${Ry.toFixed(1)}px at 50% ${cy.toFixed(1)}px, ${stops})`;
  };
  paint();
  document.body.append(overlay);

  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          overlay.remove();
          resolve();
        },
      })
      .to(state, { edge: END_EDGE, duration: 0.85, ease: "power3.inOut", onUpdate: paint })
      .call(swapFn)
      .to({}, { duration: 0.1 }) // hold under white
      .to(overlay, { opacity: 0, duration: 0.45, ease: "power2.out" });
  });
}
