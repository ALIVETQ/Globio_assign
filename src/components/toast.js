// A short message at the bottom centre of the screen (DESIGN.md §9.10), used
// for "Copied to clipboard". It is a polite live region, so screen readers
// announce it too. Returns { show(text), destroy() }.
const SHOW_MS = 2000;

export function createToast() {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.hidden = true;
  document.body.append(el);
  let timer = null;
  return {
    show(text) {
      clearTimeout(timer);
      el.textContent = text;
      el.hidden = false;
      timer = setTimeout(() => (el.hidden = true), SHOW_MS);
    },
    destroy() {
      clearTimeout(timer);
      el.remove();
    },
  };
}
