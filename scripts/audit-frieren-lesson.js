/* Independent structural review of Frieren's complete local lesson. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({console});
for (const file of ['frieren-s01e01-aligned.js', 'frieren-s01e01-lesson.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
}
const {captions, units, lesson} = vm.runInContext('({captions:FRIEREN_S01E01_CAPTION_CUES,units:FRIEREN_S01E01_ALIGNED_UTTERANCES,lesson:FRIEREN_S01E01_LESSON})', context);
const failures = [];
const check = (condition, message) => {if (!condition) failures.push(message);};
const duration = 1559.986009;
const words = text => (text.toLowerCase().replace(/ß/g, 'ss').match(/[\p{L}\p{N}]+/gu) || []).join(' ');
const chapters = lesson.chapterData.chapters;
const byId = new Map(captions.map(c => [c.id, c]));
check(captions.length > 150 && units.length > 150, 'Unexpectedly short transcript');
check(lesson.chapterData.defaultMode === 'all', 'Full dialogue is not the default');
check(new Set(captions.map(c => c.id)).size === captions.length, 'Duplicate caption IDs');
check(new Set(units.map(c => c.id)).size === units.length, 'Duplicate practice IDs');
for (const [kind, rows] of [['caption', captions], ['practice', units]]) {
  rows.forEach((c,i) => {
    check(Number.isFinite(c.start) && c.start >= 0 && c.end > c.start && c.end <= duration+.02,
      `Invalid ${kind} time: ${c.id}`);
    check(c.text?.trim() && c.vi?.trim(), `Missing ${kind} translation/text: ${c.id}`);
    check(!i || c.start >= rows[i-1].end-.02, `Overlapping ${kind}: ${c.id}`);
    check(!/ZDF|WDR|Untertitel im Auftrag|Copyright WDR/i.test(c.text), `Stock ASR hallucination: ${c.id}`);
    check(!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(c.text), `Japanese song made into ${kind}: ${c.id}`);
    check(c.start >= 120, `Opening-song German hallucination: ${c.id}`);
    check(c.end <= 1470 || c.start >= 1540, `Ending-song German hallucination: ${c.id}`);
    check(chapters.filter(p => c.start >= p.start && c.end <= p.end).length === 1,
      `${kind} crosses or misses a part: ${c.id}`);
  });
}
const expanded = [];
units.forEach(unit => {
  const ids = unit.legacyIds || unit.captionIds || unit.cueIds || [unit.id];
  const parts = ids.map(id => byId.get(id));
  expanded.push(...ids);
  check(parts.every(Boolean), `Missing caption reference: ${unit.id}`);
  if (parts.every(Boolean)) {
    check(words(parts.map(c => c.text).join(' ')) === words(unit.text), `Words lost/added in practice: ${unit.id}`);
    check(unit.start === parts[0].start && unit.end === parts.at(-1).end, `Practice time differs from captions: ${unit.id}`);
  }
});
check(JSON.stringify(expanded) === JSON.stringify(captions.map(c => c.id)), 'Every caption must occur exactly once, chronologically, in practice');
check(chapters[0].start === 0, 'Source opening is not playable');
check(Math.abs(chapters.at(-1).end-duration) < .03, 'Source ending has been trimmed');
chapters.forEach((part,i) => {
  check(!i || part.start === chapters[i-1].end, `Part gap/overlap: ${i+1}`);
  check(part.picks.length === 7 && new Set(part.picks).size === 7, `Invalid focus selection: ${i+1}`);
  part.picks.forEach(id => check(units.some(c => c.id === id && c.start >= part.start && c.end <= part.end), `Focus cue outside part: ${id}`));
});
lesson.flashcards.forEach(card => check(byId.get(card.cueId)?.text === card.example, `Ungrounded vocabulary: ${card.id}`));
check(new Set(lesson.flashcards.map(c => c.id)).size === lesson.flashcards.length, 'Duplicate vocabulary IDs');
const report = {captions:captions.length, practiceUnits:units.length, vocabulary:lesson.flashcards.length,
  first:captions[0], last:captions.at(-1),
  parts:chapters.map(c => ({title:c.title,start:c.start,end:c.end,units:units.filter(u=>u.start>=c.start && u.end<=c.end).length})),
  failures};
fs.writeFileSync(path.join(root,'qa/kino-alignment/frieren_s01e01/codex-structural-review.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
assert.equal(failures.length, 0, failures.join('\n'));
