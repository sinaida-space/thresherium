// Thresherium: breath orb. STUB from task 2; task 3 replaces this file.
// Contract: mountBreath(container, step, { onDone, onTick })
//   returns { pause, resume, stop, paused }
//   onTick(phase, t) with phase "inhale" | "hold" | "exhale" | "rest", t 0..1
//   onDone() once step.seconds have elapsed
// This stub is a plain countdown that prints the phase name as text.

import { el, setText } from "./dom.js";

const PHASES = [
  ["inhale", "inhale"],
  ["hold1", "hold"],
  ["exhale", "exhale"],
  ["hold2", "rest"]
];

export function mountBreath(container, step, hooks) {
  const onDone = (hooks && hooks.onDone) || function () {};
  const onTick = (hooks && hooks.onTick) || function () {};
  const pattern = step.pattern || { inhale: 4, hold1: 0, exhale: 4, hold2: 0 };
  const total = Math.max(1, step.seconds | 0);

  const cycle = PHASES.map(function (p) {
    return { key: p[1], secs: Math.max(0, Number(pattern[p[0]]) || 0) };
  }).filter(function (p) { return p.secs > 0; });
  const cycleLen = cycle.reduce(function (a, p) { return a + p.secs; }, 0) || 1;

  const phaseNode = el("p", { class: "breath__phase", "data-phase": "" });
  const countNode = el("p", { class: "breath__count num" });
  container.appendChild(phaseNode);
  container.appendChild(countNode);

  let elapsed = 0;
  let last = 0;
  let paused = false;
  let stopped = false;
  let timer = 0;
  let shownPhase = "";

  function paint() {
    const inCycle = elapsed % cycleLen;
    let acc = 0;
    let cur = cycle[0];
    let t = 0;
    for (const p of cycle) {
      if (inCycle < acc + p.secs) {
        cur = p;
        t = (inCycle - acc) / p.secs;
        break;
      }
      acc += p.secs;
    }
    if (cur.key !== shownPhase) {
      shownPhase = cur.key;
      phaseNode.setAttribute("data-phase", cur.key);
      setText(phaseNode, cur.key);
    }
    setText(countNode, String(Math.ceil(total - elapsed)));
    onTick(cur.key, t);
  }

  function tick() {
    if (stopped || paused) return;
    const now = performance.now();
    elapsed += (now - last) / 1000;
    last = now;
    if (elapsed >= total) {
      stop();
      setText(countNode, "0");
      onDone();
      return;
    }
    paint();
  }

  function start() {
    last = performance.now();
    timer = setInterval(tick, 100);
    paint();
  }

  function pause() {
    paused = true;
    clearInterval(timer);
  }

  function resume() {
    if (stopped || !paused) return;
    paused = false;
    start();
  }

  function stop() {
    stopped = true;
    clearInterval(timer);
  }

  start();

  return {
    pause: pause,
    resume: resume,
    stop: stop,
    paused: function () { return paused; }
  };
}
