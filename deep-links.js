// VokabelGo — Deep links: mở đúng khu vực học từ URL.
//   index.html?hub=study&mode=wortregen  →  Học từ, chế độ Wortregen
//   index.html?hub=kino                  →  Nghe & xem (kết hợp ?kino=<id> sẵn có)
//   index.html?hub=games                 →  chuyển tới hub Trò chơi (games.html)
(function () {
  function applyDeepLink() {
    var params = new URLSearchParams(window.location.search);
    var hub = params.get('hub');
    var mode = params.get('mode');
    if (!hub && !mode) return;

    if (hub === 'games') {
      window.location.replace('games.html');
      return;
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      var ready = typeof window.setPrimaryHub === 'function' &&
        (!mode || typeof window.setStudySubMode === 'function');
      if (ready) {
        clearInterval(timer);
        if (hub) window.setPrimaryHub(hub);
        if (mode && hub === 'study') window.setStudySubMode(mode);
      } else if (tries > 40) {
        clearInterval(timer);
      }
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDeepLink);
  } else {
    applyDeepLink();
  }
})();
