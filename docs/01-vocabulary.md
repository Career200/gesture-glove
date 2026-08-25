# Gesture Vocabulary — v0.1

---

## 1. Physical model

### 1.1 Zones

Four fingers, three contact zones each, aligned to the **phalanges** — not arbitrary thirds. This matters: the knuckle creases are hard tactile landmarks, which is the entire reason the layout can work eyes-free.

|              | proximal (1) | middle (2) | distal (3) |
| ------------ | ------------ | ---------- | ---------- |
| **I** index  | `I1`         | `I2`       | `I3`       |
| **M** middle | `M1`         | `M2`       | `M3`       |
| **R** ring   | `R1`         | `R2`       | `R3`       |
| **P** pinky  | `P1`         | `P2`       | `P3`       |

Numbering increases toward the fingertip. Notation is always `<finger><segment>`.

The **thumb is the sole contactor.** It carries no zones of its own.

#### Theories
1. Ring and pinky are hard to reach - exclude? **Important - decide soon**
2. Ring and pinky distal zones can be useful if we have a *contact surface on the palm* - touch as modifiers (shift/alt/...).

### 1.2 The single-contactor constraint

The thumb can only be in one place at a time. Therefore:

- **True simultaneous contact is impossible**, except by the thumb pad physically bridging two adjacent zones (`I1`+`M1` at the knuckle bases, or `I1`+`I2` across a crease). That is a small, geometry-limited set — not a combinatorial vocabulary. Bridging three zones across **I** or **M** seems possible, but depends on the physical implementation of contact surfaces.
- Anything resembling a chord must therefore be **sequential contact within one continuous touch.**

This constraint is not a limitation to work around. It is the thing that makes the recognizer simple (see §2) and the hardware trivial (see §6).

---

## 2. The stroke — single core abstraction

Adapted from stenotype's **release-to-commit** rule.

> A **stroke** begins when the thumb first contacts any zone and ends when the thumb lifts clear of all zones. Everything touched in between belongs to that stroke.
> The stroke commits on lift.

A stroke is fully described by four fields:

```ts
type Stroke = {
  zones: Set<Zone>   // every zone visited, order discarded
  first: Zone        // where the thumb landed
  last:  Zone        // where the thumb was when it lifted
  ms:    number      // touch-down to lift
}
```

Every primitive below is a **classification of this one structure.** There is no timing threshold for simultaneity, no chord-vs-sequence disambiguation, no ordering rules. Fast users and slow users produce identical strokes.

### 2.1 Primitive classes

| Class                  | Predicate                                             | Count   |
| ---------------------- | ----------------------------------------------------- | ------- |
| **Tap**                | `zones.size === 1 && ms < HOLD_MS`                    | 12      |
| **Hold**               | `zones.size === 1 && ms >= HOLD_MS`                   | 12      |
| **Longitudinal swipe** | `zones.size >= 2`, all same finger, contiguous        | 8       |
| **Lateral swipe**      | `zones.size >= 2`, all same segment level, contiguous | 6       |
| **Chord**              | `zones.size >= 2`, anything else                      | curated |

Direction, where it matters, is `first → last`.

**Forgiveness rule:** a swipe needs only **two adjacent** zones, not the full run. `I1→I2` and `I1→I2→I3` are the same outward index swipe. This absorbs the single largest source of real-world sloppiness for free.

**v1 inventory: 38 primitives** before any layering. That is already far more than the vocabulary can usefully spend. The scarce resource is not signals — it is *memorable, comfortable, non-colliding* signals.

### 2.2 Deliberately excluded from v1

- **Double-tap.** Taxes the latency of *every* single tap by the disambiguation window. Not worth 12 extra signals when 38 are unspent. Might become useful later.
- **Roll / order-sensitive strokes.** Steno discards ordering on purpose; reintroducing it re-imports every timing problem the stroke model just eliminated.
- **Pressure, dwell-length gradations.** Neither is sensable by a plain contact glove.

---

## 3. Reach economy

Signals are not equal in cost. Command frequency should be assigned in **inverse proportion to reach cost**, and the cost ranking should be fixed before any binding is written.

Provisional ranking — **must be re-ordered after physical testing.** It is derived from thumb opposition mechanics, not measurement:

