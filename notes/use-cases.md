# Use cases — who is this actually for

*2026-08-31, after talking to a couple of bikers.*

Their ideas: intercom control, video playback. Their objection: **"who would actually wear this?
Not fashionable, not style-able."**

---

## The objection is better than it sounds

It isn't "who'd wear a glove" — bikers already wear gloves. It's:

> the competitor isn't a bare hand, it's **the gloves they already own and chose**

Nobody swaps £150 of armoured leather for a worse glove with buttons on it. That's a much harder
competitor than "nothing", and the concept doc has never named it.

Related thing the docs conflate: `00-concept §2` sells "no gesture anyone else can see" — but
that's about *operation*, not the *device*. A silent gesture on a conspicuous object is still
conspicuous. Google Glass didn't die of bad gestures. Two separate exposures, treated as one.

## Reframe

Stop hunting for people who'd adopt a new glove. **Find people already wearing one**, where the
glove isn't a fashion choice at all.

Two filters, and they don't cut the same way:

1. **already gloved** → kills the fashion objection
2. **glove thin enough that thumb-to-finger landmarks survive** → keeps the mechanism working

## Bikers may be a trap

Pass filter 1, fail filter 2. Motorcycle gloves are thick, stiff, often armoured over the knuckles.
The whole eyes-free claim rests on `01-vocabulary §1.1` — knuckle creases as hard tactile
landmarks — and now you're feeling them through two layers of padded leather with reduced thumb
opposition. Plus hands wrapped around bars, which is the unresolved grip question in its worst form.

Worth being deliberate: bikers are who we *have access to*, and that's exactly how a project ends
up optimising for its most available users rather than its best-fit ones.

**Cyclists pass both filters much better.** Thin gloves or none, freer thumbs, same jobs. If the
biker thread continues, push it toward cycling.

## Candidates, roughly ranked by how well they survive both filters

- **Industrial — warehouse picking, field service, logistics.** Gloves issued, so fashion is nobody's
  concern; employer buys, which beats a consumer aesthetic judgement. Hands full by definition.
  Incumbent worth studying: **voice picking is an established industry** — proves the need is real,
  and gives something concrete to beat (fails in noise, slow, poor for non-native speakers).
  Probably the strongest commercial fit.
- **Cold-weather outdoor.** Gloves already on, touchscreen already dead. Cleanest "everything else
  fails" case available.
- **Accessibility.** Speech impairment, tremor, low vision — eyes-free silent input isn't a nicety,
  it's the only channel. Note this *inverts* the project's stated weakness: zero discoverability
  matters far less when the alternative is nothing. Underserved. Possibly the most honest fit.
- **Head-mounted displays.** Already in `§2`. Still the long game; that input problem is genuinely
  unsolved. Future market, not a first one.
- **Cycling** — see above.
- **Motorcycling** — the one we have contact with, and probably the hardest.

Not yet thought through: medical/sterile (nitrile is the thinnest glove there is, and surgeons
genuinely can't touch controls — but regulated, and the sterile glove can't *be* the device, so it'd
need a sensor liner underneath); military/tactical (gloves already worn, silent signalling already
a practice, hard market); live music (hands busy, and musicians buy weird controllers happily).

## The thing that actually jumped out

Intercom + playback = talk, vol up, vol down, next, prev, play/pause, answer, reject.
**Eight commands.**

v1 offers 28 primitives, 54 with the modifier.

Hunch, needs checking: **every use case people volunteer unprompted lands in the 6–12 range.**
Nobody spontaneously asks for thirty.

If that holds it undercuts the founding bet. `README` says a small vocabulary "made contextual and
layered, can carry a large command set" — but if no real job wants a large command set, then the
layering, the modifier and most of the zone grid are solving a problem nobody has. And it points
straight at the touchpad question in `form-factor.md`: eight commands fit on a d-pad and a tap.

## What would settle it

Desk work, no hardware. Interview 3–4 more people across *different* scenarios — not more bikers.
Ask only: **"what would you actually want to do, right now, in that moment?"** Then count.

If everyone says eight, the design gets much smaller and much more buildable. That's a good outcome,
not a defeat.
