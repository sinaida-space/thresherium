#!/usr/bin/env node
// Thresherium: flow validator. Node, zero dependencies.
//   node tools/validate.mjs
// Exits 1 with "file:id: message" lines on any failure.
//
// Checks: unique flow ids; every `next` resolves to a step id, "_end" or
// "_exit"; header <= 12 chars; arrival choice options carry `score`; every
// `source` names a `saveAs` of the same flow; timer `seconds` > 0; entry
// exists; step key matches step.id; methodIndex.map ids resolve to methods.

import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataUrl = (f) => new URL("file://" + path.join(root, "data", f));

const manifest = await import(dataUrl("manifest.js"));
const commitMod = await import(dataUrl("commit.js"));

const TYPES = ["choice", "text", "rate", "timer", "info", "matrix", "pick"];
const TERMINAL = ["_end", "_exit"];
const failures = [];

function fail(file, id, msg) {
  failures.push(`${file}:${id}: ${msg}`);
}

function asList(x) {
  return Array.isArray(x) ? x : x ? [x] : [];
}

// export name -> file the flows come from
const sources = [
  ["arrival.js", manifest.arrival],
  ["practices.js", manifest.practices],
  ["triage.js", manifest.triage],
  ["methods/index.js", manifest.methods],
  ["commit.js", manifest.commit]
];

const seenIds = new Map();
const flowsByKind = {};

function nextTargets(next) {
  if (typeof next === "string") return [next];
  if (next && typeof next === "object") return Object.values(next);
  return [];
}

function checkStep(file, flow, key, step, saveKeys) {
  const where = `${flow.id}.${key}`;
  if (!step || typeof step !== "object") return fail(file, where, "step is not an object");
  if (step.id !== key) fail(file, where, `step.id "${step.id}" differs from key`);
  if (!TYPES.includes(step.type)) fail(file, where, `unknown type "${step.type}"`);
  if (typeof step.header !== "string" || !step.header.length) fail(file, where, "header missing");
  else if (step.header.length > 12) fail(file, where, `header "${step.header}" is ${step.header.length} chars, max 12`);

  const targets = nextTargets(step.next);
  if (!targets.length) fail(file, where, "next missing");
  for (const t of targets) {
    if (typeof t !== "string") fail(file, where, "next target is not a string");
    else if (!TERMINAL.includes(t) && !flow.steps[t]) fail(file, where, `next "${t}" does not resolve`);
  }
  if (step.next && typeof step.next === "object" && !step.next._default) {
    fail(file, where, "object next has no _default");
  }

  if (step.type === "choice") {
    if (!Array.isArray(step.options) || !step.options.length) fail(file, where, "choice has no options");
    else {
      const optIds = new Set();
      for (const o of step.options) {
        if (!o.id) fail(file, where, "option without id");
        if (optIds.has(o.id)) fail(file, where, `duplicate option id "${o.id}"`);
        optIds.add(o.id);
        if (flow.kind === "arrival" && (!o.score || typeof o.score !== "object")) {
          fail(file, where, `arrival option "${o.id}" has no score`);
        }
        if (o.flag != null && o.flag !== "exit") fail(file, where, `option "${o.id}" has unknown flag "${o.flag}"`);
      }
      if (step.next && typeof step.next === "object") {
        for (const k of Object.keys(step.next)) {
          if (k !== "_default" && !optIds.has(k)) fail(file, where, `next key "${k}" is not an option id`);
        }
      }
    }
  }
  if (step.type === "timer") {
    if (!(Number(step.seconds) > 0)) fail(file, where, "timer seconds must be > 0");
    if (step.pattern) {
      const sum = ["inhale", "hold1", "exhale", "hold2"].reduce((a, k) => a + (Number(step.pattern[k]) || 0), 0);
      if (!(sum > 0)) fail(file, where, "breath pattern sums to 0");
    }
  }
  if (step.type === "text") {
    if (!["single", "list"].includes(step.mode)) fail(file, where, `text mode "${step.mode}" unknown`);
    if (!step.saveAs) fail(file, where, "text step has no saveAs");
  }
  if (step.type === "rate" && !step.saveAs) fail(file, where, "rate step has no saveAs");
  if (step.type === "matrix" || step.type === "pick") {
    if (!step.source) fail(file, where, `${step.type} has no source`);
    else if (!saveKeys.has(step.source)) fail(file, where, `source "${step.source}" is not saved by any step in this flow`);
    if (!step.saveAs) fail(file, where, `${step.type} has no saveAs`);
  }
  if (step.type === "matrix" && step.axes && !(Array.isArray(step.axes) && step.axes.length === 2)) {
    fail(file, where, "matrix axes must be two");
  }
}

