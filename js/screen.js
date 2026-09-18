// Thresherium — shared screen mount, used by app.js so a screen can be
// swapped in without re-implementing focus and scroll handling each time.

export function screenNode() {
  return document.getElementById("screen");
}

// Move focus to the freshly mounted panel so keyboard and screen-reader users
// land on the new screen. The panel is not a natural tab stop, so it takes a
// programmatic tabindex of -1. preventScroll keeps the focus call from nudging
// the page; the explicit scroll below is what puts every screen at the top.
function focusPanel(node) {
  if (!node || node.nodeType !== 1 || typeof node.focus !== "function") return;
  if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
  try {
    node.focus({ preventScroll: true });
  } catch (e) {
    node.focus();
  }
}

export function mountScreen(node) {
  const host = screenNode();
  if (!host) return;
  host.replaceChildren(node);
  focusPanel(node);
  // Every screen starts at the top. Without this, a route change can land
  // mid-page, because focusing the panel pulls it into view.
  window.scrollTo(0, 0);
}

export function goHome() {
  window.location.hash = "#/";
}
