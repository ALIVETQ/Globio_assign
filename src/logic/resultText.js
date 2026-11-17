// Text for the results page, built from the result object and config only
// (CONTENT.md §8–9). Pure functions: no DOM, so every preset can be tested.
//
// The results screen never recalculates anything (ARCHITECTURE.md §4.3): it
// takes these values, picks a template from messages.js and fills it.
import { fill } from "./fill.js";

const cap = (id) => id[0].toUpperCase() + id.slice(1); // "reading" → "Reading"

// Every placeholder in CONTENT.md §9 that comes from the result or config.
export function resultValues(result, { config, sections }) {
  const weakest = sections.find((s) => s.id === result.weakestSkill);
  const values = {
    overall: result.overall,
    weakestName: weakest?.name ?? result.weakestSkill,
    weakestScore: result.skills[result.weakestSkill].score,
    guessedRight: result.luckyGuesses.count,
    correctTotal: result.luckyGuesses.correctTotal,
    readyMin: config.verdict.ready.minOverall,
    readySkill: config.verdict.ready.minEverySkill,
    almostMin: config.verdict.almost.minOverall,
    almostSkill: config.verdict.almost.minEverySkill,
    passMark: config.examPassMark,
    creditSure: config.credit.correctSure,
    creditGuessed: config.credit.correctGuessed,
  };
  for (const s of sections) {
    values[`score${cap(s.id)}`] = result.skills[s.id].score;
    // Weights are shares (0.3); the text shows percentages. Rounded so 0.3 × 100
    // never prints as 30.000000000000004.
    values[`weight${cap(s.id)}`] = Math.round(config.skillWeights[s.id] * 100);
  }
  return values;
}

// The reason sentence is picked by the verdict AND what held the learner back
// (LOGIC.md §5): "overall" → reasonOverall, "weakestSkill" → reasonWeakest.
export function reasonTemplate(result, messages) {
  const t = messages.results.verdict[result.verdict];
  if (result.verdict === "ready") return t.reason;
  return result.blockedBy === "weakestSkill" ? t.reasonWeakest : t.reasonOverall;
}

// Verdict text for the top of the page, filled.
export function verdictText(result, values, messages) {
  const t = messages.results.verdict[result.verdict];
  return {
    stamp: t.stamp,
    reason: fill(reasonTemplate(result, messages), values),
    next: fill(t.next, values),
  };
}

// "Copy my result" text (CONTENT.md §8.5): lines joined with "\n".
export function summaryText(result, values, messages, url) {
  const labels = result.recommendations.map((r) => r.label);
  const extra = {
    stamp: messages.results.verdict[result.verdict].stamp,
    practiceList: labels.length ? labels.join(", ") : messages.summaryNone,
    url,
  };
  return messages.summary.map((line) => fill(line, { ...values, ...extra })).join("\n");
}
