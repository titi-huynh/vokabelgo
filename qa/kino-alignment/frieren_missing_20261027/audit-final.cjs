const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),base='d1204a4b47d41096f4e5b5d71e667be0de338413';
const stem='frieren-s01e02',symbol='FRIEREN_S01E02',sourceFile='qa/kino-alignment/season1-episode2/frieren_s01e02.json';
const original=file=>execFileSync('git',['show',`${base}:${file}`],{cwd:root,encoding:'utf8'}),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function snapshot(aligned,lesson){const c=vm.createContext({});vm.runInContext(aligned+lesson+`;this.snapshot=JSON.stringify({captions:${symbol}_CAPTION_CUES,units:${symbol}_ALIGNED_UTTERANCES,lesson:${symbol}_LESSON});`,c);return JSON.parse(c.snapshot);}
const before=snapshot(original(stem+'-aligned.js'),original(stem+'-lesson.js')),after=snapshot(read(stem+'-aligned.js'),read(stem+'-lesson.js'));
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'review.json'),'utf8'));
assert.equal(before.captions.length,235);assert.equal(before.units.length,235);
assert.deepEqual(review.added.map(c=>c.id),Array.from({length:review.added.length},(_,i)=>1300248+i));
for(const kind of ['captions','units']){
  assert.equal(after[kind].length,235+review.added.length);
  assert.equal(new Set(after[kind].map(c=>c.id)).size,after[kind].length);
  for(const old of before[kind])assert.deepEqual(after[kind].find(c=>c.id===old.id),old,`Changed existing ${kind}/${old.id}`);
  after[kind].forEach((cue,i)=>{assert(cue.start>=0&&cue.end>cue.start&&cue.end<=1560.102313);assert(!i||cue.start>=after[kind][i-1].end,`Overlap ${cue.id}`);assert(!cue.reviewNeeded&&!cue.practiceExcluded);});
  for(const cue of review.added)for(const field of ['id','parentId','start','end','speaker','text','vi'])assert.equal(after[kind].find(c=>c.id===cue.id)[field],cue[field],`${cue.id}/${field}`);
}
const expectedLesson=structuredClone(before.lesson);expectedLesson.chapterData.cueCount=after.captions.length;expectedLesson.chapterData.captionCues=after.captions;
assert.deepEqual(after.lesson,expectedLesson,'Unrelated lesson/chapter/pick/card changed');
for(const cue of after.captions)assert.equal(after.lesson.chapterData.chapters.filter(c=>cue.start>=c.start&&cue.end<=c.end).length,1,`Chapter coverage ${cue.id}`);
for(const file of ['kino-practice-data.js','kino-anime-flashcards.js'])assert.equal(read(file).replace(/\r\n/g,'\n'),original(file).replace(/\r\n/g,'\n'),file);
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline-aligned-sha256.json'),'utf8'));let other=0;
for(const [file,sha]of Object.entries(hashes)){if(file===stem+'-aligned.js')continue;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,file);other++;}
const expectedMetadata=original('kino-metadata.js').replace(/\r\n/g,'\n').split('\n').map(line=>line.startsWith('const FRIEREN_S01E02_LESSON =')?line.replace('"cueCount":235',`"cueCount":${after.captions.length}`):line).join('\n');
assert.equal(read('kino-metadata.js').replace(/\r\n/g,'\n'),expectedMetadata,'Unrelated metadata changed');
const source=JSON.parse(read(sourceFile)),oldSource=JSON.parse(original(sourceFile));
for(const old of oldSource.cues){const preserved=source.cues.find(c=>c.id===old.id)||source.missingDialogueReview.supersededDrafts.find(c=>c.cue.id===old.id)?.cue;assert.deepEqual(preserved,old,`Lost original draft ${old.id}`);}
const {build,definitions}=require(path.join(root,'scripts/build-muse-anime-lessons.cjs'));
const rebuilt=build(source,definitions.find(d=>d.key==='frieren_s01e02'));assert.deepEqual(rebuilt.captions,after.captions);assert.deepEqual(rebuilt.units,after.units);
const config=JSON.parse(read('vercel.json')),oldConfig=JSON.parse(original('vercel.json'));oldConfig.git.deploymentEnabled['codex/kino-frieren-missing-lines']=false;assert.deepEqual(config,oldConfig);
const result={baseRevision:base,baseline:235,baselinePublishedMaxId:1300243,sourceReservedMaxId:1300247,newIdsStart:1300248,added:review.added.length,total:after.captions.length,existingCaptionsAndPracticeCuesUnchanged:true,nonoverlapping:true,uniqueSequentialNewIds:true,oldDraftsPreserved:true,allCuesInsideOneChapter:true,chaptersPicksAndFlashcardsUnchanged:true,otherAlignedFilesUnchanged:other,sourceBuilderReproducesRuntime:true,branchAutoDeployDisabled:true};
fs.writeFileSync(path.join(__dirname,'final-data-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
