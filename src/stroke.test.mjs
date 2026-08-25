import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, notate, strokeFrom, HOLD_MS } from "./stroke.js";

const s = (zones, ms = 200) => strokeFrom(zones, ms);

test("single contact is a tap below the hold threshold", () => {
  assert.equal(classify(s(["I2"], 120)).kind, "tap");
  assert.equal(classify(s(["I2"], 120)).zone, "I2");
});

test("single contact becomes a hold at the threshold", () => {
  assert.equal(classify(s(["I2"], HOLD_MS)).kind, "hold");
});

test("within-finger sweep is longitudinal, direction from first to last", () => {
  const out = classify(s(["I1", "I2", "I3"]));
  assert.equal(out.kind, "longitudinal");
  assert.equal(out.finger, "I");
  assert.equal(out.dir, "out");
  const back = classify(s(["I3", "I2", "I1"]));
  assert.equal(back.dir, "in");
});

test("the forgiveness rule holds: two adjacent zones equal the full run", () => {
  const short = classify(s(["I1", "I2"]));
  const full = classify(s(["I1", "I2", "I3"]));
  assert.equal(notate(short), notate(full));
});

test("cross-finger sweep is lateral, level taken from the landing zone", () => {
  const c = classify(s(["I1", "M1", "R1"]));
  assert.equal(c.kind, "lateral");
  assert.equal(c.level, 1);
  assert.equal(c.dir, "toPinky");
});

test("a drifting lateral still resolves to the intended command", () => {
  // The measured failure: an intended L2 sweep whose tail slips to R1.
  const clean = classify(s(["I2", "M2", "R2"]));
  const drifted = classify(s(["I2", "M2", "R1"]));
  assert.equal(notate(clean), notate(drifted), "drift must not change the command");
  assert.equal(drifted.level, 2);
});

test("extent is discarded — a two-finger and three-finger sweep agree", () => {
  assert.equal(notate(classify(s(["I1", "M1"]))), notate(classify(s(["I1", "M1", "R1"]))));
});

test("inward and outward laterals are distinct", () => {
  assert.notEqual(notate(classify(s(["I1", "M1"]))), notate(classify(s(["M1", "I1"]))));
});

test("a true diagonal is reported ambiguous rather than guessed", () => {
  assert.equal(classify(s(["I1", "M2"])).kind, "ambiguous");
});

test("empty stroke is inert", () => {
  assert.equal(classify(s([])).kind, "empty");
});

/* --- reachability under the palm-pad modifier (measured by hand 2026-08-25) --- */
import { performable } from "./stroke.js";
import { LAYOUTS } from "./layout.js";

const v1 = LAYOUTS.v1;
const held = { modifierHeld: true };

test("v1 excludes the pinky and the ring middle segment as thumb targets", () => {
  assert.equal(performable(classify(s(["P1"], 100)), v1), false);
  assert.equal(performable(classify(s(["R2"], 100)), v1), false);
  assert.equal(performable(classify(s(["R1"], 100)), v1), true);
});

test("holding the palm pad leaves the ring landable", () => {
  assert.equal(performable(classify(s(["R1"], 100)), v1, held), true);
  assert.equal(performable(classify(s(["R3"], 500)), v1, held), true, "holds too");
});

test("holding the palm pad costs the ring its sweeps", () => {
  const ringSweep = classify(s(["R1", "R3"]));
  assert.equal(performable(ringSweep, v1), true, "available in the base state");
  assert.equal(performable(ringSweep, v1, held), false, "gone while the pad is held");
});

test("index and middle keep everything while the pad is held", () => {
  assert.equal(performable(classify(s(["I1", "I3"])), v1, held), true);
  assert.equal(performable(classify(s(["I1", "M1"])), v1, held), true);
  assert.equal(performable(classify(s(["I3", "M3"])), v1, held), true);
});

test("discarding extent is what saves the laterals under the modifier", () => {
  // An M1→R1 sweep is unperformable with the ring curled, but extent is not
  // part of the command: the same class is produced by I1→M1, which is. So no
  // lateral is lost to the modifier — only the ring's longitudinal pair is.
  const lateral = classify(s(["M1", "R1"]));
  assert.equal(lateral.kind, "lateral");
  assert.equal(performable(lateral, v1), true);
  assert.equal(performable(lateral, v1, held), true);
  assert.equal(notate(lateral), notate(classify(s(["I1", "M1"]))), "same command, reachable span");
});

test("the modifier costs exactly the ring's two longitudinal strokes", () => {
  const all = [
    ...["I1","I2","I3","M1","M2","M3","R1","R3"].flatMap(z => [s([z],100), s([z],500)]),
    s(["I1","I3"]), s(["I3","I1"]), s(["M1","M3"]), s(["M3","M1"]), s(["R1","R3"]), s(["R3","R1"]),
    s(["I1","M1"]), s(["M1","I1"]), s(["I2","M2"]), s(["M2","I2"]), s(["I3","M3"]), s(["M3","I3"]),
  ].map(x => classify(x));
  const base = all.filter(c => performable(c, v1)).length;
  const shifted = all.filter(c => performable(c, v1, held)).length;
  assert.equal(base, 28, "v1 base inventory");
  assert.equal(base - shifted, 2, "only R longitudinal in/out is lost");
});
