const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '../../..');
const baseRevision = 'bb24ad2b5d44ac25c87ec06fd3f0b5c8b1b10d45';
const file = 'erdmaennchen-nudeltrick-aligned.js';
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const json = name => JSON.parse(read(name));
const extract = source => {
  const context = {};
  vm.createContext(context);
  vm.runInContext(source + ';this.result=JSON.stringify(ERDMAENNCHEN_NUDELTRICK_CAPTION_CUES);', context);
  return JSON.parse(context.result);
};
const baseline = extract(execFileSync('git', ['show', `${baseRevision}:${file}`], { cwd: root, encoding: 'utf8' }));
const cues = extract(read(file));
const oldIds = new Set(baseline.map(c => c.id));
const added = cues.filter(c => !oldIds.has(c.id));
assert.equal(baseline.length, 118);
assert(added.length > 0, 'No additions');
assert.equal(cues.length, new Set(cues.map(c => c.id)).size, 'Duplicate IDs');
for (const old of baseline) assert.deepEqual(cues.find(c => c.id === old.id), old, `Existing cue ${old.id} changed`);
assert.deepEqual(added.map(c => c.id).sort((a, b) => a - b), Array.from({ length: added.length }, (_, i) => 900226 + i), 'New ID sequence');
for (let i = 0; i < cues.length; i++) {
  const c = cues[i];
  assert(c.start >= 0 && c.end > c.start && c.end <= 746.92 && c.text && c.vi && c.speaker);
  assert(!i || c.start >= cues[i - 1].end, `Overlap at ${c.id}`);
  assert(c.start >= 26.12, `Opening song leaked at ${c.id}`);
}
const folder = 'qa/kino-alignment/erdmaennchen_nudeltrick/';
for (const name of ['caption-cues.json', 'practice-cues.json']) assert.deepEqual(json(folder + name), cues, name);
const audit = json(folder + 'aligned-utterances-audit.json');
assert.equal(audit.length, cues.length);
for (const c of cues) {
  const row = audit.find(a => a.id === c.id);
  // The legacy alignment audit records the unpadded model envelope; cue JSON/VTT record display timings.
  for (const key of Object.keys(c).filter(k => !['start', 'end'].includes(k))) assert.deepEqual(row[key], c[key], `Audit mismatch ${c.id}.${key}`);
}
for (const lang of ['de', 'vi']) {
  const ids = [...read(folder + `erdmaennchen_nudeltrick.${lang}.vtt`).replace(/\r\n/g, '\n').matchAll(/(?:^|\n\n)(\d+)\n/g)].map(m => Number(m[1]));
  assert.deepEqual(ids, cues.map(c => c.id), `VTT ${lang}`);
}
const summary = json(folder + 'build-summary.json');
assert.equal(summary.captionCues, cues.length);
assert.equal(summary.practiceCues, cues.length);
assert.equal(json('qa/kino-alignment/erdmaennchen-nudeltrick-source.json').selectedCues, cues.length);
const lessonFile = 'erdmaennchen-nudeltrick-lesson.js';
assert.equal(read(lessonFile).replace(/\r\n/g, '\n'), execFileSync('git', ['show', `${baseRevision}:${lessonFile}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n'), 'Lesson picks/flashcards file changed');
const report = { baseRevision, baseline: baseline.length, added: added.length, total: cues.length, originalCuesUnchanged: true, uniqueAndSequentialNewIds: true, nonoverlapping: true, runtimeQaVttCountsMatch: true, picksAndFlashcardsUnchanged: true };
fs.writeFileSync(path.join(__dirname, 'final-data-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
