# Loose ends

Things raised, agreed to be real, and not yet done or written down anywhere authoritative.
*Mostly 2026-08-25 → 08-31.*

---

## Instrument

**Baseline isn't a matched control.** It prompts `NOW`; a reach trial prompts a zone label like
`M3`, which has to be *read and decoded*. So the subtraction leaves `thumb travel + label decoding`,
not travel alone. Roughly constant across zones so it doesn't reorder anything — the ranking is
still fine — but the corrected numbers aren't pure reach.

Better control: show a real zone label in baseline too, with "don't move, just press". Then it's
literally *a reach trial with the reaching removed*, which is also an easier instruction to follow
correctly. Risk: some people will reflexively start moving, inflating the baseline and
over-subtracting. Tradeoff not obviously resolved. No comparability cost to changing it — no
baseline has been recorded yet.

**Flag sub-baseline trials.** One `R1→R3` came in at 88 ms, below physical possibility — a
double-press. Medians absorbed it, but anything faster than baseline should be marked rather than
silently averaged.

**Don't chase milliseconds.** The findings that moved the design were categorical — the monotonic
miss gradient, zero direction errors in 65 sweeps. Large and clean. A 15% timing difference at n=1,
one hand, unblinded will not survive a second person. **The discriminating power is in "did it land
wrong", not "how fast".** Design trials to produce categorical answers.

**`localStorage` is per browser origin.** A participant who runs blocks across two browsers, or
clears site data, loses earlier ones silently. Fine at handful-of-people scale where people export as
they go. Would bite at any real recruitment volume.

---

## Trials not yet run

**The grip block.** Still the next research step. Design it to answer three things at once:

- baseline first (40 s, and without it the timings are meaningless)
- reach, hidden + gripping, against **2–3 representative grips** — cylindrical (mug/handlebar),
  phone-in-hand, and hand-in-pocket. That last isn't a grip at all but it's *confinement*, which is a
  distinct constraint and one of the stated scenarios.
- the pad, tested by hand rather than by the trainer: can it be closed in each grip, held several
  seconds, and can the thumb reach I/M while it's closed.

**Free data while you're there:** note **where the thumb rests** in each grip. If it naturally sits
on `I1` or against the pad, that zone can't carry a binding, and the Midas problem in `§4` stops
being abstract. Cheapest engage data available without hardware.

**Prediction on the record:** under a cylindrical power grip the pad won't close — ring and pinky are
pressed against the object, not the palm. If so the modifier is a free-hand feature, not a
hands-busy one, and quasimodes come off the table for exactly the scenarios that motivate the device.
Probably not binary though: phone-in-hand curls them partly against the palm, a bag handle hooks the
fingers and leaves the palm free, a handlebar doesn't. So the real question is *which occupied-hand
postures keep the pad* — which maps onto which scenarios get the full vocabulary.

---

## Design threads

**"A core that works in every state" keeps recurring.** The modifier cost only 2 primitives because
extent is discarded, so laterals survive by being performed over a shorter span. Grip probably wants
the same shape: a core vocabulary that survives an occupied hand, plus extras that only exist when
it's free. If the pad dies under grip that's not a failure — it's the same structure one level up,
and better designed deliberately than discovered in the prototype.

**`M2` is the weakest survivor** at 13.3% wrong. Stays for now. First thing to drop if the modifier
layer needs index and middle watertight.

**Chords are parked, not kept.** With sloppy laterals no longer landing there, "anything else" isn't
a safe definition any more. Bridging remains untested. Also: extent being fully discarded means every
bridged chord that isn't a diagonal is now unreachable.

**Stroke termination when the thumb never lifts** (`§10`) — genuinely blocked on hardware, nothing
to do about it yet. Noting so it doesn't keep resurfacing as if it were actionable.

---

## Housekeeping

**CI doesn't run on pull requests.** `.github/workflows/pages.yml` triggers on push to `main` and
`workflow_dispatch` only, so the classifier tests and the standalone-staleness check run *after*
merge, not before. Two-line fix (add `pull_request` to the triggers) whenever it's wanted.
