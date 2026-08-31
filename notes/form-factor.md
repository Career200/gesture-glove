# Form factor — is this a glove, and is it zones

*2026-08-31, prompted by an Apple TV remote feeling extremely nice.*

## Is this just a tiny wearable touchpad?

Closer than it looks, and **the data pushed it that way**. The trials concluded: extent discarded,
level from `first`, direction as the classification, zero direction errors in 65 sweeps against
routine positional drift. That *is* "position unreliable, direction reliable" — the premise a
touchpad is built on. The v1 grammar is already a d-pad with taps attached.

### The real axis isn't discrete vs continuous

It's **absolute addressing vs relative motion.**

- Touchpad: only knows which way and how far the thumb moved.
- Glove: knows *where the thumb is* — and can only do that eyes-free because the knuckle creases are
  hard landmarks. A blank pad has none; you can't know where your thumb is on it without looking.

Keyboard vs mouse. Absolute lets you jump straight to the seventh thing; relative makes you traverse
or wrap it in modes — and `§5` is clear that modes without continuous feedback are the dangerous path.

### Touchpad wins

- **It answers the question the grammar can't.** `00-concept §8`: continuous quantities (volume,
  scrub, zoom) "have no home in a discrete stroke model, and it is not obvious a single contactor
  can produce one." Carried as unresolved since day one. A pad solves it natively. Strongest argument
  in its favour, not close.
- Fewer signals to learn, borrowed muscle memory. Real, given the admitted price is zero
  discoverability.

### Touchpad loses

- **Signal count.** v1: 28 before layering. A pad on one phalanx: 4 directions + tap + hold + maybe
  long-vs-short ≈ 8–10. Reaching thirty from ten means modes.
- **Hardware.** `§6` is the project's own tiebreaker — nine sense lines, two electrodes, no
  controller. A capacitive pad needs a sensing matrix and analog front end. Inverts the core
  principle.

### …but hold that hardware argument loosely

Suspicion, unverified: **`§6` may be optimistic.** Contact sensing through conductive fabric is
noisier than "twelve wires and any MCU" suggests — contact resistance through fabric under varying
pressure, sweat, wear. If it turns out to need a capacitive touch controller to read the zones
reliably, the hardware gap between zones and a pad mostly evaporates, and one of the two main
arguments for zones goes with it.

**Check this before leaning on §6 again.** It's load-bearing for the whole "hardware stays trivial"
story.

### Confound worth naming

The Siri remote feels good *partly because it's a remote*. The hand wraps a rigid object that braces
and positions the thumb; the thumb is otherwise unoccupied; the surface doesn't move relative to it.
A pad on your own finger has none of that — compliant surface, moves with the hand, no bracing.

Cheap test, no electronics: tape something smooth over the index proximal + middle phalanges, try
the same swipes. Still nice → real signal. Not nice → the feeling belonged to the remote.

Also: **the Siri remote is already a hybrid** — directional click regions (absolute) *plus* swipe
(relative). Apple didn't pick one. That's suggestive.

### Why this doesn't need deciding yet

`00-concept §4` already covers it: a touchpad is an **L0 swap**. The stroke abstraction and the
classifier take a path and quantize it to direction + region; they don't care whether it came from
twelve electrodes or a capacitive surface. Every grammar decision survives the change. Architecture
doing its job.

Likely landing point (guess): **zones for addressing, a small pad for the continuous quantities that
currently have no home.** But it's a guess, and the grip block is what earns it.

---

## Does it have to be a glove at all?

If the mechanism is thumb-to-finger contact, the form is open:

- finger sleeves, no palm
- partial / fingerless glove
- **rings** — contact pads on finger rings plus a thumb ring

Rings are *jewellery*. People already wear them, smart rings are an established category, and
"not style-able" stops applying the moment it reads as jewellery rather than equipment.

Worth separating from the interaction work: the bikers may have been objecting to **gloves**, not to
the idea. Cheap to probe — ask the next person the same question about a ring set and see if the
objection survives.

Open: does a ring set preserve the landmarks? The creases are on the *fingers*, and rings sit
between joints — possibly fine, possibly it destroys exactly the tactile reference the whole thing
depends on. Untested, and it's the first question to ask of that form.
