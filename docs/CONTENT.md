# CONTENT.md — "Am I exam-ready?"

> Every word the learner sees. Read `ARCHITECTURE.md` and `DESIGN.md` first.
> `DESIGN.md` refers to text by key (for example `landing.headline`); the keys are defined here.
> **Copy all text exactly**, including capitalisation, punctuation, umlauts (ä ö ü ß) and German quotation marks („ “). Do not rewrite, shorten or "improve" anything. If text is missing for something in `DESIGN.md`, ask.
>
> Text inside `{curly braces}` is a placeholder filled in by code. The value comes from `config.js` or the result object (`LOGIC.md`), never typed by hand.

This file maps to four data files:

| Section here | Goes into |
|---|---|
| §1 Sections | `src/data/sections.js` |
| §2 Questions | `src/data/questions.js` |
| §3 Topics | `src/data/topics.js` |
| §4 – §10 UI text | `src/data/messages.js` |

---

## 1. Sections (`src/data/sections.js`)

The order here is the order of the test.

```js
export const SECTIONS = [
  {
    id: "vocabulary",
    number: "01",
    en: "VOCABULARY",
    de: "WORTSCHATZ",
    name: "Vocabulary",          // used in sentences and skill bars
    blurb: "5 questions · everyday words, numbers and time",
  },
  {
    id: "grammar",
    number: "02",
    en: "GRAMMAR",
    de: "GRAMMATIK",
    name: "Grammar",
    blurb: "5 questions · the rules that cost the most marks",
  },
  {
    id: "reading",
    number: "03",
    en: "READING",
    de: "LESEN",
    name: "Reading",
    blurb: "5 questions · emails, ads and signs, like the real exam",
  },
];
```

---

## 2. Questions (`src/data/questions.js`)

### 2.1 Fields

| Field | Meaning |
|---|---|
| `id` | Unique, never changes. Answers are stored by this id. |
| `section` | `"vocabulary"`, `"grammar"` or `"reading"` |
| `topic` | A key from §3. Drives the practice recommendations. |
| `format` | `"choice4"` (4 options, shuffled), `"sentence"` (4 full-sentence options, shuffled), `"trueFalse"` (Richtig/Falsch, never shuffled), `"ads"` (a/b ads, never shuffled). See `LOGIC.md` §9. |
| `prompt` | The question, in German unless it is an instruction. Use `___` for a gap (rendered as a cobalt underline, `DESIGN.md` §7.1). |
| `hint` | Optional English help shown under the prompt. |
| `options` | Answer texts in their **original order**. |
| `answer` | Index of the correct option in the original order (0 = first). |
| `explain` | One or two sentences shown in the answer review. |
| `passage` | Reading only: the id of a passage in §2.3. |

### 2.2 The 15 questions

