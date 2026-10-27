const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'../../..'), base = 'eed6b2dee89d7abcdcdab2285e1abfcab6ce9a79';
const stem='delicious-in-dungeon-s01e01',symbol='DELICIOUS_IN_DUNGEON_S01E01';
const fromBase=file=>execFileSync('git',['show',`${base}:${file}`],{cwd:root,encoding:'utf8'});
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function snapshot(aligned,lesson){const c=vm.createContext({});vm.runInContext(aligned+lesson+`;this.data=JSON.stringify({captions:${symbol}_CAPTION_CUES,units:${symbol}_ALIGNED_UTTERANCES,lesson:${symbol}_LESSON});`,c);return JSON.parse(c.data);}
const before=snapshot(fromBase(stem+'-aligned.js'),fromBase(stem+'-lesson.js'));
const after=snapshot(read(stem+'-aligned.js'),read(stem+'-lesson.js'));
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'review.json'),'utf8'));
assert.equal(before.captions.length,367);
for(const kind of ['captions','units']){
  for(const old of before[kind])assert.deepEqual(after[kind].find(c=>c.id===old.id),old,`Changed old ${kind}/${old.id}`);
  assert.equal(after[kind].length,367+review.added.length);
  assert.equal(new Set(after[kind].map(c=>c.id)).size,after[kind].length);
  after[kind].forEach((c,i)=>{assert(c.start>=0&&c.end>c.start&&c.end<=1607.488);assert(!i||c.start>=after[kind][i-1].end,`Overlap at ${c.id}`);});
}
assert.deepEqual(after.lesson.flashcards,before.lesson.flashcards);
assert.deepEqual(after.lesson.chapterData.chapters.map(c=>c.picks),before.lesson.chapterData.chapters.map(c=>c.picks));
assert.equal(after.lesson.chapterData.cueCount,after.captions.length);
for(const cue of after.captions)assert.equal(after.lesson.chapterData.chapters.filter(c=>cue.start>=c.start&&cue.end<=c.end).length,1,`Chapter coverage ${cue.id}`);
assert.deepEqual(review.added.map(c=>c.id),Array.from({length:review.added.length},(_,i)=>1200385+i));
for(const cue of review.added)for(const field of ['id','start','end','speaker','text','vi'])assert.equal(after.captions.find(c=>c.id===cue.id)[field],cue[field],`${cue.id}/${field}`);
assert.equal(read('kino-practice-data.js').replace(/\r\n/g,'\n'),fromBase('kino-practice-data.js').replace(/\r\n/g,'\n'),'Curated picks changed');
assert.equal(read('kino-anime-flashcards.js').replace(/\r\n/g,'\n'),fromBase('kino-anime-flashcards.js').replace(/\r\n/g,'\n'),'Curated flashcards changed');
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-aligned-sha256.json'),'utf8'));
const crypto=require('node:crypto');let other=0;
for(const [file,sha]of Object.entries(hashes)){if(file===stem+'-aligned.js')continue;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,file);other++;}
const {build,definitions}=require(path.join(root,'scripts/build-muse-anime-lessons.cjs'));
const source=JSON.parse(read('qa/kino-alignment/muse-two-films/delicious_in_dungeon_s01e01.json'));
const regenerated=build(source,definitions.find(d=>d.key==='delicious_in_dungeon_s01e01'));
assert.deepEqual(regenerated.captions,after.captions);assert.deepEqual(regenerated.units,after.units);
const config=JSON.parse(read('vercel.json'));
assert.equal(config.git.deploymentEnabled['codex/kino-dungeon-missing-lines'],false);
const report={baseRevision:base,baseline:367,added:review.added.length,total:after.captions.length,existingCaptionsAndPracticeCuesUnchanged:true,nonoverlapping:true,uniqueSequentialNewIds:true,allCuesInsideOneChapter:true,shortlistAndFlashcardsUnchanged:true,otherAlignedFilesUnchanged:other,sourceBuilderReproducesRuntime:true,branchAutoDeployDisabled:true};
fs.writeFileSync(path.join(__dirname,'final-data-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