| Tier             | Zones            | Rationale                                                                         |
| ---------------- | ---------------- | --------------------------------------------------------------------------------- |
| **1 — free**     | `I2`, `I3`, `M2` | Thumb's resting position and the pinch. Most-practiced motions in the human hand. |
| **2 — easy**     | `I1`, `M1`, `M3` | Short travel, no wrist involvement.                                               |
| **3 — moderate** | `R1`, `R2`       | Thumb crosses the palm; ring must curl slightly.                                  |
| **4 — costly**   | `R3`, `P1`, `P2` | Significant thumb travel + finger flexion.                                        |
| **5 — awkward**  | `P3`             | Worst reach on the hand. Reserve for rare or destructive commands.                |

**Note** - Back to evaluating the need for ring and pinky zones. Decision rules **R1** and **R2** in [`02-reach-trials.md`](02-reach-trials.md) settle this from measurement.

**Swipe costs:**

- **Lateral at level 1** (`I1→M1→R1→P1`) — the thumb sweeping across the knuckle bases is plausibly the single most natural motion available (ommitting the `P1` - that one's a bit awkward). Spend it on the most frequent action.
- **Lateral at level 3** requires fingers extended *and* held together — trivial for `I1→M1`, unreliable any further than that, and impossible while gripping anything. Treat as suspect.
- **Longitudinal** swipes are cheap on index/middle, awkward on pinky.

> Everything in this section is the prototype's first real job to falsify. The instrumentation (§7) exists primarily to replace this table with measured data.

**Correction:** a keyboard-driven prototype cannot falsify this. Reach cost is thumb-opposition mechanics, and four fingers on three keyboard rows is a different physical task that only shares the 4×3 shape. The table is measurable on a bare hand instead — see [`02-reach-trials.md`](02-reach-trials.md) for the protocol, the tool, and the pre-registered rules for what the results do to §1.1 and §7.

---

## 4. Engage — the Midas touch problem

A glove worn all day sees constant incidental thumb-to-finger contact: gripping a cup, gesturing while talking, sleeping, scratching. **Without an engage condition the glove fires commands all day.** This constrains the entire vocabulary and therefore cannot be deferred.

Candidate mechanisms, cheapest first:

1. **Dwell filter** — first contact must be held ≥ ~150 ms before the stroke is considered live. Costs no vocabulary, filters brushes and grazes.
2. **Wake stroke** — a distinctive stroke arms the glove for N seconds; timeout or explicit sleep stroke disarms. Cheap and testable, but introduces a mode with no visible state.
3. **Anchor zone** — every stroke must include one designated zone. Ergonomically brutal and halves the vocabulary. Not recommended.
4. **Posture gate** — requires an IMU. Out of scope for minimal hardware, but the likely correct long-term answer.

**v1 plan:** dwell filter *and* wake-stroke arming, both as switchable knobs, and let the false-positive log decide.

**Note** - `I1-I2-I3` feels very natural for a wake stroke; Grabbing the thumb with index and middle is also natural and would basically exclude any chance of misfire - that's not a position you can do accidentally - but requires a sensor pad all around the thumb distal phalanx, not just the front. Dwell filter seems prone to misfires the most.

---

## 5. Layers

### 5.1 Quasimodes are unavailable

The intended design (hold a modifier zone, act with the same hand — Raskin's self-revoking quasimode) **does not work with a single contactor.** The thumb cannot hold a modifier and act simultaneously. This rules out the safest known answer to mode error.

### 5.2 Prefix strokes (the v1 answer)

One stroke arms a layer; the **next stroke executes and the layer auto-reverts.** Emacs `C-x`, vi's `g`, Vim's leader key.

Not as safe as a quasimode — there is a window where the user is in a state they cannot see — but the window is exactly one stroke long and self-expiring, which is categorically better than a persistent mode. Add a short timeout (~2 s) so an abandoned prefix decays on its own.

### 5.3 Context layers (free)

The *host*, not the glove, knows what is on screen. The glove emits abstract strokes;
the binding layer resolves them against application context. Zero user cost, zero learning cost — but invisible, so the same stroke doing different things in different apps is a discoverability hazard. Use sparingly and keep a **stable core** of strokes that mean the same thing everywhere.

### 5.4 Persistent modes

Last resort. If used at all, they need continuous non-visual feedback (haptic pattern, audio tone), and the prototype should measure mode-error rate before any of this is taken seriously.

**Note** - haptic feedback is a VERY big UX improvement.

### 5.5 The one hardware change that would fix this

A **single conductive pad on the palm / thenar eminence**, contacted by curling the ring and pinky inward. That posture is comfortable, holdable for seconds, and leaves the thumb entirely free to reach index and middle.

That is **one extra zone in exchange for a true held Shift** — restoring quasimodes, and with them the safest available modal design. Highest value-per-gram addition identified so far.

---

## 6. Hardware implication

Because there is one contactor and order is discarded, the glove need only answer:
*which zone(s) is the thumb currently touching?*

That is a 12-line scan against a single thumb electrode — no multi-touch matrix, no crosstalk resolution, no per-zone controller. Conductive fabric pads, one trace each, a shared thumb electrode, and any MCU with 12 GPIO or a single mux.

The interaction model chosen here has made the hardware *simpler*, not harder. That is the ordering the project's core principle demands.

---

## 7. First binding table

Target: schematic phone (a rectangle with text blocks reporting state). Small on purpose — ten bindings, chosen so the day-one task chain in §8 is completable.

### Base layer

| Stroke                      | Notation | Command                  | Cost tier |
| --------------------------- | -------- | ------------------------ | --------- |
| Lateral L1, toward index    | `P1→I1`  | **Back**                 | 1         |
| Lateral L1, toward pinky    | `I1→P1`  | **Forward**              | 1         |
| Longitudinal index, inward  | `I3→I1`  | **Home**                 | 1         |
| Longitudinal index, outward | `I1→I3`  | **Recents**              | 1         |
| Tap                         | `I2`     | **Select / OK**          | 1         |
| Tap                         | `M2`     | **Scroll down**          | 1         |
| Tap                         | `M1`     | **Scroll up**            | 2         |
| Hold                        | `I2`     | **Long-press / context** | 1         |
| Lateral L2, toward pinky    | `I2→P2`  | **Volume up**            | 3         |
| Lateral L2, toward index    | `P2→I2`  | **Volume down**          | 3         |
| Hold                        | `P1`     | **Prefix → media layer** | 4         |

**Note** - to be reviewed. Not a fan.

### Media layer (one stroke, then auto-revert)

| Stroke                  | Command        |
| ----------------------- | -------------- |
| Tap `I2`                | Play / Pause   |
| Lateral L1 toward pinky | Next track     |
| Lateral L1 toward index | Previous track |
| Hold `I2`               | Assistant      |

### Notes on these choices

- **Back and Forward** get the cheapest lateral sweep because they are by far the most frequent navigation actions.
- **Home / Recents** use the index longitudinal pair: same finger, opposite directions, semantically paired. Direction-inverse pairs should always map to inverse commands —  this is the main mnemonic lever available.
- **The prefix lives on `P1`**, deliberately expensive, because an accidental layer entry is more costly than an accidental scroll.
- **Volume on lateral L2** is a placeholder and probably wrong — a continuous quantity wants a continuous gesture, which the stroke model does not currently provide. Open question.

**Note** - as above, tbd.
---

## 8. Day-one acceptance test

Not "does it feel like an interface." One concrete chain, **performed with the hand widget hidden:**

```
Home → scroll to an item → Select → Back → prefix → Next track
```

Six strokes. If it completes blind, the grammar has legs. If it does not, the log identifies exactly which stroke failed and how — a better outcome than a demo that merely looked nice.

---

## 9. Instrumentation requirements

Non-negotiable from the first commit, or the findings are vibes.

Log one JSONL line per stroke:

```jsonc
{ "t": 1724605000123, "zones": ["I1","M1"], "first": "I1", "last": "M1",
  "ms": 210, "class": "lateral", "dir": "out", "layer": "base",
  "command": "forward", "engaged": true }
```

Derived signals to watch:

- **Misfire rate** — a command immediately followed by its inverse within ~1.5 s. The single most valuable number in the project.
- **Unrecognized-stroke rate** — strokes that classified to nothing. Names the gaps.
- **Per-zone latency** — time from touch-down to lift, per zone. Populates the real reach-cost table and replaces §3's guesswork.
- **Layer abandonment** — prefixes that timed out unused.

An export button, from the first version.

---

## 10. Open questions carried forward

- Continuous quantities (volume, scrub, zoom) have no home in a discrete stroke model. Does the vocabulary need a held-and-modulated primitive, and can one exist with a single contactor?
- Does the palm pad (§5.5) earn its place? It is the difference between prefix strokes and true quasimodes.
- Is lateral level 3 performable at all, or does it die the moment the hand is holding something?
- What is the real reach-cost order? §3 is a hypothesis.
- Does the forgiveness rule (§2.1) cause collisions between two-zone swipes and intended bridged chords?
- How is a stroke terminated on real hardware when the thumb never fully lifts — e.g. resting the thumb against the index during normal activity?
