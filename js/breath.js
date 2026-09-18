// Thresherium — the breath orb and the countdown ring for timer steps.
//
// mountBreath(container, step, { onDone, onTick }) renders one timer step:
//   step.pattern present  -> the orb: a chalk disc scaled 0.55..1.0 with the
//                            phase, the phase name and a digit counting down
//   step.pattern null     -> a countdown ring plus step.instruction and one
//                            of step.cues, rotated every 20 s
// Timing runs on requestAnimationFrame and is derived from performance.now()
// each frame, so a slow or dropped frame never drifts the pattern. The tab
// going hidden pauses the exercise and resumes it when the tab returns.
//
// Every frame calls setBreath(phase, t) so the galaxy breathes with the orb,
// and audio.cue("in" | "out") fires at phase starts, "done" at the end.
//
// Reduced motion: no per-frame transform. The orb steps through at most four
// sizes per phase (never faster than 1 Hz), the ring advances once a second,
// and the phase names carry the rhythm.
//
// Google-Translate safety: state lives in variables; text is only written.

import { el, setText } from "./dom.js";
import { setBreath } from "./backdrop.js";
import { audio } from "./audio.js";

const PHASE_TEXT = {
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
  rest: "Rest"
};
const ORB_MIN = 0.55;
const ORB_MAX = 1.0;
const CUE_ROTATE_S = 20;
const RING_R = 100; // matches the SVG below (viewBox 220, r 100)
const RING_C = 2 * Math.PI * RING_R;

const reduceMQ =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

function motionReduced() {
  return reduceMQ.matches || document.documentElement.getAttribute("data-motion") === "reduced";
}

function easeInOut(p) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function mmss(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

// pattern { inhale, hold1, exhale, hold2 } -> ordered phases with offsets.
// Zero-length phases are dropped (4-7-8 has no second hold).
function buildPhases(p) {
  const raw = [
    { name: "inhale", s: Number(p.inhale) || 0 },
    { name: "hold", s: Number(p.hold1) || 0 },
    { name: "exhale", s: Number(p.exhale) || 0 },
    { name: "rest", s: Number(p.hold2) || 0 }
  ];
  const phases = [];
  let at = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].s <= 0) continue;
    phases.push({ name: raw[i].name, s: raw[i].s, start: at });
    at += raw[i].s;
  }
  return { phases: phases, cycle: at };
}

// Orb scale for a phase at progress t. Full motion: eased and continuous.
// Reduced motion: quantized to <= 4 steps and never faster than one per second.
function orbScale(phase, t, reduced) {
  const span = ORB_MAX - ORB_MIN;
  if (phase.name === "hold") return ORB_MAX;
  if (phase.name === "rest") return ORB_MIN;
  let p;
  if (reduced) {
    const steps = Math.max(1, Math.min(4, Math.floor(phase.s)));
    p = Math.min(1, Math.floor(t * steps + 1) / steps);
  } else {
    p = easeInOut(clamp01(t));
  }
  return phase.name === "inhale" ? ORB_MIN + span * p : ORB_MAX - span * p;
}

