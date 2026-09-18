// Thresherium — cookie notice and the one stored choice.
//
// localStorage["thresherium:v1:cookie"] = {"choice":"accept"|"reject","at":ms,"policyVersion":1}
//
// Reject still lets the visitor use the tool: nothing is written, any earlier
// record (this choice and the welcome consent) is removed, and the notice
// simply shows again on the next visit. Accept writes this one record; the
// consent record is written only once the visitor also agrees on the welcome
// screen. Nothing here
// reads textContent or innerText; the choice is a variable captured at click
// time, never text read back from the page (Google Translate safety).

import { el } from "./dom.js";

const COOKIE_KEY = "thresherium:v1:cookie";
const CONSENT_KEY = "thresherium:v1:consent";
const POLICY_VERSION = 1;

let bar = null;

function lsGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function lsSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    /* choice will not persist; the bar just reappears next visit */
  }
}

export function cookieChoice() {
  try {
    const raw = lsGet(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.choice === "accept" || parsed.choice === "reject")) {
      return parsed.choice;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function lsRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    /* nothing to remove */
  }
}

function writeChoice(choice) {
  if (choice === "reject") {
    lsRemove(COOKIE_KEY);
    lsRemove(CONSENT_KEY);
    return;
  }
  lsSet(
    COOKIE_KEY,
    JSON.stringify({ choice: choice, at: Date.now(), policyVersion: POLICY_VERSION })
  );
}

function buildBar(onChoice) {
  const root = el("aside", {
    class: "cookienotice",
    role: "region",
    "aria-label": "Storage notice",
    "data-role": "cookie-notice"
  });

  const text = el("div", { class: "cookienotice__text" });
  text.appendChild(el("p", { class: "cookienotice__h" }, "One thing stored"));
  text.appendChild(
    el(
      "p",
      { class: "cookienotice__p" },
      "This site sets no cookies and runs no analytics. If you allow it, your browser keeps one line so you do not see the welcome twice. Reject and nothing is written."
    )
  );
  root.appendChild(text);

  const actions = el("div", { class: "cookienotice__actions" });

  // Reject first in DOM order, so it leads on a mobile stack.
  const reject = el(
    "button",
    { class: "btn btn--ghost", type: "button", "data-action": "cookie-reject" },
    "Reject"
  );
  reject.addEventListener("click", function () {
    writeChoice("reject");
    onChoice("reject");
  });

  const allow = el(
    "button",
    { class: "btn", type: "button", "data-action": "cookie-allow" },
    "Allow"
  );
  allow.addEventListener("click", function () {
    writeChoice("accept");
    // welcome.js listens: a consent held in memory (given while the choice
    // was reject or unmade) is persisted now that storage is allowed.
    document.dispatchEvent(new CustomEvent("thresherium:storage-allowed"));
    onChoice("accept");
  });

  actions.appendChild(reject);
  actions.appendChild(allow);
  root.appendChild(actions);

  return root;
}

function removeBar() {
  if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
  bar = null;
}

// The bar sits before .frame in the DOM: fixed to the bottom on wide screens,
// in normal flow above the content on phones, so it never covers Begin.
function showBar() {
  if (bar) return;
  bar = buildBar(function () {
    removeBar();
  });
  const frame = document.querySelector(".frame");
  if (frame && frame.parentNode) frame.parentNode.insertBefore(bar, frame);
  else document.body.appendChild(bar);
}

// Shown until a choice exists. "Storage settings" in the footer calls this
// again to reopen it, regardless of any earlier choice.
export function initCookieNotice() {
  if (!cookieChoice()) showBar();
}

export function reopenCookieNotice() {
  removeBar();
  showBar();
}
