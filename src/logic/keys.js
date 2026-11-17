// Keyboard shortcuts on the question screen (ARCHITECTURE.md §8, DESIGN.md §7.2).
// Pure: a key + the current question → what to do. The screen performs it.
//
//   1–4        select that DISPLAY position (LOGIC.md §9: keys follow what's shown)
//   R / F      Richtig / Falsch (trueFalse questions only)
//   A / B      ad a / ad b (ads question only)
//   S, G, D    I'm sure, I guessed, I don't know this yet
//   Backspace  back
//
// Returns { type: "select", index } | { type: "sure" | "guessed" | "unknown" | "back" } | null.

const LETTER_OPTIONS = {
  trueFalse: { r: 0, f: 1 },
  ads: { a: 0, b: 1 },
};

export function commandForKey(key, question) {
  if (typeof key !== "string" || !question) return null;
  const k = key.toLowerCase();

  if (/^[1-9]$/.test(k)) {
    const index = Number(k) - 1;
    return index < question.options.length ? { type: "select", index } : null;
  }
  const letters = LETTER_OPTIONS[question.format];
  if (letters && k in letters) return { type: "select", index: letters[k] };

  if (k === "s") return { type: "sure" };
  if (k === "g") return { type: "guessed" };
  if (k === "d") return { type: "unknown" };
  if (k === "backspace") return { type: "back" };
  return null;
}
