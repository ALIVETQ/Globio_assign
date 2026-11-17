// LOGIC.md §13 "tests/shuffle.test.js".
import { describe, it, expect } from "vitest";
import { QUESTIONS } from "../src/data/questions.js";
import { buildAttempt, isValidOrder } from "../src/logic/shuffle.js";
import { score, seeded } from "./helpers.js";

const FIXED = ["trueFalse", "ads"];
const SHUFFLED = ["choice4", "sentence"];

describe("buildAttempt", () => {
  it("never moves Richtig/Falsch or a/b options", () => {
    for (let seed = 1; seed <= 50; seed++) {
      for (const q of buildAttempt(QUESTIONS, seeded(seed))) {
        if (FIXED.includes(q.format)) expect(q.optionOrder).toEqual([0, 1]);
      }
    }
  });

  it("gives 4-option questions a permutation of [0, 1, 2, 3]", () => {
    for (let seed = 1; seed <= 50; seed++) {
      for (const q of buildAttempt(QUESTIONS, seeded(seed))) {
        if (SHUFFLED.includes(q.format)) {
          expect(q.optionOrder).toHaveLength(4);
          expect([...q.optionOrder].sort()).toEqual([0, 1, 2, 3]);
        }
      }
    }
  });

  it("is repeatable with the same seed and differs with another", () => {
    const orders = (seed) => buildAttempt(QUESTIONS, seeded(seed)).map((q) => q.optionOrder);
    expect(orders(42)).toEqual(orders(42));
    expect(orders(42)).not.toEqual(orders(7));
  });

  it("keeps question order exactly as QUESTIONS", () => {
    expect(buildAttempt(QUESTIONS, seeded(3)).map((q) => q.id)).toEqual(QUESTIONS.map((q) => q.id));
  });

  it("leaves the original question fields untouched", () => {
    const attempt = buildAttempt(QUESTIONS, seeded(9));
    attempt.forEach((q, i) => {
      const { optionOrder, ...rest } = q;
      expect(rest).toEqual(QUESTIONS[i]);
    });
  });

  it("maps display positions back to original indexes", () => {
    const attempt = buildAttempt(QUESTIONS, seeded(11));
    const answers = {};
    for (const q of attempt) {
      q.optionOrder.forEach((original, display) => {
        // The text at display position i is options[optionOrder[i]]
        expect(q.options[q.optionOrder[display]]).toBe(q.options[original]);
      });
      // Pick the display position that holds the right answer
      const display = q.optionOrder.findIndex((orig) => orig === q.answer);
      answers[q.id] = { choice: q.optionOrder[display], confidence: "sure" };
    }
    const res = score(answers);
    expect(res.overall).toBe(100);
    expect(res.perQuestion.every((p) => p.correct)).toBe(true);
  });
});

describe("isValidOrder", () => {
  const choice = QUESTIONS.find((q) => q.format === "choice4");
  const tf = QUESTIONS.find((q) => q.format === "trueFalse");
  it("accepts permutations for shuffled formats only", () => {
    expect(isValidOrder(choice, [3, 1, 0, 2])).toBe(true);
    expect(isValidOrder(choice, [0, 0, 1, 2])).toBe(false);
    expect(isValidOrder(choice, [0, 1, 2])).toBe(false);
    expect(isValidOrder(tf, [0, 1])).toBe(true);
    expect(isValidOrder(tf, [1, 0])).toBe(false);
  });
});
