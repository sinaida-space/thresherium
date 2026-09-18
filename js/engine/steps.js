// Thresherium engine: one render function per step type.
// <!-- typocheck: off -->
// Markup-building code: JS syntax quotes, class names and data-* literals
// trip the prose checks, so the masking runs to the end of the file.
// renderStep(step, ctx) returns a DOM node; the step calls ctx.onAnswer(pick)
// once. ctx = { answers, initial, onAnswer }.
//
// Rules kept here: logic reads data-* attributes and captured references,
// never textContent (Google Translate rewrites text nodes). Arrow keys move
// between options, Enter or Space selects, Tab order follows the DOM. Every
// timer has Pause and Skip. Touch targets are 44px or more (see app.css).

import { el, setText, clear } from "../dom.js";
import { mountBreath } from "../breath.js";
import { buttons } from "../../data/copy.js";
import { cue, announce } from "./fx.js";

const teardowns = new WeakMap();

export function renderStep(step, ctx) {
  const fn = RENDER[step.type];
  if (!fn) return el("p", { class: "card__note" }, "Unknown step type.");
  return fn(step, ctx);
}

// Stops timers and intervals owned by a step node. Idempotent.
export function destroyStep(node) {
  const fn = node && teardowns.get(node);
  if (fn) {
    teardowns.delete(node);
    fn();
  }
}

// ---- shared bits ------------------------------------------------------------

function prompt(text, id) {
  return el("p", { class: "card__q", id: id }, text);
}

function note(root, text) {
  if (text) root.appendChild(el("p", { class: "card__note" }, text));
}

function continueBtn(label, onClick) {
  const b = el("button", { class: "btn btn--block", type: "button", disabled: true }, label);
  b.addEventListener("click", onClick);
  return b;
}

// Roving tabindex: one tab stop per group, arrows move focus between items.
function roving(group, selector) {
  group.addEventListener("keydown", function (e) {
    const items = Array.from(group.querySelectorAll(selector));
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    let j = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (i + 1) % items.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = items.length - 1;
    if (j < 0) return;
    e.preventDefault();
    items.forEach(function (it, k) { it.tabIndex = k === j ? 0 : -1; });
    items[j].focus();
  });
}

function setTabStops(items, selectedIndex) {
  const s = selectedIndex >= 0 ? selectedIndex : 0;
  items.forEach(function (it, k) { it.tabIndex = k === s ? 0 : -1; });
}

function listFrom(answers, key) {
  const v = answers ? answers[key] : null;
  if (Array.isArray(v)) return v.slice();
  if (typeof v === "string" && v) return [v];
  return [];
}

// ---- choice -----------------------------------------------------------------

function renderChoice(step, ctx) {
  const root = el("div", { class: "step step--choice" });
  const qid = "q-" + step.id;
  root.appendChild(prompt(step.question, qid));
  note(root, step.note);

  const multi = !!step.multi;
  const picked = new Set(
    Array.isArray(ctx.initial) ? ctx.initial : ctx.initial ? [ctx.initial] : []
  );

  const group = el("div", {
    class: "opts",
    role: multi ? "group" : "radiogroup",
    "aria-labelledby": qid
  });
  const btns = [];

  function paint() {
    btns.forEach(function (b) {
      b.setAttribute("aria-checked", picked.has(b.dataset.id) ? "true" : "false");
    });
    go.disabled = picked.size === 0;
  }

  for (const o of step.options) {
    const b = el("button", {
      class: "opt",
      type: "button",
      role: multi ? "checkbox" : "radio",
      "data-id": o.id,
      "aria-checked": "false"
    });
    b.appendChild(el("span", { class: "opt__label" }, o.label));
    if (o.desc) b.appendChild(el("span", { class: "opt__desc" }, o.desc));
    b.addEventListener("click", function () {
      const id = b.dataset.id;
      if (multi) {
        if (picked.has(id)) picked.delete(id);
        else picked.add(id);
      } else {
        picked.clear();
        picked.add(id);
      }
      paint();
    });
    btns.push(b);
    group.appendChild(b);
  }
  roving(group, ".opt");
  root.appendChild(group);

  const go = continueBtn(buttons.continue, function () {
    if (!picked.size) return;
    const ids = btns.map(function (b) { return b.dataset.id; }).filter(function (id) { return picked.has(id); });
    ctx.onAnswer(multi ? ids : ids[0]);
  });
  root.appendChild(go);

  setTabStops(btns, btns.findIndex(function (b) { return picked.has(b.dataset.id); }));
  paint();
  return root;
}

