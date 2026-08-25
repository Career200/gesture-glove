/**
 * Trial statistics, with the correction the first run showed to be necessary.
 *
 * Raw trial time is `reach + reaction + keypress`. That overhead is constant
 * across targets, so it does not reorder anything — but it compresses ratios
 * badly. The 2026-08-25 run spanned 745–988 ms, a 1.33× spread, of which an
 * unknown but large majority was overhead. Subtracting a measured baseline
 * (a block where the target is shown and the key pressed with no movement)
 * recovers the reach time itself.
 */

export const median = a => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

export const quantile = (a, q) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

/** Trial outcomes. `sloppy` is a hit that needed hunting or correcting. */
export const OUTCOMES = ["clean", "sloppy", "wrong"];

/**
 * Pool trials by target and summarise. `baseline` (ms) is subtracted from every
 * median before ratios and tiers are computed; pass null to report raw times.
 */
export function summarise(trials, { baseline = null, keyOf = t => t.target } = {}) {
  const by = new Map();
  for (const t of trials) {
    const key = keyOf(t);
    if (!by.has(key)) by.set(key, { key, note: t.note, times: [], n: 0, sloppy: 0, wrong: 0 });
    const e = by.get(key);
    e.n++;
    // A wrong landing has no meaningful reach time; a sloppy one does.
    if (t.outcome === "wrong" || t.miss === true) e.wrong++;
    else { e.times.push(t.ms); if (t.outcome === "sloppy") e.sloppy++; }
  }

  const rows = [...by.values()].map(e => {
    const raw = median(e.times);
    return {
      ...e,
      raw,
      median: raw === null ? null : (baseline === null ? raw : Math.max(1, raw - baseline)),
      p25: quantile(e.times, 0.25),
      p75: quantile(e.times, 0.75),
      wrongRate: e.n ? e.wrong / e.n : 0,
      sloppyRate: e.n ? e.sloppy / e.n : 0,
      // What the hand actually cares about: anything that was not a clean hit.
      errorRate: e.n ? (e.wrong + e.sloppy) / e.n : 0,
    };
  });

  rows.sort((a, b) => (a.median ?? Infinity) - (b.median ?? Infinity));
  const best = rows.find(r => r.median !== null)?.median ?? null;
  for (const r of rows) {
    r.ratio = best && r.median !== null ? r.median / best : null;
    r.tier = r.ratio === null ? null
      : r.ratio <= 1.15 ? 1 : r.ratio <= 1.40 ? 2 : r.ratio <= 1.75 ? 3 : r.ratio <= 2.20 ? 4 : 5;
  }
  return { rows, best, baseline };
}

/** Group trials by whatever dimensions a caller cares about. */
export function groupBy(items, keyFn) {
  const g = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(it);
  }
  return g;
}
