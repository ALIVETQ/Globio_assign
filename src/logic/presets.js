// The 8 debug answer sets from LOGIC.md §12. Used by the ?debug=1 panel to jump
// straight to any kind of result, and by tests/scoring.test.js to check them.
//
// Codes: S = sure and right, G = guessed and right, X = sure and wrong,
//        W = guessed and wrong, U = "I don't know this yet".
// For X and W we pick the first option that isn't the answer (any wrong option works).

// Explicit ids (not positions) so reordering QUESTIONS can't silently shift a preset.
const IDS = ["v1", "v2", "v3", "v4", "v5", "g1", "g2", "g3", "g4", "g5", "r1", "r2", "r3", "r4", "r5"];

export const PRESET_CODES = {
  perfect: "SSSSS SSSSS SSSSS",
  ready: "SSGSS SXSSS SSSWS",
  almostOverall: "SSGSU SWSGS SSSUG",
  almostWeakest: "SSSSS SSSSS SSGXX",
  notYetOverall: "SSUUU SXSWU SSUUU",
  notYetWeakest: "SSSSS SSSSS SGXXX",
  luckyGuesser: "GGGGG GGGGG GGGGG",
  allUnknown: "UUUUU UUUUU UUUUU",
};

export const PRESET_NAMES = Object.keys(PRESET_CODES);

// One code letter + its question → an answers entry (original option indexes).
export function answerFromCode(code, question) {
  const wrong = question.options.findIndex((_, i) => i !== question.answer);
  switch (code) {
    case "S": return { choice: question.answer, confidence: "sure" };
    case "G": return { choice: question.answer, confidence: "guessed" };
    case "X": return { choice: wrong, confidence: "sure" };
    case "W": return { choice: wrong, confidence: "guessed" };
    case "U": return { choice: null, confidence: "unknown" };
    default: throw new Error(`Unknown preset code "${code}"`);
  }
}

// Build answers from a code string, in the order of `ids`.
export function answersFromCodes(codes, questions, ids = IDS) {
  const letters = codes.replace(/\s+/g, "");
  if (letters.length !== ids.length) throw new Error("Preset code length doesn't match question count");
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
  const answers = {};
  ids.forEach((id, i) => {
    answers[id] = answerFromCode(letters[i], byId[id]);
  });
  return answers;
}

export function buildPreset(name, questions) {
  const codes = PRESET_CODES[name];
  if (!codes) throw new Error(`Unknown preset "${name}"`);
  return answersFromCodes(codes, questions);
}
