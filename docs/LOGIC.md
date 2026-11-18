# LOGIC.md — "Am I exam-ready?"

> How the app decides. Read `ARCHITECTURE.md` first.
> This file is the source of truth for `src/data/config.js`, `src/logic/scoring.js`, `src/logic/shuffle.js`, `src/logic/presets.js`, the rules in `src/state.js`, and the tests.
> Copy every number exactly. Every rule here has a reason; the reasons are written next to the rules so they can go into code comments.

---

## 1. The idea in one paragraph

A normal quiz only checks whether the learner clicked the right answer. This check also asks **whether they actually knew it**. After choosing an answer, the learner confirms it with **"I'm sure"** or **"I guessed"**, or skips with **"I don't know this yet"**. A right answer that was a guess earns half credit, because on a Richtig/Falsch question a coin flip is right 50% of the time, and luck doesn't carry over to exam day. The readiness verdict then needs **two** things: a high enough overall score **and** no weak skill, because the Goethe A1 exam isn't modular: one weak area can mean paying for and retaking the whole exam. We would rather tell a learner "not yet" when they might have passed than "ready" when they will fail, because a false "ready" costs ~₹9,000 and weeks of waiting, while a false "not yet" costs one more week of practice.

---

## 2. `src/data/config.js`

```js
// Every number that decides "ready" lives here. No other file may hard-code these.
export const CONFIG = {
  // Share of the overall score per skill. Must add up to 1.
  // Reading counts most: it's the only part of this check that matches a real exam section (Lesen).
  skillWeights: {
    vocabulary: 0.3,
    grammar: 0.3,
    reading: 0.4,
  },

  // Points for one answer.
  // A right guess earns half: on Richtig/Falsch a coin flip is right half the time.
  credit: {
    correctSure: 1,
    correctGuessed: 0.5,
    // Makes honesty the best strategy: pressing "I'm sure" only pays off if
    // you're more than 50% likely to be right. Without this, "sure" had no downside.
    sureWrong: -0.5,  // sure, but wrong: a confident mistake costs half a point
    guessedWrong: 0,
    unknown: 0,       // "I don't know this yet"
  },

  // Both the overall score AND the weakest skill must clear the bar.
  // The real Goethe A1 pass mark is 60/100. "Ready" asks for 75 as a safety margin,
  // because this check covers only part of the exam and exam-day nerves cost marks.
  verdict: {
    ready:  { minOverall: 75, minEverySkill: 60 },
    almost: { minOverall: 55, minEverySkill: 40 },
    // below "almost" = "notYet"
  },

  // Real exam pass mark, shown in text only. Not used in the verdict maths.
  examPassMark: 60,

  // How many practice topics to show on the results page.
  maxRecommendations: 3,

  // Warn when a big share of right answers were guesses.
  luckyGuess: {
    minShare: 0.4,   // warn if MORE THAN 40% of correct answers were guesses …
    minCount: 2,     // … and at least 2 of them were guesses
  },

  // Pain points per answer, used to rank practice topics (§6).
  pain: {
    sureWrong: 3,      // they believe something wrong: the most dangerous mistake
    guessedWrong: 2,
    unknown: 2,
    guessedRight: 1,   // shaky knowledge
    sureRight: 0,
  },
};
```

Validate at startup (development only): weights add up to 1 (±0.001), every section in `SECTIONS` has a weight, `ready` thresholds ≥ `almost` thresholds.

---

## 3. Answers

### 3.1 Shape

Answers are stored per question id:

```js
answers = {
  v1: { choice: 1, confidence: "sure" },      // choice = ORIGINAL option index (CONTENT.md §2)
  v2: { choice: 0, confidence: "guessed" },
  v3: { choice: null, confidence: "unknown" } // "I don't know this yet"
}
```

- `confidence` is always one of `"sure"`, `"guessed"`, `"unknown"`.
- `choice` is `null` **only** when `confidence` is `"unknown"`.
- A question with no entry (for example after a broken restore) is treated as `{ choice: null, confidence: "unknown" }`.
- Entries for ids that are not in `QUESTIONS` are ignored.

### 3.2 Outcome of one answer

| Answer | Outcome | Credit | Pain | Dot group |
|---|---|---|---|---|
| right + sure | `sureRight` | `credit.correctSure` (1) | 0 | `sureRight` |
| right + guessed | `guessedRight` | `credit.correctGuessed` (0.5) | 1 | `guessedRight` |
| wrong + sure | `sureWrong` | `credit.sureWrong` (−0.5) | 3 | `sureWrong` |
| wrong + guessed | `guessedWrong` | `credit.guessedWrong` (0) | 2 | `notKnown` |
| "I don't know this yet" | `unknown` | 0 | 2 | `notKnown` |

