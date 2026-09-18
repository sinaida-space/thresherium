// Eight practices for the drained route. Each: why it works, a timer, done.
// A timer with a pattern shows the breath orb; without one it counts down
// and spaces the cues evenly across the seconds.

const sigh = {
	id: "practice-sigh",
	kind: "practice",
	title: "Physiological sigh",
	blurb: "Two inhales, one long exhale. Brings arousal down in about two minutes.",
	minutes: 2,
	tags: ["breath"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"When you sit tense and breathe shallow, small air sacs in the lungs fold shut and carbon dioxide builds up. Two inhales in a row, the second one on top of the first, pop those sacs open again. The long exhale that follows lets the extra carbon dioxide out and slows the heart through the vagus nerve.",
				"A slower heart is read by the brain as a safer situation, and the tension follows the heart down. In a 2023 Stanford study this pattern lowered arousal faster than the same minutes of sitting meditation. It works while you are still upset, which is the point."
			],
			cta: "Begin",
			next: "b1"
		},
		b1: {
			id: "b1",
			type: "timer",
			header: "Breathe",
			title: "Physiological sigh",
			instruction: "In through the nose, then a second short sip of air on top. Out slowly through the mouth, longer than both inhales together.",
			seconds: 120,
			pattern: { inhale: 2, hold1: 1, exhale: 6, hold2: 1 },
			cues: [
				"Inhale through the nose. At the top, sip once more.",
				"Let it out slowly through the mouth, as if fogging a window.",
				"Two in, one long out. Nothing to get right."
			],
			next: "_end"
		}
	}
};

const box = {
	id: "practice-box",
	kind: "practice",
	title: "Box breathing",
	blurb: "Four counts each way. Steadies the count in your head. Three minutes.",
	minutes: 3,
	tags: ["breath"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"Four seconds in, four held, four out, four held. The even count keeps the carbon dioxide in the blood steady, and the two holds slowly raise your tolerance for it, so the urge to gasp gets quieter over the minutes. A steady gas level is what a calm body runs on, and the count keeps it steady.",
				"Counting also takes the small part of attention that was looping on the problem and gives it a job. Divers and emergency crews use this one because it needs no equipment and works standing up in a corridor."
			],
			cta: "Begin",
			next: "b1"
		},
		b1: {
			id: "b1",
			type: "timer",
			header: "Breathe",
			title: "Box breathing",
			instruction: "In for four, hold for four, out for four, hold for four. Through the nose if you can.",
			seconds: 180,
			pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
			cues: [
				"Count with the orb, not ahead of it.",
				"If the hold feels long, shorten it. The shape matters more than numbers.",
				"Shoulders down. Let the belly do the moving."
			],
			next: "_end"
		}
	}
};

const longExhale = {
	id: "practice-478",
	kind: "practice",
	title: "Long exhale 4-7-8",
	blurb: "Short in, long hold, longer out. Slows the pulse. Sit down for this one.",
	minutes: 3,
	tags: ["breath"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"The exhale is the half of the breath that slows the heart. Making it twice as long as the inhale tips the balance toward the resting branch of the nervous system, the vagus nerve, for as long as you keep the ratio. The seven-second hold raises carbon dioxide a little, which the body reads as time to slow down.",
				"The first rounds can feel light in the head. That is the gas shift, and it passes. Sit, or lean on something. Four rounds are already enough to feel the difference."
			],
			cta: "Begin",
			next: "b1"
		},
		b1: {
			id: "b1",
			type: "timer",
			header: "Breathe",
			title: "Long exhale",
			instruction: "In through the nose for four. Hold for seven. Out through the mouth for eight, with a soft sound.",
			seconds: 180,
			pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
			cues: [
				"Tongue behind the top teeth. Out with a whoosh.",
				"If seven is too long, hold for four. Keep the exhale long.",
				"Let the last of the air leave before the next inhale."
			],
			next: "_end"
		}
	}
};

const shake = {
	id: "practice-shake",
	kind: "practice",
	title: "Shake-out",
	blurb: "One minute of shaking and twenty seconds of standing still. It loosens the load.",
	minutes: 2,
	tags: ["move"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"A stress response loads the muscles with tone for a run that never happens. The tone stays. Shaking the limbs for a minute discharges it through the muscle’s own release reflex, the same thing animals do after a chase, and the nervous system registers the drop within seconds once you stop.",
				"The twenty seconds of stillness at the end are the part that counts. Stand with the hands hanging and notice the hum. That hum is blood coming back to muscles that had been braced."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "timer",
			header: "Shake",
			title: "Shake-out",
			instruction: "Stand. Shake what the cue names, loosely, as if shaking off water.",
			seconds: 60,
			pattern: null,
			cues: [
				"Hands. Shake them out from the wrists.",
				"Arms. Let the elbows go with them.",
				"Shoulders. Bounce them, let the jaw hang.",
				"Whole body. Knees soft, everything loose."
			],
			next: "t2"
		},
		t2: {
			id: "t2",
			type: "timer",
			header: "Still",
			title: "Stillness",
			instruction: "Stop. Stand with the hands hanging. Notice the hum.",
			seconds: 20,
			pattern: null,
			cues: [
				"Do nothing. Let the blood come back."
			],
			next: "_end"
		}
	}
};