// ---- text -------------------------------------------------------------------

function renderText(step, ctx) {
  const root = el("div", { class: "step step--text" });
  const pid = "p-" + step.id;
  root.appendChild(prompt(step.prompt, pid));
  note(root, step.note);
  const min = Math.max(0, step.minChars | 0);

  if (step.mode === "list") return renderTextList(step, ctx, root, pid, min);

  const field = el("textarea", {
    class: "field",
    id: "f-" + step.id,
    rows: 3,
    placeholder: step.placeholder || "",
    "aria-labelledby": pid
  });
  if (typeof ctx.initial === "string") field.value = ctx.initial;
  root.appendChild(field);

  const go = continueBtn(buttons.continue, function () {
    const v = field.value.trim();
    if (v.length < min) return;
    ctx.onAnswer(v);
  });
  field.addEventListener("input", function () {
    go.disabled = field.value.trim().length < min;
  });
  field.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !go.disabled) go.click();
  });
  go.disabled = field.value.trim().length < min;
  root.appendChild(go);
  return root;
}

function renderTextList(step, ctx, root, pid, min) {
  const max = Math.max(1, step.maxItems | 0) || 12;
  const items = Array.isArray(ctx.initial) ? ctx.initial.slice() : [];

  const row = el("div", { class: "listadd" });
  const field = el("input", {
    class: "field",
    type: "text",
    id: "f-" + step.id,
    placeholder: step.placeholder || "",
    "aria-labelledby": pid,
    autocomplete: "off"
  });
  const add = el("button", { class: "btn btn--ghost", type: "button" }, "Add");
  row.appendChild(field);
  row.appendChild(add);
  root.appendChild(row);

  const count = el("p", { class: "card__note listcount", "aria-live": "polite" });
  root.appendChild(count);

  const ul = el("ul", { class: "list" });
  root.appendChild(ul);

  function paint() {
    clear(ul);
    items.forEach(function (text, i) {
      const li = el("li", { class: "list__item" });
      li.appendChild(el("span", { class: "list__text" }, text));
      const rm = el("button", {
        class: "list__rm",
        type: "button",
        "data-index": i,
        "aria-label": "Remove item " + (i + 1)
      }, "×");
      rm.addEventListener("click", function () {
        items.splice(Number(rm.dataset.index), 1);
        paint();
        field.focus();
      });
      li.appendChild(rm);
      ul.appendChild(li);
    });
    const full = items.length >= max;
    field.disabled = full;
    add.disabled = full;
    setText(count, items.length + " of " + max);
    go.disabled = items.length === 0;
  }

  function addItem() {
    const v = field.value.trim();
    if (v.length < min || items.length >= max) return;
    items.push(v);
    field.value = "";
    paint();
    if (items.length >= max) go.focus();
    else field.focus();
  }

  add.addEventListener("click", addItem);
  field.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  });

  const go = continueBtn(buttons.continue, function () {
    if (!items.length) return;
    ctx.onAnswer(items.slice());
  });
  root.appendChild(go);
  paint();
  return root;
}

// ---- rate -------------------------------------------------------------------

function renderRate(step, ctx) {
  const root = el("div", { class: "step step--rate" });
  const pid = "p-" + step.id;
  root.appendChild(prompt(step.prompt, pid));
  note(root, step.note);

  let value = Number(ctx.initial) || 0;
  const group = el("div", { class: "rate", role: "radiogroup", "aria-labelledby": pid });
  const btns = [];
  for (let n = 1; n <= 10; n++) {
    const b = el("button", {
      class: "rate__btn num",
      type: "button",
      role: "radio",
      "data-value": n,
      "aria-checked": "false"
    }, String(n));
    b.addEventListener("click", function () {
      value = Number(b.dataset.value);
      paint();
    });
    btns.push(b);
    group.appendChild(b);
  }
  roving(group, ".rate__btn");
  root.appendChild(group);

  const scale = el("div", { class: "rate__scale", "aria-hidden": "true" });
  scale.appendChild(el("span", null, step.low || ""));
  scale.appendChild(el("span", null, step.high || ""));
  root.appendChild(scale);

  const go = continueBtn(buttons.continue, function () {
    if (value) ctx.onAnswer(value);
  });
  root.appendChild(go);

  function paint() {
    btns.forEach(function (b) {
      b.setAttribute("aria-checked", Number(b.dataset.value) === value ? "true" : "false");
    });
    go.disabled = !value;
  }
  setTabStops(btns, value ? value - 1 : 0);
  paint();
  return root;
}

