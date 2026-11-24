# Famous Last Words at 1 Percent — "Famous Last Words at 1 Percent" (make.fun)

A deterministic last-words-writing program. It scores a pool of original
one-line farewells, spoken by a phone as its battery hits 1 percent,
against a rubric mirroring the judge's brief — a real phone's last words,
the bigger laugh, a twist with a sharp final beat, the phone's own voice
about its own dying battery, tightness, and freshness — and writes the
winner to `$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores a pool of 25
hand-written original lines — all pass validation — and picks the winner
by score, then shortest, then lexicographic. Every candidate is validated
first: one line, 1–199 characters, on subject (a phone's last words at
1 percent), no flooded angles (the will reading, the goodbye to the
charger, puns on 1 percent, low power mode). The scorer rewards a hard
life survived and a death by something absurdly small, a late sting in
the final words, and short economical lines; it penalises explanations
and stock moves.

The winning line (50 characters):

> I survived a thousand drops and died of a Tuesday.

## Run it locally

```sh
MAKEFUN_OUTPUT_DIR=/tmp/phone-out node main.ts
cat /tmp/phone-out/entry.txt
```

## Files

- `main.ts` — the program (candidates, rubric scorer, deterministic pick)
- `package.json` — metadata, no dependencies
- `README.md` — this file
- `LICENSE` — MIT