"Right" means `choice === question.answer` (both in original indexes).

---

## 4. Scores

### 4.1 Skill score

For each section (skill):

```
skillScore = round( max(0, (sum of credits in that section) / (number of questions in that section) × 100) )
```

Sure-but-wrong credits are negative, so a skill is **clamped at 0 before rounding**: five sure-wrong answers score 0, not −50. With 5 questions and half-point credits, skill scores are always multiples of 10.

Also record per skill: `correct` (right answers, sure or guessed) and `total`.

### 4.2 Overall score

```
overall = round( Σ skillWeights[skill] × skillScoreUnrounded[skill] )
```

Use the **clamped, unrounded** skill scores for the sum, then round once. With the current config the result is always a whole number anyway.

**Rounding:** `Math.round` (half rounds up). **All comparisons in §5 use the rounded numbers** — the same numbers the learner sees — so the verdict always agrees with the screen.

### 4.3 Weakest skill

The skill with the lowest rounded score. **Ties:** the one with the higher weight wins (it matters more), then the one earlier in `SECTIONS`. With the current config, a tie between reading and anything else picks reading; a tie between vocabulary and grammar picks vocabulary.

---

## 5. Verdict

```js
const R = CONFIG.verdict.ready;
const A = CONFIG.verdict.almost;
const w = skills[weakestSkill].score;

if (overall >= R.minOverall && w >= R.minEverySkill) {
  verdict = "ready";   blockedBy = null;
} else if (overall >= A.minOverall && w >= A.minEverySkill) {
  verdict = "almost";  blockedBy = overall < R.minOverall ? "overall" : "weakestSkill";
} else {
  verdict = "notYet";  blockedBy = overall < A.minOverall ? "overall" : "weakestSkill";
}
```

- `blockedBy` picks the reason sentence (`CONTENT.md` §8.1): `"overall"` → `reasonOverall`, `"weakestSkill"` → `reasonWeakest`.
- When both the overall score and the weakest skill fall short, `blockedBy` is `"overall"` (the broader problem is explained first).
- Boundaries are inclusive: exactly 75 overall with every skill exactly 60 is **ready**; exactly 55 with every skill exactly 40 is **almost**.

---

## 6. Practice recommendations

Goal: the 2–3 most useful things to practise, chosen from the learner's own answers.

### 6.1 Steps

1. For every question, take its **pain** from §3.2.
2. Group by **topic** (`CONTENT.md` §2–3). A topic's pain = the sum of its questions' pain. Topics with pain 0 are dropped.
3. A topic's **reason** = the worst outcome among its questions, in this order: `sureWrong` > `guessedWrong` > `unknown` > `guessedRight`. The reason maps to the chip text in `CONTENT.md` §8.3: `sureWrong` → `reason.sureWrong`, `guessedWrong` → `reason.wrong`, `unknown` → `reason.unknown`, `guessedRight` → `reason.guessed`.
4. Sort topics by:
   1. pain, highest first;
   2. then the topic's skill score, lowest first (practise where you're weakest);
   3. then the skill's weight, highest first;
   4. then the topic's first appearance in `QUESTIONS`, earliest first.
5. Keep the first `maxRecommendations` (3).
6. If none remain, the results page shows `results.practiceNone`.

Recommendations are shown for **every** verdict, including "ready".

### 6.2 Recommendation object

```js
{
  topic: "accusative",
  skill: "grammar",
  pain: 3,
  reason: "sureWrong",            // "sureWrong" | "guessedWrong" | "unknown" | "guessedRight"
  questionIds: ["g2"],            // questions in this topic, in QUESTIONS order
  label: "Accusative articles (einen, den)",   // from TOPICS
  tip: "Only masculine words change: …",       // from TOPICS
}
```

---

## 7. Lucky-guess warning

```
count        = number of guessedRight answers
correctTotal = number of right answers (sure or guessed)
share        = correctTotal > 0 ? count / correctTotal : 0
warn         = share > luckyGuess.minShare && count >= luckyGuess.minCount
```

Note the strict `>`: exactly 40% does **not** warn.

---

## 8. The result object (`scoreCheck()` return value)

`scoreCheck(answers, { questions, sections, topics, config })` is a pure function: same input, same output, no DOM, no randomness, no dates.

