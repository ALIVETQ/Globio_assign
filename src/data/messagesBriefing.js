// Safety briefing text (CONTENT.md §5b). Merged into MESSAGES by messages.js.
// The panel illustrations reuse other text where they show UI: the section
// names (sections.js), "I'M SURE" and "I don't know this yet" (question.*).
export const BRIEFING_MESSAGES = {
  briefing: {
    label: "SAFETY BRIEFING · FLIGHT GL-A1 · DEL → BER",
    title: "BEFORE TAKE-OFF",
    intro: "Please read before take-off. It takes 30 seconds.",

    // In this order; the number (01–06) comes from the position.
    panels: [
      { id: "route", title: "Your route", text: "15 questions in 3 parts. About 6 minutes, no timer." },
      { id: "answer", title: "How to answer", text: "Pick an answer, then say how sure you are." },
      // Points filled from config.js ({creditSure} 1, {creditGuessed} ½, {creditSureWrong} −½).
      { id: "guess", title: "Be honest about how sure you are", text: "Sure and right: {creditSure} point. Guessed and right: {creditGuessed}. Sure but wrong: {creditSureWrong}. Only press “I’m sure” if you really think you’re right." },
      { id: "unknown", title: "Don’t know? Say so", text: "An honest result is more useful than a lucky one." },
      { id: "noHelp", title: "No help on board", text: "No dictionary, no translator, no asking a friend." },
      { id: "back", title: "You can go back", text: "Change any answer with Back. Your progress is saved if you refresh." },
    ],

    seatbeltSign: "FASTEN SEATBELT",
    // Also the checkbox's label.
    pledge: "I’ll answer on my own, without a dictionary or translator, and I’ll be honest when I’m guessing.",
    takeOff: "TAKE OFF", // the button adds "→" like every primary button
    takeOffHint: "Fasten your seatbelt to take off", // shown + aria-describedby while disabled
    back: "Back",
  },
};
