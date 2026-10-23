// VokabelGo — Thẻ mời Teach Me ở cuối phần giới thiệu bài Kino.
// Chỉ hiện với bài đã có nhiệm vụ Teach Me tương ứng (hiện tại: We Bare Bears).
// "Để sau" ghi một mục chờ duy nhất vào đúng kho dữ liệu của Teach Me,
// giữ nguyên toàn bộ trạng thái sẵn có của người học.
(function () {
  var CARD_ID = 'teachMeInviteCard';
  var TM_KEY = 'vokabelgo_teachme_v1';

  function ensureStyle() {
    if (document.getElementById('teachMeInviteStyle')) return;
    var st = document.createElement('style');
    st.id = 'teachMeInviteStyle';
    st.textContent = [
      '.teach-me-invite{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;',
      'margin:18px 0;padding:18px 20px;border:2px solid #2B241E;border-radius:18px;background:linear-gradient(160deg,#FFFDF4,#F5F8ED);',
      'box-shadow:0 4px 0 rgba(43,36,30,.9);font-family:\'Plus Jakarta Sans\',system-ui,sans-serif;color:#2B241E}',
      '.teach-me-invite strong{font-size:16.5px}',
      '.teach-me-invite p{margin:5px 0 0;color:#736B63;font-size:13.5px;line-height:1.55;max-width:560px}',
      '.tm-invite-actions{display:flex;gap:9px;align-items:center;flex-shrink:0}',
      '.tm-invite-go{background:#DB5B23;color:#fff;font-weight:800;font-size:14px;text-decoration:none;',
      'padding:11px 17px;border-radius:12px;border:2px solid #2B241E;box-shadow:0 3px 0 rgba(43,36,30,.9)}',
      '.tm-invite-go:hover{background:#C44D18}',
      '.tm-invite-later{background:transparent;border:0;color:#736B63;font-weight:700;font-size:13.5px;cursor:pointer;padding:10px 6px}',
      '.tm-invite-later:hover{color:#2B241E}'
    ].join('');
    document.head.appendChild(st);
  }

  function deferBears(card) {
    try {
      var state = null;
      try { state = JSON.parse(localStorage.getItem(TM_KEY)); } catch (e) { state = null; }
      if (!state || state.version !== 1 || !Array.isArray(state.history) || !state.queue) {
        state = { version: 1, view: 'home', selected: 'weil', session: null, history: [], queue: {}, reports: [] };
      }
      if (!state.queue.bears) state.queue.bears = { status: 'pending' };
      localStorage.setItem(TM_KEY, JSON.stringify(state));
    } catch (e) { /* localStorage không khả dụng: bỏ qua, không chặn bài học */ }
    card.remove();
  }

  function sync() {
    var overview = document.getElementById('kinoMovieOverview');
    var series = document.getElementById('kinoMovieSeries');
    var title = document.getElementById('kinoMovieTitle');
    var label = (series ? series.textContent : '') + ' ' + (title ? title.textContent : '');
    var isBears = !!(overview && /We Bare Bears/i.test(label) && overview.offsetParent !== null);
    var card = document.getElementById(CARD_ID);
    if (isBears && !card) {
      ensureStyle();
      card = document.createElement('div');
      card.id = CARD_ID;
      card.className = 'teach-me-invite';
      card.innerHTML = '<div><strong>🐾 Dạy Zehn · khoảng 3 phút</strong>' +
        '<p>Kể lại cuộc rượt đuổi ở trung tâm thương mại cho Zehn nghe — Zehn hỏi, bạn kể, rồi cùng chốt lại vì sao phải dùng tàu hỏa mini.</p></div>' +
        '<span class="tm-invite-actions"><a class="tm-invite-go" href="teach-me.html?task=bears">Dạy Zehn →</a>' +
        '<button type="button" class="tm-invite-later">Để sau</button></span>';
      var anchor = document.getElementById('kinoMovieWatchAction') || overview;
      anchor.insertAdjacentElement('afterend', card);
      card.querySelector('.tm-invite-later').addEventListener('click', function () { deferBears(card); });
    } else if (!isBears && card) {
      card.remove();
    }
  }

  setInterval(sync, 900);
})();
