/* Fetch only the selected movie's reviewed subtitles, once per page session. */
const KinoData = (() => {
  const files = {
    peppa_supermarkt: 'peppa-supermarkt-aligned.js',
    pizzaschwester: 'pizzaschwester-aligned.js',
    babysitter: 'babysitter-aligned.js',
    hans: 'hans-aligned.js',
    trudes_fahrstuhl: 'trudes-fahrstuhl-aligned.js',
    erdmaennchen_nudeltrick: 'erdmaennchen-nudeltrick-aligned.js',
    erdmaennchen_schmucklose: 'erdmaennchen-schmucklose-aligned.js',
    pinguine_popcorn_panik: 'pinguine-popcorn-panik-aligned.js',
    courage_diamantraub: 'courage-diamantraub-aligned.js',
    spongebob_pizza: 'spongebob-pizza-aligned.js',
    we_bare_bears_mall: 'we-bare-bears-mall-aligned.js',
    frieren_s01e01: 'frieren-s01e01-aligned.js',
    sakura_s01e01: 'sakura-s01e01-aligned.js'
  };
  const requests = new Map(), loaded = new Set();
  let selection = 0;
  function load(key) {
    if (!files[key]) return Promise.reject(new Error('Unknown Kino movie'));
    if (!requests.has(key)) {
      const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = files[key];
        script.onload = () => { loaded.add(key); resolve(); };
        script.onerror = () => {
          script.remove();
          requests.delete(key);
          reject(new Error('Chưa tải được lời thoại. Chị chọn lại phim để thử nhé.'));
        };
        document.head.append(script);
      });
      requests.set(key, promise);
    }
    return requests.get(key);
  }
  function captions(key) {
    if (!loaded.has(key)) return [];
    switch (key) {
      case 'hans': return HANS_CAPTION_CUES;
      case 'trudes_fahrstuhl': return TRUDES_FAHRSTUHL_CAPTION_CUES;
      case 'erdmaennchen_nudeltrick': return ERDMAENNCHEN_NUDELTRICK_CAPTION_CUES;
      case 'erdmaennchen_schmucklose': return ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES;
      case 'pinguine_popcorn_panik': return PINGUINE_POPCORN_PANIK_CAPTION_CUES;
      case 'courage_diamantraub': return COURAGE_DIAMANTRAUB_CAPTION_CUES;
      case 'spongebob_pizza': return SPONGEBOB_PIZZA_CAPTION_CUES;
      case 'we_bare_bears_mall': return WE_BARE_BEARS_MALL_CAPTION_CUES;
      case 'frieren_s01e01': return FRIEREN_S01E01_CAPTION_CUES;
      case 'sakura_s01e01': return SAKURA_S01E01_CAPTION_CUES;
      default: return cues(key);
    }
  }
  function cues(key) {
    if (!loaded.has(key)) return [];
    switch (key) {
      case 'peppa_supermarkt': return PEPPA_ALIGNED_UTTERANCES;
      case 'pizzaschwester': return PIZZA_ALIGNED_UTTERANCES;
      case 'babysitter': return BABYSITTER_ALIGNED_UTTERANCES;
      case 'hans': return HANS_ALIGNED_UTTERANCES;
      case 'trudes_fahrstuhl': return TRUDES_FAHRSTUHL_ALIGNED_UTTERANCES;
      case 'erdmaennchen_nudeltrick': return ERDMAENNCHEN_NUDELTRICK_ALIGNED_UTTERANCES;
      case 'erdmaennchen_schmucklose': return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES;
      case 'pinguine_popcorn_panik': return PINGUINE_POPCORN_PANIK_ALIGNED_UTTERANCES;
      case 'courage_diamantraub': return COURAGE_DIAMANTRAUB_ALIGNED_UTTERANCES;
      case 'spongebob_pizza': return SPONGEBOB_PIZZA_ALIGNED_UTTERANCES;
      case 'we_bare_bears_mall': return WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES;
      case 'frieren_s01e01': return FRIEREN_S01E01_ALIGNED_UTTERANCES;
      case 'sakura_s01e01': return SAKURA_S01E01_ALIGNED_UTTERANCES;
      default: return [];
    }
  }
  // A late response must not select a film after Back, another film, or another hub.
  function cancelSelection() {
    selection++;
    document.getElementById('kinoCatalog')?.removeAttribute('aria-busy');
    document.getElementById('kinoDataStatus')?.replaceChildren();
  }
  async function select(key) {
    const token = ++selection;
    const catalog = document.getElementById('kinoCatalog');
    let status = document.getElementById('kinoDataStatus');
    if (!status && catalog) {
      status = document.createElement('p');
      status.id = 'kinoDataStatus';
      status.setAttribute('role', 'status');
      catalog.prepend(status);
    }
    if (status) status.textContent = loaded.has(key) ? '' : 'Đang mở lời thoại…';
    catalog?.setAttribute('aria-busy', 'true');
    try {
      await load(key);
      if (token !== selection || document.body.dataset.hub !== 'kino') return false;
      switchKinoActiveVideo(key);
      KinoChapters.syncLocation();
      return true;
    } catch (error) {
      if (token === selection && status) status.textContent = error.message;
      return false;
    } finally {
      if (token === selection) {
        catalog?.removeAttribute('aria-busy');
        if (loaded.has(key)) status?.replaceChildren();
      }
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    new MutationObserver(() => { if (document.body.dataset.hub !== 'kino') cancelSelection(); })
      .observe(document.body, { attributes: true, attributeFilter: ['data-hub'] });
  });
  return { load, select, cues, captions, cancelSelection };
})();
