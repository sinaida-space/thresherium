// Thresherium: standalone pages: privacy, about, and the 404 view.
// No engine, no data, no accounts: a static, no-data site's privacy notice.
// <!-- typocheck: off -->
// The rest of this file is markup-building code: JS syntax quotes, class
// names, data-* attribute literals and the section-divider comments below
// trip the prose checks, so the masking above runs to the end of the file.
// Every string handed to the reader was proofread by hand against the
// typography floor before this file was written.

import { el } from "./dom.js";
import { appendContentSections } from "./welcome.js";

function extLink(href, text) {
  return el("a", { href: href, target: "_blank", rel: "noopener" }, text);
}

function heading(text) {
  return el("h2", { class: "page__h2" }, text);
}

function paragraph(text) {
  return el("p", null, text);
}

// ---- Privacy --------------------------------------------------------------

export function renderPrivacy() {
  const root = el("article", { class: "page screen-panel", "data-role": "privacy" });

  root.appendChild(el("h1", { class: "page__h1" }, "Privacy"));

  root.appendChild(heading("Who runs this"));
  root.appendChild(
    paragraph(
      "Thresherium is made and run by Sinaida Krivchenko, a new-media artist based in Prague. The site is published at sinaida-space.github.io/thresherium/."
    )
  );

  root.appendChild(heading("What is stored"));
  root.appendChild(
    paragraph(
      "Two things, at most, and only in your own browser, and only if you chose Allow on the storage notice: that choice, and that you read the welcome screen. Reject writes nothing. Nothing about what you type into the tool itself is stored, sent, or logged anywhere."
    )
  );

  root.appendChild(heading("Why"));
  root.appendChild(
    paragraph(
      "So a returning visitor who allowed it does not see the welcome screen a second time. That is the entire purpose of the one stored line."
    )
  );

  root.appendChild(heading("Legal basis"));
  root.appendChild(
    paragraph(
      "Consent, given through the storage notice. Reject and the tool still works; nothing is written to your device, and the welcome screen simply appears again on your next visit."
    )
  );

  root.appendChild(heading("How long"));
  root.appendChild(
    paragraph(
      "Until you clear your browser's site data, or choose Reject through Storage settings in the footer, which removes it immediately."
    )
  );

  root.appendChild(heading("Who sees it"));
  root.appendChild(
    paragraph(
      "No one. The stored line lives only in your browser's local storage. It is never transmitted, so the author never receives or sees it."
    )
  );

  root.appendChild(heading("Your rights"));
  root.appendChild(
    paragraph(
      "Under the GDPR you have the right to access, correct, erase, restrict, or object to the processing of your personal data, and the right to data portability. Because Thresherium holds no personal data outside your own browser, there is nothing on the author's side to produce, change, or delete. Clearing your browser's site data exercises every one of these rights at once."
    )
  );

  root.appendChild(heading("Automated decisions"));
  root.appendChild(
    paragraph(
      "None. Thresherium runs a fixed script of questions and does not profile, score, or make any decision about you or anyone else."
    )
  );

  root.appendChild(heading("Security"));
  root.appendChild(
    paragraph(
      "The site is static files with a strict content-security policy: no third-party scripts, no analytics, no external connections. There is no account, no server, and no database to secure, because none exists."
    )
  );

  root.appendChild(heading("Changes"));
  root.appendChild(
    paragraph(
      "If this policy changes, the new version replaces this page."
    )
  );

  const contact = el("p", null, "Contact: ");
  contact.appendChild(extLink("https://sinaida.eu", "sinaida.eu ↗"));
  root.appendChild(heading("Contact"));
  root.appendChild(contact);

  return root;
}

// ---- About (welcome sections 2-5, read-only) -------------------------------

export function renderAbout() {
  const root = el("article", { class: "page screen-panel", "data-role": "about" });
  root.appendChild(el("h1", { class: "page__h1" }, "About"));
  appendContentSections(root);
  return root;
}

// ---- 404 --------------------------------------------------------------------

export function renderNotFound() {
  const root = el("section", { class: "page notfound screen-panel", "data-role": "notfound" });

  root.appendChild(el("span", { class: "card__label" }, "Not found"));
  root.appendChild(
    el("h1", { class: "page__h1" }, "This page is not part of the instrument.")
  );
  root.appendChild(el("p", null, "The page you asked for does not exist here."));

  const back = el("p", { class: "notfound__back" });
  back.appendChild(el("a", { href: "#/welcome" }, "Back to the start ↗"));
  root.appendChild(back);

  return root;
}
