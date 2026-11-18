// Every case from LOGIC.md §13.
import { describe, it, expect } from "vitest";
import { QUESTIONS } from "../src/data/questions.js";
import { CONFIG } from "../src/data/config.js";
import { buildPreset } from "../src/logic/presets.js";
import { CTX, score, answersBySection } from "./helpers.js";

// LOGIC.md §13 table: [vocab, grammar, reading, overall, verdict, blockedBy, weakest, recs, lucky]
const TABLE = {
  perfect: [100, 100, 100, 100, "ready", null, "reading", [], [0, 15, false]],
  ready: [90, 70, 80, 80, "ready", null, "grammar",
    [["accusative", "sureWrong"], ["readingSigns", "guessedWrong"], ["numbers", "guessedRight"]], [1, 13, false]],
  almostOverall: [70, 70, 70, 70, "almost", "overall", "reading",
    [["readingSigns", "unknown"], ["time", "unknown"], ["accusative", "guessedWrong"]], [3, 12, false]],
  almostWeakest: [100, 100, 40, 76, "almost", "weakestSkill", "reading",
    [["readingSigns", "sureWrong"], ["readingAds", "guessedRight"]], [1, 13, false]],
  notYetOverall: [40, 30, 40, 37, "notYet", "overall", "grammar",
    [["readingSigns", "unknown"], ["accusative", "sureWrong"], ["modals", "guessedWrong"]], [0, 6, false]],
  notYetWeakest: [100, 100, 0, 60, "notYet", "weakestSkill", "reading",
    [["readingSigns", "sureWrong"], ["readingAds", "sureWrong"], ["readingMessages", "guessedRight"]], [1, 12, false]],
  luckyGuesser: [50, 50, 50, 50, "notYet", "overall", "reading",
    [["readingMessages", "guessedRight"], ["readingSigns", "guessedRight"], ["time", "guessedRight"]], [15, 15, true]],
  allUnknown: [0, 0, 0, 0, "notYet", "overall", "reading",
    [["readingMessages", "unknown"], ["readingSigns", "unknown"], ["time", "unknown"]], [0, 0, false]],
};

describe("presets (LOGIC.md §13)", () => {
  for (const [name, [v, g, r, overall, verdict, blockedBy, weakest, recs, [count, correctTotal, warn]]] of Object.entries(TABLE)) {
    it(name, () => {
      const res = score(buildPreset(name, QUESTIONS));
      expect(res.skills.vocabulary.score).toBe(v);
      expect(res.skills.grammar.score).toBe(g);
      expect(res.skills.reading.score).toBe(r);
      expect(res.overall).toBe(overall);
      expect(res.verdict).toBe(verdict);
      expect(res.blockedBy).toBe(blockedBy);
      expect(res.weakestSkill).toBe(weakest);
      expect(res.recommendations.map((x) => [x.topic, x.reason])).toEqual(recs);
      expect(res.luckyGuesses.count).toBe(count);
      expect(res.luckyGuesses.correctTotal).toBe(correctTotal);
      expect(res.luckyGuesses.warn).toBe(warn);
    });
  }

  it("recommendation objects carry label, tip, skill, pain and question ids", () => {
    const [first] = score(buildPreset("ready", QUESTIONS)).recommendations;
    expect(first).toEqual({
      topic: "accusative",
      skill: "grammar",
      pain: 3,
      reason: "sureWrong",
      questionIds: ["g2"],
      label: CTX.topics.accusative.label,
      tip: CTX.topics.accusative.tip,
    });
  });

  it("sure-but-wrong costs half a point; a skill never goes below 0", () => {
    const all = score(answersBySection({ vocabulary: "XXXXX", grammar: "SSSSS", reading: "SSSSS" }));
    expect(all.skills.vocabulary.score).toBe(0); // −2.5 points clamps to 0, not −50
    expect(all.overall).toBe(70); // overall uses the clamped 0: 0.3·0 + 0.3·100 + 0.4·100
    const one = score(answersBySection({ vocabulary: "XSSSS", grammar: "SSSSS", reading: "SSSSS" }));
    expect(one.skills.vocabulary.score).toBe(70); // (4 − 0.5) / 5
  });

  it("perfect shows no recommendations", () => {
    expect(score(buildPreset("perfect", QUESTIONS)).recommendations).toEqual([]);
  });

  it("groups dots and keeps QUESTIONS order", () => {
    const res = score(buildPreset("ready", QUESTIONS));
    expect(res.groups.guessedRight).toEqual(["v3"]);
    expect(res.groups.sureWrong).toEqual(["g2"]);
    expect(res.groups.notKnown).toEqual(["r4"]);
    expect(res.groups.sureRight).toHaveLength(12);
    expect(res.perQuestion.map((p) => p.id)).toEqual(QUESTIONS.map((q) => q.id));
    expect(res.perQuestion[0].number).toBe(1);
  });
});

