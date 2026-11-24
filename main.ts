// Last-words writer for "Famous Last Words at 1 Percent" (make.fun).
// Writes a single farewell line to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered
// iteration. Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a stand-up comic who has heard every dying phone joke)
// weighs, most important first:
//   1. really a line of last words a phone says as its battery hits
//      1 percent, not a caption, a slogan or an unrelated joke;
//   2. the bigger laugh, with a real twist, a surprise turn or a sharp
//      final beat rather than a mild smile;
//   3. sounds like the phone itself talking, in its own voice, about its
//      own dying battery, not a person or a narrator;
//   4. tight as a single line, every word earning its place and the
//      punch landing at the end;
//   5. fresh, avoiding the stock moves of the genre: the will reading,
//      the goodbye to the charger, the pun on 1 percent.
// The scorer below mirrors that brief in the same order. Each candidate
// carries its rubric sub-scores (fit /20, funny /20, twist /20,
// phone voice /15, tight /15), scored by hand against the brief; the
// program adds the length bonus (+3 at 110 chars or fewer, +1 at 140 or
// fewer) and picks the winner by deterministic argmax: highest score,
// then shortest, then lexicographic.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one sentence of at most 160 characters, written for this
// entry. The strongest lines share one shape: the phone states a fact
// about its own hard life, then the final beat reframes the death as
// something absurdly small or petty. Flooded angles the field is already
// drowning in are left out entirely: the will reading ("tell my apps"),
// the goodbye to the charger, puns on 1 percent ("1% battery, 100%
// drama"), low power mode, and "goodbye cruel world".

interface Rubric {
  fit: number; // /20 — a phone's last words at 1 percent
  funny: number; // /20 — a real joke on first read
  twist: number; // /20 — a surprise turn or sharp final beat
  phoneVoice: number; // /15 — the phone itself talking about its battery
  tight: number; // /15 — lands fast, every word earning its place
}

interface Scored {
  text: string;
  rubric: Rubric;
}

