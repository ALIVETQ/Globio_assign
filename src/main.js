// Boots the app and switches screens (ARCHITECTURE.md §5). main.js owns no
// rules: state.js decides WHAT the state is, this file only shows it.
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/archivo/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/screens.css";
import "./styles/landing.css";

// Imported first so ?slow= and reduced motion apply before any screen animates.
import "./motion/prefs.js";
import * as S from "./state.js";
import { MESSAGES } from "./data/messages.js";
import { CONFIG } from "./data/config.js";
import { SECTIONS } from "./data/sections.js";
import { validateConfig } from "./logic/validateConfig.js";
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

async function show(next) {
  if (current) {
    await current.exit(currentEl, S.state); // old screen animates out
    current.destroy(currentEl);
  }
  const el = next.render(S.state, actions);
  app.replaceChildren(el);
  current = next;
  currentEl = el;
  window.scrollTo(0, 0);
  await next.enter(el, S.state); // new screen animates in
  focusHeading(el);
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
      next.destroy(currentEl);
      currentEl = next.render(S.state, actions);
      app.replaceChildren(currentEl);
    }
    return;
  }

  transitioning = true;
  currentKey = key;
  try {
    await show(next);
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

S.subscribe(sync);
S.boot();
sync();

// Debug code is only fetched with ?debug=1, so learners never download it.
if (new URLSearchParams(location.search).has("debug")) {
  import("./debug/debugPanel.js").then((m) => m.mountDebugPanel({ replay }));
}
