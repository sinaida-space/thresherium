// Picker for the dry route. Option ids double as method tags, and the map
// takes each option id to the method flows the router then offers.

// <!-- typocheck: off -->
import fiveWhys from "./five-whys.js";
import issueTree from "./issue-tree.js";
import answerFirst from "./answer-first.js";
import preMortem from "./pre-mortem.js";
import inversion from "./inversion.js";
import scamper from "./scamper.js";
import workingBackwards from "./working-backwards.js";
// <!-- typocheck: on -->

export const methodIndex = {
	id: "method-index",
	type: "choice",
	header: "Way in",
	question: "Where does it stop?",
	note: "Pick the sentence you would actually say.",
	multi: false,
	options: [
		{
			id: "unclear",
			label: "I cannot say what the problem is.",
			desc: "Something is wrong and it will not hold still long enough to name.",
			score: { drained: 0, flooded: 0, dry: 0 },
			flag: null
		},
		{
			id: "no-options",
			label: "I know the problem. I have no options.",
			desc: "The goal is clear and every road to it looks closed.",
			score: { drained: 0, flooded: 0, dry: 0 },
			flag: null
		},
		{
			id: "too-many",
			label: "I have too many options.",
			desc: "Each one is fine, and choosing one means losing the others.",
			score: { drained: 0, flooded: 0, dry: 0 },
			flag: null
		},
		{
			id: "afraid",
			label: "I know what to do and cannot start.",
			desc: "The task is clear. The first step is where it stalls.",
			score: { drained: 0, flooded: 0, dry: 0 },
			flag: null
		}
	],
	next: { _default: "_end" },
	map: {
		unclear: ["five-whys", "issue-tree"],
		"no-options": ["scamper", "inversion"],
		"too-many": ["answer-first", "pre-mortem"],
		afraid: ["working-backwards"]
	}
};

export default [fiveWhys, issueTree, answerFirst, preMortem, inversion, scamper, workingBackwards];
