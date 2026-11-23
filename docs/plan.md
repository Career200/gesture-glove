# Plan

## Goal

Find out whether a cheap IMU ring can be a usable d-pad: four thumb-swipe directions and a tap, recognised reliably, with few enough accidental fires to wear it all day.

## Main risk

The main risk is sensing, not the interaction model. Four directions and a tap is mostly settled. What nobody knows yet is whether an MPU-6050 on a ring can tell the swipe directions apart from friction and micro-vibration, and ignore everything else a hand does. A simulation can't answer that, so the plan starts with a small piece of hardware and builds the sims around the data it produces.

## Sensing track

Each step has a gate. If a gate fails, stop and rethink before going further.

### 1. Bench spike

- **Do:** tape an MPU-6050 breakout to the index finger, wire it to an ESP32 dev board, and stream raw accelerometer and gyro data over serial while doing labelled swipes and taps.
- **Cost:** under $10 in parts, about an afternoon.
- **Gate:** the four directions are visibly separable in the raw or lightly filtered signal. If they aren't, revisit the sensing approach (sensor placement, a different sensor, or adding contact geometry) before anything below.

### 2. Trace recorder and labeller

- **Do:** build a small browser or Python tool that captures sessions with gesture labels and contact-pad state and saves them as files.
- **Produces:** the trace format that every later step reads, so settle it here.
- **Gate:** a labelled set of at least a few hundred gestures, recorded across more than one sitting.

### 3. Signal playground

- **Do:** replay traces, plot them, and tune the filters offline (a low band for macro hand motion, a high band for swipe vibration) along with the classifier.
- **Produces:** a confusion matrix over the four directions and the tap. This is where the dual-frequency idea from the pitch gets tested.
- **Gate:** direction accuracy good enough that a wrong command is rare. Set the number once real data exists.

### 4. False-fire sim

- **Do:** record hours of everyday traces (walking, typing, holding a mug, gesturing while talking) and run them through the gated classifier.
- **Produces:** false fires per hour. This is the number that decides whether the ring is wearable, and it matters more than accuracy.
- **Gate:** a false-fire rate low enough to live with. If it's too high, the contact gate or the engage gesture needs rework.

## Interaction track

This track runs in parallel with the sensing track, because it doesn't depend on it.

### 5. Interaction sim (browser)

- **Do:** use arrow keys or a touchpad as a stand-in for the ring, driving a schematic target such as a media player, a notification stack or an AR-style menu.
- **Answers:** what tap and hold mean, whether a modifier is needed, and how the roughly eight commands real jobs need map onto four directions.
- **Input:** before designing the bindings, count the commands that real scenarios actually need.

## Convergence

### 6. End-to-end HID demo

- **Do:** pair the ESP32-C3 as a BLE keyboard sending arrow and media keys to a phone or laptop, first from a physical button and then from the step 3 classifier.
- **Gate:** it works with an ordinary device and no app. This is the first thing worth showing to someone else.

## Open decisions

- The trace file format (step 2).
- The accuracy and false-fire thresholds for steps 3 and 4. Set them once the step 1 data shows what's realistic.
- Whether the repository gets renamed from `gesture-glove`.
