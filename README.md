# Thumb Ring

*A D-pad you wear: a ring on the index finger, operated by the thumb, eyes-free.*

---

A ring on the index finger. Swipe the thumb across it in one of four directions, or tap it. That's the whole vocabulary. It pairs as a standard Bluetooth HID device, so anything that accepts arrow keys or media keys already understands it, with no app needed.

Sensing is deliberately cheap: a 6-axis IMU (MPU-6050) picks up the friction and micro-vibration of the thumb moving across the ring, and a copper-tape contact pad gates it, so motion only counts while the thumb is on the ring. An ESP32-C3 classifies the gesture and sends a keypress.

Pitches for different audiences are in [`docs/pitches.md`](docs/pitches.md).

## Where this came from

The project started as a **gesture glove**: a thin glove with twelve contact zones, one on each phalanx of the four fingers, with the thumb as the only contactor and a stroke grammar meant to give a small physical vocabulary a large, layered command set. One round of reach trials changed the design more than expected. The thumb never got a swipe's *direction* wrong in 65 sweeps, but it regularly got the *extent* wrong. Positional accuracy depended on tactile landmarks, not on how far the thumb had to travel. As the trial notes put it, the basic case "is just a d-pad". Talking to potential users then raised two objections the grid couldn't answer. Nobody wants to wear a new glove, and every job people suggested without prompting needed about eight commands, not the 28–54 the layered grammar offered. A glove is equipment and a ring is jewellery, and direction plus tap covers the commands people actually asked for. So the plan now is to build the plainer thing and find out whether it's enough. The full glove work (concept, vocabulary, trial rig, raw data and findings) is preserved at tag [`glove-v1`](../../tree/glove-v1).

Lessons that carry over:

- **Direction is reliable, position isn't.** This is the reason for the pivot, and it stays the basis of the classifier.
- **Count the commands a real job needs** before designing a vocabulary for it.
- **Accidental input is the hard problem** for anything worn all day. That is why contact gating is part of the design from the start.

## Status

Concept only. No hardware, no code yet. The next steps are in [`docs/plan.md`](docs/plan.md).
