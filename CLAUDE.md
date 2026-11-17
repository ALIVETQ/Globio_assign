# CLAUDE.md

This project is "Am I exam-ready?", a small web app that tells A1 German learners if they are ready to book their Goethe or ÖSD exam.

## Read first
The full spec is in `docs/`. Read `docs/ARCHITECTURE.md` first, then the others as each phase needs them:
- `docs/ARCHITECTURE.md` — stack, folders, state, build phases (§11)
- `docs/DESIGN.md` — tokens, layouts, every animation with timings
- `docs/CONTENT.md` — every word on screen (copy exactly)
- `docs/LOGIC.md` — scoring, verdict, recommendations, shuffling, test cases

## Working rules
- Work on ONE phase at a time (`ARCHITECTURE.md` §11). Do step (a) "make it work", commit, then step (b) "make it move", commit. Stop and report when a phase is done. Do not start the next phase until told.
- Before starting a phase, re-read the sections of the docs that phase needs.
- Copy text exactly from `CONTENT.md` and numbers exactly from `LOGIC.md` / `DESIGN.md`. Never invent copy, thresholds or timings.
- No new dependencies beyond those in `ARCHITECTURE.md` §2 without asking.
- If the docs are unclear or contradict each other, stop and ask.
- Keep files under ~200 lines. Comment the *why*, especially in `src/logic/` and `src/data/config.js`.

## Commands
- `npm run dev` — local dev server
- `npm test` — Vitest (run before every commit touching `src/logic/` or `src/data/`)
- `npm run build` — production build
- Debug: open the app with `?debug=1` (screen jumper, result presets, replay, slow-mo); `?slow=0.25` slows all animation.

## Git
- Commit after each completed step with a clear message, e.g. `Phase 2a: question engine for vocabulary`.
- Push to `main` at the end of every phase (Vercel deploys automatically).
