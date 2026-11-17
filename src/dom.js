// Tiny DOM helpers shared by screens and components.

// Escape text before putting it into an innerHTML template. Content is ours, but
// it contains quotes and could one day contain "<" or "&".
export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Build one root element from an HTML string.
export function fromHTML(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// Event delegation: one click listener on the screen root, routed by
// data-action. Returns a function that removes the listener (for destroy()).
export function onAction(root, handlers) {
  const listener = (e) => {
    const target = e.target.closest("[data-action]");
    if (!target || !root.contains(target) || target.disabled) return;
    const fn = handlers[target.dataset.action];
    if (fn) fn(target, e);
  };
  root.addEventListener("click", listener);
  return () => root.removeEventListener("click", listener);
}
