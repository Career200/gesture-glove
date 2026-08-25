# Gesture Glove

*A design exploration on a small, silent, eyes-free input interface worn on the hand.*

---

A thin glove. The thumb is the controller. Each of the other four fingers carries three contact zones, sitting on the knuckle creases — twelve zones, all findable by feel. Touching a zone is a signal; sliding across several in one continuous touch is a compound one.

The bet is that a very small physical vocabulary, made contextual and layered, can carry a large command set — without a screen, without a sound, and without a large gesture anyone else can see.

## Why

Every existing input method demands something: attention (touchscreens), space (mid-air gesture), a surface (keyboards), or social permission (voice). This one demands none of them, and pays for it with zero discoverability.

So the question isn't what it replaces — it's where everything else already fails. Hands occupied, phone in a pocket, cold, dark, in a meeting, on a bike, cooking. And further out, head-mounted displays, where nobody has a good answer yet.

## Status

Design and simulation. **No hardware, no validated interaction model, no code yet.**

The near-term work is a browser prototype: a simulated glove and a schematic phone, driven by mouse and by keyboard, used to find out what the gesture grammar should be before anything is soldered.

## Docs

|                                                  |                                                         |
| ------------------------------------------------ | ------------------------------------------------------- |
| [`docs/00-concept.md`](docs/00-concept.md)       | Premise, constraints, architecture, roadmap             |
| [`docs/01-vocabulary.md`](docs/01-vocabulary.md) | The gesture grammar — primitives, reach costs, bindings |

## Principle

**Don't build hardware because it's interesting.** First discover what this input channel should be good for; then build the simplest hardware capable of proving it.
