// Thresherium — fixed galaxy + CRT/VHS backdrop, forked from Soulstice.
//
// One <canvas id="backdrop">, position:fixed, below all content, inserted once
// from app.js boot. A drifting parallax starfield (spirit of sinaida.eu) with a
// CRT/VHS overlay on top (scanlines, vignette, chromatic fringe, low-frequency
// flicker/roll, faint noise). All readable text sits on opaque cards, so the
// backdrop is allowed to be clearly present.
//
// Thresherium adds three things on top of the Soulstice machinery:
//   - a slow spiral drift of the whole field around the viewport centre
//   - a mood system (setMood): arrive / breathe / think / plan, each a set of
//     render parameters, cross-faded over 1.2 s in the render loop
//   - a breath state (setBreath): the star field scales 1.00 -> 1.06 with the
//     inhale and back with the exhale; the nebula lifts 10% at the peak
//
// State comes only from data-view / data-motion on <html> (set by chrome.js)
// and from prefers-reduced-motion — attributes and .matches, never text.
//
//   data-view="light"    -> canvas hidden by CSS, rAF stopped
//   data-motion="reduced"
//   or prefers-reduced-motion, or the perf watchdog latching
//                        -> one static painted frame (still shows the brighter
//                           starfield + scanlines), no animation
//
// Perf guards: particle count scales with viewport area; devicePixelRatio is
// clamped to <= 2; the rAF loop pauses on document.hidden; if frame time stays
// poor for ~1s it drops to the static render and stays there for the session.

let canvas = null;
let ctx = null;
let started = false;

let W = 0;
let H = 0;
let DPR = 1;

let stars = [];
let nebula = [];
let pal = { ground: "#050505", star: "#f6f6f6", red: "#cd0000" };
let spriteWhite = null;
let spriteCool = null; // chalk mixed 15% toward cathode, for the "breathe" mood
let spriteRed = null;
let vignette = null;
let vignetteTight = null; // "think" mood pulls the corners in
let scanPattern = null;
let noiseTiles = [];

let rafId = 0;
let running = false;
let lastT = 0;
let slowSince = 0;
let frameSamples = []; // first 60 frame times (ms), for the display's own cadence
let slowLimit = 24; // ms; raised once the cadence is known (30 Hz displays deliver 33 ms)
let sessionDegraded = false; // latched: stay on the static render for the session

let resizeTimer = 0;

const reduceMQ =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false, addEventListener: function () {}, addListener: function () {} };

const DRIFT_X = -3.4; // px per second at the nearest depth
const DRIFT_Y = 1.1;
// Spiral drift: each star also turns around the viewport centre, nearer stars
// faster, and creeps outward a little. Wrapping at the edges keeps the field
// full; a whole-canvas rotate would bare the corners within a minute.
const SPIRAL_W = 0.006; // radians per second at the nearest depth
const SPIRAL_OUT = 0.4; // px per second outward at the nearest depth

// ---- mood + breath state -----------------------------------------------------
// Each mood is a flat set of render parameters. The loop lerps `moodCur` from
// `moodFrom` toward `moodTo` over MOOD_MS with an ease-in-out, so a mood change
// never jumps, even when it lands in the middle of a previous transition.
//   neb    nebula alpha multiplier
//   speed  drift multiplier (0 = still)
//   temp   0..1 mix toward the cathode-tinted star sprite (1 = the 15% mix)
//   tight  0..1 blend of the tighter vignette on top of the normal one
//   twk    twinkle amplitude (smaller = sharper, steadier stars)
//   bright star alpha multiplier
const MOODS = {
  arrive: { neb: 1.0, speed: 1.0, temp: 0, tight: 0, twk: 0.28, bright: 1.0 },
  breathe: { neb: 0.6, speed: 0.5, temp: 1, tight: 0, twk: 0.2, bright: 1.0 },
  think: { neb: 1.0, speed: 0.0, temp: 0, tight: 1, twk: 0.08, bright: 1.05 },
  plan: { neb: 1.1, speed: 0.35, temp: 0, tight: 0, twk: 0.24, bright: 1.18 }
};
const MOOD_KEYS = ["neb", "speed", "temp", "tight", "twk", "bright"];
const MOOD_MS = 1200;

let moodName = "arrive";
let moodFrom = Object.assign({}, MOODS.arrive);
let moodTo = MOODS.arrive;
let moodCur = Object.assign({}, MOODS.arrive);
let moodT0 = 0; // performance.now() when the last setMood() landed

