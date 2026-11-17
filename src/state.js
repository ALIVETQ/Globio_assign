// App state and the ONLY functions allowed to change it (ARCHITECTURE.md §4.2,
// LOGIC.md §10). Screens call these through the `actions` object; main.js
// subscribes and swaps screens when the state changes.
//
// Answers are stored by question id and ORIGINAL option index, never by the
// shuffled display position, so shuffling can never affect scoring.
import { QUESTIONS } from "./data/questions.js";
import { SECTIONS } from "./data/sections.js";
import { TOPICS } from "./data/topics.js";
import { CONFIG } from "./data/config.js";
import { buildAttempt } from "./logic/shuffle.js";
import { scoreCheck } from "./logic/scoring.js";
import { buildPreset } from "./logic/presets.js";
import { save, readSaved, clearSaved, orderFromSaved } from "./persist.js";

const DEV = import.meta.env.DEV;
const UNKNOWN = { choice: null, confidence: "unknown" };

export const state = {
  screen: "landing", // "landing" | "sectionBreak" | "question" | "checking" | "results"
  attempt: 1, // increments on retake
  order: [], // this attempt's questions with `optionOrder` (logic/shuffle.js)
  index: 0, // position in `order` (0–14)
  answers: {}, // { [questionId]: { choice: originalIndex | null, confidence } }
  pendingChoice: null, // original index tapped but not yet confirmed
  result: null, // scoreCheck() output, set when entering "checking"
};

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Every action ends here: save, then tell main.js to update the view.
function commit() {
  if (state.screen !== "landing") save(state); // landing must not overwrite a quiz in progress
  listeners.forEach((fn) => fn(state));
}

const current = () => state.order[state.index];
const savedChoice = (q) => state.answers[q.id]?.choice ?? null;

// Fill any missing answer as unknown, then score. A missing entry should never
// happen in normal use, so it is logged in development (LOGIC.md §10.3).
function computeResult() {
  const missing = QUESTIONS.filter((q) => !state.answers[q.id]);
  if (missing.length && DEV) console.warn("Scoring with missing answers:", missing.map((q) => q.id));
  for (const q of missing) state.answers[q.id] = { ...UNKNOWN };
  return scoreCheck(state.answers, { questions: QUESTIONS, sections: SECTIONS, topics: TOPICS, config: CONFIG });
}

// ───────────── Actions (LOGIC.md §10.1) ─────────────

export function start({ attempt = 1 } = {}) {
  Object.assign(state, {
    attempt,
    order: buildAttempt(QUESTIONS),
    index: 0,
    answers: {},
    pendingChoice: null,
    result: null,
    screen: "sectionBreak",
  });
  commit();
}

export function selectOption(displayIndex) {
  const q = current();
  if (state.screen !== "question" || !q) return;
  if (!Number.isInteger(displayIndex) || displayIndex < 0 || displayIndex >= q.optionOrder.length) return;
  // optionOrder is [0, 1] for unshuffled formats, so this also covers Richtig/Falsch and a/b.
  state.pendingChoice = q.optionOrder[displayIndex];
  commit();
}

export function confirm(confidence) {
  if (state.screen !== "question") return;
  if (confidence !== "sure" && confidence !== "guessed") return;
  if (state.pendingChoice === null) return; // a sure/guessed answer must have a choice
  state.answers[current().id] = { choice: state.pendingChoice, confidence };
  next();
}

export function skip() {
  if (state.screen !== "question") return;
  state.answers[current().id] = { ...UNKNOWN }; // any pending selection is discarded
  next();
}

export function next() {
  if (state.screen === "sectionBreak") {
    state.screen = "question";
  } else if (state.screen === "question") {
    state.pendingChoice = null;
    if (state.index === state.order.length - 1) {
      state.result = computeResult();
      state.screen = "checking";
    } else {
      const isNewSection = state.order[state.index + 1].section !== current().section;
      state.index += 1;
      state.screen = isNewSection ? "sectionBreak" : "question";
    }
  } else return;
  commit();
}

export function back() {
  if (state.screen !== "question" || state.index === 0) return;
  state.index -= 1; // section breaks are skipped on the way back
  state.pendingChoice = savedChoice(current()); // show the earlier choice as selected
  commit();
}

export function finish() {
  if (state.screen !== "checking") return;
  state.screen = "results";
  commit();
}

export function retake() {
  start({ attempt: state.attempt + 1 }); // fresh shuffle
}

export function goHome() {
  const finished = state.screen === "checking" || state.screen === "results";
  if (finished) clearSaved();
  state.screen = "landing";
  commit();
}

// ───────────── Resume (LOGIC.md §10.2) ─────────────

// Info for the landing page's resume banner, or null if there is nothing to resume.
export function getResumeInfo() {
  const saved = readSaved(QUESTIONS);
  if (!saved || (saved.screen !== "sectionBreak" && saved.screen !== "question")) return null;
  return { n: saved.index + 1, total: QUESTIONS.length };
}

function restore(saved) {
  Object.assign(state, {
    attempt: saved.attempt,
    order: orderFromSaved(QUESTIONS, saved.optionOrders),
    index: saved.index,
    answers: saved.answers,
    result: null,
    screen: saved.screen,
  });
  state.pendingChoice = state.screen === "question" ? savedChoice(current()) : null;
}

export function resume() {
  const saved = readSaved(QUESTIONS);
  if (!saved) return;
  restore(saved);
  commit();
}

export function startOver() {
  clearSaved();
  state.screen = "landing";
  commit();
}

// Called once on page load. A finished quiz goes straight back to results
// (recomputed, never stored); a quiz in progress waits on the landing banner.
export function boot() {
  const saved = readSaved(QUESTIONS);
  if (saved && (saved.screen === "checking" || saved.screen === "results")) {
    restore(saved);
    state.result = computeResult();
    state.screen = "results";
  }
}

// ───────────── Debug only (used by ?debug=1) ─────────────

export function debugJump({ screen, index = 0 }) {
  if (!state.order.length) state.order = buildAttempt(QUESTIONS);
  state.index = Math.max(0, Math.min(index, state.order.length - 1));
  state.pendingChoice = screen === "question" ? savedChoice(current()) : null;
  if (screen === "checking" || screen === "results") state.result = computeResult();
  state.screen = screen;
  commit();
}

export function debugLoadPreset(name) {
  if (!state.order.length) state.order = buildAttempt(QUESTIONS);
  state.answers = buildPreset(name, QUESTIONS);
  state.index = state.order.length - 1;
  state.pendingChoice = null;
  state.result = computeResult();
  state.screen = "results";
  commit();
}
