// Practice topics (CONTENT.md §3). Every question has one topic; the results
// page ranks topics by "pain" (LOGIC.md §6) and shows `label` + `tip`.
// `examLink` (one line) says where the topic matters in the real exam; it is
// shown in the question screen's topic card on desktop (DESIGN.md §7.7).
export const TOPICS = {
  family: {
    label: "Family words",
    tip: "Learn family words in pairs: Mutter / Vater, Bruder / Schwester, Oma / Opa. Draw your own family tree and label everyone in German.",
    examLink: "You’ll need these in Sprechen Teil 1, when you talk about yourself and your family.",
  },
  time: {
    label: "Days and clock time",
    tip: "„halb acht“ means 7:30, not 8:30. It's half on the way to eight. For one day, say the time out loud in German every time you check your phone.",
    examLink: "Times and days come up in almost every Hören task: appointments, trains, opening hours.",
  },
  numbers: {
    label: "Numbers 21–99",
    tip: "German says the ones before the tens: 47 = sieben-und-vierzig. Practise with prices and phone numbers. The listening part uses them all the time.",
    examLink: "Hören is full of numbers: prices, phone numbers, times. You hear each recording only once or twice.",
  },
  places: {
    label: "Everyday places",
    tip: "List 10 places (Apotheke, Bäckerei, Bahnhof, Post …) and write one sentence for each: „In der Apotheke kaufe ich …“",
    examLink: "Lesen Teil 2 and 3 are full of everyday places: signs, ads and notices.",
  },
  conjugation: {
    label: "Verb endings (ich, du, wir …)",
    tip: "Drill the regular pattern with 5 verbs: ich -e, du -st, er/sie -t, wir -en, ihr -t, sie/Sie -en. Then learn sein and haben separately.",
    examLink: "Every sentence you write or say needs the right verb ending. Small errors add up in Schreiben.",
  },
  accusative: {
    label: "Accusative articles (einen, den)",
    tip: "Only masculine words change: der → den, ein → einen. Write 10 sentences with „Ich habe …“ or „Ich möchte …“ and a masculine noun.",
    examLink: "Mixing up ein and einen is one of the most common mistakes in Schreiben Teil 2.",
  },
  wordOrder: {
    label: "Verb in second position",
    tip: "Start 5 sentences with a time word (Heute, Morgen, Am Montag) and put the verb straight after it: „Heute gehe ich …“. You'll need this in writing and speaking too.",
    examLink: "Examiners notice verb position straight away in Schreiben and Sprechen.",
  },
  modals: {
    label: "Modal verbs (können, müssen …)",
    tip: "The modal verb goes second, the main verb goes to the very end and doesn't change: „Ich kann heute nicht kommen.“ Practise ich / du forms: kann / kannst, muss / musst.",
    examLink: "You’ll use können, müssen and möchten when you make requests in Sprechen Teil 3.",
  },
  wQuestions: {
    label: "Question words (Wo, Wer, Wann …)",
    tip: "Pair each question word with the kind of answer it gets: Wo? → a place, Wann? → a time, Wer? → a person. In the speaking exam you have to ask questions, not only answer them.",
    examLink: "In Sprechen Teil 2 you have to ask questions, not only answer them.",
  },
  readingMessages: {
    label: "Reading short emails and notes",
    tip: "Read the statement first, then find the exact line in the text that proves it. Watch for small words that flip the meaning: nicht, kein, leider, aber.",
    examLink: "This is Lesen Teil 1: short emails and notes, true or false.",
  },
  readingAds: {
    label: "Matching ads to a need",
    tip: "Underline the one key detail in the situation (weekend? price? place?) and check only that detail in each ad. Ignore everything else.",
    examLink: "This is Lesen Teil 2: match a situation to the right ad.",
  },
  readingSigns: {
    label: "Reading signs and notices",
    tip: "Signs are all about days, times and exceptions. Practise reading opening hours and notices: Mo – Fr, geschlossen, nur, außer, Verspätung.",
    examLink: "This is Lesen Teil 3: signs and notices, true or false.",
  },
};
