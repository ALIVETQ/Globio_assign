# ARCHITECTURE.md — "Am I exam-ready?"

> **Read this file first.** It explains what we are building, how the code is organised, and the order we build it in.
> Three other files go with it:
>
> | File | What it holds | Source of truth for |
> |---|---|---|
> | `ARCHITECTURE.md` (this file) | Stack, folders, state, data flow, build phases | *How* the app is built |
> | `DESIGN.md` | Colours, type, layout per screen, every animation with timings | *How it looks and moves* |
> | `CONTENT.md` | Every word on screen: questions, tips, verdict text, labels | *What it says* |
> | `LOGIC.md` | Scoring, readiness rules, recommendations, shuffling, edge cases | *How it decides* |
>
> If two files disagree, the more specific file wins for its own area (for example, a colour in `DESIGN.md` beats a colour mentioned here).
> Never invent content, thresholds or animations that are not in these files. Ask instead.

---

## 1. What we are building

A small web app for German learners in India who have finished A1 and want to know if they are ready to book their **Goethe-Zertifikat A1** or **ÖSD A1** exam.

The learner:
1. lands on a page that explains the check,
2. answers **15 questions** in three parts: **Vocabulary (5) → Grammar (5) → Reading (5)**,
3. after each answer says whether they were **sure** or **guessed** (or skips with "I don't know this yet"),
4. gets a **readiness verdict** (Ready / Almost / Not yet), a **score per skill**, and the **2–3 things to practise** before booking.

**Context.** This is a take-home assignment for the Founder's Office – Product Manager Intern role at Globio (globio.ai), a company that trains Indian professionals in German and helps them build careers in Germany. Deadline: Wednesday 18 November 2026, 10:00 PM IST. Deliverables: public live link, public GitHub repo, a half-page written note, and a 5–7 minute video walkthrough.

The code must be easy to read and easy to change. That requirement shapes every decision below.

### Guiding principles

1. **Working before pretty.** Every phase first makes the screen work with plain styling, then adds motion. A working app with no animation is a valid submission; a beautiful broken one is not.
2. **One obvious place for every change.** Content in `data/`, rules in `config.js`, scoring in `logic/`, visuals in `screens/` and `components/`, animation in `motion/`.
3. **Motion tells the story.** The theme is a journey from India to Germany. Animations serve that story, the score, or realism of the exam objects. While the learner is reading a question, nothing moves.
4. **Phones first.** Most learners will open a link on a mid-range Android phone over mobile data.
5. **No backend.** Everything runs in the browser. Nothing can go down during the demo.

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Build tool | **Vite** (latest) | `npm run dev`, `npm run build`, `npm run preview` |
| Language | **Vanilla JavaScript, ES modules** | No React, no TypeScript. Keep it readable for a live edit. |
| Animation | **GSAP** (`gsap` npm package) | All plugins are free, including SplitText, DrawSVG, MotionPath, Flip, ScrambleText. Import only what each file uses. |
| Globe | **Canvas 2D**, hand-written | Orthographic projection of precomputed land dots. No three.js. |
| Globe data | `world-atlas` + `topojson-client` (dev dependencies only) | Used once by `scripts/build-dots.mjs` to generate `src/data/landdots.json`. Not shipped to the browser. |
| Fonts | `@fontsource/anton`, `@fontsource-variable/archivo`, `@fontsource-variable/jetbrains-mono` | Self-hosted, Latin subset (covers ä ö ü ß). |
| Styles | Plain CSS with custom properties | `tokens.css` holds every colour, font and spacing value. |
| Tests | **Vitest** | Tests `logic/` only. |
| Lint/format | Prettier (default config) | Optional, but keep formatting consistent. |
| Hosting | **GitHub (public repo) + Vercel** | Auto-deploys on every push to `main`. |

**Do not add** a router, a state library, a UI framework, Tailwind, three.js, or any analytics without asking.

---

## 3. Folder structure