```js
export const QUESTIONS = [
  // ───────────── 01 VOCABULARY ─────────────
  {
    id: "v1",
    section: "vocabulary",
    topic: "family",
    format: "choice4",
    prompt: "Die Mutter von meiner Mutter ist meine ___.",
    hint: "My mother's mother is my ___.",
    options: ["Tante", "Großmutter", "Schwester", "Tochter"],
    answer: 1,
    explain: "Your mother's mother is your Großmutter (grandmother). Tante = aunt, Schwester = sister, Tochter = daughter.",
  },
  {
    id: "v2",
    section: "vocabulary",
    topic: "time",
    format: "choice4",
    prompt: "Nach Freitag kommt ___.",
    hint: "After Friday comes ___.",
    options: ["Donnerstag", "Sonntag", "Samstag", "Montag"],
    answer: 2,
    explain: "Freitag → Samstag → Sonntag.",
  },
  {
    id: "v3",
    section: "vocabulary",
    topic: "numbers",
    format: "choice4",
    prompt: "Wie schreibt man 47?",
    hint: "How do you write 47?",
    options: ["vierundsiebzig", "siebenundvierzig", "vierzigsieben", "siebzigvier"],
    answer: 1,
    explain: "German says the ones before the tens: sieben-und-vierzig (seven-and-forty). vierundsiebzig is 74.",
  },
  {
    id: "v4",
    section: "vocabulary",
    topic: "places",
    format: "choice4",
    prompt: "Wo kauft man Medikamente?",
    hint: "Where do you buy medicine?",
    options: ["in der Bäckerei", "in der Apotheke", "am Bahnhof", "in der Post"],
    answer: 1,
    explain: "Apotheke = pharmacy. Bäckerei = bakery, Bahnhof = station, Post = post office.",
  },
  {
    id: "v5",
    section: "vocabulary",
    topic: "time",
    format: "choice4",
    prompt: "Es ist 7:30 Uhr. Man sagt: „Es ist ___.“",
    hint: "It's 7:30. You say: “It's ___.”",
    options: ["halb sieben", "halb acht", "Viertel vor acht", "Viertel nach sieben"],
    answer: 1,
    explain: "halb acht = half on the way to eight = 7:30. halb sieben would be 6:30.",
  },

  // ───────────── 02 GRAMMAR ─────────────
  {
    id: "g1",
    section: "grammar",
    topic: "conjugation",
    format: "choice4",
    prompt: "Wir ___ aus Indien.",
    hint: "We come from India.",
    options: ["kommt", "kommen", "kommst", "komme"],
    answer: 1,
    explain: "With wir, the verb ends in -en: wir kommen.",
  },
  {
    id: "g2",
    section: "grammar",
    topic: "accusative",
    format: "choice4",
    prompt: "Ich habe ___ Bruder.",
    hint: "I have a brother.",
    options: ["ein", "eine", "einen", "einem"],
    answer: 2,
    explain: "Bruder is masculine (der Bruder). After haben it takes the accusative: einen Bruder.",
  },
  {
    id: "g3",
    section: "grammar",
    topic: "wordOrder",
    format: "sentence",
    prompt: "Welcher Satz ist richtig?",
    hint: "Which sentence is correct?",
    options: [
      "Morgen ich gehe ins Kino.",
      "Morgen gehe ich ins Kino.",
      "Morgen ich ins Kino gehe.",
      "Gehe morgen ich ins Kino.",
    ],
    answer: 1,
    explain: "The verb always comes second. If the sentence starts with Morgen, the verb comes next, then ich.",
  },
  {
    id: "g4",
    section: "grammar",
    topic: "modals",
    format: "choice4",
    prompt: "Ich ___ heute nicht kommen. Ich bin krank.",
    hint: "I can't come today. I'm ill.",
    options: ["kann", "kannst", "können", "könnt"],
    answer: 0,
    explain: "ich kann, du kannst, wir können, ihr könnt. The main verb (kommen) goes to the end.",
  },
  {
    id: "g5",
    section: "grammar",
    topic: "wQuestions",
    format: "choice4",
    prompt: "___ wohnst du? – In Berlin.",
    hint: "___ do you live? – In Berlin.",
    options: ["Wer", "Was", "Wo", "Wann"],
    answer: 2,
    explain: "The answer is a place, so the question word is Wo (where). Wer = who, Was = what, Wann = when.",
  },

  // ───────────── 03 READING ─────────────
  {
    id: "r1",
    section: "reading",
    topic: "readingMessages",
    format: "trueFalse",
    passage: "emailTom",
    prompt: "Tom kommt am Samstag zur Party.",
    hint: "Tom is coming to the party on Saturday.",
    options: ["Richtig", "Falsch"],
    answer: 1,
    explain: "„Leider kann ich am Samstag nicht … kommen“: he can't come on Saturday.",
  },
  {
    id: "r2",
    section: "reading",
    topic: "readingMessages",
    format: "trueFalse",
    passage: "emailTom",
    prompt: "Tom möchte Anna am Sonntag treffen.",
    hint: "Tom would like to meet Anna on Sunday.",
    options: ["Richtig", "Falsch"],
    answer: 0,
    explain: "„Am Sonntag habe ich Zeit. Wollen wir zusammen Kaffee trinken?“: yes, he suggests Sunday.",
  },
  {
    id: "r3",
    section: "reading",
    topic: "readingAds",
    format: "ads",
    passage: "adsCourse",
    prompt: "Sie arbeiten von Montag bis Freitag. Sie möchten einen Deutschkurs machen. Welche Anzeige passt?",
    hint: "You work Monday to Friday. You want to take a German course. Which ad fits?",
    options: ["a", "b"],            // the options are the two ads in the passage
    answer: 1,
    explain: "You work on weekdays, so you need the weekend course. Wochenende = weekend.",
  },
  {
    id: "r4",
    section: "reading",
    topic: "readingSigns",
    format: "trueFalse",
    passage: "signDoctor",
    prompt: "Sie können am Mittwoch um 16 Uhr zum Arzt gehen.",
    hint: "You can go to the doctor on Wednesday at 4 pm.",
    options: ["Richtig", "Falsch"],
    answer: 1,
    explain: "Afternoon hours are only on Dienstag and Donnerstag. On Mittwoch the practice is open only until 12:00.",
  },
  {
    id: "r5",
    section: "reading",
    topic: "readingSigns",
    format: "trueFalse",
    passage: "boardTrain",
    prompt: "Der Zug nach München fährt heute später.",
    hint: "The train to Munich leaves later today.",
    options: ["Richtig", "Falsch"],
    answer: 0,
    explain: "Verspätung = delay. The train leaves about 20 minutes late.",
  },
];
```

