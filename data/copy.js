// UI strings the engine imports. Prose only; no logic.

export const buttons = {
	continue: "Continue",
	back: "Back",
	skip: "Skip",
	pause: "Pause",
	resume: "Resume",
	begin: "Begin",
	again: "Start again",
	pdf: "Save as PDF"
};

export const pickers = {
	drained: {
		heading: "The body first",
		intro: "Thinking can wait a few minutes. Pick one and let the body go first.",
		groups: { breath: "Breath", move: "Move", ground: "Ground" }
	},
	flooded: {
		heading: "Too many open loops",
		intro: "Nothing is wrong with you. There is too much in the air. We put it down."
	},
	dry: {
		heading: "Pick a way in",
		intro: "The body is fine and the head is stuck. Say where it stops."
	}
};

export const menus = {
	afterPractice: {
		prompt: "What now?",
		another: "Another practice",
		think: "Now think",
		commit: "Enough, write the plan"
	}
};

export const plan = {
	title: "Your plan",
	routeNames: {
		drained: "The body first",
		flooded: "Too many open loops",
		dry: "A way in",
		exit: "Exit"
	},
	energy: {
		label: "Energy",
		before: "before",
		after: "after",
		same: "no change"
	},
	commitHeading: "The commitment",
	when: "When",
	then: "Then I will",
	first: "First step, under fifteen minutes",
	links: {
		heading: "If you want to go further",
		ethereal: {
			label: "Ethereal Path",
			desc: "A slower walk through the same ground.",
			href: "https://sinaida-space.github.io/ethereal-path/"
		},
		soulstice: {
			label: "Soulstice",
			desc: "For when the question is the work itself.",
			href: "https://sinaida-space.github.io/soulstice/"
		}
	},
	footer: "Nothing is stored anywhere except on this page. If you want to keep it, save the page."
};

export const exit = {
	title: "Thank you for saying it",
	body: [
		"This page is a small tool for a desk problem. What you named is larger than that, and it deserves a person. A page cannot hold that.",
		"Close the laptop. Call someone who knows your voice. If it is late and there is no one, your country has a line that answers at any hour, and finding its number takes less time than reading this.",
		"The desk will still be here. It can wait."
	],
	cta: "Close"
};
