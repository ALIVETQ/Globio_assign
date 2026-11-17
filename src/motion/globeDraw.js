// Globe geometry and one-frame drawing (DESIGN.md §3.1–3.4). No timing here:
// globe.js decides WHAT the frame shows (sway, fades, arc progress, plane) and
// calls drawFrame(). Every number below is from DESIGN.md §3.
import landDots from "../data/landdots.json";

const DEG = Math.PI / 180;
export const VIEW_LAT = 30; // °N: India and Germany both on the visible face
export const VIEW_LON = 45; // °E
export const ARC_POINTS = 64;
const PLACES = { from: [28.61, 77.21], to: [52.52, 13.4] }; // New Delhi, Berlin

export function toVec(lat, lon) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

// Land dots as a flat [x, y, z, …] array. lowPower keeps every second dot.
export function buildDots(lowPower) {
  const out = [];
  for (let i = 0, n = 0; i < landDots.length; i += 2, n++) {
    if (lowPower && n % 2) continue;
    out.push(...toVec(landDots[i + 1] / 10, landDots[i] / 10));
  }
  return new Float32Array(out);
}

export const FROM = toVec(...PLACES.from);
export const TO = toVec(...PLACES.to);

// 64 slerp points India → Germany, lifted off the surface so the arc reads as a
// flight path. Longer routes lift higher (ω = angle between the places).
// Base lift 0.18 (was 0.08): seen almost head-on, a lower arc looked flat.
const BASE_LIFT = 0.18;
export const ARC = (() => {
  const dot = FROM[0] * TO[0] + FROM[1] * TO[1] + FROM[2] * TO[2];
  const w = Math.acos(Math.min(1, Math.max(-1, dot)));
  const pts = [];
  for (let i = 0; i < ARC_POINTS; i++) {
    const t = i / (ARC_POINTS - 1);
    const a = Math.sin((1 - t) * w) / Math.sin(w);
    const b = Math.sin(t * w) / Math.sin(w);
    const lift = 1 + (BASE_LIFT + (0.42 * w) / Math.PI) * Math.sin(Math.PI * t);
    pts.push([0, 1, 2].map((k) => (a * FROM[k] + b * TO[k]) * lift));
  }
  return pts;
})();

// Rotate around the vertical axis by −viewLon, then the horizontal axis by viewLat.
export function rotator(viewLonDeg) {
  const cl = Math.cos(viewLonDeg * DEG), sl = Math.sin(viewLonDeg * DEG);
  const cp = Math.cos(VIEW_LAT * DEG), sp = Math.sin(VIEW_LAT * DEG);
  return (x, y, z) => {
    const x1 = x * cl - z * sl;
    const z1 = z * cl + x * sl;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  };
}

// A point on the arc at s ∈ [0, 1], interpolated between the 64 samples.
export function arcPoint(s) {
  const f = Math.min(1, Math.max(0, s)) * (ARC_POINTS - 1);
  const i = Math.min(ARC_POINTS - 2, Math.floor(f));
  const u = f - i;
  return [0, 1, 2].map((k) => ARC[i][k] + (ARC[i + 1][k] - ARC[i][k]) * u);
}

// Canvas colours that aren't tokens. Light = DESIGN.md §3.4 exactly; dark =
// DESIGN.md §2.6 (a deep navy sphere, so the light land dots read like ink on paper).
const PALETTE = {
  light: {
    haze: [[0, "rgba(47,99,255,.45)"], [0.12, "rgba(90,128,255,.26)"], [0.4, "rgba(169,188,255,.14)"], [1, "rgba(238,242,255,0)"]],
    body: [[0, "#ffffff"], [0.55, "#f6f8ff"], [0.85, "#e8eeff"], [1, "#d5dfff"]],
    limb: [[0, "rgba(47,99,255,0)"], [0.75, "rgba(47,99,255,.10)"], [1, "rgba(47,99,255,.38)"]],
    rim: "rgba(47,99,255,.35)",
    highlight: "rgba(255,255,255,.9)",
    halo: "rgba(255,255,255,.9)",
  },
  dark: {
    haze: [[0, "rgba(91,128,255,.35)"], [0.12, "rgba(70,105,230,.2)"], [0.4, "rgba(50,80,190,.1)"], [1, "rgba(14,16,22,0)"]],
    body: [[0, "#232b48"], [0.55, "#1a2139"], [0.85, "#141a31"], [1, "#11183a"]],
    limb: [[0, "rgba(107,140,255,0)"], [0.75, "rgba(107,140,255,.12)"], [1, "rgba(107,140,255,.42)"]],
    rim: "rgba(107,140,255,.45)",
    highlight: "rgba(255,255,255,.18)",
    halo: "rgba(14,16,22,.9)",
  },
};

// Behind the globe = facing away AND covered by the disc (§3.4 item 6).
const hidden = ([x, y, z]) => z <= 0 && x * x + y * y < 1;

