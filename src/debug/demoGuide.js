// Demo guide (ARCHITECTURE.md §6): a presenter tool for recording the
// walkthrough video, NOT part of the product. Loaded only with ?demo=1 via a
// dynamic import() in main.js, so learners never download it. Its labels are
// presenter-facing and deliberately not in CONTENT.md.
//
// It only READS state (and re-renders on every state change via subscribe).
// The one thing it does is "Restart quiz with this scenario", which runs the
// app's own actions (start → fasten → take off → first question), exactly as
// a learner would. Scoring, state rules and the normal UI are untouched.
import * as appState from "../state.js";
import { QUESTIONS } from "../data/questions.js";
import { SECTIONS } from "../data/sections.js";
import { TOPICS } from "../data/topics.js";
import { CONFIG } from "../data/config.js";
import { MESSAGES } from "../data/messages.js";
import { buildPreset } from "../logic/presets.js";
import { scoreCheck } from "../logic/scoring.js";
import { keycapFor } from "../components/optionList.js";
import { esc } from "../dom.js";

const SCENARIOS = [
  { preset: "ready", label: "Ready to book" },
  { preset: "almostWeakest", label: "Almost" },
  { preset: "notYetOverall", label: "Not yet" },
];
const CTX = { questions: QUESTIONS, sections: SECTIONS, topics: TOPICS, config: CONFIG };
const sectionOf = (id) => SECTIONS.find((s) => s.id === id);
// The app's state module, handed over by main.js (so a dev-server reload can't
// leave the guide reading a second copy).
let S = appState;

const CSS = `
.demo-btn{position:fixed;top:96px;right:16px;z-index:90;width:36px;height:36px;border-radius:50%;
  border:1px solid var(--hairline);background:var(--surface);color:var(--muted);font:600 16px/1 var(--font-text);cursor:pointer}
.demo-panel{position:fixed;top:0;right:0;bottom:0;z-index:95;width:320px;max-width:100vw;overflow:auto;padding:20px;
  background:var(--surface);color:var(--ink);border-left:1px solid var(--hairline);box-shadow:-8px 0 24px rgba(0,0,0,.18);
  font:14px/1.45 var(--font-text);transform:translateX(100%);transition:transform .25s ease-out;visibility:hidden}
.demo-panel.is-open{transform:none;visibility:visible}
[data-reduced-motion="true"] .demo-panel{transition:none}
.demo-panel h2{all:unset;display:block;font:12px/1 var(--font-mono);letter-spacing:.09em;color:var(--muted)}
.demo-close{position:absolute;top:12px;right:12px;border:0;background:none;color:var(--muted);font-size:20px;cursor:pointer}
.demo-scen{display:grid;gap:6px;margin:14px 0 8px}
.demo-scen button,.demo-restart{padding:9px 12px;border-radius:10px;border:1px solid var(--hairline);background:var(--paper);
  color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.demo-scen button[aria-pressed="true"]{border-color:var(--cobalt);box-shadow:inset 0 0 0 1px var(--cobalt);color:var(--cobalt);font-weight:600}
.demo-ends{font:12px/1.4 var(--font-mono);color:var(--muted)}
.demo-restart{width:100%;margin:12px 0 18px;text-align:center;font-weight:600}
.demo-step{padding:14px;border-radius:12px;background:var(--paper);border:1px solid var(--hairline)}
.demo-step b{font-weight:700}.demo-step .m{color:var(--muted);font-size:12px}
.demo-step p+p{margin-top:6px}.demo-warn{margin-top:10px;color:var(--notyet);font-size:13px}
@media (max-width:639px){.demo-panel{width:100vw}}`;

// What the scenario expects at the end: run the real scoring on its answers.
function expected(preset) {
  const r = scoreCheck(buildPreset(preset, QUESTIONS), CTX);
  return { r, stamp: MESSAGES.results.verdict[r.verdict].stamp, weakestName: sectionOf(r.weakestSkill).name };
}

