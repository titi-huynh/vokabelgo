const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '../../..');
const qaDir = __dirname;

const muse = JSON.parse(fs.readFileSync(path.join(qaDir, 'muse-lesson.json'), 'utf8'));
const reviewed = JSON.parse(fs.readFileSync(path.join(qaDir, 'reviewed-lesson.json'), 'utf8'));
const changelog = JSON.parse(fs.readFileSync(path.join(qaDir, 'changelog.json'), 'utf8'));
const picksAudit = JSON.parse(fs.readFileSync(path.join(qaDir, 'independent-picks-audit.json'), 'utf8'));
const baselineHashes = JSON.parse(fs.readFileSync(path.join(qaDir, 'baseline-source-hashes.json'), 'utf8'));
const baselinePractice = JSON.parse(fs.readFileSync(path.join(qaDir, 'baseline-practice-data.json'), 'utf8'));

// 1. Provenance check: muse-lesson.json untouched (241 cues, 7 chapters, 40 picks, 22 flashcards, 6 uncertain)
assert.strictEqual(muse.cues.length, 241, 'muse-lesson.json must retain original 241 cues');
assert.strictEqual(muse.chapters.length, 7, 'muse-lesson.json must retain 7 chapters');
assert.strictEqual(muse.chapters.flatMap(c => c.picks).length, 40, 'muse-lesson.json must retain 40 picks');
assert.strictEqual(muse.flashcards.length, 22, 'muse-lesson.json must retain 22 flashcards');
assert.strictEqual(muse.uncertain.length, 6, 'muse-lesson.json must retain 6 uncertain items');

// 2. Baseline hashes check: all 55 existing film files untouched
for (const [filename, expectedHash] of Object.entries(baselineHashes)) {
  const actualHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, filename))).digest('hex');
  assert.strictEqual(actualHash, expectedHash, `Baseline file modified: ${filename}`);
}

// 3. Reviewed lesson checks
const excludedIds = [
  3200030, 3200033, 3200039, 3200091, 3200116, 3200124,
  3200134, 3200161, 3200186, 3200212, 3200214, 3200220,
  3200227, 3200228, 3200237, 3200239, 3200240, 3200241
];
assert.strictEqual(reviewed.cues.length, 223, 'reviewed-lesson.json must have 223 runtime cues');
assert.strictEqual(reviewed.removedReviewNeeded.length, excludedIds.length, 'reviewed-lesson.json must record all 18 excluded cues');
const runtimeIds = new Set(reviewed.cues.map(c => c.id));
for (const exId of excludedIds) {
  assert(!runtimeIds.has(exId), `Excluded cue ${exId} must not be in runtime cues`);
}
assert(runtimeIds.has(3200001) && runtimeIds.has(3200029) && runtimeIds.has(3200031) && runtimeIds.has(3200238), 'Original IDs must be preserved without renumbering');

// 4. Monotonic timestamps & zero overlap & within duration 750.00s
for (let i = 0; i < reviewed.cues.length; i++) {
  const c = reviewed.cues[i];
  assert(c.start >= 0 && c.end > c.start && c.end <= 750.0, `Invalid span for cue ${c.id}: ${c.start}-${c.end}`);
  assert(!c.reviewNeeded, `Runtime cue ${c.id} must not have reviewNeeded`);
  assert(typeof c.text === 'string' && c.text.trim().length > 0, `Empty DE text on cue ${c.id}`);
  assert(typeof c.vi === 'string' && c.vi.trim().length > 0, `Empty VI text on cue ${c.id}`);
  if (i > 0) {
    const prev = reviewed.cues[i - 1];
    assert(c.id > prev.id, `Cue IDs not strictly increasing at ${prev.id} -> ${c.id}`);
    assert(c.start > prev.end, `Cue overlap or touch at ${prev.id} (${prev.end}) -> ${c.id} (${c.start})`);
  }
}

// 5. Every runtime cue belongs to strictly 1 chapter
for (const c of reviewed.cues) {
  const matchingChapters = reviewed.chapters.filter(ch => c.start >= ch.start && c.end <= ch.end);
  assert.strictEqual(matchingChapters.length, 1, `Cue ${c.id} (${c.start}-${c.end}) matched ${matchingChapters.length} chapters`);
}

// 6. Specific editorial fixes verified
const cue32 = reviewed.cues.find(c => c.id === 3200032);
assert.strictEqual(cue32.speaker, 'Hamster');
const cue37 = reviewed.cues.find(c => c.id === 3200037);
assert.strictEqual(cue37.speaker, 'Schnecke');
const cue92 = reviewed.cues.find(c => c.id === 3200092);
assert(cue92.vi.includes('cấm dừng xe'));
const cue93 = reviewed.cues.find(c => c.id === 3200093);
assert(cue93.vi.includes('cấm dừng xe'));
const cue200 = reviewed.cues.find(c => c.id === 3200200);
assert.strictEqual(cue200.speaker, 'Hamster');
assert.strictEqual(cue200.vi, 'Dĩ nhiên anh có thể nhận lại nó ngay.');
const cue215 = reviewed.cues.find(c => c.id === 3200215);
assert.strictEqual(cue215.speaker, 'Hamster');
const cue216 = reviewed.cues.find(c => c.id === 3200216);
assert(cue216.vi.includes('đổ bể'));
const cue226 = reviewed.cues.find(c => c.id === 3200226);
assert.strictEqual(cue226.speaker, 'Kommissar');
const cue232 = reviewed.cues.find(c => c.id === 3200232);
assert.strictEqual(cue232.speaker, 'Jan & Henry');