function checkFlow(file, flow) {
  if (!flow || typeof flow !== "object") return fail(file, "?", "flow is not an object");
  const id = flow.id || "?";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(file, id, "id is not kebab-case");
  if (seenIds.has(id)) fail(file, id, `duplicate flow id (also in ${seenIds.get(id)})`);
  seenIds.set(id, file);
  if (!["arrival", "practice", "triage", "method", "commit"].includes(flow.kind)) fail(file, id, `unknown kind "${flow.kind}"`);
  (flowsByKind[flow.kind] = flowsByKind[flow.kind] || []).push(flow);
  if (typeof flow.title !== "string" || flow.title.length > 32) fail(file, id, "title missing or over 32 chars");
  if (flow.blurb != null && flow.blurb.length > 90) fail(file, id, `blurb is ${flow.blurb.length} chars, max 90`);
  if (!flow.steps || typeof flow.steps !== "object") return fail(file, id, "steps missing");
  if (!flow.steps[flow.entry]) fail(file, id, `entry "${flow.entry}" is not a step`);

  const saveKeys = new Set();
  const stepIds = new Set();
  for (const [key, step] of Object.entries(flow.steps)) {
    if (step && step.saveAs) {
      if (saveKeys.has(step.saveAs)) fail(file, `${id}.${key}`, `saveAs "${step.saveAs}" used twice in this flow`);
      saveKeys.add(step.saveAs);
    }
    stepIds.add(key);
  }
  for (const [key, step] of Object.entries(flow.steps)) checkStep(file, flow, key, step, saveKeys);

  // Every step must be reachable from entry, and a terminal must be reachable.
  const seen = new Set();
  const queue = [flow.entry];
  let terminal = false;
  while (queue.length) {
    const k = queue.pop();
    if (!flow.steps[k] || seen.has(k)) continue;
    seen.add(k);
    for (const t of nextTargets(flow.steps[k].next)) {
      if (TERMINAL.includes(t)) terminal = true;
      else queue.push(t);
    }
  }
  for (const k of stepIds) if (!seen.has(k)) fail(file, `${id}.${k}`, "unreachable from entry");
  if (!terminal) fail(file, id, "no path to _end or _exit");
}

for (const [file, exp] of sources) {
  const list = asList(exp);
  if (!list.length) fail(file, "?", "exports no flow");
  for (const flow of list) checkFlow(file, flow);
}

// Standalone steps.
const mi = manifest.methodIndex;
if (!mi || mi.type !== "choice") fail("methods/index.js", "methodIndex", "not a choice step");
else {
  const pseudo = { id: "method-index", kind: "step", steps: { [mi.id]: { ...mi, next: "_end" } } };
  checkStep("methods/index.js", pseudo, mi.id, pseudo.steps[mi.id], new Set());
  if (!mi.map || typeof mi.map !== "object") fail("methods/index.js", "methodIndex", "map missing");
  else {
    const methodIds = new Set((flowsByKind.method || []).map((f) => f.id));
    for (const o of mi.options || []) {
      const ids = mi.map[o.id];
      if (!Array.isArray(ids) || !ids.length) fail("methods/index.js", "methodIndex", `map has no methods for "${o.id}"`);
      else for (const m of ids) if (!methodIds.has(m)) fail("methods/index.js", "methodIndex", `map "${o.id}" names unknown method "${m}"`);
    }
  }
}
const en = commitMod.energyNow;
if (!en || en.type !== "rate") fail("commit.js", "energyNow", "not a rate step");
else checkStep("commit.js", { id: "energy-now", kind: "step", steps: { [en.id]: { ...en, next: "_end" } } }, en.id, { ...en, next: "_end" }, new Set());

if ((flowsByKind.arrival || []).length !== 1) fail("arrival.js", "arrival", "exactly one arrival flow expected");
if ((flowsByKind.triage || []).length !== 1) fail("triage.js", "triage", "exactly one triage flow expected");
if ((flowsByKind.commit || []).length !== 1) fail("commit.js", "commit", "exactly one commit flow expected");
for (const f of flowsByKind.practice || []) {
  if (!(f.tags || []).some((t) => ["breath", "move", "ground"].includes(t))) fail("practices.js", f.id, "practice needs a tag breath|move|ground");
}
for (const f of flowsByKind.method || []) {
  if (!(f.tags || []).some((t) => ["unclear", "no-options", "too-many", "afraid"].includes(t))) fail("methods/index.js", f.id, "method needs a tag unclear|no-options|too-many|afraid");
}
for (const f of flowsByKind.commit || []) {
  const keys = new Set(Object.values(f.steps).map((s) => s.saveAs).filter(Boolean));
  for (const k of ["when", "then", "first", "energyAfter"]) if (!keys.has(k)) fail("commit.js", f.id, `commit flow lacks saveAs "${k}"`);
}

if (failures.length) {
  for (const f of failures) console.error(f);
  console.error(`validate: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`validate: ok (${seenIds.size} flows)`);
