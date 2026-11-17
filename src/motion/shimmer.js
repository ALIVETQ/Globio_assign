// Coverage-tile shimmer (DESIGN.md §9.11): a 30%-wide diagonal band sweeps
// slowly across each untested tile, once every 3.5 s (power1.inOut), forever.
//
// It is the only endless animation on the results page, so it looks after
// itself: paused while the tab is hidden, and stopped for good if reduced
// motion is switched on (prefs.js finishes timed tweens, but an endless one has
// no end to jump to).
import { gsap } from "./gsap.js";
import { reducedMotion, onPrefsChange } from "./prefs.js";

const PERIOD = 3.5;
// The band rests just off the tile's left edge (CSS) and is 30% of the tile
// wide. 620% of its own width carries it fully past the right edge, including
// the lower corner of the skew on a tall phone tile, so the jump back to the
// start of the next sweep is never seen.
const TO = 620;
const OFFSET = 0.08; // same 80 ms step as the tiles' fade-up

// Returns stop() for cleanup.
export function startShimmer(bands) {
  if (reducedMotion || !bands.length) return () => {};
  const tweens = [...bands].map((band, i) =>
    gsap.fromTo(band, { xPercent: 0, skewX: -20 }, { xPercent: TO, skewX: -20, duration: PERIOD, ease: "power1.inOut", repeat: -1, delay: i * OFFSET }),
  );
  const onVisibility = () => tweens.forEach((t) => (document.hidden ? t.pause() : t.resume()));
  const stop = () => {
    tweens.forEach((t) => t.kill());
    gsap.set(bands, { clearProps: "transform" }); // back to the CSS rest position, off the tile
    document.removeEventListener("visibilitychange", onVisibility);
    offPrefs();
  };
  const offPrefs = onPrefsChange(() => reducedMotion && stop());
  document.addEventListener("visibilitychange", onVisibility);
  return stop;
}
