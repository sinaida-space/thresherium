// Thresherium — persistent header and footer.
// renderHeader() and renderFooter() each return a single element that app.js
// drops into #site-header / #site-footer on every route change.
//
// Google-Translate safety: every control keys off element references and
// data-* attributes captured at render time, never off text nodes.

import { el } from "./dom.js";
import { reopenCookieNotice } from "./cookie.js";

export function renderHeader() {
  const root = el("div", { class: "siteheader__inner" });

  const skip = el("a", { class: "skip-link", href: "#screen" }, "Skip to content");
  skip.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.getElementById("screen");
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  });
  root.appendChild(skip);

  root.appendChild(el("a", { class: "siteheader__mark", href: "#/" }, "THRESHERIUM"));

  const nav = el("nav", { class: "siteheader__nav", "aria-label": "Menu" });

  nav.appendChild(el("a", { class: "siteheader__navlink", href: "#/about" }, "About"));
  nav.appendChild(el("a", { class: "siteheader__navlink", href: "#/privacy" }, "Privacy"));

  const storage = el(
    "button",
    { class: "siteheader__navlink", type: "button", "data-action": "storage-settings" },
    "Storage settings"
  );
  storage.addEventListener("click", function () {
    reopenCookieNotice();
  });
  nav.appendChild(storage);

  // Sound is off until a later milestone wires actual playback; the control
  // exists now so its position and state do not shift later.
  const audio = el(
    "button",
    {
      class: "audio-toggle",
      type: "button",
      id: "audio-toggle",
      "aria-pressed": "false"
    },
    "Sound off"
  );
  nav.appendChild(audio);

  root.appendChild(nav);

  return root;
}

export function renderFooter() {
  const root = el("div", { class: "sitefooter__inner" });

  const credit = el("p", { class: "sitefooter__credit" });
  credit.appendChild(document.createTextNode("© 2026 Sinaida Krivchenko · "));
  credit.appendChild(el("a", { href: "https://sinaida.eu", target: "_blank", rel: "noopener" }, "sinaida.eu"));
  credit.appendChild(document.createTextNode(" · "));
  credit.appendChild(
    el(
      "a",
      { href: "https://sinaida-space.github.io/ethereal-path/", target: "_blank", rel: "noopener" },
      "Ethereal Path"
    )
  );
  credit.appendChild(document.createTextNode(" · "));
  credit.appendChild(
    el(
      "a",
      { href: "https://sinaida-space.github.io/soulstice/", target: "_blank", rel: "noopener" },
      "Soulstice"
    )
  );
  root.appendChild(credit);

  return root;
}