```js
{
  overall: 70,                          // 0–100, rounded
  verdict: "almost",                    // "ready" | "almost" | "notYet"
  blockedBy: "overall",                 // null | "overall" | "weakestSkill"
  weakestSkill: "vocabulary",           // section id

  skills: {
    vocabulary: { score: 70, correct: 4, total: 5 },
    grammar:    { score: 70, correct: 4, total: 5 },
    reading:    { score: 70, correct: 4, total: 5 },
  },

  groups: {                             // for the confidence dots; ids in QUESTIONS order
    sureRight:    ["v1", "v2", ...],
    guessedRight: ["v3", ...],
    sureWrong:    [...],
    notKnown:     ["v5", ...],
  },

  recommendations: [ /* §6.2, max 3 */ ],

  luckyGuesses: { count: 3, correctTotal: 12, share: 0.25, warn: false },

  perQuestion: [                        // in QUESTIONS order; used by the answer review
    {
      id: "v1",
      number: 1,                        // 1-based position in the test
      section: "vocabulary",
      topic: "family",
      choice: 1,                        // original index or null
      answer: 1,                        // correct original index
      correct: true,
      confidence: "sure",
      outcome: "sureRight",             // §3.2
      credit: 1,
      pain: 0,
    },
    // …
  ],
}
```

The results screen, the checking screen and the "copy my result" text read **only** this object, `config.js` and `messages.js`.

---

## 9. Shuffling (`src/logic/shuffle.js`)

Goal: a learner who retakes the check shouldn't be able to remember "the answer was the second one".

