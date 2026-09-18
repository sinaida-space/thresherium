export default {
	id: "five-whys",
	kind: "method",
	title: "Five whys",
	blurb: "Ask why five times in a row. Act on the fifth answer.",
	minutes: 8,
	tags: ["unclear"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Origin",
			body: [
				"Toyota, 1950s. Taiichi Ohno taught line workers to ask why five times before touching a broken machine, so that they fixed the cause instead of the symptom every time.",
				"It is for the case where something keeps going wrong and you keep treating the surface. Each why goes one layer down. The first two answers are usually the ones you already knew. The value is in the last two, which tend to be about a system, a habit or a missing thing, and rarely about a person. If an answer names one, ask what made that the easiest thing for them to do at the time."
			],
			cta: "Begin",
			next: "t0"
		},
		t0: {
			id: "t0",
			type: "text",
			header: "Problem",
			prompt: "What keeps going wrong? One sentence, as plainly as you can.",
			placeholder: "The proposal has been half-written for three weeks",
			mode: "single",
			minChars: 8,
			maxItems: 1,
			saveAs: "problem",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "text",
			header: "Why 1",
			prompt: "Look at what you wrote under “problem”. Why is that true?",
			placeholder: "Because every time I open it I rewrite the opening",
			note: "Answer with a cause. Do not name a person.",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "why1",
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "text",
			header: "Why 2",
			prompt: "Take your answer to “why 1”. Why is that true?",
			placeholder: "Because I do not know who is reading it",
			note: "Answer with a cause. Do not name a person.",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "why2",
			next: "t3"
		},
		t3: {
			id: "t3",
			type: "text",
			header: "Why 3",
			prompt: "Take your answer to “why 2”. Why is that true?",
			placeholder: "Because I never asked",
			note: "Answer with a cause. Do not name a person.",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "why3",
			next: "t4"
		},
		t4: {
			id: "t4",
			type: "text",
			header: "Why 4",
			prompt: "Take your answer to “why 3”. Why is that true?",
			placeholder: "Because asking felt like admitting I was not ready",
			note: "Answer with a cause. Do not name a person.",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "why4",
			next: "t5"
		},
		t5: {
			id: "t5",
			type: "text",
			header: "Why 5",
			prompt: "Take your answer to “why 4”. Why is that true?",
			placeholder: "Because there is no step in my week for asking",
			note: "Answer with a cause. Do not name a person.",
			mode: "single",
			minChars: 5,
			maxItems: 1,
			saveAs: "why5",
			next: "i2"
		},
		i2: {
			id: "i2",
			type: "info",
			header: "Read it",
			body: [
				"The fifth answer is the thing to act on. If it is a missing step, add the step. If it is a habit, name when it fires. If it still names a person, you stopped one why too early. Go back and ask what made their choice the easy one.",
				"Take the fifth answer into the plan as the thing you change this week."
			],
			cta: "Continue",
			next: "_end"
		}
	}
};