// 7. Picks (36 verified runtime picks, 40 audited in independent-picks-audit.json) and Flashcards (22)
const allPicks = reviewed.chapters.flatMap(ch => ch.picks);
assert.strictEqual(allPicks.length, 36, 'Total verified runtime picks must be 36');
assert.deepStrictEqual(reviewed.chapters.map(ch => ch.picks.length), [6, 6, 5, 5, 5, 4, 5]);
assert.strictEqual(picksAudit.picksAudit.length, 40, 'Independent picks audit must cover all 40 Muse picks');
for (const ch of reviewed.chapters) {
  for (const p of ch.picks) {
    assert(runtimeIds.has(p.id), `Pick ${p.id} missing from runtime cues`);
    const c = reviewed.cues.find(x => x.id === p.id);
    assert(c.start >= ch.start && c.end <= ch.end, `Pick ${p.id} outside its chapter bounds`);
    assert(typeof p.usage === 'string' && p.usage.length > 15, `Pick ${p.id} usage too short`);
  }
}

assert.strictEqual(reviewed.flashcards.length, 22, 'Flashcards count must be 22');
const card93 = reviewed.flashcards.find(f => f.cueId === 3200093);
assert(card93.meaning.includes('cấm dừng xe'), 'Flashcard das Halteverbot must specify cấm dừng xe');
for (const f of reviewed.flashcards) {
  assert(runtimeIds.has(f.cueId), `Flashcard ${f.term} references missing cue ${f.cueId}`);
  const c = reviewed.cues.find(x => x.id === f.cueId);
  assert.strictEqual(f.example, c.text, `Flashcard ${f.term} example must match runtime cue text verbatim`);
}

// 8. VM evaluation of runtime JS files + preservation of erdmaennchen_luftgehen and all other films
const ctx = vm.createContext({});
for (const file of fs.readdirSync(root).filter(f => f.endsWith('-aligned.js'))) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
}
vm.runInContext(fs.readFileSync(path.join(root, 'kino-metadata.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'kino-chapter-data.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'kino-practice-data.js'), 'utf8'), ctx);

const lesson = vm.runInContext('ERDMAENNCHEN_PLATTE_REIFEN_LESSON', ctx);
const aligned = vm.runInContext('ERDMAENNCHEN_PLATTE_REIFEN_ALIGNED_UTTERANCES', ctx);
assert.strictEqual(aligned.length, 223);
assert.strictEqual(lesson.flashcards.length, 22);
assert.strictEqual(lesson.chapterData.chapters.length, 7);

// Check erdmaennchen_luftgehen preserved (179 cues / 7 parts / 40 picks / 21 cards)
const luftLesson = vm.runInContext('ERDMAENNCHEN_LUFTGEHEN_LESSON', ctx);
const luftAligned = vm.runInContext('ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES', ctx);
assert.strictEqual(luftAligned.length, 179, 'Luftgehen must retain 179 cues');
assert.strictEqual(luftLesson.chapterData.chapters.length, 7, 'Luftgehen must retain 7 chapters');
assert.strictEqual(luftLesson.chapterData.chapters.flatMap(c => c.picks).length, 40, 'Luftgehen must retain 40 picks');
assert.strictEqual(luftLesson.flashcards.length, 21, 'Luftgehen must retain 21 flashcards');

// Check baseline-practice-data.json preserved for all other films
const practiceData = JSON.parse(vm.runInContext('JSON.stringify(KINO_PRACTICE_DATA)', ctx));
for (const [k, v] of Object.entries(baselinePractice)) {
  assert.deepStrictEqual(practiceData[k], v, `Practice data changed for existing film ${k}`);
}

// 9. Check 7 posters exist and are non-empty
for (let i = 1; i <= 7; i++) {
  const posterPath = path.join(root, 'assets', 'kino-posters', `erdmaennchen_platte_reifen-${i}.jpg`);
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
  picksPerChapter: reviewed.chapters.map(ch => ch.picks.length),
  flashcards: reviewed.flashcards.length,
  postersVerified: 7,
  baselineFilesVerified: Object.keys(baselineHashes).length,
  otherFilmPracticeDataPreserved: true,
  luftgehenPreserved: { cues: 179, chapters: 7, picks: 40, flashcards: 21 },
  changelogEntries: changelog.changes.length
};
fs.writeFileSync(path.join(qaDir, 'validator-output.json'), JSON.stringify(report, null, 2) + '\n');
console.log('ALL_VALIDATIONS_PASSED:', JSON.stringify(report));
