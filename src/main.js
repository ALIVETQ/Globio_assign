// Boots the app and switches screens (ARCHITECTURE.md §5). main.js owns no
// rules: state.js decides WHAT the state is, this file only shows it.
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/archivo/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/screens.css";
import "./styles/landing.css";
import "./styles/landingSections.css";
import "./styles/journey.css";
import "./styles/sectionBreak.css";
// options.css before question.css: question.css's desktop block shows the keycaps.
import "./styles/options.css";
import "./styles/question.css";
import "./styles/reading.css";
import "./styles/passages.css";
import "./styles/board.css";
import "./styles/results.css";
import "./styles/ticket.css";
import "./styles/ticketParts.css";
import "./styles/skills.css";
import "./styles/resultsBlocks.css";
import "./styles/resultsFold.css";

// Imported first so ?slow= and reduced motion apply before any screen animates.
import "./motion/prefs.js";
import * as S from "./state.js";
import { MESSAGES } from "./data/messages.js";
import { CONFIG } from "./data/config.js";
import { SECTIONS } from "./data/sections.js";
import { validateConfig } from "./logic/validateConfig.js";
import { glowTransition } from "./motion/glow.js";
import { initTheme } from "./theme.js";
import * as landing from "./screens/landing.js";
import * as sectionBreak from "./screens/sectionBreak.js";
import * as question from "./screens/question.js";
import * as checking from "./screens/checking.js";
import * as results from "./screens/results.js";

const SCREENS = { landing, sectionBreak, question, checking, results };

// A founder editing config.js gets a loud error at once instead of wrong verdicts.
if (import.meta.env.DEV) {
  const problems = validateConfig(CONFIG, SECTIONS);
  if (problems.length) throw new Error(`config.js: ${problems.join("; ")}`);
}

document.title = MESSAGES.page.title;
const app = document.getElementById("app");

let current = null;
let currentName = null;
let currentEl = null;
let currentKey = null;
let transitioning = false;
let pending = false;

// Two clicks on "I'm sure" must not save twice or skip a question, so every
// learner input is ignored while a screen transition runs (LOGIC.md §10.3).
const guard = (fn) => (...args) => (transitioning ? undefined : fn(...args));
const actions = {
  start: guard(() => S.start()),
  selectOption: guard(S.selectOption),
  confirm: guard(S.confirm),
  skip: guard(S.skip),
  back: guard(S.back),
  next: guard(S.next),
  finish: guard(S.finish),
  retake: guard(S.retake),
  goHome: guard(S.goHome),
  resume: guard(S.resume),
  startOver: guard(S.startOver),
  getResumeInfo: S.getResumeInfo, // read-only, used while rendering
};

// One "view" = one screen instance. A new question index is a new view; a new
// selection on the same question is not (it is an in-place update).
function viewKey(s) {
  const perIndex = s.screen === "question" || s.screen === "sectionBreak";
  return `${s.screen}:${s.attempt}${perIndex ? `:${s.index}` : ""}`;
}

function focusHeading(el) {
  const h = el.querySelector("h1");
  if (!h) return;
  h.setAttribute("tabindex", "-1");
  h.focus({ preventScroll: true });
}

// Screen changes that pass through the horizon glow (DESIGN.md §4.4, §9.11):
// Start, the last answer, and Retake (results → a fresh Vocabulary section break).
const GLOW = new Set(["landing>sectionBreak", "question>checking", "results>sectionBreak"]);

async function show(next, nextName) {
  if (current) await current.exit(currentEl, S.state); // old screen animates out

  // The swap: old screen torn down, new one rendered. With the glow it happens
  // under full white, so the learner never sees a blank or half-built page.
  const swap = () => {
    if (current) current.destroy(currentEl);
    currentEl = next.render(S.state, actions);
    app.replaceChildren(currentEl);
    current = next;
    currentName = nextName;
    window.scrollTo(0, 0);
  };
  if (GLOW.has(`${currentName}>${nextName}`)) await glowTransition(swap);
  else swap();

  await next.enter(currentEl, S.state); // new screen animates in
  focusHeading(currentEl);
}

async function sync() {
  if (transitioning) {
    pending = true; // the state changed mid-transition; catch up afterwards
    return;
  }
  const key = viewKey(S.state);
  const next = SCREENS[S.state.screen];

  if (key === currentKey && current === next) {
    // Same view: update in place if the screen supports it, else re-render.
    if (next.update) next.update(currentEl, S.state);
    else {
      // A re-render is a fresh screen, so it gets its entrance too (results:
      // the globe is mounted in enter(); checking: the auto-advance timer).
      next.destroy(currentEl);
      currentEl = next.render(S.state, actions);
      app.replaceChildren(currentEl);
      next.enter(currentEl, S.state);
    }
    return;
  }

  transitioning = true;
  currentKey = key;
  try {
    await show(next, S.state.screen);
  } finally {
    transitioning = false;
  }
  if (pending) {
    pending = false;
    sync();
  }
}

// Replays the current screen's entrance (debug panel).
function replay() {
  if (current && !transitioning) current.enter(currentEl, S.state);
}

initTheme(); // before the first screen renders, so toggles get the right label
S.subscribe(sync);
S.boot();
sync();

// Debug code is only fetched with ?debug=1, so learners never download it.
if (new URLSearchParams(location.search).has("debug")) {
  import("./debug/debugPanel.js").then((m) => m.mountDebugPanel({ replay }));
}
