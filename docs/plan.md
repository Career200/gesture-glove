# Plan

## Goal

Find out whether a cheap IMU ring can be a usable d-pad: four thumb-swipe directions and a tap, recognised reliably, with few enough accidental fires to wear it all day.

## Risks, in the order they're tested

Two things could kill this, and the cheaper one goes first.

1. **Ergonomics.** A ring that's uncomfortable, spins on the finger, catches on things or can't be found by the thumb is dead whatever the electronics can do. This needs no electronics to test: a dummy of the right size and weight answers it in days, and anyone can try one. It also settles where the housing sits on the finger and which way it faces, and sensor placement in step 2 depends on both.
2. **Sensing.** Whether an MPU-6050 on a ring can tell the swipe directions apart from friction and micro-vibration, and ignore everything else a hand does. A simulation can't answer that, so the sensing track starts with a small piece of hardware and builds the sims around the data it produces.

The interaction model (four directions and a tap) is mostly settled and runs on its own track.

Each step has a gate. If a gate fails, stop and rethink before going further.

## Ergonomics track

### 1. Dummy rings

- **Make:** a 3D-printed housing for the main compartment on a ring of bent wire, so the band fits any finger and can be resized in seconds. Print two housings:
  - **Prototype size:** the volume of the parts the first build will actually use, an ESP32-C3 SuperMini (about 22.5 × 18 mm), a GY-521 breakout (about 21 × 16 mm) and a small LiPo, stacked. This is the honest worst case.
  - **Target size:** what a bare MPU-6050 chip, a custom board and a coin-size battery could reach, roughly 20 × 15 × 8 mm. This is what the idea has to be worth wearing at.
  - Weight both to match their real parts, since weight is what makes a ring spin. Put a strip of copper tape on the swipe face so the surface feels like the real one.
- **Test:** wear each one for a full day of normal life: typing, cooking, carrying bags, holding a phone, washing hands. Do the four swipes and the tap on it eyes-free throughout. Hand them to a few other people too, since they're cheap to make and need no explanation.
- **Answers:** which phalanx it sits on, which way the face points, whether it rotates out of reach, whether it catches or gets in the way of gripping, whether the thumb finds the face and its edges by feel, and how big is too big.
- **Gate:** at least the target-size dummy can be worn all day without wanting to take it off, and the thumb finds the swipe face without looking. If only the prototype size fails, carry on: the prototype just has to be tolerated on the bench.

## Sensing track

### 2. Bench spike

- **Do:** mount an MPU-6050 breakout where step 1 put the housing, wire it to an ESP32 dev board, and stream raw accelerometer and gyro data over serial while doing labelled swipes and taps.
- **Cost:** under $10 in parts, about an afternoon.
- **Gate:** the four directions are visibly separable in the raw or lightly filtered signal. If they aren't, revisit the sensing approach (sensor placement, a different sensor, or adding contact geometry) before anything below.

### 3. Trace recorder and labeller

- **Do:** build a small browser or Python tool that captures sessions with gesture labels and contact-pad state and saves them as files.
- **Produces:** the trace format that every later step reads, so settle it here.
- **Gate:** a labelled set of at least a few hundred gestures, recorded across more than one sitting.

### 4. Signal playground

- **Do:** replay traces, plot them, and tune the filters offline (a low band for macro hand motion, a high band for swipe vibration) along with the classifier.
- **Produces:** a confusion matrix over the four directions and the tap. This is where the dual-frequency idea from the pitch gets tested.
- **Gate:** direction accuracy good enough that a wrong command is rare. Set the number once real data exists.

### 5. False-fire sim

- **Do:** record hours of everyday traces (walking, typing, holding a mug, gesturing while talking) and run them through the gated classifier.
- **Produces:** false fires per hour. This is the number that decides whether the ring is wearable, and it matters more than accuracy.
- **Gate:** a false-fire rate low enough to live with. If it's too high, the contact gate or the engage gesture needs rework.

## Interaction track

This track runs in parallel with the others, because it doesn't depend on them.

### 6. Interaction sim (browser)

- **Do:** use arrow keys or a touchpad as a stand-in for the ring, driving a schematic target such as a media player, a notification stack or an AR-style menu.
- **Answers:** what tap and hold mean, whether a modifier is needed, and how the roughly eight commands real jobs need map onto four directions.
- **Input:** before designing the bindings, count the commands that real scenarios actually need.

## Convergence

### 7. End-to-end HID demo

- **Do:** pair the ESP32-C3 as a BLE keyboard sending arrow and media keys to a phone or laptop, first from a physical button and then from the step 4 classifier.
- **Gate:** it works with an ordinary device and no app. This is the first thing worth showing to someone else.

## Open decisions

- The trace file format (step 3).
- The accuracy and false-fire thresholds for steps 4 and 5. Set them once the step 2 data shows what's realistic.
- Whether the repository gets renamed from `gesture-glove`.
