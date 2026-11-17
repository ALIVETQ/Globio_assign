// Sun/moon button that switches light/dark. Shows a moon in light mode (press
// for dark) and a sun in dark mode (press for light); CSS picks the icon from
// <html data-theme>. The click is handled once, globally, in src/theme.js.
import { MESSAGES } from "../data/messages.js";
import { esc } from "../dom.js";
import { currentTheme } from "../theme.js";

const SUN = `<svg class="theme-toggle__sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6"/></svg>`;
const MOON = `<svg class="theme-toggle__moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"/></svg>`;

export function themeToggleHTML() {
  const dark = currentTheme() === "dark";
  const label = dark ? MESSAGES.theme.toLight : MESSAGES.theme.toDark;
  return `<button type="button" class="theme-toggle" data-theme-toggle aria-pressed="${dark}" aria-label="${esc(label)}" title="${esc(label)}">${SUN}${MOON}</button>`;
}
