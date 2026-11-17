// sessionStorage save/restore for state.js (LOGIC.md §10.2), kept separate so
// state.js stays about the rules. sessionStorage (not localStorage) because a
// check in progress only matters for this tab; a new visit starts fresh.
//
// Anything that doesn't look exactly right is thrown away: a broken restore
// must never put the learner on a question with the wrong options.
import { isValidOrder } from "./logic/shuffle.js";

const KEY = "examReady.v1";
const VERSION = 1;
// "briefing" is saved too, but never resumed: a refresh there goes back to landing.
const SCREENS = ["briefing", "sectionBreak", "question", "checking", "results"];
const CONFIDENCES = ["sure", "guessed", "unknown"];

export function save(state) {
  const data = {
    v: VERSION,
    questionIds: state.order.map((q) => q.id), // to detect changed content
    attempt: state.attempt,
    index: state.index,
    answers: state.answers,
    optionOrders: Object.fromEntries(state.order.map((q) => [q.id, q.optionOrder])),
    screen: state.screen,
    accepted: state.accepted, // the briefing's seatbelt pledge
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Private mode or storage full: the check still works, it just can't resume.
  }
}

export function clearSaved() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

// Keep only well-formed answers for known questions.
function cleanAnswers(raw, questions) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const q of questions) {
    const a = raw[q.id];
    if (!a || !CONFIDENCES.includes(a.confidence)) continue;
    if (a.confidence === "unknown") out[q.id] = { choice: null, confidence: "unknown" };
    else if (Number.isInteger(a.choice) && a.choice >= 0 && a.choice < q.options.length) {
      out[q.id] = { choice: a.choice, confidence: a.confidence };
    }
  }
  return out;
}

// Returns the saved session if it is valid for the current QUESTIONS, else null
// (and clears it, so a stale session doesn't keep showing the resume banner).
export function readSaved(questions) {
  let data;
  try {
    data = JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
    data = null;
  }
  if (!data) return null;

  const ids = questions.map((q) => q.id);
  const valid =
    data.v === VERSION &&
    Array.isArray(data.questionIds) &&
    data.questionIds.join() === ids.join() &&
    SCREENS.includes(data.screen) &&
    Number.isInteger(data.index) &&
    data.index >= 0 &&
    data.index < questions.length &&
    data.optionOrders &&
    questions.every((q) => isValidOrder(q, data.optionOrders[q.id]));

  if (!valid) {
    clearSaved();
    return null;
  }
  return {
    attempt: Number.isInteger(data.attempt) && data.attempt > 0 ? data.attempt : 1,
    index: data.index,
    screen: data.screen,
    optionOrders: data.optionOrders,
    answers: cleanAnswers(data.answers, questions),
    accepted: data.accepted === true,
  };
}

// Rebuild state.order from the saved option orders (same shape as buildAttempt).
export function orderFromSaved(questions, optionOrders) {
  return questions.map((q) => ({ ...q, optionOrder: [...optionOrders[q.id]] }));
}
