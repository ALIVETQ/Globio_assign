// The question screen's "in-flight cockpit" parts (DESIGN.md §7.7). All static:
// they change only when the question changes, never while the learner thinks.
//   - ticket strip under the journey bar (all sizes)
//   - topic chip (when the topic card isn't shown: below 1200px, and reading)
//   - background word: the section's German name, huge and faint (all sizes)
//   - left rail "YOUR ROUTE" and right rail topic card (≥1200px, not reading)
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { TOPICS } from "../data/topics.js";
import { esc } from "../dom.js";
import { fill } from "../logic/fill.js";

const Q = MESSAGES.question;
const nn = (i) => String(i + 1).padStart(2, "0");
const sectionOf = (q) => SECTIONS.find((s) => s.id === q.section);

// label: the existing "01 / VOCABULARY · Q1 OF 15", moved here from the label row.
export function ticketStripHTML(q, index, label) {
  return `
    <div class="q-ticket">
      <span aria-hidden="true">${esc(fill(Q.ticket, { nn: nn(index), sectionDe: sectionOf(q).de }))}</span>
      <span class="q-ticket__label">${esc(label)}</span>
    </div>`;
}

export function topicChipHTML(q) {
  return `<span class="q-chip">${esc(TOPICS[q.topic].label)}</span>`;
}

export function bgWordHTML(q) {
  return `<div class="q-bgword" aria-hidden="true">${esc(sectionOf(q).de)}</div>`;
}

// Left rail. Position only — done / current / upcoming — never right or wrong.
// aria-hidden: the journey bar's progressbar already says "question n of 15".
export function routeRailHTML(order, index) {
  const stops = SECTIONS.map((s) => {
    const dots = order
      .map((q, i) => (q.section === s.id ? `<span class="route__dot" data-i="${i}"></span>` : ""))
      .join("");
    return `<li class="route__stop" data-section="${esc(s.id)}"><span class="route__name">${esc(s.de)}</span><span class="route__dots">${dots}</span></li>`;
  }).join("");
  return `
    <div class="rail rail--route" aria-hidden="true">
      <p class="label">${esc(Q.routeTitle)}</p>
      <ol class="plain-list route">${stops}</ol>
      <p class="label route__footer">${esc(fill(Q.routeFooter, { total: order.length }))}</p>
    </div>`;
}

// Mark position `current`: earlier dots done, later ones upcoming. Each stop is
// "passed", "current" or upcoming by the same rule.
export function setRouteCurrent(root, current, order) {
  root.querySelectorAll(".route__dot").forEach((d) => {
    const i = Number(d.dataset.i);
    d.className = `route__dot${i < current ? " is-done" : i === current ? " is-current" : ""}`;
  });
  const here = order[current]?.section;
  const at = SECTIONS.findIndex((s) => s.id === here);
  root.querySelectorAll(".route__stop").forEach((stop, k) => {
    stop.classList.toggle("is-passed", k < at);
    stop.classList.toggle("is-current", k === at);
  });
}

// Right rail: the question's topic and where it matters in the real exam.
export function topicRailHTML(q) {
  const t = TOPICS[q.topic];
  return `
    <aside class="rail rail--topic">
      <p class="label">${esc(Q.topicTitle)}</p>
      <p class="topic-card__name">${esc(t.label)}</p>
      <hr class="topic-card__rule">
      <p class="label">${esc(Q.examTitle)}</p>
      <p class="topic-card__exam">${esc(t.examLink)}</p>
    </aside>`;
}
