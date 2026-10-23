(() => {
  'use strict';
  const dialog = document.getElementById('detailDialog');
  const dialogBody = document.getElementById('dialogBody');
  let dialogTrigger = null;
  const places = {
    house: { kind: '01 / NHÀ MÂY', title: 'Một góc nhỏ của riêng bạn.', text: 'Ngôi nhà mái xanh là hồ sơ trong thế giới: tên gọi, mục tiêu học, lịch ôn, những vùng đã ghé và đồ trang trí. Mây ở đây chào bạn mỗi lần quay lại.', action: 'Xem hồ sơ Mây', view: 'profile' },
    reading: { kind: '02 / VƯỜN ĐỌC', title: 'Đọc một chuyện. Nghe một câu.', text: 'Hiên vườn là nơi mở truyện ngắn, bài đọc và rạp Kino. Người học chọn bài theo trình độ, bật phụ đề Đức/Việt và nghe lại từng câu. Mây ngồi cạnh với chuyển động nhẹ.', action: 'Xem luồng học', view: 'flow' },
    market: { kind: '03 / BẾN CHỢ', title: 'Mang tiếng Đức ra dùng.', text: 'Quầy cá và chợ nổi dành cho hội thoại, chọn món, nhận đơn và luyện dùng từ trong ngữ cảnh. Thợ sửa đồ là nhánh kế tiếp của sổ khám phá. Đây là công năng được đề xuất; bộ concept chưa nối dữ liệu game.', action: 'Xem Bến Chợ Nổi', region: 'market' },
    fishing: { kind: '04 / BÈ HỌC TỪ', title: 'Một buổi học, một lần ra bến.', text: 'Chọn bộ từ, ôn những từ đến hạn rồi tự trả lời trước khi xem đáp án. Kết thúc buổi mới đến đoạn Mây kéo cá và cất một kỷ niệm. Phần thưởng game được ghi riêng với bằng chứng nhớ từ.', action: 'Thử luồng một câu', view: 'flow' },
    map: { kind: '05 / HẢI TRÌNH', title: 'Đảo nhà là điểm bắt đầu.', text: 'Từ chiếc bè, Mây đi qua ao sen, chợ nổi, vịnh vỏ sò rồi những vùng đêm. Mỗi nơi có bảng màu, cảnh nền, đồ nhặt và diễn xuất riêng. Các vùng đã mở luôn có thể quay lại.', action: 'Mở bản đồ', view: 'world' },
    may: { kind: 'GẶP MÂY', title: '“Bạn đến rồi!”', text: 'Mây hiền, tò mò, hơi lười và mê cá. Bé không trách khi bạn sai hoặc nghỉ học. Khi bạn cần tập trung, Mây chỉ chớp mắt, nhìn theo phao hoặc ngồi chờ.', action: 'Làm quen với Mây', view: 'profile' }
  };
  const regions = {
    pond: { n: '01', title: 'Ao Cỏ May', mood: 'Cỏ lau · nước ngọc · chuồn chuồn', text: 'Nơi bắt đầu: học thao tác, ôn từ trên bè, gặp cá nhỏ và chiếc ủng đầu tiên. Bờ cỏ đơn giản, nền thoáng để câu hỏi dễ đọc.', keepsake: 'Chiếc ủng trồng hoa', color: '#eaf1df' },
    lotus: { n: '02', title: 'Đầm Sen Ngủ Gật', mood: 'Lá sen · hồng dịu · tiếng ếch', text: 'Mây núp lá sen, ngáp và gặp một chú ếch ngồi ké. Phù hợp các bài nghe hoặc truyện ngắn về sinh hoạt, thời tiết và cảm xúc.', keepsake: 'Chiếc lá sen làm ô', color: '#f6e9e6' },
    market: { n: '04', title: 'Bến Chợ Nổi', mood: 'Thuyền rau · quầy cá · mái vải', text: 'Gặp bạn hàng rái cá và gấu mèo sửa đồ trong kế hoạch mở rộng. Luyện hỏi giá, yêu cầu, đặt món và hội thoại; đổi đồ sưu tầm sau buổi học.', keepsake: 'Giỏ hàng & đồ được sửa', color: '#f4ead8' },
    shell: { n: '08', title: 'Vịnh Vỏ Sò', mood: 'Cát kem · xanh biển · vỏ ốc', text: 'Một điểm đến thoáng và ít chi tiết. Mây nghe tiếng sóng trong vỏ ốc, gặp ốc mượn hồn. Dùng cùng bộ bài học đã chọn, thay bối cảnh và câu chuyện.', keepsake: 'Vỏ sò nhỏ', color: '#f5efdd' },
    lantern: { n: '15', title: 'Vịnh Đèn Lồng', mood: 'Đèn ấm · nước chàm · làng ven bờ', text: 'Cảnh tối ấm với ánh đèn phản chiếu. Bài nghe vẫn giữ giao diện sáng, độ tương phản đủ rõ. Người học chọn cảnh đêm bất cứ lúc nào, không phải chờ đúng giờ thật.', keepsake: 'Đèn lồng treo bè', color: '#e7e9f2' },
    moon: { n: '18', title: 'Hồ Trăng Rơi', mood: 'Tím bạc · lau sậy · đom đóm', text: 'Vùng huyền ảo: Mây thử vớt trăng và gặp Cá Trăng hư cấu. Là phần thưởng khám phá dài hạn; các ngưỡng mở vùng cần thử nghiệm riêng.', keepsake: 'Mảnh trăng trong sổ', color: '#eee8f5' }
  };
  const allRegions = ['Ao Cỏ May','Đầm Sen Ngủ Gật','Khúc Sông Tre','Bến Chợ Nổi','Kênh Vườn Trái Cây','Rừng Đước Rì Rào','Bãi Cua Chạy Ngang','Vịnh Vỏ Sò','Vườn San Hô','Biển Buồm Xa','Vũng Mưa Tí Tách','Hồ Sương Mỏng','Suối Nước Ấm','Hồ Băng Leng Keng','Vịnh Đèn Lồng','Vịnh Tàu Ngủ Quên','Hang Pha Lê','Hồ Trăng Rơi','Biển Mây Bồng Bềnh','Hải Trình Ngân Hà'];
  const regionList = document.getElementById('regionList');
  Object.entries(regions).forEach(([key, region]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'region-card'; button.dataset.region = key;
    button.innerHTML = `<b>${region.n}</b><span><strong>${region.title}</strong><small>${region.mood}</small></span>`;
    regionList.append(button);
  });
  allRegions.forEach(name => {
    const item = document.createElement('li'); item.textContent = name;
    document.getElementById('allRegions').append(item);
  });
  const closeDialog = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => dialogTrigger?.focus());
  document.querySelector('.close-dialog').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
  const openDialog = (html, wide = false) => {
    if (!dialog.open) dialogTrigger = document.activeElement;
    dialogBody.innerHTML = html;
    dialog.classList.toggle('wide-dialog', wide);
    if (!dialog.open) dialog.showModal();
  };
  let centeredHome = false;
  const setView = view => {
    if (!['home','profile','world','flow'].includes(view)) return;
    closeDialog();
    document.querySelectorAll('[data-panel]').forEach(panel => panel.hidden = panel.dataset.panel !== view);
    document.querySelectorAll('nav [data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    if (view === 'home' && !centeredHome) {
      const viewport = document.getElementById('homeViewport');
      viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) * .55);
      centeredHome = true;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const showRegion = key => {
    const region = regions[key]; if (!region) return;
    openDialog(`<p class="detail-kind">VÙNG ${region.n} / CONCEPT</p><h2 id="dialogTitle">${region.title}</h2><p>${region.mood}</p><p>${region.text}</p><p><strong>Kỷ niệm:</strong> ${region.keepsake}.</p><p class="subtle">Các vùng nước tạo cảm giác khám phá. Trình độ và bộ từ được chọn riêng; chưa áp dụng ngưỡng mở hoặc thưởng thật.</p><div class="button-row"><button type="button" class="primary-button" data-go="flow">Xem cách học cùng Mây ↗</button></div>`);
  };
  const flow = { step: 0, attempts: 0, assisted: false, correct: false, hint: false };
  const card = document.getElementById('flowCard');
  const renderFlow = () => {
    document.querySelectorAll('[data-step]').forEach(item => {
      if (Number(item.dataset.step) === flow.step) item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
    });
    const speech = document.getElementById('maySpeech');
    const tag = '<p class="flow-tag">BẢN TƯƠNG TÁC MINH HỌA · KHÔNG LƯU TIẾN ĐỘ</p>';
    if (flow.step === 0) {
      speech.textContent = '“Bạn đến rồi. Mình đi một chút nhé?”';
      card.innerHTML = `${tag}<h2>Về đảo, gặp Mây.</h2><p>Trang đầu là thế giới của bé. Buổi học gần nhất hiện thành một lời mời ngắn; người mới được hướng dẫn chọn một điểm trên đảo.</p><p><strong>Ví dụ:</strong> Hôm nay mình ôn ở Ao Cỏ May.</p><div class="button-row"><button type="button" class="primary-button" data-flow="begin">Ra bến cùng Mây ↗</button></div>`;
    } else if (flow.step === 1) {
      speech.textContent = '“Bè sẵn rồi. Mình bắt đầu nhé?”';
      card.innerHTML = `${tag}<h2>Chọn một việc vừa sức.</h2><p>Trong sản phẩm thật: chọn bộ từ và mục tiêu, ưu tiên những từ đến hạn. Giữ nguyên lịch ôn khi đổi vùng nước.</p><p class="hint-text">Bản thử này có 1 câu nhận diện nghĩa. Chưa có giọng đọc hoặc bài học thật được nối vào.</p><div class="button-row"><button type="button" class="primary-button" data-flow="study">Thử câu minh họa ↗</button><button type="button" class="secondary-button" data-flow="restart">Quay lại</button></div>`;
    } else if (flow.step === 2) {
      speech.textContent = flow.hint ? '“Mây đang đứng trên một nơi được nước bao quanh.”' : '“Bạn thử trước nhé. Mình đợi ở đây.”';
      card.innerHTML = `${tag}<h2>Bạn hiểu từ này thế nào?</h2><div class="sample-word" lang="de">die Insel</div><p>Chọn nghĩa tiếng Việt.</p><div class="answer-options"><button type="button" class="answer-option" data-answer="0">Hòn đảo</button><button type="button" class="answer-option" data-answer="1">Ngọn núi</button><button type="button" class="answer-option" data-answer="2">Con đường</button></div>${flow.hint ? '<p class="hint-text">Gợi ý: Một vùng đất có nước bao quanh.</p>' : '<div class="button-row"><button type="button" class="text-link" data-flow="hint">Mình cần gợi ý</button></div>'}`;
    } else if (flow.step === 3) {
      speech.textContent = flow.correct ? '“Đúng rồi. Một bước nhỏ nữa!”' : '“Không sao. Mình xem rồi thử lại nhé.”';
      card.innerHTML = `${tag}<h2>${flow.correct ? 'Đúng rồi: hòn đảo.' : 'Mình cùng xem lại.'}</h2><p class="${flow.correct ? 'feedback-success' : 'feedback-error'}"><strong>die Insel = hòn đảo.</strong></p><p>Một vùng đất được nước bao quanh. Ngọn núi là <span lang="de">der Berg</span>; con đường là <span lang="de">der Weg</span>.</p><p>${flow.correct ? (flow.assisted || flow.attempts > 1 ? 'Lần này được ghi là trả lời có trợ giúp / sửa lại đúng.' : 'Bạn chọn đúng ngay lần đầu, chưa dùng gợi ý.') : 'Lượt tiếp theo được ghi nhận là sửa lại, vì đáp án đã được hiển thị.'}</p><div class="button-row"><button type="button" class="primary-button" data-flow="${flow.correct ? 'finish' : 'retry'}">${flow.correct ? 'Xem kết quả ↗' : 'Thử lại một lần'}</button></div>`;
    } else {
      speech.textContent = '“Cảm ơn bạn đã học cùng mình. Hẹn ở đảo nhé!”';
      const independent = !flow.assisted && flow.attempts === 1;
      card.innerHTML = `${tag}<h2>Một chút hôm nay.</h2><div class="result-line"><span>Câu nhận diện đã làm</span><strong>1</strong></div><div class="result-line"><span>Đúng lần đầu, chưa trợ giúp</span><strong>${independent ? '1' : '0'}</strong></div><div class="result-line"><span>Có gợi ý / sửa lại đúng</span><strong>${independent ? '0' : '1'}</strong></div><p>Một lần chọn nghĩa đúng chưa đủ kết luận đã nhớ vững. Trong luồng thật, từ sẽ được ôn lại bằng câu hỏi phù hợp.</p><p class="hint-text">Sau tổng kết: Mây có thể kéo cá, nhặt vật kỷ niệm hoặc chào bạn về đảo. Hoạt cảnh và phần thưởng đang ở bước thiết kế.</p><div class="button-row"><button type="button" class="primary-button" data-go="home">Về đảo nhà ↗</button><button type="button" class="secondary-button" data-flow="restart">Thử lại từ đầu</button></div>`;
    }
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.view) setView(button.dataset.view);
    if (button.dataset.go) setView(button.dataset.go);
    if (button.dataset.place) {
      const place = places[button.dataset.place]; if (!place) return;
      openDialog(`<p class="detail-kind">${place.kind}</p><h2 id="dialogTitle">${place.title}</h2><p>${place.text}</p><div class="button-row"><button type="button" class="primary-button" ${place.view ? `data-go="${place.view}"` : `data-region="${place.region}"`}>${place.action} ↗</button></div>`);
    }
    if (button.dataset.region) showRegion(button.dataset.region);
    if (button.hasAttribute('data-open-original')) openDialog('<p class="detail-kind">CHUẨN NHẬN DIỆN DUY NHẤT</p><h2 id="dialogTitle">Ảnh gốc của Mây.</h2><p>Bảng tư thế và các cảnh mới là bản chuyển thể đề xuất. Đối chiếu mắt, má, mảng lông, khăn và độ dày viền với ảnh này.</p><img src="art/may-canonical-reference.png" alt="Ảnh gốc đã duyệt: Mây tam thể khăn xanh ngồi câu cá trên bè">', true);
    if (button.hasAttribute('data-open-village')) openDialog('<p class="detail-kind">PHƯƠNG ÁN BỔ SUNG</p><h2 id="dialogTitle">Làng học trên một đảo.</h2><p>Phương án mở rộng: đưa nhiều công năng học lên cùng một đảo. Đảo nhà hiện tại dùng ít địa điểm hơn, có nhà, bến và đường đi thoáng.</p><img src="art/may-village-hub.png" alt="Phương án làng học với sáu địa điểm quanh sân có Mây">', true);
    if (button.dataset.answer !== undefined && flow.step === 2) {
      flow.attempts++; flow.correct = button.dataset.answer === '0';
      if (!flow.correct) flow.assisted = true;
      flow.step = 3; renderFlow();
    }
    if (button.dataset.flow) {
      const action = button.dataset.flow;
      if (action === 'begin' && flow.step === 0) flow.step = 1;
      if (action === 'study' && flow.step === 1) flow.step = 2;
      if (action === 'hint' && flow.step === 2) { flow.hint = true; flow.assisted = true; }
      if (action === 'retry' && flow.step === 3 && !flow.correct) flow.step = 2;
      if (action === 'finish' && flow.step === 3 && flow.correct) flow.step = 4;
      if (action === 'restart') Object.assign(flow, { step: 0, attempts: 0, assisted: false, correct: false, hint: false });
      renderFlow();
    }
  });
  renderFlow();
  setView('home');
})();