```
Globio_assign/                 ← repo root (GitHub: Globio_assign)
├── index.html                 ← single page; <main id="app"> is the only mount point
├── package.json
├── vite.config.js             ← also holds the Vitest config
├── README.md
│
├── docs/                      ← these four spec files live here
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── CONTENT.md
│   └── LOGIC.md
│
├── public/
│   └── favicon.svg
│
├── scripts/
│   └── build-dots.mjs         ← run once: world map → src/data/landdots.json
│
├── src/
│   ├── main.js                ← boots the app, switches screens, guards input during transitions
│   ├── state.js               ← state object and all actions (incl. resume/startOver, debug jumps)
│   ├── theme.js               ← light/dark theme: device default, saved choice, toggle wiring
│   ├── persist.js             ← sessionStorage save/restore + validation, used only by state.js
│   ├── dom.js                 ← esc(), fromHTML(), onAction() event delegation for screens
│   │
│   ├── data/                  ← CONTENT. Everything a founder might ask to change.
│   │   ├── questions.js       ← the 15 questions (from CONTENT.md); re-exports PASSAGES
│   │   ├── passages.js        ← the 4 reading passages (CONTENT.md §2.3)
│   │   ├── topics.js          ← topic labels + practice tips (from CONTENT.md)
│   │   ├── sections.js        ← the 3 sections: id, order, labels (from CONTENT.md)
│   │   ├── messages.js        ← all other UI text (CONTENT.md §4–§7); merges messagesResults.js into MESSAGES
│   │   ├── messagesResults.js ← results-page, coverage, review, method, actions, summary text (CONTENT.md §8)
│   │   ├── config.js          ← every number that decides "ready" (from LOGIC.md)
│   │   └── landdots.json      ← generated globe dots
│   │
│   ├── logic/                 ← PURE FUNCTIONS. No DOM, no GSAP. Fully tested.
│   │   ├── scoring.js         ← answers → result object (LOGIC.md)
│   │   ├── recommend.js       ← practice-topic ranking (LOGIC.md §6), called by scoring.js
│   │   ├── shuffle.js         ← builds this attempt's question order and option order
│   │   ├── presets.js         ← the 8 debug answer sets defined in LOGIC.md §12
│   │   ├── fill.js            ← fill(template, values) placeholder helper (LOGIC.md §11)
│   │   ├── resultText.js      ← results-page placeholder values, reason-template choice, copy-my-result summary
│   │   ├── keys.js            ← question-screen keyboard shortcuts: key + question → command
│   │   └── validateConfig.js  ← dev-only startup checks on config.js (LOGIC.md §2)
│   │
│   ├── screens/               ← ONE FILE PER SCREEN (see §5 for the contract)
│   │   ├── landing.js
│   │   ├── sectionBreak.js
│   │   ├── question.js
│   │   ├── checking.js
│   │   └── results.js
│   │
│   ├── components/            ← reusable pieces used by screens
│   │   ├── landingHero.js     ← landing top bar, resume banner, hero copy, meta line, globe slot
│   │   ├── landingSections.js ← landing: why, how it works, sample result, coverage note, footer
│   │   ├── optionList.js      ← the answer options
│   │   ├── confidenceBar.js   ← "I'm sure" / "I guessed" / "I don't know this yet"
│   │   ├── themeToggle.js     ← sun/moon button markup
│   │   ├── journeyBar.js      ← India → Germany progress bar with plane
│   │   ├── passage.js         ← passage wrapper: format label, phone 45% scroll box, type dispatch
│   │   ├── passageEmail.js    ← email / note passage
│   │   ├── passageSign.js     ← door sign / notice passage
│   │   ├── passageBoard.js    ← split-flap train board passage
│   │   ├── passageAds.js      ← two-ad matching passage (the ad cards are the a/b options)
│   │   ├── scoreMeter.js      ← overall score + ready/almost ticks
│   │   ├── skillBars.js
│   │   ├── verdictStamp.js    ← stamp heading + SVG ink-texture filter
│   │   ├── confidenceDots.js  ← four dot groups + one script-positioned tooltip
│   │   ├── practiceCards.js
│   │   ├── examCoverage.js    ← "What this check can't see" grid
│   │   ├── answerReview.js    ← "Review your answers" and "How we calculate ready" (both collapsed)
│   │   └── toast.js           ← bottom-centre status message ("Copied to clipboard")
│   │
│   ├── motion/                ← ALL ANIMATION CODE
│   │   ├── gsap.js            ← registers GSAP plugins once; exports gsap
│   │   ├── prefs.js           ← reduced motion, low-power detection, debug slow-mo
│   │   ├── globe.js           ← canvas globe singleton (landing + results): lifecycle, loop, pausing
│   │   ├── globeDraw.js       ← globe geometry + one-frame drawing (DESIGN.md §3.1–3.4)
│   │   ├── glitch.js          ← glitch reveal / glitch-out
│   │   ├── glow.js            ← horizon glow screen transition
│   │   ├── fadeUp.js          ← fade-up helper (DESIGN.md §4.3)
│   │   ├── landingMotion.js   ← landing entrance, below-the-fold reveals, Start exit
│   │   ├── sectionBreakMotion.js ← giant-word slide, label fade-up, title glitch
│   │   ├── questionMotion.js  ← question enter/exit, option stroke, confidence feedback
│   │   ├── journeyMotion.js   ← journey plane along the path (MotionPath) + dot pop
│   │   ├── passageMotion.js   ← passage entrances: email pill → Flip, ads, door sign; board via splitFlap.js
│   │   ├── checkingMotion.js  ← checking readout: scramble, dotted leader, count-up, then on (1.6 s)
│   │   ├── resultsMotion.js   ← results entrance: verdict block, stamp slam + shake + ring, meter, globe arc
│   │   ├── resultsReveal.js   ← results blocks below the fold, once each as they scroll in (skill bars …)
│   │   ├── countUp.js
│   │   └── splitFlap.js
│   │
│   ├── debug/
│   │   └── debugPanel.js      ← only loaded with ?debug=1
│   │
│   └── styles/
│       ├── tokens.css         ← colours, fonts, spacing, radii, z-index (from DESIGN.md)
│       ├── base.css           ← reset, typography, buttons, layout helpers
│       ├── screens.css        ← small screens: checking readout
│       ├── landing.css        ← landing hero: top bar, hero copy, globe slot
│       ├── landingSections.css ← landing sections below the hero
│       ├── journey.css        ← journey bar (section break + question screens)
│       ├── sectionBreak.css   ← section break screen
│       ├── question.css       ← question screen: label row, prompt, confidence bar
│       ├── reading.css        ← reading layout (passage left / on top), Richtig/Falsch, ad options
│       ├── passages.css       ← email, door sign
│       ├── board.css          ← split-flap train board (+ flip folds)
│       ├── results.css        ← results page column, verdict block, score meter, results globe box
│       ├── skills.css         ← skill bars + 60% line, lucky-guess warning
│       ├── resultsBlocks.css  ← confidence dots + tooltip, practice cards, coverage tiles
│       ├── resultsFold.css    ← review + method folds, actions row, toast
│       └── options.css        ← answer options + drawn selection stroke
│
└── tests/
    ├── helpers.js             ← shared scoring context, per-section answer builder, seeded rng
    ├── scoring.test.js
    ├── shuffle.test.js
    ├── keys.test.js           ← keyboard shortcut mapping
    ├── resultText.test.js     ← results text for all 8 presets (reason template, filled placeholders, summary)
    └── data.test.js           ← content sanity checks, config validation, fill()
```

