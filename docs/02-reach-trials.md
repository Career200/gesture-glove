# Reach Trials — measuring the cost table

Status: **run once, 2026-08-25.** Results and verdicts in [`03-findings-01.md`](03-findings-01.md).

Three things this protocol got wrong, now fixed in the tool:

1. **No baseline block.** Reaction-time overhead swamped the measurement — the whole hand spanned 1.33×, and every zone tiered 1–2. There is now a **baseline mode** (§3), and it must be run first.
2. **Binary hit/miss.** It recorded zero errors across 65 sweeps that were felt as imprecise, because "arrived, but sloppily" had no key. There is now a third response, <kbd>C</kbd>.
3. **R1 was written assuming a finger fails uniformly.** It didn't: `P2` failed and `P3` was among the best zones on the hand. Rules that act on a whole finger need per-zone evidence, and comfort — which decided the pinky in the end — was never something these trials measured.

---

## 1. Why this comes before the browser prototype

`01-vocabulary.md` §3 says the reach-cost ranking is "the prototype's first real job to falsify." It cannot be. Reach cost is a property of a thumb crossing a palm — of opposition mechanics, finger flexion and travel distance. Four fingers on three keyboard rows is a *different biomechanical task* that happens to share a 4×3 shape. A keyboard rig would measure typing, and would measure it with fingers the real device does not use.

The reach table is measurable today, on a bare hand, with a pen. It should be measured first, because three downstream decisions are currently blocked on a guess:

- **§1.1, bolded: "Ring and pinky are hard to reach — exclude?"** This decides whether the glove has twelve zones or six, and by §6 that is a direct hardware simplification. Under the project's core principle it is the highest-value question on the list.
- **§7's binding table** — flagged "not a fan" — assigns commands in inverse proportion to costs that are, at present, invented.
- **§3's swipe claims**: that lateral L1 is "plausibly the single most natural motion available," and that lateral L3 is "unreliable" and "impossible while gripping." Both are stated as hypotheses and both are cheap to test.

None of this needs hardware, a recognizer, or a binding layer. It needs a stopwatch and a protocol.

---

## 2. Setup

**Set the glove hand first.** It selects the response keys and is stored with every block. Trials from a left hand and a right hand are separate datasets, and the tool keeps them apart.

**Mark the hand.** One pen dot per phalanx, centred between the creases — twelve dots, matching the `<finger><segment>` notation. Ink on skin is a fair stand-in here: the trial measures whether the thumb can *travel to and land on* a location, and the knuckle creases (the actual landmarks, per §1.1) are present either way.

**Define neutral.** Hand relaxed, thumb resting alongside the index, touching no zone. The thumb returns to neutral between every trial. Without a fixed origin, travel distance varies per trial and the timings mean nothing.

**Non-glove hand on the keyboard.** <kbd>Space</kbd> when the thumb lands cleanly, <kbd>K</kbd> if you got there but had to hunt or drifted, <kbd>M</kbd> if you landed on the wrong zone — those fall under a right hand, which is the one free when the glove is on the left. With the glove on the right, <kbd>C</kbd> and <kbd>X</kbd> are the equivalents. Both sets are always live; the *Glove hand* setting only decides which pair is shown, and it is recorded with the results because left and right hands cannot be pooled.

**Where the clock runs.** In a reach trial it runs from the zone appearing to the keypress, so the thumb is travelling under time. In a transition trial getting into the starting position is untimed — a first <kbd>Space</kbd> starts the clock once the thumb is settled, and a second stops it on arrival — so what comes out is the sweep itself rather than the sweep plus its setup. The middle key matters more than it looks: sweeps almost never land *wrong*, they land *approximately*, and that distinction is what set the grammar (§6 of the findings).

---

## 3. Blocks

Reach mode, 5 reps × 12 zones = 60 trials, roughly two minutes each:

