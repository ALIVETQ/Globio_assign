// Question screen (DESIGN.md §7.1–7.7, motion §7.6), shared by all three sections.
// Layout and wiring live here; animation lives in motion/questionMotion.js; the
// cockpit parts (ticket strip, rails, background word) in components/cockpit.js.
import { MESSAGES } from "../data/messages.js";
import { SECTIONS } from "../data/sections.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { fill } from "../logic/fill.js";
import { commandForKey } from "../logic/keys.js";
import { journeyBarHTML, mountJourney } from "../components/journeyBar.js";
import { optionListHTML, updateOptionList } from "../components/optionList.js";
import { confidenceBarHTML, updateConfidenceBar } from "../components/confidenceBar.js";
import { hasSidePassage, passageHTML, formatLabelHTML, mountPassageScroll } from "../components/passage.js";
import { playEnter, playExit, sizeStroke, setStroke, pulseEnable } from "../motion/questionMotion.js";
import { playPassage } from "../motion/passageMotion.js";
import { PASSAGES } from "../data/questions.js";
import * as cockpit from "../components/cockpit.js";

const Q = MESSAGES.question;
const live = new WeakMap();
// Direction for the next question's entrance: set by the outgoing question
// (Back = −1, enter from the left), used once by the incoming one.
let enterDir = 1;
// The passage last shown and how far it was scrolled (phones), so r2 opens the
// shared email where r1 left it.
let lastPassage = { id: null, scrollTop: 0 };
// The section last shown: the background word fades in only when it changes.
let lastSection = null;

// "___" in a prompt is drawn as a 3em cobalt underline (§7.1). The underscores
// stay in the text for screen readers, visually hidden.
function promptHTML(prompt) {
  return esc(prompt).replace(/_{3,}/g, '<span class="gap"><span class="sr-only">___</span></span>');
}

function labelText(state, q) {
  const s = SECTIONS.find((x) => x.id === q.section);
  return fill(Q.label, { sectionNumber: s.number, sectionEn: s.en, n: state.index + 1, total: state.order.length });
}

export function render(state, actions) {
  const q = state.order[state.index];
  const back =
    state.index > 0 // hidden on question 1 of the whole test
      ? `<button type="button" class="btn btn--link q-back" data-action="back"><span aria-hidden="true">← </span>${esc(Q.back)}</button>`
      : "<span></span>";

  // Reading questions with a passage get two columns on desktop (passage left)
  // and the passage on top on phones (§7.5). The passage sits outside .q-body,
  // so it stays still while the question side animates (r1 → r2 share an email).
  const side = hasSidePassage(q);
  // The rails need the width the passage uses, so reading questions get none (§7.7).
  const rails = !side;
  const el = fromHTML(`
    <section class="screen question-screen${side ? " is-reading" : " has-rails"}${q.format === "ads" ? " is-ads" : ""}">
      ${journeyBarHTML()}
      ${cockpit.ticketStripHTML(q, state.index, labelText(state, q))}
      <div class="q-label-row">
        ${back}
        ${cockpit.topicChipHTML(q)}
      </div>
      <div class="q-cockpit">
      ${rails ? cockpit.routeRailHTML(state.order, state.index) : ""}
      <div class="q-layout">
        ${side ? passageHTML(q) : ""}
        <div class="q-main">
          <div class="q-body">
            <div class="q-column">
              <h1 class="prompt" lang="de">${promptHTML(q.prompt)}</h1>
              ${q.hint ? `<p class="q-hint small muted">${esc(q.hint)}</p>` : ""}
              ${q.format === "ads" ? formatLabelHTML(q) : ""}
              ${optionListHTML(q)}
            </div>
          </div>
          ${confidenceBarHTML()}
        </div>
      </div>
      ${rails ? cockpit.topicRailHTML(q) : ""}
      </div>
      ${cockpit.bgWordHTML(q)}
    </section>
  `);

  const h = {
    index: state.index,
    command: null,
    ready: false,
    // The passage animates in (§7.6) unless it is the one already on screen:
    // r1 → r2 (and Back r2 → r1) keep the same email still.
    passageType: q.passage ? PASSAGES[q.passage]?.type : null,
    samePassage: Boolean(q.passage) && q.passage === lastPassage.id,
    newSection: q.section !== lastSection,
  };
  lastSection = q.section;
  // Remember what the learner did, so the exit can play the matching feedback.
  const run = (cmd) => {
    if (!cmd) return false;
    if (cmd.type !== "select") h.command = cmd.type;
    if (cmd.type === "select") actions.selectOption(cmd.index);
    else if (cmd.type === "sure") actions.confirm("sure");
    else if (cmd.type === "guessed") actions.confirm("guessed");
    else if (cmd.type === "unknown") actions.skip();
    else if (cmd.type === "back") actions.back();
    return true;
  };

  // Shortcuts work from anywhere on the page, except with modifier keys
  // (so browser shortcuts like Ctrl+R still work) or on a held-down key.
  const onKey = (e) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    if (run(commandForKey(e.key, q))) e.preventDefault();
  };
  document.addEventListener("keydown", onKey);

  // Keep each option's stroke the size of the option (text can wrap on resize).
  // The first call happens once the screen is on the page, and also draws the
  // stroke of an option that was already selected (after Back or a restore).
  const ro = new ResizeObserver(() => {
    el.querySelectorAll(".option").forEach((o) => {
      sizeStroke(o);
      setStroke(o, o.classList.contains("is-selected"), false);
    });
  });
  ro.observe(el.querySelector(".options"));

  Object.assign(h, {
    offClick: onAction(el, {
      select: (btn) => run({ type: "select", index: Number(btn.dataset.index) }),
      sure: () => run({ type: "sure" }),
      guessed: () => run({ type: "guessed" }),
      unknown: () => run({ type: "unknown" }),
      back: () => run({ type: "back" }),
    }),
    offKey: () => document.removeEventListener("keydown", onKey),
    offResize: () => ro.disconnect(),
    offPassage: mountPassageScroll(el, q.passage && q.passage === lastPassage.id ? lastPassage.scrollTop : 0),
    // The route rail's current dot moves when the journey-bar plane lands (§7.7).
    journey: mountJourney(el, state.order, state.index, state.attempt, {
      onFrom: (from) => cockpit.setRouteCurrent(el, from, state.order),
      onLand: () => cockpit.setRouteCurrent(el, state.index, state.order),
    }),
  });
  live.set(el, h);
  update(el, state);
  h.ready = true; // from now on, changes are the learner's and get animated
  return el;
}

