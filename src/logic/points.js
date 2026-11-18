// How a credit from config.js is written in text: halves as "½", a real minus
// sign, and optionally a "+" on positive values ("+1", "½", "−½").
export function formatPoints(n, { sign = false } = {}) {
  const abs = Math.abs(n);
  const whole = Math.trunc(abs);
  const half = abs - whole === 0.5;
  const body = half ? `${whole || ""}½` : String(abs);
  if (n < 0) return `−${body}`;
  return sign && n > 0 ? `+${body}` : body;
}