| # | Hand | Grip | What it answers |
|---|------|------|-----------------|
| B | — | — | **Baseline. Run first, every session.** The thumb does not move: the screen flips from `wait` to `NOW`, you press. Measures reaction plus keypress on its own, so it can be subtracted from the other blocks and leave the movement. Without it the timings are uninterpretable. |
| 0 | visible | free | **Warm-up — discard.** |
| 1 | visible | free | Baseline travel cost, no findability component. |
| 2 | hidden | free | The real deployment condition. Difference from block 1 isolates *findability* from *travel*. |
| 3 | hidden | gripping | §3's suspicion that reach collapses when the hand holds something. |

Then transition mode, 3 reps × 13 pairs, hidden + free and hidden + gripping. The pairs are curated: each one corresponds to a specific claim in §3, and the tool prints the claim alongside the prompt.

Run blocks in a different order on a second session. A single-session ordering confounds fatigue and learning with the thing being measured.

---

## 4. What the numbers are and are not

Timing runs from prompt paint to keypress, so every trial carries the same reaction-time and keypress overhead. That is a **constant additive offset**: it inflates absolute milliseconds and compresses ratios, but it does not reorder anything. **The ranking is the result. The absolute values are not.**

The first run showed how badly this bites when the offset is left in: a 1.33× spread across the entire hand, with every zone tiering 1–2. Subtracting a measured baseline is not a refinement, it is what makes the timing column mean anything. The tool now does it, and rejects a baseline sitting at or above the median trial time — the signature of one carried over from another session.

Miss rate is the independent signal, and often the more important one. A zone that is slow but reliable is a different design problem from a zone you cannot find — the first costs time, the second costs a wrong command. The tool flags any target with a miss rate ≥ 20%.

Tiers are assigned by median ratio to the fastest target (≤1.15× → 1, ≤1.40× → 2, ≤1.75× → 3, ≤2.20× → 4, above → 5), which reproduces the five-tier shape of §3 so the tables can be compared directly.

---

## 5. Decision rules — fix these before looking at the data

Written in advance on purpose. This is a single subject, on their own hand, who knows what the hypotheses are; the rules are what stop the results being read to agree with §3.

- **R1 — pinky.** If every pinky zone lands in tier 4–5, or any exceeds 20% miss rate in block 2 (hidden), drop the pinky column. Twelve zones become nine, and §6's wiring drops with it.
- **R2 — ring.** Same test applied to `R1`–`R3`. Partial survival is a real outcome: `R1` and `R2` surviving while `R3` fails is consistent with §3's guess and would mean ten zones, not twelve.
- **R3 — lateral L1 primacy.** §3 spends the cheapest motion on Back/Forward on the strength of `I1→P1` being the most natural sweep available. If its median exceeds `I1→I3` (longitudinal index), that claim is false and §7's navigation bindings move.
- **R4 — lateral L3.** If `I3→R3` exceeds 25% miss rate under grip, lateral L3 is not a usable primitive class and comes out of §2.1's inventory — which drops the 38-primitive count.
- **R5 — the table itself.** Whatever the tiers come out as, they replace §3 wholesale, and §7 is rewritten against them rather than patched.

A result that contradicts §3 is the good outcome. §3 is a guess written to be replaced, and the tiers were assigned from opposition mechanics rather than measurement — that is exactly the kind of reasoning that is confidently wrong about the ring finger.

---

## 6. Known limitations

- **n = 1, unblinded.** Enough to kill an obviously bad zone; not enough to publish. The pinky question only needs the first.
- **Pen dots are not fabric pads.** Real pads have area, and a pad the thumb can *graze* is easier to hit than a point it must land on. Miss rates here are therefore pessimistic — which is the safe direction for an exclusion decision.
- **No stroke termination.** Trials measure acquisition, not the open question of how a stroke ends when the thumb never lifts (§10). That needs hardware.
- **Grip condition is one object.** A mug is not a bike handlebar is not a phone. Treat block 3 as existence proof, not coverage.

---

## 7. Output

The tool keeps blocks in `localStorage` and pools them by condition. Two exports:

- **JSONL, one line per trial** — matching the instrumentation commitment in §9, so the analysis path is the same one the prototype will use later.
- **CSV, per-target summary** — median, IQR, miss rate, ratio, tier.

Commit both under `data/`, with the date and which hand. The measured table lands in §3; this document records how it was obtained.
