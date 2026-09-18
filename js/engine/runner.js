// Thresherium engine: flow runner.
// <!-- typocheck: off -->
// Markup-building code: JS syntax quotes, class names and data-* literals
// trip the prose checks, so the masking runs to the end of the file.
// runFlow(flow, { onEnd }) mounts the entry step, records every answer in
// session.log, adds choice scores to session.scores, and walks `next`.
// "_end" hands over to onEnd(flow); "_exit" goes to the exit screen.
// Back re-renders the previous step from the log and subtracts its scores.
//
// resolveNext and scoreFor are pure and exported for tools/smoke.mjs.

import { el } from "../dom.js";
import { mountScreen } from "../screen.js";
import { buttons } from "../../data/copy.js";
import { session } from "./session.js";
import { renderStep, destroyStep } from "./steps.js";
import { announce } from "./fx.js";

const ENERGY_KEYS = { energyBefore: "energyBefore", energyNow: "energyNow", energyAfter: "energyAfter" };

let current = null; // { node } of the mounted step, for teardown

// Next step id for a step and a pick. Object form keys by option id, with
// "_default" as the fallback. A multi pick uses the first matching option.
export function resolveNext(step, pick) {
  const n = step.next;
  if (typeof n === "string") return n;
  if (!n || typeof n !== "object") return "_end";
  const picks = Array.isArray(pick) ? pick : [pick];
  for (const p of picks) if (typeof p === "string" && n[p]) return n[p];
  return n._default || "_end";
}

// Summed scores of the picked options of a choice step.
export function scoreFor(step, pick) {
  const total = { drained: 0, flooded: 0, dry: 0 };
  if (step.type !== "choice" || !Array.isArray(step.options)) return total;
  const picks = new Set(Array.isArray(pick) ? pick : [pick]);
  for (const o of step.options) {
    if (!picks.has(o.id) || !o.score) continue;
    total.drained += Number(o.score.drained) || 0;
    total.flooded += Number(o.score.flooded) || 0;
    total.dry += Number(o.score.dry) || 0;
  }
  return total;
}

export function flagFor(step, pick) {
  if (step.type !== "choice" || !Array.isArray(step.options)) return null;
  const picks = new Set(Array.isArray(pick) ? pick : [pick]);
  for (const o of step.options) if (picks.has(o.id) && o.flag) return o.flag;
  return null;
}

function addScores(delta, sign) {
  session.scores.drained += sign * delta.drained;
  session.scores.flooded += sign * delta.flooded;
  session.scores.dry += sign * delta.dry;
}

function saveAnswer(step, pick) {
  if (!step.saveAs) return;
  session.answers[step.saveAs] = pick;
  if (ENERGY_KEYS[step.saveAs]) session[step.saveAs] = Number(pick) || null;
}

function dropAnswer(step) {
  if (!step.saveAs) return;
  delete session.answers[step.saveAs];
  if (ENERGY_KEYS[step.saveAs]) session[step.saveAs] = null;
}

// Tears down the mounted step (timers, breath orb). Safe to call any time;
// app.js calls it on every route change.
export function stopFlow() {
  if (current && current.node) destroyStep(current.node);
  current = null;
}

export function runFlow(flow, opts) {
  const onEnd = (opts && opts.onEnd) || function () {};
  stopFlow();
  session.flowId = flow.id;

  // A restarted flow starts clean: drop the log of its abandoned run, give
  // back the scores it added and forget its answers.
  session.log = session.log.filter(function (entry) {
    if (entry.flowId !== flow.id) return true;
    const step = flow.steps[entry.stepId];
    if (step) {
      addScores(entry.score || scoreFor(step, entry.pick), -1);
      dropAnswer(step);
    }
    return false;
  });

  // Back only steps within this flow: the previous step is the last log
  // entry, and only if that entry belongs to this flow.
  function lastEntryIndex() {
    const i = session.log.length - 1;
    return i >= 0 && session.log[i].flowId === flow.id ? i : -1;
  }

  function mount(stepId, initial) {
    stopFlow();
    const step = flow.steps[stepId];
    if (!step) return onEnd(flow);
    session.stepId = stepId;

    const panel = el("section", {
      class: "screen-panel flow",
      "data-role": "flow",
      "data-flow": flow.id,
      "data-step": stepId
    });

    const bar = el("div", { class: "step__bar" });
    bar.appendChild(el("span", { class: "chip" }, step.header || ""));
    const canGoBack = lastEntryIndex() >= 0;
    if (canGoBack) {
      const back = el("button", { class: "btn btn--ghost btn--small", type: "button" }, buttons.back);
      back.addEventListener("click", goBack);
      bar.appendChild(back);
    }
    panel.appendChild(bar);

    const node = renderStep(step, {
      answers: session.answers,
      initial: initial,
      onAnswer: function (pick) { answer(step, pick); }
    });
    current = { node: node };
    panel.appendChild(node);

    mountScreen(panel);
    announce(step.header || "");
  }

  function answer(step, pick) {
    const score = scoreFor(step, pick);
    addScores(score, 1);
    saveAnswer(step, pick);
    session.log.push({
      flowId: flow.id,
      stepId: step.id,
      pick: pick,
      at: Date.now(),
      score: score,
      flag: flagFor(step, pick)
    });

    const next = resolveNext(step, pick);
    if (next === "_exit") {
      stopFlow();
      session.route = "exit";
      window.location.hash = "#/exit";
      return;
    }
    if (next === "_end") {
      stopFlow();
      onEnd(flow);
      return;
    }
    mount(next);
  }

  function goBack() {
    const i = lastEntryIndex();
    if (i < 0) return;
    const entry = session.log[i];
    session.log.splice(i, 1);
    const step = flow.steps[entry.stepId];
    if (step) {
      addScores(entry.score || scoreFor(step, entry.pick), -1);
      dropAnswer(step);
    }
    mount(entry.stepId, entry.pick);
  }

  mount(flow.entry);
}

// A single step (energyNow, methodIndex) runs as a one-step flow.
export function flowFromStep(step, id, title) {
  const s = Object.assign({}, step, { next: "_end" });
  return {
    id: id || step.id,
    kind: "step",
    title: title || step.header || "",
    entry: step.id,
    steps: { [step.id]: s }
  };
}
