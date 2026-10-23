'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('./dau-tu-engine'),D=require('./dau-tu-data'),B=require('./dau-tu-bot');
let pass=0,fail=0;
function test(name,fn){try{fn();pass++;console.log('PASS '+name);}catch(e){fail++;console.error('FAIL '+name+'\n'+e.stack);}}
function fixture({deck='adjektive',active='schwer',color='rot',hand=['schwierig:blau','teuer:gelb','gegenteil','farbenwahl','plus2:rot']}={}){
 let s=E.createInitialGameState(deck,25,'player'),pool=[...s.playerHand,...s.botHand,...s.drawPile,...s.discardPile];
 const take=fn=>{let i=pool.findIndex(fn);assert(i>=0,'Card fixture missing');return pool.splice(i,1)[0];};
 const top=take(c=>c.entryId===active&&c.color===color);
 s.playerHand=hand.map(spec=>{const [id,col]=spec.split(':');return take(c=>(c.entryId===id||c.actionType===id)&&(!col||c.color===col));});
 s.botHand=pool.splice(0,5);s.drawPile=pool;s.discardPile=[top];s.physicalTopCard=top;s.activeColor=color;s.activeEntryId=active;s.activeContextId=E.getDeckData(deck).entries[active].baseContextId;E.assertTotalCards(s);return s;
}
function check(s){E.assertTotalCards(s);assert(D.COLOR_KEYS.includes(s.activeColor));if(s.activeEntryId)assert(E.getContextSentence(s.deckId,s.activeContextId,s.activeEntryId));assert.equal(s.physicalTopCard.id,s.discardPile.at(-1).id);}
test('Chọn màu chưa hoàn tất: không rút lá khỏi tay, không mutate state',()=>{const s=fixture(),c=s.playerHand.find(x=>x.actionType==='farbenwahl'),old=JSON.stringify(s);assert.throws(()=>E.executePlayCard(s,c.id,'player'));assert.equal(JSON.stringify(s),old);});
test('Màu không hợp lệ: không mutate',()=>{const s=fixture(),c=s.playerHand.find(x=>x.actionType==='farbenwahl'),old=JSON.stringify(s);assert.throws(()=>E.executePlayCard(s,c.id,'player','invalid'));assert.equal(JSON.stringify(s),old);});
test('Phạt chỉ đúng lượt, đúng lá sai; không phạt một lá hợp lệ',()=>{const s=fixture(),old=JSON.stringify(s);assert.throws(()=>E.executeInvalidPenalty(s,'bot',s.playerHand[0].id,'x'));assert.throws(()=>E.executeInvalidPenalty(s,'player',s.playerHand[0].id,'x'));assert.equal(JSON.stringify(s),old);});
test('Phát hiện trùng ID dù tổng vẫn đủ 60',()=>{const s=fixture();s.drawPile[0]={...s.playerHand[0]};assert.throws(()=>E.assertTotalCards(s));});
test('Hai lần GEGENTEIL, mục tiêu ảo không thêm lá',()=>{const s=fixture();let g=s.playerHand.find(x=>x.actionType==='gegenteil');E.executePlayCard(s,g.id,'player');assert.equal(s.activeEntryId,'leicht');assert.equal(s.activeColor,'rot');const i=s.drawPile.findIndex(x=>x.actionType==='gegenteil');if(i>=0){const tmp=s.botHand[0];s.botHand[0]=s.drawPile[i];s.drawPile[i]=tmp;}g=s.botHand.find(x=>x.actionType==='gegenteil');E.executePlayCard(s,g.id,'bot');assert.equal(s.activeEntryId,'schwer');check(s);});
test('Tái trộn dưới GEGENTEIL giữ nghĩa mới và không đổi màu',()=>{const s=fixture();E.executePlayCard(s,s.playerHand.find(x=>x.actionType==='gegenteil').id,'player');s.botHand.push(...s.drawPile);s.drawPile=[];const old=s.activeEntryId;E.reshuffleDiscardPileIfNeeded(s);assert.equal(s.activeEntryId,old);assert.equal(s.discardPile.length,1);assert.equal(s.drawPile.length,1);check(s);});
test('Gợi ý không chạy trong lượt máy hoặc ván kết thúc',()=>{const s=fixture();s.activePlayer='bot';assert.equal(E.getHint(s,2).recommendedCardId,null);s.activePlayer='player';s.turnState='game_over';assert.equal(E.getHint(s,2).recommendedCardId,null);});
test('Sau rút: gợi ý chỉ lá vừa rút; không lộ đáp án ở lá cũ',()=>{const s=fixture();let drawn=E.executeDrawCard(s,'player');const hint=E.getHint(s,2);assert(!hint.recommendedCardId||hint.recommendedCardId===drawn.drawnCard.id);});
test('Gợi ý sau Bỏ lượt không đề nghị GEGENTEIL như nước hợp lệ',()=>{const s=fixture({hand:['aussetzen:rot','gegenteil','teuer:gelb']});E.executePlayCard(s,s.playerHand[0].id,'player');const text=E.getHint(s,1).hintText;assert(text.includes('chưa dùng được'));check(s);});
test('Lá cuối Đổi màu: hoàn tất màu rồi thắng; không có lượt thừa',()=>{const s=fixture({hand:['farbenwahl']});E.executePlayCard(s,s.playerHand[0].id,'player','gruen');assert.equal(s.winner,'player');assert.equal(s.activeColor,'gruen');const old=JSON.stringify(s);assert.throws(()=>E.executePlayCard(s,s.botHand[0].id,'bot'));assert.equal(JSON.stringify(s),old);check(s);});
test('Lá cuối GEGENTEIL: thắng với mục tiêu đúng',()=>{const s=fixture({hand:['gegenteil']});E.executePlayCard(s,s.playerHand[0].id,'player');assert.equal(s.winner,'player');assert.equal(s.activeEntryId,'leicht');check(s);});
test('+2 cuối cùng với chồng rút thiếu: không tạo thêm lá',()=>{const s=fixture({hand:['plus2:rot']});s.botHand.push(...s.drawPile);s.drawPile=[];E.executePlayCard(s,s.playerHand[0].id,'player');assert.equal(s.winner,'player');check(s);});
test('Seed được lưu, tạo cùng trạng thái ban đầu',()=>{const s=E.createInitialGameState('verben');const t=E.createInitialGameState('verben',s.seed);assert.equal(JSON.stringify(s),JSON.stringify(t));});
test('Bế tắc tổng quát: trả hòa khi cả hai không có nước đi, không còn bài rút',()=>{const s=fixture();const target={type:'action',id:s.physicalTopCard.id,actionType:'test_only',color:'rot'};s.discardPile=[target];s.physicalTopCard=target;s.activeEntryId=s.activeContextId=null;s.activeColor='gelb';const pool=[...s.playerHand,...s.botHand,...s.drawPile];pool.forEach((c,i)=>{c.type='word';c.actionType=null;c.entryId='schwer';c.color='rot';});s.playerHand=pool.slice(0,25);s.botHand=pool.slice(25);s.drawPile=[];E.assertTotalCards(s);const r=E.executeDrawCard(s,'player');assert(r.gameOver);assert(s.isDraw);assert.equal(s.winner,null);});
let simulation={games:0,completed:0,capped:0,winners:{player:0,bot:0,draw:0},maxTurns:0,turns:[],moves:{word:0,meaning:0,both:0,color:0,same:0,actions:0}};
test('200 ván mô phỏng (100 mỗi bộ), kiểm toàn vẹn từng hành động',()=>{
 for(const deck of ['adjektive','verben'])for(let seed=0;seed<100;seed++){
  const s=E.createInitialGameState(deck,seed);let n=0;
  while(s.turnState!=='game_over'&&n++<1500){
   const role=s.activePlayer,hand=role==='player'?s.playerHand:s.botHand;
   const view=role==='player'?{...s,playerHand:s.botHand,botHand:s.playerHand}:s;
   const d=B.getBotDecision(B.buildPublicObservation(view),hand);
   if(d.action==='play'){
    E.executePlayCard(s,d.cardId,role,d.chosenColor);
    if(s.lastAction.type==='word'){simulation.moves.word++;const t=s.lastAction.matchType;simulation.moves[t==='same_word'?'same':t]++;}else simulation.moves.actions++;
   }else if(d.action==='draw'){const r=E.executeDrawCard(s,role);assert(r.success||r.gameOver||r.passed);}else assert(E.executePassTurn(s,role).success);
   check(s);
  }
  simulation.games++;if(s.turnState==='game_over'){simulation.completed++;simulation.winners[s.isDraw?'draw':s.winner]++;}else simulation.capped++;
  simulation.turns.push(s.turnCount);simulation.maxTurns=Math.max(simulation.maxTurns,s.turnCount);
 }
 assert.equal(simulation.capped,0,'Không gộp ván vượt giới hạn vào số ván hoàn tất.');
});
const sorted=simulation.turns.slice().sort((a,b)=>a-b);simulation.medianTurns=sorted[Math.floor(sorted.length/2)];delete simulation.turns;
fs.mkdirSync(path.join(__dirname,'qa'),{recursive:true});fs.writeFileSync(path.join(__dirname,'qa/engine-v02-results.json'),JSON.stringify({passed:pass,failed:fail,simulation,note:'Bot-vs-bot: kiểm tra trạng thái, không chứng minh cân bằng hoặc hiệu quả học.'},null,2));
console.log(JSON.stringify({passed:pass,failed:fail,simulation},null,2));if(fail)process.exitCode=1;
