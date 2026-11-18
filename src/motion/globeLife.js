// More life on the landing globe (DESIGN.md §3.6): other journeys between
// Indian and German cities, rings when the main flight leaves India, a flash
// and an "ANKUNFT" split-flap label when it lands. globe.js decides WHEN (from
// the globe clock); the draw functions here are called by globeDraw.js.
// Its own toVec (same maths as globeDraw.js): importing it would be circular,
// since globeDraw.js imports the draw functions from here.
const RAD = Math.PI / 180;
const toVec = (lat, lon) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];

const DEG_PTS = 40; // points per extra arc

// Other journeys, India → Germany (lat, lon). No pins or labels for these.
const CITIES = {
  mumbai: [19.08, 72.88], frankfurt: [50.11, 8.68],
  bengaluru: [12.97, 77.59], munich: [48.14, 11.58],
  chennai: [13.08, 80.27], stuttgart: [48.78, 9.18],
  hyderabad: [17.39, 78.49], hamburg: [53.55, 9.99],
  kolkata: [22.57, 88.36], berlin: [52.52, 13.4],
};
const ROUTES = [
  ["mumbai", "frankfurt"], ["bengaluru", "munich"], ["chennai", "stuttgart"],
  ["hyderabad", "hamburg"], ["kolkata", "berlin"],
];

// Same shape as the main route: a slerp lifted off the surface (more for longer routes).
function arcBetween(a, b) {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const w = Math.acos(Math.min(1, Math.max(-1, dot)));
  return Array.from({ length: DEG_PTS }, (_, i) => {
    const t = i / (DEG_PTS - 1);
    const s = Math.sin(w);
    const ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
    const lift = 1 + (0.18 + (0.42 * w) / Math.PI) * Math.sin(Math.PI * t);
    return [0, 1, 2].map((k) => (ka * a[k] + kb * b[k]) * lift);
  });
}
const ARCS = ROUTES.map(([a, b]) => arcBetween(toVec(...CITIES[a]), toVec(...CITIES[b])));

// Timings (s of globe time)
const FIRST = 2.4, EVERY = 1.6, MAX = 2;
const DRAW = 0.8, TRAVEL = 2.4, FADE = 0.6, LIFE = DRAW + TRAVEL + FADE;

// Air traffic: every 1.6 s one route starts at random, never more than 2 at once.
export function createTraffic() {
  let jobs = [];
  let slot = 0;
  return {
    reset() {
      jobs = [];
      slot = 0;
    },
    at(t) {
      for (let s = FIRST + slot * EVERY; s <= t; slot++, s = FIRST + slot * EVERY) {
        const live = jobs.filter((j) => s < j.start + LIFE);
        if (live.length >= MAX) continue;
        const busy = new Set(live.map((j) => j.route));
        const free = ARCS.map((_, i) => i).filter((i) => !busy.has(i));
        jobs.push({ route: free[Math.floor(Math.random() * free.length)], start: s });
      }
      jobs = jobs.filter((j) => t < j.start + LIFE);
      return jobs.map((j) => {
        const e = t - j.start;
        return {
          pts: ARCS[j.route],
          draw: Math.min(1, e / DRAW),
          dot: e >= DRAW && e < DRAW + TRAVEL ? (e - DRAW) / TRAVEL : null,
          fade: e > DRAW + TRAVEL ? Math.max(0, 1 - (e - DRAW - TRAVEL) / FADE) : 1,
        };
      });
    },
  };
}

const pointAt = (pts, u) => {
  const f = Math.min(1, Math.max(0, u)) * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(f));
  return [0, 1, 2].map((k) => pts[i][k] + (pts[i + 1][k] - pts[i][k]) * (f - i));
};

// Drawn under the main route: 0.8px arcs at 25% cobalt, a 1.5px dot travelling.
export function drawTraffic(ctx, f, { rot, px, hidden }) {
  for (const j of f.traffic) {
    const n = Math.max(1, Math.round(j.draw * (j.pts.length - 1)));
    ctx.globalAlpha = f.alpha * 0.25 * j.fade;
    ctx.strokeStyle = f.colors.cobalt;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 1; i <= n; i++) {
      const a = rot(...j.pts[i - 1]), b = rot(...j.pts[i]);
      if (hidden(a) || hidden(b)) continue;
      ctx.moveTo(...px(a));
      ctx.lineTo(...px(b));
    }
    ctx.stroke();
    if (j.dot !== null) {
      const p = rot(...pointAt(j.pts, j.dot));
      if (!hidden(p)) {
        ctx.globalAlpha = f.alpha * 0.9 * j.fade;
        ctx.fillStyle = f.colors.cobalt;
        ctx.beginPath();
        ctx.arc(...px(p), 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = f.alpha;
}

// Departure rings at India (radius 0 → 28px·k, alpha .5 → 0) and the arrival
// flash at Germany (a radial glow, fading over 0.4 s). Drawn under the pins.
export function drawEvents(ctx, f, { from, to, k }) {
  ctx.strokeStyle = f.colors.cobalt;
  ctx.lineWidth = 1.5;
  for (const p of f.rings) {
    if (!from) break;
    ctx.globalAlpha = f.alpha * 0.5 * (1 - p);
    ctx.beginPath();
    ctx.arc(...from, Math.max(0.1, 28 * k * p), 0, Math.PI * 2);
    ctx.stroke();
  }
  if (f.flash !== null && to) {
    const r = 30 * k + 10;
    const g = ctx.createRadialGradient(...to, 0, ...to, r);
    g.addColorStop(0, f.colors.cobalt);
    g.addColorStop(1, "rgba(47,99,255,0)");
    ctx.globalAlpha = f.alpha * 0.55 * (1 - f.flash);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(...to, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = f.alpha;
}

// Split-flap style label change: letters lock in left to right over `dur`,
// the rest show random capitals (re-drawn ~25 times a second).
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function scramble(fromText, toText, p, t) {
  const len = Math.max(fromText.length, toText.length);
  let out = "";
  for (let i = 0; i < len; i++) {
    if (p >= (i + 1) / len) out += toText[i] ?? "";
    else {
      const h = Math.abs(Math.sin((i + 1) * 12.9898 + Math.floor(t * 25) * 78.233)) * 43758.5453;
      out += GLYPHS[Math.floor((h % 1) * GLYPHS.length)];
    }
  }
  return out.trimEnd();
}

// s = seconds since the main flight landed (null = not recently).
// 0–0.5 flip to ANKUNFT · hold 0.8 s · 0.5 s flip back to GERMANY.
export function arrivalLabel(s, home, arrived) {
  if (s === null || s >= 1.8) return home;
  if (s < 0.5) return scramble(home, arrived, s / 0.5, s);
  if (s < 1.3) return arrived;
  return scramble(arrived, home, (s - 1.3) / 0.5, s);
}
