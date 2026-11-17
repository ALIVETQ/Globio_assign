// Light / dark theme. The page follows the device setting until the learner
// presses the sun/moon button; that choice is remembered on this device.
//
// The theme is a single attribute, <html data-theme="light|dark">; every colour
// comes from tokens.css, which redefines the tokens for dark. index.html sets
// the attribute before the page paints (no white flash); this module keeps it
// in sync and wires up every toggle button on any screen.
import { MESSAGES } from "./data/messages.js";

const KEY = "examReady.theme";
const root = document.documentElement;
const query = window.matchMedia?.("(prefers-color-scheme: dark)");

function stored() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null; // storage blocked: just follow the device
  }
}

export function currentTheme() {
  return root.dataset.theme === "dark" ? "dark" : "light";
}

// Every toggle on the page describes what pressing it will do.
function syncToggles() {
  const dark = currentTheme() === "dark";
  const label = dark ? MESSAGES.theme.toLight : MESSAGES.theme.toDark;
  for (const btn of document.querySelectorAll("[data-theme-toggle]")) {
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    btn.setAttribute("aria-pressed", String(dark));
  }
}

function apply(theme) {
  root.dataset.theme = theme;
  syncToggles();
  // The canvas globe and the glow read colours from JS, so they listen for this.
  window.dispatchEvent(new CustomEvent("examready:theme", { detail: { theme } }));
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* not remembered, but still applied */
  }
  apply(theme);
}

export function initTheme() {
  apply(stored() ?? (query?.matches ? "dark" : "light"));
  // Follow the device setting live, until the learner has picked a theme.
  query?.addEventListener?.("change", (e) => {
    if (!stored()) apply(e.matches ? "dark" : "light");
  });
  // One listener for every toggle, on every screen, including ones rendered later.
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
  // Screens render their toggle with the right label; this covers re-renders.
  new MutationObserver(syncToggles).observe(document.getElementById("app"), { childList: true });
}
