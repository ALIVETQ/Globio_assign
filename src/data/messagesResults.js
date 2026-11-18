// Results-page text (CONTENT.md §8). Merged into MESSAGES by messages.js.
// The reason sentence is picked by verdict AND result.blockedBy (LOGIC.md §5).
export const RESULTS_MESSAGES = {
  results: {
    label: "YOUR RESULT",

    verdict: {
      ready: {
        stamp: "READY TO BOOK",
        reason: "You scored {overall}%, and every skill is at {readySkill}% or more.",
        next: "Go ahead and book. Keep practising listening and speaking, because this check can't see those.",
      },
      almost: {
        stamp: "ALMOST",
        reasonOverall: "You scored {overall}%. That's close, but we look for {readyMin}% before you book, because this check only sees part of the exam.",
        reasonWeakest: "Your overall score is good, but {weakestName} is at {weakestScore}%. One weak area can cost you the whole exam.",
        next: "Spend a week on the topics below, then take the check again before you book.",
      },
      notYet: {
        stamp: "NOT YET",
        reasonOverall: "You scored {overall}%. The real exam needs {passMark}%, and this check only covers part of it.",
        reasonWeakest: "{weakestName} is at {weakestScore}%. The A1 exam isn't modular, so one weak area can mean retaking the whole thing.",
        next: "Not yet, and that's fine. Booking now would likely cost you the fee twice. Work on the topics below for 2–3 weeks, then check again.",
      },
    },

    readyLine: "READY {readyMin}",
    almostLine: "ALMOST {almostMin}",
    passMarkNote: "THE REAL PASS MARK IS {passMark}. WE ASK FOR {readyMin} TO GIVE YOU A SAFETY MARGIN.",

    journeyCaption: "{overall}% OF THE WAY TO GERMANY",
    journeyCaptionReady: "ARRIVED · READY TO BOOK",

    // Boarding pass (DESIGN.md §9.2), New Delhi → Berlin. Decorative: the whole
    // ticket is aria-hidden and screen readers get `srText` instead.
    ticket: {
      airline: "GLOBIO",
      title: "BOARDING PASS",
      from: { code: "DEL", city: "New Delhi, India" },
      to: { code: "BER", city: "Berlin, Germany" },
      fields: [
        { label: "PASSENGER", value: "A1 LEARNER" },
        { label: "FLIGHT", value: "GL-A1" },
        { label: "GATE", value: "GOETHE / ÖSD" },
        { label: "READINESS", value: "{overall}%" },
        { label: "CLASS", value: "A1" },
      ],
      statusLabel: "STATUS",
      status: { ready: "BOARDING", almost: "WAITLISTED", notYet: "ON HOLD" },
      stubRoute: "DEL → BER",
      notReal: "Not a real ticket",
      srText: "Boarding pass, New Delhi to Berlin. Status: {status}. Readiness {overall} percent.",
    },

    // §8.2 Skills, warning, dots
    skillsTitle: "YOUR SKILLS",
    skillLine: "{readySkill}% LINE",
    skillRight: "{correct}/{total} right",

    luckyWarning: "{guessedRight} of your {correctTotal} correct answers were guesses. Your real level may be lower than this score.",

    dotsTitle: "HOW SURE WERE YOU?",
    dotsSubtitle: "Each dot is one question. Right answers you guessed count for less, and wrong answers you were sure about matter most.",
    dots: {
      sureRight: "SURE AND RIGHT",
      guessedRight: "GUESSED AND RIGHT",
      sureWrong: "SURE BUT WRONG",
      notKnown: "GUESSED WRONG OR DIDN'T KNOW",
    },
    dotTooltip: "Q{n} · {topicLabel}",

    // §8.3 Practice recommendations
    practiceTitle: "PRACTISE THESE BEFORE YOU BOOK",
    practiceNone: "Nothing stood out. You were sure and right on every question. Spend your practice time on listening and speaking.",
    reason: {
      sureWrong: "YOU WERE SURE, BUT IT WAS WRONG",
      wrong: "YOU GOT THIS WRONG",
      unknown: "YOU DIDN'T KNOW THIS YET",
      guessed: "YOU GUESSED THIS ONE",
    },

    // §8.4 What this check can't see
    coverageTitle: "WHAT THIS CHECK CAN'T SEE",
    coverageIntro: "The real exam has four parts, each worth 25 of the 100 points. This check tests reading directly; vocabulary and grammar sit underneath the other three. Try these self-checks before you book.",
    coveragePoints: "25 POINTS",
  },

  coverage: {
    lesen: {
      title: "Reading · Lesen",
      body: "Tested in this check.",
    },
    hoeren: {
      title: "Listening · Hören",
      body: "Can you catch a time, a price or a phone number in a slow phone message after hearing it twice?",
    },
    schreiben: {
      title: "Writing · Schreiben",
      body: "Can you fill in a simple form, and write about 30 words to a friend: cancel a plan, give a reason, suggest another day?",
    },
    sprechen: {
      title: "Speaking · Sprechen",
      body: "Can you introduce yourself for one minute without notes: Name, Alter, Land, Wohnort, Sprachen, Beruf, Hobby?",
    },
  },

  // §8.5 Review, method, actions
  review: {
    title: "REVIEW YOUR ANSWERS",
    count: "{total} QUESTIONS",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    noAnswer: "No answer",
    chip: { sure: "SURE", guessed: "GUESSED", unknown: "DIDN'T KNOW" },
    srCorrect: "Correct",
    srWrong: "Wrong",
  },

  method: {
    title: "HOW WE CALCULATE “READY”",
    paragraphs: [
      "Each answer earns points: {creditSure} if you were sure and right, {creditGuessed} if you guessed and got it right, {creditSureWrong} if you were sure but wrong, and 0 if you guessed wrong or didn’t know. A confident mistake costs points because it’s the kind of mistake you won’t go back and fix before the exam.",
      "Each skill is scored out of 100. Your overall score counts Reading for {weightReading}%, Vocabulary for {weightVocabulary}% and Grammar for {weightGrammar}%. Reading counts most because it's the only part that matches a real exam section directly.",
      "Ready to book means {readyMin}% or more overall and at least {readySkill}% in every skill. The real pass mark is {passMark}%, but we ask for more because this check only sees part of the exam.",
      "Almost means {almostMin}% or more overall and at least {almostSkill}% in every skill. Anything lower is Not yet.",
      "Why every skill has to clear a line: the Goethe A1 exam isn't modular. One weak area can mean paying for and retaking the whole exam.",
      "Practice topics are ranked: wrong answers you were sure about come first, then wrong answers and things you didn't know, then right answers you guessed.",
    ],
  },

  actions: {
    retake: "TAKE THE CHECK AGAIN",
    home: "BACK TO START",
    copy: "Copy my result",
    copied: "Copied to clipboard",
    copyFailed: "Couldn't copy. Please select the text and copy it yourself.",
  },

  // Text copied by "Copy my result". Lines joined with "\n".
  // {practiceList} = the recommendation labels joined with ", " (or "nothing major" if empty).
  summary: [
    "My A1 German readiness check: {stamp} ({overall}%)",
    "Vocabulary {scoreVocabulary}% · Grammar {scoreGrammar}% · Reading {scoreReading}%",
    "Practise next: {practiceList}",
    "{url}",
  ],
  // {practiceList} when there are no recommendations (CONTENT.md §8.5, comment above `summary`).
  summaryNone: "nothing major",
};