### 2.3 Passages (also in `src/data/questions.js`, exported as `PASSAGES`)

```js
export const PASSAGES = {
  emailTom: {
    type: "email",
    formatLabel: "TEIL 1 · E-MAIL",
    from: "Tom",
    to: "an Anna",
    time: "Do, 18:42",
    subject: "Deine Party",
    body:
      "Hallo Anna,\n\n" +
      "leider kann ich am Samstag nicht zu deiner Party kommen. Meine Eltern besuchen mich.\n\n" +
      "Aber am Sonntag habe ich Zeit. Wollen wir zusammen Kaffee trinken?\n\n" +
      "Liebe Grüße\nTom",
    // Shown in the notification state before the email expands (DESIGN.md §7.6)
    preview: "leider kann ich am Samstag nicht zu deiner Party kommen …",
  },

  adsCourse: {
    type: "ads",
    formatLabel: "TEIL 2 · ANZEIGEN",
    ads: [
      {
        badge: "a",
        title: "Deutschkurs A1",
        lines: ["Montag bis Freitag, 9 bis 13 Uhr", "Volkshochschule Mitte"],
      },
      {
        badge: "b",
        title: "Deutsch am Wochenende",
        lines: ["Samstag und Sonntag, 10 bis 15 Uhr", "Sprachschule Lingua"],
      },
    ],
  },

  signDoctor: {
    type: "sign",
    formatLabel: "TEIL 3 · SCHILD",
    title: "Praxis Dr. Weber",
    subtitle: "Allgemeinmedizin",
    heading: "Sprechzeiten",
    lines: [
      { days: "Montag – Freitag", times: "8:00 – 12:00" },
      { days: "Dienstag + Donnerstag", times: "15:00 – 18:00" },
    ],
  },

  boardTrain: {
    type: "board",
    formatLabel: "TEIL 3 · ANZEIGE AM BAHNHOF",
    rows: [
      { text: "GLEIS 3", tone: "normal" },
      { text: "ICE 14:10 MÜNCHEN", tone: "normal" },
      { text: "CA. 20 MIN VERSPÄTUNG", tone: "alert" },
    ],
    // Screen-reader text for the whole board (the flap cells are aria-hidden)
    srText: "Gleis 3. ICE 14:10 nach München. Circa 20 Minuten Verspätung.",
  },
};
```

---

## 3. Topics (`src/data/topics.js`)

Each question has one topic. Recommendations show the `label` and the `tip`.

