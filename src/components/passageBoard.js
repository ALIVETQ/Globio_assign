// Train board passage (DESIGN.md §7.5.4) — question r5. A split-flap station
// board: one flap per character. Static in Phase 4a; Phase 4b flips the letters
// in (motion/splitFlap.js).
//
// The flaps are decorative (aria-hidden); screen readers get the passage's
// srText instead, which reads naturally ("Circa 20 Minuten Verspätung").
// Each word is kept together (it never breaks mid-word); a blank flap follows
// every word but the last, like the empty flaps on a real board.
import { esc } from "../dom.js";

function rowHTML(row) {
  const words = row.text.split(" ");
  const groups = words.map((w, i) => {
    const cells = [...w].map((ch) => `<span class="flap">${esc(ch)}</span>`).join("");
    const blank = i < words.length - 1 ? '<span class="flap is-blank"></span>' : "";
    return `<span class="board__word">${cells}${blank}</span>`;
  });
  return `<div class="board__row${row.tone === "alert" ? " is-alert" : ""}">${groups.join("")}</div>`;
}

export function passageBoardHTML(p) {
  return `
    <div class="board">
      <p class="sr-only" lang="de">${esc(p.srText)}</p>
      <div class="board__rows" aria-hidden="true">${p.rows.map(rowHTML).join("")}</div>
    </div>`;
}
