# DESIGN.md — "Am I exam-ready?"

> How the app looks and moves. Read `ARCHITECTURE.md` first.
> Every visible word comes from `CONTENT.md`; this file refers to text by its **content key** (for example `landing.headline`). Never write copy here or in code.
> Every number in this file (colour, size, duration, ease) is exact. Do not round, guess or "improve" them. If something is missing, ask.

---

## 1. Design direction

**One sentence:** a calm, white, editorial page with ink-black condensed headlines and one cobalt accent, where motion tells the story of a learner travelling from India to Germany.

The visual language is borrowed from a freight-brand landing page (white space, Anton headlines, mono labels, a dotted globe, glitch reveals, a cobalt horizon glow, count-ups) and re-aimed at a learner:

- **Landing and results** are expressive: globe, glitch, glow, stamp, count-ups.
- **Question screens** are quiet: once a question is on screen and its entrance has finished (max 1.2 s), nothing moves except direct responses to the learner's taps.
- **Exam objects look real:** the email looks like an email, the doctor's sign like a door plaque, the train notice like a split-flap station board.

Mood words: *confident, calm, honest, a bit cinematic.* Not: playful, gamified, cute. No confetti, no emoji, no sound.

---

## 2. Tokens (`src/styles/tokens.css`)

### 2.1 Colours

| Token | Value | Use |
|---|---|---|
| `--ink` | `#111111` | Headlines, body text, globe dots, dark surfaces |
| `--paper` | `#ffffff` | Page background |
| `--cobalt` | `#2f63ff` | The one accent: overlines, primary buttons, selected option, progress, pins, arc, plane, numbers |
| `--cobalt-hover` | `#1f4fe0` | Primary button hover / pressed |
| `--wash` | `#eef2ff` | Selected option background, globe haze, glow |
| `--periwinkle` | `#a9bcff` | Glow mid tone, inactive journey dots |
| `--muted` | `#5d6270` | Paragraphs, English hints |
| `--muted-2` | `#6b6f78` | Captions, meta lines |
| `--hairline` | `#d9dbe0` | Dividers, option borders, track of bars |
| `--giant` | `#e9e9e9` | Giant sliding letters on section breaks |
| `--surface` | `#f6f7f9` | Cards on the landing and results pages |
| `--ready` | `#16a34a` | Ready verdict, "covered" tick |
| `--ready-wash` | `#e8f7ee` | Ready banner background |
| `--almost` | `#d97706` | Almost verdict |
| `--almost-wash` | `#fdf3e6` | Almost banner background, lucky-guess warning |
| `--notyet` | `#dc2626` | Not-yet verdict, bars below the line, "sure but wrong" dots |
| `--notyet-wash` | `#fdecec` | Not-yet banner background |
| `--board` | `#141414` | Split-flap board background |
| `--board-flap` | `#222222` | Individual flap |
| `--board-text` | `#f4f1e8` | Flap letters |
| `--board-alert` | `#ffb300` | "Verspätung" line on the board |
| `--plaque` | `#1e2a32` | Doctor's door plaque |
| `--plaque-text` | `#e9eef1` | Plaque text |

Verdict colours appear **only** on the results page and in the sample result card on the landing page. Everything else is ink, white, greys and cobalt.

### 2.2 Type

| Family | Weights | Fallback | Used for |
|---|---|---|---|
| **Anton** | 400 | Impact, sans-serif | Display only: headlines, section-break letters, verdict stamp, big numbers |
| **Archivo** (variable) | 400–700 | system-ui, sans-serif | Everything readable: prompts, options, paragraphs, buttons, passages (except the board) |
| **JetBrains Mono** (variable) | 400–500 | ui-monospace, monospace | Labels, overlines in caps, counters, journey labels, globe labels, keyboard hints, checking readout, split-flap letters |

German text (prompts, options, passages) is always **Archivo**, never Anton, because it must be easy to read.

| Token | Size | Line height | Notes |
|---|---|---|---|
| `--fs-hero` | `clamp(64px, 11vw, 150px)` | 0.95 | Anton, uppercase, letter-spacing −0.004em |
| `--fs-display` | `clamp(44px, 7vw, 96px)` | 1.0 | Anton, uppercase, letter-spacing 0.01em |
| `--fs-giant` | `clamp(120px, 26vw, 330px)` | 0.8 | Anton, uppercase, section-break letters |
| `--fs-h2` | `clamp(28px, 3.4vw, 40px)` | 1.05 | Anton, uppercase |
| `--fs-prompt` | `clamp(22px, 2.6vw, 30px)` | 1.3 | Archivo 600 |
| `--fs-body-lg` | `clamp(16px, 1.4vw, 19px)` | 1.5 | Archivo 400 |
| `--fs-body` | `16px` | 1.5 | Archivo 400 |
| `--fs-small` | `14px` | 1.45 | Archivo 400 |
| `--fs-label` | `12px` | 1 | JetBrains Mono 400, uppercase, letter-spacing 0.09em |
| `--fs-overline` | `clamp(12px, 1.2vw, 15px)` | 1 | Archivo 700, uppercase, letter-spacing 0.04em, cobalt |

Never set body text below 14px on phones. Options and prompts never below 16px.

### 2.3 Spacing, radius, shadow, layers

- Spacing scale (px): `4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128` as `--s-1` … `--s-12`.
- Radius: `--r-pill: 999px`, `--r-card: 16px`, `--r-option: 14px`, `--r-small: 8px`.
- Shadow (only on the email card and floating results cards): `--shadow-card: 0 1px 2px rgba(17,17,17,.06), 0 8px 24px rgba(17,17,17,.08)`.
- Hairline: `1px solid var(--hairline)`.
- Z-index: content 1, sticky confidence bar 10, globe 0, glow overlay 50, debug panel 100.

### 2.4 Breakpoints and test sizes