```js
export const TOPICS = {
  family: {
    label: "Family words",
    tip: "Learn family words in pairs: Mutter / Vater, Bruder / Schwester, Oma / Opa. Draw your own family tree and label everyone in German.",
  },
  time: {
    label: "Days and clock time",
    tip: "„halb acht“ means 7:30, not 8:30. It's half on the way to eight. For one day, say the time out loud in German every time you check your phone.",
  },
  numbers: {
    label: "Numbers 21–99",
    tip: "German says the ones before the tens: 47 = sieben-und-vierzig. Practise with prices and phone numbers. The listening part uses them all the time.",
  },
  places: {
    label: "Everyday places",
    tip: "List 10 places (Apotheke, Bäckerei, Bahnhof, Post …) and write one sentence for each: „In der Apotheke kaufe ich …“",
  },
  conjugation: {
    label: "Verb endings (ich, du, wir …)",
    tip: "Drill the regular pattern with 5 verbs: ich -e, du -st, er/sie -t, wir -en, ihr -t, sie/Sie -en. Then learn sein and haben separately.",
  },
  accusative: {
    label: "Accusative articles (einen, den)",
    tip: "Only masculine words change: der → den, ein → einen. Write 10 sentences with „Ich habe …“ or „Ich möchte …“ and a masculine noun.",
  },
  wordOrder: {
    label: "Verb in second position",
    tip: "Start 5 sentences with a time word (Heute, Morgen, Am Montag) and put the verb straight after it: „Heute gehe ich …“. You'll need this in writing and speaking too.",
  },
  modals: {
    label: "Modal verbs (können, müssen …)",
    tip: "The modal verb goes second, the main verb goes to the very end and doesn't change: „Ich kann heute nicht kommen.“ Practise ich / du forms: kann / kannst, muss / musst.",
  },
  wQuestions: {
    label: "Question words (Wo, Wer, Wann …)",
    tip: "Pair each question word with the kind of answer it gets: Wo? → a place, Wann? → a time, Wer? → a person. In the speaking exam you have to ask questions, not only answer them.",
  },
  readingMessages: {
    label: "Reading short emails and notes",
    tip: "Read the statement first, then find the exact line in the text that proves it. Watch for small words that flip the meaning: nicht, kein, leider, aber.",
  },
  readingAds: {
    label: "Matching ads to a need",
    tip: "Underline the one key detail in the situation (weekend? price? place?) and check only that detail in each ad. Ignore everything else.",
  },
  readingSigns: {
    label: "Reading signs and notices",
    tip: "Signs are all about days, times and exceptions. Practise reading opening hours and notices: Mo – Fr, geschlossen, nur, außer, Verspätung.",
  },
};
```

---

## 4. Brand, page and shared text (`src/data/messages.js`)

```js
brand: {
  wordmark: "EXAM·READY",          // the "·" is drawn as a small cobalt dot (DESIGN.md §5.1)
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

// Sun/moon theme button (aria-label + tooltip): what pressing it will do.
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
```

---

## 5. Landing page

```js
landing: {
  navHowItWorks: "How it works",

  overline: "GOETHE · ÖSD · A1 READINESS CHECK",
  headline: ["AM I", "EXAM", "READY?"],          // one array item per line
  lede: "A 6-minute check in the real exam style. Find out how ready you are, skill by skill, and what to practise before you pay for the exam.",

  ctaStart: "START THE CHECK",                    // the "→" is added by the button component
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
      body: "Be honest. Lucky guesses don't help you on exam day, so we count them for less.",
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
```

---

## 5b. Safety briefing (`src/data/messagesBriefing.js`)

Shown once per check, between the landing page's Start and the Vocabulary section break (Retake and Resume skip it). The panel illustrations that show UI reuse existing text: the section names (`SECTIONS[].de`), `question.sure` and `question.unknown`.

```js
briefing: {
  label: "SAFETY BRIEFING · FLIGHT GL-A1 · DEL → BER",
  title: "BEFORE TAKE-OFF",
  intro: "Please read before take-off. It takes 30 seconds.",

  // In this order; the number (01–06) comes from the position.
  panels: [
    { id: "route", title: "Your route", text: "15 questions in 3 parts. About 6 minutes, no timer." },
    { id: "answer", title: "How to answer", text: "Pick an answer, then say how sure you are." },
    { id: "guess", title: "Guesses count half", text: "A right guess earns half a point. Luck doesn’t help on exam day." },
    { id: "unknown", title: "Don’t know? Say so", text: "An honest result is more useful than a lucky one." },
    { id: "noHelp", title: "No help on board", text: "No dictionary, no translator, no asking a friend." },
    { id: "back", title: "You can go back", text: "Change any answer with Back. Your progress is saved if you refresh." },
  ],

  seatbeltSign: "FASTEN SEATBELT",
  pledge: "I’ll answer on my own, without a dictionary or translator, and I’ll be honest when I’m guessing.", // also the checkbox label
  takeOff: "TAKE OFF",          // primary button, "→" added like every primary button
  takeOffHint: "Fasten your seatbelt to take off", // shown + aria-describedby while TAKE OFF is disabled
  back: "Back",                 // text button, back to the landing page
},
```