// Breath: the target scale is a pure function of (phase, t). The loop eases
// `breathCur` toward it so a late or dropped frame never shows as a jump.
const BREATH_MAX = 1.06;
let breathTarget = 1.0;
let breathCur = 1.0;
let breathPhase = "rest";
let breathT = 0;

function easeInOut(p) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

function tickMood(nowMs) {
  let p = (nowMs - moodT0) / MOOD_MS;
  if (p >= 1) {
    for (let i = 0; i < MOOD_KEYS.length; i++) moodCur[MOOD_KEYS[i]] = moodTo[MOOD_KEYS[i]];
    return;
  }
  if (p < 0) p = 0;
  const e = easeInOut(p);
  for (let i = 0; i < MOOD_KEYS.length; i++) {
    const k = MOOD_KEYS[i];
    moodCur[k] = moodFrom[k] + (moodTo[k] - moodFrom[k]) * e;
  }
}

function tickBreath(dt) {
  // ~120 ms time constant: tracks the per-frame target closely, hides jitter
  const k = Math.min(1, dt * 8);
  breathCur += (breathTarget - breathCur) * k;
}

export function setMood(m) {
  if (!MOODS[m]) return;
  moodName = m;
  if (!ctx || motionReduced()) {
    // no loop to lerp in: land on the target and repaint once
    moodFrom = Object.assign({}, MOODS[m]);
    moodTo = MOODS[m];
    moodCur = Object.assign({}, MOODS[m]);
    moodT0 = 0;
    if (ctx && viewMode() !== "light" && !document.hidden) renderStatic();
    return;
  }
  tickMood(performance.now()); // settle `moodCur` before capturing it
  moodFrom = Object.assign({}, moodCur);
  moodTo = MOODS[m];
  moodT0 = performance.now();
}

export function setBreath(phase, t) {
  if (t == null || t !== t) t = 0;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  breathPhase = phase;
  breathT = t;
  const span = BREATH_MAX - 1;
  if (phase === "inhale") breathTarget = 1 + span * t;
  else if (phase === "hold") breathTarget = BREATH_MAX;
  else if (phase === "exhale") breathTarget = BREATH_MAX - span * t;
  else breathTarget = 1; // "rest" or anything unknown
  // Reduced motion: the field stays put; the orb and its text carry the phase.
}

// ---- state reads -------------------------------------------------------------

function viewMode() {
  return document.documentElement.getAttribute("data-view") === "light"
    ? "light"
    : "full";
}

function motionReduced() {
  return (
    sessionDegraded ||
    reduceMQ.matches ||
    document.documentElement.getAttribute("data-motion") === "reduced"
  );
}

function readPalette() {
  try {
    const cs = getComputedStyle(document.documentElement);
    const pick = function (name, fb) {
      const v = cs.getPropertyValue(name);
      return v && v.trim() ? v.trim() : fb;
    };
    pal = {
      ground: pick("--void", "#050505"),
      star: pick("--chalk", "#f6f6f6"),
      red: pick("--red", "#cd0000")
    };
  } catch (e) {
    /* keep the defaults */
  }
}

// ---- build buffers ---------------------------------------------------------

// A soft round dot with a feathered edge, pre-rendered once so per-star cost is
// a single drawImage. 1px fillRects vanish at DPR 2 — this does not.
function makeSprite(rgb) {
  const s = 48;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const g = c.getContext("2d");
  const rad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  rad.addColorStop(0, "rgba(" + rgb + ",1)");
  rad.addColorStop(0.16, "rgba(" + rgb + ",1)"); // opaque plateau so up-scaling keeps the peak
  rad.addColorStop(0.4, "rgba(" + rgb + ",0.7)");
  rad.addColorStop(0.7, "rgba(" + rgb + ",0.18)");
  rad.addColorStop(1, "rgba(" + rgb + ",0)");
  g.fillStyle = rad;
  g.fillRect(0, 0, s, s);
  return c;
}

function buildSprites() {
  spriteWhite = makeSprite("245,246,248");
  // chalk (245,246,248) mixed 15% toward cathode #a7bebe (167,190,190)
  spriteCool = makeSprite("233,238,239");
  spriteRed = makeSprite("235,60,60");
}

function starCount() {
  const area = W * H;
  return Math.max(120, Math.min(600, Math.round(area / 4500)));
}

