// All UI text that is not a question, section or topic (CONTENT.md §4–§7).
// Results-page text (CONTENT.md §8) lives in messagesResults.js and the safety
// briefing (CONTENT.md §5b) in messagesBriefing.js, to keep files short; all are
// merged into one MESSAGES object here, so screens import only this file.
// Text inside {braces} is filled by logic/fill.js; never type those values by hand.
import { RESULTS_MESSAGES } from "./messagesResults.js";
import { BRIEFING_MESSAGES } from "./messagesBriefing.js";

export const MESSAGES = {
  brand: {
    wordmark: "EXAM·READY", // the "·" is drawn as a small cobalt dot (DESIGN.md §5.1)
    tag: "A1 GERMAN",
  },

  page: {
    title: "Am I exam-ready? · A1 German readiness check",
    description: "A 6-minute check that tells you if you're ready to book your Goethe or ÖSD A1 German exam, and what to practise first.",
  },

  globe: {
    labelFrom: "INDIA",
    labelTo: "GERMANY",
  },

  // Sun/moon button (CONTENT.md §4). Says what pressing it will do.
  theme: {
    toDark: "Switch to dark mode",
    toLight: "Switch to light mode",
  },

  journey: {
    from: "INDIA",
    to: "GERMANY",
    fromShort: "IN",
    toShort: "DE",
    ariaLabel: "Progress: question {n} of {total}",
  },

  // ───────────── §5 Landing ─────────────
  landing: {
    navHowItWorks: "How it works",

    overline: "GOETHE · ÖSD · A1 READINESS CHECK",
    headline: ["AM I", "EXAM", "READY?"], // one array item per line
    lede: "A 6-minute check in the real exam style. Find out how ready you are, skill by skill, and what to practise before you pay for the exam.",

    ctaStart: "START THE CHECK", // the "→" is added by the button component
    ctaHow: "HOW IT WORKS",

    // Meta line. Numbers count up (DESIGN.md §5.3); keep them as separate parts.
    meta: [
      { value: 15, text: "QUESTIONS" },
      { prefix: "~", value: 6, text: "MIN" },
      { value: 3, text: "SKILLS" },
      { text: "FREE, NO SIGN-UP" },
    ],

    resumeText: "You have a check in progress (question {n} of {total}).",
    resumeYes: "Continue",
    resumeNo: "Start over",

    whyTitle: "WHY CHECK FIRST",
    whyBody: "The Goethe A1 exam costs around ₹9,000, and it isn't modular. If you fail, you pay again and retake all four parts. Six minutes now can save you weeks.",

    howTitle: "HOW IT WORKS",
    howSteps: [
      {
        number: "01",
        title: "Answer 15 short questions",
        body: "Vocabulary, grammar and reading, in the same style as the real Goethe A1 exam.",
      },
      {
        number: "02",
        title: "Say if you're sure or guessing",
        body: "Be honest. A right guess earns half a point, and being sure but wrong costs half a point.",
        previewSure: "I'M SURE",
        previewGuessed: "I GUESSED",
      },
      {
        number: "03",
        title: "Get your answer",
        body: "See how ready you are in each skill, and the 2–3 things to practise before you book.",
      },
    ],

    sampleTag: "EXAMPLE",
    sampleTitle: "What you'll get",
    sampleBody: "A clear verdict, a score for each skill, and practice tips based on your own mistakes.",
    // The mini result in the sample card. Fixed example values; consistent with LOGIC.md.
    sample: {
      stamp: "ALMOST",
      verdict: "almost",
      overall: 61,
      skills: [
        { name: "Vocabulary", score: 80 },
        { name: "Grammar", score: 70 },
        { name: "Reading", score: 40 },
      ],
      practiceLine: "Practise first: Reading signs and notices",
    },

    coverageNote: "This check covers reading, vocabulary and grammar. The real exam also tests listening, writing and speaking. Your result shows you how to check those yourself.",

    footer: "Prototype built for the Globio Founder's Office assignment · Not affiliated with the Goethe-Institut or ÖSD",

    // Optional (DESIGN.md §5.3)
    floatingWords: ["Hallo", "Danke", "Bahnhof", "Apotheke", "halb acht"],
  },

  // ───────────── §5b Safety briefing (messagesBriefing.js) ─────────────
  ...BRIEFING_MESSAGES,

  // ───────────── §6 Section break and question screen ─────────────
  sectionBreak: {
    counter: "{number} / 03", // e.g. "01 / 03"
    skip: "Skip →",
  },

  question: {
    label: "{sectionNumber} / {sectionEn} · Q{n} OF {total}", // e.g. "01 / VOCABULARY · Q4 OF 15"
    back: "Back",
    sure: "I'M SURE",
    guessed: "I GUESSED",
    unknown: "I don't know this yet",
    keyHints: { sure: "S", guessed: "G", unknown: "D" },
    disabledHelp: "Choose an answer first", // tooltip / aria-describedby on the disabled buttons
    optionsAria: "Answer options",
    trueFalse: { true: "Richtig", false: "Falsch", keyTrue: "R", keyFalse: "F" },

    // In-flight cockpit (DESIGN.md §7.7). {nn} = question number "01"–"15";
    // {sectionDe} = SECTIONS[].de of the current section.
    ticket: "FLIGHT GL-A1 · SEAT Q{nn} · GATE {sectionDe}",
    confidenceLabel: "HOW SURE ARE YOU?", // above the buttons; "Choose an answer first" (disabledHelp) until an option is picked
    // Sub-lines of the two main buttons; points from config.js (0.5 shows as "½").
    sureSub: "I know this · {creditSure} point, {creditSureWrong} if wrong",
    guessedSub: "Lucky guess · {creditGuessed} point, nothing lost",
    routeTitle: "YOUR ROUTE",
    routeFooter: "{total} QUESTIONS · NO TIMER",
    topicTitle: "TOPIC",
    examTitle: "IN THE REAL EXAM",
  },

  reading: {
    // The passage's own formatLabel (§2.3) is shown above it. These are the screen-reader labels.
    passageAria: {
      email: "E-mail",
      ads: "Two ads",
      sign: "Sign on a door",
      board: "Display board at a train station",
    },
  },

  // ───────────── §7 Checking screen ─────────────
  checking: {
    title: "CHECKING YOUR ANSWERS",
    lines: [
      { section: "vocabulary", label: "VOCABULARY" },
      { section: "grammar", label: "GRAMMAR" },
      { section: "reading", label: "READING" },
    ],
  },

  // ───────────── §8 Results page ─────────────
  ...RESULTS_MESSAGES,
};