// The step for the screen that is showing now.
function stepHTML(preset) {
  const st = S.state;
  const answers = buildPreset(preset, QUESTIONS);
  if (st.screen === "landing") return "<p>Press <b>Start the check</b></p>";
  if (st.screen === "briefing") return "<p>Fasten the seatbelt → <b>Take off</b></p>";
  if (st.screen === "sectionBreak") return "<p>Wait, or press <b>Skip</b></p>";
  if (st.screen === "checking") return "<p>Wait…</p>";
  if (st.screen === "results") {
    const e = expected(preset);
    const a = st.result;
    const ok = a && a.verdict === e.r.verdict && a.overall === e.r.overall && a.weakestSkill === e.r.weakestSkill;
    return `<p>Expected: <b>${esc(e.stamp)} · ${e.r.overall}% · weakest: ${esc(e.weakestName)}</b></p>
      <p>${ok ? "✓ Matches" : "✗ Doesn't match"}: ${a ? `${esc(MESSAGES.results.verdict[a.verdict].stamp)} · ${a.overall}%` : "–"}</p>`;
  }
  // Question: which option to tap (via this attempt's shuffled optionOrder) and how sure to be.
  const q = st.order[st.index];
  if (!q) return "";
  const want = answers[q.id];
  const head = `<p class="m">Q${st.index + 1} of ${st.order.length} · ${esc(sectionOf(q.section).de)}</p>`;
  let body;
  if (want.confidence === "unknown") {
    body = `<p>Tap <b>“${esc(MESSAGES.question.unknown)}”</b></p>`;
  } else {
    const pos = q.optionOrder.indexOf(want.choice);
    const wrong = want.choice !== q.answer;
    body = `<p>Tap: <b lang="de">${esc(q.options[want.choice])}</b> <span class="m">(option ${pos + 1}, key ${esc(keycapFor(q, pos))})</span></p>
      <p>Then: <b>${esc(want.confidence === "sure" ? MESSAGES.question.sure : MESSAGES.question.guessed)}</b>${wrong ? ' <span class="m">(wrong on purpose)</span>' : ""}</p>`;
  }
  const done = st.answers[q.id];
  const mismatch = done && (done.confidence !== want.confidence || done.choice !== want.choice);
  return head + body + (mismatch ? `<p class="demo-warn">This answer doesn’t match the scenario. Go Back or restart.</p>` : "");
}

// A fresh attempt at question 1, through the app's normal actions.
function restart() {
  S.start();
  S.setAccepted(true);
  S.takeOff();
  S.next(); // section break → first question
}

export function mountDemoGuide({ S: state = appState } = {}) {
  S = state;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);

  let preset = SCENARIOS[0].preset;
  const btn = document.createElement("button");
  btn.className = "demo-btn";
  btn.type = "button";
  btn.textContent = "⋯";
  btn.setAttribute("aria-label", "Demo guide");
  const panel = document.createElement("aside");
  panel.className = "demo-panel";
  panel.setAttribute("aria-label", "Demo guide");
  document.body.append(btn, panel);

  const render = () => {
    const e = expected(preset);
    panel.innerHTML = `
      <button type="button" class="demo-close" data-demo="close" aria-label="Close">×</button>
      <h2>DEMO GUIDE</h2>
      <div class="demo-scen">${SCENARIOS.map((s) => `<button type="button" data-demo="pick" data-preset="${s.preset}" aria-pressed="${s.preset === preset}">${esc(s.label)}</button>`).join("")}</div>
      <p class="demo-ends">Ends at: ${esc(e.stamp)} · ${e.r.overall}%</p>
      <button type="button" class="demo-restart" data-demo="restart">Restart quiz with this scenario</button>
      <div class="demo-step">${stepHTML(preset)}</div>`;
  };
  const toggle = (open = !panel.classList.contains("is-open")) => panel.classList.toggle("is-open", open);

  btn.addEventListener("click", () => toggle());
  panel.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-demo]");
    if (!t) return;
    if (t.dataset.demo === "close") toggle(false);
    if (t.dataset.demo === "pick") {
      preset = t.dataset.preset;
      render();
    }
    if (t.dataset.demo === "restart") restart();
  });
  // ` toggles the panel (quick hide while recording). Nothing else uses this key.
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "`" || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    ev.preventDefault();
    toggle();
  });
  S.subscribe(render); // the step follows every screen / question change
  render();
}
