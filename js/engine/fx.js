// Thresherium engine: adapter for the backdrop and the audio modules.
// <!-- typocheck: off -->
// Markup-building code: JS syntax quotes, class names and data-* literals
// trip the prose checks, so the masking runs to the end of the file.
// The backdrop on main exports only initBackdrop until task 3 lands
// setMood/setBreath, so the calls are guarded: a missing export is a no-op,
// never a link error.

import * as backdrop from "../backdrop.js";
import { audio } from "../audio.js";

export function setMood(m) {
  if (typeof backdrop.setMood === "function") backdrop.setMood(m);
}

export function setBreath(phase, t) {
  if (typeof backdrop.setBreath === "function") backdrop.setBreath(phase, t);
}

export function cue(kind) {
  if (audio && typeof audio.cue === "function") audio.cue(kind);
}

// One polite live region for step changes and timer phases. #screen is itself
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
