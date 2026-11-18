// Every number that decides "ready" lives here. No other file may hard-code these.
// Source: LOGIC.md §2. These are starting assumptions, not validated predictions
// (see the header of logic/scoring.js).
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
    // A confident wrong answer costs half a point. Makes honesty the best
    // strategy: pressing "I'm sure" only pays off if you're more than 50% likely
    // to be right. Without this, "sure" had no downside.
    sureWrong: -0.5,
    guessedWrong: 0,
    unknown: 0, // "I don't know this yet"
  },

  // Both the overall score AND the weakest skill must clear the bar.
  // The real Goethe A1 pass mark is 60/100. "Ready" asks for 75 as a safety margin,
  // because this check covers only part of the exam and exam-day nerves cost marks.
  verdict: {
    ready: { minOverall: 75, minEverySkill: 60 },
    almost: { minOverall: 55, minEverySkill: 40 },
    // below "almost" = "notYet"
  },

  // Real exam pass mark, shown in text only. Not used in the verdict maths.
  examPassMark: 60,

  // How many practice topics to show on the results page.
  maxRecommendations: 3,

  // Warn when a big share of right answers were guesses.
  luckyGuess: {
    minShare: 0.4, // warn if MORE THAN 40% of correct answers were guesses …
    minCount: 2, // … and at least 2 of them were guesses
  },

  // Pain points per answer, used to rank practice topics (LOGIC.md §6).
  pain: {
    sureWrong: 3, // they believe something wrong: the most dangerous mistake
    guessedWrong: 2,
    unknown: 2,
    guessedRight: 1, // shaky knowledge
    sureRight: 0,
  },
};