function radial(ctx, x0, y0, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

// f = { w, h, cx, cy, R, viewLon, alpha, pins: {from, to}, arc, plane, trail, pulse, labels, colors, dots }
export function drawFrame(ctx, f) {
  const { cx, cy, R, colors } = f;
  const k = R / 400;
  const pal = colors.dark ? PALETTE.dark : PALETTE.light;
  const rot = rotator(f.viewLon);
  const px = (p) => [cx + R * p[0], cy - R * p[1]];

  ctx.clearRect(0, 0, f.w, f.h);
  ctx.save();
  ctx.globalAlpha = f.alpha;

  // 1. Haze
  const hx = cx - 0.05 * R, hy = cy + 0.08 * R;
  ctx.fillStyle = radial(ctx, hx, hy, 0.9 * R, hx, hy, 1.5 * R, pal.haze);
  ctx.fillRect(0, 0, f.w, f.h);

  // 2. Sphere body
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = radial(ctx, cx + 0.3 * R, cy - 0.42 * R, 0.05 * R, cx + 0.1 * R, cy - 0.15 * R, 1.25 * R, pal.body);
  ctx.fill();

  // 3–4. Limb shading and land dots, clipped to the disc
  ctx.save();
  ctx.clip();
  ctx.fillStyle = radial(ctx, cx, cy, 0.8 * R, cx, cy, R, pal.limb);
  ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const buckets = [0, 1, 2, 3, 4].map(() => new Path2D());
  const base = Math.max(0.9, 1.7 * k);
  const d = f.dots;
  for (let i = 0; i < d.length; i += 3) {
    const [x, y, z] = rot(d[i], d[i + 1], d[i + 2]);
    if (z <= 0.02) continue;
    const r = base * (0.5 + 0.5 * Math.sqrt(z));
    const sx = cx + R * x, sy = cy - R * y;
    const b = buckets[Math.min(4, Math.floor(z * 5.5))];
    b.moveTo(sx + r, sy);
    b.arc(sx, sy, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = colors.ink;
  buckets.forEach((path, b) => {
    ctx.globalAlpha = f.alpha * (0.2 + b * 0.18);
    ctx.fill(path);
  });
  ctx.restore();
  ctx.globalAlpha = f.alpha;

  // 5. Rim + highlight
  ctx.lineWidth = Math.max(1, 1.4 * k);
  ctx.strokeStyle = pal.rim;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = pal.highlight;
  ctx.beginPath();
  ctx.arc(cx, cy, R - 0.8, -2.4, -0.3);
  ctx.stroke();

  // 6. Arc, drawn up to f.arc of its length; runs break where it passes behind
  if (f.arc > 0) {
    const n = f.arc * (ARC_POINTS - 1);
    const pts = [];
    for (let i = 0; i <= Math.floor(n); i++) pts.push(rot(...ARC[i]));
    if (n % 1 > 0) pts.push(rot(...arcPoint(f.arc)));
    ctx.globalAlpha = f.alpha * 0.85;
    ctx.strokeStyle = colors.cobalt;
    ctx.lineWidth = Math.max(1.2, 1.4 * k);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 1; i < pts.length; i++) {
      if (hidden(pts[i - 1]) || hidden(pts[i])) continue;
      ctx.moveTo(...px(pts[i - 1]));
      ctx.lineTo(...px(pts[i]));
    }
    ctx.stroke();
    ctx.globalAlpha = f.alpha;
  }

  // 7. Pins with labels (and the Germany arrival pulse)
  const pinR = Math.max(3.5, 5 * k);
  ctx.font = `500 ${Math.max(10, 12.5 * k)}px ${colors.monoFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.05em";
  for (const [key, vec, label] of [["from", FROM, f.labels.from], ["to", TO, f.labels.to]]) {
    const a = f.pins[key];
    const p = rot(...vec);
    if (a <= 0 || p[2] <= 0.02) continue;
    const [sx, sy] = px(p);
    ctx.globalAlpha = f.alpha * a;
    ctx.fillStyle = colors.paper;
    ctx.beginPath();
    ctx.arc(sx, sy, pinR + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.cobalt;
    ctx.beginPath();
    ctx.arc(sx, sy, pinR, 0, Math.PI * 2);
    ctx.fill();
    if (key === "to" && f.pulse !== null) {
      ctx.globalAlpha = f.alpha * a * (1 - f.pulse);
      ctx.strokeStyle = colors.cobalt;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, pinR * (1 + 1.4 * f.pulse), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = f.alpha * a;
    }
    // Soft halo (page-coloured) first, so the label reads over the land dots.
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeStyle = pal.halo;
    ctx.strokeText(label, sx, sy - pinR - 6);
    ctx.fillStyle = colors.ink;
    ctx.fillText(label, sx, sy - pinR - 6);
  }

  // 8. Plane and its trail (oldest first, so the plane is drawn on top)
  if (f.plane !== null) {
    const planeR = Math.max(2.5, 3.2 * k);
    ctx.fillStyle = colors.cobalt;
    const n = f.trail.length;
    for (let i = n - 1; i >= -1; i--) {
      const s = i === -1 ? f.plane : f.trail[i];
      const p = rot(...arcPoint(s));
      if (hidden(p)) continue;
      const age = (i + 1) / n; // 0 for the plane itself
      ctx.globalAlpha = f.alpha * (i === -1 ? 1 : 0.6 * (1 - age));
      ctx.beginPath();
      ctx.arc(...px(p), planeR * (i === -1 ? 1 : 1 - 0.6 * age), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
