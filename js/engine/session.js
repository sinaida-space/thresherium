// Thresherium engine: session state (in memory only).
// <!-- typocheck: off -->
// Markup-building code: JS syntax quotes, class names and data-* literals
// trip the prose checks, so the masking runs to the end of the file.
// storage. The shape is the shared contract from the task issues.

export const session = {
  scores: { drained: 0, flooded: 0, dry: 0 },
  energyBefore: null,
  energyNow: null,
  energyAfter: null,
  route: null,
  flowId: null,
  stepId: null,
  answers: {},
  log: []
};

export function reset() {
  session.scores = { drained: 0, flooded: 0, dry: 0 };
  session.energyBefore = null;
  session.energyNow = null;
  session.energyAfter = null;
  session.route = null;
  session.flowId = null;
  session.stepId = null;
  session.answers = {};
  session.log = [];
}
