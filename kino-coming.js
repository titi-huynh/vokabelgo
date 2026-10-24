/* VokabelGo — Kệ "Sắp có trên Kino": các tựa phim đã được duyệt để bổ sung
   vào catalog. Mỗi tựa chờ đúng một thứ: file video. Khi file được đặt vào
   thư mục video/ của app theo tên gợi ý, khâu phụ đề/căn/đăng ký sẽ được
   làm tiếp bằng tools/kino-import như các phim hiện có. */
(function () {
  'use strict';
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const TITLES = [
    { key: 'tatortreiniger', emoji: '🧹', title: 'Der Tatortreiniger', level: 'B1–B2', genre: 'Hài đen',
      format: '31 tập · ~25 phút/tập · mỗi tập khép kín',
      pitch: 'Anh chàng dọn hiện trường vụ án và những cuộc đối thoại vừa triết lý vừa hài khô với người lạ. Thoại chậm, rõ, ít nhân vật — gần như sinh ra để học nghe.',
      file: 'video/tatortreiniger-s01e01.mp4', source: 'Phim truyền hình NDR — cần file video.' },
    { key: 'tuerkisch', emoji: '🏠', title: 'Türkisch für Anfänger', level: 'B1', genre: 'Hài',
      format: '3 mùa · 52 tập · ~25 phút/tập',
      pitch: 'Gia đình Đức–Thổ hợp nhất trong một mái nhà hỗn loạn, ấm áp và rất buồn cười. "Phim quốc dân" của dân học tiếng Đức — toàn thoại đời thường.',
      file: 'video/tuerkisch-fuer-anfaenger-s01e01.mp4', source: 'Phim truyền hình ARD — cần file video.' },
    { key: 'stromberg', emoji: '💼', title: 'Stromberg', level: 'B1–B2', genre: 'Hài',
      format: '5 mùa · 46 tập · ~20 phút/tập',
      pitch: 'The Office phiên bản Đức: ông sếp tệ nhất hành tinh ở hãng bảo hiểm. Hài chua cay, tiếng công sở nhanh — xem là ghiền.',
      file: 'video/stromberg-s01e01.mp4', source: 'Phim truyền hình ProSieben — cần file video.' },
    { key: 'pastewka', emoji: '😅', title: 'Pastewka', level: 'B1', genre: 'Hài',
      format: '10 mùa · tập ngắn ~25 phút',
      pitch: 'Sitcom gia đình nhẹ nhàng với Bastian Pastewka đóng chính mình. Tiếng chuẩn, rõ, nhịp vừa — hợp để "cày" hằng ngày.',
      file: 'video/pastewka-s01e01.mp4', source: 'Phim truyền hình — cần file video.' },
    { key: 'kleo', emoji: '🕵️', title: 'Kleo', level: 'B1–B2', genre: 'Giật gân',
      format: '2 mùa · 14 tập · ~45 phút/tập',
      pitch: 'Nữ điệp viên Đông Đức trả thù sau khi Bức tường Berlin sụp đổ. Nhịp nhanh, màu sắc bắt mắt, thoại rõ bất ngờ so với thể loại.',
      file: 'video/kleo-s01e01.mp4', source: 'Netflix — cần file video.' },
    { key: 'dark', emoji: '🌀', title: 'Dark', level: 'B2', genre: 'Giật gân',
      format: '3 mùa · 26 tập · ~50 phút/tập',
      pitch: 'Du hành thời gian ở thị trấn Winden — series Đức nổi tiếng nhất toàn cầu. Cốt truyện mê hoặc; thoại phức tạp nên để dành khi đã vững B2.',
      file: 'video/dark-s01e01.mp4', source: 'Netflix — cần file video.' },
    { key: 'kudamm', emoji: '💃', title: "Ku'damm 56", level: 'A2–B1', genre: 'Chính kịch',
      format: '3 phần · ~90 phút/phần',
      pitch: 'Berlin thập niên 50, trường dạy nhảy và ba chị em tìm đường tự do. Thoại chậm, rõ mà truyện vẫn cuốn — hiếm có ở cấp độ A2–B1.',
      file: 'video/kudamm-56-s01e01.mp4', source: 'ZDF — cần file video.' },
    { key: 'deutschland83', emoji: '📻', title: 'Deutschland 83', level: 'B2', genre: 'Giật gân',
      format: '3 mùa (83/86/89) · 25 tập',
      pitch: 'Lính trẻ Đông Đức sang Tây Đức làm điệp viên. Tiếng Đức chuẩn, kịch tính, lại học thêm lịch sử Chiến tranh Lạnh.',
      file: 'video/deutschland-83-s01e01.mp4', source: 'RTL/Amazon — cần file video.' },
    { key: 'kurzgesagt', emoji: '🪐', title: 'Dinge Erklärt – Kurzgesagt', level: 'B1–B2', genre: 'Khoa học',
      format: 'Video 8–15 phút · tuyển tập theo chủ đề',
      pitch: 'Kênh hoạt hình khoa học nổi tiếng nhất nước Đức: vũ trụ, cơ thể, triết học — lời dẫn thu sẵn nhịp vừa, hình ảnh cuốn từng giây. Có phụ đề chính thức.',
      file: 'video/kurzgesagt-dinge-erklaert.mp4', source: 'Kênh YouTube chính chủ của Kurzgesagt.' },
  ];
  function hueFor(key) { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
  let dlg = null;
  function dialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'kinoComingDialog';
    dlg.className = 'kino-coming-dialog';
    document.body.append(dlg);
    return dlg;
  }
  function showInfo(t) {
    const d = dialog();
    d.innerHTML = '<div class="kino-coming-info">'
      + '<div class="kino-coming-cover" style="--kc-hue:' + hueFor(t.key) + '"><span>' + t.emoji + '</span></div>'
      + '<h3>' + esc(t.title) + '</h3>'
      + '<p class="kino-coming-facts">' + esc(t.level) + ' · ' + esc(t.genre) + ' · ' + esc(t.format) + '</p>'
      + '<p>' + esc(t.pitch) + '</p>'
      + '<p class="kino-coming-facts">' + esc(t.source) + '</p>'
      + '<p>Để xem được trong Kino, chỉ còn thiếu <strong>file video</strong>. Đặt file vào thư mục của app với tên:</p>'
      + '<p><code>' + esc(t.file) + '</code></p>'
      + '<p class="kino-coming-facts">Có file là phần phụ đề Đức–Việt, chia phần và đăng ký vào catalog sẽ được làm tiếp ngay bằng công cụ nhập phim sẵn có.</p>'
      + '<div class="usc-foot"><button type="button" class="btn usc-primary" id="kinoComingClose">Đã hiểu</button></div></div>';
    d.querySelector('#kinoComingClose').onclick = () => d.close();
    d.showModal();
  }
  function render(catalog) {
    if (!catalog || document.getElementById('kinoComingSection')) return;
    const sec = document.createElement('section');
    sec.id = 'kinoComingSection';
    sec.className = 'kino-coming';
    sec.innerHTML = '<h2>Sắp có trên Kino</h2><p class="kino-catalog-sub">Các tựa đã chọn sẵn theo gu giải trí — chỉ chờ file video để hoàn thiện phụ đề và đưa vào học.</p>';
    const row = document.createElement('ul');
    row.className = 'kino-film-row kino-coming-row';
    for (const t of TITLES) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kino-coming-tile';
      b.innerHTML = '<span class="kino-coming-cover" style="--kc-hue:' + hueFor(t.key) + '"><span class="kino-coming-emoji">' + t.emoji + '</span>'
        + '<span class="kino-coming-name">' + esc(t.title) + '</span><span class="kino-coming-badge">Sắp có</span></span>'
        + '<strong>' + esc(t.title) + '</strong>'
        + '<span class="kino-film-meta">' + esc(t.genre) + ' · ' + esc(t.level) + '</span>';
      b.onclick = () => showInfo(t);
      li.append(b);
      row.append(li);
    }
    sec.append(row);
    catalog.append(sec);
  }
  window.KinoComing = { render, TITLES };
})();
