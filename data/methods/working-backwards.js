export default {
	id: "working-backwards",
	kind: "method",
	title: "Working backwards",
	blurb: "Write the announcement of the finished thing. Then find the smallest true step.",
	minutes: 8,
	tags: ["afraid"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"Amazon. Before a team builds anything, it writes the press release for the finished product, with a headline, a customer quote and the problem it solved. If the release is dull, the product is not built.",
				"It is for the case where you know what to do and cannot start. The block is usually that the finished thing is vague, so every first step looks equally wrong. Writing the ending in one line makes the ending concrete, and a concrete ending has an obvious first inch."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Headline",
			prompt: "Write the one-line headline of the announcement when it is done.",
			placeholder: "Prague winery opens its cellar to a light piece that answers the glass",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "headline",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Customer",
			prompt: "Who is quoted saying it helped, and what do they say?",
			placeholder: "The owner: “People stayed an hour longer and asked about the wine.”",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "customer",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "Problem",
			prompt: "What problem did it solve, in the customer’s words?",
			placeholder: "Tastings felt like a lecture and people left after the third glass",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "problem",
			next: "t4"
		},
		t4: {
			id: "t4",
			type: "text",
			header: "First inch",
			prompt: "The smallest visible thing that would make the headline slightly true.",
			placeholder: "One shader on one wall in my flat, filmed on the phone",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "first",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Read it",
			body: [
				"The first inch is the plan. It is small on purpose. If it takes more than an afternoon, cut it in half and take the first half.",
				"Read the headline again before you start. If it bores you, that is information too, and cheaper now than after a month of building."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
