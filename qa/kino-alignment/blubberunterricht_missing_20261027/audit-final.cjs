const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-cues-19.json'))),review=JSON.parse(fs.readFileSync(path.join(__dirname,'review.json')));
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'spongebob-blubberunterricht-aligned.js'),'utf8')+fs.readFileSync(path.join(root,'spongebob-blubberunterricht-lesson.js'),'utf8')+';this.snapshot=JSON.stringify({captions:SPONGEBOB_BLUBBERUNTERRICHT_CAPTION_CUES,units:SPONGEBOB_BLUBBERUNTERRICHT_ALIGNED_UTTERANCES,lesson:SPONGEBOB_BLUBBERUNTERRICHT_LESSON});',context);
const data=JSON.parse(context.snapshot);assert.equal(data.captions.length,19+review.added.length);assert.equal(data.units.length,data.captions.length);
for(const type of ['captions','units']){
 for(const old of baseline[type])assert.deepEqual(data[type].find(c=>c.id===old.id),old,`Changed old ${type} ${old.id}`);
 assert.equal(new Set(data[type].map(c=>c.id)).size,data[type].length);
 for(let i=1;i<data[type].length;i++)assert(data[type][i-1].end<=data[type][i].start,`Overlap ${type}`);
}
assert.deepEqual(data.lesson.chapterData.chapters,baseline.lesson.chapterData.chapters);assert.deepEqual(data.lesson.flashcards,baseline.lesson.flashcards);assert.deepEqual(data.lesson.video,baseline.lesson.video);
assert.deepEqual(data.captions.filter(c=>c.id>1600119).map(c=>c.id).sort((a,b)=>a-b),review.added.map(c=>c.id));
for(const cue of data.captions)assert.equal(data.lesson.chapterData.chapters.filter(c=>c.start<=cue.start&&c.end>=cue.end).length,1);
for(const part of review.reviewNeeded)assert(!data.captions.some(c=>c.start<part.end&&c.end>part.start),`Review interval leaked into captions #${part.candidate}`);
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-aligned-sha256.json')));let unchanged=0;
for(const[file,hash]of Object.entries(hashes))if(file!=='spongebob-blubberunterricht-aligned.js'){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex'),hash,file);unchanged++;}
for(const lang of ['de','vi']){const text=fs.readFileSync(path.join(__dirname,`spongebob_blubberunterricht.${lang}.vtt`),'utf8');assert.equal((text.match(/ --> /g)||[]).length,data.captions.length);}
const meta=vm.createContext({KinoData:{captions:()=>[]}});vm.runInContext(fs.readFileSync(path.join(root,'kino-metadata.js'),'utf8')+';this.count=SPONGEBOB_BLUBBERUNTERRICHT_LESSON.chapterData.cueCount;',meta);assert.equal(meta.count,data.captions.length);
const {execFileSync}=require('node:child_process');
const oldMetaSource=execFileSync('git',['show',`${baseline.baseRevision}:kino-metadata.js`],{cwd:root,encoding:'utf8'});
const newMetaSource=fs.readFileSync(path.join(root,'kino-metadata.js'),'utf8');
const names=[...oldMetaSource.matchAll(/const (\w+_LESSON) =/g)].map(m=>m[1]);
function metadataSnapshot(source){const c=vm.createContext({KinoData:{captions:()=>[]}});vm.runInContext(source+';this.out=JSON.stringify({'+names.map(n=>n+':'+n).join(',')+'});',c);return JSON.parse(c.out);}
const oldMeta=metadataSnapshot(oldMetaSource),newMeta=metadataSnapshot(newMetaSource);
newMeta.SPONGEBOB_BLUBBERUNTERRICHT_LESSON.chapterData.cueCount=19;
assert.deepEqual(newMeta,oldMeta,'Metadata changed beyond the selected lesson cueCount');
const summary={baseRevision:baseline.baseRevision,captionCues:data.captions.length,practiceCues:data.units.length,added:review.added.length,all19OriginalCaptionsAndPracticeUnchanged:true,chapters:2,picks:14,flashcards:12,chaptersPicksCardsUnchanged:true,overlaps:0,duplicateIds:0,unchangedOtherAlignedFiles:unchanged,metadataOnlySelectedCueCountChanged:true,reviewNeeded:review.reviewNeeded.length,reviewNeededPolicy:'Kept only in review.json; no reviewed part selected into learning data',pass:true};
fs.writeFileSync(path.join(__dirname,'final-data-verification.json'),JSON.stringify(summary,null,2)+'\n');
for(const[type,name]of [['captions','caption-cues'],['units','practice-cues']])fs.writeFileSync(path.join(__dirname,`${name}.json`),JSON.stringify(data[type],null,2)+'\n');
console.log(JSON.stringify(summary));
