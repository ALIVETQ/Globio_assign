// Run once: world map → src/data/landdots.json (DESIGN.md §3.1).
//   npm run build:dots
//
// Why precompute: the browser never downloads the world map or topojson. It gets
// a small flat list of land dots and only has to project them each frame.
//
// Grid: rows from −58° to +80° latitude every 1.9°; each row has
// round(360·cos(lat) / 1.9) points so dots stay evenly spaced on the sphere;
// every other row is offset by half a step. A point is kept if it is on land
// (even-odd point-in-polygon over all rings, so lakes/holes are respected).
// Output: flat integer array [lon×10, lat×10, …]. Target ≈ 3,000 dots, < 40 KB.
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const STEP = 1.9;
const LAT_MIN = -58;
const LAT_MAX = 80;
const OUT = new URL("../src/data/landdots.json", import.meta.url);

const topo = JSON.parse(await readFile(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);
const geometries = land.type === "FeatureCollection" ? land.features.map((f) => f.geometry) : [land.geometry];

// Every ring of every polygon, with a bounding box to skip most tests quickly.
const rings = [];
for (const g of geometries) {
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  for (const poly of polys) {
    for (const ring of poly) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of ring) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      rings.push({ ring, minX, minY, maxX, maxY });
    }
  }
}

// Even-odd rule across ALL rings: inside an outer ring flips to "in", inside a
// hole flips back to "out". That handles holes without tracking which is which.
function onLand(lon, lat) {
  let inside = false;
  for (const { ring, minX, minY, maxX, maxY } of rings) {
    if (lon < minX || lon > maxX || lat < minY || lat > maxY) continue;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

const dots = [];
let row = 0;
for (let lat = LAT_MIN; lat <= LAT_MAX + 1e-9; lat = LAT_MIN + ++row * STEP) {
  const n = Math.round((360 * Math.cos((lat * Math.PI) / 180)) / STEP);
  if (n <= 0) continue;
  const step = 360 / n;
  const offset = row % 2 ? step / 2 : 0;
  for (let k = 0; k < n; k++) {
    let lon = -180 + offset + k * step;
    if (lon >= 180) lon -= 360;
    if (onLand(lon, lat)) dots.push(Math.round(lon * 10), Math.round(lat * 10));
  }
}

const json = JSON.stringify(dots);
await writeFile(OUT, json + "\n");
console.log(`landdots.json: ${dots.length / 2} dots, ${(json.length / 1024).toFixed(1)} KB`);
