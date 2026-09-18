// Thresherium — generated ambient sound and breath cues.
//
// Everything is synthesized with WebAudio; the CSP has no media-src for blobs
// and there are no audio files. Off by default. The AudioContext is created
// and resumed only inside toggle(), which the header button calls from its
// click handler, so autoplay policy is satisfied by construction.
//
// Signal chain
//   drone: sine 55 Hz + triangle 110.5 Hz -> lowpass 400 Hz -> droneGain
//          (0.08 Hz LFO on droneGain) -> master
//   cues:  one short sine per cue -> cueGain envelope -> master
//   master gain 0.08 (≈ -22 dBFS), 2 s fade in / out. Nothing under it can
//   exceed unity, so the output never passes -20 dBFS.

const MASTER = 0.08;
const FADE_S = 2;
const CUE_S = 0.18;

let ac = null;
let master = null;
let drone = null; // { oscA, oscB, lfo, gain }
let offTimer = 0;

function ctxClass() {
  return window.AudioContext || window.webkitAudioContext || null;
}

function ensureContext() {
  if (ac) return ac;
  const AC = ctxClass();
  if (!AC) return null;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  return ac;
}

function startDrone() {
  if (drone || !ac) return;
  const t = ac.currentTime;

  const gain = ac.createGain();
  gain.gain.value = 0.7;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 400;
  lp.Q.value = 0.7;
  lp.connect(gain);
  gain.connect(master);

  const oscA = ac.createOscillator();
  oscA.type = "sine";
  oscA.frequency.value = 55;
  oscA.connect(lp);

  const oscB = ac.createOscillator();
  oscB.type = "triangle";
  oscB.frequency.value = 110.5; // a hair off the octave: slow beating
  const bGain = ac.createGain();
  bGain.gain.value = 0.5; // the triangle carries more harmonics; keep it under
  oscB.connect(bGain);
  bGain.connect(lp);

  // very slow swell on the drone gain: 0.7 ± 0.3 at 0.08 Hz (12.5 s period)
  const lfo = ac.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08;
  const lfoDepth = ac.createGain();
  lfoDepth.gain.value = 0.3;
  lfo.connect(lfoDepth);
  lfoDepth.connect(gain.gain);

  oscA.start(t);
  oscB.start(t);
  lfo.start(t);

  drone = { oscA: oscA, oscB: oscB, lfo: lfo, gain: gain };
}

function stopDrone() {
  if (!drone) return;
  const d = drone;
  drone = null;
  try {
    d.oscA.stop();
    d.oscB.stop();
    d.lfo.stop();
    d.gain.disconnect();
  } catch (e) {
    /* already stopped */
  }
}

// A short sine blip: `from` Hz gliding to `to` Hz over CUE_S, with a soft
// attack and release so it never clicks.
function blip(at, from, to, peak) {
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + CUE_S);

  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.03);
  g.gain.setValueAtTime(peak, at + CUE_S - 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, at + CUE_S);

  osc.connect(g);
  g.connect(master);
  osc.start(at);
  osc.stop(at + CUE_S + 0.02);
}

export const audio = {
  enabled: false,

  // Call only from a user gesture. Returns the new enabled state.
  async toggle() {
    if (!ensureContext()) return false;
    clearTimeout(offTimer);
    offTimer = 0;

    if (this.enabled) {
      // fade out, then stop the oscillators and park the context
      this.enabled = false;
      const t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + FADE_S);
      offTimer = setTimeout(function () {
        offTimer = 0;
        stopDrone();
        if (ac && ac.state === "running") ac.suspend().catch(function () {});
      }, FADE_S * 1000 + 50);
      return false;
    }

    try {
      if (ac.state !== "running") await ac.resume();
    } catch (e) {
      return false;
    }
    if (ac.state !== "running") return false;

    startDrone();
    const t = ac.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(MASTER, t + FADE_S);
    this.enabled = true;
    return true;
  },

  // "in": 220 Hz rising · "out": 165 Hz falling · "done": two notes 220 -> 330
  cue(kind) {
    if (!this.enabled || !ac || ac.state !== "running") return;
    const t = ac.currentTime + 0.01;
    if (kind === "in") blip(t, 220, 262, 0.6);
    else if (kind === "out") blip(t, 165, 139, 0.6);
    else if (kind === "done") {
      blip(t, 220, 220, 0.6);
      blip(t + CUE_S + 0.06, 330, 330, 0.6);
    }
  }
};