- **Question order never changes.** Sections run Vocabulary → Grammar → Reading, and questions keep their `QUESTIONS` order inside each section. (r1 and r2 share one email and must stay next to each other; the real exam's reading parts also come in a fixed order.)
- **Option order is shuffled per attempt** for `format: "choice4"` and `format: "sentence"` only.
- **Never shuffled:** `format: "trueFalse"` (always Richtig, then Falsch, as in the real exam) and `format: "ads"` (always a, then b, matching the ads' badges).
- Use Fisher–Yates. `buildAttempt(questions, rng = Math.random)` returns:

```js
[
  {
    ...question,                 // all original fields, untouched
    optionOrder: [2, 0, 3, 1],   // display position → original index
  },
  ...
]
```

- The screen shows `question.options[optionOrder[i]]` at position `i`. When the learner picks display position `i`, the app stores `choice: optionOrder[i]`. **Scoring never sees display positions.**
- Keyboard keys `1`–`4` refer to display positions.
- The `rng` parameter exists so tests can pass a seeded random function.

---

## 10. State rules (`src/state.js`)

### 10.1 Actions

| Action | Rule |
|---|---|
| `start()` | `attempt` = 1, `order = buildAttempt(...)`, `index = 0`, `answers = {}`, `pendingChoice = null`, `accepted = false`, go to `briefing` (the safety briefing, `DESIGN.md` §5b). |
| `setAccepted(on)` | Only on `briefing`: `accepted = on` (the seatbelt pledge checkbox). |
| `takeOff()` | Only on `briefing` and only when `accepted`: go to `sectionBreak` for the first section. |
| `selectOption(displayIndex)` | `pendingChoice = order[index].optionOrder[displayIndex]` (or the index itself for unshuffled formats). Selecting another option replaces it. Tapping the selected option again keeps it selected (no deselect). |
| `confirm("sure" \| "guessed")` | Allowed only when `pendingChoice !== null`. Saves `{ choice: pendingChoice, confidence }` for the current question, then `next()`. |
| `skip()` | Saves `{ choice: null, confidence: "unknown" }`, then `next()`. Allowed at any time, even if an option is selected (the selection is discarded). |
| `next()` | `pendingChoice = null`. If this was the last question: compute `result = scoreCheck(...)` and go to `checking`. Else if the next question is in a new section: go to that section's `sectionBreak`, then its first question. Else `index + 1`. |
| `back()` | Not available on question 1. `index − 1` (skipping section breaks; back from the first grammar question goes straight to the last vocabulary question). `pendingChoice` is pre-filled with the saved `choice` for that question (null if it was "unknown"), so the earlier choice shows as selected. The learner must confirm or skip again to move on; that overwrites the old answer. |
| `finish()` | Called when the checking screen ends: go to `results`. |
| `retake()` | A fresh attempt like `start()` (`attempt + 1`, fresh shuffle), but straight to the first `sectionBreak`: no second briefing; `accepted` stays true. |
| `goHome()` | Go to `landing`. If the quiz was finished, clear the saved session. |

### 10.2 Saving and restoring (`sessionStorage`, key `examReady.v1`)

Saved after every action:

```js
{
  v: 1,
  questionIds: ["v1", ..., "r5"],   // to detect changed content
  attempt, index, answers,
  optionOrders: { v1: [2,0,3,1], ... },
  screen,                            // "briefing" | "sectionBreak" | "question" | "checking" | "results"
  accepted,                          // the briefing's seatbelt pledge (true once fastened)
}
```

On page load:
- Nothing saved, or `v` is different, or `questionIds` don't match the current `QUESTIONS` → ignore and clear it.
- Saved `screen` is `"briefing"` → nothing to resume: the landing page, no banner (the learner presses Start again).
- Saved `screen` is `"sectionBreak"` or `"question"` → show the landing page with the **resume banner** (`landing.resumeText`). "Continue" restores and returns to the saved question; "Start over" clears and stays on landing.
- Saved `screen` is `"checking"` or `"results"` → recompute the result from the saved answers and show the results page directly.
- The result is never stored; it is always recomputed.

### 10.3 Things that must never happen

- Scoring with display positions instead of original indexes.
- A "sure" or "guessed" answer with `choice: null`.
- Reaching results with fewer than 15 entries in `answers` (any missing entry is filled as unknown before scoring, and this is logged as a warning in development).
- Two clicks on "I'm sure" saving twice or skipping a question: ignore input while a question transition is running.

---

## 11. Text helper

`fill(template, values)` replaces every `{name}` in a string with `values.name`.
- In development, throw if a placeholder has no value. In production, leave it as is.
- Numbers are inserted as plain integers (no thousands separator needed; everything is ≤ 100).
- Placeholder sources are listed in `CONTENT.md` §9.

---

## 12. Debug presets (`src/logic/presets.js`)

Each preset is a full `answers` object (original indexes). `S` = sure and right, `G` = guessed and right, `X` = sure and wrong, `W` = guessed and wrong, `U` = unknown. For `X` and `W`, use any wrong option (for example the first index that isn't the answer).

Correct answers for reference: v1 1 · v2 2 · v3 1 · v4 1 · v5 1 · g1 1 · g2 2 · g3 1 · g4 0 · g5 2 · r1 1 · r2 0 · r3 1 · r4 1 · r5 0.

| Preset | v1 v2 v3 v4 v5 | g1 g2 g3 g4 g5 | r1 r2 r3 r4 r5 |
|---|---|---|---|
| `perfect` | S S S S S | S S S S S | S S S S S |
| `ready` | S S G S S | S X S S S | S S S W S |
| `almostOverall` | S S G S U | S W S G S | S S S U G |
| `almostWeakest` | S S S S S | S S S S S | S S G X W |
| `notYetOverall` | S S U U U | S X S W U | S S U U U |
| `notYetWeakest` | S S S S S | S S S S S | S G X X X |
| `luckyGuesser` | G G G G G | G G G G G | G G G G G |
| `allUnknown` | U U U U U | U U U U U | U U U U U |

---

## 13. Test cases (`tests/scoring.test.js`)

Each preset must produce exactly these results.

| Preset | Vocab | Gram. | Read. | Overall | Verdict | blockedBy | Weakest | Recommendations (in order) | Lucky (count/correct, warn) |
|---|---|---|---|---|---|---|---|---|---|
| `perfect` | 100 | 100 | 100 | 100 | ready | null | reading | none | 0/15, no |
| `ready` | 90 | 70 | 80 | 80 | ready | null | grammar | accusative (sureWrong), readingSigns (guessedWrong), numbers (guessedRight) | 1/13, no |
| `almostOverall` | 70 | 70 | 70 | 70 | almost | overall | reading | readingSigns (unknown), time (unknown), accusative (guessedWrong) | 3/12, no |
| `almostWeakest` | 100 | 100 | 40 | 76 | almost | weakestSkill | reading | readingSigns (sureWrong), readingAds (guessedRight) | 1/13, no |
| `notYetOverall` | 40 | 30 | 40 | 37 | notYet | overall | grammar | readingSigns (unknown), accusative (sureWrong), modals (guessedWrong) | 0/6, no |
| `notYetWeakest` | 100 | 100 | 0 | 60 | notYet | weakestSkill | reading | readingSigns (sureWrong), readingAds (sureWrong), readingMessages (guessedRight) | 1/12, no |
| `luckyGuesser` | 50 | 50 | 50 | 50 | notYet | overall | reading | readingMessages (guessedRight), readingSigns (guessedRight), time (guessedRight) | 15/15, **yes** |
| `allUnknown` | 0 | 0 | 0 | 0 | notYet | overall | reading | readingMessages (unknown), readingSigns (unknown), time (unknown) | 0/0, no |

How the trickier rows are worked out:
- **`ready`:** pains are accusative 3, readingSigns 2 (r4 wrong + r5 sure right), numbers 1 → sorted by pain.
- **`almostOverall`:** readingSigns = r4 unknown (2) + r5 guessed right (1) = 3. Then time (v5 unknown, 2) and accusative (g2 guessed wrong, 2) tie on pain 2, on skill score (70 = 70) and on weight (0.3 = 0.3), so first appearance decides: v5 comes before g2. modals (g4, 1), numbers (v3, 1) and readingSigns are below. readingSigns' reason is `unknown` because unknown ranks above guessedRight.
- **`notYetOverall`:** readingSigns 4 (r4 + r5 unknown), accusative 3 (sureWrong). Then six topics tie on pain 2; grammar (30, lowered by g2's −½) is now the weakest skill, so its first pain-2 topic, modals (g4, guessed wrong), wins.
- **`luckyGuesser`:** topics with two questions (time, readingMessages, readingSigns) have pain 2, the rest 1. All skills are 50, so weight decides: the two reading topics first (readingMessages appears before readingSigns), then time.
- **`allUnknown`:** the same three two-question topics have pain 4; same tie-breaks.
- **Weakest skill** is "reading" in most rows (strictly lowest, or tied and winning on weight, §4.3); in `ready` and `notYetOverall` g2's sure-wrong −½ makes grammar the lowest.

### Boundary tests (build these answer sets inside the test file)

| Answers | Skills (V / G / R) | Overall | Expected |
|---|---|---|---|
| V all S; G: 3 S + 1 G + 1 U; R: 3 S + 2 U | 100 / 70 / 60 | 75 | **ready** (both exactly on the line) |
| V: 4 S + 1 G; G: 4 S + 1 G; R: 2 S + 1 G + 2 U | 90 / 90 / 50 | 74 | almost, blockedBy `overall` (one point short) |
| V: 3 S + 1 G + 1 U; G: 3 S + 2 U; R: 2 S + 3 U | 70 / 60 / 40 | 55 | **almost** (exactly on both lower lines) |
| V: 3 S + 2 U; G: 3 S + 2 U; R: 2 S + 3 U | 60 / 60 / 40 | 52 | notYet, blockedBy `overall` |

### Other tests

- **Lucky-guess threshold:** 5 right answers of which exactly 2 are guesses → share 0.4 → **no** warning (strict `>`). 5 right with 3 guesses → share 0.6 → warning.
- **Lucky-guess minimum count:** 1 right answer, guessed → share 1.0 but count 1 → **no** warning.
- **Missing answers:** scoring `{}` gives the same result as `allUnknown`.
- **Unknown ids:** an extra `{ zz: {...} }` entry changes nothing.
- **Sure-but-wrong:** a skill with 5 sure-wrong answers scores 0, not negative (and the overall uses that 0); one sure-wrong next to four sure-right gives 70.
- **Config change:** with `credit.correctGuessed = 0.25`, `luckyGuesser` gives skills 25 / 25 / 25 and overall 25.
- **Purity:** calling `scoreCheck` twice with the same input returns deep-equal results and does not modify `answers`.

### `tests/shuffle.test.js`

- `trueFalse` and `ads` questions always get `optionOrder` `[0, 1]`.
- `choice4` / `sentence` questions get a permutation of `[0, 1, 2, 3]` (same set, length 4).
- With a seeded rng, two calls give the same orders; with different seeds, at least one 4-option question differs.
- Question order is exactly the `QUESTIONS` order.
- Mapping round trip: for every question and every display position `i`, `options[optionOrder[i]]` is the text shown, and picking position `i` stores `optionOrder[i]`. Picking the position where `optionOrder[i] === answer` scores as correct.

---

## 14. What this logic does *not* claim

Write this into the `scoring.js` header comment so reviewers see it:

- The thresholds (75 / 60 / 55 / 40), the half-credit for guesses and the weights are **starting assumptions**, not validated predictions. They were chosen from the real exam's 60% pass mark plus a safety margin, and tilted to avoid false "ready" results.
- 15 questions is a small sample; one answer moves a skill score by 20 points.
- The check measures reading directly and vocabulary/grammar as a foundation. It does not measure listening, writing or speaking, which are 75 of the 100 exam points.
- Version 2 should calibrate these numbers against real exam results from learners who took this check before their exam.
