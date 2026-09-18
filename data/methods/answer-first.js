export default {
	id: "answer-first",
	kind: "method",
	title: "Answer first",
	blurb: "Decide now, then find the one fact that could prove you wrong.",
	minutes: 8,
	tags: ["too-many"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"Barbara Minto, McKinsey, 1970s. Her pyramid principle: state the answer first, then the reasons under it, then the evidence under those. Readers understood it faster, and writers found out much sooner when they had no answer to give.",
				"It is for the case with too many options. You stop weighing and commit to one on paper, as a draft. Then you look for the single fact that would kill it. If the fact holds, you have your answer. If it does not, you have lost twenty minutes and learned which option is out."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Answer",
			prompt: "Write the answer you would give if forced to decide now. One sentence.",
			placeholder: "Apply to the Signal open call with the mirror piece and skip the rest",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "answer",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Reasons",
			prompt: "Three reasons that answer is right.",
			placeholder: "It is the only piece that is finished",
			mode: "list",
			minChars: 5,
			maxItems: 3,
			saveAs: "reasons",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "Kill fact",
			prompt: "What single fact would prove this answer wrong?",
			placeholder: "They did not accept projection work last year",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "kill",
			next: "t4"
		},
		t4: {
			id: "t4",
			type: "text",
			header: "Test",
			prompt: "How can you check that fact within a day?",
			placeholder: "Read last year’s selected list, twenty minutes",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "test",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Read it",
			body: [
				"The test is your next step. Run it before you build anything. If the kill fact turns out true, come back and write the second answer you would give. If it turns out false, the answer stands, and the three reasons are the outline of whatever you write next.",
				"Do not add a fourth reason. Three that hold are enough to move."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
