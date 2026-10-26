const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '../../..');
const qaDir = __dirname;

const muse = JSON.parse(fs.readFileSync(path.join(qaDir, 'muse-lesson.json'), 'utf8'));
const reviewed = JSON.parse(fs.readFileSync(path.join(qaDir, 'reviewed-lesson.json'), 'utf8'));
const changelog = JSON.parse(fs.readFileSync(path.join(qaDir, 'changelog.json'), 'utf8'));
const picksAudit = JSON.parse(fs.readFileSync(path.join(qaDir, 'independent-picks-audit.json'), 'utf8'));

// 1. Provenance check: muse-lesson.json untouched (182 cues, 7 chapters, 41 picks, 22 flashcards)
assert.strictEqual(muse.cues.length, 182, 'muse-lesson.json must retain original 182 cues');
assert.strictEqual(muse.chapters.length, 7, 'muse-lesson.json must retain 7 chapters');
assert.strictEqual(muse.flashcards.length, 22, 'muse-lesson.json must retain 22 flashcards');

// 2. Reviewed lesson checks
assert.strictEqual(reviewed.cues.length, 179, 'reviewed-lesson.json must have 179 runtime cues');
assert.strictEqual(reviewed.removedReviewNeeded.length, 3, 'reviewed-lesson.json must record 3 excluded reviewNeeded cues');
const runtimeIds = new Set(reviewed.cues.map(c => c.id));
assert(!runtimeIds.has(3100055), '3100055 must not be in runtime cues');
assert(!runtimeIds.has(3100182), '3100182 must not be in runtime cues');
assert(runtimeIds.has(3100001) && runtimeIds.has(3100054) && runtimeIds.has(3100056) && runtimeIds.has(3100181), 'Original IDs must be preserved without renumbering');

// 3. Monotonic timestamps & zero overlap & within duration 692.44s
for (let i = 0; i < reviewed.cues.length; i++) {
  const c = reviewed.cues[i];
  assert(c.start >= 0 && c.end > c.start && c.end <= 692.44, `Invalid span for cue ${c.id}: ${c.start}-${c.end}`);
  assert(!c.reviewNeeded, `Runtime cue ${c.id} must not have reviewNeeded`);
  assert(typeof c.text === 'string' && c.text.trim().length > 0, `Empty DE text on cue ${c.id}`);
  assert(typeof c.vi === 'string' && c.vi.trim().length > 0, `Empty VI text on cue ${c.id}`);
  if (i > 0) {
    const prev = reviewed.cues[i - 1];
    assert(c.id > prev.id, `Cue IDs not strictly increasing at ${prev.id} -> ${c.id}`);
    assert(c.start > prev.end, `Cue overlap or touch at ${prev.id} (${prev.end}) -> ${c.id} (${c.start})`);
  }
}

// 4. Every runtime cue belongs to strictly 1 chapter
for (const c of reviewed.cues) {
  const matchingChapters = reviewed.chapters.filter(ch => c.start >= ch.start && c.end <= ch.end);
  assert.strictEqual(matchingChapters.length, 1, `Cue ${c.id} (${c.start}-${c.end}) matched ${matchingChapters.length} chapters`);
}

// 5. Specific Codex fixes verified
const cue78 = reviewed.cues.find(c => c.id === 3100078);
assert.strictEqual(cue78.vi, 'Thật tệ khi không thể bay được như bọn chị đây này.');
const cue171 = reviewed.cues.find(c => c.id === 3100171);
assert.strictEqual(cue171.speaker, 'Ballonverkäufer');
assert.strictEqual(cue171.vi, 'Các cô thực sự muốn mua hết bóng bay sao?');
const cue173 = reviewed.cues.find(c => c.id === 3100173);
assert.strictEqual(cue173.speaker, 'Vogeldame');
const cue100 = reviewed.cues.find(c => c.id === 3100100);
assert.strictEqual(cue100.text, 'Das ist, weil ich bin Ballonverkäufer.');

assert(!runtimeIds.has(3100067), '3100067 must not be a guessed runtime answer');

// 6. Picks (41) and Flashcards (22)
const allPicks = reviewed.chapters.flatMap(ch => ch.picks);
assert.strictEqual(allPicks.length, 40, 'Total picks must be 40');
assert.strictEqual(picksAudit.picksAudit.length, 41, 'Independent picks audit must cover all 41 picks');
for (const ch of reviewed.chapters) {
  for (const p of ch.picks) {
    assert(runtimeIds.has(p.id), `Pick ${p.id} missing from runtime cues`);
    const c = reviewed.cues.find(x => x.id === p.id);
    assert(c.start >= ch.start && c.end <= ch.end, `Pick ${p.id} outside its chapter bounds`);
    assert(typeof p.usage === 'string' && p.usage.length > 15, `Pick ${p.id} usage too short`);
  }
}

assert.strictEqual(reviewed.flashcards.length, 21, 'Flashcards count must be 21');
const card102 = reviewed.flashcards.find(f => f.cueId === 3100102);
assert.strictEqual(card102.term, 'verkaufen', 'Card on 3100102 must be verkaufen');
for (const f of reviewed.flashcards) {
  assert(runtimeIds.has(f.cueId), `Flashcard ${f.term} references missing cue ${f.cueId}`);
  const c = reviewed.cues.find(x => x.id === f.cueId);
  assert.strictEqual(f.example, c.text, `Flashcard ${f.term} example must match runtime cue text verbatim`);
}

// 7. VM evaluation of runtime JS files
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'erdmaennchen-luftgehen-aligned.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'erdmaennchen-luftgehen-lesson.js'), 'utf8'), ctx);
const lesson = vm.runInContext('ERDMAENNCHEN_LUFTGEHEN_LESSON', ctx);
const aligned = vm.runInContext('ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES', ctx);
assert.strictEqual(aligned.length, 179);
assert.strictEqual(lesson.flashcards.length, 21);
assert.strictEqual(lesson.chapterData.chapters.length, 7);

// 8. Check 7 posters exist and are non-empty
for (let i = 1; i <= 7; i++) {
  const posterPath = path.join(root, 'assets', 'kino-posters', `erdmaennchen_luftgehen-${i}.jpg`);
  assert(fs.existsSync(posterPath) && fs.statSync(posterPath).size > 5000, `Missing or empty poster ${posterPath}`);
}

const report = {
  passed: true,
  timestamp: new Date().toISOString(),
  museCues: muse.cues.length,
  runtimeCues: reviewed.cues.length,
  removedReviewNeeded: reviewed.removedReviewNeeded.map(r => r.cue.id),
  chapters: reviewed.chapters.length,
  picks: allPicks.length,
  flashcards: reviewed.flashcards.length,
  postersVerified: 7,
  changelogEntries: changelog.changes.length
};
fs.writeFileSync(path.join(qaDir, 'validator-output.json'), JSON.stringify(report, null, 2) + '\n');
console.log('ALL_VALIDATIONS_PASSED:', JSON.stringify(report));
