// Email passage (DESIGN.md §7.5.1) — questions r1 and r2 share it.
// A white card: avatar + sender + "an Anna" + time, subject, hairline, body.
import { esc } from "../dom.js";

export function passageEmailHTML(p) {
  return `
    <article class="email" lang="de">
      <header class="email__head">
        <span class="email__avatar" aria-hidden="true">${esc(p.from.charAt(0))}</span>
        <span class="email__who">
          <span class="email__from">${esc(p.from)}</span>
          <span class="email__to">${esc(p.to)}</span>
        </span>
        <span class="email__time">${esc(p.time)}</span>
      </header>
      <p class="email__subject">${esc(p.subject)}</p>
      <p class="email__body">${esc(p.body)}</p>
    </article>`;
}
