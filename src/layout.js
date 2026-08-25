/**
 * Zone layout — the single source of truth for which contacts exist.
 *
 * L0 of the architecture in 00-concept.md §4. The trainer and the interaction
 * prototype both import this; nothing else may hard-code a zone list.
 */

export const FINGERS = ["I", "M", "R", "P"];
export const FINGER_NAME = { I: "index", M: "middle", R: "ring", P: "pinky" };
export const SEGMENT_NAME = { 1: "proximal", 2: "middle", 3: "distal" };

export const fingerIndex = z => FINGERS.indexOf(z[0]);
export const segment = z => +z[1];
export const zoneName = z => `${FINGER_NAME[z[0]]} ${SEGMENT_NAME[z[1]]}`;

/**
 * A layout names its zones and whether a palm pad exists. The palm pad is not
 * a thumb target: it is closed by curling ring and pinky inward, which makes it
 * the only contact that can be *held* while the thumb acts elsewhere.
 */
export const LAYOUTS = {
  v0: {
    id: "v0",
    name: "v0 — 12 zones, three per finger",
    note: "The original sketch. Measured 2026-08-25; see docs/03-findings-01.md.",
    segments: { I: [1, 2, 3], M: [1, 2, 3], R: [1, 2, 3], P: [1, 2, 3] },
    palmPad: false,
  },
  v1: {
    id: "v1",
    name: "v1 — 8 zones + palm modifier",
    note: "Middle segments dropped where they proved unfindable; pinky reassigned to the palm pad.",
    segments: { I: [1, 2, 3], M: [1, 2, 3], R: [1, 3], P: [] },
    palmPad: true,
    /**
     * What survives while the palm pad is held, measured by hand 2026-08-25.
     *
     * Curling the pinky to the pad brings the ring with it, but not far enough
     * to bury it: the ring stays *landable* and stops being *slidable*. So the
     * modifier does not shrink the zone set — it removes a primitive class from
     * one finger. Contact and travel have to be modelled separately because of
     * this; a single "available zones" list cannot express it.
     */
    whileHeld: {
      name: "palm pad held (ring and pinky curled)",
      contact: ["I1", "I2", "I3", "M1", "M2", "M3", "R1", "R3"],
      sweepFingers: ["I", "M"],
    },
  },
};

export const DEFAULT_LAYOUT = "v1";

/** Every thumb-reachable zone in a layout, ordered index→pinky, proximal→distal. */
export function zonesOf(layout) {
  return FINGERS.flatMap(f => (layout.segments[f] || []).map(s => f + s));
}

/** Does the layout contain this zone? */
export const hasZone = (layout, z) => (layout.segments[z[0]] || []).includes(segment(z));

/**
 * Transition pairs worth timing, derived from the layout: every within-finger
 * sweep, and every same-level lateral between adjacent fingers plus the full
 * span at that level. Both directions throughout.
 */
export function pairsOf(layout) {
  const pairs = [];
  const push = (from, to, note) => pairs.push({ from, to, note });

  for (const f of FINGERS) {
    const segs = layout.segments[f] || [];
    if (segs.length >= 2) {
      const lo = f + segs[0], hi = f + segs[segs.length - 1];
      push(lo, hi, `longitudinal ${FINGER_NAME[f]}, outward`);
      push(hi, lo, `longitudinal ${FINGER_NAME[f]}, inward`);
    }
  }

  for (const level of [1, 2, 3]) {
    const present = FINGERS.filter(f => (layout.segments[f] || []).includes(level));
    for (let i = 0; i + 1 < present.length; i++) {
      const a = present[i] + level, b = present[i + 1] + level;
      push(a, b, `lateral L${level}, adjacent, toward pinky`);
      push(b, a, `lateral L${level}, adjacent, toward index`);
    }
    if (present.length > 2) {
      const a = present[0] + level, b = present[present.length - 1] + level;
      push(a, b, `lateral L${level}, ${present.length - 1} across, toward pinky`);
      push(b, a, `lateral L${level}, ${present.length - 1} across, toward index`);
    }
  }
  return pairs;
}

/**
 * The v0 block that has already been run once, kept verbatim so a re-run stays
 * comparable with data/2026-08-25-*. Each pair names the §3 claim it tests.
 */
export const V0_LEGACY_PAIRS = [
  { from: "I1", to: "P1", note: "lateral L1 full sweep (claimed cheapest motion available)" },
  { from: "P1", to: "I1", note: "lateral L1 full sweep, inward" },
  { from: "I1", to: "M1", note: "lateral L1 short" },
  { from: "I1", to: "R1", note: "lateral L1 medium" },
  { from: "I2", to: "P2", note: "lateral L2 full sweep" },
  { from: "P2", to: "I2", note: "lateral L2 full sweep, inward" },
  { from: "I3", to: "M3", note: "lateral L3 short (claimed trivial)" },
  { from: "I3", to: "R3", note: "lateral L3 medium (claimed unreliable)" },
  { from: "I1", to: "I3", note: "longitudinal index, outward" },
  { from: "I3", to: "I1", note: "longitudinal index, inward" },
  { from: "M1", to: "M3", note: "longitudinal middle, outward" },
  { from: "R1", to: "R3", note: "longitudinal ring" },
  { from: "P1", to: "P3", note: "longitudinal pinky (claimed awkward)" },
];
