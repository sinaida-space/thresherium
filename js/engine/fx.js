// Thresherium engine: thin pass-through to the backdrop and the audio
// modules, plus the engine's one live region.
// <!-- typocheck: off -->

import { audio } from "../audio.js";

export { setMood, setBreath } from "../backdrop.js";

export function cue(kind) {
  audio.cue(kind);
}

// One polite live region for step changes and pause state. #screen is itself
// aria-live, so this sits outside it to avoid a double announcement.
export function announce(text) {
  if (typeof document === "undefined") return;
  let node = document.getElementById("engine-status");
  if (!node) {
    node = document.createElement("p");
    node.id = "engine-status";
    node.className = "sr-only";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    document.body.appendChild(node);
  }
  node.replaceChildren(document.createTextNode(text || ""));
}