function makeStars() {
  const n = starCount();
  stars = new Array(n);
  for (let i = 0; i < n; i++) {
    // skew toward far, faint stars; a minority sit near and bright
    const depth = Math.pow(Math.random(), 1.6); // 0 far .. 1 near
    const bright = Math.random() < 0.15;
    const warm = Math.random() < 0.04;
    stars[i] = {
      x: Math.random() * W,
      y: Math.random() * H,
      z: depth,
      // draw half-size in CSS px (sprite is drawn at 2x this)
      size: bright ? 2.4 + depth * 3.6 : 1.3 + depth * 1.7,
      a: bright ? 0.82 + depth * 0.18 : 0.42 + depth * 0.46,
      tw: Math.random() * Math.PI * 2,
      ts: 0.5 + Math.random() * 1.4,
      bright: bright,
      warm: warm
    };
  }

  // A few prominent white stars planted in the vignette-safe centre band, so
  // the brightest points always peak near white regardless of the RNG.
  const anchors = Math.min(4, stars.length);
  for (let k = 0; k < anchors; k++) {
    const s = stars[k];
    s.x = W * (0.3 + 0.4 * Math.random());
    s.y = H * (0.28 + 0.44 * Math.random());
    s.z = 0.9;
    s.size = 4.2 + Math.random() * 2.2;
    s.a = 1;
    s.bright = true;
    s.warm = false;
  }
}

// A few big, very faint cool-tinted blobs — a whisper of nebula, not a fog.
function buildNebula() {
  nebula = [];
  const tints = [
    "34,44,66", // cool blue
    "26,34,52",
    "44,40,60" // faint violet
  ];
  const count = 3;
  for (let i = 0; i < count; i++) {
    const cx = (0.12 + 0.76 * ((i + 0.35) / count)) * W + (Math.random() - 0.5) * W * 0.2;
    const cy = (0.2 + 0.6 * Math.random()) * H;
    const r = Math.max(W, H) * (0.32 + Math.random() * 0.22);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tint = tints[i % tints.length];
    g.addColorStop(0, "rgba(" + tint + ",0.10)");
    g.addColorStop(0.5, "rgba(" + tint + ",0.045)");
    g.addColorStop(1, "rgba(" + tint + ",0)");
    nebula.push(g);
  }
}

function buildVignette() {
  const cx = W / 2;
  const cy = H / 2;
  const inner = Math.min(W, H) * 0.34;
  const outer = Math.max(W, H) * 0.80;
  const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.65, "rgba(0,0,0,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0.6)");
  vignette = g;

  // the "think" vignette: starts closer to the centre, ends darker
  const t = ctx.createRadialGradient(cx, cy, inner * 0.7, cx, cy, outer * 0.85);
  t.addColorStop(0, "rgba(0,0,0,0)");
  t.addColorStop(0.6, "rgba(0,0,0,0.22)");
  t.addColorStop(1, "rgba(0,0,0,0.55)");
  vignetteTight = t;
}

function buildScan() {
  // 3 CSS px period, 1 dark row. Under the DPR transform this is >= 2 device px
  // per line at DPR 2, so the banding actually shows in a screenshot.
  const t = document.createElement("canvas");
  t.width = 1;
  t.height = 3;
  const c = t.getContext("2d");
  c.fillStyle = "rgba(0,0,0,0.42)";
  c.fillRect(0, 0, 1, 1);
  scanPattern = ctx.createPattern(t, "repeat");
}

function buildNoise() {
  noiseTiles = [];
  const size = 200;
  for (let k = 0; k < 2; k++) {
    const t = document.createElement("canvas");
    t.width = size;
    t.height = size;
    const c = t.getContext("2d");
    const img = c.createImageData(size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 24; // faint but perceptible on mid grey
    }
    c.putImageData(img, 0, 0);
    noiseTiles.push(t);
  }
}

// ---- draw ----------------------------------------------------------------

