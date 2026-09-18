// Thresherium engine: router between flows.
// <!-- typocheck: off -->
// Markup-building code: JS syntax quotes, class names and data-* literals
// trip the prose checks, so the masking runs to the end of the file.
//
// Pure decisions (decideRoute, hasExitFlag, methodsFor, findFlow, hashAfter)
// are exported for tools/smoke.mjs and never touch the DOM. The screen
// builders (pickerFor, afterPractice, exitScreen) return DOM nodes or set
// window.location.hash.

import { el } from "../dom.js";
import { mountScreen } from "../screen.js";
import { arrival, practices, triage, methods, methodIndex, commit } from "../../data/manifest.js";
import { energyNow } from "../../data/commit.js";
import { pickers, menus, exit as exitCopy } from "../../data/copy.js";
import { session } from "./session.js";
import { runFlow, flowFromStep } from "./runner.js";
import { setMood } from "./fx.js";

const AXES = ["drained", "flooded", "dry"]; // tie order

function asList(x) {
  return Array.isArray(x) ? x : x ? [x] : [];
}

export const flows = {
  arrival: asList(arrival)[0],
  practices: asList(practices),
  triage: asList(triage)[0],
  methods: asList(methods),
  commit: asList(commit)[0]
};

export function allFlows() {
  return [flows.arrival, flows.triage, flows.commit].concat(flows.practices, flows.methods).filter(Boolean);
}

export function findFlow(id) {
  return allFlows().find(function (f) { return f.id === id; }) || null;
}

// ---- pure decisions ---------------------------------------------------------

export function hasExitFlag(log) {
  return (log || []).some(function (e) { return e && e.flag === "exit"; });
}

// argmax over the three axes; ties fall to the earlier axis in AXES.
export function decideRoute(scores, exitFlag) {
  if (exitFlag) return "exit";
  let best = AXES[0];
  for (const a of AXES) {
    if ((Number(scores[a]) || 0) > (Number(scores[best]) || 0)) best = a;
  }
  return best;
}

export function methodsFor(optionId) {
  const ids = (methodIndex && methodIndex.map && methodIndex.map[optionId]) || [];
  return ids.map(findFlow).filter(Boolean);
}

// Where the router goes once a flow of a given kind ends.
export function hashAfter(kind, route) {
  if (kind === "arrival") {
    if (route === "exit") return "#/exit";
    if (route === "flooded") return "#/flow/" + flows.triage.id;
    return "#/menu/" + route;
  }
  if (kind === "practice") return "#/menu/after";
  if (kind === "triage" || kind === "method") return "#/commit";
  if (kind === "commit") return "#/plan";
  return "#/";
}

// ---- transitions ------------------------------------------------------------

export function afterArrival() {
  session.route = decideRoute(session.scores, hasExitFlag(session.log));
  window.location.hash = hashAfter("arrival", session.route);
}

export function afterTriage() {
  window.location.hash = hashAfter("triage");
}

export function afterMethod() {
  window.location.hash = hashAfter("method");
}

export function afterCommit() {
  window.location.hash = hashAfter("commit");
}

// A practice ends with one energy rating, then the small menu.
export function afterPractice() {
  setMood("arrive");
  runFlow(flowFromStep(energyNow, "energy-now", "Energy"), {
    onEnd: function () { window.location.hash = hashAfter("practice"); }
  });
}

// Runs any flow by id and wires its end to the router.
export function runFlowById(id) {
  const flow = findFlow(id);
  if (!flow) return false;
  const mood = flow.kind === "practice" ? "breathe"
    : flow.kind === "arrival" ? "arrive"
    : flow.kind === "commit" ? "plan"
    : "think";
  setMood(mood);
  runFlow(flow, {
    onEnd: function () {
      if (flow.kind === "arrival") afterArrival();
      else if (flow.kind === "practice") afterPractice();
      else if (flow.kind === "triage") afterTriage();
      else if (flow.kind === "method") afterMethod();
      else if (flow.kind === "commit") afterCommit();
      else window.location.hash = "#/";
    }
  });
  return true;
}

