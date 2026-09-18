// Triage for the flooded route: empty the head, sort, pick one, name two
// you will not do, then a timebox.

export default {
	id: "triage",
	kind: "triage",
	title: "Triage",
	blurb: "Everything out of the head, sorted, one thing picked. About ten minutes.",
	minutes: 10,
	tags: [],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"Flooded means too many open loops. It says nothing about your ability. The head keeps every unfinished thing partly running, and each one takes a slice of the same attention you need to finish any of them.",
				"So the first move is to get them out of the head and onto a list where they stop running. Then sort, then pick one. The rest can wait, and most of it will still be there, unharmed."
			],
			cta: "Continue",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Dump",
			prompt: "Everything in your head. One per line. Small things too.",
			placeholder: "reply to the gallery about dates",
			mode: "list",
			minChars: 3,
			maxItems: 12,
			saveAs: "dump",
			next: "m1"
		},
		m1: {
			id: "m1",
			type: "matrix",
			header: "Sort",
			prompt: "Place each one. How much does it change, and how much does it cost you?",
			source: "dump",
			axes: ["impact", "effort"],
			saveAs: "triage",
			next: "p1"
		},
		p1: {
			id: "p1",
			type: "pick",
			header: "One",
			prompt: "Which one, if done, makes the rest easier or unnecessary?",
			source: "dump",
			saveAs: "chosen",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Not doing",
			prompt: "Name two things from the list you will not do this week.",
			placeholder: "the newsletter draft, the second grant",
			mode: "single",
			minChars: 3,
			maxItems: 1,
			saveAs: "notdo",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Timebox",
			body: [
				"The next 90 minutes go to the one you picked. Phone in another room.",
				"When the 90 minutes end, stop, even if it is unfinished. You will know more about it than you do now."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