**Local only (git-ignored):** `.claude/` holds the dev-server launch config for Claude Code.

---

## 4. App state and screen flow

### 4.1 Screens

```
landing ──Start──▶ sectionBreak(vocabulary) ──▶ question ×5
                   sectionBreak(grammar)    ──▶ question ×5
                   sectionBreak(reading)    ──▶ question ×5
                   ──▶ checking ──▶ results ──Retake──▶ sectionBreak(vocabulary)
                                              └─Home──▶ landing
```

There is no URL router. The current screen lives in state. The browser Back button is not used for navigation inside the quiz (a "Back" control inside the question screen handles going to the previous question).

### 4.2 The state object (`src/state.js`)

```js
const state = {
  screen: "landing",      // "landing" | "sectionBreak" | "question" | "checking" | "results"
  attempt: 1,             // increments on retake
  order: [],              // this attempt's questions, after shuffle.js (array of question objects with shuffled options)
  index: 0,               // position in `order` (0–14)
  answers: {},            // { [questionId]: { choice: <original option index> | null, confidence: "sure" | "guessed" | "unknown" } }
  pendingChoice: null,    // option the learner has tapped but not yet confirmed
  result: null,           // output of scoreCheck(), set when entering "checking"
};
```

**Rules**
- Only functions in `state.js` change state: `start()`, `selectOption(i)`, `confirm(confidence)`, `skip()`, `back()`, `next()`, `finish()`, `retake()`, `goHome()`.
- Answers are stored by **question id** and **original option index**, never by shuffled position. Shuffling must never affect scoring.
- After every change, state is saved to `sessionStorage` (key `examReady.v1`). On load, if a saved quiz is in progress, offer "Continue where you left off?" on the landing screen. Results are recomputed from answers, never stored.

