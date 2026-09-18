// Thresherium engine: the printable plan.
// <!-- typocheck: off -->
// Markup-building code: JS syntax quotes, class names and data-* literals
// trip the prose checks, so the masking runs to the end of the file.
// Reads the session, renders the #output document, offers "Save as PDF"
// (window.print, styled by print.css) and "Start again" (reset, back to #/).

import { el } from "../dom.js";
import { buttons, plan as copy } from "../../data/copy.js";
import { session, reset } from "./session.js";
import { findFlow } from "./route.js";
import { matrixOrder } from "./steps.js";
import { setMood } from "./fx.js";

function h2(text) {
  return el("h2", { class: "plan__h2" }, text);
}

function dateLine() {
  const d = new Date();
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return d.toDateString();
  }
}

// before → now → after; "now" is the rating taken right after a practice
// and appears only when it exists.
function energyBlock() {
  const before = session.energyBefore;
  const now = session.energyNow;
  const after = session.energyAfter;
  if (!before && !now && !after) return null;
  const p = el("p", { class: "plan__energy" });
  p.appendChild(el("span", { class: "chip chip--soft" }, copy.energy.label));
  p.appendChild(document.createTextNode(" "));
  const parts = [[before, copy.energy.before], [now, copy.energy.now], [after, copy.energy.after]]
    .filter(function (x) { return x[0]; });
  parts.forEach(function (x, i) {
    if (i > 0) p.appendChild(document.createTextNode(" → "));
    p.appendChild(el("span", { class: "num" }, String(x[0])));
    p.appendChild(document.createTextNode(" " + x[1]));
  });
  if (before && after) {
    const delta = after - before;
    const txt = delta === 0 ? copy.energy.same : (delta > 0 ? "+" : "−") + Math.abs(delta);
    p.appendChild(document.createTextNode(" ("));
    p.appendChild(el("span", { class: delta === 0 ? "" : "num" }, txt));
    p.appendChild(document.createTextNode(")"));
  }
  return p;
}

function valueNode(step, pick) {
  if (step.type === "matrix" && Array.isArray(pick)) {
    const ul = el("ul", { class: "plan__list" });
    for (const r of matrixOrder(pick)) {
      const li = el("li", null, r.item + " ");
      li.appendChild(el("span", { class: "chip chip--soft" }, r.impact + " impact"));
      li.appendChild(document.createTextNode(" "));
      li.appendChild(el("span", { class: "chip chip--soft" }, r.effort + " effort"));
      ul.appendChild(li);
    }
    return ul;
  }
  if (Array.isArray(pick)) {
    const ul = el("ul", { class: "plan__list" });
    for (const item of pick) ul.appendChild(el("li", null, String(item)));
    return ul;
  }
  return el("p", { class: "plan__answer" }, String(pick));
}

// Every text, pick and matrix answer, grouped by the flow it was given in,
// in the order the log holds them. The commit flow is rendered separately.
function answersByFlow() {
  const groups = [];
  const byId = {};
  for (const entry of session.log) {
    if (entry.flowId === "commit") continue;
    const flow = findFlow(entry.flowId);
    if (!flow) continue;
    const step = flow.steps[entry.stepId];
    if (!step || !["text", "pick", "matrix"].includes(step.type)) continue;
    let g = byId[flow.id];
    if (!g) {
      g = { title: flow.title, rows: [] };
      byId[flow.id] = g;
      groups.push(g);
    }
    g.rows.push({ step: step, pick: entry.pick });
  }
  return groups;
}

function commitBlock() {
  const a = session.answers;
  if (!a.when && !a.then && !a.first) return null;
  const box = el("section", { class: "plan__commit" });
  box.appendChild(h2(copy.commitHeading));
  const dl = el("dl", { class: "plan__dl" });
  const rows = [[copy.when, a.when], [copy.then, a.then], [copy.first, a.first]];
  for (const r of rows) {
    if (!r[1]) continue;
    dl.appendChild(el("dt", null, r[0]));
    dl.appendChild(el("dd", null, String(r[1])));
  }
  box.appendChild(dl);
  return box;
}

function linksBlock() {
  const box = el("section", { class: "plan__links" });
  box.appendChild(h2(copy.links.heading));
  const ul = el("ul", { class: "plan__list" });
  for (const key of ["ethereal", "soulstice"]) {
    const l = copy.links[key];
    if (!l) continue;
    const li = el("li");
    li.appendChild(el("a", { href: l.href, target: "_blank", rel: "noopener" }, l.label));
    li.appendChild(document.createTextNode(" " + l.desc));
    ul.appendChild(li);
  }
  box.appendChild(ul);
  return box;
}

export function renderPlan() {
  setMood("plan");
  const root = el("section", { class: "screen-panel plan", "data-role": "plan" });
  const out = el("article", { id: "output", class: "plan__doc" });

  out.appendChild(el("h1", { class: "plan__h1" }, copy.title));
  const meta = el("p", { class: "plan__meta" });
  meta.appendChild(el("span", { class: "num" }, dateLine()));
  const routeName = session.route && copy.routeNames[session.route];
  if (routeName) {
    meta.appendChild(document.createTextNode(" "));
    meta.appendChild(el("span", { class: "chip" }, routeName));
  }
  out.appendChild(meta);

  const energy = energyBlock();
  if (energy) out.appendChild(energy);

  for (const g of answersByFlow()) {
    const sec = el("section", { class: "plan__flow" });
    sec.appendChild(h2(g.title));
    for (const r of g.rows) {
      sec.appendChild(el("p", { class: "plan__prompt" }, r.step.prompt || r.step.header || ""));
      sec.appendChild(valueNode(r.step, r.pick));
    }
    out.appendChild(sec);
  }

  const commit = commitBlock();
  if (commit) out.appendChild(commit);
  out.appendChild(linksBlock());
  out.appendChild(el("p", { class: "plan__footer card__note" }, copy.footer));
  root.appendChild(out);

  const actions = el("div", { class: "plan__actions" });
  const pdf = el("button", { class: "btn", type: "button", "data-action": "print" }, buttons.pdf);
  pdf.addEventListener("click", function () { window.print(); });
  const again = el("button", { class: "btn btn--ghost", type: "button", "data-action": "restart" }, buttons.again);
  again.addEventListener("click", function () {
    reset();
    window.location.hash = "#/";
  });
  actions.appendChild(pdf);
  actions.appendChild(again);
  root.appendChild(actions);
  return root;
}