// ---- info -------------------------------------------------------------------

function renderInfo(step, ctx) {
  const root = el("div", { class: "step step--info" });
  for (const p of step.body || []) root.appendChild(el("p", { class: "info__p" }, p));
  const go = el("button", { class: "btn btn--block", type: "button" }, step.cta || buttons.continue);
  go.addEventListener("click", function () { ctx.onAnswer(true); });
  root.appendChild(go);
  return root;
}

// ---- timer ------------------------------------------------------------------

function fmt(secs) {
  const s = Math.max(0, Math.ceil(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + (r < 10 ? "0" : "") + r;
}

function renderTimer(step, ctx) {
  const root = el("div", { class: "step step--timer" });
  if (step.title) root.appendChild(el("h2", { class: "timer__title" }, step.title));
  if (step.instruction) root.appendChild(el("p", { class: "timer__instruction" }, step.instruction));

  const stage = el("div", { class: "timer__stage" });
  root.appendChild(stage);

  const cueNode = el("p", { class: "timer__cue", "aria-live": "polite" });
  root.appendChild(cueNode);

  const total = Math.max(1, step.seconds | 0);
  const cues = Array.isArray(step.cues) ? step.cues : [];
  let cueIndex = -1;
  let done = false;

  // Cues are spaced evenly across the whole exercise.
  function cueAt(elapsed) {
    if (!cues.length) return;
    const idx = Math.min(cues.length - 1, Math.floor((elapsed / total) * cues.length));
    if (idx !== cueIndex) {
      cueIndex = idx;
      setText(cueNode, cues[idx]);
    }
  }

  let stopAll = function () {};

  function finish(completed, playCue) {
    if (done) return;
    done = true;
    stopAll();
    if (completed && playCue) cue("done");
    ctx.onAnswer({ completed: completed, seconds: total });
  }

  if (step.pattern) {
    // Breath orb from js/breath.js. It owns the phases, the galaxy breath,
    // the in/out/done cues, the live phase text and its own Pause and Skip
    // buttons. onTick(tick) reports { phase, t, elapsed, remaining }; only
    // the evenly spaced cues are kept here.
    let remaining = total;
    const ctl = mountBreath(stage, step, {
      onTick: function (tick) {
        remaining = tick.remaining;
        cueAt(tick.elapsed);
      },
      // Skip and natural end both land here; the remaining time tells them apart.
      onDone: function () { finish(remaining <= 0, false); }
    });
    stopAll = function () { if (ctl && ctl.stop) ctl.stop(); };
    cueAt(0);
  } else {
    // Plain countdown with the instruction, cues, Pause and Skip.
    const digits = el("p", { class: "timer__digits num" }, fmt(total));
    stage.appendChild(digits);

    const controls = el("div", { class: "timer__controls" });
    const pauseBtn = el("button", { class: "btn btn--ghost", type: "button", "aria-pressed": "false" }, buttons.pause);
    const skipBtn = el("button", { class: "btn btn--ghost", type: "button" }, buttons.skip);
    controls.appendChild(pauseBtn);
    controls.appendChild(skipBtn);
    root.appendChild(controls);

    let elapsed = 0;
    let last = 0;
    let timer = 0;
    let paused = false;
    function tick() {
      const now = performance.now();
      elapsed += (now - last) / 1000;
      last = now;
      setText(digits, fmt(total - elapsed));
      cueAt(elapsed);
      if (elapsed >= total) finish(true, true);
    }
    function start() {
      last = performance.now();
      timer = setInterval(tick, 200);
    }
    stopAll = function () { clearInterval(timer); };

    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      setText(pauseBtn, paused ? buttons.resume : buttons.pause);
      clearInterval(timer);
      if (!paused) start();
      announce(paused ? buttons.pause : buttons.resume);
    });
    skipBtn.addEventListener("click", function () { finish(false, false); });

    cueAt(0);
    start();
  }

  teardowns.set(root, function () { done = true; stopAll(); });
  return root;
}

// ---- matrix -----------------------------------------------------------------

const LEVELS = ["low", "high"];

