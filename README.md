# Thresherium

A thresher separates grain from chaff. This one works on a tired head.
A short, self-guided tool for a desk that has stopped: a few plain
questions place you on three scales, drained, flooded or dry, and hand
you the matching next step. Ten minutes, one printable plan, and nothing
leaves the page.

**Live:** <https://sinaida-space.github.io/thresherium/>

## Run it locally

From the repository root:

```
python3 -m http.server 4174
```

Then open `http://localhost:4174/`. Serving over `file://` will not work,
because ES module imports need an HTTP origin. There is no build step,
no framework and no dependency to install.

## How it works

1. **Welcome.** A short description, the storage notice and one consent
   checkbox. Reject the notice and the tool still runs; it only forgets
   you next time.
2. **Arrival.** One energy rating and eight multiple-choice questions.
   Every option adds points to one or more of the three scales. One
   option in the set is an exit flag: pick it and the tool stops with
   a page that points you to a person instead.
3. **Route.** The highest scale wins (ties fall drained, flooded, dry).
4. **Commit.** When, then what, the first step under fifteen minutes,
   and one more energy rating.
5. **Plan.** A single document on screen: date, route, energy before
   and after, everything you typed grouped by exercise, and the commitment.
   “Save as PDF” prints it; “Start again” clears the session.

The session lives in memory only. A reload starts over.

## The three routes

**Drained** (the body first). A picker with eight short practices in three
groups. Each ends with an energy rating and a small menu: another practice,
go and think, or write the plan.

- Breath: Physiological sigh, Box breathing, Long exhale 4-7-8
- Move: Shake-out, Neck, shoulders, spine, Cross-lateral marching
- Ground: Five senses, Body scan

**Flooded** (too many open loops). One triage: dump everything in your head
one line at a time, place each item on impact and effort, pick the one that
makes the rest easier, name two things you will not do this week.

**Dry** (the body is fine, the head is stuck). Say where it stops, get one
or two matching methods, work through one, then commit.

## The seven methods and where they come from

| Method | Origin | Offered when |
| --- | --- | --- |
| Five whys | Taiichi Ohno, Toyota, 1950s | you cannot name the problem |
| Issue tree | McKinsey, the MECE test | you cannot name the problem |
| Scamper | Bob Eberle, 1971, after Alex Osborn | you know the problem and see no options |
| Inversion | Charlie Munger, after Jacobi | you know the problem and see no options |
| Answer first | Barbara Minto, McKinsey, 1970s | you have too many options |
| Pre-mortem | Gary Klein | you have too many options |
| Working backwards | Amazon, the press release first | you know what to do and cannot start |

Each method is a short guided sequence of text steps, with its origin told
in one paragraph before the work begins.

## Layout

```
index.html 404.html      shell, red-rule frame, #screen mount node, <noscript>
css/                     tokens, app, chrome (header, footer, pages), backdrop, print
fonts/                   Geist Pixel + Libre Franklin (Light, Regular, SemiBold)
js/app.js                hash router and consent gate
js/welcome.js pages.js   welcome, privacy, about, 404
js/cookie.js chrome.js   storage notice, header with the sound toggle, footer
js/backdrop.js           galaxy + CRT canvas: moods and the breath scale
js/breath.js audio.js    breath orb, countdown ring, generated ambient and cues
js/engine/               session, runner, step renderers, router, plan
data/                    every flow: arrival, practices, triage, methods, commit, copy
tools/validate.mjs       flow validator (node tools/validate.mjs)
tools/smoke.mjs          headless route test (node tools/smoke.mjs)
```

Routes: `#/` arrival, `#/menu/drained`, `#/menu/dry`, `#/menu/after`,
`#/flow/:id`, `#/energy`, `#/commit`, `#/plan`, `#/exit`, and the open
pages `#/welcome`, `#/about`, `#/privacy`.

## No data leaves the page

Thresherium makes no network request after the page has loaded, sets
no cookies and runs no analytics. What you type stays in memory and is gone
on reload. If you allow the storage notice, your browser keeps one line
recording that choice, and, once you complete the welcome screen, a second
line recording that you did. Reject it and nothing is written; the notice
simply shows again next time. The sound is synthesised in the browser;
there are no audio files. See `#/privacy` for the full policy.

## Licence

Code: Apache License 2.0, see `LICENSE`. Text and prose content, every
flow under `data/` included: CC BY-NC-ND 4.0. Fonts: Geist Pixel (Vercel)
and Libre Franklin (Impallari Type), both under the SIL Open Font
License 1.1, see `fonts/OFL-LibreFranklin.txt` for the licence text.
