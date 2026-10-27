const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-cues-60.json'))),review=JSON.parse(fs.readFileSync(path.join(__dirname,'review.json')));
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'spongebob-pizza-aligned.js'),'utf8')+fs.readFileSync(path.join(root,'spongebob-pizza-lesson.js'),'utf8')+';this.snapshot=JSON.stringify({captions:SPONGEBOB_PIZZA_CAPTION_CUES,units:SPONGEBOB_PIZZA_ALIGNED_UTTERANCES,lesson:SPONGEBOB_PIZZA_LESSON});',context);
const data=JSON.parse(context.snapshot);assert.equal(data.captions.length,60+review.added.length);assert.equal(data.units.length,data.captions.length);
for(const type of ['captions','units']){
 for(const old of baseline[type])assert.deepEqual(data[type].find(c=>c.id===old.id),old,`Changed old ${type} ${old.id}`);
 assert.equal(new Set(data[type].map(c=>c.id)).size,data[type].length);
 for(let i=1;i<data[type].length;i++)assert(data[type][i-1].end<=data[type][i].start,`Overlap ${type}`);
}
assert.deepEqual(data.lesson.chapterData.chapters,baseline.lesson.chapterData.chapters);assert.deepEqual(data.lesson.flashcards,baseline.lesson.flashcards);assert.deepEqual(data.lesson.video,baseline.lesson.video);
assert.deepEqual(data.captions.filter(c=>c.id>1200162).map(c=>c.id).sort((a,b)=>a-b),review.added.map(c=>c.id));
for(const cue of data.captions)assert.equal(data.lesson.chapterData.chapters.filter(c=>c.start<=cue.start&&c.end>=cue.end).length,1);
for(const part of review.reviewNeeded)assert(!data.captions.some(c=>c.start<part.end&&c.end>part.start),`Review interval leaked into captions #${part.candidate}`);
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-aligned-sha256.json')));let unchanged=0;
for(const[file,hash]of Object.entries(hashes))if(file!=='spongebob-pizza-aligned.js'){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex'),hash,file);unchanged++;}
for(const lang of ['de','vi']){const text=fs.readFileSync(path.join(__dirname,`spongebob_pizza.${lang}.vtt`),'utf8');assert.equal((text.match(/ --> /g)||[]).length,data.captions.length);}
const meta=vm.createContext({KinoData:{captions:()=>[]}});vm.runInContext(fs.readFileSync(path.join(root,'kino-metadata.js'),'utf8')+';this.count=SPONGEBOB_PIZZA_LESSON.chapterData.cueCount;',meta);assert.equal(meta.count,data.captions.length);
const summary={baseRevision:baseline.baseRevision,captionCues:data.captions.length,practiceCues:data.units.length,added:review.added.length,all60OriginalCaptionsAndPracticeUnchanged:true,chapters:3,picks:21,flashcards:18,chaptersPicksCardsUnchanged:true,overlaps:0,duplicateIds:0,unchangedOtherAlignedFiles:unchanged,reviewNeeded:review.reviewNeeded.length,reviewNeededPolicy:'Kept only in review.json; no reviewed part selected into learning data',pass:true};
fs.writeFileSync(path.join(__dirname,'final-data-verification.json'),JSON.stringify(summary,null,2)+'\n');
for(const[type,name]of [['captions','caption-cues'],['units','practice-cues']])fs.writeFileSync(path.join(__dirname,`${name}.json`),JSON.stringify(data[type],null,2)+'\n');
console.log(JSON.stringify(summary));
