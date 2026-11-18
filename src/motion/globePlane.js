// The globe's plane and contrail (DESIGN.md §3.4 item 8, §3.6), drawn by
// globeDraw.js: an airliner seen from above, pointing along the route, with the
// last positions as small fading dots behind it.

// An airliner seen from above, nose pointing +x, 24 units long (scaled to size).
const HALF = [[12, 0], [9, -1.6], [2, -1.9], [-4, -10.5], [-7, -10.5], [-3.5, -1.9], [-8, -1.7], [-11, -5.5], [-13, -5.5], [-11.5, 0]];
export const PLANE_SHAPE = [...HALF, ...HALF.slice(1, -1).reverse().map(([x, y]) => [x, -y])];

// helpers from drawFrame: rot/px/hidden (projection), arcPoint (route), k (size), halo (colour).
export function drawPlane(ctx, f, { rot, px, hidden, arcPoint, k, halo }) {
  const dotR = Math.max(1.6, 2.2 * k);
  ctx.fillStyle = f.colors.cobalt;
  const n = f.trail.length;
  for (let i = n - 1; i >= 0; i--) {
    const p = rot(...arcPoint(f.trail[i]));
    if (hidden(p)) continue;
    const age = (i + 1) / n;
    ctx.globalAlpha = f.alpha * 0.5 * (1 - age);
    ctx.beginPath();
    ctx.arc(...px(p), dotR * (1 - 0.6 * age), 0, Math.PI * 2);
    ctx.fill();
  }
  const p = rot(...arcPoint(f.plane));
  if (!hidden(p)) {
    // Heading: towards a point a little further along (or back from the end).
    const ahead = f.plane < 0.99 ? rot(...arcPoint(f.plane + 0.01)) : p;
    const behind = f.plane < 0.99 ? p : rot(...arcPoint(f.plane - 0.01));
    const [x0, y0] = px(behind), [x1, y1] = px(ahead);
    const len = Math.max(14, 22 * k) * (f.planeSize ?? 1);
    ctx.save();
    ctx.translate(...px(p));
    ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
    ctx.scale(len / 24, len / 24);
    ctx.beginPath();
    PLANE_SHAPE.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.globalAlpha = f.alpha;
    ctx.lineJoin = "round";
    ctx.lineWidth = 3 * (24 / len); // a 1.5px page-coloured halo, so it reads over the dots
    ctx.strokeStyle = halo;
    ctx.stroke();
    ctx.fillStyle = f.colors.cobalt;
    ctx.fill();
    ctx.restore();
  }
}
