(() => {
  'use strict';
  const KEY = 'vokabelgo_teachme_v1';
  const ART = 'assets/may-home/may-original.png';
  const taskData = {
    weil: {
      id: 'weil', kind: 'grammar', label: 'Giải thích & dùng thử', sourceLabel: 'Ngữ pháp · Nói về lý do', title: 'Một câu nói có lý do',
      short: 'weil · vì, bởi vì', goal: 'Giải thích và dùng weil để nói một lý do.',
      description: 'Kể Zehn nghe khi nào dùng weil, rồi cùng ghép một câu của riêng bạn.',
      source: 'Lena fährt mit dem Bus, <mark>weil es regnet.</mark>',
      translation: 'Lena đi xe buýt vì trời mưa.',
      rule: 'Weil mở đầu mệnh đề nêu lý do. Động từ chia đứng cuối mệnh đề phụ: weil + chủ ngữ + … + động từ chia.',
      steps: [
        {title:'Kể Zehn cách dùng', opening:'Zehn gặp từ weil trong câu này. Bạn giải thích theo cách bạn hiểu nhé.', prompt:'Khi nào mình dùng weil?', context:'Lena fährt mit dem Bus, weil es regnet.', note:'Nói bằng tiếng Việt cũng được, không cần dùng thuật ngữ.', placeholder:'Mình dùng weil khi muốn…', hints:['Bạn thử nghĩ đến câu hỏi “Vì sao Lena đi xe buýt?”.','Mình dùng weil để nói lý do: một việc xảy ra vì…'], model:'Mình dùng weil để nói lý do, giống như “vì” trong tiếng Việt.', samples:['Mình dùng weil để nói lý do, nghĩa là vì hoặc bởi vì.']},
        {title:'Cùng dùng thử', opening:'Giờ đổi sang chuyện của bạn một chút nhé.', prompt:'Bạn ở nhà vì trời lạnh. Bạn sẽ nói thế nào với weil?', context:'ở nhà · zu Hause bleiben / trời lạnh · es ist kalt', note:'Một câu tiếng Đức là đủ. Cần từ nào, bạn cứ mở gợi ý.', placeholder:'Ich bleibe…', hints:['Giữ ý “ở nhà” ở trước. Phần sau weil sẽ giải thích vì sao.','Bạn thử nối: Ich bleibe zu Hause, weil es … kalt ist.'], model:'Ich bleibe zu Hause, weil es kalt ist.', samples:['Ich bleibe zu Hause, weil es kalt ist.']}
      ],
      review:{title:'Một lý do khác',opening:'Lần này mình thử một lý do khác nhé. Bạn có thể tự ghép câu trước khi mở gợi ý.',prompt:'Bạn đi ngủ sớm vì mệt. Bạn sẽ nói thế nào với weil?',context:'đi ngủ sớm · früh ins Bett gehen / mệt · müde sein',note:'Một tình huống mới, khoảng 1 phút. Bạn thử ngay nhé.',placeholder:'Ich gehe…',hints:['Sau weil, bạn sẽ giải thích lý do mình đi ngủ sớm.','Bạn thử nối: Ich gehe früh ins Bett, weil ich … müde bin.'],model:'Ich gehe früh ins Bett, weil ich müde bin.',samples:['Ich gehe früh ins Bett, weil ich müde bin.']}
    },
    lena: {
      id:'lena', kind:'reading', label:'Kể Zehn nghe', sourceLabel:'Thư viện · Truyện ngắn', title:'Thứ Bảy của Lena', short:'Ein Samstag mit Lena',
      goal:'Hiểu và kể lại hai việc Lena làm cùng bạn.', description:'Đọc một chuyện nhỏ, rồi kể Zehn nghe điều bạn nhớ về hai người bạn.',
      source:'Am Samstag besucht Lena ihre Freundin Mia. Sie kaufen zusammen ein und kochen eine Suppe. Am Abend sehen sie einen Film. Lena bleibt bis zum Abend, <mark>weil sie den Film mit Mia sehen möchte.</mark>',
      translation:'Thứ Bảy, Lena đến thăm người bạn Mia. Hai người cùng đi mua đồ và nấu súp. Buổi tối, họ xem một bộ phim. Lena ở lại đến tối vì cô muốn xem phim cùng Mia.',
      rule:'Bạn cứ kể bằng lời của mình, tiếng Việt hoặc tiếng Đức đều được. Mình tập trung vào ý của câu chuyện.',
      steps:[
        {title:'Kể Zehn nghe',opening:'Zehn nghe đây. Bạn không cần nhớ nguyên câu trong bài đâu.',prompt:'Thứ Bảy đó, Lena và Mia cùng làm những gì?',context:'Kể hai việc bạn nhớ trong câu chuyện “Thứ Bảy của Lena”.',note:'Kể bằng tiếng Việt cũng được. Mình nghe ý của câu chuyện trước nhé.',placeholder:'Mình nhớ hai bạn…',hints:['Bạn nhớ đoạn nói về bữa ăn không? Hai bạn đã làm gì?', 'Bạn có thể bắt đầu: “Hai bạn cùng… rồi…” và kể một việc khác.'],model:'Hai bạn cùng đi mua đồ và nấu súp. Buổi tối, họ xem phim.',samples:['Hai bạn đi mua đồ, nấu súp và xem phim.']},
        {title:'Nối thêm một ý',opening:'Có một chi tiết Zehn muốn hiểu thêm.',prompt:'Điều gì khiến Lena muốn ở lại nhà Mia đến tối?',context:'Mình đang nói về kế hoạch buổi tối của hai bạn.',note:'Một ý ngắn là đủ, không cần kể lại từ đầu.',placeholder:'Vì Lena muốn…',hints:['Bạn thử tìm câu bắt đầu bằng “Lena bleibt…” trong bài.','Lena muốn ở lại để cùng Mia làm một việc vào buổi tối.'],model:'Vì Lena muốn xem phim cùng Mia.',samples:['Vì Lena muốn xem phim cùng Mia.']}
      ],
      review:{title:'Nếu câu chuyện đổi khác',opening:'Mình thử đổi một chi tiết trong câu chuyện nhé.',prompt:'Nếu Lena phải về trước buổi tối, cô ấy sẽ bỏ lỡ điều gì cùng Mia?',context:'Bạn có thể mở lại câu chuyện nếu cần.',note:'Lần này, mình dùng điều đã hiểu để nghĩ thêm một chút.',placeholder:'Lena sẽ bỏ lỡ…',hints:['Bạn nhớ hai người có kế hoạch gì vào buổi tối không?','Bạn tìm câu bắt đầu bằng “Am Abend…” nhé.'],model:'Lena sẽ bỏ lỡ việc xem phim cùng Mia.',samples:['Lena sẽ bỏ lỡ việc xem phim cùng Mia.']}
    },
    bears: {
      id:'bears', kind:'reading', label:'Kể Zehn nghe', sourceLabel:'Kino · We Bare Bears', title:'Cuộc rượt đuổi ở trung tâm thương mại', short:'We Bare Bears · Wir und die Mall',
      goal:'Kể lại cuộc rượt đuổi trong đoạn trích và hiểu vì sao phải dùng tàu hỏa mini.', description:'Từ đoạn trích We Bare Bears ở rạp Kino: ai chạy trốn, ai đuổi theo, và vì sao có cả tàu hỏa mini.',
      source:'Panda und Tom sind in der Mall. Viele Fans jagen die beiden, <mark>weil alle das limitierte Esteller-Shirt wollen.</mark> Grizz arbeitet als Wachmann. Mit Griff verfolgt er die Fans in einem kleinen Zug, weil sie die Fans zu Fuß nicht einholen.',
      translation:'Panda và Tom đang ở trung tâm thương mại. Nhiều fan rượt đuổi hai người, vì ai cũng muốn chiếc áo Esteller phiên bản giới hạn. Grizz làm bảo vệ. Cùng Griff, cậu đuổi theo các fan bằng một chiếc tàu hỏa mini, vì đi bộ thì không đuổi kịp họ.',
      rule:'Bạn cứ kể bằng lời của mình, tiếng Việt hoặc tiếng Đức đều được. Zehn tập trung vào ý chính của đoạn trích.',
      steps:[
        {title:'Kể Zehn nghe',opening:'Zehn vừa xem đoạn trích cùng bạn đây. Kể Zehn nghe điều bạn nhớ nhé.',prompt:'Trong đoạn trích ở trung tâm thương mại, chuyện gì đang xảy ra?',context:'Ai đang chạy trốn, ai đuổi theo, và họ đuổi bằng cách gì?',note:'Kể 2–3 ý chính, bằng tiếng Việt cũng được.',placeholder:'Mình nhớ là…',hints:['Rắc rối bắt đầu vì một món đồ phiên bản giới hạn mà ai cũng muốn.','Một bên chạy trốn; bên còn lại đuổi theo bằng một phương tiện rất đặc biệt của trung tâm thương mại.'],model:'Panda và Tom bị các fan rượt đuổi vì chiếc áo Esteller giới hạn. Grizz và bảo vệ Griff đuổi theo các fan bằng tàu hỏa mini.',samples:['Panda và Tom bị các fan rượt đuổi vì chiếc áo Esteller giới hạn. Grizz và bảo vệ Griff đuổi theo các fan bằng tàu hỏa mini.']},
        {title:'Nối thêm một ý',opening:'Có một chi tiết Zehn rất tò mò.',prompt:'Vì sao Grizz và Griff lại đuổi theo bằng tàu hỏa mini?',context:'Nhớ lại câu của Grizz: “Wenn wir sie zu Fuß nicht einholen, dann eben auf Schienen.”',note:'Một ý ngắn là đủ, không cần kể lại từ đầu.',placeholder:'Vì đi bộ thì…',hints:['Họ đã thử đuổi theo bằng cách nào trước?','“Zu Fuß nicht einholen” nghĩa là đi bộ thì không đuổi kịp.'],model:'Vì đi bộ thì họ không đuổi kịp các fan, nên họ dùng tàu hỏa mini chạy trên ray.',samples:['Vì đi bộ thì họ không đuổi kịp các fan, nên họ dùng tàu hỏa mini chạy trên ray.']}
      ],
      review:{title:'Đoạn cuối ở sảnh chính',opening:'Mình quay lại đoạn cuối của đoạn trích nhé.',prompt:'Chiếc áo giới hạn bị giằng co ở sảnh chính và có người bị dồn vào ngõ cụt. Mọi người thoát khỏi thế bí bằng cách nào?',context:'Nhớ lại phần “Giằng co chiếc áo giới hạn ở sảnh chính” của bài Kino.',note:'Một tình huống khác trong cùng bài, khoảng 1 phút.',placeholder:'Mọi người…',hints:['Khi bị dồn vào ngõ cụt, họ chọn giằng co tiếp hay nói chuyện với nhau?','Từ khóa trong bài: ruhig bleiben, verhandeln — giữ bình tĩnh và thương lượng.'],model:'Mọi người giữ bình tĩnh và thương lượng với nhau thay vì giằng co, để bảo vệ bạn bè và chiếc áo.',samples:['Mọi người giữ bình tĩnh và thương lượng với nhau thay vì giằng co, để bảo vệ bạn bè và chiếc áo.']}
    }
  };
  const fresh = () => ({version:1,view:'home',selected:'weil',session:null,history:[],queue:{},reports:[]});
  let state, storageOk = true, toastTimer;
  try { state = JSON.parse(localStorage.getItem(KEY)) || fresh(); if(state.version!==1 || !Array.isArray(state.history) || !state.queue || !taskData[state.selected]) state=fresh(); } catch { state=fresh();storageOk=false; }
  // Refresh generated dialogue from older drafts, preserving learner text and reports.
  function refreshGeneratedNames(record){
    if(!record||typeof record!=='object')return;
    for(const key of ['message','conversationReply','followUp','takeaway','retryNote','retryPrompt']){
      if(typeof record[key]==='string')record[key]=record[key].replace(/M\u00e2y|Milo/g,'Zehn').replace(/M\u00c2Y|MILO/g,'ZEHN');
    }
    if(record.feedback&&typeof record.feedback==='object')refreshGeneratedNames(record.feedback);
    if(Array.isArray(record.results))record.results.forEach(refreshGeneratedNames);
  }
  refreshGeneratedNames(state.session);
  state.history.forEach(refreshGeneratedNames);
  const main=document.getElementById('main'), modal=document.getElementById('modal');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/ß/g,'ss');
  const task = () => taskData[state.session?.taskId || state.selected];
  const steps = () => state.session.mode==='review' ? [task().review] : task().steps;
  const avatar=()=>`<span class="mini-avatar" role="img" aria-label="Zehn, chú mèo tam thể đeo khăn xanh" style="background-image:url('${ART}')"></span>`;
  const button=(action,label,extra='',cls='button')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
  const crumb=label=>`<div class="breadcrumb">${button('home','Góc học của bạn','','text-button')}<span>/</span><span>${escape(label)}</span></div>`;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOk=true;return true;}catch{storageOk=false;return false;}}
  function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500);}
  function go(view){state.view=view;save();render();main.focus();window.scrollTo({top:0,behavior:'instant'});}
  function dateLabel(iso){return new Intl.DateTimeFormat('vi-VN',{day:'numeric',month:'numeric',timeZone:'Asia/Saigon'}).format(new Date(iso));}
  function sourceMarkup(t,inside=false){return `<p class="eyebrow">${escape(t.sourceLabel)} · A2 đề xuất</p><h${inside?'3':'1'} class="${inside?'':'page-heading'}">${escape(t.title)}</h${inside?'3':'1'}><div class="source-text" lang="de">${t.source}</div><button class="text-button" data-action="translation" aria-expanded="false">Hiện bản dịch tiếng Việt ＋</button><div class="translation" hidden>${escape(t.translation)}</div><div class="source-rule">${escape(t.rule)}</div>`;}
  function home(){
    const active=state.session && !state.session.completedAt;
    const queueEntries=Object.entries(state.queue);
    return `${active?`<div class="resume-banner"><div><strong>Zehn giữ trang này cho bạn rồi.</strong><p>${escape(task().title)} · ${state.session.mode==='review'?'Lượt ôn':'Bước '+(state.session.step+1)+' / 2'} đang dở</p></div>${button('resume','Kể tiếp với Zehn →')}</div>`:''}
      <section class="hero"><div class="hero-copy"><p class="eyebrow">TEACH ME / HỌC BẰNG CÁCH GIẢNG LẠI</p><h1>Hôm nay, bạn kể<br><em>Zehn nghe gì?</em></h1><p>Một câu chuyện nhỏ. Một điều vừa hiểu.<br>Bạn kể theo cách của mình. Zehn nghe, hỏi thêm, rồi cùng thử.</p><div class="hero-note"><span class="small-star">✧</span><span>Khoảng 3 phút · Một mục tiêu · Theo nhịp của bạn</span></div></div><div class="hero-art"><img src="${ART}" alt="Zehn ngồi trên bè câu cá giữa hồ xanh"><div class="art-note"><span></span>Zehn nghe đây. Bạn bắt đầu nhé?</div></div></section>
      <section aria-labelledby="choose-title"><div class="section-top"><h2 id="choose-title">Bắt đầu từ một điều nhỏ</h2><p>Chọn một chuyện để bắt đầu</p></div><div class="task-grid">${Object.values(taskData).map((t,i)=>`<article class="task-card ${t.kind}"><div class="card-top"><span class="card-kind">0${i+1} / ${escape(t.label.toUpperCase())}</span><span class="pill">A2 · ~3 phút</span></div><h3>${escape(t.title)}</h3><p>${escape(t.description)}</p><p class="card-goal">↗ ${escape(t.goal)}</p><div class="card-actions">${button('source','Xem bài & bắt đầu <span>↗</span>',`data-task="${t.id}"`,'button '+(t.kind==='reading'?'sage':''))}${button('defer','Để sau',`data-task="${t.id}"`,'text-button')}</div></article>`).join('')}</div></section>
      ${queueEntries.length?`<div class="queue-strip"><div><strong>${queueEntries.length} mục đang chờ bạn</strong><p>${queueEntries.map(([id,q])=>escape(taskData[id].short)+(q.dueAt?' · ôn '+dateLabel(q.dueAt):' · để sau')).join(' / ')}</p></div>${button('queue','Xem mục đang chờ →','','text-button')}</div>`:''}
      <p class="demo-note">◌ Ba bài luyện theo đúng workflow Teach Me: kể lại → vận dụng → ôn lại với tình huống mới. ${button('about','Tìm hiểu về Teach Me','','text-button')}</p>`;
  }
  function sourcePage(){const t=taskData[state.selected];return `${crumb(t.sourceLabel)}<div class="source-layout"><article class="reading-page">${sourceMarkup(t)}</article><aside class="source-aside">${avatar()}<p class="eyebrow">ĐỌC XONG, THỬ GIẢNG LẠI</p><h2>Bạn kể Zehn<br>nghe nhé?</h2><p>${escape(t.goal)}</p>${button('start','Dạy Zehn <span>→</span>',`data-task="${t.id}"`)}<p class="quiet">Zehn hỏi từng điều một. Bạn có thể mở gợi ý hoặc để dành lúc khác.</p>${button('defer','Để sau, về góc học',`data-task="${t.id}"`,'text-button')}</aside></div><p class="demo-note">Bài luyện mẫu của Teach Me · Phản hồi theo bộ quy tắc đã định sẵn, không phải AI.</p>`;}
  function supportsFor(index){const s=state.session;const own=s.supports[index]||[];const inherited=s.supports.slice(0,index).some(a=>a.length);return [...new Set([...own,...(inherited?['inherited']:[])])];}
  function supportLabel(values){const map={keywords:'từ khóa',sentence:'đầu câu',rule:'gợi ý trọng tâm',followup:'câu hỏi dẫn dắt',source:'xem lại bài',model:'câu mẫu',sample:'câu mẫu',inherited:'hỗ trợ từ bước trước'};return values.length?values.map(v=>map[v]||v).join(', '):'không mở gợi ý';}
  function openingFor(step){
    const s=state.session;
    if(s.attempts[s.step].length) return 'Mình xem lại đúng chỗ này một chút nhé.';
    if(s.mode==='review'||s.step===0) return step.opening;
    const previous=s.results[s.step-1];
    if(task().id==='weil') return previous?.verdict==='met'?'Vậy là weil giúp mình nói lý do. Zehn muốn thử dùng nó trong một câu khác.':'Mình vừa xem một cách dùng weil. Giờ cùng thử một câu ngắn nhé.';
    if(task().id==='bears') return previous?.verdict==='met'?'Zehn thấy cả đoàn tàu mini chạy trong trung tâm thương mại rồi. Còn một chi tiết Zehn tò mò.':'Mình vừa ôn lại cuộc rượt đuổi. Zehn hỏi thêm một chi tiết nhé.';
    return previous?.verdict==='met'?'Zehn hình dung được buổi gặp của hai bạn rồi. Còn một chi tiết Zehn tò mò.':'Mình vừa xem lại những việc hai bạn làm. Zehn hỏi thêm một chi tiết nhé.';
  }
  function earlierExchange(){
    const s=state.session;if(!s.step||!s.results[s.step-1])return '';
    const previous=s.results[s.step-1];
    return `<details class="conversation-memory"><summary>Chuyện mình vừa nói</summary><div><p><span>Bạn</span> ${escape(previous.answer||'Mình để phần này lại sau.')}</p><p><span>Zehn</span> ${escape(previous.conversationReply||previous.message)}</p></div></details>`;
  }
  function sessionPage(){
    const s=state.session,t=task(),list=steps(),step=list[s.step],feedback=s.feedback,tries=s.attempts[s.step];
    return `${crumb(s.mode==='review'?'Ôn cùng Zehn':t.sourceLabel)}<div class="session-heading"><div><h1>${escape(t.title)}</h1><p>${s.mode==='review'?'Lượt ôn minh họa · Không thay đổi ngày trên thiết bị':'Một mục tiêu: '+escape(t.goal)}</p></div>${button('pause','Để sau ↗','','text-button')}</div><div class="session-layout"><aside class="companion"><div class="companion-scene"><img src="${ART}" alt="Zehn đang chờ nghe em"></div><p class="eyebrow">CÙNG ZEHN NGHĨ THỬ</p><h2>Mình cùng<br>nghĩ một chút nhé.</h2><p>Bạn cứ kể theo cách của mình. Zehn sẽ hỏi thêm nếu cần hiểu rõ hơn.</p><ol class="step-list">${list.map((x,i)=>`<li class="${i===s.step?'active':i<s.step?'done':''}"><span class="step-number">${i<s.step?'✓':i+1}</span>${escape(x.title)}</li>`).join('')}</ol><p class="quiet" style="margin-top:20px">${s.mode==='review'?'Một tình huống mới cho điều đã học.':'Khoảng 3 phút. Mình không cần vội.'}</p>${button('source-modal','Xem lại bài','','text-button')}</aside><section class="practice" aria-label="Luyện cùng Zehn"><div class="practice-top"><span><span class="status-dot"></span>${s.mode==='review'?'ÔN CÙNG ZEHN':'BƯỚC '+(s.step+1)+' / '+list.length} · ${escape(step.title)}</span><span>Hội thoại mẫu</span></div><div class="practice-body"><div class="speaker">${avatar()}<span>Zehn nghe đây</span></div>${earlierExchange()}<p class="may-opening">${escape(openingFor(step))}</p><h2 class="prompt">${escape(s.retryPrompt||step.prompt)}</h2><div class="prompt-context">${escape(step.context)}</div><p class="language-note">${escape(step.note)}</p>
      ${feedback?feedbackMarkup(feedback,step):`${tries.length?`<div class="previous-answer"><small>Em vừa thử</small>${escape(tries[tries.length-1].text)}</div><div class="hint-box"><strong>ZEHN ĐANG THEO DÕI Ý CỦA BẠN</strong>${escape(s.retryNote||'Bạn bổ sung một ý nữa nhé.')}</div>`:''}
      ${(s.hintLevels[s.step]||0)>0?`<div class="hint-box"><strong>GỢI Ý ${s.hintLevels[s.step]} / 2</strong>${escape(step.hints[s.hintLevels[s.step]-1])}</div>`:''}
      <form id="answer-form"><label class="answer-label" for="answer">Bạn kể Zehn nghe</label><textarea id="answer" name="answer" maxlength="700" placeholder="${escape(step.placeholder)}" required>${escape(s.drafts[s.step])}</textarea><div class="input-meta"><span>Lượt trả lời ${tries.length+1} / 2 · Ctrl + Enter để gửi</span><span id="char-count">${s.drafts[s.step].length} / 700</span></div><div class="composer-actions">${button('hint',(s.hintLevels[s.step]||0)>=2?'Đã mở hai gợi ý':'✧ Gợi ý',`type="button" ${(s.hintLevels[s.step]||0)>=2?'disabled':''}`,'tool-button')}${button('source-modal','▤ Xem bài','type="button"','tool-button')}${button('skip','Bỏ qua bước','type="button"','text-button')}<button type="submit" class="button" id="send-answer" ${s.drafts[s.step].trim()?'':'disabled'}>Gửi Zehn <span>↑</span></button></div></form>
      <details class="examples"><summary>Xem câu mẫu — sẽ được ghi là đã dùng hỗ trợ</summary><div class="example-buttons">${step.samples.map((x,i)=>button('sample',['Điền câu mẫu'][i]||'Điền câu mẫu',`data-index="${i}"`,'')).join('')}</div></details>`}
      <p class="support-note">${supportsFor(s.step).length?'Mình đã dùng: '+escape(supportLabel(supportsFor(s.step)))+'.':'Cần một điểm bắt đầu? Bạn có thể mở gợi ý.'}</p></div></section></div>`;
  }
  function feedbackMarkup(f,step){
    const s=state.session,canRetry=f.verdict!=='met'&&f.verdict!=='skipped'&&!f.modelShown&&s.attempts[s.step].length<2;
    const nextLabel=s.step===steps().length-1?'Xem lại chuyện mình vừa học →':task().id==='weil'?'Cùng thử một câu nhé →':'Zehn hỏi thêm một chút →';
    const closing=f.verdict==='skipped'?f.message:f.verdict==='unknown'?'Mình tham khảo một cách diễn đạt rồi tiếp tục nhé. Phần này vẫn để là chưa đủ cơ sở nhận xét.':'Mình xem một cách diễn đạt nhé. Phần này có thể luyện lại sau.';
    return `<div class="previous-answer"><small>${f.verdict==='skipped'?'Mình để phần này lại':'Bạn vừa kể'}</small>${escape(f.answer||'Chưa có câu trả lời.')}</div><div class="feedback ${f.verdict==='met'?'':f.verdict==='unknown'?'unknown':'needs'}" role="status"><span class="feedback-label">ZEHN</span><p>${escape(canRetry||f.verdict==='met'?f.message:closing)}</p>${canRetry&&f.followUp?`<p class="guidance-question">${escape(f.followUp)}</p>`:''}${!canRetry&&f.verdict!=='met'?`<div class="model"><strong>Một cách nói để tham khảo</strong><br>${escape(step.model)}</div>`:''}</div>${f.scopeNote?'<p class="demo-scope-note">Câu này nằm ngoài các cách diễn đạt Zehn đã học để nhận diện, nên Zehn chưa kết luận là sai.</p>':''}<div class="feedback-actions">${button('report','Góp ý cho phản hồi này','','text-button')}${canRetry?button('retry',f.verdict==='partial'?'Để mình nói thêm →':f.verdict==='unknown'?'Để mình kể rõ hơn →':'Để mình sửa một chút →'):button('next',nextLabel)}</div>${canRetry?`<div style="text-align:right;margin-top:9px">${button('accept-model','Cho mình xem một cách nói','','text-button')}</div>`:''}`;
  }
  function currentResults(){return state.session?.results || [];}
  function resultMarkup(r,title){let label,symbol='✓';if(r.verdict==='met'){label=r.supports.length?'Làm được sau hỗ trợ':'Làm được trong lượt này';}else if(r.verdict==='partial'){label='Đã hiểu một phần · cần luyện thêm';symbol='↗';}else if(r.verdict==='not_yet'){label='Đã xem mẫu · cần luyện thêm';symbol='↗';}else if(r.verdict==='skipped'){label='Đã bỏ qua · chưa đánh giá';symbol='○';}else{label='Chưa đủ cơ sở đánh giá';symbol='○';}return `<div class="result-row"><span class="result-symbol">${symbol}</span><div><strong>${escape(title)}</strong><p>${escape(label)}</p><p>${escape(r.message)}</p>${r.answer?`<div class="result-evidence">“${(r.evidenceQuotes||[r.answer]).map(escape).join('” → “')}”</div>`:''}${r.supports.length?`<p>Hỗ trợ: ${escape(supportLabel(r.supports))}.</p>`:''}</div></div>`;}
  function summaryPage(){const s=state.session,t=task(),q=state.queue[t.id],list=steps();return `${crumb('Điều bạn vừa làm được')}<div class="summary-wrap"><div class="summary-head"><div class="summary-icon">✧</div><p class="eyebrow">MỘT CHÚT TIẾN BỘ HÔM NAY</p><h1>Hôm nay mình hiểu thêm một chút.</h1><p>Mình vừa cùng tìm hiểu: ${escape(t.short)}.</p></div><article class="result-card"><div class="result-title"><h2>Điều bạn vừa làm được</h2><span class="pill">${s.mode==='review'?'Lượt ôn':'Đã luyện · 2 bước'}</span></div>${currentResults().map((r,i)=>resultMarkup(r,list[i].title)).join('')}<div class="next-review"><strong>${q?.dueAt?'Hẹn gặp lại điều này ngày '+dateLabel(q.dueAt):q?.status==='pending'?'Mình để dành phần này để luyện tiếp':'Mình có thể quay lại phần này khi bạn sẵn sàng'}</strong><p>${q?.dueAt?'Lần sau mình sẽ đổi tình huống để em thử lại. Lịch ôn là đề xuất để bạn quay lại đúng lúc.':'Kết quả chưa đủ để lên lịch ôn mới. Bạn có thể xem lại bài và luyện tiếp khi sẵn sàng.'}</p></div><p class="quiet" style="margin-bottom:0;margin-top:16px">Hoàn thành lượt luyện chưa đồng nghĩa đã thành thạo. Kết quả này được ghi riêng với tiến độ từ vựng.</p></article><div class="summary-actions">${button('home','Về góc học','','button secondary')}${button('review','Thử lượt ôn mới →',`data-task="${t.id}"`)}</div><p class="saved-note">${storageOk?'✓ Đã lưu trên trình duyệt này.':'Chưa lưu được trên trình duyệt. '+button('save-again','Thử lưu lại','','text-button')} · ${button('source','Xem lại bài gốc',`data-task="${t.id}"`,'text-button')}</p></div>`;}
  function journal(){return `${crumb('Nhật ký')}<p class="eyebrow">NHỮNG ĐIỀU EM ĐÃ THỬ</p><h1 class="page-heading">Mỗi lần kể, hiểu thêm một chút.</h1><p class="page-intro">Lịch sử thử nghiệm chỉ nằm trên trình duyệt này.</p>${state.history.length?`<div class="journal-list">${[...state.history].reverse().map(h=>`<article class="journal-entry"><div><p class="eyebrow">${h.mode==='review'?'LƯỢT ÔN MẪU':'LƯỢT LUYỆN'} · ${dateLabel(h.completedAt)}</p><h2>${escape(taskData[h.taskId].title)}</h2><p>${h.results.filter(r=>r.verdict==='met').length} / ${h.results.length} bước đạt mục tiêu trong lượt này · ${h.results.some(r=>r.supports.length)?'Có hỗ trợ':'Không mở gợi ý'}</p></div>${button('history','Xem kết quả →',`data-id="${escape(h.id)}"`,'text-button')}</article>`).join('')}</div>`:`<div class="empty-state"><span class="small-star">✧</span><h2>Bắt đầu bằng một chuyện nhỏ nhé?</h2><p>Sau mỗi lần trò chuyện, mình giữ lại điều bạn đã thử ở đây.</p>${button('home','Chọn một bài →')}</div>`}`;}
  function render(){if((state.view==='session'||state.view==='summary')&&!state.session)state.view='home';const views={home,source:sourcePage,session:sessionPage,summary:summaryPage,journal};main.innerHTML=(!storageOk?'<div class="error-note" role="status">Trình duyệt chưa lưu được dữ liệu. Em vẫn có thể thử, nhưng tiến độ có thể mất khi tải lại.</div>':'')+(views[state.view]||home)();document.title=(state.view==='home'?'Teach Me · Dạy Zehn một điều mới':state.view==='journal'?'Nhật ký · Teach Me':taskData[state.selected].title+' · Teach Me');}
  function start(id,mode='learn',force=false){if(state.session&&!state.session.completedAt&&!force){if(state.session.taskId===id&&state.session.mode===mode){go('session');return;}openModal('Em đang có một lượt dở',`<p class="dialog-copy">Tiếp tục lượt trước để giữ mạch học, hoặc bắt đầu bài mới. Lượt dở sẽ được thay thế nếu em chọn bài mới.</p><div class="dialog-actions">${button('resume','Tiếp tục lượt trước','','button secondary')}${button('replace','Bắt đầu bài mới',`data-task="${id}" data-mode="${mode}"`)}</div>`);return;}const count=mode==='review'?1:2;state.selected=id;state.session={id:globalThis.crypto?.randomUUID?.()||'session-'+Date.now()+'-'+Math.random().toString(16).slice(2),taskId:id,mode,step:0,drafts:Array(count).fill(''),attempts:Array.from({length:count},()=>[]),supports:Array.from({length:count},()=>[]),hintLevels:Array(count).fill(0),results:[],feedback:null,retryNote:'',startedAt:new Date().toISOString(),completedAt:null};go('session');}
  function grade(answer){
    const s=state.session,t=task(),f=fold(answer).replace(/\s+/g,' ').trim(),de=f.replace(/[.!?]/g,'').trim();
    const reply=(verdict,message,followUp='',takeaway='',scopeNote=false)=>({verdict,message,followUp,takeaway:takeaway||message,scopeNote});
    const stuck=/chua biet|khong biet|chua chac|chua ro|khong chac|chua hieu/.test(f);
    if(t.id==='weil'&&s.mode==='learn'&&s.step===0){
      const reason=/ly do|boi vi|la vi|nghia la vi|nghia vi|nguyen nhan|grund|begrund|ursache/.test(f)||/^vi[.!]?$/.test(f);
      const end=/cuoi|ende|endposition/.test(f),neg=/khong.*(ly do|nguyen nhan)|nicht.*(grund|ursache)/.test(f);
      if(reason&&!neg)return reply('met','À, weil giúp mình nói vì sao một việc xảy ra. Zehn nối được hai ý trong câu về Lena rồi.','','Bạn đã giải thích được weil dùng để nêu lý do.');
      if(end&&!neg)return reply('partial','Bạn đang nói đến cách xếp động từ trong câu. Zehn muốn hiểu công dụng của weil trước.','Mình dùng weil để nói điều gì?','Bạn đã nhắc đến vị trí động từ; mình còn cần làm rõ công dụng của weil.');
      if(stuck)return reply('unknown','Mình bắt đầu ngay từ câu của Lena nhé.','Phần “weil es regnet” giải thích điều gì về việc Lena đi xe buýt?','Mình chưa có lời giải thích rõ về công dụng của weil.');
      return reply('unknown','Zehn chưa chắc mình hiểu đúng ý bạn.','Bạn thử nói ngắn hơn: weil có thể hiểu là gì trong tiếng Việt?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
    }
    if(t.id==='weil'){
      const review=s.mode==='review',verb=review?'bin':'ist';
      const valid=review?[/^ich gehe (?:heute )?fruh ins bett,? weil ich (?:sehr |so )?mude bin$/,/^weil ich (?:sehr )?mude bin,? gehe ich fruh ins bett$/]:[/^ich bleibe (?:heute )?zu hause,? weil es (?:draussen |heute |sehr )*kalt ist$/,/^weil es (?:draussen |heute |sehr )*kalt ist,? bleibe ich (?:heute )?zu hause$/];
      if(valid.some(r=>r.test(de)))return reply('met',review?'Zehn hiểu: bạn đi ngủ sớm vì mệt. Bạn đặt bin ở cuối phần lý do rồi.':'Zehn hiểu: bạn ở nhà vì trời lạnh. Trong phần sau weil, bạn đã đặt ist ở cuối.','','Bạn đã diễn đạt được lý do bằng weil và đặt động từ chia ở cuối mệnh đề phụ.');
      if((review?/^ich gehe .*fruh ins bett,? weil ich bin (?:sehr )?mude$/:/^ich bleibe (?:heute )?zu hause,? weil es ist (?:sehr )?kalt$/).test(de))return reply('not_yet',review?'Zehn hiểu ý bạn muốn đi ngủ sớm vì mệt. Mình cùng nhìn lại phần sau weil nhé.':'Zehn hiểu ý bạn muốn ở nhà vì lạnh. Mình cùng nhìn lại phần sau weil nhé.',`Bạn thử viết lại câu, đổi vị trí của ${verb} trong phần sau weil nhé?`,'Bạn đã diễn đạt được ý; cần luyện thêm vị trí động từ chia sau weil.');
      if(/o nha|troi lanh|di ngu|met/.test(f)&&!f.includes('weil'))return reply('partial','Zehn hiểu ý bạn nói bằng tiếng Việt rồi. Mình chuyển ý đó sang một câu Đức ngắn nhé.',review?'Bạn thử bắt đầu bằng “Ich gehe…” được không?':'Bạn thử bắt đầu bằng “Ich bleibe…” được không?','Bạn đã nói được ý bằng tiếng Việt; mình chưa có câu dùng weil bằng tiếng Đức.');
      if(stuck)return reply('unknown','Mình chỉ cần ghép từng phần thôi. Bạn có thể mở gợi ý nếu cần.','Bạn thử viết phần đứng trước weil trước nhé?','Mình chưa có đủ câu trả lời để nhận xét cách dùng weil.');
      return reply('unknown','Zehn chưa chắc mình đang hiểu đúng câu này, nên chưa muốn sửa nhầm cho bạn.','Bạn muốn thử một câu ngắn hơn, bắt đầu bằng Ich không?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
    }
    if(t.id==='bears'){
      if(stuck)return reply('unknown','Mình bắt đầu từ một ý bạn nhớ thôi cũng được.','Bạn nhớ ai là người bị rượt đuổi trong trung tâm thương mại không?','Mình chưa có đủ ý chính của đoạn trích để nhận xét.');
      if(s.mode==='review'){
        const calm=/thuong luong|verhandeln|binh tinh|ruhig|noi chuyen|giai thich/.test(f);
        const protect=/bao ve|beschutz|ban be|freunde/.test(f);
        const fight=/danh nhau|giang co|keo ao|kampfen|schlagen/.test(f);
        if(calm&&!fight)return reply('met','Đúng rồi: thay vì giằng co, mọi người giữ bình tĩnh và thương lượng. Bạn nối được đoạn cuối với bài học “bình tĩnh thương lượng” của cả nhóm.','','Bạn đã kể đúng cách mọi người thoát khỏi ngõ cụt ở đoạn cuối.');
        if(protect&&!fight)return reply('partial','Bạn nhớ ý bảo vệ bạn bè. Zehn hỏi thêm một ý nữa nhé.','Họ bảo vệ nhau bằng cách nào: giằng co tiếp, hay giữ bình tĩnh và thương lượng?','Bạn đã nhắc đến việc bảo vệ bạn bè; còn thiếu cách giải quyết bằng thương lượng.');
        if(fight)return reply('not_yet','Giằng co chính là điều làm mọi chuyện căng thẳng hơn trong đoạn này.','Bạn nhớ xem sau đó họ chọn cách nào nhẹ nhàng hơn để nói chuyện với nhau?','Cách giằng co chưa khớp với cách giải quyết ở đoạn cuối.');
        return reply('unknown','Zehn chưa chắc mình hiểu đúng ý này.','Bạn thử nhớ lại từ khóa “ruhig bleiben” và “verhandeln” trong bài nhé?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
      }
      if(s.step===0){
        const who=/panda|tom/.test(f), why=/fan|esteller|ao (gioi han|phien ban)|shirt|limitiert/.test(f),
              chaser=/grizz|griff|bao ve|wachmann/.test(f), vehicle=/tau|zug|schienen|duong ray/.test(f);
        const count=[who,why,chaser,vehicle].filter(Boolean).length;
        if(count>=3)return reply('met','Zehn hình dung ra cả trung tâm thương mại rồi: có người chạy trốn vì chiếc áo, có người đuổi theo bằng tàu hỏa mini.','','Bạn đã kể lại các ý chính của đoạn trích: ai trốn, vì sao, ai đuổi và đuổi bằng gì.');
        if(count===2)return reply('partial','Zehn nghe được một phần của cuộc rượt đuổi rồi.','Bạn còn nhớ ai đuổi theo, hoặc họ đuổi bằng phương tiện gì không?','Bạn đã kể được hai ý chính; còn thiếu một phần của cuộc rượt đuổi.');
        if(count===1)return reply('partial','Zehn nghe được một ý rồi, mình ghép thêm nhé.','Ngoài ý đó, ai là người đuổi theo trong trung tâm thương mại?','Bạn đã kể được một ý chính; cần thêm nhân vật và diễn biến.');
        return reply('unknown','Zehn chưa hình dung rõ đoạn bạn vừa kể.','Bạn thử bắt đầu từ chiếc áo Esteller: ai cũng muốn nó, rồi chuyện gì xảy ra?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
      }
      // bears step 2 (learn): vì sao dùng tàu hỏa mini
      if(/khong duoi kip|duoi khong kip|khong theo kip|nicht einholen|zu fuss.*nicht|chay bo.*khong kip/.test(f))return reply('met','Chính xác: đi bộ thì không đuổi kịp, nên Grizz mới nói “dann eben auf Schienen” — vậy thì đi bằng ray.','','Bạn đã giải thích đúng lý do dùng tàu hỏa mini: đi bộ không đuổi kịp các fan.');
      if(/nhanh hon|schneller|bang tau|mit dem zug|tren ray|schienen/.test(f))return reply('partial','Đúng là tàu nhanh hơn thật. Zehn hỏi rõ thêm một ý.','Nhưng vì sao đi bộ lại không đủ — họ có đuổi kịp nếu cứ chạy bộ không?','Bạn đã nhắc đến tàu hỏa mini; còn thiếu ý đi bộ thì không đuổi kịp.');
      if(/ao|shirt|esteller|fan/.test(f))return reply('not_yet','Chiếc áo là lý do của cuộc rượt đuổi, chưa phải lý do dùng tàu.','Bạn nhớ câu “zu Fuß nicht einholen” của Grizz nói về điều gì?','Cần phân biệt lý do rượt đuổi với lý do chọn tàu hỏa mini.');
      return reply('unknown','Zehn chưa chắc mình hiểu đúng ý này.','Bạn thử nói ngắn gọn: đi bộ thì sao, nên họ phải làm gì?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
    }
    const neg=/khong|chua|nicht|kein/.test(f);
    if(s.mode==='learn'&&s.step===0){
      const activityPatterns=[[/mua (do|sam|hang)|einkauf|kaufen/,'đi mua đồ'],[/nau (sup|an)|kochen/,'nấu súp'],[/xem (phim|mot bo phim)|film.*sehen|sehen.*film/,'xem phim']];
      const mentioned=text=>activityPatterns.filter(([pattern])=>pattern.test(text)).map(([,label])=>label);
      const current=mentioned(f);
      const earlier=s.attempts[s.step].filter(a=>a.verdict==='partial'&&!/khong|chua|nicht|kein/.test(fold(a.text)));
      const activities=[...new Set([...current,...(current.length?earlier.flatMap(a=>mentioned(fold(a.text))):[])])];
      if(activities.length>=2&&!neg)return {...reply('met','Vậy là hai bạn cùng '+activities.join(', ')+'. Zehn hình dung được buổi gặp của họ rồi.','','Bạn đã kể lại ít nhất hai hoạt động đúng trong bài.'),evidenceQuotes:current.length<2?[...earlier.map(a=>a.text),answer]:[answer]};
      if(activities.length===1&&!neg)return reply('partial','Zehn nghe được chuyện hai bạn cùng '+activities[0]+'.','Bạn còn nhớ một việc khác hai bạn làm cùng nhau không?','Bạn đã kể đúng một hoạt động; còn cần thêm một ý chính.');
      if(/^lena di hoc roi ve nha[.!]?$/.test(f))return reply('not_yet','Chi tiết đi học chưa khớp với đoạn chuyện này. Mình tìm lại việc Lena và Mia làm cùng nhau nhé.','Bạn thử xem hai câu ở giữa đoạn có những hoạt động nào?','Chi tiết đi học chưa khớp với bài; mình đã xem lại các hoạt động chính.');
      if(stuck)return reply('unknown','Mình bắt đầu từ một việc bạn nhớ thôi cũng được.','Bạn nhớ hai bạn đã làm gì với bữa ăn không?','Mình chưa có đủ ý chính để nhận xét.');
      return reply('unknown','Zehn chưa hình dung rõ đoạn bạn vừa kể.','Bạn thử kể riêng từng việc hai bạn làm cùng nhau nhé?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
    }
    if(s.mode==='review'){
      if(/bo lo.*xem phim|khong.*xem phim|khong the.*phim|film nicht.*sehen|nicht.*film.*sehen/.test(f)||/^(?:viec )?xem (?:mot bo )?phim(?: cung mia)?[.!]?$/.test(f))return reply('met','À, Lena sẽ không xem phim cùng Mia được. Bạn đã nối được giờ về với kế hoạch buổi tối.','','Bạn đã suy ra Lena sẽ bỏ lỡ việc xem phim cùng Mia.');
      if(/mua do|einkauf/.test(f))return reply('not_yet','Hai bạn đã đi mua đồ trước buổi tối rồi.','Vậy kế hoạch nào sẽ bị lỡ nếu Lena về sớm?','Cần phân biệt hoạt động trước buổi tối với kế hoạch xem phim buổi tối.');
    }else{
      if(/xem phim|xem mot bo phim|film.*sehen|sehen.*film/.test(f)&&!neg)return reply('met','À, Lena muốn ở lại để xem phim cùng Mia. Nhờ bạn kể thêm, Zehn hiểu vì sao cô ấy chưa về.','','Bạn đã giải thích đúng lý do Lena ở lại đến tối.');
      if(/mua do|einkauf/.test(f)&&!neg)return reply('not_yet','Đúng là hai bạn có đi mua đồ. Nhưng việc đó diễn ra trước buổi tối.','Lena còn muốn làm gì cùng Mia vào buổi tối?','Bạn nhớ hoạt động mua đồ; cần nối lý do ở lại với kế hoạch xem phim.');
    }
    if(stuck)return reply('unknown','Mình tìm lại đúng chi tiết đó trong bài nhé.','Bạn thấy hai bạn có kế hoạch gì trong câu bắt đầu bằng “Am Abend…”?','Mình chưa có đủ câu trả lời về kế hoạch buổi tối.');
    return reply('unknown','Zehn chưa chắc mình hiểu đúng ý này.','Bạn thử nói rõ hoạt động của hai người vào buổi tối nhé?','Cách diễn đạt này Zehn chưa nhận diện đủ.',true);
  }
  function submit(){const s=state.session;if(!s||s.feedback||s.completedAt)return;const el=document.getElementById('answer');if(!el)return;const answer=el.value.trim();if(!answer)return;s.drafts[s.step]=answer;const result=grade(answer);s.attempts[s.step].push({text:answer,verdict:result.verdict});s.feedback={...result,answer};if(result.verdict!=='met'&&result.verdict!=='unknown')addSupport('followup');if(s.attempts[s.step].length>=2&&result.verdict!=='met')addSupport('model');save();render();document.querySelector('.feedback')?.scrollIntoView({block:'nearest'});}
  function addSupport(kind){const s=state.session;if(!s.supports[s.step].includes(kind))s.supports[s.step].push(kind);}
  function next(){const s=state.session;if(!s.feedback)return;s.results[s.step]={...s.feedback,conversationReply:s.feedback.message,message:s.feedback.takeaway||s.feedback.message,supports:supportsFor(s.step),language:/[à-ỹđĐ]/.test(s.feedback.answer||'')?'vi_or_mixed':'de_or_other',attempts:s.attempts[s.step].length};s.feedback=null;s.retryNote='';s.retryPrompt='';if(s.step<steps().length-1){s.step++;save();render();document.getElementById('answer')?.focus();}else finish();}
  function finish(){const s=state.session;if(!s.completedAt){s.completedAt=new Date().toISOString();const q=state.queue[s.taskId],allMet=s.results.every(r=>r.verdict==='met'),hasUnknown=s.results.some(r=>r.verdict==='unknown'),skipped=s.results.some(r=>r.verdict==='skipped'),assisted=s.results.some(r=>r.supports.length);if(skipped)state.queue[s.taskId]={status:'pending'};else if(!hasUnknown){const days=allMet&&!assisted?(s.mode==='review'?7:3):1;const date=new Date();date.setDate(date.getDate()+days);state.queue[s.taskId]={status:'review',dueAt:date.toISOString()};}else if(!q)delete state.queue[s.taskId];if(!state.history.some(h=>h.id===s.id))state.history.push(JSON.parse(JSON.stringify(s)));if(window.VokabelEvidence)window.VokabelEvidence.record('teachme','completed',{ref:s.taskId});}state.view='summary';save();render();main.focus();window.scrollTo({top:0,behavior:'instant'});}
  function openModal(title,content){document.getElementById('modal-content').innerHTML=`<div class="dialog-heading"><h2 id="modal-title">${escape(title)}</h2><button class="close-button" data-action="close" aria-label="Đóng">×</button></div>${content}`;if(!modal.open)modal.showModal();}
  function close(){if(modal.open)modal.close();}
  const actions={
    home:()=>{close();go('home');},journal:()=>go('journal'),
    source:b=>{state.selected=b.dataset.task;go('source');},
    start:b=>start(b.dataset.task),
    replace:b=>{close();start(b.dataset.task,b.dataset.mode,true);},
    resume:()=>{close();go('session');},
    review:b=>start(b.dataset.task,'review'),
    pause:()=>{go('home');notify(storageOk?'Zehn giữ trang này rồi. Khi nào sẵn sàng, mình kể tiếp nhé.':'Chưa lưu được lượt này trên trình duyệt.');},
    defer:b=>{state.queue[b.dataset.task]=state.queue[b.dataset.task]||{status:'pending'};go('home');notify(storageOk?'Zehn để dành bài này rồi. Mình quay lại lúc bạn muốn nhé.':'Chưa lưu được mục này trên trình duyệt.');},
    translation:b=>{const el=b.nextElementSibling;el.hidden=!el.hidden;b.setAttribute('aria-expanded',String(!el.hidden));b.textContent=el.hidden?'Hiện bản dịch tiếng Việt ＋':'Ẩn bản dịch tiếng Việt −';},
    hint:()=>{const s=state.session;if(s.feedback||(s.hintLevels[s.step]||0)>=2)return;s.hintLevels[s.step]++;addSupport(s.hintLevels[s.step]===1?'keywords':'sentence');save();render();document.getElementById('answer')?.focus();},
    'source-modal':()=>{if(state.view==='session'&&(!state.session.feedback||!['met','skipped'].includes(state.session.feedback.verdict))){addSupport('source');save();render();}openModal('Xem lại bài',`<div class="dialog-copy">${sourceMarkup(task(),true)}</div>`);},
    sample:b=>{const s=state.session;addSupport('sample');const el=document.getElementById('answer');el.value=steps()[s.step].samples[Number(b.dataset.index)];el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();notify('Đã điền câu mẫu. Bấm Gửi Zehn để thử phản hồi.');},
    retry:()=>{const s=state.session;s.retryNote=s.feedback.message;s.retryPrompt=s.feedback.followUp||steps()[s.step].prompt;s.feedback=null;s.drafts[s.step]='';save();render();document.getElementById('answer')?.focus();},
    'accept-model':()=>{const s=state.session;addSupport('model');s.feedback.modelShown=true;save();render();},
    skip:()=>{const s=state.session;if(s.feedback)return;addSupport('model');s.feedback={verdict:'skipped',message:'Được chứ. Mình để phần này lại, bạn có thể xem một cách nói ở bên dưới.',answer:s.drafts[s.step]||''};save();render();},
    next,
    history:b=>{const h=state.history.find(h=>h.id===b.dataset.id);if(!h)return;const t=taskData[h.taskId],list=h.mode==='review'?[t.review]:t.steps;openModal(t.title,`<p class="quiet">${h.mode==='review'?'Lượt ôn':'Lượt luyện'} · ${dateLabel(h.completedAt)}</p>${h.results.map((r,i)=>resultMarkup(r,list[i].title)).join('')}`);},
    queue:()=>openModal('Những điều mình để dành',Object.entries(state.queue).map(([id,q])=>`<div class="result-row"><div><strong>${escape(taskData[id].title)}</strong><p class="quiet">${q.dueAt?'Ôn dự kiến '+dateLabel(q.dueAt):'Mình đã để dành bài này.'}</p>${button(q.dueAt?'queue-review':'queue-source',q.dueAt?'Thử lượt ôn ngay':'Mở bài',`data-task="${id}"`,'text-button')}</div></div>`).join('')),
    'queue-review':b=>{close();start(b.dataset.task,'review');},
    'queue-source':b=>{close();state.selected=b.dataset.task;go('source');},
    report:()=>openModal('Phản hồi này cần xem lại?',`<p class="dialog-copy">Góp ý được lưu trên trình duyệt này để giáo viên xem lại và cải thiện bài luyện.</p><div class="report-options"><label><input type="radio" name="reason" value="wrong" checked>Nhận xét chưa đúng</label><label><input type="radio" name="reason" value="unclear">Giải thích khó hiểu</label><label><input type="radio" name="reason" value="other">Vấn đề khác</label></div><div class="dialog-actions">${button('close','Đóng','','button secondary')}${button('save-report','Lưu góp ý')}</div>`),
    'save-report':()=>{state.reports.push({sessionId:state.session.id,step:state.session.step,answer:state.session.feedback?.answer,feedback:state.session.feedback?.message,reason:modal.querySelector('input:checked')?.value,at:new Date().toISOString()});const ok=save();close();notify(ok?'Đã lưu góp ý tại máy này. Cảm ơn chị!':'Chưa lưu được góp ý trên trình duyệt.');},
    about:()=>openModal('Teach Me hoạt động thế nào?',`<div class="dialog-copy"><p>Teach Me là lớp luyện tập dùng chung của VokabelGo: bạn <strong>dạy lại cho Zehn</strong> điều vừa học — kể lại một bài, giải thích một điểm ngữ pháp — rồi vận dụng ngay trong một tình huống mới.</p><p><strong>Phản hồi theo rubric, không phải AI:</strong> mỗi bài luyện có bộ quy tắc và câu mẫu đã soạn sẵn. Zehn chỉ nhận xét những gì kiểm chứng được từ câu trả lời của bạn; cách diễn đạt ngoài phạm vi sẽ được ghi “chưa đủ cơ sở”, không bị kết luận là sai.</p><p>Mỗi bước tối đa hai lượt trả lời. Gợi ý, xem lại bài và xem câu mẫu đều được ghi nhận là hỗ trợ, và kết quả được lưu riêng — <strong>không tự thay đổi tiến độ từ vựng hay điểm SRS</strong> của bạn.</p><p>Lịch ôn do hệ thống đề xuất: cần hỗ trợ thì ôn sau 1 ngày, tự làm được thì 3 ngày, ôn đạt ở tình huống mới thì 7 ngày. Dữ liệu chỉ lưu trên trình duyệt này.</p></div><div class="dialog-actions">${button('close','Mình thử nhé →')}</div>`),
    'reset-dialog':()=>openModal('Làm mới dữ liệu Teach Me?',`<p class="dialog-copy">Xóa lượt đang dở, kết quả và góp ý của Teach Me trên trình duyệt này.</p><div class="dialog-actions">${button('close','Giữ lại','','button secondary')}${button('reset','Làm mới')}</div>`),
    reset:()=>{close();state=fresh();save();render();notify('Teach Me đã sẵn sàng để luyện lại từ đầu.');},
    close,
    'save-again':()=>{save();render();notify(storageOk?'Đã lưu lại kết quả.':'Trình duyệt vẫn chưa lưu được.');}
  };
  document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b&&!b.disabled)actions[b.dataset.action]?.(b);});
  document.addEventListener('submit',event=>{if(event.target.id==='answer-form'){event.preventDefault();submit();}});
  document.addEventListener('input',event=>{if(event.target.id!=='answer')return;state.session.drafts[state.session.step]=event.target.value;document.getElementById('char-count').textContent=event.target.value.length+' / 700';document.getElementById('send-answer').disabled=!event.target.value.trim();save();});
  document.addEventListener('keydown',event=>{if(event.target.id==='answer'&&(event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();submit();}});
  modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
  // Deep link từ các điểm vào (cuối bài Kino, hub Trò chơi): ?task=<id> mở trang nguồn của nhiệm vụ,
  // ?view=journal mở Nhật ký. Chỉ áp dụng khi không có lượt học đang dở.
  (function applyDeepLink(){
    try {
      const params = new URLSearchParams(window.location.search);
      const taskParam = params.get('task');
      const viewParam = params.get('view');
      const hasActiveSession = state.session && !state.session.completedAt;
      if (viewParam === 'journal') state.view = 'journal';
      else if (taskParam && taskData[taskParam] && !hasActiveSession) {
        state.selected = taskParam;
        state.view = 'source';
      } else if (state.session && state.session.completedAt) {
        // Lượt trước đã kết thúc: quay về góc học (kết quả vẫn xem lại được ở Nhật ký)
        state.view = 'home';
      }
    } catch (e) { /* URL không hợp lệ: bỏ qua deep link */ }
  })();
  render();
})();
