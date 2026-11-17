// Practice recommendations (LOGIC.md §6): the 2–3 most useful things to practise,
// chosen from the learner's own answers. Pure; called by scoring.js.

// Worst-first ranking of outcomes, used to pick a topic's "reason" chip.
// A confident wrong belief is the most dangerous, so it outranks everything.
const REASON_RANK = { sureWrong: 4, guessedWrong: 3, unknown: 2, guessedRight: 1, sureRight: 0 };

export function rankRecommendations(perQuestion, { topics, config, skills }) {
  // Group by topic, remembering first appearance for the last tie-break.
  const byTopic = new Map();
  perQuestion.forEach((p, firstIndex) => {
    if (!byTopic.has(p.topic)) {
      byTopic.set(p.topic, { topic: p.topic, skill: p.section, pain: 0, worst: "sureRight", questionIds: [], firstIndex });
    }
    const t = byTopic.get(p.topic);
    t.pain += p.pain;
    t.questionIds.push(p.id);
    if (REASON_RANK[p.outcome] > REASON_RANK[t.worst]) t.worst = p.outcome;
  });

  const weightOf = (id) => config.skillWeights[id] ?? 0;

  return [...byTopic.values()]
    .filter((t) => t.pain > 0) // nothing to practise in topics answered sure and right
    .sort(
      (a, b) =>
        b.pain - a.pain || // 1. most pain first
        skills[a.skill].score - skills[b.skill].score || // 2. practise where you're weakest
        weightOf(b.skill) - weightOf(a.skill) || // 3. the skill that counts more
        a.firstIndex - b.firstIndex, // 4. earliest in the test
    )
    .slice(0, config.maxRecommendations)
    .map((t) => ({
      topic: t.topic,
      skill: t.skill,
      pain: t.pain,
      reason: t.worst,
      questionIds: t.questionIds,
      label: topics[t.topic]?.label ?? t.topic,
      tip: topics[t.topic]?.tip ?? "",
    }));
}
