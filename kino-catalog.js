/* The Kino entrance contains covers and titles; lesson details open on selection. */
const KinoCatalog = (() => {
  const aliases = KINO_ALIASES;
  let catalog, detail, back, detailCount, overview;

  function mount() {
    if (catalog) return;
    detail = document.querySelector('.kino-v3-root');
    catalog = document.createElement('section');
    catalog.id = 'kinoCatalog';
    catalog.className = 'kino-catalog';
    catalog.hidden = true;
    catalog.setAttribute('aria-labelledby', 'kinoCatalogTitle');
    catalog.innerHTML = '<h1 id="kinoCatalogTitle">Kino</h1><ul class="kino-film-row" aria-label="Chọn phim"></ul>';
    for (const [key, movie] of Object.entries(KINO_CHAPTER_DATA)) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'kino-film-card';
      link.dataset.movie = key;
      link.href = `?kino=${aliases[key]}`;
      const cover = document.createElement('img');
      cover.src = `assets/kino-posters/${key}-1.jpg`;
      cover.alt = '';
      cover.width = 960;
      cover.height = 540;
      cover.loading = 'lazy';
      cover.decoding = 'async';
      const title = document.createElement('strong');
      title.textContent = movie.catalogTitle || (key === 'peppa_supermarkt' ? 'Peppa Wutz · Im Supermarkt' : movie.title);
      link.append(cover, title);
      link.addEventListener('click', async event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        history.pushState({ ...history.state, kinoOpenedFromCatalog: true }, '', link.href);
        if (!await selectKinoMovie(key)) return;
        KinoChapters.enter(true);
        back.focus({ preventScroll: true });
      });
      item.append(link);
      catalog.querySelector('ul').append(item);
    }
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
    back.addEventListener('click', () => {
      if (document.getElementById('diktatMode').dataset.kinoView === 'lesson') {
        if (history.state?.kinoOpenedPart) history.back();
        else KinoChapters.enter(true);
      } else if (history.state?.kinoOpenedFromCatalog) history.back();
      else show(true);
    });
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
    document.getElementById('kinoMovieCover').src = `assets/kino-posters/${currentKinoVideoKey}-1.jpg`;
    document.getElementById('kinoMovieSeries').textContent = movie.series;
    document.getElementById('kinoMovieTitle').textContent = movie.title;
    document.getElementById('kinoMovieSummary').textContent = movie.summary
      ? `${movie.summary} ${movie.chapters.length} phần · ${KINO_VIDEOS[currentKinoVideoKey].fullDurationStr} · ${movie.levelLabel}`
      : `${movie.chapters.length} phần · Chọn một phần để học theo nhịp của bạn.`;
    document.getElementById('kinoFullMovieBtnText').textContent = `▶ Xem toàn bộ video · ${KINO_VIDEOS[currentKinoVideoKey].fullDurationStr}`;
    const vocabulary = document.getElementById('kinoMovieVocabBtn');
    vocabulary.hidden = !movie.vocabularyCount;
    vocabulary.textContent = movie.vocabularyCount ? `📇 Ôn ${movie.vocabularyCount} từ và cụm từ` : '';
  }
  return { mount, show, showDetail, showLesson, stopPlayback, updateCount };
})();