// ---- pickers ----------------------------------------------------------------

function card(flow) {
  const a = el("a", { class: "pickcard", href: "#/flow/" + flow.id, "data-flow": flow.id });
  a.appendChild(el("span", { class: "pickcard__title" }, flow.title));
  if (flow.blurb) a.appendChild(el("span", { class: "pickcard__blurb" }, flow.blurb));
  const meta = el("span", { class: "pickcard__meta" });
  if (flow.minutes) meta.appendChild(el("span", { class: "chip chip--soft num" }, flow.minutes + " min"));
  for (const t of flow.tags || []) meta.appendChild(el("span", { class: "chip chip--soft" }, t));
  a.appendChild(meta);
  return a;
}

function panel(role, heading, intro) {
  const root = el("section", { class: "screen-panel picker", "data-role": role });
  root.appendChild(el("h1", { class: "card__q" }, heading));
  if (intro) root.appendChild(el("p", { class: "card__note" }, intro));
  return root;
}

function practicePicker() {
  const copy = pickers.drained;
  const root = panel("menu-drained", copy.heading, copy.intro);
  const groups = copy.groups || {};
  const order = Object.keys(groups).length ? Object.keys(groups) : ["breath", "move", "ground"];
  for (const tag of order) {
    const list = flows.practices.filter(function (f) { return (f.tags || []).includes(tag); });
    if (!list.length) continue;
    root.appendChild(el("h2", { class: "picker__group" }, groups[tag] || tag));
    const ul = el("div", { class: "picklist" });
    for (const f of list) ul.appendChild(card(f));
    root.appendChild(ul);
  }
  return root;
}

function methodPicker(optionId) {
  const copy = pickers.dry;
  const list = methodsFor(optionId);
  const root = panel("menu-dry-" + optionId, copy.heading, copy.intro);
  const ul = el("div", { class: "picklist" });
  for (const f of list) ul.appendChild(card(f));
  root.appendChild(ul);
  return root;
}

function afterPracticeMenu() {
  const copy = menus.afterPractice;
  const root = panel("menu-after", copy.prompt, "");
  const list = el("div", { class: "menu" });
  const items = [
    ["#/menu/drained", copy.another],
    ["#/menu/dry", copy.think],
    ["#/commit", copy.commit]
  ];
  for (const it of items) {
    list.appendChild(el("a", { class: "btn btn--block menu__btn", href: it[0] }, it[1]));
  }
  root.appendChild(list);
  return root;
}

// Renders the menu screen for a route. The dry menu is the methodIndex
// choice step run through the runner; its pick leads to #/menu/dry/:option.
export function pickerFor(route, option) {
  if (route === "drained") {
    setMood("breathe");
    mountScreen(practicePicker());
    return true;
  }
  if (route === "after") {
    setMood("arrive");
    mountScreen(afterPracticeMenu());
    return true;
  }
  if (route === "dry") {
    setMood("think");
    if (option) {
      mountScreen(methodPicker(option));
      return true;
    }
    runFlow(flowFromStep(methodIndex, "method-index", pickers.dry.heading), {
      onEnd: function () {
        const pick = lastPick("method-index");
        window.location.hash = "#/menu/dry/" + (typeof pick === "string" ? pick : "unclear");
      }
    });
    return true;
  }
  return false;
}

function lastPick(flowId) {
  for (let i = session.log.length - 1; i >= 0; i--) {
    if (session.log[i].flowId === flowId) return session.log[i].pick;
  }
  return null;
}

// ---- exit -------------------------------------------------------------------

export function exitScreen() {
  setMood("arrive");
  const root = el("section", { class: "screen-panel exit", "data-role": "exit" });
  root.appendChild(el("h1", { class: "card__q" }, exitCopy.title));
  for (const p of exitCopy.body || []) root.appendChild(el("p", { class: "info__p" }, p));
  root.appendChild(el("a", { class: "btn btn--block", href: "#/", "data-action": "restart" }, "Back to start"));
  return root;
}
