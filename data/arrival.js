// Arrival: one energy rating, then eight cards. Each option is a situation
// scored on three axes; the router picks the route from the axis totals.

export default {
	id: "arrival",
	kind: "arrival",
	title: "Arrival",
	blurb: "One rating and eight cards. About three minutes.",
	minutes: 3,
	tags: [],
	entry: "r0",
	steps: {
		r0: {
			id: "r0",
			type: "rate",
			header: "Energy",
			prompt: "Before anything else. How much is in the tank right now?",
			low: "empty",
			high: "lit",
			saveAs: "energyBefore",
			next: "a1"
		},
		a1: {
			id: "a1",
			type: "choice",
			header: "Last hour",
			question: "What did the last hour look like?",
			note: "Pick the closest one. None of them is flattering.",
			multi: false,
			options: [
				{
					id: "a",
					label: "Tabs open, none of them read.",
					desc: "You switched between four things and finished none of them.",
					score: { drained: 1, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "One file, nothing typed.",
					desc: "The cursor blinked more than you did.",
					score: { drained: 1, flooded: 0, dry: 3 },
					flag: null
				},
				{
					id: "c",
					label: "Lying down with the phone.",
					desc: "Scrolling something you will not remember tomorrow.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "d",
					label: "Answering other people.",
					desc: "Messages, a call, someone’s question. None of it was yours.",
					score: { drained: 1, flooded: 2, dry: 0 },
					flag: null
				}
			],
			next: { _default: "a2" }
		},
		a2: {
			id: "a2",
			type: "choice",
			header: "Body",
			question: "What is the body doing right now?",
			note: "Check before you answer. Jaw, shoulders, eyes, stomach.",
			multi: false,
			options: [
				{
					id: "a",
					label: "Shoulders near the ears, jaw set.",
					desc: "You noticed only when you read this line.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "Eyes dry and hot.",
					desc: "Hours of screen, very little blinking.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "c",
					label: "Stomach tight.",
					desc: "As if you forgot something that has a deadline.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "d",
					label: "The body is fine.",
					desc: "The head is the problem.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				}
			],
			next: { _default: "a3" }
		},
		a3: {
			id: "a3",
			type: "choice",
			header: "Starting",
			question: "What happens when you try to start?",
			note: "",
			multi: false,
			options: [
				{
					id: "a",
					label: "You open the thing and open something else.",
					desc: "Within a minute. Every time.",
					score: { drained: 1, flooded: 2, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "You open it and cannot tell which part is first.",
					desc: "So you read it again, from the top.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				},
				{
					id: "c",
					label: "You do not open it.",
					desc: "You make tea instead and feel worse with the tea.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "d",
					label: "You start, and ten minutes in you lose the why.",
					desc: "The task is clear. The reason for it has gone quiet.",
					score: { drained: 1, flooded: 0, dry: 2 },
					flag: null
				}
			],
			next: { _default: "a4" }
		},
		a4: {
			id: "a4",
			type: "choice",
			header: "The list",
			question: "What does the list look like?",
			note: "",
			multi: false,
			options: [
				{
					id: "a",
					label: "There is no list.",
					desc: "It is all in your head, and some of it is leaking.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "Three lists in three places.",
					desc: "They disagree with each other.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "c",
					label: "One item, there for weeks.",
					desc: "You know exactly what it is. You have not touched it once.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				},
				{
					id: "d",
					label: "You wrote it, then closed it.",
					desc: "Reading it costs more than you have today.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				}
			],
			next: { _default: "a5" }
		},
		a5: {
			id: "a5",
			type: "choice",
			header: "Evening",
			question: "A free evening appears. What do you actually do with the hours?",
			note: "What you would do. Not what you would post about.",
			multi: false,
			options: [
				{
					id: "a",
					label: "Sleep.",
					desc: "Lights off by nine. No screen on the pillow.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "Clear the inbox so tomorrow starts clean.",
					desc: "You know it will not stay clean.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "c",
					label: "Finally think properly about the thing you circle.",
					desc: "With paper. Without the laptop.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				},
				{
					id: "d",
					label: "Walk without a phone and decide nothing.",
					desc: "An hour, maybe two. Same streets as always.",
					score: { drained: 2, flooded: 0, dry: 1 },
					flag: null
				}
			],
			next: { _default: "a6" }
		},
		a6: {
			id: "a6",
			type: "choice",
			header: "How are you",
			question: "Someone asks how you are. What comes out?",
			note: "",
			multi: false,
			options: [
				{
					id: "a",
					label: "“Fine, busy.”",
					desc: "The word busy does the talking so you do not have to say more.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "“Tired.”",
					desc: "And then you change the subject.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "c",
					label: "“Stuck on something.”",
					desc: "You cannot explain what, even to yourself.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				},
				{
					id: "d",
					label: "The real answer.",
					desc: "It is longer than they wanted, and you hear that.",
					score: { drained: 2, flooded: 1, dry: 0 },
					flag: null
				}
			],
			next: { _default: "a7" }
		},
		a7: {
			id: "a7",
			type: "choice",
			header: "Finished",
			question: "What did you last finish?",
			note: "Finish means closed. Sent, shipped, done, gone.",
			multi: false,
			options: [
				{
					id: "a",
					label: "Something small, hours ago.",
					desc: "It did not count, and you did not notice it passing.",
					score: { drained: 2, flooded: 1, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "You cannot remember.",
					desc: "Things get moved. Nothing gets closed.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "c",
					label: "Something for someone else.",
					desc: "Your own thing waited again.",
					score: { drained: 0, flooded: 2, dry: 1 },
					flag: null
				},
				{
					id: "d",
					label: "Nothing this week.",
					desc: "You have been thinking about it instead.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				}
			],
			next: { _default: "a8" }
		},
		a8: {
			id: "a8",
			type: "choice",
			header: "Avoiding",
			question: "What are you actually avoiding?",
			note: "The last one is there on purpose. Use it if it is true.",
			multi: false,
			options: [
				{
					id: "a",
					label: "Opening the thing with the most unread messages.",
					desc: "Every hour you wait, it grows.",
					score: { drained: 0, flooded: 3, dry: 0 },
					flag: null
				},
				{
					id: "b",
					label: "Choosing.",
					desc: "Any choice closes doors, and you want them all open.",
					score: { drained: 0, flooded: 0, dry: 3 },
					flag: null
				},
				{
					id: "c",
					label: "Being still.",
					desc: "If you stop, something catches up with you.",
					score: { drained: 3, flooded: 0, dry: 0 },
					flag: null
				},
				{
					id: "d",
					label: "I do not want to be here at all, and I mean more than this desk.",
					desc: "",
					score: { drained: 0, flooded: 0, dry: 0 },
					flag: "exit"
				}
			],
			next: { d: "_exit", _default: "_end" }
		}
	}
};
