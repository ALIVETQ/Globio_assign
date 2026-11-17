// Debug panel (ARCHITECTURE.md §6). Loaded only with ?debug=1 via dynamic
// import() in main.js, so none of this ships to learners. Labels here are
// developer-facing and deliberately not in CONTENT.md.
//
// Slow-mo and reduced-motion toggles go straight to motion/prefs.js, so they
// behave exactly like ?slow=0.25 and the prefers-reduced-motion media query.
import { state, subscribe, debugJump, debugLoadPreset } from "../state.js";
import { timeScale, reducedMotion, setTimeScale, setForcedReducedMotion } from "../motion/prefs.js";
import { QUESTIONS } from "../data/questions.js";
import { SECTIONS } from "../data/sections.js";
import { PRESET_NAMES } from "../logic/presets.js";
import { esc } from "../dom.js";

const CSS = `
.dbg{position:fixed;right:12px;bottom:12px;z-index:100;width:260px;max-height:80vh;overflow:auto;
  background:#111;color:#f4f4f4;font:12px/1.4 ui-monospace,monospace;border-radius:10px;padding:10px;
  box-shadow:0 8px 24px rgba(0,0,0,.3)}
.dbg[data-collapsed="true"] .dbg__body{display:none}
.dbg h2{all:unset;display:flex;justify-content:space-between;font-weight:700;cursor:pointer}
.dbg label{display:block;margin-top:8px;color:#aaa}
.dbg select,.dbg button{font:inherit;margin-top:4px;padding:4px 6px;border-radius:6px;border:1px solid #444;
  background:#222;color:#fff;cursor:pointer}
.dbg select{width:100%}
.dbg .dbg__row{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.dbg button[aria-pressed="true"]{background:#2f63ff;border-color:#2f63ff}
.dbg pre{white-space:pre-wrap;word-break:break-all;margin:6px 0 0;color:#cfd8ff;font-size:11px}
/* Outline of where the landing globe will be drawn (DESIGN.md §3.5), until it exists */
.globe-slot{outline:1px dashed #a9bcff;outline-offset:-1px;--dbg-r:min(62vw,340px);--dbg-cx:55%;--dbg-cy:58%}
.globe-slot::after{content:"GLOBE";position:absolute;display:grid;place-items:center;
  border:1px dashed #2f63ff;border-radius:50%;font:11px ui-monospace,monospace;color:#2f63ff;
  width:calc(2*var(--dbg-r));height:calc(2*var(--dbg-r));
  left:calc(var(--dbg-cx) - var(--dbg-r));top:calc(var(--dbg-cy) - var(--dbg-r))}
@media(min-width:1024px){.globe-slot{--dbg-r:min(calc(.42*max(100svh,640px)),30vw);--dbg-cx:73%;--dbg-cy:56%}}
`;

function jumpOptions() {
  const opts = [`<option value="landing">landing</option>`];
  for (const s of SECTIONS) {
    const first = QUESTIONS.findIndex((q) => q.section === s.id);
    opts.push(`<option value="sectionBreak:${first}">section break · ${s.id}</option>`);
  }
  QUESTIONS.forEach((q, i) => opts.push(`<option value="question:${i}">Q${i + 1} · ${q.id}</option>`));
  opts.push(`<option value="checking">checking</option>`, `<option value="results">results</option>`);
  return opts.join("");
}

// Keep ?slow= in the address bar in step with the toggle, so a reload (or a
// copied link) keeps the same speed.
function syncSlowParam(value) {
  const url = new URL(location.href);
  if (value === 1) url.searchParams.delete("slow");
  else url.searchParams.set("slow", String(value));
  history.replaceState(history.state, "", url);
}

function readout() {
  const q = state.order[state.index];
  return JSON.stringify(
    {
      screen: state.screen,
      attempt: state.attempt,
      index: state.index,
      question: q?.id,
      optionOrder: q?.optionOrder,
      pendingChoice: state.pendingChoice,
      answers: state.answers,
    },
    null,
    1,
  );
}

export function mountDebugPanel({ replay }) {
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.append(style);

  // Start from what prefs.js already applied (?slow=, system reduced-motion).
  let slow = timeScale;
  let reduced = reducedMotion;

  const panel = document.createElement("aside");
  panel.className = "dbg";
  panel.dataset.collapsed = "false";
  panel.setAttribute("aria-label", "Debug panel");
  panel.innerHTML = `
    <h2 data-dbg="toggle"><span>DEBUG</span><span>–</span></h2>
    <div class="dbg__body">
      <label>Jump to screen<select data-dbg="jump">${jumpOptions()}</select></label>
      <label>Results preset<select data-dbg="preset">${PRESET_NAMES.map((n) => `<option>${esc(n)}</option>`).join("")}</select></label>
      <div class="dbg__row"><button data-dbg="load">Load preset</button><button data-dbg="replay">Replay</button></div>
      <div class="dbg__row">
        <button data-dbg="slow" aria-pressed="${slow !== 1}">Slow-mo ${slow}×</button>
        <button data-dbg="reduced" aria-pressed="${reduced}">Reduced motion</button>
      </div>
      <pre data-dbg="state"></pre>
    </div>`;
  document.body.append(panel);

  const $ = (k) => panel.querySelector(`[data-dbg="${k}"]`);
  const refresh = () => {
    $("state").textContent = readout();
    const q = state.screen === "sectionBreak" || state.screen === "question" ? `${state.screen}:${state.index}` : state.screen;
    if ([...$("jump").options].some((o) => o.value === q)) $("jump").value = q;
  };

  $("jump").addEventListener("change", (e) => {
    const [screen, index] = e.target.value.split(":");
    debugJump({ screen, index: Number(index) || 0 });
  });
  panel.addEventListener("click", (e) => {
    const k = e.target.closest("[data-dbg]")?.dataset.dbg;
    if (k === "toggle") panel.dataset.collapsed = String(panel.dataset.collapsed !== "true");
    if (k === "load") debugLoadPreset($("preset").value);
    if (k === "replay") replay();
    if (k === "slow") {
      slow = slow === 1 ? 0.25 : 1;
      $("slow").textContent = `Slow-mo ${slow}×`;
      $("slow").setAttribute("aria-pressed", String(slow !== 1));
      setTimeScale(slow);
      syncSlowParam(slow);
    }
    if (k === "reduced") {
      reduced = !reduced;
      $("reduced").setAttribute("aria-pressed", String(reduced));
      setForcedReducedMotion(reduced);
    }
  });

  subscribe(refresh);
  refresh();
}
