// Split-flap board entrance (DESIGN.md §7.6, train board):
//   - the board fades in (0.2 s);
//   - every letter flap flips through 4–9 random characters, 55 ms per flip:
//     the top half of the old character folds down (rotateX) to reveal the next;
//   - cells finish left to right, rows 120 ms apart, so the amber alert row
//     (the last row) finishes last;
//   - everything is done by 1.2 s, then the board is still.
//
// Each flap gets a temporary "fold" (the top half of the old character) which
// is removed when the cell lands, so the finished board is plain static markup.
//
// Also used by the boarding pass's status (components/boardingPass.js), with
// its own rows, no fade and a 0.9 s ceiling — see the options of playSplitFlap.
import { gsap } from "./gsap.js";

const FADE_S = 0.2;
const FLIP_S = 0.055;
const MIN_FLIPS = 4;
const MAX_FLIPS = 9;
const ROW_STEP_S = 0.12;
const TOTAL_S = 1.2; // hard ceiling for the whole board (§7.6 rule)
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// The finished board: every flap on its real character, no folds left.
// Used at the end, and whenever the animation is cut short.
export function finishBoard(board) {
  for (const flap of board.querySelectorAll(".flap[data-char]")) flap.textContent = flap.dataset.char;
}

// One cell: flips `n` times, ending on its real character at `end` seconds.
function flipCell(tl, flap, n, end) {
  const real = flap.dataset.char;
  const fold = document.createElement("span");
  fold.className = "flap__fold";
  fold.innerHTML = '<span class="flap__fold-char"></span>';
  const foldChar = fold.firstChild;
  // Characters shown in turn: n − 1 random ones, then the real one.
  const seq = Array.from({ length: n - 1 }, randomGlyph).concat(real);
  const start = end - n * FLIP_S;

  tl.call(() => {
    flap.textContent = seq[0];
    flap.append(fold);
  }, null, Math.max(0, start - 0.001));
  seq.forEach((next, i) => {
    const t = start + i * FLIP_S;
    // The fold shows the character being replaced and falls away to reveal `next`.
    tl.call(() => {
      foldChar.textContent = i === 0 ? randomGlyph() : seq[i - 1];
      flap.firstChild.nodeValue = next;
    }, null, t);
    tl.fromTo(fold, { rotationX: 0 }, { rotationX: -90, duration: FLIP_S, ease: "power1.in", immediateRender: false }, t);
  });
  tl.call(() => {
    fold.remove();
    flap.textContent = real;
  }, null, end);
}

// Returns the timeline (null if there is nothing to animate).
// Options: rows (selector of the flap rows), fade (the board's fade-in, s; 0 =
// none), total (the hard ceiling, s). The defaults are the train board's.
export function playSplitFlap(board, { rows: rowSel = ".board__row", fade = FADE_S, total = TOTAL_S } = {}) {
  const rows = [...board.querySelectorAll(rowSel)];
  if (!rows.length) return null;
  // Jumping to the end (reduced motion switched on mid-way) may skip callbacks,
  // so completion always restores the real characters.
  const tl = gsap.timeline({ onComplete: () => finishBoard(board) });
  // Capture each flap's real character once, from the untouched markup. A second
  // run (debug Replay, or a run cut short) must not mistake a random flap for it.
  for (const flap of board.querySelectorAll(".flap:not(.is-blank)")) {
    if (!flap.dataset.char) flap.dataset.char = flap.textContent;
  }
  finishBoard(board); // start every run from the real board, folds removed
  board.querySelectorAll(".flap__fold").forEach((f) => f.remove());
  if (fade > 0) tl.fromTo(board, { opacity: 0 }, { opacity: 1, duration: fade, clearProps: "opacity" }, 0);

  // Latest a cell may land so the last cell of the last row still makes 1.2 s.
  const longest = Math.max(...rows.map((r) => r.querySelectorAll(".flap:not(.is-blank)").length));
  const lastRowStart = fade + MAX_FLIPS * FLIP_S + (rows.length - 1) * ROW_STEP_S;
  const colStep = longest > 1 ? Math.min(0.02, (total - lastRowStart) / (longest - 1)) : 0;

  rows.forEach((row, r) => {
    const flaps = [...row.querySelectorAll(".flap:not(.is-blank)")];
    flaps.forEach((flap, c) => {
      // Left to right within a row; each row 120 ms after the one above.
      const end = fade + MAX_FLIPS * FLIP_S + r * ROW_STEP_S + c * colStep;
      const n = MIN_FLIPS + Math.floor(Math.random() * (MAX_FLIPS - MIN_FLIPS + 1));
      // Before its first flip a cell shows a random character, not the answer.
      flap.textContent = randomGlyph();
      flipCell(tl, flap, n, end);
    });
  });
  return tl;
}