| Name | Width |
|---|---|
| phone | < 640px |
| tablet | 640–1023px |
| desktop | ≥ 1024px |

Must look right, with nothing cut off or scrolling sideways, at **360×740, 390×844, 768×1024, 1280×800, 1440×900**. Body has `overflow-x: clip`.

### 2.5 Shared components

**Buttons (pills)**
- Height 52px (phone) / 48px (desktop). Padding 0 28px. Radius pill. JetBrains Mono 500, 13px, uppercase, letter-spacing 0.09em.
- **Primary:** cobalt fill, white text; hover/pressed `--cobalt-hover`. Arrow "→" after the label.
- **Secondary:** transparent, 1.5px cobalt border, cobalt text; hover fills cobalt with white text.
- **Text link:** Archivo 500, 15px, ink, underline 1px offset 0.28em; hover cobalt.
- **Disabled:** 35% opacity, `cursor: not-allowed`. No hover effect.
- All colour changes `transition: .25s`. Focus ring: 2px cobalt outline, 3px offset, on every interactive element.

**Mono label** — `--fs-label`, `--muted-2`. Used for "01 / VOCABULARY · Q2 OF 15" and similar.

**Card** — `--surface` background, radius card, padding 24px (phone) / 32px (desktop), no border.

---

## 3. The globe (`motion/globe.js`)

One canvas, created once, used on the landing page and the results page.

### 3.1 Dots (built once by `scripts/build-dots.mjs`)

- Decode `world-atlas/land-110m.json` with `topojson-client`.
- Sample an even grid on the sphere: rows from latitude −58° to +80° every **1.9°**; in each row `round(360·cos(lat)/1.9)` points; offset every other row by half a step.
- Keep a point if it is on land (point-in-polygon, even-odd, respecting holes).
- Save as a flat JSON array of integers `[lon×10, lat×10, …]` to `src/data/landdots.json`. Target ≈ 3,000 dots, under 40 KB.
- At runtime convert to unit vectors: `x = cos(lat)·sin(lon)`, `y = sin(lat)`, `z = cos(lat)·cos(lon)`.
- When `lowPower` (see `ARCHITECTURE.md` §6), draw every second dot.

### 3.2 View

- Orthographic projection.
- **View centre:** longitude **45°E**, latitude **30°N**, so India and Germany are both on the visible face.
- **Gentle sway, not a full spin:** `viewLon = 45° + 10°·sin(2π·t / 40)` (t in seconds). Land drifts slowly left and right; India and Germany never leave the face.
- For each point: rotate around the vertical axis by −viewLon, then around the horizontal axis by viewLat. Visible when depth `z > 0.02`. Screen position `(cx + R·x, cy − R·y)`.
- Canvas pixel ratio: `min(devicePixelRatio, 2)`.

### 3.3 Places

| Pin | Lat | Lon | Label key |
|---|---|---|---|
| India (New Delhi) | 28.61°N | 77.21°E | `globe.labelFrom` |
| Germany (Berlin) | 52.52°N | 13.40°E | `globe.labelTo` |

### 3.4 Draw order (every frame, at global alpha = intro fade)

1. **Haze:** radial gradient over the whole canvas, centred at `(cx − .05R, cy + .08R)`, radius `.9R → 1.5R`. Stops: `rgba(47,99,255,.45)` 0, `rgba(90,128,255,.26)` .12, `rgba(169,188,255,.14)` .4, `rgba(238,242,255,0)` 1.
2. **Sphere body:** radial gradient, inner circle `(cx + .3R, cy − .42R)` r `.05R`, outer `(cx + .1R, cy − .15R)` r `1.25R`. Stops `#ffffff` 0, `#f6f8ff` .55, `#e8eeff` .85, `#d5dfff` 1.
3. **Inner limb shading** (clipped to the circle): radial `.8R → R`, transparent 0, `rgba(47,99,255,.10)` .75, `rgba(47,99,255,.38)` 1.
4. **Land dots** (clipped): radius `max(.9px, 1.7·k) × (.5 + .5·√z)` where `k = R/400`. Five depth buckets, `bucket = min(4, floor(z·5.5))`; each bucket one `#111` path at alpha `.20 + bucket·.18`.
5. **Rim:** line width `max(1, 1.4k)`; full circle `rgba(47,99,255,.35)`; white highlight arc `rgba(255,255,255,.9)` at radius `R − .8` from −2.4 to −0.3 rad.
6. **Arc India → Germany:** 64 points of a spherical linear interpolation, lifted by `1 + (0.08 + 0.42·ω/π)·sin(π·t)` (ω = angle between the places). Cobalt, alpha .85, width `max(1.2, 1.4k)`, round caps. Drawn only up to `arcProgress` (0–1) of its length. Segments hidden when behind the globe (z ≤ 0 and inside the disc).
7. **Pins:** cobalt dot, radius `max(3.5, 5k)`, 1.5px white ring. Label above: JetBrains Mono 500, uppercase, `max(10px, 12.5k)`, letter-spacing .05em, ink.
8. **Plane** (landing only, see §3.6).

### 3.5 Placement

| Size | Placement |
|---|---|
| desktop (landing) | Fills the right side of the hero. `R = min(0.42 · heroHeight, 0.30 · vw)`. Centre at `x = vw − 0.27·vw`, `y = 0.56 · heroHeight`. Bleeds off the bottom a little. |
| tablet / phone (landing) | Below the hero copy in a box `min(92vw, 520px)` tall, `overflow: hidden`, bottom 25% faded with `mask-image: linear-gradient(#000 75%, transparent)`. `R = 0.62 · vw` (max 340px), centre at 55% width, 58% box height. |
| results (all sizes) | In the verdict block (see §9.2). Box 360×300 desktop / full width × 260 phone. `R` fits the box with 12px margin. No haze beyond the box. |

### 3.6 Motion

