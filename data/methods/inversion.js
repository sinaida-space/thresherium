export default {
	id: "inversion",
	kind: "method",
	title: "Inversion",
	blurb: "List what would guarantee failure. Then stop doing the one you are already doing.",
	minutes: 7,
	tags: ["no-options"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"Charlie Munger, borrowing from the mathematician Jacobi: invert, always invert. When you cannot see how to reach a goal, ask instead what would make it impossible, and then stop doing that.",
				"It is for the case where you know the goal and have no moves. Failure is easier to describe than success, and the list of ways to fail is nearly always longer and more honest. Somewhere on it is a thing you are doing right now. Removing it is a move, and often the only one you needed."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Goal",
			prompt: "The goal. One line.",
			placeholder: "Have the projection running in a real venue by spring",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "goal",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Ruin",
			prompt: "List everything that would guarantee failure. Up to eight.",
			placeholder: "never send the proposal because it is not finished",
			mode: "list",
			minChars: 5,
			maxItems: 8,
			saveAs: "ruin",
			next: "p1"
		},
		p1: {
			id: "p1",
			type: "pick",
			header: "Worst",
			prompt: "Which one of these would do the most damage?",
			source: "ruin",
			saveAs: "worst",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "Stop",
			prompt: "Which of these are you doing right now, and what stops that?",
			placeholder: "I am polishing. A deadline stops that: send on Friday, as it stands",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "stop",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Read it",
			body: [
				"What you wrote under “stop” is the plan. The second half of that sentence, the thing that stops it, is the first step. Do that before you look for any new move.",
				"Keep the ruin list. When you feel stuck again, read it and check which item you have drifted back toward."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
