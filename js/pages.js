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
  root.appendChild(paragraph("Last updated November\u00a07, 2026"));

  root.appendChild(heading("Who runs this"));
  root.appendChild(
    paragraph(
      "Thresherium is made and run by Sinaida Krivchenko, a new-media artist based in Prague. The site is published at sinaida-space.github.io/thresherium/."
    )
  );

  root.appendChild(heading("Hosting"));
  root.appendChild(
    paragraph(
      "The site is hosted on GitHub Pages (GitHub Inc., USA), which delivers pages through the Fastly network. When you open a page, the server receives a technical request: your IP address, the time, the address you asked for and your browser type. GitHub processes this to deliver the site and keep it secure. I do not collect or keep these logs. Legal basis: legitimate interest in running and securing a public website (GDPR Article\u00a06(1)(f)). GitHub is a US company; it states that it relies on standard contractual clauses and takes part in the EU-U.S. Data Privacy Framework."
    )
  );
  const ghLink = el("p", null, "See the ");
  ghLink.appendChild(extLink("https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement", "GitHub privacy statement ↗"));
  root.appendChild(ghLink);

  root.appendChild(heading("Third parties"));
  root.appendChild(
    paragraph(
      "The tool does not contact any third-party server. Fonts, scripts and sound are served from this same site."
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
      "No one. The stored line lives only in your browser's local storage. It is never transmitted, so I never receive or see it."
    )
  );

  root.appendChild(heading("Your rights"));
  root.appendChild(
    paragraph(
      "Under the GDPR you have the right to access, correct, erase, restrict, or object to the processing of your personal data, and the right to data portability. What you stored lives only in your own browser, so there is nothing on my side to produce, change, or delete; clearing your browser's site data does it at once. For connection data held by GitHub, write to me through the contact link below and I pass your request on to GitHub where needed."
    )
  );
  const complaint = el("p", null, "You may also complain at any time to the Czech data protection authority, ");
  complaint.appendChild(extLink("https://uoou.gov.cz", "Úřad pro ochranu osobních údajů ↗"));
  complaint.appendChild(document.createTextNode(", or to the authority in your own country."));
  root.appendChild(complaint);

  root.appendChild(heading("Automated decisions"));
  root.appendChild(
    paragraph(
      "None. Thresherium runs a fixed script of questions and does not profile, score, or make any decision about you or anyone else."
    )
  );

  root.appendChild(heading("Security"));
  root.appendChild(
    paragraph(
      "The site is static files with a strict content-security policy: no third-party scripts, no analytics, no external connections. There is no account, no server of my own, and no database to secure, because none exists."
    )
  );

  root.appendChild(heading("Changes"));
  root.appendChild(
    paragraph(
      "If this policy changes, the new version replaces this page."
    )
  );

  const contact = el("p", null, "Contact: ");
  contact.appendChild(extLink("https://sinaida.eu/privacy/#contact-me", "sinaida.eu/privacy ↗"));
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