### 4.3 Data flow

```
data/questions.js ─┐
data/sections.js  ─┼─▶ logic/shuffle.js ─▶ state.order ─▶ screens/question.js
                   │                                          │
                   │                                learner answers
                   │                                          ▼
data/config.js ────┼──────────────────────────────▶ logic/scoring.js ◀── state.answers
data/topics.js ────┘                                          │
                                                              ▼
                                                       state.result
                                                              │
data/messages.js ─────────────────────────────────▶ screens/results.js
```

`scoring.js` returns one plain object (shape defined in `LOGIC.md`). The results screen reads only that object and `messages.js`. It never recalculates anything.

---

## 5. The screen contract

Every file in `src/screens/` exports the same four functions:

```js
export function render(state, actions) { /* return an HTMLElement */ }
export function enter(el, state)        { /* play entrance animation; return a Promise */ }
export function exit(el, state)         { /* play exit animation; return a Promise */ }
export function destroy(el)             { /* kill GSAP timelines, remove listeners */ }
```

`main.js` switches screens like this:

```js
async function show(nextScreen) {
  await current.exit(currentEl, state);   // old screen animates out
  current.destroy(currentEl);
  const el = nextScreen.render(state, actions);
  app.replaceChildren(el);
  await nextScreen.enter(el, state);      // new screen animates in
}
```

Transitions that span two screens (the horizon glow) are run by `motion/glow.js` around this swap: the glow rises, the swap happens under it, the glow fades.

**Rendering approach:** build DOM with template literals and `innerHTML` inside each screen, then attach listeners with event delegation on the screen's root element. All text comes from `data/`; never hard-code copy in screens or components.

---

## 6. Motion system

- **`motion/gsap.js`** imports `gsap` and registers the plugins we use (`SplitText`, `DrawSVGPlugin`, `MotionPathPlugin`, `Flip`, `ScrambleTextPlugin`, `CustomEase`). Every other file imports `gsap` from here, never from `"gsap"` directly.
- **`motion/prefs.js`** exports:
  - `reducedMotion`: true if `prefers-reduced-motion: reduce`. When true, every timeline jumps to its end state (`tl.progress(1)`), the globe draws one still frame, count-ups show final values.
  - `lowPower`: true if `navigator.hardwareConcurrency <= 4` or the screen is narrower than 600px. The globe uses half its dots.
  - `timeScale`: from `?slow=0.25` in the URL. Applied with `gsap.globalTimeline.timeScale()`.