export function mountBreath(container, step, opts) {
  opts = opts || {};
  const onDone = typeof opts.onDone === "function" ? opts.onDone : null;
  const onTick = typeof opts.onTick === "function" ? opts.onTick : null;

  const total = Math.max(1, Number(step && step.seconds) || 60);
  const built = step && step.pattern ? buildPhases(step.pattern) : null;
  const phases = built && built.cycle > 0 ? built.phases : null;
  const cycle = phases ? built.cycle : 0;
  const cues = step && Array.isArray(step.cues) ? step.cues.filter(Boolean) : [];

  // ---- DOM -------------------------------------------------------------------

  const root = el("div", { class: "breath", "data-mode": phases ? "orb" : "ring" });

  let orb = null;
  let ring = null;
  let phaseName = null;
  let count = null;
  let cueNode = null;

  if (phases) {
    const stage = el("div", { class: "orb-stage" });
    orb = el("div", { class: "orb", "aria-hidden": "true" });
    stage.appendChild(orb);
    root.appendChild(stage);

    phaseName = el("span", { class: "orb-phase__name" }, PHASE_TEXT.inhale);
    count = el("span", { class: "orb-phase__count num" }, String(phases[0].s));
    root.appendChild(
      el("p", { class: "orb-phase", "aria-live": "polite" }, phaseName, " ", count)
    );
  } else {
    const stage = el("div", { class: "orb-stage" });
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "ring");
    svg.setAttribute("viewBox", "0 0 220 220");
    svg.setAttribute("aria-hidden", "true");
    const track = document.createElementNS(svgNS, "circle");
    track.setAttribute("class", "ring__track");
    track.setAttribute("cx", "110");
    track.setAttribute("cy", "110");
    track.setAttribute("r", String(RING_R));
    ring = document.createElementNS(svgNS, "circle");
    ring.setAttribute("class", "ring__fill");
    ring.setAttribute("cx", "110");
    ring.setAttribute("cy", "110");
    ring.setAttribute("r", String(RING_R));
    ring.setAttribute("stroke-dasharray", String(RING_C));
    ring.setAttribute("stroke-dashoffset", "0");
    svg.appendChild(track);
    svg.appendChild(ring);
    stage.appendChild(svg);
    count = el("span", { class: "orb-phase__count num ring__count" }, mmss(total));
    stage.appendChild(count);
    root.appendChild(stage);

    if (step && step.instruction) {
      root.appendChild(el("p", { class: "orb-instruction" }, String(step.instruction)));
    }
    if (cues.length) {
      cueNode = el("p", { class: "orb-cue", "aria-live": "polite" }, String(cues[0]));
      root.appendChild(cueNode);
    }
  }

  const pauseBtn = el(
    "button",
    { class: "btn btn--ghost", type: "button", "aria-pressed": "false", "data-action": "pause" },
    "Pause"
  );
  const skipBtn = el(
    "button",
    { class: "btn btn--ghost", type: "button", "data-action": "skip" },
    "Skip"
  );
  const controls = el("div", { class: "orb-controls" }, pauseBtn, skipBtn);
  root.appendChild(controls);
  container.appendChild(root);

  // ---- timing ----------------------------------------------------------------

  let startStamp = 0; // performance.now() minus already elapsed ms
  let elapsed = 0; // seconds of active (unpaused) time
  let paused = false;
  let stopped = false;
  let autoPaused = false;
  let rafId = 0;
  let endAt = null; // seconds; set once `total` has elapsed, lands on an exhale end
  let lastKey = -1; // cycleIdx * phases.length + phaseIdx, to detect phase starts
  let lastScale = -1;
  let lastCount = "";
  let lastCue = -1;
  let lastOffset = -1;

  function paintScale(v) {
    if (Math.abs(v - lastScale) < 0.0005) return;
    lastScale = v;
    orb.style.transform = "scale(" + v.toFixed(4) + ")";
  }

  function paintCount(text) {
    if (text === lastCount) return;
    lastCount = text;
    setText(count, text);
  }

  function tickOrb(now) {
    const reduced = motionReduced();
    const cycleIdx = Math.floor(elapsed / cycle);
    const pos = elapsed - cycleIdx * cycle;
    let i = phases.length - 1;
    for (let k = 0; k < phases.length; k++) {
      if (pos < phases[k].start + phases[k].s) {
        i = k;
        break;
      }
    }
    const ph = phases[i];
    const inPhase = pos - ph.start;
    const t = clamp01(inPhase / ph.s);

    const key = cycleIdx * phases.length + i;
    if (key !== lastKey) {
      lastKey = key;
      setText(phaseName, PHASE_TEXT[ph.name]);
      if (ph.name === "inhale") audio.cue("in");
      else if (ph.name === "exhale") audio.cue("out");
    }

    paintScale(orbScale(ph, t, reduced));
    paintCount(String(Math.max(1, Math.ceil(ph.s - inPhase))));
    setBreath(ph.name, t);

    if (elapsed >= total && endAt === null) {
      // finish at the end of an exhale, never mid-breath
      let ex = -1;
      for (let k = 0; k < phases.length; k++) if (phases[k].name === "exhale") ex = k;
      if (ex < 0 || i > ex) endAt = elapsed; // no exhale phase, or already past it
      else endAt = cycleIdx * cycle + phases[ex].start + phases[ex].s;
    }

    if (onTick) onTick({ phase: ph.name, t: t, elapsed: elapsed, remaining: Math.max(0, total - elapsed) });
  }

  function tickRing(now) {
    const reduced = motionReduced();
    const shown = reduced ? Math.floor(elapsed) : elapsed;
    const offset = RING_C * clamp01(shown / total);
    if (Math.abs(offset - lastOffset) > 0.01) {
      lastOffset = offset;
      ring.setAttribute("stroke-dashoffset", offset.toFixed(2));
    }
    paintCount(mmss(total - elapsed));

    if (cueNode && cues.length > 1) {
      const idx = Math.floor(elapsed / CUE_ROTATE_S) % cues.length;
      if (idx !== lastCue) {
        lastCue = idx;
        setText(cueNode, String(cues[idx]));
      }
    }

    if (elapsed >= total && endAt === null) endAt = elapsed;
    if (onTick) onTick({ phase: "rest", t: clamp01(elapsed / total), elapsed: elapsed, remaining: Math.max(0, total - elapsed) });
  }

  function frame(now) {
    if (stopped || paused) return;
    elapsed = (now - startStamp) / 1000;
    if (phases) tickOrb(now);
    else tickRing(now);
    if (endAt !== null && elapsed >= endAt) {
      finish();
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  function finish() {
    if (stopped) return;
    teardown();
    setBreath("rest", 0);
    audio.cue("done");
    if (onDone) onDone();
  }

  function teardown() {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    document.removeEventListener("visibilitychange", onVisibility);
  }

  function setPaused(p) {
    if (stopped || paused === p) return;
    paused = p;
    pauseBtn.setAttribute("aria-pressed", p ? "true" : "false");
    setText(pauseBtn, p ? "Resume" : "Pause");
    if (p) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      startStamp = performance.now() - elapsed * 1000;
      rafId = requestAnimationFrame(frame);
    }
  }

  function onVisibility() {
    if (document.hidden) {
      if (!paused && !stopped) {
        autoPaused = true;
        setPaused(true);
      }
    } else if (autoPaused) {
      autoPaused = false;
      setPaused(false);
    }
  }

  pauseBtn.addEventListener("click", function () {
    autoPaused = false;
    setPaused(!paused);
  });
  skipBtn.addEventListener("click", function () {
    if (stopped) return;
    teardown();
    setBreath("rest", 0);
    if (onDone) onDone();
  });
  document.addEventListener("visibilitychange", onVisibility);

  // first frame: paint the resting state, then start
  if (orb) paintScale(ORB_MIN);
  setBreath("rest", 0);
  startStamp = performance.now();
  if (document.hidden) {
    autoPaused = true;
    paused = true;
    pauseBtn.setAttribute("aria-pressed", "true");
    setText(pauseBtn, "Resume");
  } else {
    rafId = requestAnimationFrame(frame);
  }

  return {
    pause: function () {
      autoPaused = false;
      setPaused(true);
    },
    resume: function () {
      autoPaused = false;
      setPaused(false);
    },
    stop: function () {
      if (stopped) return;
      teardown();
      setBreath("rest", 0);
    },
    get paused() {
      return paused;
    }
  };
}
