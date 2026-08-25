/**
 * L1 — stroke classification. One pure function, no DOM, no framework.
 *
 * A stroke begins when the thumb contacts any zone and commits when it lifts
 * clear of all of them (01-vocabulary.md §2).
 *
 * @typedef {{ zones: string[], first: string, last: string, ms: number }} Stroke
 */

import { fingerIndex, segment } from "./layout.js";

export const HOLD_MS = 350;

/**
 * Swipes are classified by *direction of intent*, not by the zone set.
 *
 * The 2026-08-25 trials showed that a sweep's endpoints drift — an intended
 * `I2→M2→R2` lands on R1 about a fifth of the time — while its direction never
 * does (65 transitions, zero direction errors). So extent is discarded and the
 * axis is decided by which delta is larger, exactly as a d-pad would.
 *
 * The consequence: a sloppy sweep degrades into the right command instead of
 * falling through to the chord catch-all, which is what the old zone-set rule
 * did with `{I2,M2,R1}`.
 */
export function classify(stroke, { holdMs = HOLD_MS } = {}) {
  const { zones, first, last, ms } = stroke;
  const set = [...new Set(zones)];

  if (set.length === 0) return { kind: "empty" };

  if (set.length === 1) {
    return { kind: ms >= holdMs ? "hold" : "tap", zone: set[0], ms };
  }

  const df = fingerIndex(last) - fingerIndex(first);
  const ds = segment(last) - segment(first);

  if (Math.abs(ds) > Math.abs(df)) {
    return {
      kind: "longitudinal",
      finger: first[0],
      level: segment(first),
      dir: ds > 0 ? "out" : "in",
      span: Math.abs(ds),
      ms,
    };
  }

  if (Math.abs(df) > Math.abs(ds)) {
    // Level comes from `first`: the landing is deliberate, the lift is where
    // the drift accumulates.
    return {
      kind: "lateral",
      level: segment(first),
      dir: df > 0 ? "toPinky" : "toIndex",
      span: Math.abs(df),
      ms,
    };
  }

  // Equal deltas — a diagonal. Genuinely ambiguous, so it is not guessed at.
  // Bridged chords (§2.1) also land here and are deliberately unassigned.
  return { kind: "ambiguous", first, last, ms };
}

/** Stable string form, for binding tables and logs. */
export function notate(c) {
  switch (c.kind) {
    case "tap":  return `tap ${c.zone}`;
    case "hold": return `hold ${c.zone}`;
    case "longitudinal": return `${c.finger}·long·${c.dir}`;
    case "lateral": return `L${c.level}·lat·${c.dir === "toPinky" ? "→P" : "→I"}`;
    default: return c.kind;
  }
}

/** Build a Stroke from an ordered contact log — the shape L0 emits. */
export function strokeFrom(contacts, ms) {
  return { zones: [...contacts], first: contacts[0], last: contacts[contacts.length - 1], ms };
}
