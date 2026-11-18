// Safety briefing (DESIGN.md §5b, CONTENT.md §5b): between the landing's Start
// and the Vocabulary section break. Six panels explain the check; the learner
// fastens the seatbelt (the pledge, state.accepted) and presses TAKE OFF.
// Retake and Resume never show this screen (state.js).
import { MESSAGES } from "../data/messages.js";
import { esc, fromHTML, onAction } from "../dom.js";
import { themeToggleHTML } from "../components/themeToggle.js";
import { BRIEFING_ART } from "../components/briefingArt.js";
import { seatbeltHTML, setSeatbelt } from "../components/seatbelt.js";
import { playBriefing, playTakeOff } from "../motion/briefingMotion.js";
import { playSeatbelt } from "../motion/seatbeltMotion.js";
import { CONFIG } from "../data/config.js";
import { fill } from "../logic/fill.js";
import { formatPoints } from "../logic/points.js";

const B = MESSAGES.briefing;
const live = new WeakMap();
// Panel 3 states the scoring; its numbers come from config.js.
const POINTS = {
  creditSure: formatPoints(CONFIG.credit.correctSure),
  creditGuessed: formatPoints(CONFIG.credit.correctGuessed),
  creditSureWrong: formatPoints(CONFIG.credit.sureWrong),
};

function panelsHTML() {
  return B.panels
    .map(
      (p, i) => `
      <li class="panel">
        <div class="panel__art">${BRIEFING_ART[p.id]()}</div>
        <span class="panel__num">${String(i + 1).padStart(2, "0")}</span>
        <h2 class="panel__title">${esc(p.title)}</h2>
        <p class="panel__text">${esc(fill(p.text, POINTS))}</p>
      </li>`,
    )
    .join("");
}

export function render(state, actions) {
  const el = fromHTML(`
    <section class="screen briefing">
      <div class="row row--end briefing__top">${themeToggleHTML()}</div>
      <header class="briefing__head">
        <p class="label">${esc(B.label)}</p>
        <h1 class="display briefing__title">${esc(B.title)}</h1>
        <p class="body-lg muted">${esc(B.intro)}</p>
      </header>
      <ol class="plain-list panels">${panelsHTML()}</ol>
      ${seatbeltHTML(state.accepted)}
      <div class="briefing__actions">
        <button type="button" class="btn btn--link" data-action="back">${esc(B.back)}</button>
        <div class="briefing__go">
          <button type="button" class="btn btn--primary" data-action="takeOff">${esc(B.takeOff)}<span aria-hidden="true">→</span></button>
          <p id="takeoff-hint" class="small muted briefing__hint">${esc(B.takeOffHint)}</p>
        </div>
      </div>
    </section>
  `);

  const input = el.querySelector(".pledge__input");
  const onChange = () => {
    actions.setAccepted(input.checked);
    // Ignored mid-transition: put the checkbox back to what the state says.
    if (input.checked !== state.accepted) input.checked = state.accepted;
  };
  input.addEventListener("change", onChange);

  live.set(el, {
    accepted: state.accepted,
    ready: false,
    offClick: onAction(el, {
      back: () => actions.goHome(),
      takeOff: () => actions.takeOff(),
    }),
    offChange: () => input.removeEventListener("change", onChange),
  });
  setSeatbelt(el, state.accepted); // normally unfastened; a debug jump can land here fastened
  syncTakeOff(el, state.accepted);
  return el;
}

// TAKE OFF is disabled until the seatbelt is fastened; while disabled it points
// to the hint that says why (aria-describedby), and the hint is shown.
function syncTakeOff(el, on) {
  const btn = el.querySelector('[data-action="takeOff"]');
  btn.disabled = !on;
  if (on) btn.removeAttribute("aria-describedby");
  else btn.setAttribute("aria-describedby", "takeoff-hint");
  el.querySelector(".briefing__hint").hidden = on;
}

// Fastening / unfastening changes state.accepted, which re-renders nothing:
// main.js calls update() and the change is shown (and animated) in place.
export function update(el, state) {
  const h = live.get(el);
  if (!h || h.accepted === state.accepted) return;
  h.accepted = state.accepted;
  setSeatbelt(el, state.accepted);
  syncTakeOff(el, state.accepted);
  h.beltTl?.progress(1).kill();
  if (h.ready) h.beltTl = playSeatbelt(el, state.accepted);
}

// Resolves at once: the learner can read, scroll and fasten while it plays.
export function enter(el) {
  const h = live.get(el);
  h.enterTl?.progress(1).kill(); // debug "Replay"
  h.enterTl = playBriefing(el);
  h.ready = true;
  return Promise.resolve();
}

// TAKE OFF: a small lift, then main.js takes over with the horizon glow.
export function exit(el, state) {
  const h = live.get(el);
  h?.enterTl?.progress(1).kill();
  return state.screen === "sectionBreak" ? playTakeOff(el.querySelector('[data-action="takeOff"]')) : Promise.resolve();
}

export function destroy(el) {
  const h = live.get(el);
  if (!h) return;
  h.enterTl?.kill();
  h.beltTl?.kill();
  h.offClick();
  h.offChange();
  live.delete(el);
}