// Same question, new selection: update in place (main.js calls this).
export function update(el, state) {
  const h = live.get(el);
  const q = state.order[state.index];
  updateOptionList(el, q, state.pendingChoice, (btn, selected) => setStroke(btn, selected, h.ready));
  const switchedOn = updateConfidenceBar(el, state.pendingChoice !== null);
  if (switchedOn && h.ready) {
    pulseEnable(el.querySelectorAll("[data-needs-choice]"), el.querySelector('[data-action="sure"]'));
  }
}

export function enter(el) {
  const h = live.get(el);
  h.enterTl?.progress(1).kill(); // debug "Replay" calls enter() again
  h.passageTl?.progress(1).kill();
  // The ad cards are the options and have their own entrance.
  // The rails fade in with the question; the background word only when a section starts.
  const also = [...el.querySelectorAll(".rail")];
  if (h.newSection) also.push(el.querySelector(".q-bgword"));
  const { tl, ready } = playEnter(el, enterDir, { skipOptions: h.passageType === "ads", also });
  enterDir = 1;
  h.enterTl = tl;
  if (h.passageType && !h.samePassage) h.passageTl = playPassage(el, h.passageType);
  return ready;
}

export function exit(el, state) {
  const h = live.get(el);
  const dir = state.index < h.index ? -1 : 1; // moving back → leave to the right
  enterDir = dir;
  h.enterTl?.progress(1).kill();
  const { tl, done } = playExit(el, { command: h.command, dir });
  h.exitTl = tl;
  return done;
}

export function destroy(el) {
  const h = live.get(el);
  if (!h) return;
  h.enterTl?.kill();
  h.exitTl?.kill();
  h.passageTl?.kill();
  h.offClick();
  h.offKey();
  h.offResize();
  // Remember the passage scroll before the screen goes (for r1 → r2).
  const box = el.querySelector(".passage__scroll");
  lastPassage = { id: el.querySelector(".passage")?.dataset.passage ?? null, scrollTop: box?.scrollTop ?? 0 };
  h.offPassage();
  h.journey.destroy();
  live.delete(el);
}
