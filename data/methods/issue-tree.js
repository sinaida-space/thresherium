export default {
	id: "issue-tree",
	kind: "method",
	title: "Issue tree",
	blurb: "Split one big question into parts that do not overlap. Then pick a part.",
	minutes: 10,
	tags: ["unclear"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"McKinsey, where every engagement starts by breaking the client’s question into branches that do not overlap and leave nothing out. They call the test MECE: mutually exclusive, collectively exhaustive.",
				"It is for the case where the problem feels like one big fog. A fog cannot be worked on. Three to five branches can, and once they are on the page, one of them is usually where the weight is. You work that branch and leave the others alone with a clear conscience."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Question",
			prompt: "The question, starting with How or Why. One line.",
			placeholder: "How do I get the installation shown outside Prague?",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "question",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Branches",
			prompt: "Split the question into three to five parts. Each part covers something the others do not.",
			placeholder: "venues that already show this kind of work",
			mode: "list",
			minChars: 3,
			maxItems: 5,
			saveAs: "branches",
			next: "p1"
		},
		p1: {
			id: "p1",
			type: "pick",
			header: "Branch",
			prompt: "Which branch, if solved, moves the question most?",
			source: "branches",
			saveAs: "branch",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "Questions",
			prompt: "Three questions you would need answered to solve that branch.",
			placeholder: "Which of them took unsolicited proposals last year?",
			mode: "list",
			minChars: 5,
			maxItems: 3,
			saveAs: "subs",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Read it",
			body: [
				"Check the branches once more. Do two of them cover the same ground? Merge them. Is there a case the branches miss? Add it or say out loud why it does not matter. No overlap, nothing missing.",
				"The first sub-question of your chosen branch is the next thing to find out. Most of them can be answered with one message or one hour of looking. Put that in the plan."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
