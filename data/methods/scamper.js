export default {
	id: "scamper",
	kind: "method",
	title: "Scamper",
	blurb: "Seven forced changes to a stuck idea. Two are usually worth keeping.",
	minutes: 12,
	tags: ["no-options"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"Bob Eberle, 1971, a teacher who turned an older checklist by the advertising man Alex Osborn into seven verbs a child could use: substitute, combine, adapt, modify, put to another use, eliminate, and finally reverse.",
				"It is for the case where the idea exists and has stopped moving. You do not wait for a better one. You force seven changes on the one you have, most of which will be bad, and keep the two that are not. The point of the bad ones is that they loosen your grip on the original."
			],
			cta: "Begin",
			next: "t0"
		},
		t0: {
			id: "t0",
			type: "text",
			header: "The thing",
			prompt: "The idea or piece that is stuck. One line.",
			placeholder: "A projection on the winery wall that reacts to the wine being poured",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "thing",
			next: "s1"
		},
		s1: {
			id: "s1",
			type: "text",
			header: "Substitute",
			prompt: "Swap one part for something else. The surface, the material, the trigger, the audience.",
			note: "Example: the wall becomes the tablecloth.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "substitute",
			next: "s2"
		},
		s2: {
			id: "s2",
			type: "text",
			header: "Combine",
			prompt: "Join it with something it has never touched. Another piece, another sense, another event.",
			note: "Example: the projection plus the sommelier’s live voice.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "combine",
			next: "s3"
		},
		s3: {
			id: "s3",
			type: "text",
			header: "Adapt",
			prompt: "What already exists elsewhere that solves part of this? Borrow that.",
			note: "Example: a weather map’s way of showing slow change.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "adapt",
			next: "s4"
		},
		s4: {
			id: "s4",
			type: "text",
			header: "Modify",
			prompt: "Make one part much bigger or much smaller. Duration, scale, speed, cost.",
			note: "Example: it runs for one evening only, then never again.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "modify",
			next: "s5"
		},
		s5: {
			id: "s5",
			type: "text",
			header: "Other use",
			prompt: "Who else could use this as it is, for something you did not intend?",
			note: "Example: a hospital waiting room instead of a winery.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "putToUse",
			next: "s6"
		},
		s6: {
			id: "s6",
			type: "text",
			header: "Eliminate",
			prompt: "Remove the part you think is essential. Does what is left still work?",
			note: "Example: no sensors. It reacts to nothing and people believe it does.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "eliminate",
			next: "s7"
		},
		s7: {
			id: "s7",
			type: "text",
			header: "Reverse",
			prompt: "Flip the order, the roles or the direction. What happens if you run it in reverse?",
			note: "Example: the guests make the image and the wall watches them.",
			placeholder: "",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "reverse",
			next: "t8"
		},
		t8: {
			id: "t8",
			type: "text",
			header: "Keep",
			prompt: "Copy the two answers above you want to keep.",
			placeholder: "",
			mode: "list",
			minChars: 5,
			maxItems: 2,
			saveAs: "keep",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Read it",
			body: [
				"The two you kept are the new version of the thing. Pick the one that you can try in the smallest form, on a table, in an afternoon, and take that trial into the plan.",
				"The five you dropped are not wasted. They are the reasons the original was stuck, written out."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
