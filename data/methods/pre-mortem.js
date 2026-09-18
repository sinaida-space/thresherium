export default {
	id: "pre-mortem",
	kind: "method",
	title: "Pre-mortem",
	blurb: "Assume the plan already failed. Write down why. Guard against the likeliest cause.",
	minutes: 8,
	tags: ["too-many"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"Gary Klein, a psychologist who studied firefighters and pilots, noticed that people find far more flaws in a plan when told it has already failed than when asked whether it might. Imagining the failure as a fact frees you to be honest about the plan.",
				"It is for the case where you have a plan you are not sure of, or several and cannot choose. You take the one you lean toward, declare it dead, and list the causes of death. The list is usually short and one cause is usually obvious. That cause gets a guard, and the plan is better than any of the others by the time you are done."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Plan",
			prompt: "The plan you lean toward. One or two lines.",
			placeholder: "Build the sound layer myself in TouchDesigner over the next month",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "plan",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Six months",
			body: [
				"It is six months on and it failed completely. Nothing shipped, or it shipped and nobody came, or it worked and cost more than it gave.",
				"You are looking back and you know why. Write the reasons as things that already happened."
			],
			cta: "Continue",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Causes",
			prompt: "What killed it? Up to six causes, each as a plain past-tense fact.",
			placeholder: "I spent the month on the tool and never made the piece",
			mode: "list",
			minChars: 5,
			maxItems: 6,
			saveAs: "causes",
			next: "p1"
		},
		p1: {
			id: "p1",
			type: "pick",
			header: "Likeliest",
			prompt: "Which of these is most likely to actually happen?",
			source: "causes",
			saveAs: "cause",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "Guard",
			prompt: "One thing you do this week so that cause does not happen.",
			placeholder: "Book two hours on Thursday for the piece, tool closed",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "guard",
			next: "i3"
		},
		i3: {
			id: "i3",
			type: "info",
			header: "Read it",
			body: [
				"The guard is the next step, and it goes into the plan as written. The other causes stay on the list for the day you review the plan again, which should be in a month.",
				"If the likeliest cause has no guard you can build, that is the answer too: the plan is wrong, and you found out for free."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
