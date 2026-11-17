// buildAttempt(): this attempt's question list with a per-question option order
// (LOGIC.md §9).
//
// Why shuffle at all: a learner who retakes the check shouldn't be able to
// remember "the answer was the second one".
//
// Why only some formats: Richtig/Falsch always comes in that order in the real
// exam, and the a/b options must match the badges printed on the two ads.
// Question order never changes either: r1 and r2 share one email and must stay
// together, and the real exam's reading parts come in a fixed order.
//
// `optionOrder[displayPosition] = originalIndex`. The screen shows
// options[optionOrder[i]] at position i and stores optionOrder[i] as the choice,
// so scoring only ever sees original indexes.

export const SHUFFLED_FORMATS = ["choice4", "sentence"];

function identity(n) {
  return Array.from({ length: n }, (_, i) => i);
}

// Fisher–Yates. `rng` is injectable so tests can pass a seeded random function.
function fisherYates(n, rng) {
  const order = identity(n);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function optionOrderFor(question, rng = Math.random) {
  const n = question.options.length;
  return SHUFFLED_FORMATS.includes(question.format) ? fisherYates(n, rng) : identity(n);
}

export function buildAttempt(questions, rng = Math.random) {
  return questions.map((q) => ({ ...q, optionOrder: optionOrderFor(q, rng) }));
}

// True if `order` is a valid option order for `question` (used when restoring a
// saved session: a corrupt order would make scoring use the wrong option).
export function isValidOrder(question, order) {
  if (!Array.isArray(order) || order.length !== question.options.length) return false;
  if (!SHUFFLED_FORMATS.includes(question.format)) return order.every((v, i) => v === i);
  return [...order].sort((a, b) => a - b).every((v, i) => v === i);
}