| What | Behaviour |
|---|---|
| Intro fade | alpha = `1 − (1 − clamp(t/1.1))³` |
| Pins | India fades in over 0.6 s from t = 0.8 s; Germany from t = 0.96 s |
| Arc (landing) | Draws from 0 to 1 over 1.4 s, `power2.inOut`, starting t = 1.1 s |
| Plane (landing) | After the arc is drawn: a cobalt dot (radius `max(2.5, 3.2k)`) flies India → Germany along the arc in 3.2 s, `power1.inOut`, with a trail of the last 14 positions fading from alpha .6 to 0 and shrinking to 40% size. Pauses 1.2 s at Germany (Germany pin pulses once: a ring growing from 1× to 2.4× pin radius and fading out over 0.8 s), then restarts from India. |
| Sway | Continuous from t = 0 (§3.2) |
| Results mode | No plane loop. Arc draws from 0 to `result.overall / 100` over 1.6 s, `power2.out`, starting when the verdict block enters (see §9.11). A plane dot sits at the arc's tip. If the verdict is **ready**, the arc completes to 1, the plane lands, and the Germany pin turns `--ready` and pulses twice. |
| Pausing | Stop the loop when the canvas is off-screen or the tab is hidden. |
| Reduced motion | Draw one still frame: sway at 0, pins shown, arc fully drawn (landing) or drawn to its final value (results), plane at the tip, no trail. |

---

## 4. Signature animations (shared)

All built with GSAP (import from `motion/gsap.js`). Times in seconds unless marked ms.

### 4.1 Glitch reveal (`motion/glitch.js` → `glitchIn(el, {delay})`)

Applied per line of a headline (each line is its own `span` with `display:block; white-space:nowrap`). Duration **0.9 s**, ease `steps(14)`, from the first keyframe:

| Progress | Opacity | clip-path | x | text-shadow (cobalt ghost, ink ghost) |
|---|---|---|---|---|
| 0 | 0 | `inset(0 100% 0 0)` | −0.05em | `−.12em 0 0 rgba(47,99,255,.8), .07em 0 0 rgba(17,17,17,.25)` |
| .30 | 1 | `inset(0 38% 0 0)` | .035em | `.09em 0 0 rgba(47,99,255,.65), −.05em 0 0 rgba(17,17,17,.3)` |
| .55 | .8 | `inset(0)` | −.018em | `−.045em 0 0 rgba(47,99,255,.55), .025em 0 0 rgba(17,17,17,.2)` |
| .78 | 1 | `inset(0)` | .008em | `.015em 0 0 rgba(47,99,255,.35)` |
| 1 | 1 | `inset(0)` | 0 | none |

Lines are staggered **130 ms** apart.

### 4.2 Glitch-out (`glitchOut(el)`)

Reverse feel, **0.45 s**, `steps(8)`: each line jitters x by ±0.06em (alternating sign per line), gains a cobalt ghost shadow, and is wiped to the left with `clip-path: inset(0 100% 0 0)`. Lines staggered 60 ms.

### 4.3 Fade-up (`fadeUp(el, {y, delay})`)

Opacity 0 → 1 and translateY(`y`px) → 0, **0.7 s**, ease `cubic-bezier(.2,.7,.2,1)` (register as CustomEase `"soft"`). Default `y` = 12.

### 4.4 Horizon glow transition (`motion/glow.js` → `glowTransition(swapFn)`)