const neck = {
	id: "practice-neck",
	kind: "practice",
	title: "Neck, shoulders, spine",
	blurb: "Six slow stretches from the chin down to a forward fold. Two minutes.",
	minutes: 2,
	tags: ["move"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"The neck and the top of the shoulders hold the posture of watching for trouble: head forward, shoulders up. Hours of it and the muscles forget they are on. A slow stretch, held past the first pull, triggers the tendon reflex that tells the muscle to let go, and the head sits back on the spine where it belongs.",
				"Go slower than feels useful. The release happens in the second half of each hold, and it only happens if the muscle trusts you not to yank."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "timer",
			header: "Stretch",
			title: "Neck, shoulders, spine",
			instruction: "Sit or stand. Follow the cue. Breathe out into each stretch.",
			seconds: 120,
			pattern: null,
			cues: [
				"Chin to chest. Let the weight of the head do the work.",
				"Right ear toward the right shoulder. Left shoulder stays down.",
				"Left ear toward the left shoulder. Right shoulder stays down.",
				"Roll the shoulders back, slowly, four times.",
				"Twist the spine to one side, then the other. Eyes follow.",
				"Stand and fold forward. Knees bent, arms hanging."
			],
			next: "_end"
		}
	}
};

const march = {
	id: "practice-march",
	kind: "practice",
	title: "Cross-lateral marching",
	blurb: "Opposite hand to knee, slowly, then with eyes closed. Ninety seconds.",
	minutes: 2,
	tags: ["move"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"Touching the left hand to the right knee crosses the midline of the body, and that needs both halves of the brain to coordinate on every step. The rhythm is the rhythm of walking, which the brain reads as going somewhere, and it pulls attention out of the loop and down into the limbs.",
				"Closing the eyes at the end adds balance work. Balance takes real attention, and while it has it, the problem does not."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "timer",
			header: "March",
			title: "Cross-lateral marching",
			instruction: "Stand. Lift one knee, touch it with the opposite hand. Switch. Slow.",
			seconds: 90,
			pattern: null,
			cues: [
				"Right knee up, left hand to it. Then left knee, right hand.",
				"Slower than feels natural. Full stop at the top of each step.",
				"Keep going. Let the breath find the rhythm.",
				"Now close the eyes and keep the same pace."
			],
			next: "_end"
		}
	}
};

const senses = {
	id: "practice-senses",
	kind: "practice",
	title: "Five senses",
	blurb: "Five things you see, four you touch, down to one you taste. Three minutes long.",
	minutes: 3,
	tags: ["ground"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"Naming what the senses report moves the work from the part of the brain that narrates the problem to the parts that process sight, touch and sound. Those parts cannot worry. The shift of attention is the whole mechanism, and it is the same one nurses use for panic attacks on hospital wards.",
				"Say the things quietly, or in your head. Real things, in this room, right now. Not memories of things."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "timer",
			header: "Ground",
			title: "Five senses",
			instruction: "Look around. Name what the cue asks for, one item at a time.",
			seconds: 180,
			pattern: null,
			cues: [
				"Five things you can see. Small ones count.",
				"Four things you can touch. Touch them.",
				"Three things you can hear. Wait for the quiet ones.",
				"Two things you can smell. Move closer if you must.",
				"One thing you can taste. Water counts."
			],
			next: "_end"
		}
	}
};

const scan = {
	id: "practice-scan",
	kind: "practice",
	title: "Body scan",
	blurb: "Attention travels from the feet to the eyes. Three minutes, sitting or lying down.",
	minutes: 3,
	tags: ["ground"],
	entry: "i1",
	steps: {
		i1: {
			id: "i1",
			type: "info",
			header: "Why",
			body: [
				"Most of the tension you carry is held below the level where you would notice. Putting attention on one body part at a time brings it up to that level, and a muscle that is noticed usually lets go a little on its own. The scan is a slow tour of the places that brace first.",
				"Do not try to relax anything. Just find each part and feel what it is doing. The letting go is a side effect, and it comes on its own timing."
			],
			cta: "Begin",
			next: "t1"
		},
		t1: {
			id: "t1",
			type: "timer",
			header: "Scan",
			title: "Body scan",
			instruction: "Sit or lie down. Put your attention where the cue points and leave it there a while.",
			seconds: 180,
			pattern: null,
			cues: [
				"Feet. The weight on the soles, the toes.",
				"Calves. Are they holding anything?",
				"Hips. Let them sink into the seat.",
				"Belly. Let it be soft and round.",
				"Chest. Notice the breath moving it.",
				"Hands. Open them. Let the fingers curl.",
				"Jaw and eyes. Unclench the teeth. Let the eyes rest in their sockets."
			],
			next: "_end"
		}
	}
};

export default [
	sigh, box, longExhale,
	shake, neck, march,
	senses, scan
];
