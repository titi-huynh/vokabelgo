/* Cat Island learning: repository vocabulary, varied questions and honest evidence.
 * This module owns no DOM. Recognition and assisted practice never become mastery.
 */
(function (root, factory) {
  const api = factory(root);
  root.CatIslandLearning = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  const KEY = 'vokabelgo_cat_island_learning_v1';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const text = v => typeof v === 'string' ? v.trim() : '';
  const normalize = v => String(v == null ? '' : v).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
  const dateKey = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
  function storage() { try { return root.localStorage || null; } catch (_) { return null; } }
  function read(key, fallback) { try { const v = JSON.parse(storage()?.getItem(key) || 'null'); return v && typeof v === 'object' && !Array.isArray(v) ? v : fallback; } catch (_) { return fallback; } }
  function write(key, value) { try { const s = storage(); if (!s) return false; s.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } }
  function history() { const h = read(KEY, {}); return {version:1, cards:Object.assign(Object.create(null), h.cards && typeof h.cards === 'object' && !Array.isArray(h.cards) ? h.cards : {}), sessions:Array.isArray(h.sessions) ? h.sessions.slice(-30) : []}; }
  function dependency(name, file) { if (root[name]) return root[name]; if (typeof require === 'function') { try { return require(file); } catch (_) {} } return null; }
  function seeded(seed) { let a = Number(seed) >>> 0; return () => { a += 0x6D2B79F5; let t = Math.imul(a ^ a >>> 15, 1 | a); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(list, rng) { const a = list.slice(); for (let i=a.length-1;i>0;i--) { const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  const regexpEscape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function normalizedCards(source) {
    const schema = dependency('VokabelCardSchema', './vocabulary-schema.js');
    let raw = source;
    if (!raw) { try { raw = root.allCards?.(); } catch (_) {} }
    if (!raw && typeof require === 'function') { try { raw = require('./vokabel-cards-data.js').allCards(); } catch (_) {} }
    const cards = [], seen = new Set(); let excluded=0;
    for (const c of Array.isArray(raw) ? raw : []) {
      if (!c || typeof c !== 'object') { excluded++; continue; }
      const id = String(c.id ?? '').trim(), term = text(c.term || c.de), meaning = text(c.meaning || c.vi);
      if (!id || !term || !meaning || seen.has(id) || term.length>160 || meaning.length>500) { excluded++; continue; }
      seen.add(id);
      let p; try { p = schema?.normalizeCard(c); } catch (_) {}
      if (p?.needsManualReview || ['grammar','content','question'].includes(p?.cardType)) { excluded++; continue; }
      const answer = text(p?.canonicalAnswer) || term;
      const eligible = p ? !!p.objectiveTypingEligible : !/[\/;?+…]/.test(term) && answer.length<=60;
      cards.push({id, term, meaning, answer, deck:text(c.deck)||'Khác', example:text(c.example), profile:p, eligible, raw:c});
    }
    return {cards,excluded};
  }
  function catalog(source) {
    const {cards,excluded} = normalizedCards(source), counts=new Map();
    cards.forEach(c=>counts.set(c.deck,(counts.get(c.deck)||0)+1));
    return {total:cards.length,excluded,decks:[{id:'',label:'Tất cả bộ từ',count:cards.length},...Array.from(counts,([id,count])=>({id,label:id,count})).sort((a,b)=>a.label.localeCompare(b.label,'vi'))]};
  }
  function cloze(card) {
    if (!card.example || card.example.length>230 || !card.eligible) return null;
    const terms=[card.answer,card.profile?.headword].filter(Boolean);
    for (const term of terms) {
      if (term.length<3) continue;
      const rx=new RegExp(`(?<![\\p{L}\\p{M}])${regexpEscape(term)}(?![\\p{L}\\p{M}])`,'iu');
      const match=rx.exec(card.example);
      if (match) return {example:card.example.slice(0,match.index)+'____'+card.example.slice(match.index+match[0].length),answer:match[0]};
    }
    return null;
  }
  function meaningParts(s) { return normalize(s).split(/[;/()]/).map(x=>x.trim()).filter(x=>x.length>=3); }
  function overlaps(a,b) { const p=meaningParts(a), q=meaningParts(b); return normalize(a)===normalize(b) || p.some(x=>q.includes(x)); }

  class Session {
    constructor(options={}) {
      this.id='ci-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
      this.deck=text(options.deck); this.mode=options.mode==='rush'?'rush':'calm';
      this.limit=Math.max(1,Math.min(100,Number(options.limit)||12));
      this.rng=seeded(options.seed ?? (Date.now()%4294967296)); this.canListen=!!options.canListen;
      this.pool=normalizedCards(options.cards).cards.filter(c=>!this.deck||c.deck===this.deck);
      this.historical=history(); this.issued=new Map(); this.evidence=new Map();
      this.queue=[]; this.count=0; this.lastCards=[]; this.lastType=''; this.closed=false; this.finalReport=null;
      const state=read('vokabelgo_learning_state_v1',{}).cards||{}, srs=read('vokabelgo_srs_state_v1',{}).cards||{};
      const isWeak=c=>!!this.historical.cards[c.id]?.needsReview || !!state[c.id]?.needsReview;
      this.weakOnlyApplied=!!options.weakOnly && this.pool.some(isWeak);
      if (this.weakOnlyApplied) this.pool=this.pool.filter(isWeak);
      this.notice=options.weakOnly&&!this.weakOnlyApplied?'Chưa có từ cần ôn riêng; đang luyện bộ đã chọn.':'';
      this.pool=this.pool.map(c=>({c,rank:this.rng(),priority:(isWeak(c)?60:0)+(srs[c.id]?.dueAt&&dateKey(srs[c.id].dueAt)<=dateKey(Date.now())?40:0)})).sort((a,b)=>b.priority-a.priority||a.rank-b.rank).map(x=>x.c);
      this.queue=this.pool.slice();
    }
    _options(card) {
      const choices=[card.meaning];
      for (const c of shuffle(this.pool,this.rng)) {
        if (normalize(c.answer)===normalize(card.answer) || choices.some(m=>overlaps(m,c.meaning))) continue;
        choices.push(c.meaning); if (choices.length===4) break;
      }
      return choices.length>1 ? shuffle(choices,this.rng) : [];
    }
    nextQuestion() {
      if (this.closed || this.count>=this.limit || !this.pool.length) return null;
      if (!this.queue.length) this.queue=shuffle(this.pool,this.rng);
      // Avoid re-showing a word still visible on another customer boat.
      const pending=new Set(Array.from(this.issued.values()).filter(s=>!s.resolved).map(s=>s.card.id));
      let ix=this.queue.findIndex(c=>!pending.has(c.id)&&!this.lastCards.slice(-Math.min(2,this.pool.length-1)).includes(c.id));
      if (ix<0) ix=this.queue.findIndex(c=>!pending.has(c.id));
      if (ix<0) return null; // A tiny deck must not create simultaneous duplicate orders.
      const card=this.queue.splice(ix,1)[0], context=cloze(card), options=this._options(card);
      const types=[];
      if (card.eligible) types.push('recall');
      if (options.length) types.push('meaning');
      if (context) types.push('context');
      if (card.eligible&&card.answer.split(/\s+/).length>=2&&card.answer.split(/\s+/).length<=8) types.push('order');
      if (this.canListen&&options.length&&card.eligible) types.push('listen');
      if (!types.length) types.push('meaning');
      const candidates=types.filter(t=>t!==this.lastType);
      const sequence=['meaning','recall','context','order','listen'];
      let type=(candidates.length?candidates:types).find(t=>t===sequence[this.count%sequence.length]);
      if (!type) type=(candidates.length?candidates:types)[Math.floor(this.rng()*(candidates.length||types.length))];
      // Singleton recognition cards remain playable with text; no fake distractor answers.
      if (type==='meaning'&&!options.length&&card.eligible) type='recall';
      let answer=card.answer, prompt=card.meaning, example='', tokens=[];
      if (type==='meaning'||type==='listen') {answer=card.meaning;prompt=type==='listen'?'Nghe lời khách và chọn nghĩa phù hợp':card.term;}
      if (type==='context') {answer=context.answer;example=context.example;prompt=card.meaning;}
      if (type==='order') {tokens=shuffle(card.answer.split(/\s+/),this.rng);if(tokens.join(' ')===card.answer)tokens=tokens.slice(1).concat(tokens[0]);}
      const question={id:this.id+'-'+(++this.count),cardId:card.id,type,term:card.term,meaning:card.meaning,prompt,answer,options:(type==='meaning'||type==='listen')?options:[],tokens,speechText:type==='listen'?card.answer:'',example,hint:answer.slice(0,1)+'…'};
      this.issued.set(question.id,{q:question,card,attempts:0,wrong:false,almost:false,hinted:false,resolved:false,skipped:false,firstResult:null});
      this.lastCards.push(card.id);this.lastType=type;return question;
    }
    _record(s) {
      let e=this.evidence.get(s.card.id);
      if (!e) {e={id:s.card.id,term:s.card.term,meaning:s.card.meaning,attempts:0,hadWrong:false,assisted:false,independent:false,typed:false,typedWrong:false,typedAlmost:false,typedAssisted:false,typedCorrect:false,methods:new Set()};this.evidence.set(s.card.id,e);}
      e.methods.add(s.q.type);return e;
    }
    answer(id,input) {
      const s=this.issued.get(id);
      if (!s||this.closed) return {correct:false,resolved:false,alreadyResolved:true,feedback:'Lượt này đã kết thúc.'};
      if (s.resolved) return {correct:!s.skipped,resolved:true,alreadyResolved:true,independent:false,canonical:s.q.answer,type:s.q.type,feedback:'Đơn này đã được xử lý.'};
      const submitted=Array.isArray(input)?input.join(' '):String(input??'');
      if (!normalize(submitted)) return {correct:false,resolved:false,alreadyResolved:false,feedback:'Chọn hoặc nhập đáp án trước nhé.',canonical:s.q.answer,type:s.q.type};
      let correct=normalize(submitted)===normalize(s.q.answer), almost=false;
      const typing=dependency('VokabelTypingVerification','./typing-verification.js');
      if (!correct&&['recall','context'].includes(s.q.type)&&typing) almost=typing.gradeTypingAnswer(submitted,s.q.answer,s.card.raw).result==='almost';
      s.attempts++;s.firstResult??=correct?'correct':almost?'almost':'wrong';
      if (!correct) {s.wrong||=!almost;s.almost||=almost;}
      const e=this._record(s);e.attempts++;e.hadWrong||=!correct;
      if (s.q.type==='recall') {e.typed=true;e.typedWrong||=!correct&&!almost;e.typedAlmost||=almost;e.typedAssisted||=s.hinted;e.typedCorrect||=correct;}
      if (correct) {
        s.resolved=true;s.independent=s.attempts===1&&!s.hinted;
        e.assisted||=!s.independent;e.independent||=s.independent;
        if ((s.hinted||s.wrong||s.almost)&&this.count<this.limit) {
          const until=Math.min(3,this.queue.length);
          if (!this.queue.some(c=>c.id===s.card.id))this.queue.splice(until,0,s.card);
        }
      }
      return {correct,almost,resolved:correct,alreadyResolved:false,independent:correct&&s.independent,type:s.q.type,canonical:s.q.answer,feedback:correct?(s.independent?'Chính xác! Giao hàng thôi.':'Đã sửa đúng. Từ này sẽ được luyện thêm.'):(almost?'Gần đúng — kiểm tra mạo từ, dấu hoặc cách viết.':'Chưa khớp. Thử lại hoặc xem gợi ý nhé.')};
    }
    hint(id) {
      const s=this.issued.get(id);if(!s||s.resolved||this.closed)return {text:'Lượt này đã kết thúc.',answer:''};
      s.hinted=true;const e=this._record(s);e.assisted=true;if(s.q.type==='recall'){e.typed=true;e.typedAssisted=true;}
      return {text:'Đáp án tham khảo: '+s.q.answer,answer:s.q.answer};
    }
    skip(id) {
      const s=this.issued.get(id);if(!s||s.resolved||this.closed)return {resolved:!!s?.resolved,alreadyResolved:true};
      s.resolved=true;s.skipped=true;s.hinted=true;const e=this._record(s);e.assisted=true;e.hadWrong=true;
      if(s.q.type==='recall'){e.typed=true;e.typedAssisted=true;}
      if(this.count<this.limit&&!this.queue.some(c=>c.id===s.card.id))this.queue.splice(Math.min(3,this.queue.length),0,s.card);
      return {resolved:true,alreadyResolved:false,correct:false,canonical:s.q.answer,type:s.q.type};
    }
    fallbackListening(id) {
      const s=this.issued.get(id);if(!s||s.resolved||this.closed||s.q.type!=='listen')return s?.q||null;
      s.q.type='meaning';s.q.prompt=s.card.term;s.q.speechText='';return s.q;
    }
    summary() {
      const evidence=Array.from(this.evidence.values()), questions=Array.from(this.issued.values());
      const independent=evidence.filter(e=>e.independent&&!e.hadWrong&&!e.assisted);
      const weak=evidence.filter(e=>e.hadWrong||e.assisted||!e.independent);
      const byType={};questions.forEach(s=>{if(!s.attempts&&!s.hinted&&!s.skipped)return;const x=byType[s.q.type]||{attempts:0,completed:0,independent:0};x.attempts+=s.attempts;x.completed+=s.resolved&&!s.skipped?1:0;x.independent+=s.independent?1:0;byType[s.q.type]=x;});
      const questionsAttempted=questions.filter(s=>s.attempts>0).length;
      const correctFirstTry=questions.filter(s=>s.independent).length;
      return {sessionId:this.id,deck:this.deck,mode:this.mode,distinctWords:evidence.length,independentWords:independent.length,assistedWords:evidence.length-independent.length,ordersCompleted:questions.filter(s=>s.resolved&&!s.skipped).length,skipped:questions.filter(s=>s.skipped).length,correctFirstTry,questionsAttempted,firstTryAccuracy:questionsAttempted?Math.round(correctFirstTry/questionsAttempted*100):null,attempts:evidence.reduce((n,e)=>n+e.attempts,0),weakWords:weak.map(e=>({id:e.id,term:e.term,meaning:e.meaning})),byType,weakOnlyApplied:this.weakOnlyApplied};
    }
    finish() {
      if(this.finalReport)return this.finalReport;
      this.closed=true;const report=this.summary(), h=history(), now=new Date().toISOString();
      for(const e of this.evidence.values()) {
        const previous=own(h.cards,e.id)&&h.cards[e.id]&&typeof h.cards[e.id]==='object'?h.cards[e.id]:{};
        const skills=Object.assign({},previous.skills||{});
        for(const method of e.methods){const s=skills[method]||{};skills[method]={sessions:(Number(s.sessions)||0)+1,lastPracticedAt:now};}
        h.cards[e.id]={...previous,term:e.term,meaning:e.meaning,lastPracticedAt:now,sessions:(Number(previous.sessions)||0)+1,attempts:(Number(previous.attempts)||0)+e.attempts,needsReview:e.hadWrong||e.assisted||!e.independent,skills};
      }
      // Bound history size without erasing the repository's actual learning data.
      const entries=Object.entries(h.cards).sort((a,b)=>String(b[1]?.lastPracticedAt||'').localeCompare(String(a[1]?.lastPracticedAt||''))).slice(0,2000);h.cards=Object.fromEntries(entries);
      h.sessions.push({id:this.id,at:now,distinctWords:report.distinctWords});h.sessions=h.sessions.slice(-30);
      report.saved=write(KEY,h);report.sharedScheduled=0;
      // Only full, objective typed recall may update the existing FSRS scheduler.
      // A same-day review or an active Today session is never scheduled twice.
      const srs=root.VokabelSRS, learning=root.VokabelLearningState, today=dateKey(now);
      if(report.saved&&srs&&typeof srs.scheduleReview==='function') {
        const active=read('vokabelgo_learning_session_v1',{});
        for(const e of this.evidence.values()) {
          if(!e.typed)continue;
          const old=srs.getCard?.(e.id);
          if(active.date===today&&!active.completed&&Array.isArray(active.targetIds)&&active.targetIds.map(String).includes(e.id))continue;
          if((old?.lastScheduledAt&&dateKey(old.lastScheduledAt)===today)||(old?.dueAt&&dateKey(old.dueAt)>today)) {
            // Keep its due date and review count, but do not leave a forgotten
            // word looking stable just because it was reviewed earlier today.
            if(e.typedWrong||e.typedAlmost) {
              try { learning?.recordRecallFailure?.(e.id,e.typedWrong?'unknown':'hard'); } catch (_) {}
            }
            continue;
          }
          const rating=e.typedWrong||e.typedAssisted||!e.typedCorrect?1:e.typedAlmost?2:3;
          try {
            const scheduled=srs.scheduleReview(e.id,rating,now);
            const persisted=srs.getCard?.(e.id);
            if(!scheduled||!persisted||persisted.lastScheduledAt!==scheduled.lastScheduledAt)continue;
            report.sharedScheduled++;
            if(rating===3)learning?.recordRecallSuccess?.(e.id);else learning?.recordRecallFailure?.(e.id,rating===2?'hard':'unknown');
            if(rating===3)root.VokabelDaily?.reviewCard?.(e.id);
          } catch (_) { /* The game still saves its own practice evidence. */ }
        }
      }
      this.finalReport=report;return report;
    }
  }
  return {version:1,storageKey:KEY,catalog,createSession:options=>new Session(options),normalize};
});
