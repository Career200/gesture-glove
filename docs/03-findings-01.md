# Findings 01 — first reach trials

Run 2026-08-25, right hand, single subject. Raw data in `data/2026-08-25-*`.

| Block | Condition | n |
| --- | --- | --- |
| Reach | hand visible, free | 5 / zone |
| Reach | hand hidden, free | 15 / zone (three pooled sessions) |
| Transition | hand hidden, free | 5 / pair, 13 pairs |
| Reach | hidden, **gripping** | **not run** |

---

## 1. The instrument under-resolved, and that is fixable

Raw medians spanned 745–988 ms — a **1.33× spread across the whole hand**, which is not credible as a reach-cost range. The cause is the constant overhead warned about in `02-reach-trials.md §4`: every trial carries reaction time plus a keypress, and that offset is large relative to the thing being measured. The fastest single trial in the whole hidden set was 560 ms, which bounds the overhead from above but leaves it unknown.

It matters more than "the ratios look small". Under raw times every zone landed in tier 1–2, so the tier column carried no information at all. With a plausible 500 ms baseline subtracted, the same data spreads 245–488 ms — a 1.99× range across four tiers.

**Fixed:** the trainer now has a **baseline mode** — the target appears, you press without moving — and subtracts the measured overhead from every median. It refuses to trust a baseline that is at or above the median trial time, which is what a stale one looks like. Timing conclusions below are therefore ordinal only; the corrected numbers need a re-run.

---

## 2. The cost model in §3 was wrong in kind, not just in ordering

§3 assumed cost rises with distance from the thumb: index cheap, pinky awkward. Pooling the hidden-hand trials by **segment** instead of by finger:

| Segment | Median | Wrong landings | n |
| --- | --- | --- | --- |
| proximal (1) | 843 ms | 3.3% | 60 |
| middle (2) | 885 ms | **16.7%** | 60 |
| distal (3) | 790 ms | **0.0%** | 60 |

Distal zones were the fastest on the hand and were never missed once in sixty attempts. The error is concentrated almost entirely in the middle segment — and it scales outward:

| Zone | I2 | M2 | R2 | P2 |
| --- | --- | --- | --- | --- |
| Wrong landings | 6.7% | 13.3% | 20.0% | **26.7%** |

A clean monotonic gradient. The explanation is landmark structure, not reach: **the distal segment is bounded by the fingertip and the proximal by the knuckle, but the middle segment is defined only by two creases with nothing to stop against.** It is the one zone the thumb can overshoot in either direction, and proprioceptive acuity for that judgement falls off as the thumb travels further across the hand.

So the cost driver is *landmark ambiguity*, and finger distance acts as a multiplier on it rather than as the cost itself.

The sharpest single refutation: **`P3` — the zone §3 called "worst reach on the hand, reserve for rare or destructive commands" — came in at 798 ms with a 0% miss rate, tier 1.** It is one of the best zones on the hand.

---

## 3. Swipe cost is set by how many fingers you cross

Grouping the 65 transitions by kind:

| Movement | Median | n |
| --- | --- | --- |
| longitudinal (within one finger) | 723 ms | 25 |
| lateral, one finger across | 773 ms | 10 |
| lateral, two fingers across | 1044 ms | 10 |
| lateral, three fingers across | 1080 ms | 20 |

There is a cliff between one finger across and two — roughly +35% — and almost nothing between two and three. Crossing the first gap is cheap; committing to a wide sweep is what costs, and it costs almost all of its price up front.

This matches the felt report exactly ("wide swipes across fingers are uncomfortable") and it sets the design rule: **adjacent-finger laterals are a first-class primitive, wide sweeps are not.**

---

## 4. Verdicts on the pre-registered rules

- **R1 — pinky. Fires, but for the wrong reason.** The rule triggered on `P2` (26.7% > 20%), and taken literally it drops the whole column — including `P3`, which measured as one of the best zones on the hand. The rule was written assuming failure would be uniform across a finger; it wasn't. **The decision to drop the pinky rests on the ergonomic report instead** — sustained comfort, which no timed trial here measured. That is a real limitation of the instrument, not a technicality.
- **R2 — ring. Fires partially, exactly as anticipated.** `R2` at 20.0% goes; `R1` (0%) and `R3` (0%) stay. Ring survives as a two-zone finger.
- **R3 — lateral L1 primacy. Falsified decisively.** §3 spent its cheapest binding on `I1→P1` believing it "plausibly the single most natural motion available". Measured, it is **the slowest of all thirteen pairs** at 1199 ms, against 715 ms for longitudinal index and 590 ms for longitudinal middle. Navigation bindings move.
- **R4 — lateral L3 under grip. Not run.** No gripping block exists, so §3's claim that lateral L3 "dies the moment the hand is holding something" is still untested. Open.
- **R5 — table replaced.** Done; §3 is superseded by §2 above.

---

## 5. The instrument missed the thing that mattered most

