// Drag to spin the landing globe (DESIGN.md §3.6). Mouse and pen only: touch is
// ignored so phones still scroll the page normally. The drag adds an offset to
// the view (longitude, and latitude clamped so the view stays within ±35°);
// after release it keeps spinning with inertia (×0.92 per frame), and after
// 1.5 s without input it eases back to the default view over 1.2 s.
const DECAY = 0.92;
const IDLE_MS = 1500, BACK_MS = 1200;
const LAT_LIMIT = 35;

const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2); // power2.inOut

// baseLat: the default view latitude (the offset is clamped around it).
export function createDrag(canvas, { radius, baseLat }) {
  const s = { lon: 0, lat: 0, vLon: 0, vLat: 0, down: null, last: 0, back: null };
  const degPerPx = () => 57.3 / Math.max(1, radius());
  const clampLat = (lat) => Math.max(-LAT_LIMIT - baseLat, Math.min(LAT_LIMIT - baseLat, lat));

  const onDown = (e) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    s.down = { x: e.clientX, y: e.clientY };
    s.vLon = s.vLat = 0;
    s.back = null;
    s.last = performance.now();
    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onMove = (e) => {
    if (!s.down) return;
    const k = degPerPx();
    // Drag right → the land moves right (the view turns west); drag down → north comes into view.
    const dLon = -(e.clientX - s.down.x) * k;
    const dLat = (e.clientY - s.down.y) * k;
    s.lon += dLon;
    s.lat = clampLat(s.lat + dLat);
    s.vLon = dLon;
    s.vLat = dLat;
    s.down = { x: e.clientX, y: e.clientY };
    s.last = performance.now();
  };
  const onUp = () => {
    if (!s.down) return;
    s.down = null;
    s.last = performance.now();
    canvas.style.cursor = "grab";
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.style.cursor = "grab";

  return {
    // Advance inertia / the ease back. now = performance.now(). Returns the offsets.
    step(now) {
      if (!s.down) {
        if (Math.abs(s.vLon) + Math.abs(s.vLat) > 0.01) {
          s.lon += s.vLon;
          s.lat = clampLat(s.lat + s.vLat);
          s.vLon *= DECAY;
          s.vLat *= DECAY;
          s.last = now;
        } else if ((s.lon || s.lat) && now - s.last > IDLE_MS) {
          s.back ??= { lon: s.lon, lat: s.lat, start: now };
          const u = Math.min(1, (now - s.back.start) / BACK_MS);
          const e = 1 - easeInOut(u);
          s.lon = s.back.lon * e;
          s.lat = s.back.lat * e;
          if (u >= 1) s.lon = s.lat = 0, (s.back = null);
        }
      }
      return { lon: s.lon, lat: s.lat };
    },
    destroy() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.style.cursor = "";
    },
  };
}
