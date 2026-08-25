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

#### Decided — 2026-08-25, from measurement

Both theories were tested; see [`03-findings-01.md`](03-findings-01.md).

1. **Not distance — landmark ambiguity.** Distal zones were the *fastest* on the hand and were missed zero times in sixty attempts; `P3`, predicted worst, measured tier 1. Error concentrates in the **middle segment**, which is the only zone with no hard edge to stop against, and it worsens outward: `I2` 6.7% → `M2` 13.3% → `R2` 20% → `P2` 26.7%.
2. **The palm surface is adopted, and the pinky pays for it.** The pinky is workable as a thumb target but not comfortable enough to keep; curling it to the palm is comfortable. Its three zones become the one palm pad of §5.5.

**Layout v1** — the live layout, defined in `src/layout.js`:

|              | proximal (1) | middle (2) | distal (3) |
| ------------ | ------------ | ---------- | ---------- |
| **I** index  | `I1`         | `I2`       | `I3`       |
| **M** middle | `M1`         | `M2`       | `M3`       |
| **R** ring   | `R1`         | —          | `R3`       |
| **P** pinky  | — | — | — |

Plus **one palm pad**, closed by curling ring and pinky inward. Eight thumb zones and one pad: nine lines against twelve, and quasimodes restored (§5.5).

The table above the fold remains the v0 sketch, kept because the measurements are indexed against it.

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

Revised 2026-08-25. The zone-set predicates below were replaced by direction-of-intent classification; the implementation is `src/stroke.js` and the reasoning is [`03-findings-01.md §6`](03-findings-01.md).

| Class              | Predicate                                                        | Count (v1) |
| ------------------ | ---------------------------------------------------------------- | ---------- |
| **Tap**            | one zone, `ms < HOLD_MS`                                         | 8          |
| **Hold**           | one zone, `ms >= HOLD_MS`                                        | 8          |
| **Longitudinal**   | `abs(Δsegment) > abs(Δfinger)`; finger and direction from `first` | 6          |
| **Lateral**        | `abs(Δfinger) > abs(Δsegment)`; **level from `first`**, direction `first → last` | 6 |
| **Ambiguous**      | equal deltas — a diagonal, or a bridged chord                     | unassigned |

**Why direction and not position.** 65 sweeps produced zero direction errors and a steady stream of positional drift — an intended `I2→M2→R2` lands on `R1` about a fifth of the time. Direction is the reliable channel. So:

- **Extent is discarded.** Two zones and three zones the same way are one command — the forgiveness rule taken to its end.
- **Level comes from `first`.** The landing is deliberate; the lift is where drift accumulates.
- **Drift degrades into the intended command, not into the catch-all.** Under the old rule `{I2,M2,R1}` was neither one finger nor one level and fell through to *Chord*. It is now lateral L2 outward. This case is a regression test in `src/stroke.test.mjs`.

**Chords are parked.** With sloppy laterals no longer landing there, "anything else" is not a safe definition, and bridging remains untested.

**v1 inventory: 28 primitives** before layering, against 38 in v0 — signals that could not be produced reliably, traded for ones that can. The scarce resource was never signals; it is *memorable, comfortable, non-colliding* ones.

### 2.2 Deliberately excluded from v1

- **Double-tap.** Taxes the latency of *every* single tap by the disambiguation window. Not worth 12 extra signals when 38 are unspent. Might become useful later.
- **Roll / order-sensitive strokes.** Steno discards ordering on purpose; reintroducing it re-imports every timing problem the stroke model just eliminated.
- **Pressure, dwell-length gradations.** Neither is sensable by a plain contact glove.

---

## 3. Reach economy

Signals are not equal in cost. Command frequency should be assigned in **inverse proportion to reach cost**, and the cost ranking should be fixed before any binding is written.

> **Superseded 2026-08-25.** The ranking below was wrong *in kind*, not merely in order: it prices reach by distance from the thumb, and the measured driver is landmark ambiguity. Kept for the record because the trials are indexed against it. The live model is immediately after.
>
> **Measured model.** Cost is set by whether a zone has a hard tactile edge, with finger distance acting as a multiplier on the ambiguity rather than as the cost itself:
>
> | | Median | Wrong landings |
> | --- | --- | --- |
> | distal — bounded by the fingertip | 790 ms | 0.0% |
> | proximal — bounded by the knuckle | 843 ms | 3.3% |
> | middle — bounded by nothing | 885 ms | 16.7% |
>
> Absolute times are inflated by an unmeasured reaction-time offset and are ordinal only; see [`03-findings-01.md §1`](03-findings-01.md).

Provisional ranking — **superseded, see above.** It is derived from thumb opposition mechanics, not measurement:

| Tier             | Zones            | Rationale                                                                         |
| ---------------- | ---------------- | --------------------------------------------------------------------------------- |
| **1 — free**     | `I2`, `I3`, `M2` | Thumb's resting position and the pinch. Most-practiced motions in the human hand. |
| **2 — easy**     | `I1`, `M1`, `M3` | Short travel, no wrist involvement.                                               |
| **3 — moderate** | `R1`, `R2`       | Thumb crosses the palm; ring must curl slightly.                                  |
| **4 — costly**   | `R3`, `P1`, `P2` | Significant thumb travel + finger flexion.                                        |
| **5 — awkward**  | `P3`             | Worst reach on the hand. Reserve for rare or destructive commands.                |