Transition mode recorded **zero errors in 65 trials**, while the same sweeps were reported by hand as imprecise — `I2→M2→R2` drifting to `R1`, ring and pinky sweeps unreliable in general. A binary hit/miss key cannot express "arrived, but sloppily", and in a sweep the arrival point is fuzzy by nature, so nothing ever got marked.

Two consequences, both now acted on:

1. **The trainer gained a third response key** — <kbd>C</kbd> for *arrived but hunted or drifted* — reported separately from wrong landings.
2. More importantly, the observation that direction survives while extent does not became the grammar rule in §6 below. Zero direction errors in 65 sweeps is a strong result in its own right: **direction is the reliable channel, position is not.**

One data-hygiene note: a single `R1→R3` trial recorded 88 ms, which is below physical possibility and is a double-press. Medians absorbed it; a future version should flag sub-baseline trials.

---

## 6. What changes in the grammar

The felt observation — *"swipes are less about precision and more about the intent, the direction — basic case is just a d-pad"* — is what the error data supports, so it is now the classification rule rather than an aside.

**A swipe is classified by direction of intent, not by its zone set** (`src/stroke.js`):

- The axis is decided by which delta is larger — fingers crossed versus segments travelled. Equal deltas are a diagonal and are reported ambiguous rather than guessed at.
- For a lateral, **the level is taken from `first`**, not from the zone set: the landing is deliberate, the lift is where drift accumulates.
- **Extent is discarded.** Two zones and three zones in the same direction are the same command, extending the forgiveness rule of §2.1 to its logical end.

The payoff is concrete. Under the old zone-set rule a drifting `I2→M2→R1` produced `{I2,M2,R1}` — not one finger, not one level — and fell through to the chord catch-all, firing the wrong command or nothing. Under the new rule it is lateral L2 outward, which is what the hand meant. That case is a regression test.

The chord class is **parked**, not kept: with sloppy laterals no longer landing in it, "anything else" is no longer a safe definition, and bridged chords remain untested.

---

## 7. Resulting layout — v1

| | Zones |
| --- | --- |
| Index | `I1` `I2` `I3` |
| Middle | `M1` `M2` `M3` |
| Ring | `R1` `R3` — middle segment dropped (20% wrong) |
| Pinky | none as thumb targets |
| Palm | one pad, closed by curling ring and pinky inward |

**Eight thumb zones and one palm pad — nine lines against twelve**, and the pad is the §5.5 addition that restores true quasimodes. §5.1 called quasimodes unavailable and the safest known answer to mode error; §5.5 called the palm pad the highest value-per-gram addition available. The ergonomic finding that the pinky is poor as a thumb target but perfectly comfortable *curling to the palm* converts three mediocre wires into that pad.

This is the §7-of-`00-concept` test passing on its own terms: the vocabulary evidence and the hardware simplification point the same way.

Primitive count for v1: 8 taps + 8 holds + 6 longitudinal (I/M/R × 2) + 6 lateral (L1/L2/L3 × 2) = **28 before layering**, against 38 in v0 — a small loss of unusable signals in exchange for reliable ones. The modifier adds 26 more, for 54.

**The constraint that comes with it** — tested by hand after this was first written, and milder than predicted. Ring and pinky flexion share tendon slips, so curling the pinky to the palm does bring the ring along, but not far enough to bury it: with `P3` on the palm the ring stays **landable and stops being slidable**. The thumb can still reach `R1` and `R3` to tap or hold; it cannot slide along them.

So the modifier does not shrink the zone set. It removes one primitive class from one finger, and contact and travel have to be modelled separately to say so — a single "available zones" list cannot express it (`whileHeld` in `src/layout.js`, `performable()` in `src/stroke.js`).

**And discarding extent (§6) turns out to pay for itself here.** A lateral L1 is normally available as `I1→M1→R1`; with the ring curled that span is gone. But extent is not part of the command, so the same lateral is produced by `I1→M1`, which is entirely reachable. Every lateral survives the modifier. The shifted inventory is therefore **26 of the 28 base primitives — the ring's two longitudinal strokes, and nothing else.** That arithmetic is a test, not an estimate.

The design consequence is small but real: two strokes mean nothing while the pad is held, so the safest shifted bindings live on the index and middle core, which behaves identically in both states.

---

## 8. Still open

- **Everything timed needs re-running with a baseline.** The ordinal findings stand; the magnitudes do not.
- **The gripping condition was never run** — R4 is untested, and grip is the condition §3 expected to be decisive.
- **The palm pad is validated in one respect only.** What the curl leaves reachable is now known (§7). Still open: can it be held for seconds without fatigue, can it be closed without the thumb moving, and does it survive a hand that is already holding something — the very posture that occupies ring and pinky. This is a posture, not a thumb target, so the current trainer cannot test it; it needs a hold-and-act trial mode.
- **`M2` is the weakest survivor** at 13.3% wrong. It stays for now, but if the modifier layer needs index and middle to be watertight, it is the first thing to drop.
- **n = 1, one hand, unblinded.** Enough to kill a bad zone. Not enough to fix a tier ordering.
