// fill(template, values): replaces every {name} with values.name (LOGIC.md §11).
//
// In development a missing value throws, so a typo in CONTENT.md or a forgotten
// value is caught at once. In production the placeholder is left as is, because
// a visible "{overall}" is better than a blank results page for a learner.

const IS_DEV = typeof import.meta !== "undefined" && import.meta.env ? Boolean(import.meta.env.DEV) : false;

export function fill(template, values = {}, { strict = IS_DEV } = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, name) => {
    const v = values[name];
    if (v === undefined || v === null) {
      if (strict) throw new Error(`fill(): no value for {${name}} in "${template}"`);
      return match;
    }
    return String(v);
  });
}
