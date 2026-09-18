// Thresherium: sound cues. STUB from task 2; task 3 replaces this file.
// Contract: audio.enabled, audio.toggle() -> Promise<boolean>, audio.cue(kind)
// with kind "in" | "out" | "done". The stub only flips the flag.

export const audio = {
  enabled: false,
  toggle: function () {
    this.enabled = !this.enabled;
    return Promise.resolve(this.enabled);
  },
  cue: function () {}
};
