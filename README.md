# Thresherium

A thresher separates grain from chaff. This one works on a tired head. A
short, self-guided tool: a few honest questions place you on three scales,
drained, flooded or dry, and hand you the matching next step, with no build
step, no framework and no external requests.

**Live:** <https://sinaida-space.github.io/thresherium/>

## Run it locally

From the repository root:

```
python3 -m http.server 4174
```

Then open `http://localhost:4174/`. Serving over `file://` will not work,
because ES module imports need an HTTP origin.

## Layout

```
index.html          shell, red-rule frame, #screen mount node, <noscript>
404.html            GitHub Pages 404, hands off to js/nav-404.js
css/tokens.css       custom properties, @font-face, palette and type scale
css/app.css          frame, panels, buttons, shared display bits
css/chrome.css       header, footer, cookie notice, welcome, standalone pages
css/backdrop.css     places the fixed galaxy + CRT canvas
css/print.css        @media print: hides chrome and the backdrop
fonts/               Geist Pixel + Libre Franklin (Light/Regular/SemiBold)
js/app.js            hash router, consent gate, placeholder Arrival screen
js/cookie.js         cookie notice + the one stored storage choice
js/welcome.js        welcome screen + consent record
js/pages.js          privacy, about and 404 views
js/chrome.js         persistent header + footer
js/backdrop.js       galaxy + CRT canvas renderer
js/dom.js            small internal DOM builder (not a contract)
js/screen.js         shared screen mount (focus + scroll)
js/nav-404.js        redirects GitHub Pages' 404.html into the app
```

Nothing beyond the welcome screen exists yet. After consent, `#/` shows a
placeholder Arrival screen, which a later milestone fills in.

## Storage

Thresherium sets no cookies and runs no analytics. If you allow the storage
notice, your browser keeps one line recording that choice, and if you also
complete the welcome screen, a second line records that you did. Reject it
and nothing is written: the tool still works, and consent then lives only
for that page load. See `#/privacy` for the full policy.

## Licence

Code: Apache License 2.0 (see `LICENSE`). Text and prose content: CC
BY-NC-ND 4.0.