- **`motion/globe.js`** is a **singleton**: one canvas, created once, moved between the landing and results screens. API: `mount(container, options)`, `unmount()`, `setArcProgress(0–1)`, `setMode("landing" | "results")`, `pause()`, `resume()`. It runs its own `requestAnimationFrame` loop and stops it when the canvas is off-screen (IntersectionObserver) or the tab is hidden (`visibilitychange`).
- Every screen keeps its GSAP timelines in a local array and kills them in `destroy()`. No animation may outlive its screen.
- Full specs for every animation (durations, eases, keyframes) are in `DESIGN.md`. Do not invent timings.

### Debug mode (`?debug=1`)

Built in Phase 0 and used in every phase after. It shows a small floating panel with:
- **Jump to screen:** landing, any section break, any question by number, checking, results.
- **Results preset:** any of the 8 presets in `LOGIC.md` §12 (`perfect`, `ready`, `almostOverall`, `almostWeakest`, `notYetOverall`, `notYetWeakest`, `luckyGuesser`, `allUnknown`).
- **Replay** the current screen's entrance animation.
- **Slow-mo** toggle (1× / 0.25×).
- **Reduced-motion** toggle (simulates the media query).

Debug code must not load without `?debug=1` (use a dynamic `import()`).

---

## 7. Performance budget

| Item | Budget |
|---|---|
| JS shipped (gzip) | under 120 KB, including GSAP and plugins |
| `landdots.json` | under 40 KB |
| Fonts | 3 families, Latin subset, `font-display: swap` |
| Globe | canvas pixel ratio capped at 2; half the dots when `lowPower`; paused when not visible |
| Lighthouse (mobile) | Performance 85+, Accessibility 95+ |