A fixed full-screen overlay `div.glow` (z 50, `pointer-events:none`) whose background is a radial ellipse:
- Horizontal radius `Rx = max(0.75·vw, 0.9·vh)`, vertical radius `Ry = 0.72·vh`, centred horizontally, ellipse centre at `y = edge·vh − Ry` (so the ellipse's bottom is the edge).
- Stops (in px as multiples of Rx): `0` transparent white · `0.985` `rgba(238,242,255,0)` · `1.00` `rgba(214,224,255,.6)` · `1.06` `#9fb2ff` · `1.14` `#5a80ff` · `1.236` `#2f63ff` · `1.32` `#5a80ff` · `1.42` `#a9bcff` · `1.53` `#dfe6ff` · `1.65` `#ffffff`.

Sequence (GSAP timeline animating a numeric `edge` and re-writing the gradient on update):

| Step | From → to | Duration | Ease |
|---|---|---|---|
| Rise | `edge` 1.25 → −0.03 | 0.85 s | `power3.inOut` |
| Swap | call `swapFn()` (screen change happens under full white) | — | — |
| Hold | — | 0.1 s | — |
| Fade | overlay opacity 1 → 0 | 0.45 s | `power2.out` |

Used for: landing → first section break, question 15 → checking, results → retake.
Reduced motion: no overlay, instant swap.

### 4.5 Count-up (`motion/countUp.js` → `countUp(el, to, {decimals, suffix, duration})`)

Default **1.4 s**, ease `power3.out`. Shows the zero form first ("0%"). Uses tabular numerals (`font-variant-numeric: tabular-nums`).

---

## 5. Screen: Landing

### 5.1 Layout — desktop (≥1024px)

```
┌───────────────────────────────────────────────────────────────┐
│ EXAM·READY  [A1 GERMAN]                        How it works ↓ │  ← top bar, 72px tall, padding 0 48px
│                                                               │
│  GOETHE · ÖSD · A1 READINESS CHECK          (dotted globe     │
│                                              with India →     │
│  AM I                                        Germany arc,     │
│  EXAM                                        right side,      │
│  READY?                                      bleeds off)      │
│                                                               │
│  Paragraph, 2–3 lines, max 460px                              │
│                                                               │
│  [ START THE CHECK → ]  [ HOW IT WORKS ]                      │
│                                                               │
│  15 QUESTIONS · ~6 MIN · 3 SKILLS · FREE                      │  ← meta line, mono
└───────────────────────────────────────────────────────────────┘
   Why check first  (one wide line, centred, max 720px)
   How it works     (3 cards in a row)
   Sample result    (one card, left text / right mini result)
   Coverage note    (small, muted, max 640px)
   Footer
```

- Hero height: `100svh`, min 640px. Copy column: left padding 48px (desktop) / 8vw max 120px, vertically centred, max-width 560px.
- Top bar: wordmark `brand.wordmark` in JetBrains Mono 500 15px ink with a small cobalt dot as the "·"; tag `brand.tag` as a mono label in a 1px hairline pill; right side text link `landing.navHowItWorks` scrolling smoothly to the How it works section. **No other nav items.**
- Overline `landing.overline` (overline style). 16px below: headline `landing.headline` (3 lines, `--fs-hero`, ink). 24px below: paragraph `landing.lede` (`--fs-body-lg`, muted). 32px below: buttons (primary `landing.ctaStart`, secondary `landing.ctaHow`), gap 12px. 28px below: meta line `landing.meta` (mono label; each number counts up).
- **Resume banner** (only when a saved quiz exists): above the overline, a `--wash` pill bar with `landing.resumeText` and two text buttons `landing.resumeYes` / `landing.resumeNo`.

Below the hero (section padding 96px top/bottom desktop, 64px phone; content max-width 1120px, centred):

1. **Why check first** — `landing.whyTitle` (mono label) + `landing.whyBody` (`--fs-body-lg`, ink, max 720px).
2. **How it works** — `landing.howTitle` (`--fs-h2`), then 3 cards in a row (stack on phone). Each card: big mono number "01/02/03" in cobalt, title (Archivo 600 19px), body (`--fs-small`, muted). Card 2 includes a **mini preview** of the confidence buttons: two small pills (primary-styled "I'M SURE", secondary-styled "I GUESSED") at 70% scale, not interactive (`aria-hidden`).
3. **Sample result** — a card split in two: left `landing.sampleTitle` + `landing.sampleBody`; right a mini result (an "ALMOST" stamp at 50% size, three skill bars, one practice line). Clearly labelled `landing.sampleTag` ("Example") in a mono pill so nobody thinks it is theirs.
4. **Coverage note** — `landing.coverageNote`, `--fs-small`, muted, with a small info icon.
5. **Second CTA** — primary button `landing.ctaStart` again, centred.
6. **Footer** — `landing.footer`, mono label, centred, 48px padding.

### 5.2 Layout — tablet and phone

- Top bar: 60px tall, padding 0 20px; "How it works" link stays.
- Hero becomes a column: copy first (padding 20px, starts 40px below the top bar), then the globe box (§3.5).
- Headline `clamp(64px, 21vw, 120px)`. Buttons stack full-width (gap 10px) on phones < 400px; side by side above that.
- How it works cards stack with 12px gap. Sample result card stacks (text, then mini result).

### 5.3 Motion — entrance (ms from load)

| Delay | What | Animation |
|---|---|---|
| 0 | Globe | Intro fade (§3.6) |
| 0 | Top bar | Fade-up y 8 |
| 150 | Overline | Fade-up y 10 |
| 260 / 390 / 520 | Headline lines | Glitch reveal (§4.1) |
| 900 | Paragraph | Fade-up y 14 |
| 1040 | Buttons | Fade-up y 14 |
| 1180 | Meta line | Fade-up y 8, then each number counts up (0.9 s) |
| 1100+ | Arc, then plane loop | §3.6 |
| 4000 | Failsafe | Force everything visible |

Below-the-fold sections: fade-up y 16 when 15% into the viewport (IntersectionObserver, once). Cards stagger 90 ms.

**Optional (only if time): floating German words.** Five words from `landing.floatingWords` drift near the globe at fixed positions around its left edge. Each types itself in letter by letter (40 ms per letter), holds 2.4 s, fades out over 0.6 s; one word at a time, 0.8 s gap, looping. JetBrains Mono 13px, `--muted-2`. Desktop only.

### 5.4 Motion — on Start

1. Buttons and meta fade to 0 (0.2 s).
2. Headline glitch-out (§4.2).
3. Horizon glow (§4.4); the swap shows the Vocabulary section break.
4. Globe pauses after the glow covers it.

---

## 6. Screen: Section break

Shown before each of the three sections. Lasts **1.8 s** in total, then moves on automatically. A small text button `sectionBreak.skip` ("Skip →") in the bottom-right lets impatient learners continue straight away (it also responds to Enter / Space).

### 6.1 Layout (all sizes)

- Full screen, white.
- **Giant word** (the section's German name, from `sections[i].de`, e.g. "WORTSCHATZ"): `--fs-giant`, Anton, `--giant` colour, vertically centred, one line, `white-space: nowrap`. It is wider than the screen on purpose.
- Over it, centred, in a column:
  - Mono label: `sections[i].number` + " / 03" (e.g. "01 / 03"), cobalt.
  - Display line: `sections[i].en` (e.g. "VOCABULARY"), `--fs-display`, ink.
  - Archivo 16px muted: `sections[i].blurb` (e.g. "5 questions · everyday words").
- Journey bar (§7.4) visible at the top, so the learner sees where they are.

### 6.2 Motion

| Time | What | Animation |
|---|---|---|
| 0 | Giant word | Slides from `x: 100vw` to `x: −(wordWidth − 100vw) − 10vw` over 1.8 s, `none` (linear) — it passes behind the text |
| 0.15 s | Mono label | Fade-up y 8 |
| 0.25 s | Display line | Glitch reveal |
| 0.55 s | Blurb | Fade-up y 8 |
| 1.8 s | — | Auto-advance to the first question of the section (question enter animation §7.6) |

Reduced motion: no slide (giant word static, centred, clipped), auto-advance after 1.2 s.

---

## 7. Screen: Question (shared by Vocabulary, Grammar, Reading)

### 7.1 Layout — non-reading questions

```
┌──────────────────────────────────────────────┐
│ INDIA ●──●──●──◉──○──○──○ … ○── GERMANY      │  ← journey bar, full width
│ ← Back            01 / VOCABULARY · Q4 OF 15 │  ← label row
│                                              │
│   Wo kauft man Medikamente?                  │  ← prompt, max 720px, centred column
│   Where do you buy medicine?                 │  ← English hint (optional)
│                                              │
│   [1] in der Bäckerei                        │
│   [2] in der Apotheke                        │  ← options
│   [3] am Bahnhof                             │
│   [4] in der Post                            │
│                                              │
│   [ I'M SURE → ]   [ I GUESSED → ]           │  ← confidence bar
│          I don't know this yet               │
└──────────────────────────────────────────────┘
```

- Content column max-width 720px, centred; padding 20px (phone), 40px (desktop); starts 32px below the label row.
- **Label row:** left a text button `question.back` with a "←" (hidden on question 1 of the whole test); right a mono label, e.g. `01 / VOCABULARY · Q4 OF 15` (format in `CONTENT.md`).
- **Prompt:** `--fs-prompt`, ink, `lang="de"`. Gaps ("___") are drawn as a 3em-wide inline underline (2px, cobalt), not underscores.
- **English hint:** `--fs-small`, muted, 8px below the prompt, only if the question has one.
- **Options:** 28px below. A vertical list, gap 10px.

### 7.2 Option

- Full width of the column, min-height 60px, padding 14px 18px, radius option, background white, border 1.5px hairline. Archivo 500 18px ink, `lang="de"`.
- Left: a keycap (desktop only) — 26×26px, radius 6px, 1px hairline border, JetBrains Mono 12px muted, showing 1–4 (or R/F, a/b — see below).
- **Hover:** border `--periwinkle`.
- **Selected:** background `--wash`, border cobalt (drawn by animation, §7.6), keycap filled cobalt with white text, text ink.
- **Richtig / Falsch questions:** two options side by side (each 50% width, gap 10px), centred text, keycaps "R" and "F". Keyboard: `1`/`R` and `2`/`F`.
- **Ads question (a/b):** the options are the ads themselves (see §7.5.2); keycaps "a" and "b". Keyboard: `1`/`A` and `2`/`B`.
- **Sentence options** (grammar "which sentence is correct?"): same component, text may wrap to 2 lines, min-height 64px.

### 7.3 Confidence bar

- Two buttons in a row, gap 10px, each 50% width (phone) / auto width min 200px (desktop), centred: primary `question.sure` ("I'M SURE →"), secondary `question.guessed` ("I GUESSED →").
- Under them, centred, 12px gap: text link `question.unknown` ("I don't know this yet"), muted.
- **Both main buttons are disabled until an option is selected.** The text link is always active.
- Desktop: keyboard hints under each control in mono 11px muted: "S", "G", "D".
- **Phone:** the bar is **sticky at the bottom** (`position: sticky; bottom: 0`), white background with a top hairline, padding 12px 20px `calc(12px + env(safe-area-inset-bottom))`. The column above gets enough bottom padding that the last option is never hidden.
- Desktop: the bar sits in the flow, 32px below the options.

### 7.4 Journey bar

- Full width, height 44px, padding 0 20px (phone) / 40px (desktop), bottom hairline.
- Left mono label `journey.from` ("INDIA"), right mono label `journey.to` ("GERMANY"), cobalt.
- Between them an SVG: a gently arched path (rises 10px at the middle) with **15 dots** evenly spaced along it, plus small gaps between sections (dots 5|6 and 10|11 have 1.6× the normal spacing).
  - Answered: filled cobalt, radius 4.
  - Current: white fill, 2px cobalt ring, radius 6.
  - Upcoming: filled `--periwinkle`, radius 3.5.
  - The path itself: 1.5px; the part up to the current dot is cobalt, the rest `--hairline`.
- **Plane:** a small cobalt paper-plane glyph (inline SVG, 14px), sitting on the current dot, pointing along the path.
- Phone: labels shortened to `journey.fromShort` / `journey.toShort` ("IN" / "DE").

### 7.5 Layout — reading questions (passages)

**Desktop (≥1024px):** two columns, gap 48px, max-width 1120px. Left: the passage (sticky at top 96px if taller than the viewport). Right: prompt, options, confidence bar.
**Tablet / phone:** passage on top (full width), question below. The passage must not be taller than 45% of the screen on phones; if it is, it scrolls inside its own box with a soft bottom fade.

Above every passage, a mono label naming the format: `reading.formatEmail`, `reading.formatAds`, `reading.formatSign`, `reading.formatBoard` (e.g. "TEIL 1 · E-MAIL").

#### 7.5.1 Email (`passageEmail.js`) — questions r1, r2

- A card: white, radius card, `--shadow-card`, padding 20px 24px, max-width 520px.
- Header row: a 32px circle avatar with the sender's initial (cobalt on wash), sender name (Archivo 600 15px), and "to Anna" (muted 13px); right side a time stamp in mono 11px muted.
- Subject line (Archivo 600 16px), then hairline, then body (Archivo 400 17px, line-height 1.55, ink, `white-space: pre-line`, `lang="de"`).
- r1 and r2 show **the same email**; when moving from r1 to r2 the email stays in place without re-animating (only the question side animates).

#### 7.5.2 Ads (`passageAds.js`) — question r3

- The situation (prompt) is shown first, above the two ads, on all sizes.
- Two ad cards side by side (stack on phones < 520px), gap 12px. Each: `--surface` background, radius 12px, padding 18px, a 2px dashed hairline border (like a pinned classified ad).
  - Top-left mono badge "a" / "b".
  - Title Archivo 700 17px, details Archivo 400 15px, `lang="de"`.
- **The ad cards are the options:** tapping one selects it (same selected styling as §7.2).

#### 7.5.3 Door sign (`passageSign.js`) — question r4

- A plaque: `--plaque` background, `--plaque-text` text, radius 10px, padding 22px 26px, max-width 380px, two small "screw" circles (6px, `rgba(255,255,255,.25)`) at top-left and top-right.
- Title Archivo 700 20px, a thin divider `rgba(255,255,255,.2)`, then lines of opening hours in JetBrains Mono 14px, `white-space: pre-line`, right-aligned times.
- A subtle top "hanger" line: 1px `--hairline` drawn from the top of the column to the plaque (24px), as if it hangs.

#### 7.5.4 Train board (`passageBoard.js`) — question r5

- A board: `--board` background, radius 10px, padding 18px, max-width 520px.
- Three rows of split-flap cells (one cell per character, monospace grid):
  - Row 1: platform, e.g. "GLEIS 3" (`--board-text`)
  - Row 2: train and time
  - Row 3: the alert line (`--board-alert`)
- Each cell: `--board-flap` background, radius 3px, 1px dark gap line across the middle (`rgba(0,0,0,.6)`), JetBrains Mono 500, cell size `clamp(16px, 3.6vw, 24px)` wide × 1.45 tall.
- Rows can wrap to a second line on phones; never scroll sideways.

### 7.6 Motion — question screen

| Event | Animation |
|---|---|
| **Question enters** | Whole content column: x 24px → 0 and opacity 0 → 1 over **0.32 s**, `power3.out`, with a two-frame glitch at the start (frames 1–2: x ±3px and a cobalt ghost text-shadow `−2px 0 rgba(47,99,255,.5)`). Options fade-up y 8, staggered 50 ms. |
| **Question exits** | x 0 → −24px, opacity → 0, **0.22 s**, `power2.in`. |
| **Option selected** | An SVG rounded-rect stroke (cobalt, 2px) draws around the option with DrawSVG from 0% to 100% in **0.28 s**, `power2.out`; background fades to `--wash` in 0.2 s. Deselecting the previous option reverses its stroke in 0.15 s. |
| **Confidence buttons enable** | When the first option is selected: both main buttons fade from 35% to 100% opacity (0.2 s) and the primary does a tiny scale pulse 1 → 1.03 → 1 (0.3 s). |
| **"I'm sure" pressed** | A white-to-cobalt fill sweeps left → right across the button (clip-path, 0.22 s), then the question exits. |
| **"I guessed" pressed** | The button wobbles: rotate 0 → −3° → 3° → −1.5° → 0 over 0.35 s, `power1.inOut`, then the question exits. |
| **"I don't know" pressed** | The options fade to 40% opacity (0.15 s), then the question exits. |
| **Journey bar** | On every confirm: the cobalt line extends to the next dot and the plane moves along the path to it (MotionPath, 0.5 s, `power2.inOut`); the dot it leaves fills cobalt with a 1 → 1.4 → 1 scale pop (0.25 s). On Back, the plane moves backwards. |
| **Back** | Mirror of enter/exit (enter from the left). |

**Passage entrances** (each finishes within 1.2 s; then everything on screen is still):

| Passage | Animation |
|---|---|
| Email | Starts as a compact notification pill at the top of its column (avatar + sender + first line, 64px tall), slides down from y −40 with opacity 0 → 1 (0.4 s, `back.out(1.4)`), holds 0.15 s, then expands to the full card (height auto via Flip, 0.45 s, `power3.inOut`). |
| Ads | The two cards fade-up y 16, 120 ms apart; each lands with rotation −1.2° / +1.2° → 0 (0.5 s, `back.out(1.6)`), like pinned notes. |
| Door sign | The hanger line draws down (0.2 s), then the plaque swings in from `rotate: −14deg` with `transform-origin: top center` to 0, overshooting with `elastic.out(1, 0.45)` over 1.0 s. |
| Train board | Board fades in (0.2 s). Then every cell flips through 4–9 random characters (each flip 55 ms: the top half folds down via `rotateX`), finishing on its real character. Cells finish left to right, rows 120 ms apart. Total ≤ 1.2 s. The alert row finishes last. |

**Optional (only if time):**
- **Clock question (v5):** a 96px analogue clock (ink outline, cobalt minute hand) beside the prompt; hands sweep from 12:00 to 7:30 over 0.9 s, `power2.out`.
- **Number question (v3):** "47" shown in Anton 64px as two odometer digits that roll through 0–9 and settle (0.8 s, staggered 120 ms).

**Reduced motion:** questions swap instantly; option selection shows the final stroke immediately; passages appear in their final state; journey plane jumps.

---

## 8. Screen: Checking

Shown after question 15 for **1.6 s**, then auto-advances to results. (The glow is used to arrive here from question 15; checking → results has no glow, results enter directly.)

### 8.1 Layout

- White, centred column max 520px.
- Mono label `checking.title` ("CHECKING YOUR ANSWERS").
- Three readout lines, JetBrains Mono 15px, ink, each: label, a dotted leader, and a percentage right-aligned:
  ```
  VOCABULARY ............. 80%
  GRAMMAR ................ 70%
  READING ................ 40%
  ```

### 8.2 Motion

- Lines appear one by one, 300 ms apart: label text scrambles in (ScrambleText, chars "upperCase", 0.35 s), the dotted leader grows left → right (0.3 s), the percentage counts up (0.4 s).
- After the third line: hold 0.4 s, then results enter.
- Reduced motion: final text shown, auto-advance after 0.8 s.

---

## 9. Screen: Results

Single column, max-width 960px, centred; padding 24px 20px (phone), 56px 40px (desktop). Blocks are separated by 56px (phone) / 72px (desktop).

### 9.1 Order of blocks (top to bottom)

1. **Verdict block**
2. **Skill bars**
3. **Lucky-guess warning** (only if `result.luckyGuesses.warn`)
4. **Confidence dots**
5. **Practise these before you book**
6. **What this check can't see**
7. **Review your answers** (collapsed)
8. **How we calculate "ready"** (collapsed)
9. **Actions**

### 9.2 Verdict block

Desktop: two columns (left 60% / right 40%). Phone: stacked (left content, then globe).

**Left:**
- Mono label `results.label` ("YOUR RESULT").
- **The stamp** (`verdictStamp.js`): the verdict word (`results.verdict.<ready|almost|notYet>.stamp`, e.g. "READY TO BOOK", "ALMOST", "NOT YET") in Anton, `clamp(44px, 7vw, 84px)`, uppercase, coloured `--ready` / `--almost` / `--notyet`, inside a 4px border of the same colour with radius 10px and padding 6px 18px, rotated **−4°**. An "ink" texture: an SVG `feTurbulence` mask (baseFrequency .9, numOctaves 2) that removes ~12% of pixels so it looks stamped. Background of the whole verdict block: the matching `-wash` colour, radius card, padding 28px.
- 20px below: the **reason** sentence (`--fs-body-lg`, ink, Archivo 500) — text built from `CONTENT.md` templates.
- 8px below: the **next action** sentence (`--fs-body`, muted).
- 24px below: **score meter** (`scoreMeter.js`):
  - Big number: overall score in Anton 72px, ink, with "%" at 50% size.
  - Under it a 10px tall bar, radius pill, track `--hairline`, fill in the verdict colour.
  - A vertical tick at **75%** (ready line) and one at **55%** (almost line), each 18px tall, 2px ink, with mono 10px labels under them `results.readyLine` ("READY 75") / `results.almostLine` ("ALMOST 55").
  - A small mono caption: `results.passMarkNote` (the real exam pass mark is 60).

**Right:** the globe in results mode (§3.5, §3.6) with a mono caption under it: `results.journeyCaption` with the score inserted (e.g. "68% OF THE WAY TO GERMANY").

### 9.3 Skill bars

- Title `results.skillsTitle` (`--fs-h2`).
- Three rows (Vocabulary, Grammar, Reading — order from `sections.js`). Each row:
  - Left: skill name (Archivo 600 17px) + German name in mono label beside it.
  - Bar: 14px tall, radius pill, track `--hairline`. Fill: cobalt if ≥ 60, `--notyet` if < 60.
  - A dashed vertical line at **60%** across all three bars, with a mono label `results.skillLine` ("60% LINE") above the first bar.
  - Right: score in JetBrains Mono 500 16px + "· 4/5 right" muted.
- Rows 20px apart.

### 9.4 Lucky-guess warning

- A bar with `--almost-wash` background, 4px left border `--almost`, radius 10px, padding 16px 20px.
- Icon (a small dice outline, 20px, `--almost`) + text from `results.luckyWarning` with the numbers filled in.

### 9.5 Confidence dots

- Title `results.dotsTitle`, subtitle `results.dotsSubtitle` (muted).
- **Four columns** (2×2 grid on phones), each with a mono label and a count:
  | Group | Dot style | Label key |
  |---|---|---|
  | Sure and right | filled cobalt | `results.dots.sureRight` |
  | Guessed and right | cobalt ring 2px, white inside | `results.dots.guessedRight` |
  | Sure but wrong | filled `--notyet` | `results.dots.sureWrong` |
  | Guessed wrong or didn't know | filled `--hairline` | `results.dots.notKnown` |
- Each dot is 14px, in a wrapping row inside its column, gap 6px. Hovering / focusing a dot shows a tooltip with the question number and topic label.

### 9.6 Practise these before you book

- Title `results.practiceTitle`. If there are no recommendations, show `results.practiceNone` instead.
- One card per recommendation (max 3), stacked, gap 12px. Each card: `--surface`, radius card, padding 22px 24px.
  - Left: big mono number "01" in cobalt.
  - Topic label (Archivo 700 19px), then the **reason chip**: a small mono pill — `results.reason.sureWrong` ("YOU WERE SURE, BUT IT WAS WRONG", `--notyet` text on `--notyet-wash`), `results.reason.wrong` ("YOU GOT THIS WRONG"), `results.reason.unknown` ("YOU DIDN'T KNOW THIS YET"), or `results.reason.guessed` ("YOU GUESSED THIS ONE", `--almost` on `--almost-wash`) — then the tip (`--fs-body`, ink).

### 9.7 What this check can't see

- Title `results.coverageTitle`, intro `results.coverageIntro` (muted).
- **2×2 grid** (1 column on phones < 520px), gap 12px. One tile per real exam section: Lesen, Hören, Schreiben, Sprechen.
  - Lesen tile: white with hairline border, a `--ready` tick icon, label `coverage.lesen.title`, text `coverage.lesen.body`.
  - The other three: `--surface`, a muted "?" icon in a circle, title, and the self-check question (`coverage.<hoeren|schreiben|sprechen>`), in Archivo 15px.
  - Each tile shows "25 POINTS" as a mono label top-right (each section is 25 of 100 in the real exam).

### 9.8 Review your answers (collapsed)

- A `<details>` with summary `review.title` + mono count ("15 QUESTIONS"). Custom chevron, rotates 180° on open (0.25 s).
- Inside: one row per question in the original order: number, prompt (truncated to 1 line on phones), learner's answer, correct answer, a confidence chip (SURE / GUESSED / DIDN'T KNOW), a ✓ or ✗ (with text for screen readers), and the explanation (muted, 14px).

### 9.9 How we calculate "ready" (collapsed)

- A `<details>` with summary `method.title`. Inside: the method text from `CONTENT.md`, with the live numbers from `config.js` inserted (never hard-coded).

### 9.10 Actions

- Row: primary `actions.retake` ("TAKE THE CHECK AGAIN"), secondary `actions.home` ("BACK TO START"), text link `actions.copy` ("Copy my result") which copies the summary text from `CONTENT.md` and shows a toast `actions.copied` for 2 s (bottom centre, ink background, white mono 12px text, pill).

### 9.11 Motion — results entrance (ms from screen enter)

| Delay | What | Animation |
|---|---|---|
| 0 | Verdict block background | Fade in (0.3 s) |
| 100 | Label | Fade-up y 8 |
| 250 | **Stamp** | Starts at scale 1.6, rotate −10°, opacity 0, blur 4px → scale 1, rotate −4°, opacity 1, blur 0 in **0.42 s**, `power4.in`. On impact: the verdict block shakes (x: 0 → 4 → −3 → 2 → 0 px over 0.25 s) and a ring of the verdict colour expands from the stamp's centre (scale 0.6 → 1.6, opacity .35 → 0, 0.5 s). |
| 800 | Reason, next action | Fade-up y 10, 100 ms apart |
| 1000 | Score number | Count-up to `result.overall` (1.4 s) |
| 1000 | Score bar | Width 0 → overall% (1.4 s, `power3.out`); the two ticks fade in at 1.2 s |
| 1100 | Globe | Results-mode arc (§3.6) |

**Below the fold** (each block triggers when 15% of it enters the viewport, once):

| Block | Animation |
|---|---|
| Skill bars | Rows fade-up y 12, 120 ms apart; each fill grows from 0 (0.9 s, `power3.out`) and its score counts up; the 60% dashed line draws top → bottom (0.4 s). Any bar below 60 pulses after it finishes: a `--notyet` glow `box-shadow 0 0 0 0 → 0 0 0 6px rgba(220,38,38,.25) → 0` twice (0.6 s each). |
| Lucky-guess warning | Slides in from x −16, opacity 0 → 1 (0.4 s); the dice icon rotates 0 → 180° (0.6 s, `back.out(2)`). |
| Confidence dots | All 15 dots start in one row in question order above the four columns (shown for 0.3 s), then **Flip** into their groups (0.8 s, `power3.inOut`, stagger 35 ms), and the group counts count up. |
| Practice cards | Cards slide in from x 40px, opacity 0 → 1, 140 ms apart (0.6 s, "soft"). The tip text uses a gradient sweep: `background-clip: text` with a gradient white(transparent) → cobalt → ink, its position animated from 100% to 0% over 0.8 s, so the text sweeps in from cobalt to ink. |
| Coverage tiles | Fade-up y 12, 80 ms apart. The three untested tiles get a slow shimmer: a 30%-wide white-to-transparent diagonal band (opacity .5) sweeping across every 3.5 s, `power1.inOut`. Stops when the tab is hidden. |

**Retake:** glow transition (§4.4); the swap starts a fresh attempt at the Vocabulary section break.
**Reduced motion:** every block shows its final state on enter; no shimmer; no shake.

---

## 10. Motion rules (apply everywhere)

1. Nothing moves while the learner is reading a question, except direct responses to their input.
2. Passage entrances finish within 1.2 s.
3. Question-to-question transitions take ≤ 0.6 s in total (exit + enter). Never make the learner wait.
4. Every GSAP timeline is stored and killed in the screen's `destroy()`.
5. Respect `prefers-reduced-motion` and the debug "reduced" toggle everywhere: jump every timeline to its end.
6. `?slow=0.25` slows all GSAP animation for tuning (`ARCHITECTURE.md` §6).
7. Animate only `transform`, `opacity`, `clip-path` and canvas drawing where possible. Never animate `width`/`height`/`top`/`left` on large elements (skill-bar fills use `scaleX` with `transform-origin: left`).

---

## 11. Priority (what to cut if time runs out)

| Priority | Items |
|---|---|
| **Must-have** | Globe hero with arc + plane; headline glitch reveal; journey bar with moving plane; option stroke draw; confidence button feedback; score count-up; skill bars; visa stamp; results-mode arc |
| **Nice to have** | Horizon glow transitions; split-flap board; email notification expand; door-sign swing; confidence-dots Flip; checking readout; practice-card sweep; section-break sliding letters |
| **Only if time** | Floating German words; clock and odometer extras; coverage shimmer |

If something nice-to-have is cut, its element still appears in its final, static state.

---

## 12. Acceptance check

**Landing (1440×900):** the dotted globe fades in on the right and sways gently; India and Germany pins pop in; the arc draws and a small plane with a fading trail flies India → Germany on a loop. "AM I / EXAM / READY?" glitches in line by line under the cobalt overline; paragraph, buttons and the meta line fade up, and the meta numbers count up.

**Landing (390×844):** copy first, globe below it with a soft fade at the bottom; buttons are full-width or side by side; nothing scrolls sideways.

**Start:** headline glitches out, the cobalt glow rises and covers the page, and the Vocabulary section break appears as it fades; "WORTSCHATZ" slides behind "01 / 03 · VOCABULARY".

**Questions:** the journey bar shows 15 dots with the plane on the current one; tapping an option draws a cobalt outline; the two confidence buttons switch on; "I'm sure" sweeps blue, "I guessed" wobbles; the plane hops to the next dot. On phones the confidence bar stays pinned at the bottom.

**Reading:** the email arrives as a notification and opens into a full email (and stays still for the second question); the ads land like pinned notes; the doctor's plaque swings in; the train board flips its letters into place, ending with the amber delay line. Nothing moves after 1.2 s.

**Checking:** three lines type in with counting percentages.

**Results:** the verdict stamp thuds onto a tinted block, which shakes slightly; the score counts up and the bar fills to it, with the 75 and 55 ticks; the globe's arc draws partway toward Germany (all the way for "ready"). Scrolling down: skill bars grow (red pulse under 60%), the lucky-guess warning slides in when it applies, 15 dots sort into four groups, practice cards sweep in, the three untested exam sections shimmer gently.

**Everywhere:** with reduced motion on, every screen shows its final state immediately and the globe is still. No horizontal scroll at any test size. Every control works by keyboard with a visible focus ring.