**Settled.** `R2` dropped (20% wrong landings), pinky reassigned to the palm pad on ergonomic grounds. See §1.1 and [`03-findings-01.md §4`](03-findings-01.md).

**Swipe costs — measured.** Cost tracks the number of fingers crossed, and almost nothing else:

| Movement | Median | n |
| --- | --- | --- |
| longitudinal (within one finger) | 723 ms | 25 |
| lateral, one finger across | 773 ms | 10 |
| lateral, two fingers across | 1044 ms | 10 |
| lateral, three fingers across | 1080 ms | 20 |

There is a cliff between one finger across and two, and near-nothing between two and three: crossing the first gap is cheap, committing to a wide sweep costs almost its full price up front.

- **The lateral L1 sweep was the most expensive movement tested**, not the cheapest — 1199 ms for `I1→P1` against 715 ms for longitudinal index. The original claim is falsified (rule R3).
- **Adjacent-finger laterals are the first-class primitive.** Wide sweeps are not; they are slow, uncomfortable, and where the drift lives.
- **Longitudinal swipes are the cheapest movement on the hand**, led by middle (590 ms).
- **Lateral at level 3 while gripping is still untested** — no gripping block has been run.

> This section has now been through one round of measurement. What replaced it came from a bare hand and a pen, not from the prototype.

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

### 5.1 Quasimodes are unavailable — *to the thumb*

The intended design (hold a modifier zone, act with the same hand — Raskin's self-revoking quasimode) **does not work with a single contactor.** The thumb cannot hold a modifier and act simultaneously. This rules out the safest known answer to mode error.

> **Reopened 2026-08-25.** The constraint binds the *thumb*, and the palm pad of §5.5 is not closed by the thumb — it is closed by curling ring and pinky. Layout v1 adopts it (§1.1), so a true held modifier exists and prefix strokes drop to a fallback. Two consequences: the pad's holdability is still unvalidated, and because ring and pinky flexion share tendon slips, curling the pinky brings the ring along — but only part-way. Tested by hand: with `P3` on the palm the ring is **landable but not slidable**, so `R1` and `R3` keep their taps and holds and lose their sweeps.

Because extent is discarded (§2.1), the laterals survive too — an `I1→M1` produces the same command as the now-unreachable `I1→M1→R1`. **The modifier costs exactly two primitives, the ring's longitudinal pair; 26 of 28 survive.** Keep shifted bindings on the index and middle core, which behaves the same in both states.

### 5.2 Prefix strokes (the v0 answer, now the fallback)

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

**Adopted in v1, and it costs nothing net.** The pinky measured as workable but uncomfortable as a thumb target, so its three zones were spent on this pad instead: twelve lines become nine, and the quasimode arrives with them. Validation is entirely outstanding — whether the curl can be held for seconds without fatigue, and whether it survives a hand that is already holding something, which is the posture that occupies ring and pinky in the first place.

---

## 6. Hardware implication

Because there is one contactor and order is discarded, the glove need only answer:
*which zone(s) is the thumb currently touching?*

That is a 12-line scan against a single thumb electrode — no multi-touch matrix, no crosstalk resolution, no per-zone controller. Conductive fabric pads, one trace each, a shared thumb electrode, and any MCU with 12 GPIO or a single mux.

**v1: eight lines plus one.** Measurement removed four zones (`R2`, and the pinky column) and added the palm pad, which is a ninth line on the same shared-electrode scheme — except that it closes against the *ring and pinky tips*, not the thumb, so it needs its own return path. Nine sense lines, two electrodes.

The interaction model chosen here has made the hardware *simpler*, not harder — and the second round of it, driven by measurement rather than by taste, made it simpler again while adding the held modifier §5.1 said was unavailable. That is the ordering the project's core principle demands, and it is now the second time the vocabulary evidence and the hardware simplification have pointed the same way.

---

## 7. First binding table

Target: schematic phone (a rectangle with text blocks reporting state). Small on purpose — ten bindings, chosen so the day-one task chain in §8 is completable.

> **Stale as of 2026-08-25.** This table is priced against the superseded §3 costs and against zones that no longer exist (`P1` carries the prefix; `I2→P2` and `P2→I2` are wide L2 sweeps, now the most expensive movement class measured). Rewriting it needs the baseline-corrected re-run, so it is left standing rather than patched — the "not a fan" note below was right, for reasons now known.

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
- Does the forgiveness rule (§2.1) cause collisions between two-zone swipes and intended bridged chords? **Sharper now:** extent is fully discarded, so every bridged chord that is not a diagonal is unreachable. Chords are parked (§2.1).
- Can the palm pad be held comfortably, and while gripping? (§5.5) The trainer cannot answer this — it is a posture, not a thumb target.
- How is a stroke terminated on real hardware when the thumb never fully lifts — e.g. resting the thumb against the index during normal activity?
