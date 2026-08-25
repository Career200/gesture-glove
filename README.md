# Gesture Glove

*A design exploration on a small, silent, eyes-free input interface worn on the hand.*

---

A thin glove. The thumb is the controller. Each of the other four fingers carries three contact zones, sitting on the knuckle creases — twelve zones, all findable by feel. Touching a zone is a signal; sliding across several in one continuous touch is a compound one.

The bet is that a very small physical vocabulary, made contextual and layered, can carry a large command set — without a screen, without a sound, and without a large gesture anyone else can see.

## Why

Every existing input method demands something: attention (touchscreens), space (mid-air gesture), a surface (keyboards), or social permission (voice). This one demands none of them, and pays for it with zero discoverability.

So the question isn't what it replaces — it's where everything else already fails. Hands occupied, phone in a pocket, cold, dark, in a meeting, on a bike, cooking. And further out, head-mounted displays, where nobody has a good answer yet.

## Status

Design and simulation. No hardware. **One round of measurement done** — the layout is now eight thumb zones and a palm pad rather than twelve zones, and the swipe grammar is direction-based.

What the first trials found ([`docs/03-findings-01.md`](docs/03-findings-01.md)): reach cost is not driven by distance from the thumb but by whether a zone has a hard tactile edge, so the *middle* segment of each finger is the unreliable one and the fingertip zones are the best on the hand. Sweeps never got their direction wrong and routinely got their extent wrong. The pinky works but doesn't feel good, so it now curls to a palm pad instead — which buys back the held modifier the design had been missing, and drops the wiring from twelve lines to nine.

The near-term work is a browser prototype: a simulated glove and a schematic phone, driven by mouse and by keyboard, used to find out what the rest of the grammar should be before anything is soldered. The stroke classifier it will use already exists in [`src/stroke.js`](src/stroke.js), with the trainer as its first consumer.

## Docs

|                                                  |                                                         |
| ------------------------------------------------ | ------------------------------------------------------- |
| [`docs/00-concept.md`](docs/00-concept.md)       | Premise, constraints, architecture, roadmap             |
| [`docs/01-vocabulary.md`](docs/01-vocabulary.md) | The gesture grammar — primitives, reach costs, bindings |
| [`docs/02-reach-trials.md`](docs/02-reach-trials.md) | Protocol for measuring the real reach costs, and the decision rules riding on them |
| [`docs/03-findings-01.md`](docs/03-findings-01.md) | Results of the first trials — what they overturned, and what changed because of it |

## Code

`src/` is the beginning of L0–L2 from [`docs/00-concept.md`](docs/00-concept.md) §4 — dependency-free ES modules with no DOM and no knowledge of what they are controlling. The trainer is their first consumer; the interaction prototype will be the second, and imports the same files rather than reimplementing them.

| | |
| --- | --- |
| [`src/layout.js`](src/layout.js) | Zone layouts (v0, v1) — the single source of truth for which contacts exist |
| [`src/stroke.js`](src/stroke.js) | L1: stroke classification, one pure function |
| [`src/stats.js`](src/stats.js) | Trial statistics with baseline correction |
| [`src/version.js`](src/version.js) | Build stamp, written at deploy time for data provenance |
| [`site/index.html`](site/index.html) | Landing page — also the onboarding for anyone running trials |
| [`tools/reach-trials.html`](tools/reach-trials.html) | Reach-trial rig / trainer. Needs a server, since browsers block module imports over `file://` |
| `tools/reach-trials.standalone.html` | Generated single-file build of the same thing — opens by double-click, and works offline |

```sh
node --test src/stroke.test.mjs      # classifier tests
node tools/build-standalone.mjs      # regenerate the double-clickable build
python3 -m http.server                # then open /tools/reach-trials.html
```

## Hosting

The site is static and deploys to GitHub Pages from `main` via
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) — landing page, trainer, modules and
collected data, with no build step beyond stamping the commit into `src/version.js` so exported
trial data can be traced to the layout that produced it. The workflow also fails the build if the
committed standalone copy has drifted from its sources.

**One-time setup:** repository *Settings → Pages → Source → GitHub Actions*. The workflow can also
be run by hand from the Actions tab against any branch, which is the way to preview a deploy before
merging.

### Collecting results

Static hosting cannot receive data, so results travel by **export-and-send**: participants download
the JSONL or CSV and pass it on, with their written impressions in the same message. That last part
is the reason to be in no hurry to automate it — the decision to drop the pinky came from someone
saying it worked but didn't feel good, which no timing captured and no silent endpoint would have
collected either.

A submission endpoint waits until **after the interaction prototype exists**, deliberately. That
prototype logs a different thing — strokes, misfires, layer abandonment (`01-vocabulary.md` §9) —
and an endpoint built now against reach trials would be the wrong shape for it. When it is worth
building it is one Cloudflare Worker and a table, not a platform: nothing in this project needs
server rendering, auth or a framework, and `src/` is deliberately dependency-free — a full-stack
framework's main effect here would be making that harder to keep true.

## Principle

**Don't build hardware because it's interesting.** First discover what this input channel should be good for; then build the simplest hardware capable of proving it.
