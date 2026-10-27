/* Rebuild only Dungeon from the frozen main baseline and its verified additions. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const base = 'eed6b2dee89d7abcdcdab2285e1abfcab6ce9a79';
const key = 'delicious_in_dungeon_s01e01', stem = 'delicious-in-dungeon-s01e01', symbol = 'DELICIOUS_IN_DUNGEON_S01E01';
const sourcePath = `qa/kino-alignment/muse-two-films/${key}.json`;
const original = file => execFileSync('git', ['show', `${base}:${file}`], {cwd:root,encoding:'utf8'});
const review = JSON.parse(fs.readFileSync(path.join(__dirname, 'review.json'), 'utf8'));
const source = JSON.parse(original(sourcePath));
const context = vm.createContext({});
vm.runInContext(original(`${stem}-aligned.js`) + original(`${stem}-lesson.js`) + `;this.snapshot=JSON.stringify({captions:${symbol}_CAPTION_CUES,units:${symbol}_ALIGNED_UTTERANCES,lesson:${symbol}_LESSON});`, context);
const baseline = JSON.parse(context.snapshot);
assert.equal(baseline.captions.length, 367);
const published = new Set(baseline.captions.map(c=>c.id));
const nextId = Math.max(...source.cues.map(c=>c.id)) + 1;
const added = review.added.slice().sort((a,b)=>a.start-b.start);
assert.deepEqual(added.map(c=>c.id), added.map((_,i)=>nextId+i));
const supersededDrafts = [];
source.cues = source.cues.filter(cue => {
  const replacements = added.filter(c=>c.start < cue.end && c.end > cue.start);
  if (!replacements.length) return true;
  assert(!published.has(cue.id), `New cue overlaps published ${cue.id}`);
  supersededDrafts.push({cue, partialReplacementIds:replacements.map(c=>c.id), note:'Only accepted portions become fresh cues; unresolved portions remain in review.json.'});
  return false;
});
// Preserve the unverified parts of exclusion/uncertainty ranges, carving only confirmed dialogue.
function carve(ranges) {
  return (ranges || []).flatMap(range => {
    let pieces = [range];
    for (const cue of added) pieces = pieces.flatMap(p => {
      if (cue.start >= p.end || cue.end <= p.start) return [p];
      return [p.start < cue.start ? {...p,end:cue.start} : null, p.end > cue.end ? {...p,start:cue.end} : null].filter(Boolean);
    });
    return pieces.map(p => pieces.length===1&&p.start===range.start&&p.end===range.end ? p : {...p,reason:'Phần chưa đưa vào cue học sau khi tách các câu đã xác nhận ngày 2026-10-27; những phát ngôn còn chưa rõ được lưu riêng ở dungeon_missing_20261027/review.json.'});
  });
}
const resolvedUncertain = (source.uncertain || []).filter(p=>added.some(c=>c.start<p.end&&c.end>p.start));
source.exclusions = carve(source.exclusions);
source.uncertain = carve(source.uncertain);
source.cues.push(...added.map(({id,start,end,speaker,text,vi})=>({id,start,end,speaker,text,vi})));
source.cues.sort((a,b)=>a.start-b.start);
for (const change of review.chapterAdjustments || []) {
  assert.equal(source.chapters[change.leftIndex].end, change.before);
  assert.equal(source.chapters[change.leftIndex+1].start, change.before);
  source.chapters[change.leftIndex].end = source.chapters[change.leftIndex+1].start = change.after;
}
source.missingDialogueReview = {date:'2026-10-27',folder:'qa/kino-alignment/dungeon_missing_20261027',reviewJson:'qa/kino-alignment/dungeon_missing_20261027/review.json',candidateWindows:10,addedCues:added.length,addedIds:added.map(c=>c.id),preservedPublishedCues:367,supersededDrafts,resolvedUncertain,counts:review.counts};
const {build,definitions} = require(path.join(root,'scripts/build-muse-anime-lessons.cjs'));
const definition = definitions.find(d=>d.key===key);
const result = build(source,definition);
assert.equal(result.captions.length,367+added.length);
for (const cue of baseline.captions) assert.deepEqual(result.captions.find(c=>c.id===cue.id),cue,`Changed existing caption ${cue.id}`);
for (const cue of baseline.units) assert.deepEqual(result.units.find(c=>c.id===cue.id),cue,`Changed existing practice cue ${cue.id}`);
assert.deepEqual(result.lesson.flashcards,baseline.lesson.flashcards);
assert.deepEqual(result.lesson.chapterData.chapters.map(c=>c.picks),baseline.lesson.chapterData.chapters.map(c=>c.picks));
fs.writeFileSync(path.join(root,sourcePath),JSON.stringify(source,null,2)+'\n');
fs.writeFileSync(path.join(root,`${stem}-aligned.js`),`/* Reviewed owner-supplied dialogue; original video timestamps. */\nconst ${symbol}_CAPTION_CUES = ${JSON.stringify(result.captions,null,2)};\nconst ${symbol}_ALIGNED_UTTERANCES = ${JSON.stringify(result.units,null,2)};\n`);
fs.writeFileSync(path.join(root,`${stem}-lesson.js`),`const ${symbol}_LESSON = (() => {\n  const lesson = ${JSON.stringify(result.lesson,null,2)};\n  lesson.chapterData.captionCues = ${symbol}_CAPTION_CUES;\n  return lesson;\n})();\n`);
for (const [name, data] of [['caption-cues',result.captions],['practice-cues',result.units]]) fs.writeFileSync(path.join(__dirname,`${name}.json`),JSON.stringify(data,null,2)+'\n');
const stamp=s=>{const ms=Math.round(s*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
for (const [lang,field] of [['de','text'],['vi','vi']]) fs.writeFileSync(path.join(__dirname,`${key}.${lang}.vtt`),'WEBVTT\n\n'+result.captions.map(c=>`${c.id}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c[field]}`).join('\n\n')+'\n');
execFileSync(process.execPath,['scripts/build-kino-metadata.cjs'],{cwd:root,stdio:'inherit'});
console.log(JSON.stringify({baseline:367,added:added.length,total:result.captions.length,supersededDrafts:supersededDrafts.map(d=>d.cue.id),chapterAdjustments:review.chapterAdjustments||[]}));
