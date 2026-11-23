# Pitches

The same device described for three audiences. Two drafts are kept because they differ in emphasis, and neither has won yet.

---

## Draft A

### Function (users, UX designers, ecosystem partners)

A discreet, universal remote for your digital life that lives on your finger. By turning your ring into a tactile, eyes-free D-pad, you can navigate AR interfaces, control media, and manage notifications using subtle thumb swipes and taps — without pulling out your phone, waving your arms in public, or speaking to a voice assistant. It pairs over standard Bluetooth HID, working out of the box with any screen or headset without proprietary apps.

### Hardware (engineers, investors, manufacturers)

An ultra-low-cost, power-sipping wearable HID controller that achieves multi-axis gesture recognition without expensive capacitive touch arrays or optical sensors. By combining a standard 6-axis IMU with differential copper-tape touch gating and dual-frequency signal filtering, the architecture extracts directional thumb swipes, taps, and macro hand movements from surface friction and micro-vibrations. Built on commodity silicon (ESP32-C3 + MPU-6050), it delivers weeks of battery life and a sub-$15 bill of materials at prototype scale.

---

## Draft B

### Function

A tiny wearable directional controller: a ring worn on the finger that lets you issue discreet, eyes-free commands by moving your thumb. Always available, requiring no dedicated touchpad or screen. Essentially, a D-pad you wear.

### Design / UX research

Exploring a persistent, body-worn input method built around thumb-to-finger interaction. The project investigates tactile interaction, eyes-free control, gesture recognition, accidental-input prevention, and the design of a minimal command vocabulary that works across different contexts and devices.

### Hardware / software

A finger-worn controller combining an MPU-6050 IMU with contact sensing. Contact establishes intentional input; accelerometer and gyroscope data classify directional thumb movements. A microcontroller interprets the gestures and transmits commands wirelessly to a connected device, with optional haptic feedback.
