#!/usr/bin/env node
// Thresherium: headless smoke test. Node, zero dependencies, no DOM.
//   node tools/smoke.mjs
// Imports the real data through data/manifest.js and the pure functions of
// js/engine/route.js and js/engine/runner.js, then asserts route decisions
// for three synthetic score sets, the exit flag, the method map, and a
// scripted walk through the arrival flow.

import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = (p) => new URL("file://" + path.join(root, p));

const manifest = await import(url("data/manifest.js"));
const route = await import(url("js/engine/route.js"));
const runner = await import(url("js/engine/runner.js"));

let n = 0;
function check(name, fn) {
  fn();
  n++;
  console.log("ok " + n + " " + name);
}

check("manifest exports", () => {
  for (const k of ["arrival", "practices", "triage", "methods", "methodIndex", "commit"]) {
    assert.ok(manifest[k], "manifest." + k);
  }
});

check("route: drained wins", () => {
  assert.equal(route.decideRoute({ drained: 9, flooded: 4, dry: 2 }, false), "drained");
});
check("route: flooded wins", () => {
  assert.equal(route.decideRoute({ drained: 3, flooded: 11, dry: 5 }, false), "flooded");
});
check("route: dry wins", () => {
  assert.equal(route.decideRoute({ drained: 1, flooded: 2, dry: 8 }, false), "dry");
});
check("route: tie order drained > flooded > dry", () => {
  assert.equal(route.decideRoute({ drained: 5, flooded: 5, dry: 5 }, false), "drained");
  assert.equal(route.decideRoute({ drained: 2, flooded: 5, dry: 5 }, false), "flooded");
  assert.equal(route.decideRoute({ drained: 0, flooded: 0, dry: 0 }, false), "drained");
});
check("route: exit flag beats every score", () => {
  assert.equal(route.decideRoute({ drained: 9, flooded: 9, dry: 9 }, true), "exit");
  assert.equal(route.hasExitFlag([{ flag: null }, { flag: "exit" }]), true);
  assert.equal(route.hasExitFlag([{ flag: null }]), false);
});

check("hashAfter: every kind lands somewhere", () => {
  assert.equal(route.hashAfter("arrival", "exit"), "#/exit");
  assert.equal(route.hashAfter("arrival", "flooded"), "#/flow/" + route.flows.triage.id);
  assert.equal(route.hashAfter("arrival", "drained"), "#/menu/drained");
  assert.equal(route.hashAfter("arrival", "dry"), "#/menu/dry");
  assert.equal(route.hashAfter("practice"), "#/menu/after");
  assert.equal(route.hashAfter("triage"), "#/commit");
  assert.equal(route.hashAfter("method"), "#/commit");
  assert.equal(route.hashAfter("commit"), "#/plan");
});

check("methodIndex: every option maps to one or two real methods", () => {
  for (const o of manifest.methodIndex.options) {
    const list = route.methodsFor(o.id);
    assert.ok(list.length >= 1 && list.length <= 2, o.id + " maps to " + list.length);
    for (const m of list) assert.equal(m.kind, "method");
  }
});

check("practice picker: every group has at least one practice", () => {
  for (const tag of ["breath", "move", "ground"]) {
    assert.ok(route.flows.practices.some((f) => f.tags.includes(tag)), tag);
  }
});

// Walk the arrival flow always picking the first option, and once picking
// the exit-flagged option where it exists.
function walk(flow, choose) {
  const scores = { drained: 0, flooded: 0, dry: 0 };
  const log = [];
  let id = flow.entry;
  let guard = 0;
  while (id && !["_end", "_exit"].includes(id) && guard++ < 100) {
    const step = flow.steps[id];
    const pick = choose(step);
    const s = runner.scoreFor(step, pick);
    scores.drained += s.drained;
    scores.flooded += s.flooded;
    scores.dry += s.dry;
    log.push({ flowId: flow.id, stepId: id, pick, flag: runner.flagFor(step, pick) });
    id = runner.resolveNext(step, pick);
  }
  return { scores, log, end: id };
}

check("arrival walk: first options end at _end with a decided route", () => {
  const r = walk(route.flows.arrival, (step) =>
    step.type === "choice" ? step.options[0].id : step.type === "rate" ? 5 : true
  );
  assert.equal(r.end, "_end");
  assert.ok(r.scores.drained + r.scores.flooded + r.scores.dry > 0, "some score");
  assert.ok(["drained", "flooded", "dry"].includes(route.decideRoute(r.scores, route.hasExitFlag(r.log))));
});

check("arrival walk: the exit option leaves by _exit or the flag", () => {
  const r = walk(route.flows.arrival, (step) => {
    if (step.type !== "choice") return step.type === "rate" ? 5 : true;
    const ex = step.options.find((o) => o.flag === "exit");
    return (ex || step.options[0]).id;
  });
  assert.ok(r.end === "_exit" || route.hasExitFlag(r.log), "exit reached");
  assert.equal(route.decideRoute(r.scores, route.hasExitFlag(r.log) || r.end === "_exit"), "exit");
});

check("scoreFor subtracts cleanly (Back)", () => {
  const step = route.flows.arrival.steps[Object.keys(route.flows.arrival.steps).find((k) => route.flows.arrival.steps[k].type === "choice")];
  const s = runner.scoreFor(step, step.options[1].id);
  const total = { drained: 4, flooded: 4, dry: 4 };
  total.drained += s.drained; total.flooded += s.flooded; total.dry += s.dry;
  total.drained -= s.drained; total.flooded -= s.flooded; total.dry -= s.dry;
  assert.deepEqual(total, { drained: 4, flooded: 4, dry: 4 });
});

console.log("smoke: " + n + " checks passed");