function renderMatrix(step, ctx) {
  const root = el("div", { class: "step step--matrix" });
  const pid = "p-" + step.id;
  root.appendChild(prompt(step.prompt, pid));
  note(root, step.note);

  const items = listFrom(ctx.answers, step.source);
  const axes = Array.isArray(step.axes) && step.axes.length === 2 ? step.axes : ["impact", "effort"];
  const state = items.map(function (item) {
    const prev = Array.isArray(ctx.initial)
      ? ctx.initial.find(function (r) { return r && r.item === item; })
      : null;
    return { item: item, impact: prev ? prev.impact : null, effort: prev ? prev.effort : null };
  });

  const table = el("div", { class: "matrix" });
  const segs = [];

  state.forEach(function (row, i) {
    const r = el("div", { class: "matrix__row" });
    const label = el("p", { class: "matrix__item", id: "mi-" + step.id + "-" + i }, row.item);
    r.appendChild(label);
    axes.forEach(function (axis) {
      const g = el("div", {
        class: "seg",
        role: "radiogroup",
        "aria-label": axis,
        "data-axis": axis,
        "data-index": i
      });
      g.appendChild(el("span", { class: "seg__name", "aria-hidden": "true" }, axis));
      const btns = LEVELS.map(function (lv) {
        const b = el("button", {
          class: "seg__btn",
          type: "button",
          role: "radio",
          "data-level": lv,
          "aria-checked": "false"
        }, lv);
        b.addEventListener("click", function () {
          state[Number(g.dataset.index)][g.dataset.axis] = b.dataset.level;
          paint();
        });
        g.appendChild(b);
        return b;
      });
      setTabStops(btns, 0);
      roving(g, ".seg__btn");
      segs.push({ g: g, btns: btns, index: i, axis: axis });
      r.appendChild(g);
    });
    table.appendChild(r);
  });
  root.appendChild(table);

  const summary = el("p", { class: "matrix__summary", "aria-live": "polite" });
  root.appendChild(summary);

  const go = continueBtn(buttons.continue, function () {
    if (!complete()) return;
    ctx.onAnswer(state.map(function (r) { return { item: r.item, impact: r.impact, effort: r.effort }; }));
  });
  root.appendChild(go);

  function complete() {
    return state.length > 0 && state.every(function (r) { return r.impact && r.effort; });
  }

  function paint() {
    segs.forEach(function (s) {
      const cur = state[s.index][s.axis];
      s.btns.forEach(function (b) {
        b.setAttribute("aria-checked", b.dataset.level === cur ? "true" : "false");
      });
    });
    setText(summary, summaryLine(state));
    go.disabled = !complete();
  }
  paint();
  return root;
}

// Quadrant order: high impact + low effort first, then high/high, low/low,
// low/high. Exported so plan.js can reuse the same order.
export function matrixOrder(rows) {
  const rank = function (r) {
    if (r.impact === "high" && r.effort === "low") return 0;
    if (r.impact === "high") return 1;
    if (r.effort === "low") return 2;
    return 3;
  };
  return rows.slice().sort(function (a, b) { return rank(a) - rank(b); });
}

function summaryLine(state) {
  const first = state.filter(function (r) { return r.impact === "high" && r.effort === "low"; });
  if (!first.length) return "";
  return "High impact, low effort: " + first.map(function (r) { return r.item; }).join("; ") + ".";
}

// ---- pick -------------------------------------------------------------------

function renderPick(step, ctx) {
  const root = el("div", { class: "step step--pick" });
  const pid = "p-" + step.id;
  root.appendChild(prompt(step.prompt, pid));
  note(root, step.note);

  const items = listFrom(ctx.answers, step.source);
  let value = typeof ctx.initial === "string" ? ctx.initial : "";

  const group = el("div", { class: "opts", role: "radiogroup", "aria-labelledby": pid });
  const btns = items.map(function (item, i) {
    const b = el("button", {
      class: "opt",
      type: "button",
      role: "radio",
      "data-index": i,
      "aria-checked": "false"
    });
    b.appendChild(el("span", { class: "opt__label" }, item));
    b.addEventListener("click", function () {
      value = items[Number(b.dataset.index)];
      paint();
    });
    group.appendChild(b);
    return b;
  });
  roving(group, ".opt");
  root.appendChild(group);

  const go = continueBtn(buttons.continue, function () {
    if (value) ctx.onAnswer(value);
  });
  root.appendChild(go);

  function paint() {
    btns.forEach(function (b) {
      b.setAttribute("aria-checked", items[Number(b.dataset.index)] === value ? "true" : "false");
    });
    go.disabled = !value;
  }
  setTabStops(btns, items.indexOf(value));
  paint();
  return root;
}

const RENDER = {
  choice: renderChoice,
  text: renderText,
  rate: renderRate,
  info: renderInfo,
  timer: renderTimer,
  matrix: renderMatrix,
  pick: renderPick
};