No images except the favicon and inline SVGs. Textures (for example the stamp's ink) are made with CSS or SVG filters, not image files.

---

## 8. Accessibility

- All interactive elements are real `<button>`s or inputs, reachable by keyboard, with visible focus rings.
- Keyboard shortcuts on the question screen: `1`–`4` select an option, `S` = I'm sure, `G` = I guessed, `D` = I don't know this yet, `Backspace` = back. Shown as small hints on desktop only.
- Options are a `role="radiogroup"` with `role="radio"` items and `aria-checked`.
- `<main id="app">` has `aria-live="polite"`; each screen sets focus on its heading after `enter()`.
- Colour is never the only signal: verdicts and skill bars also use text and icons.
- Canvas globe has `aria-hidden="true"`; its meaning is also given in text.
- `lang="de"` on every German passage, prompt and option so screen readers pronounce it correctly.

---

## 9. Testing

- `tests/scoring.test.js` covers every case listed in `LOGIC.md` §13 (all correct and sure, all guessed, weakest-skill rule, boundary values at exactly 75 / 60 / 55 / 40, lucky-guess warning, recommendation ranking and ties, all "don't know").
- `tests/shuffle.test.js` checks that Richtig/Falsch and a/b options never move, that 4-option questions keep the same set of options, and that answers map back to the original index.
- Run `npm test` before every commit that touches `logic/` or `data/`.
- Manual check at the end of each phase at 360×740 (phone), 768×1024 (tablet) and 1440×900 (desktop), plus one real phone via the Vercel preview link.

---

## 10. Deployment

1. Public GitHub repo named `Globio_assign`.
2. Connect it to Vercel (framework preset: Vite; build `npm run build`; output `dist`).
3. Every push to `main` deploys. **Push and check the live link at the end of every phase.**
4. `README.md` (written in Phase 6) covers: what it is, the live link, how "ready" is decided (short), how to run locally, and the folder map.

---

## 11. Build phases

Phases follow the screens in the order the learner meets them. **Each phase has two steps: (a) make it work, (b) make it move.** Do not start step (b) until step (a) is done and committed. At the end of every phase: run tests, commit, push, check the live link.

**Work on one phase at a time. Do not start the next phase until told to.**

---

### Phase 0 — Foundation
**Goal:** an empty app that runs, deploys, and has all the shared plumbing.

(a) Work
- Vite project, folder structure from §3, `docs/` with the four spec files.
- Install `gsap`, fonts, Vitest; dev-install `world-atlas`, `topojson-client`.
- `tokens.css`, `base.css` from `DESIGN.md` (colours, type scale, buttons, spacing).
- All of `data/` filled from `CONTENT.md` and `LOGIC.md`.
- `logic/scoring.js`, `logic/shuffle.js`, `logic/presets.js` + their tests, all passing.
- `state.js` with all actions and sessionStorage.
- `main.js` with the screen-switching function from §5, and placeholder versions of all five screens (just a heading and a "next" button) so the whole flow can be clicked through.
- `debug/debugPanel.js` (§6).
- `scripts/build-dots.mjs` run once; `landdots.json` committed.
- GitHub repo + Vercel connected.

(b) Motion
- `motion/gsap.js`, `motion/prefs.js` only. No animations yet.

**Done when:** `npm test` passes; you can click from landing through 15 placeholder questions to a results placeholder that prints the result object as JSON; `?debug=1` can jump to any screen and load any preset; the Vercel link works.

---

### Phase 1 — Landing page
**Goal:** the first screen a learner sees.

(a) Work
- Hero: overline, headline, paragraph, Start button, secondary "How it works" button, meta line.
- "Why check first" line, "How it works" 3 steps (with the mini preview of the confidence buttons), sample result card, honest coverage note.
- "Continue where you left off?" banner when a saved quiz exists.
- Responsive layout per `DESIGN.md`.

(b) Motion
- `motion/globe.js`: dotted globe, India and Germany pins, arc, plane with trail.
- Headline glitch reveal, fade-ups, meta-line count-up.
- Floating German words near the globe (only if time; marked optional in `DESIGN.md`).
- On Start: headline glitch-out → `motion/glow.js` horizon glow → section break.

**Done when:** the landing page matches `DESIGN.md` at all three sizes, the globe runs smoothly on a phone, reduced motion shows a still globe and no entrance animation, and Start leads to the Vocabulary section break.

---

### Phase 2 — The test, part 1: Vocabulary
**Goal:** the full question engine, proven on the 5 vocabulary questions. This phase builds everything that Grammar and Reading reuse.

(a) Work
- `screens/sectionBreak.js` (generic: number, German name, English name, question count).
- `screens/question.js`: label row (`01 / VOCABULARY · Q2 OF 15`), prompt, optional English hint, `optionList`, `confidenceBar`, Back control.
- `components/journeyBar.js` (static version: 15 dots, current dot highlighted).
- Confidence flow from `LOGIC.md`: "I'm sure" and "I guessed" disabled until an option is selected; "I don't know this yet" always enabled.
- Keyboard shortcuts (§8).
- Shuffled option order per attempt (4-option questions only).
- Answers saved to state by original index.

(b) Motion
- Section break: giant sliding letters ("01 WORTSCHATZ").
- Question enter/exit: quick slide with two-frame glitch.
- Option select: border draws itself (DrawSVG).
- Confidence buttons: sure = fill sweep, guessed = wobble, don't know = soft fade.
- Journey bar: plane moves one dot forward on each confirm (MotionPath).
- Question-specific extras from `DESIGN.md`: analogue clock for the time question, rolling digits for the number question (optional, only if time).

**Done when:** all 5 vocabulary questions work by mouse, touch and keyboard; going Back and changing an answer works; refreshing mid-section restores progress; the answers in state match the original option indexes (check in debug panel).

---

### Phase 3 — The test, part 2: Grammar
**Goal:** the 5 grammar questions, reusing Phase 2's engine.

(a) Work
- Grammar section break ("02 GRAMMATIK").
- Support the "which sentence is correct?" format (options are full sentences: longer text, wraps nicely on phones).
- Confirm nothing in the engine assumed vocabulary-only content.

(b) Motion
- Reuse Phase 2 motion. No new animation types, except tuning the option layout animation for long sentence options.

**Done when:** all 10 questions so far work end to end, the journey bar is at dot 10, and nothing from Phase 2 broke.

---

### Phase 4 — The test, part 3: Reading
**Goal:** the 5 reading questions in real Goethe A1 formats, with passages that look like the real objects.

(a) Work
- Reading section break ("03 LESEN").
- `passageEmail.js` (questions r1, r2 share one email; the passage stays visible for both).
- `passageAds.js` (question r3: two small ads, the options are "a" and "b").
- `passageSign.js` (question r4: doctor's door plaque).
- `passageBoard.js` (question r5: train platform board).
- Richtig/Falsch and a/b options never shuffle (`LOGIC.md`).
- Layout: on desktop, passage left and question right; on phones, passage on top, question below, options reachable without scrolling far.

(b) Motion
- Email slides in like a phone notification, then expands.
- Door sign swings down and settles.
- Split-flap board: letters flip into place (`motion/splitFlap.js`).
- Ads card in side by side with a small stagger.
- **Rule:** passage animations finish within 1.2 s and then everything is still.
- After question 15: glow transition to the checking screen.

**Done when:** all 15 questions work; r1 and r2 show the same email without re-animating it; the split-flap board runs smoothly on a phone; finishing question 15 leads to the checking screen.

---

### Phase 5 — Results
**Goal:** the screen that delivers the verdict and the advice. The most important screen.

(a) Work
- `screens/checking.js`: the "checking" readout (1.6 s, `DESIGN.md` §8), then automatically on to results.
- `screens/results.js`, top to bottom, exactly as ordered in `DESIGN.md`:
  1. verdict stamp + reason sentence + next action
  2. overall score meter with the ready line
  3. globe with the arc drawn to the learner's progress
  4. skill bars with the 60% line
  5. lucky-guess warning (conditional)
  6. confidence dots (four groups)
  7. "Practise these before you book" cards
  8. "What this check can't see" grid
  9. answer review (collapsed)
  10. "How we calculate ready" (collapsed)
  11. Retake and Home buttons; optional "Copy my result" (text summary to clipboard)
- Test all 8 debug presets from `LOGIC.md` §12 and compare each screen with the expected results in `LOGIC.md` §13.

(b) Motion
- Checking readout: lines type in, numbers count up.
- Visa-stamp verdict, score count-up, skill bars drawing with a red pulse on bars below the line.
- Globe arc draws to `result.overall / 100` of the way; at "ready" it reaches Germany and the pin lights up.
- Confidence dots sort into four groups (Flip).
- Practice cards sweep in with the blue-to-white text effect.
- Coverage tiles: shimmer on the three untested sections.
- Retake: glow transition back to the Vocabulary section break with a fresh shuffle.

**Done when:** every preset produces the right verdict, reason, recommendations and warnings (compare with `LOGIC.md` test cases); results look right at all three sizes; reduced motion shows the final state instantly.

---

### Phase 6 — Polish and ship
**Goal:** ready to submit.

- Full pass at 360×740, 768×1024, 1440×900 and on a real phone.
- Reduced-motion pass and keyboard-only pass.
- Lighthouse check against §7.
- Remove console logs; make sure debug code only loads with `?debug=1`.
- `README.md` (§10).
- Favicon, page title, meta description, Open Graph tags (title + description only).
- Final push; check the live link in a private window.

**Done when:** a stranger can open the link on their phone, finish the check in under 7 minutes, and understand their result without help.

---

## 12. Rules for working on this project

1. One phase at a time. Finish (a), commit, then (b), commit.
2. Read the relevant section of `DESIGN.md`, `CONTENT.md` and `LOGIC.md` before starting a phase.
3. Copy text exactly from `CONTENT.md`. Copy numbers exactly from `LOGIC.md` and `DESIGN.md`.
4. Keep files small. If a file passes ~200 lines, split it.
5. Comment the *why*, not the *what*, especially in `logic/` and `config.js` — the founders will read this code.
6. No new dependencies without asking.
7. If something in the specs is unclear or contradictory, stop and ask.