---

## 6. Section break and question screen

```js
sectionBreak: {
  counter: "{number} / 03",          // e.g. "01 / 03"
  skip: "Skip →",
},

question: {
  label: "{sectionNumber} / {sectionEn} · Q{n} OF {total}",   // e.g. "01 / VOCABULARY · Q4 OF 15"
  back: "Back",
  sure: "I'M SURE",
  guessed: "I GUESSED",
  unknown: "I don't know this yet",
  keyHints: { sure: "S", guessed: "G", unknown: "D" },
  disabledHelp: "Choose an answer first",     // tooltip / aria-describedby on the disabled buttons
  optionsAria: "Answer options",
  trueFalse: { true: "Richtig", false: "Falsch", keyTrue: "R", keyFalse: "F" },
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
```

---

## 7. Checking screen

```js
checking: {
  title: "CHECKING YOUR ANSWERS",
  lines: [
    { section: "vocabulary", label: "VOCABULARY" },
    { section: "grammar", label: "GRAMMAR" },
    { section: "reading", label: "READING" },
  ],
},
```

---

## 8. Results page

### 8.1 Verdict block

The reason sentence depends on the verdict **and** on what held the learner back (`result.blockedBy`, see `LOGIC.md`). Pick the template by these two values.

```js
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
```

### 8.2 Skills, warning, dots

```js
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
```

### 8.3 Practice recommendations

```js
  practiceTitle: "PRACTISE THESE BEFORE YOU BOOK",
  practiceNone: "Nothing stood out. You were sure and right on every question. Spend your practice time on listening and speaking.",
  reason: {
    sureWrong: "YOU WERE SURE, BUT IT WAS WRONG",
    wrong: "YOU GOT THIS WRONG",
    unknown: "YOU DIDN'T KNOW THIS YET",
    guessed: "YOU GUESSED THIS ONE",
  },
```

### 8.4 What this check can't see

```js
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
```

### 8.5 Review, method, actions

```js
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
    "Each answer earns points: {creditSure} if you were sure and right, {creditGuessed} if you guessed and got it right, and 0 if it was wrong or you didn't know.",
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
```

---

## 9. Placeholders

| Placeholder | Source |
|---|---|
| `{overall}` | `result.overall` |
| `{weakestName}`, `{weakestScore}` | `SECTIONS[result.weakestSkill].name`, `result.skills[result.weakestSkill].score` |
| `{scoreVocabulary}`, `{scoreGrammar}`, `{scoreReading}` | `result.skills.<id>.score` |
| `{correct}`, `{total}` (skill row) | `result.skills.<id>.correct`, `.total` |
| `{guessedRight}`, `{correctTotal}` | `result.luckyGuesses.count`, `result.luckyGuesses.correctTotal` |
| `{readyMin}`, `{readySkill}` | `config.verdict.ready.minOverall`, `.minEverySkill` |
| `{almostMin}`, `{almostSkill}` | `config.verdict.almost.minOverall`, `.minEverySkill` |
| `{passMark}` | `config.examPassMark` |
| `{creditSure}`, `{creditGuessed}` | `config.credit.correctSure`, `.correctGuessed` |
| `{weightReading}` etc. | `config.skillWeights.<id> × 100` |
| `{stamp}` | `results.verdict[result.verdict].stamp` |
| `{status}` | `results.ticket.status[result.verdict]` (boarding-pass status word) |
| `{practiceList}` | recommendation labels |
| `{n}`, `{total}` (questions) | current position (1-based), number of questions |
| `{number}`, `{sectionNumber}`, `{sectionEn}` | from `SECTIONS` |
| `{topicLabel}` | `TOPICS[topic].label` |
| `{url}` | `location.origin + location.pathname` |

Write one small helper, `fill(template, values)`, that replaces `{name}` with `values.name`. Throw an error in development if a placeholder has no value.

---

## 10. Writing rules (for any text added later)

- Plain, short sentences. The learner is a beginner in German and may not be a native English speaker.
- Speak to the learner as "you".
- Every verdict ends with a next action, never just a label.
- Never promise a pass. Say "ready to book", never "you will pass".
- German text: correct umlauts and ß, German quotation marks „ “, and `lang="de"` on the element.
- No emoji, no exclamation marks, no jokes about failing.
