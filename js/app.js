// Thresherium — app shell and router.
//
// Hash routes: #/ (arrival), #/menu/:route, #/flow/:id, #/energy, #/commit,
// #/plan, #/exit, plus the open pages #/welcome, #/privacy, #/about, #/404.
//
// Consent gate: every route except welcome, privacy, about and 404 needs a
// valid consent record. Without one, the visitor is sent to #/welcome.
//
// Google-Translate safety: routing reads only data-* attributes and values
// captured by reference. Nothing here reads textContent/innerText.

import { mountScreen } from "./screen.js";
import { renderWelcome, readConsent } from "./welcome.js";
import { renderPrivacy, renderAbout, renderNotFound } from "./pages.js";
import { renderHeader, renderFooter } from "./chrome.js";
import { initCookieNotice } from "./cookie.js";
import { initBackdrop } from "./backdrop.js";
import { session, reset } from "./engine/session.js";
import { stopFlow } from "./engine/runner.js";
import { runFlowById, pickerFor, energyScreen, exitScreen, flows } from "./engine/route.js";
import { renderPlan } from "./engine/plan.js";

const OPEN_ROUTES = ["welcome", "privacy", "about", "404"];

function paintChrome() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (header) header.replaceChildren(renderHeader());
  if (footer) footer.replaceChildren(renderFooter());
}

// Arrival: the session starts clean here, so a return to #/ never adds a
// second run's scores on top of the first.
export function mountArrival() {
  reset();
  runFlowById(flows.arrival.id);
}

// Engine screens other than arrival need a route decided in this page load.
// After a reload the session is empty, so they fall back to #/.
function needsSession() {
  if (session.route) return false;
  window.location.hash = "#/";
  return true;
}

// Returns false only for an unknown route, so the caller can show the 404.
function engine(route, parts) {
  if (route === "exit") return mountScreen(exitScreen());
  if (needsSession()) return true;
  if (route === "menu") return pickerFor(parts[1], parts[2]);
  if (route === "flow") return runFlowById(parts[1]);
  if (route === "energy") return energyScreen();
  if (route === "commit") return runFlowById(flows.commit.id);
  if (route === "plan") return mountScreen(renderPlan());
  return false;
}

function router() {
  const raw = (window.location.hash || "#/").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  const route = parts[0] || "";

  paintChrome();
  stopFlow();

  if (route === "welcome") return mountScreen(renderWelcome());
  if (route === "privacy") return mountScreen(renderPrivacy());
  if (route === "about") return mountScreen(renderAbout());
  if (route === "404") return mountScreen(renderNotFound());

  if (!readConsent()) {
    window.location.hash = "#/welcome";
    return;
  }

  if (!route) return mountArrival();
  if (engine(route, parts) !== false) return;

  // Unknown route: render the styled 404 view in place, no silent redirect.
  return mountScreen(renderNotFound());
}

// ---- boot -------------------------------------------------------------------
// Module scripts are deferred, so the DOM is already parsed here.

initCookieNotice();
initBackdrop();
window.addEventListener("hashchange", router);
router();
