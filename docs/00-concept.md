# Gesture Glove — Concept

Status: **design exploration.** No hardware exists, no interaction model has been validated. This document states the premise and the constraints; everything downstream is a hypothesis.

---

## 1. What it is

A small, silent, eyes-free input layer worn on the hand. A thin skin-tight glove; the thumb is the controller; each of the other four fingers carries three conductive contact zones — twelve in total. The thumb touching a zone produces a discrete signal; a continuous movement across several zones produces a compound one.

The zones sit on the knuckle creases rather than on arbitrary thirds. Those creases are unambiguous tactile landmarks, which is the entire reason the layout can be operated without looking. It is the one piece of the physical design that should be treated as settled.

---

## 2. The interesting problem

Not "a new way to control a phone." The question is what a **silent, private, low-amplitude, eyes-free** channel is good for — one with no visual affordance, no audible operation, and no gesture larger than a thumb twitch.

Existing input either demands attention (touchscreens), space (mid-air gesture), a surface (keyboards), or announces itself socially (voice). This channel demands none of them and pays for it with zero discoverability. That trade is the design space.

So the productive framing is not *what does this replace* but *where does everything else fail*: hands occupied, phone in a pocket, cold, dark, in a meeting, on a bike, cooking, presenting — and further out, head-mounted displays, where the input problem is genuinely unsolved.

**The first target is phone/Android**, not because a phone is where this wins, but because it is ubiquitous, immediately testable, and offers a rich command set to map against. The prototype's job is to reveal the interaction model, not to beat a touchscreen at its own game.

Existing alternatives are **Myo armband** and it's modern successors - **Meta** and **Mudra** *sEMG* wristbands. They are significantly more complex and expensive, although significantly more capable.

---

## 3. The single-contactor constraint

The original sketch assumed simultaneous contacts producing chords. **One thumb cannot be in two distant places.** True simultaneity exists only where the thumb pad bridges two adjacent zones — a small, geometry-limited set, not a combinatorial vocabulary.

The resolution, borrowed from stenotype, is to commit on release: a **stroke** is the set of zones the thumb visits between touch-down and lift, ordering discarded. Under that rule a chord and a swipe are the same physical act, distinguished only by whether the visited set is collinear. Taps, holds, swipes and chords collapse into one data structure and one classifier.

This is the load-bearing decision of the project, with three consequences:

- **No timing thresholds.** No simultaneity window, no chord-versus-sequence disambiguation, no penalty for being fast or slow. Speed-independent by construction.
- **Trivial hardware.** The glove need only answer which zone the thumb is touching — twelve lines against one shared thumb electrode. No multi-touch matrix, no crosstalk.
- **No quasimodes.** A held modifier is the safest defence against mode error, and it is unavailable: the thumb cannot hold and act at once. The v1 substitute is prefix strokes — one stroke arms a layer, the next executes and it auto-reverts. Restoring true quasimodes would take one extra pad on the palm, curled into by ring and pinky; that is the highest-value cheap hardware addition identified so far, and deliberately not in v1.

---

## 4. Architecture

Four strictly separated layers. This is what lets the input source and the target be swapped independently, and it is why a browser prototype is not wasted work.

|        | Layer       | Responsibility                         | Implementations                      |
| ------ | ----------- | -------------------------------------- | ------------------------------------ |
| **L0** | Contacts    | zone id, down/up, timestamp            | mouse zones → keyboard → BLE glove   |
| **L1** | Recognizer  | stroke accumulation and classification | one pure function, no DOM            |
| **L2** | Bindings    | stroke + layer + context → command     | declarative table                    |
| **L3** | Application | consumes commands                      | schematic phone → Android → anything |

**L0–L2 is the project**: a dependency-free TypeScript module with no knowledge of the DOM, of any framework, or of what it is controlling. Everything else — hand widget, fake phone, eventually an Android service — is replaceable scaffolding around it.

The glove emits abstract strokes and never knows what they mean. Context-sensitivity lives in L2, where host state is available; pushing it into the device would couple the hardware to whatever it happens to be driving today.

---

## 5. Roadmap

1. **Gesture grammar and interaction model** — on paper and in simulation. Prefixed versus modal versus context-driven; reach economy; engage conditions.
2. **Browser prototypes.** Keyboard as the physical stand-in (four fingers, three rows) because it exercises real chording and real muscle memory; the on-screen hand as visualiser, not primary input.
3. **Android port** of whatever model survives.
4. **Simple external input device** replacing the simulated contacts.
5. **The conductive-contact glove** — fabric pads, traces, a small wireless MCU.
6. **Ergonomics, accidental input, haptics** — the problems that only appear once it is worn all day.
7. **Richer sensing** — IMU, potentially EMG — *if and only if* the interaction model needs it or the project grows beyond the concept.

---

## 6. Out of scope, deliberately

**EMG and neural sensing** (Myo, Mudra): answers a sensing question when the open question is a design one. Contact sensing is enough to explore the grammar and costs almost nothing.

**Text entry:** the obvious thing to attempt with a chording device, and a well-explored dead end for casual wearables. If the grammar turns out to support it, that is a discovery, not a goal.

**Two-handed operation:** doubles the vocabulary and destroys the hands-busy premise that motivates the device.

**Beating the touchscreen** at tasks performed while looking at the screen.

---

## 7. Core principle

**Do not build hardware because it is interesting.** First discover what this input channel should be good for; then build the simplest hardware capable of proving it.

Main idea: check every design decision for whether it makes the hardware *simpler*. §3 is the model case — choosing the stroke abstraction for interaction-design reasons happened to reduce the electronics to twelve wires. When a vocabulary choice and a hardware simplification point the same way, that is strong evidence the abstraction is right.

---

## 8. Open questions

- Continuous quantities — volume, scrub, zoom — have no home in a discrete stroke model, and it is not obvious a single contactor can produce one.
- Whether the palm pad (§3) earns its place, since it is the difference between prefix strokes and true quasimodes.
- What the real reach-cost ordering across the twelve zones is; `01-vocabulary.md` currently guesses.
- How a stroke terminates on hardware when the thumb never fully lifts — a hand holding something rests the thumb in contact indefinitely.
- Whether the eventual target is a phone accessory at all, or whether the phone is only a test harness for something aimed at a head-mounted display.
