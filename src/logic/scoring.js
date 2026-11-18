// scoreCheck(): learner answers → one plain result object (LOGIC.md §3–§8).
//
// Pure: same input, same output. No DOM, no randomness, no dates, and the
// `answers` argument is never modified. The results screen reads only the
// object this returns; it never recalculates anything.
//
// What this logic does NOT claim (LOGIC.md §14):
// - The thresholds (75 / 60 / 55 / 40), the half-credit for guesses and the
//   weights are STARTING ASSUMPTIONS, not validated predictions. They were chosen
//   from the real exam's 60% pass mark plus a safety margin, and tilted to avoid
//   false "ready" results.
// - 15 questions is a small sample; one answer moves a skill score by 20 points.
// - The check measures reading directly and vocabulary/grammar as a foundation.
//   It does not measure listening, writing or speaking, which are 75 of the 100
//   exam points.
// - Version 2 should calibrate these numbers against real exam results from
//   learners who took this check before their exam.

import { rankRecommendations } from "./recommend.js";

const CONFIDENCES = ["sure", "guessed", "unknown"];
const UNKNOWN = Object.freeze({ choice: null, confidence: "unknown" });

// Missing or malformed entries count as "I don't know this yet" (LOGIC.md §3.1).
// A "sure"/"guessed" answer without a choice can't be scored as right or wrong,
// so it is treated the same way rather than crashing the results page.
function normaliseAnswer(entry) {
  if (!entry || !CONFIDENCES.includes(entry.confidence)) return UNKNOWN;
  if (entry.confidence === "unknown") return UNKNOWN;
  if (entry.choice === null || entry.choice === undefined) return UNKNOWN;
  return { choice: entry.choice, confidence: entry.confidence };
}

// LOGIC.md §3.2 — one answer → outcome, credit, pain, dot group.
function outcomeOf(question, answer) {
  if (answer.confidence === "unknown") return "unknown";
  const right = answer.choice === question.answer;
  if (answer.confidence === "sure") return right ? "sureRight" : "sureWrong";
  return right ? "guessedRight" : "guessedWrong";
}

function creditOf(outcome, credit) {
  if (outcome === "sureRight") return credit.correctSure;
  if (outcome === "guessedRight") return credit.correctGuessed;
  if (outcome === "unknown") return credit.unknown;
  if (outcome === "sureWrong") return credit.sureWrong; // negative: a confident mistake costs points
  return credit.guessedWrong;
}

// Dot groups merge "guessed wrong" with "didn't know": both mean "not known yet".
const DOT_GROUP = {
  sureRight: "sureRight",
  guessedRight: "guessedRight",
  sureWrong: "sureWrong",
  guessedWrong: "notKnown",
  unknown: "notKnown",
};

// Floating-point maths can turn 75 into 74.99999999; rounding that would wrongly
// drop a learner below a line. Clean the noise first, then round half up.
function roundScore(x) {
  return Math.round(Math.round(x * 1e6) / 1e6);
}

export function scoreCheck(answers, { questions, sections, topics, config }) {
  const safeAnswers = answers || {};

  // ── Per question ──
  const perQuestion = questions.map((q, i) => {
    const a = normaliseAnswer(safeAnswers[q.id]);
    const outcome = outcomeOf(q, a);
    return {
      id: q.id,
      number: i + 1,
      section: q.section,
      topic: q.topic,
      choice: a.choice,
      answer: q.answer,
      correct: outcome === "sureRight" || outcome === "guessedRight",
      confidence: a.confidence,
      outcome,
      credit: creditOf(outcome, config.credit),
      pain: config.pain[outcome],
    };
  });

  // ── Skill scores (LOGIC.md §4.1) ──
  const skills = {};
  const unrounded = {};
  for (const s of sections) {
    const rows = perQuestion.filter((p) => p.section === s.id);
    const credits = rows.reduce((sum, p) => sum + p.credit, 0);
    // Multiply before dividing: 3.5 × 100 / 5 is exact, 3.5 / 5 × 100 is not.
    // Clamped at 0: sure-wrong credits are negative, but a skill never shows below 0%.
    unrounded[s.id] = rows.length ? Math.max(0, (credits * 100) / rows.length) : 0;
    skills[s.id] = {
      score: roundScore(unrounded[s.id]),
      correct: rows.filter((p) => p.correct).length,
      total: rows.length,
    };
  }

  // ── Overall (LOGIC.md §4.2): weighted sum of the clamped, UNROUNDED skills, rounded once ──
  const weightOf = (id) => config.skillWeights[id] ?? 0;
  const overall = roundScore(sections.reduce((sum, s) => sum + weightOf(s.id) * unrounded[s.id], 0));

  // ── Weakest skill (LOGIC.md §4.3) ──
  // Ties: the higher-weighted skill wins because it matters more; then the earlier section.
  const weakestSkill = sections
    .map((s, order) => ({ id: s.id, score: skills[s.id].score, weight: weightOf(s.id), order }))
    .sort((a, b) => a.score - b.score || b.weight - a.weight || a.order - b.order)[0].id;

  // ── Verdict (LOGIC.md §5) ──
  // Comparisons use the ROUNDED numbers, so the verdict always matches the screen.
  const R = config.verdict.ready;
  const A = config.verdict.almost;
  const w = skills[weakestSkill].score;
  let verdict;
  let blockedBy;
  if (overall >= R.minOverall && w >= R.minEverySkill) {
    verdict = "ready";
    blockedBy = null;
  } else if (overall >= A.minOverall && w >= A.minEverySkill) {
    verdict = "almost";
    blockedBy = overall < R.minOverall ? "overall" : "weakestSkill";
  } else {
    verdict = "notYet";
    // When both fall short, explain the broader problem (overall) first.
    blockedBy = overall < A.minOverall ? "overall" : "weakestSkill";
  }

  // ── Confidence dot groups, in QUESTIONS order ──
  const groups = { sureRight: [], guessedRight: [], sureWrong: [], notKnown: [] };
  for (const p of perQuestion) groups[DOT_GROUP[p.outcome]].push(p.id);

  // ── Lucky-guess warning (LOGIC.md §7). Strict ">": exactly 40% does not warn. ──
  const count = perQuestion.filter((p) => p.outcome === "guessedRight").length;
  const correctTotal = perQuestion.filter((p) => p.correct).length;
  const share = correctTotal > 0 ? count / correctTotal : 0;
  const warn = share > config.luckyGuess.minShare && count >= config.luckyGuess.minCount;

  const recommendations = rankRecommendations(perQuestion, { topics, config, skills });

  return {
    overall,
    verdict,
    blockedBy,
    weakestSkill,
    skills,
    groups,
    recommendations,
    luckyGuesses: { count, correctTotal, share, warn },
    perQuestion,
  };
}
