'use strict';
// Focused invariants for deck selection, question validity and learning evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('./cat-island-learning.js'), 'utf8');
const schema = require('./vocabulary-schema.js');
const typing = require('./typing-verification.js');
const cards = [
  {id:'haus',term:'das Haus, -¨er',meaning:'ngôi nhà',deck:'Của chị',example:'Das Haus ist klein.'},
  {id:'baum',term:'der Baum, -¨e',meaning:'cây',deck:'Của chị',example:'Der Baum ist hoch.'},
  {id:'katze',term:'die Katze, -n',meaning:'con mèo',deck:'Của chị',example:'Die Katze schläft.'},
  {id:'boot',term:'das Boot, -e',meaning:'chiếc thuyền',deck:'Khác',example:'Das Boot ist rot.'},
  {id:'satz',term:'zum Mitnehmen',meaning:'mang đi',deck:'Khác',example:'Ein Brot zum Mitnehmen, bitte.'}
];
function environment(extra={}) {
  const store = new Map();
  const window = {localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))},
    VokabelCardSchema:schema,VokabelTypingVerification:typing,allCards:()=>cards,...extra};
  vm.runInNewContext(source,{window,console,Date,Math,Set,Map});
  return {api:window.CatIslandLearning,window,store};
}
function questionOf(api,type,options={}) {
  for(let seed=0;seed<100;seed++) {
    const session=api.createSession({cards,seed,...options});
    for(let n=0;n<12;n++) {
      const q=session.nextQuestion();if(!q)break;
      if(q.type===type)return {session,q};
      session.answer(q.id,q.answer);
    }
  }
  throw Error('Could not generate '+type);
}
function today() {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
let passed=0;
function test(name,fn) {try {fn();passed++;console.log('PASS '+name);}catch(e){console.error('FAIL '+name);throw e;}}

test('catalog uses selected real/custom deck and excludes grammar or incomplete entries',()=>{
  const {api}=environment();const data=cards.concat({id:'grammar',term:'Akkusativ',meaning:'ngữ pháp',deck:'Grammatik'}, {id:'bad',term:'Hallo'},cards[0]);
  const catalog=api.catalog(data);assert.equal(catalog.total,5);assert.equal(catalog.excluded,3);
  assert.equal(catalog.decks.find(d=>d.id==='Của chị').count,3);
  const s=api.createSession({cards:data,deck:'Của chị',seed:9});
  for(let i=0;i<12;i++){const q=s.nextQuestion();assert.ok(q);assert.ok(['haus','baum','katze'].includes(q.cardId));s.answer(q.id,q.answer);}
  assert.equal(s.nextQuestion(),null);
});
test('tiny decks do not duplicate a pending word and refill after resolution',()=>{
  const {api}=environment();const s=api.createSession({cards:[cards[0]],seed:1,limit:3});
  const a=s.nextQuestion();assert.ok(a);assert.equal(s.nextQuestion(),null);s.answer(a.id,a.answer);assert.ok(s.nextQuestion());
});
test('all five methods are available when source content supports them',()=>{
  const {api}=environment();for(const type of ['recall','meaning','context','order','listen']) assert.equal(questionOf(api,type,{canListen:true}).q.type,type);
});
test('plural annotations are display-only and never an answer requirement',()=>{
  const {api}=environment();const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});
  assert.equal(q.answer,'das Haus');assert.equal(session.answer(q.id,'das Haus').correct,true);
});
test('context uses an existing example and replaces only a whole lexical span',()=>{
  const {api}=environment();const {q}=questionOf(api,'context');assert.ok(q.example.includes('____'));
  const original=cards.find(c=>c.id===q.cardId).example;assert.equal(q.example.replace('____',q.answer),original);
  const s=api.createSession({cards:[{id:'bad-context',term:'die Art',meaning:'loại',example:'Der Artikel ist lang.'}],seed:7,limit:20});
  for(let i=0;i<20;i++){const next=s.nextQuestion();assert.notEqual(next.type,'context');s.answer(next.id,next.answer);}
});
test('no identical canonical word can be a meaning distractor',()=>{
  const {api}=environment();const data=cards.concat({id:'duplicate',term:'das Haus',meaning:'căn nhà',deck:'Của chị'});
  const {q}=questionOf(api,'meaning',{cards:data});assert.equal(new Set(q.options).size,q.options.length);
  if(q.cardId==='haus')assert.ok(!q.options.includes('căn nhà'));
});
test('blank answer creates no evidence; retry, hint and skip never count as independent',()=>{
  const {api}=environment();const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});
  session.answer(q.id,' ');assert.equal(session.summary().attempts,0);
  assert.equal(session.answer(q.id,'falsch').correct,false);assert.equal(session.answer(q.id,q.answer).correct,true);
  assert.equal(session.summary().independentWords,0);assert.equal(session.summary().weakWords.length,1);
  const q2=session.nextQuestion();session.hint(q2.id);session.answer(q2.id,q2.answer);assert.equal(session.summary().independentWords,0);
  const q3=session.nextQuestion();session.skip(q3.id);assert.equal(session.summary().skipped,1);
});
test('missing article is almost and remains unresolved until repaired',()=>{
  const {api}=environment();const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});
  const partial=session.answer(q.id,'Haus');assert.equal(partial.almost,true);assert.equal(partial.resolved,false);
  const repaired=session.answer(q.id,'das Haus');assert.equal(repaired.correct,true);assert.equal(repaired.independent,false);
});
test('first-try accuracy counts questions rather than repeated attempts or skips',()=>{
  const {api}=environment();const s=api.createSession({cards,seed:13});
  const a=s.nextQuestion();s.answer(a.id,'definitely wrong');s.answer(a.id,a.answer);
  const b=s.nextQuestion();s.answer(b.id,b.answer);
  const c=s.nextQuestion();s.skip(c.id);
  assert.equal(s.summary().attempts,3);assert.equal(s.summary().questionsAttempted,2);assert.equal(s.summary().firstTryAccuracy,50);
  assert.equal(api.createSession({cards}).summary().firstTryAccuracy,null);
});
test('NFC-equivalent typed answers are accepted',()=>{
  const {api}=environment();const {session,q}=questionOf(api,'recall',{cards:[{id:'g',term:'grün',meaning:'xanh'}]});
  assert.equal(session.answer(q.id,'gru\u0308n').correct,true);
});
test('duplicate answer and finish cannot issue duplicate practice or rewards',()=>{
  const {api,store}=environment();const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});
  session.answer(q.id,q.answer);const again=session.answer(q.id,q.answer);assert.equal(again.alreadyResolved,true);assert.equal(session.summary().ordersCompleted,1);
  const a=session.finish(),b=session.finish();assert.strictEqual(a,b);assert.equal(JSON.parse(store.get(api.storageKey)).cards.haus.sessions,1);assert.equal(session.nextQuestion(),null);
});
test('listening failure changes the exercise and records no listening credit',()=>{
  const {api}=environment();const {session,q}=questionOf(api,'listen',{canListen:true});
  const fallback=session.fallbackListening(q.id);assert.equal(fallback.type,'meaning');assert.equal(fallback.speechText,'');
  session.answer(q.id,fallback.answer);const summary=session.summary();assert.equal(summary.byType.listen,undefined);assert.ok(summary.byType.meaning);
});
test('unavailable/quota storage is reported and never advances shared scheduling',()=>{
  let scheduled=0;const {api}=environment({localStorage:{getItem:()=>null,setItem:()=>{throw Error('quota');}},VokabelSRS:{scheduleReview:()=>scheduled++}});
  const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});session.answer(q.id,q.answer);assert.equal(session.finish().saved,false);assert.equal(scheduled,0);
});
test('recognition alone never schedules SRS or records recall mastery',()=>{
  let count=0;const {api}=environment({VokabelSRS:{scheduleReview:()=>count++},VokabelLearningState:{recordRecallSuccess:()=>count++}});
  const {session,q}=questionOf(api,'meaning');session.answer(q.id,q.answer);session.finish();assert.equal(count,0);
});
test('typed evidence schedules once and hint/retry cannot become Good',()=>{
  for(const assisted of [false,true]) {
    const records=new Map(),ratings=[],successes=[];
    const {api}=environment({VokabelSRS:{getCard:id=>records.get(id),scheduleReview:(id,rating,at)=>{ratings.push(rating);const r={lastScheduledAt:at};records.set(id,r);return r;}},VokabelLearningState:{recordRecallSuccess:id=>successes.push(id)}});
    const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});if(assisted)session.hint(q.id);session.answer(q.id,q.answer);
    assert.equal(session.finish().sharedScheduled,1);session.finish();assert.deepEqual(ratings,[assisted?1:3]);assert.equal(successes.length,assisted?0:1);
    const next=questionOf(api,'recall',{cards:[cards[0]]});next.session.answer(next.q.id,next.q.answer);assert.equal(next.session.finish().sharedScheduled,0);
  }
});
test('future due cards and unfinished Today targets retain existing schedule',()=>{
  for(const guard of ['future','today']) {
    let count=0;const {api,store}=environment({VokabelSRS:{getCard:()=>guard==='future'?{dueAt:new Date(Date.now()+86400000*3).toISOString()}:null,scheduleReview:()=>count++}});
    if(guard==='today')store.set('vokabelgo_learning_session_v1',JSON.stringify({date:today(),completed:false,targetIds:['haus']}));
    const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});session.answer(q.id,q.answer);assert.equal(session.finish().sharedScheduled,0);assert.equal(count,0);
  }
});
test('weak-only replay uses missed words from the finished session',()=>{
  const {api}=environment();const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});session.skip(q.id);session.finish();
  const weak=api.createSession({cards,weakOnly:true,seed:8});assert.equal(weak.weakOnlyApplied,true);assert.equal(weak.nextQuestion().cardId,'haus');
});
test('forgetting a recently reviewed word flags review without rescheduling it',()=>{
  let scheduled=0,failed=0;
  const {api}=environment({VokabelSRS:{getCard:()=>({lastScheduledAt:new Date().toISOString(),dueAt:new Date(Date.now()+86400000).toISOString()}),scheduleReview:()=>scheduled++},VokabelLearningState:{recordRecallFailure:()=>failed++}});
  const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});session.answer(q.id,'falsch');session.answer(q.id,q.answer);session.finish();
  assert.equal(scheduled,0);assert.equal(failed,1);
});
test('real repository FSRS and learning modules persist only eligible typed evidence',()=>{
  const {api,window,store}=environment();
  window.FSRS=require('./vendor/ts-fsrs/index.cjs');
  const ctx=vm.createContext({window,localStorage:window.localStorage,console,Date,Math,Set,Map});
  for(const file of ['fsrs-srs.js','learning-session.js'])vm.runInContext(fs.readFileSync(require.resolve('./'+file),'utf8'),ctx);
  const {session,q}=questionOf(api,'recall',{cards:[cards[0]]});session.answer(q.id,q.answer);
  assert.equal(session.finish().sharedScheduled,1);
  const scheduled=window.VokabelSRS.getCard('haus');assert.equal(scheduled.lastRating,3);assert.equal(scheduled.historyCount,1);
  const learned=JSON.parse(store.get('vokabelgo_learning_state_v1')).cards.haus;
  assert.equal(learned.successCount,1);assert.notEqual(learned.status,'mastered');
  const second=questionOf(api,'recall',{cards:[cards[0]]});second.session.answer(second.q.id,second.q.answer);second.session.finish();
  assert.equal(window.VokabelSRS.getCard('haus').historyCount,1);
});
console.log(`${passed} Cat Island learning checks passed.`);
