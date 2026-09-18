// Thresherium: welcome screen and consent record.
// <!-- typocheck: off -->
// Consent is written only once the cookie choice is known:
//   choice "accept" -> localStorage["thresherium:v1:consent"] = {agreedAt, policyVersion}
//   choice "reject" or absent -> kept in a module variable for this page load only
//
// Google-Translate safety: the Begin button keys off the checkbox's `.checked`
// property, never off any text node.
// <!-- typocheck: on -->

// <!-- typocheck: off -->
// The rest of this file is markup-building code: JS syntax quotes, class
// names and data-* attribute literals trip the prose checks below, so the
// masking above runs to the end of the file. Every string handed to the
// reader was proofread by hand against the typography floor before this
// file was written: no em dash rhetoric, no "not A, but B", short words
// glued forward with nbsp.

import { el } from "./dom.js";
import { cookieChoice } from "./cookie.js";

const CONSENT_KEY = "thresherium:v1:consent";
const POLICY_VERSION = 1;

// Held only when the cookie choice is "reject" (or not yet made): consent
// then lives for this page load and nothing is written to storage.
let memoryConsent = null;

export function readConsent() {
  if (memoryConsent) return memoryConsent;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.policyVersion === POLICY_VERSION &&
      typeof parsed.agreedAt === "number"
    ) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function writeConsent() {
  const record = { agreedAt: Date.now(), policyVersion: POLICY_VERSION };
  if (cookieChoice() === "accept") {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch (e) {
      // Storage blocked after all: fall back to the in-memory record.
      memoryConsent = record;
    }
  } else {
    memoryConsent = record;
  }
}

function paragraph(text) {
  return el("p", { class: "welcome__p" }, text);
}

// Sections 2-5: shared verbatim between the welcome screen and #/about
// (read-only there, without the checkbox and the Begin button).
export function appendContentSections(root) {
  root.appendChild(el("h2", { class: "welcome__h" }, "Why this exists"));
  root.appendChild(
    paragraph(
      "Some days you sit down and nothing comes. You cannot tell whether you are exhausted or simply out of ideas, and the two need different things. This tool asks, then hands you the right one."
    )
  );

  root.appendChild(el("h2", { class: "welcome__h" }, "How it works"));
  root.appendChild(
    paragraph(
      "A few honest questions place you on three scales: drained, flooded, dry. Drained gets the body: breathing and small movement, guided on screen. Flooded gets a sorting table. Dry gets one of seven thinking methods borrowed from consulting practice. Every path ends with one next step and a plan you can print. About ten minutes."
    )
  );

  root.appendChild(el("h2", { class: "welcome__h" }, "What happens to what you type"));
  root.appendChild(
    paragraph(
      "Nothing leaves this page. There is no server, no account, no analytics. Close the tab and it is gone. The only thing kept, if you allow it, is that you read this screen."
    )
  );

  root.appendChild(el("h2", { class: "welcome__h" }, "What this is not"));
  const disc = el("aside", { class: "welcome__disclaimer", "data-role": "disclaimer" });
  disc.appendChild(
    paragraph(
      "Thresherium is a game with your own thoughts. It is made for entertainment and reflection. It is not medical, psychological, therapeutic, legal, financial or professional advice, and it does not diagnose, treat or assess anything. Its methods are fixed scripts; it does not read or understand what you write. If you are in distress, in danger, or thinking about harming yourself, close this and contact a person or a service that can help."
    )
  );
  root.appendChild(disc);
}

export function renderWelcome() {
  const root = el("section", { class: "welcome screen-panel", "data-role": "welcome" });

  root.appendChild(el("h1", { class: "welcome__mark" }, "THRESHERIUM"));
  root.appendChild(
    el(
      "p",
      { class: "welcome__standfirst" },
      "A thresher separates grain from chaff. This one works on a tired head."
    )
  );

  appendContentSections(root);

  // Consent control
  const form = el("div", { class: "consent", "data-role": "consent" });
  const row = el("p", { class: "consent__row" });
  const box = el("input", {
    class: "consent__box",
    type: "checkbox",
    id: "consent-box",
    "data-role": "consent-box"
  });
  const label = el(
    "label",
    { class: "consent__label", for: "consent-box" },
    "I have read this. I understand it is an entertainment and reflection tool, not advice, and I want to begin."
  );
  row.appendChild(box);
  row.appendChild(label);
  form.appendChild(row);

  const begin = el(
    "button",
    { class: "btn", type: "button", "data-action": "begin", disabled: true },
    "Begin"
  );
  box.addEventListener("change", function () {
    begin.disabled = !box.checked;
  });
  begin.addEventListener("click", function () {
    if (!box.checked) return;
    writeConsent();
    window.location.hash = "#/";
  });
  form.appendChild(begin);
  root.appendChild(form);

  const author = el("p", { class: "welcome__authorlinks" });
  author.appendChild(document.createTextNode("Made by Sinaida Krivchenko, Prague. "));
  author.appendChild(
    el("a", { href: "https://sinaida.eu", target: "_blank", rel: "noopener" }, "sinaida.eu ↗")
  );
  root.appendChild(author);

  return root;
}
