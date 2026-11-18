// Results-page text for all 8 presets (LOGIC.md §12–13, CONTENT.md §8–9):
// the right reason template, and every template fills with no missing value.
import { describe, it, expect } from "vitest";
import { QUESTIONS } from "../src/data/questions.js";
import { SECTIONS } from "../src/data/sections.js";
import { CONFIG } from "../src/data/config.js";
import { MESSAGES } from "../src/data/messages.js";
import { fill } from "../src/logic/fill.js";
import { buildPreset, PRESET_NAMES } from "../src/logic/presets.js";
import { resultValues, reasonTemplate, verdictText, summaryText } from "../src/logic/resultText.js";
import { score } from "./helpers.js";

const R = MESSAGES.results;
const V = R.verdict;
// LOGIC.md §13: verdict + blockedBy → the template CONTENT.md §8.1 asks for.
const EXPECTED_REASON = {
  perfect: V.ready.reason,
  ready: V.ready.reason,
  almostOverall: V.almost.reasonOverall,
  almostWeakest: V.almost.reasonWeakest,
  notYetOverall: V.notYet.reasonOverall,
  notYetWeakest: V.notYet.reasonWeakest,
  luckyGuesser: V.notYet.reasonOverall,
  allUnknown: V.notYet.reasonOverall,
};

const run = (name) => {
  const result = score(buildPreset(name, QUESTIONS));
  return { result, values: resultValues(result, { config: CONFIG, sections: SECTIONS }) };
};

describe("results text", () => {
  for (const name of PRESET_NAMES) {
    it(`${name}: reason template and every placeholder filled`, () => {
      const { result, values } = run(name);
      expect(reasonTemplate(result, MESSAGES)).toBe(EXPECTED_REASON[name]);
      const strict = { strict: true };
      const templates = [
        R.readyLine, R.almostLine, R.passMarkNote, R.journeyCaption, R.skillLine,
        R.luckyWarning, ...MESSAGES.method.paragraphs,
      ];
      for (const t of templates) expect(() => fill(t, values, strict)).not.toThrow();
      // Boarding pass: every field and the screen-reader sentence fill too.
      const T = R.ticket;
      for (const f of T.fields) expect(() => fill(f.value, values, strict)).not.toThrow();
      expect(fill(T.srText, { ...values, status: T.status[result.verdict] }, strict)).toBe(
        `Boarding pass, New Delhi to Berlin. Status: ${T.status[result.verdict]}. Readiness ${result.overall} percent.`,
      );
      const v = verdictText(result, values, MESSAGES);
      expect(v.reason).not.toMatch(/\{\w+\}/);
      expect(v.next).not.toMatch(/\{\w+\}/);
      expect(summaryText(result, values, MESSAGES, "https://x.test/")).not.toMatch(/\{\w+\}/);
    });
  }

  it("fills the reason sentences with the preset's numbers", () => {
    expect(verdictText(run("ready").result, run("ready").values, MESSAGES).reason).toBe(
      "You scored 80%, and every skill is at 60% or more.",
    );
    const w = run("almostWeakest");
    expect(verdictText(w.result, w.values, MESSAGES).reason).toBe(
      "Your overall score is good, but Reading is at 40%. One weak area can cost you the whole exam.",
    );
    const n = run("notYetOverall");
    expect(verdictText(n.result, n.values, MESSAGES).reason).toBe(
      "You scored 37%. The real exam needs 60%, and this check only covers part of it.",
    );
  });

  it("method numbers come from config", () => {
    const { values } = run("perfect");
    expect(fill(MESSAGES.method.paragraphs[1], values)).toContain("Reading for 40%, Vocabulary for 30% and Grammar for 30%");
    expect(fill(MESSAGES.method.paragraphs[0], values)).toContain("1 if you were sure and right, 0.5 if you guessed and got it right, −0.5 if you were sure but wrong");
  });

  it("summary text", () => {
    const { result, values } = run("ready");
    expect(summaryText(result, values, MESSAGES, "https://x.test/")).toBe(
      [
        "My A1 German readiness check: READY TO BOOK (80%)",
        "Vocabulary 90% · Grammar 70% · Reading 80%",
        "Practise next: Accusative articles (einen, den), Reading signs and notices, Numbers 21–99",
        "https://x.test/",
      ].join("\n"),
    );
    const p = run("perfect");
    expect(summaryText(p.result, p.values, MESSAGES, "u")).toContain("Practise next: nothing major");
  });
});