function drawGalaxy(tSec, dt, animate) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, 0, W, H);

  // a faint cool lift off pure black — gives the scanlines and vignette
  // something to bite on; the vignette pulls the corners back down
  ctx.fillStyle = "rgba(22,26,40,0.6)";
  ctx.fillRect(0, 0, W, H);

  const m = moodCur;
  // breath: 0 at rest, 1 at the top of the inhale
  const peak = (breathCur - 1) / (BREATH_MAX - 1);

  // nebula wash — dimmed by the mood, lifted 10% at the breath peak
  ctx.globalAlpha = Math.min(1, m.neb * (1 + 0.1 * peak));
  for (let i = 0; i < nebula.length; i++) {
    ctx.fillStyle = nebula[i];
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalAlpha = 1;

  // The whole star field breathes: one scale about the centre. The stars'
  // own positions keep wrapping in unscaled space, so nothing accumulates.
  const scaled = Math.abs(breathCur - 1) > 0.0005;
  if (scaled) {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(breathCur, breathCur);
    ctx.translate(-W / 2, -H / 2);
  }
  const cx = W / 2;
  const cy = H / 2;

  const temp = m.temp;
  // the bright-star core follows the same 15% cathode mix as the sprite
  const coolCore =
    "rgb(" + Math.round(255 - 13 * temp) + "," + Math.round(255 - 10 * temp) + "," + Math.round(255 - 10 * temp) + ")";

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    if (animate && dt > 0 && m.speed > 0) {
      const v = m.speed * s.z * dt;
      const rx = s.x - cx;
      const ry = s.y - cy;
      const rl = Math.sqrt(rx * rx + ry * ry) || 1;
      // linear parallax drift + tangential turn + a slow outward creep
      s.x += DRIFT_X * v - ry * SPIRAL_W * v + (rx / rl) * SPIRAL_OUT * v;
      s.y += DRIFT_Y * v + rx * SPIRAL_W * v + (ry / rl) * SPIRAL_OUT * v;
      if (s.x < -4) s.x += W + 8;
      else if (s.x > W + 4) s.x -= W + 8;
      if (s.y < -4) s.y += H + 8;
      else if (s.y > H + 4) s.y -= H + 8;
    }

    let alpha = s.a * m.bright;
    if (animate) alpha *= 1 - m.twk + m.twk * Math.sin(s.tw + tSec * s.ts);
    if (alpha < 0) alpha = 0;
    else if (alpha > 1) alpha = 1;

    const d = s.size * 2;

    if (s.warm) {
      drawStar(spriteRed, s, d, alpha, 1);
    } else if (temp <= 0) {
      drawStar(spriteWhite, s, d, alpha, 1);
    } else if (temp >= 1) {
      drawStar(spriteCool, s, d, alpha, 1);
    } else {
      // mid-transition only: cross-fade the two sprites
      drawStar(spriteWhite, s, d, alpha, 1 - temp);
      drawStar(spriteCool, s, d, alpha, temp);
    }

    if (s.bright) {
      // a crisp white centre so the brightest stars actually peak near white,
      // even after the CRT overlay knocks the whole frame down a little
      ctx.globalAlpha = Math.min(1, alpha + 0.15);
      ctx.fillStyle = s.warm ? "rgb(255,150,150)" : coolCore;
      const cr = Math.max(1.6, s.size * 0.5);
      ctx.beginPath();
      ctx.arc(s.x, s.y, cr, 0, 6.283185);
      ctx.fill();
      // a guaranteed solid pixel block at the very core
      ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
  if (scaled) ctx.restore();
}

// halo (bright stars only) then the core, at `alpha * mix`
function drawStar(sprite, s, d, alpha, mix) {
  if (s.bright) {
    ctx.globalAlpha = alpha * 0.28 * mix;
    const gd = s.size * 5.2;
    ctx.drawImage(sprite, s.x - gd, s.y - gd, gd * 2, gd * 2);
  }
  ctx.globalAlpha = alpha * mix;
  ctx.drawImage(sprite, s.x - d, s.y - d, d * 2, d * 2);
}

function drawCRT(tSec, animate) {
  // chromatic-aberration fringe — a whisper of red at the left edge, cyan right
  const cw = Math.max(48, W * 0.1);
  ctx.globalCompositeOperation = "screen";
  let lg = ctx.createLinearGradient(0, 0, cw, 0);
  lg.addColorStop(0, "rgba(255,0,64,0.08)");
  lg.addColorStop(1, "rgba(255,0,64,0)");
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, cw, H);
  let rg = ctx.createLinearGradient(W - cw, 0, W, 0);
  rg.addColorStop(0, "rgba(0,255,255,0)");
  rg.addColorStop(1, "rgba(0,255,255,0.08)");
  ctx.fillStyle = rg;
  ctx.fillRect(W - cw, 0, cw, H);
  ctx.globalCompositeOperation = "source-over";

  // scanlines
  if (scanPattern) {
    ctx.fillStyle = scanPattern;
    ctx.fillRect(0, 0, W, H);
  }

  // vignette, plus the tighter one blended in for the "think" mood
  if (vignette) {
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }
  if (vignetteTight && moodCur.tight > 0) {
    ctx.globalAlpha = moodCur.tight;
    ctx.fillStyle = vignetteTight;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // faint noise
  if (noiseTiles.length) {
    const size = noiseTiles[0].width;
    const tile =
      noiseTiles[animate ? Math.floor(tSec * 10) % noiseTiles.length : 0];
    const off = animate ? (tSec * 34) % size : 0;
    ctx.globalAlpha = 0.6;
    for (let y = -size + off; y < H; y += size) {
      for (let x = -size + off; x < W; x += size) {
        ctx.drawImage(tile, x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  // low-frequency flicker + a slow roll band — animation only
  if (animate) {
    let flick = 0.028 + 0.022 * Math.sin(tSec * 0.7) + 0.014 * Math.sin(tSec * 3.1);
    if (flick < 0) flick = 0;
    ctx.fillStyle = "rgba(0,0,0," + flick.toFixed(3) + ")";
    ctx.fillRect(0, 0, W, H);

    const bandH = Math.max(80, H * 0.22);
    const by = ((tSec * 30) % (H + bandH)) - bandH;
    const bg = ctx.createLinearGradient(0, by, 0, by + bandH);
    bg.addColorStop(0, "rgba(255,255,255,0)");
    bg.addColorStop(0.5, "rgba(255,255,255,0.06)");
    bg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, by, W, bandH);
  }
}

function render(tSec, dt, animate) {
  if (!ctx) return;
  drawGalaxy(tSec, dt, animate);
  drawCRT(tSec, animate);
}

function renderStatic() {
  // no loop to lerp in: land every parameter, then paint one frame
  tickMood(Infinity);
  breathCur = 1;
  render(0, 0, false);
}

// ---- loop --------------------------------------------------------------------

function frame(now) {
  if (!running) return;
  const t = now / 1000;
  let dt = lastT ? t - lastT : 0.016;
  if (dt > 0.1) dt = 0.1; // tab was busy — clamp, do not let the watchdog misfire
  lastT = t;

  tickMood(now);
  tickBreath(dt);
  render(t, dt, true);

  const ms = dt * 1000;
  // Learn the display's cadence from the first 60 frames: a frame counts as
  // slow only past 24 ms and past 2.2 times the median, so a healthy 30 Hz
  // display is not latched to the static render.
  if (frameSamples.length < 60) {
    frameSamples.push(ms);
    if (frameSamples.length === 60) {
      const sorted = frameSamples.slice().sort(function (a, b) { return a - b; });
      slowLimit = Math.max(24, 2.2 * sorted[30]);
    }
  } else if (ms > slowLimit) {
    if (!slowSince) slowSince = now;
    else if (now - slowSince > 1000) {
      sessionDegraded = true;
      stop();
      renderStatic();
      return;
    }
  } else {
    slowSince = 0;
  }

  rafId = requestAnimationFrame(frame);
}

function start() {
  if (running || !ctx) return;
  running = true;
  lastT = 0;
  slowSince = 0;
  rafId = requestAnimationFrame(frame);
}

function stop() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

// Decide what the backdrop should be doing right now.
function apply() {
  if (!ctx) return;
  if (viewMode() === "light") {
    stop();
    return; // canvas is display:none via CSS
  }
  if (document.hidden) {
    stop();
    return;
  }
  // The tab may have loaded while hidden (innerWidth 0), leaving the canvas
  // unsized. Now that it is visible with real dimensions, size it once.
  if ((W === 0 || H === 0) && window.innerWidth > 0) {
    resize();
    return; // resize() calls apply() again at the end
  }
  if (motionReduced()) {
    stop();
    renderStatic();
    return;
  }
  start();
}

// ---- sizing --------------------------------------------------------------

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  readPalette();
  if (!spriteWhite) buildSprites();
  makeStars();
  buildNebula();
  buildVignette();
  buildScan();
  if (!noiseTiles.length) buildNoise();

  apply();
}

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
}

// ---- init --------------------------------------------------------------------

export function initBackdrop() {
  if (started || typeof document === "undefined") return;
  started = true;

  canvas = document.getElementById("backdrop");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "backdrop";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return; // no 2D context: the CSS --void floor stays, nothing else to do

  resize();

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", apply);

  const mo = new MutationObserver(apply);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-view", "data-motion"]
  });

  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", apply);
  else if (reduceMQ.addListener) reduceMQ.addListener(apply);

  // ?debug in the URL exposes the live state for manual checks; never in prod
  if (/(^|[?&])debug(=|&|$)/.test(window.location.search)) {
    window.__backdrop = {
      setMood: setMood,
      setBreath: setBreath,
      get mood() { return moodName; },
      get cur() { return Object.assign({}, moodCur); },
      get breath() { return { phase: breathPhase, t: breathT, scale: breathCur }; },
      get stars() { return stars.length; },
      get running() { return running; },
      get degraded() { return sessionDegraded; }
    };
  }
}
