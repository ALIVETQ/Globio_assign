// Reading passages (CONTENT.md §2.3). Re-exported from questions.js as PASSAGES.
// Questions point at these by id (`question.passage`); r1 and r2 share emailTom.
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
