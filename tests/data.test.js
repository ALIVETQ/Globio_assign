// Guards on the content files and small helpers, so an edit to data/ that would
// break scoring fails here instead of on a learner's results page.
import { describe, it, expect } from "vitest";
import { QUESTIONS, PASSAGES } from "../src/data/questions.js";
import { SECTIONS } from "../src/data/sections.js";
import { TOPICS } from "../src/data/topics.js";
import { CONFIG } from "../src/data/config.js";
import { validateConfig } from "../src/logic/validateConfig.js";
import { fill } from "../src/logic/fill.js";

describe("content data", () => {
  it("has 15 questions, 5 per section, in section order", () => {
    expect(QUESTIONS).toHaveLength(15);
    const order = SECTIONS.map((s) => s.id);
    let last = 0;
    for (const q of QUESTIONS) {
      const i = order.indexOf(q.section);
      expect(i).toBeGreaterThanOrEqual(last);
      last = i;
    }
    for (const s of SECTIONS) expect(QUESTIONS.filter((q) => q.section === s.id)).toHaveLength(5);
  });

  it("every question has a known topic, valid answer and (for reading) a passage", () => {
    const ids = new Set();
    for (const q of QUESTIONS) {
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(TOPICS[q.topic]).toBeDefined();
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      if (q.section === "reading") expect(PASSAGES[q.passage]).toBeDefined();
    }
  });

  it("config passes its startup checks", () => {
    expect(validateConfig(CONFIG, SECTIONS)).toEqual([]);
  });

  it("validateConfig catches bad weights and inverted thresholds", () => {
    const bad = {
      ...CONFIG,
      skillWeights: { vocabulary: 0.5, grammar: 0.5, reading: 0.5 },
      verdict: { ready: { minOverall: 50, minEverySkill: 30 }, almost: CONFIG.verdict.almost },
    };
    expect(validateConfig(bad, SECTIONS)).toHaveLength(3);
  });
});

describe("fill", () => {
  it("replaces placeholders", () => {
    expect(fill("Q{n} OF {total}", { n: 4, total: 15 })).toBe("Q4 OF 15");
  });
  it("throws on a missing value when strict, keeps it otherwise", () => {
    expect(() => fill("{overall}%", {}, { strict: true })).toThrow();
    expect(fill("{overall}%", {}, { strict: false })).toBe("{overall}%");
  });
});
