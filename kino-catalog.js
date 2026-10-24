/* The Kino entrance contains covers and titles; lesson details open on selection. */
const KinoCatalog = (() => {
  const aliases = KINO_ALIASES;
  let catalog, detail, back, detailCount, overview;

  // Mục 3: tiến độ theo phim — đọc trạng thái chương đã lưu (completed/total câu).
  function posterFor(key) {
    return (window.UserScenes && window.UserScenes.posterFor(key)) || ('assets/kino-posters/' + key + '-1.jpg');
  }
  function movieProgress(key) {
    try {
      const movie = KINO_CHAPTER_DATA[key];
      if (!movie || !movie.storageKey) return 0;
      const raw = localStorage.getItem(movie.storageKey);
      if (!raw) return 0;
      const done = (JSON.parse(raw).completed || []).length;
      let total = movie.cueCount || 0;
      if (!total) { try { total = ((movie.cues) || (KINO_VIDEOS[key] && KINO_VIDEOS[key].defaultSegs) || []).length; } catch (e) { total = 0; } }
      if (!total) return 0;
      return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
    } catch (e) { return 0; }
  }
  function progressSpan(key) {
    const pct = movieProgress(key);
    if (!pct) return null;
    const wrap = document.createElement('span');
    wrap.className = 'kino-film-progress';
    wrap.innerHTML = pct >= 100
      ? '<span class="kino-film-progress-text">✓ Đã hoàn thành</span>'
      : `<span class="kino-film-progress-bar"><span style="width:${pct}%"></span></span><span class="kino-film-progress-text">Đã học ${pct}%</span>`;
    return wrap;
  }
  async function openMovie(key, link) {
    history.pushState({ ...history.state, kinoOpenedFromCatalog: true }, '', link.href);
    if (!await selectKinoMovie(key)) return;
    KinoChapters.enter(true);
    back.focus({ preventScroll: true });
  }

  function mount() {
    if (catalog) return;
    detail = document.querySelector('.kino-v3-root');
    catalog = document.createElement('section');
    catalog.id = 'kinoCatalog';
    catalog.className = 'kino-catalog';
    catalog.hidden = true;
    catalog.setAttribute('aria-labelledby', 'kinoCatalogTitle');
    const movieKeys = Object.keys(KINO_CHAPTER_DATA).filter(k => !KINO_CHAPTER_DATA[k].userScene);
    catalog.innerHTML = '<h1 id="kinoCatalogTitle">Kino</h1>'
      + `<p class="kino-catalog-sub">${movieKeys.length} phim · phụ đề Đức–Việt · chia phần theo mục tiêu giao tiếp</p>`
      + '<div class="kino-filter-row" role="group" aria-label="Lọc theo cấp độ"></div>'
      + '<section id="kinoShortHero" class="kino-short-hero" hidden></section>'
      + '<section class="kino-resume-row" hidden><h2>Đang học dở</h2><div class="kino-resume-list"></div></section>'
      + '<ul class="kino-film-row" aria-label="Chọn phim"></ul>';
    // Chips lọc theo cấp độ (nhãn cấp độ sẵn có của từng phim)
    const levels = [...new Set(movieKeys.map(k => KINO_CHAPTER_DATA[k].levelLabel).filter(Boolean))];
    const chipRow = catalog.querySelector('.kino-filter-row');
    const mkChip = (label, value) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kino-filter-chip' + (value === '' ? ' active' : '');
      b.textContent = label;
      b.dataset.level = value;
      b.addEventListener('click', () => {
        chipRow.querySelectorAll('.kino-filter-chip').forEach(c => c.classList.toggle('active', c === b));
        catalog.querySelectorAll('.kino-film-card').forEach(card => {
          const li = card.closest('li');
          if (li) li.style.display = (!value || card.dataset.level === value) ? '' : 'none';
        });
      });
      return b;
    };
    chipRow.append(mkChip('Tất cả', ''));
    levels.forEach(lv => chipRow.append(mkChip(lv.replace(/^Gợi ý\s*/, ''), lv)));
    for (const [key, movie] of Object.entries(KINO_CHAPTER_DATA)) {
      if (movie.userScene) continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'kino-film-card';
      link.dataset.movie = key;
      if (movie.levelLabel) link.dataset.level = movie.levelLabel;
      link.href = `?kino=${aliases[key]}`;
      const cover = document.createElement('img');
      cover.src = posterFor(key);
      cover.alt = '';
      cover.width = 960;
      cover.height = 540;
      cover.loading = 'lazy';
      cover.decoding = 'async';
      const title = document.createElement('strong');
      title.textContent = movie.catalogTitle || (key === 'peppa_supermarkt' ? 'Peppa Wutz · Im Supermarkt' : movie.title);
      link.append(cover, title);
      const meta = document.createElement('span');
      meta.className = 'kino-film-meta';
      meta.textContent = [movie.levelLabel ? movie.levelLabel.replace(/^Gợi ý\s*/, '') : '', KINO_VIDEOS[key] && KINO_VIDEOS[key].fullDurationStr].filter(Boolean).join(' · ');
      link.append(meta);
      const prog = progressSpan(key);
      if (prog) link.append(prog);
      link.addEventListener('click', async event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openMovie(key, link);
      });
      item.append(link);
      catalog.querySelector('ul').append(item);
    }
    refreshResume();
    detail.before(catalog);
    const bar = document.createElement('div');
    bar.className = 'kino-catalog-back-bar';
    bar.innerHTML = '<button type="button" id="kinoCatalogBack">← Danh sách phim</button><span id="kinoCatalogDetailCount"></span>';
    detail.prepend(bar);
    back = bar.querySelector('button');
    detailCount = bar.querySelector('span');
    const tools = document.querySelector('.kino-more-tools');
    if (tools) bar.append(tools);
    overview = document.createElement('section');
    overview.id = 'kinoMovieOverview';
    overview.className = 'kino-movie-overview';
    overview.setAttribute('aria-labelledby', 'kinoMovieTitle');
    overview.innerHTML = '<img id="kinoMovieCover" alt="" width="960" height="540"><div><p id="kinoMovieSeries"></p><h1 id="kinoMovieTitle"></h1><p id="kinoMovieSummary"></p><div id="kinoMovieWatchAction"></div></div>';
    overview.querySelector('#kinoMovieWatchAction').append(document.getElementById('kinoFullMovieBtn'));
    const vocabulary = document.createElement('button');
    vocabulary.id = 'kinoMovieVocabBtn';
    vocabulary.type = 'button';
    vocabulary.hidden = true;
    vocabulary.onclick = () => reviewCurrentVideoVocab();
    overview.querySelector('#kinoMovieWatchAction').append(vocabulary);
    bar.after(overview);
    // Mục 7: hàng gợi ý phim cùng cấp độ dưới phần tổng quan.
    const reco = document.createElement('section');
    reco.id = 'kinoRecoRow';
    reco.className = 'kino-reco-row';
    reco.hidden = true;
    reco.innerHTML = '<h2>Phim cùng cấp độ</h2><div class="kino-reco-list"></div>';
    overview.after(reco);
    back.addEventListener('click', () => {
      if (document.getElementById('diktatMode').dataset.kinoView === 'lesson') {
        if (history.state?.kinoOpenedPart) history.back();
        else KinoChapters.enter(true);
      } else if (history.state?.kinoOpenedFromCatalog) history.back();
      else show(true);
    });
  }
  function refreshResume() {
    if (!catalog) return;
    const row = catalog.querySelector('.kino-resume-row');
    const list = catalog.querySelector('.kino-resume-list');
    if (!row || !list) return;
    list.innerHTML = '';
    let any = false;
    for (const [key, movie] of Object.entries(KINO_CHAPTER_DATA)) {
      const pct = movieProgress(key);
      if (pct <= 0 || pct >= 100) continue;
      any = true;
      const a = document.createElement('a');
      a.className = 'kino-resume-card';
      a.href = `?kino=${aliases[key]}`;
      a.innerHTML = `<img src="${posterFor(key)}" alt="" width="160" height="90"><span class="kino-resume-info"><strong></strong><span class="kino-film-progress-bar"><span style="width:${pct}%"></span></span><small>Đã học ${pct}% · Học tiếp →</small></span>`;
      a.querySelector('strong').textContent = movie.catalogTitle || (key === 'peppa_supermarkt' ? 'Peppa Wutz · Im Supermarkt' : movie.title);
      a.addEventListener('click', async event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openMovie(key, a);
      });
      list.append(a);
    }
    row.hidden = !any;
  }
  // Cập nhật lại tiến độ trên thẻ phim + hàng đang học dở mỗi lần mở catalog.
  function refreshCatalogExtras() {
    if (!catalog) return;
    catalog.querySelectorAll('.kino-film-card').forEach(card => {
      const key = card.dataset.movie;
      const old = card.querySelector('.kino-film-progress');
      if (old) old.remove();
      const prog = progressSpan(key);
      if (prog) card.append(prog);
    });
    refreshResume();
  }
  function stopPlayback() {
    KinoDiscovery.pause();
    pauseKinoDubbingReplay();
    document.getElementById('kinoMainVideo').pause();
    if (kinoIsDubbing) stopKinoDubbing();
    closeKinoFullMovieModal();
    KinoMedia.releaseAll();
  }
  function show(focus = false) {
    KinoData.cancelSelection();
    mount();
    refreshCatalogExtras();
    const hero = document.getElementById('kinoShortHero');
    if (hero && window.KinoShorts) window.KinoShorts.render(hero);
    if (window.UserScenesUI) window.UserScenesUI.renderSection();
    stopPlayback();
    document.querySelector('.kino-more-tools')?.removeAttribute('open');
    detail.hidden = true;
    catalog.hidden = false;
    document.getElementById('diktatMode').dataset.kinoView = 'catalog';
    const url = new URL(location.href);
    url.searchParams.delete('kino');
    url.searchParams.delete('part');
    url.searchParams.set('hub', 'kino');
    history.replaceState({ ...history.state, kinoCatalog: true }, '', url.pathname + url.search + url.hash);
    catalog.scrollIntoView({ block: 'start' });
    if (focus) catalog.querySelector(`[data-movie="${currentKinoVideoKey}"]`)?.focus({ preventScroll: true });
  }
  function showDetail() {
    mount();
    stopPlayback();
    catalog.hidden = true;
    detail.hidden = false;
    document.getElementById('diktatMode').dataset.kinoView = 'detail';
    back.textContent = '← Danh sách phim';
    updateCount();
    KinoChapters.syncLocation();
    history.replaceState({ ...history.state, kinoCatalog: false }, '', location.href);
    detail.scrollIntoView({ block: 'start' });
  }
  function showLesson() {
    mount();
    catalog.hidden = true;
    detail.hidden = false;
    document.getElementById('diktatMode').dataset.kinoView = 'lesson';
    back.textContent = '← Các phần của phim';
    updateCount();
  }
  function updateCount() {
    if (!detailCount) return;
    const movie = KINO_CHAPTER_DATA[currentKinoVideoKey];
    detailCount.textContent = `${movie.chapters.length} phần`;
    document.getElementById('kinoMovieCover').src = posterFor(currentKinoVideoKey);
    document.getElementById('kinoMovieSeries').textContent = movie.series;
    document.getElementById('kinoMovieTitle').textContent = movie.title;
    document.getElementById('kinoMovieSummary').textContent = movie.summary
      ? `${movie.summary} ${movie.chapters.length} phần · ${KINO_VIDEOS[currentKinoVideoKey].fullDurationStr} · ${movie.levelLabel}`
      : `${movie.chapters.length} phần · Chọn một phần để học theo nhịp của bạn.`;
    document.getElementById('kinoFullMovieBtnText').textContent = `▶ Xem toàn bộ video · ${KINO_VIDEOS[currentKinoVideoKey].fullDurationStr}`;
    const vocabulary = document.getElementById('kinoMovieVocabBtn');
    vocabulary.hidden = !movie.vocabularyCount;
    vocabulary.textContent = movie.vocabularyCount ? `📇 Ôn ${movie.vocabularyCount} từ và cụm từ` : '';
    // Mục 7: nạp gợi ý cùng cấp độ cho phim đang xem.
    const reco = document.getElementById('kinoRecoRow');
    if (reco) {
      const list = reco.querySelector('.kino-reco-list');
      list.innerHTML = '';
      const others = Object.entries(KINO_CHAPTER_DATA).filter(([, m]) => !m.userScene)
        .filter(([k, m]) => k !== currentKinoVideoKey && m.levelLabel && m.levelLabel === movie.levelLabel)
        .slice(0, 3);
      others.forEach(([k, m]) => {
        const a = document.createElement('a');
        a.className = 'kino-reco-card';
        a.href = `?kino=${aliases[k]}`;
        a.innerHTML = `<img src="${posterFor(k)}" alt="" width="320" height="180"><strong></strong><small>${KINO_VIDEOS[k] ? KINO_VIDEOS[k].fullDurationStr : ''}</small>`;
        a.querySelector('strong').textContent = m.catalogTitle || (k === 'peppa_supermarkt' ? 'Peppa Wutz · Im Supermarkt' : m.title);
        a.addEventListener('click', async event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          openMovie(k, a);
        });
        list.append(a);
      });
      reco.hidden = !others.length;
    }
  }
  return { mount, show, showDetail, showLesson, stopPlayback, updateCount };
})();
