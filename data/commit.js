// Commit: when, then, the first step, energy after. Ends at the plan.
// energyNow is the rate step the router shows after each practice ends.

export const energyNow = {
	id: "energy-now",
	type: "rate",
	header: "Energy",
	prompt: "And now. How much is in the tank?",
	low: "empty",
	high: "lit",
	saveAs: "energyNow",
	next: "_end"
};

export default {
	id: "commit",
	kind: "commit",
	title: "Commit",
	blurb: "When, then what, and the first fifteen minutes. Two minutes to write.",
	minutes: 2,
	tags: [],
	entry: "t1",
	steps: {
		t1: {
			id: "t1",
			type: "text",
			header: "When",
			prompt: "When exactly, today or tomorrow?",
			placeholder: "Tomorrow at 9, after coffee",
			mode: "single",
			minChars: 3,
			maxItems: 1,
			saveAs: "when",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Then",
			prompt: "Then I will…",
			placeholder: "open the file and write the first ugly paragraph",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "then",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "First step",
			prompt: "The first step, under fifteen minutes.",
			placeholder: "find the last version and read only the first page",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "first",
			next: "r1"
		},
		r1: {
			id: "r1",
			type: "rate",
			header: "Energy",
			prompt: "And now, energy?",
			low: "empty",
			high: "lit",
			saveAs: "energyAfter",
			next: "_end"
		}
	}
};
