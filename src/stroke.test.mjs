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