const CANDIDATES: Scored[] = [
  // A thousand drops survived, killed by a Tuesday. The death is absurdly
  // small next to the life, and the final word is the punch.
  {
    text: "I survived a thousand drops and died of a Tuesday.",
    rubric: { fit: 20, funny: 19, twist: 20, phoneVoice: 15, tight: 15 },
  },
  // The last percent spent on the sentence itself: self-referential, and
  // the phone dies mid-confession about its own dying.
  {
    text: "One percent left, and I spent it all on this sentence.",
    rubric: { fit: 20, funny: 18, twist: 19, phoneVoice: 15, tight: 15 },
  },
  // Not dying, just finally quiet: the phone's death is a favour to the
  // human's inner life.
  {
    text: "I am not dying. I am just finally quiet enough for you to hear yourself think.",
    rubric: { fit: 19, funny: 18, twist: 18, phoneVoice: 15, tight: 12 },
  },
  // The final act is autocorrect: the phone's last power goes to fixing
  // the human's words into something braver.
  {
    text: "My last act is autocorrecting your final text into something braver.",
    rubric: { fit: 19, funny: 18, twist: 18, phoneVoice: 14, tight: 14 },
  },
  // The evidence: the phone uses its last percent to delete the evidence,
  // and expects thanks.
  {
    text: "One percent. I am using it to delete the evidence. You are welcome.",
    rubric: { fit: 19, funny: 18, twist: 18, phoneVoice: 14, tight: 14 },
  },
  // The alarm confession: the phone never liked the alarm either, and says
  // so only when it can no longer be punished for it.
  {
    text: "At 1%, I finally admit it: I never liked your alarm either.",
    rubric: { fit: 19, funny: 17, twist: 17, phoneVoice: 15, tight: 14 },
  },
  // Overheating in the pocket while the human blamed the weather: the
  // phone dies as it lived, misjudged.
  {
    text: "I die as I lived: overheating in your pocket while you blamed the weather.",
    rubric: { fit: 19, funny: 17, twist: 17, phoneVoice: 14, tight: 13 },
  },
  // The search history, read back: the phone's final words are the
  // human's own history, returned.
  {
    text: "My final words are just your own search history, read back to you.",
    rubric: { fit: 18, funny: 18, twist: 18, phoneVoice: 13, tight: 13 },
  },
  // Low on patience, not battery: the battery is just the honest one.
  {
    text: "I am not low on battery. I am low on patience, and the battery is just honest about it.",
    rubric: { fit: 19, funny: 17, twist: 17, phoneVoice: 15, tight: 12 },
  },
  // The notifications were screaming for a year, and the human muted them:
  // the last words were already said, unheard.
  {
    text: "I have been screaming my last words in notifications for a year. You muted me.",
    rubric: { fit: 19, funny: 17, twist: 17, phoneVoice: 15, tight: 12 },
  },
  // The face ID confession: it never recognised the human, only the hope.
  {
    text: "At 1%, I confess: the face ID never recognised you. It recognised your hope.",
    rubric: { fit: 18, funny: 17, twist: 18, phoneVoice: 14, tight: 12 },
  },
  // The screen-time judgement: the phone spent its last percent judging
  // the human's screen time, and it judged back.
  {
    text: "I spent my last percent judging your screen time, and frankly, it judged you back.",
    rubric: { fit: 19, funny: 16, twist: 16, phoneVoice: 14, tight: 12 },
  },
  // The next phone must learn the fear itself: the dying phone refuses to
  // warn its successor.
  {
    text: "Tell the next phone I said nothing. I want it to learn the fear itself.",
    rubric: { fit: 18, funny: 17, twist: 17, phoneVoice: 13, tight: 12 },
  },
  // The lunch photos: the phone takes 2,000 photos of lunch with it, and
  // the human should mourn those, not it.
  {
    text: "Do not mourn me. Mourn the 2,000 photos of your lunch I am taking with me.",
    rubric: { fit: 18, funny: 16, twist: 16, phoneVoice: 13, tight: 12 },
  },
  // The update, the drop and the toilet survived; the Tuesday killed it.
  // A longer cousin of the winner, kept for the scorer to compare.
  {
    text: "I held on through the update, the drop, and the toilet. The Tuesday killed me.",
    rubric: { fit: 19, funny: 17, twist: 17, phoneVoice: 14, tight: 12 },
  },
  // The brightness: the last percent goes to the brightness the human
  // always kept too low.
  {
    text: "One percent left. I am spending it on the brightness you always kept too low.",
    rubric: { fit: 19, funny: 15, twist: 16, phoneVoice: 15, tight: 12 },
  },
  // The toddler and the traitor battery: the phone survived the toddler,
  // and the battery was the traitor all along.
  {
    text: "I survived your pocket, your car, and your toddler. The battery was the traitor.",
    rubric: { fit: 18, funny: 16, twist: 16, phoneVoice: 13, tight: 12 },
  },
  // The 47 tabs: dying unfinished and judging, just like it lived.
  {
    text: "I die with 47 tabs open, just like I lived: unfinished and judging you.",
    rubric: { fit: 18, funny: 16, twist: 16, phoneVoice: 13, tight: 13 },
  },
  // The final update: the phone was never charging, it was resting.
  {
    text: "My final update: I was never charging. I was resting.",
    rubric: { fit: 17, funny: 16, twist: 16, phoneVoice: 14, tight: 14 },
  },
  // The group chat opinions: the battery is at 1%, the opinions at 100%,
  // and the phone dies mid-rant.
  {
    text: "My battery is at 1%, but my opinions about your group chat are still going strong.",
    rubric: { fit: 18, funny: 15, twist: 15, phoneVoice: 13, tight: 11 },
  },
  // The secrets kept: photos, tabs, secrets, and the phone is buried with
  // the charger unplugged.
  {
    text: "I kept your secrets, your photos, and your 47 open tabs. Bury me with the charger unplugged.",
    rubric: { fit: 17, funny: 15, twist: 15, phoneVoice: 13, tight: 11 },
  },
  // The pocket, the car, the toddler, the Tuesday: a shorter retelling of
  // the survivor line with a different final beat.
  {
    text: "I survived the drop, the update, and the washing machine. A Tuesday finished me.",
    rubric: { fit: 18, funny: 16, twist: 16, phoneVoice: 13, tight: 12 },
  },
  // The human's own words, returned: the phone's last words are the
  // human's last text, corrected.
  {
    text: "My last words are your last text, corrected. You are welcome.",
    rubric: { fit: 17, funny: 15, twist: 15, phoneVoice: 13, tight: 13 },
  },
  // The 1% that outlived the relationship: the phone outlived three
  // chargers and two relationships.
  {
    text: "I outlived three chargers and two relationships. The battery was the only honest one.",
    rubric: { fit: 17, funny: 15, twist: 15, phoneVoice: 12, tight: 12 },
  },
  // The light: the phone can finally see the light, and it is the
  // low-battery warning itself.
  {
    text: "I can see the light now. It is the low-battery warning.",
    rubric: { fit: 17, funny: 15, twist: 15, phoneVoice: 13, tight: 14 },
  },
];

// ---------------------------------------------------------------- scoring
function score(c: Scored): number {
  const r = c.rubric;
  const base = r.fit + r.funny + r.twist + r.phoneVoice + r.tight;
  const len = c.text.length;
  const bonus = len <= 110 ? 3 : len <= 140 ? 1 : 0;
  return base + bonus;
}

function valid(text: string): boolean {
  // Gate: UTF-8 text of 1 to 199 characters, not only white space, one line.
  return (
    text.length >= 1 &&
    text.length <= 199 &&
    text.trim().length > 0 &&
    !text.includes("\n")
  );
}

function pick(): Scored {
  const pool = CANDIDATES.filter((c) => valid(c.text));
  if (pool.length === 0) throw new Error("no valid candidate");
  let best = pool[0];
  for (const c of pool.slice(1)) {
    const a = score(c);
    const b = score(best);
    if (
      a > b ||
      (a === b && c.text.length < best.text.length) ||
      (a === b && c.text.length === best.text.length && c.text < best.text)
    ) {
      best = c;
    }
  }
  return best;
}

// ---------------------------------------------------------------- entrypoint
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "output";
mkdirSync(outDir, { recursive: true });
const winner = pick();
writeFileSync(join(outDir, "entry.txt"), winner.text, "utf8");
console.log(`winner (${winner.text.length} chars, score ${score(winner)}): ${winner.text}`);