describe("boundaries (LOGIC.md §13)", () => {
  const cases = [
    [{ vocabulary: "SSSSS", grammar: "SSSGU", reading: "SSSUU" }, [100, 70, 60], 75, "ready", null],
    [{ vocabulary: "SSSSG", grammar: "SSSSG", reading: "SSGUU" }, [90, 90, 50], 74, "almost", "overall"],
    [{ vocabulary: "SSSGU", grammar: "SSSUU", reading: "SSUUU" }, [70, 60, 40], 55, "almost", "overall"],
    [{ vocabulary: "SSSUU", grammar: "SSSUU", reading: "SSUUU" }, [60, 60, 40], 52, "notYet", "overall"],
  ];
  for (const [codes, [v, g, r], overall, verdict, blockedBy] of cases) {
    it(`${v}/${g}/${r} → ${overall} ${verdict}`, () => {
      const res = score(answersBySection(codes));
      expect([res.skills.vocabulary.score, res.skills.grammar.score, res.skills.reading.score]).toEqual([v, g, r]);
      expect(res.overall).toBe(overall);
      expect(res.verdict).toBe(verdict);
      expect(res.blockedBy).toBe(blockedBy);
    });
  }
});

describe("lucky-guess warning", () => {
  const rest = { grammar: "UUUUU", reading: "UUUUU" };
  it("exactly 40% guesses does not warn (strict >)", () => {
    const l = score(answersBySection({ vocabulary: "SSSGG", ...rest })).luckyGuesses;
    expect([l.count, l.correctTotal, l.share, l.warn]).toEqual([2, 5, 0.4, false]);
  });
  it("60% guesses warns", () => {
    const l = score(answersBySection({ vocabulary: "SSGGG", ...rest })).luckyGuesses;
    expect([l.count, l.correctTotal, l.warn]).toEqual([3, 5, true]);
    expect(l.share).toBeCloseTo(0.6);
  });
  it("a single guess never warns, even at 100%", () => {
    const l = score(answersBySection({ vocabulary: "GUUUU", ...rest })).luckyGuesses;
    expect([l.count, l.correctTotal, l.share, l.warn]).toEqual([1, 1, 1, false]);
  });
});

describe("robustness", () => {
  it("missing answers score the same as allUnknown", () => {
    expect(score({})).toEqual(score(buildPreset("allUnknown", QUESTIONS)));
  });
  it("unknown ids change nothing", () => {
    const answers = buildPreset("ready", QUESTIONS);
    expect(score({ ...answers, zz: { choice: 0, confidence: "sure" } })).toEqual(score(answers));
  });
  it("a sure answer with choice null counts as unknown", () => {
    const answers = { ...buildPreset("perfect", QUESTIONS), v1: { choice: null, confidence: "sure" } };
    expect(score(answers).perQuestion[0].outcome).toBe("unknown");
  });
  it("config change: correctGuessed 0.25 gives luckyGuesser 25/25/25, overall 25", () => {
    const config = { ...CONFIG, credit: { ...CONFIG.credit, correctGuessed: 0.25 } };
    const res = score(buildPreset("luckyGuesser", QUESTIONS), { ...CTX, config });
    expect([res.skills.vocabulary.score, res.skills.grammar.score, res.skills.reading.score]).toEqual([25, 25, 25]);
    expect(res.overall).toBe(25);
  });
  it("is pure: same output twice, answers untouched", () => {
    const answers = buildPreset("almostOverall", QUESTIONS);
    const snapshot = structuredClone(answers);
    expect(score(answers)).toEqual(score(answers));
    expect(answers).toEqual(snapshot);
  });
});
