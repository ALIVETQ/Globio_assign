// Shared test helpers.
import { QUESTIONS } from "../src/data/questions.js";
import { SECTIONS } from "../src/data/sections.js";
import { TOPICS } from "../src/data/topics.js";
import { CONFIG } from "../src/data/config.js";
import { scoreCheck } from "../src/logic/scoring.js";
import { answersFromCodes } from "../src/logic/presets.js";

export const CTX = { questions: QUESTIONS, sections: SECTIONS, topics: TOPICS, config: CONFIG };

export function score(answers, ctx = CTX) {
  return scoreCheck(answers, ctx);
}

// Build answers from per-section code strings, e.g. { vocabulary: "SSSSG", ... }.
export function answersBySection({ vocabulary, grammar, reading }) {
  return answersFromCodes(`${vocabulary}${grammar}${reading}`, QUESTIONS);
}

// Small seeded PRNG (mulberry32) so shuffle tests are repeatable.
export function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
