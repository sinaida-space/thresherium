// Thresherium — app shell and router.
//
// Hash routes: #/ (placeholder "Arrival"), #/welcome, #/privacy, #/about, #/404
//
// Consent gate: every route except welcome, privacy, about and 404 needs a
// valid consent record. Without one, the visitor is sent to #/welcome.
//
// Google-Translate safety: routing reads only data-* attributes and values
// captured by reference. Nothing here reads textContent/innerText.

import { el } from "./dom.js";
import { mountScreen } from "./screen.js";
import { renderWelcome, readConsent } from "./welcome.js";
import { renderPrivacy, renderAbout, renderNotFound } from "./pages.js";
import { renderHeader, renderFooter } from "./chrome.js";
import { initCookieNotice } from "./cookie.js";
import { initBackdrop } from "./backdrop.js";

const OPEN_ROUTES = ["welcome", "privacy", "about", "404"];

function paintChrome() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (header) header.replaceChildren(renderHeader());
  if (footer) footer.replaceChildren(renderFooter());
}

// Placeholder landing screen. A later task replaces this with the real
// Arrival flow; the export name is the stub other tasks build against.
export function mountArrival() {
  const root = el("section", { class: "screen-panel", "data-role": "arrival" });
  root.appendChild(el("span", { class: "card__label" }, "Arrival"));
  root.appendChild(el("h1", { class: "card__q" }, "The instrument is not built yet."));
  root.appendChild(
    el(
      "p",
      { class: "card__note" },
      "Its shell, its consent gate and its storage notice already exist. A later milestone fills this screen."
    )
  );
  mountScreen(root);
}

function router() {
  const raw = (window.location.hash || "#/").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  const route = parts[0] || "";

  paintChrome();

  if (route === "welcome") return mountScreen(renderWelcome());
  if (route === "privacy") return mountScreen(renderPrivacy());
  if (route === "about") return mountScreen(renderAbout());
  if (route === "404") return mountScreen(renderNotFound());

  if (!readConsent()) {
    window.location.hash = "#/welcome";
    return;
  }

  if (!route) return mountArrival();

  // Unknown route: render the styled 404 view in place, no silent redirect.
  return mountScreen(renderNotFound());
}

// ---- boot -------------------------------------------------------------------
// Module scripts are deferred, so the DOM is already parsed here.

initCookieNotice();
initBackdrop();
window.addEventListener("hashchange", router);
router();
