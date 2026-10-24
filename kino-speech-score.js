// VokabelGo — Chấm phát âm cơ bản cho lồng tiếng Kino (Mục 5 cải thiện Kino).
// Dùng nhận dạng giọng nói của trình duyệt (de-DE) nghe người học đọc câu mẫu,
// so khớp từng từ bằng LCS và tô màu từ đúng/lệch. Chỉ là điểm tham khảo —
// độ chính xác phụ thuộc ASR của trình duyệt. Không hỗ trợ -> không hiện nút.
(function () {
  'use strict';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function normWord(w) {
    return String(w || '').toLowerCase()
      .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9-]/g, '');
  }
  // So khớp câu mẫu với câu nghe được: trả % từ khớp + tập chỉ số từ khớp.
  function scoreWords(target, heard) {
    var T = String(target || '').split(/\s+/).filter(Boolean);
    var Tn = T.map(normWord);
    var H = String(heard || '').split(/\s+/).filter(Boolean).map(normWord);
    var dp = [];
    for (var i = 0; i <= Tn.length; i++) { dp.push(new Array(H.length + 1).fill(0)); }
    for (var a = Tn.length - 1; a >= 0; a--) {
      for (var b = H.length - 1; b >= 0; b--) {
        dp[a][b] = Tn[a] && Tn[a] === H[b] ? dp[a + 1][b + 1] + 1 : Math.max(dp[a + 1][b], dp[a][b + 1]);
      }
    }
    var matched = new Set();
    var x = 0, y = 0;
    while (x < Tn.length && y < H.length) {
      if (Tn[x] && Tn[x] === H[y]) { matched.add(x); x++; y++; }
      else if (dp[x + 1][y] >= dp[x][y + 1]) x++;
      else y++;
    }
    return { pct: Tn.length ? Math.round((matched.size / Tn.length) * 100) : 0, matched: matched, words: T };
  }

  function render(box, target, heard) {
    var r = scoreWords(target, heard);
    var wordsHtml = r.words.map(function (w, i) {
      return '<span style="color:' + (r.matched.has(i) ? '#35703c' : '#b03a3a') + ';font-weight:700;">' + esc(w) + '</span>';
    }).join(' ');
    box.innerHTML = '<div>Điểm khớp: <strong>' + r.pct + '%</strong></div>'
      + '<div style="margin-top:5px;line-height:1.6;">' + wordsHtml + '</div>'
      + '<div style="margin-top:5px;color:#5D5347;">Máy nghe được: „' + esc(heard) + '"</div>'
      + '<div style="margin-top:3px;font-size:12.5px;color:#8a7f6a;">Chấm tự động bằng nhận dạng giọng nói của trình duyệt — chỉ để tham khảo, không thay tai người.</div>';
  }

  function startScore(btn, box) {
    var targetEl = document.getElementById('kinoDubTargetDe') || document.getElementById('kinoOverlayDe');
    var target = targetEl ? targetEl.textContent.trim() : '';
    if (!target) { box.hidden = false; box.textContent = 'Chưa có câu mẫu để chấm.'; return; }
    var video = document.getElementById('kinoMainVideo');
    if (video) video.pause();
    var rec = new SR();
    rec.lang = 'de-DE';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    btn.disabled = true;
    btn.textContent = '🎙 Đang nghe… hãy đọc câu mẫu';
    box.hidden = false;
    box.textContent = 'Đang nghe bạn đọc…';
    rec.onresult = function (e) {
      var heard = e.results[0][0].transcript || '';
      render(box, target, heard);
    };
    rec.onerror = function (e) {
      box.textContent = e.error === 'not-allowed'
        ? 'Trình duyệt cần quyền micro mới chấm được. Hãy cho phép micro rồi thử lại.'
        : 'Chưa nghe rõ — thử lại ở nơi yên tĩnh, đọc chậm và rõ hơn.';
    };
    rec.onend = function () {
      btn.disabled = false;
      btn.textContent = '🎙 Chấm phát âm câu này';
    };
    try { rec.start(); } catch (err) {
      btn.disabled = false;
      btn.textContent = '🎙 Chấm phát âm câu này';
      box.textContent = 'Chưa khởi động được nhận dạng giọng nói trên trình duyệt này.';
    }
  }

  function mount() {
    var recordBtn = document.getElementById('kinoDubRecordBtn');
    if (!recordBtn || document.getElementById('kinoScoreBtn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'kinoScoreBtn';
    btn.textContent = '🎙 Chấm phát âm câu này';
    btn.style.cssText = 'margin-top:10px;margin-right:8px;border:1.5px solid #52723f;color:#3e5c32;background:#fff;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer;';
    var box = document.createElement('div');
    box.id = 'kinoScoreResult';
    box.hidden = true;
    box.style.cssText = 'margin-top:10px;border:1px solid #d8cfb8;background:#FFFDF7;border-radius:12px;padding:12px 14px;font-size:14.5px;color:#2B241E;';
    recordBtn.parentElement.appendChild(btn);
    recordBtn.parentElement.appendChild(box);
    btn.addEventListener('click', function () { startScore(btn, box); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  setInterval(mount, 2000);

  window.KinoSpeechScore = { scoreWords: scoreWords };
})();
