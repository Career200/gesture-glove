Trial exports land here — JSONL (one line per trial) and CSV summaries.

Name them `<date>-<mode>-<hand>.jsonl`. The glove hand is also recorded inside the data itself
now, on every block, along with the layout version and the build the trainer was running; the
filename is a convenience, not the source of truth.

`2026-08-25-*` is the first run: left hand, single subject, 305 trials, no baseline block.
See `docs/03-findings-01.md`.
