// Startup sanity checks for config.js (LOGIC.md §2). Run in development only, so a
// founder editing a number gets a loud error instead of quietly wrong verdicts.
// Returns a list of problems (empty = OK); main.js throws if any are found.

export function validateConfig(config, sections) {
  const problems = [];
  const weights = config.skillWeights;

  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.001) problems.push(`skillWeights add up to ${sum}, not 1`);

  for (const s of sections) {
    if (typeof weights[s.id] !== "number") problems.push(`no skillWeight for section "${s.id}"`);
  }

  const { ready, almost } = config.verdict;
  if (ready.minOverall < almost.minOverall) problems.push("verdict.ready.minOverall is below verdict.almost.minOverall");
  if (ready.minEverySkill < almost.minEverySkill) problems.push("verdict.ready.minEverySkill is below verdict.almost.minEverySkill");

  return problems;
}
