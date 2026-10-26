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
    spongebob_blubberunterricht: 'spongebob-blubberunterricht-aligned.js',
    pinguine_quietschsauber: 'pinguine-quietschsauber-aligned.js',
    courage_fischverfolgungsjagd: 'courage-fischverfolgungsjagd-aligned.js',
    bobo_im_bad: 'bobo-im-bad-aligned.js',
    conni_garten: 'conni-garten-aligned.js',
    schmusedecke_baer: 'schmusedecke-baer-aligned.js',
    nicos_hallo: 'nicos-hallo-aligned.js',
    goethe_im_bus: 'goethe-im-bus-aligned.js',
    we_bare_bears_mall: 'we-bare-bears-mall-aligned.js',
    frieren_s01e01: 'frieren-s01e01-aligned.js',
    sakura_s01e01: 'sakura-s01e01-aligned.js',
    druck_s07e01: 'druck_s07e01-aligned.js',
    simplicissimus_leberwurst: 'simplicissimus_leberwurst-aligned.js',
    trudes_bagger: 'trudes_bagger-aligned.js',
    erdmaennchen_spukschloss: 'erdmaennchen_spukschloss-aligned.js',
    spy_family_s01e01: 'spy_family_s01e01-aligned.js',
    demon_slayer_s01e01: 'demon_slayer_s01e01-aligned.js',
    k_on_s01e01: 'k-on-s01e01-aligned.js',
    delicious_in_dungeon_s01e01: 'delicious-in-dungeon-s01e01-aligned.js',
    frieren_s01e02: 'frieren-s01e02-aligned.js',
    sakura_s01e02: 'sakura-s01e02-aligned.js'
  };
  const requests = new Map(), loaded = new Set();
  let selection = 0;
  function load(key) {
    if (window.UserScenes && window.UserScenes.isUserKey(key)) {
      return window.UserScenes.prepare(key).then(ok => {
        if (!ok) throw new Error('Không tìm thấy video của cảnh trên thiết bị này.');
        loaded.add(key);
      });
    }
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
      case 'spongebob_blubberunterricht': return SPONGEBOB_BLUBBERUNTERRICHT_CAPTION_CUES;
      case 'pinguine_quietschsauber': return PINGUINE_QUIETSCHSAUBER_CAPTION_CUES;
      case 'courage_fischverfolgungsjagd': return COURAGE_FISCHVERFOLGUNGSJAGD_CAPTION_CUES;
      case 'bobo_im_bad': return BOBO_IM_BAD_CAPTION_CUES;
      case 'conni_garten': return CONNI_GARTEN_CAPTION_CUES;
      case 'schmusedecke_baer': return SCHMUSEDECKE_BAER_CAPTION_CUES;
      case 'nicos_hallo': return NICOS_HALLO_CAPTION_CUES;
      case 'goethe_im_bus': return GOETHE_IM_BUS_CAPTION_CUES;
      case 'we_bare_bears_mall': return WE_BARE_BEARS_MALL_CAPTION_CUES;
      case 'frieren_s01e01': return FRIEREN_S01E01_CAPTION_CUES;
      case 'sakura_s01e01': return SAKURA_S01E01_CAPTION_CUES;
      case 'k_on_s01e01': return K_ON_S01E01_CAPTION_CUES;
      case 'delicious_in_dungeon_s01e01': return DELICIOUS_IN_DUNGEON_S01E01_CAPTION_CUES;
      case 'frieren_s01e02': return FRIEREN_S01E02_CAPTION_CUES;
      case 'sakura_s01e02': return SAKURA_S01E02_CAPTION_CUES;
      default: return cues(key);
    }
  }
  function cues(key) {
    if (!loaded.has(key)) return [];
    if (window.UserScenes && window.UserScenes.isUserKey(key)) return window.UserScenes.cuesFor(key);
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
      case 'spongebob_blubberunterricht': return SPONGEBOB_BLUBBERUNTERRICHT_ALIGNED_UTTERANCES;
      case 'pinguine_quietschsauber': return PINGUINE_QUIETSCHSAUBER_ALIGNED_UTTERANCES;
      case 'courage_fischverfolgungsjagd': return COURAGE_FISCHVERFOLGUNGSJAGD_ALIGNED_UTTERANCES;
      case 'bobo_im_bad': return BOBO_IM_BAD_ALIGNED_UTTERANCES;
      case 'conni_garten': return CONNI_GARTEN_ALIGNED_UTTERANCES;
      case 'schmusedecke_baer': return SCHMUSEDECKE_BAER_ALIGNED_UTTERANCES;
      case 'nicos_hallo': return NICOS_HALLO_ALIGNED_UTTERANCES;
      case 'goethe_im_bus': return GOETHE_IM_BUS_ALIGNED_UTTERANCES;
      case 'we_bare_bears_mall': return WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES;
      case 'frieren_s01e01': return FRIEREN_S01E01_ALIGNED_UTTERANCES;
      case 'sakura_s01e01': return SAKURA_S01E01_ALIGNED_UTTERANCES;
      case 'druck_s07e01': return DRUCK_S07E01_ALIGNED_UTTERANCES;
      case 'simplicissimus_leberwurst': return SIMPLICISSIMUS_LEBERWURST_ALIGNED_UTTERANCES;
      case 'trudes_bagger': return TRUDES_BAGGER_ALIGNED_UTTERANCES;
      case 'erdmaennchen_spukschloss': return ERDMAENNCHEN_SPUKSCHLOSS_ALIGNED_UTTERANCES;
      case 'spy_family_s01e01': return SPY_FAMILY_S01E01_ALIGNED_UTTERANCES;
      case 'demon_slayer_s01e01': return DEMON_SLAYER_S01E01_ALIGNED_UTTERANCES;
      case 'k_on_s01e01': return K_ON_S01E01_ALIGNED_UTTERANCES;
      case 'delicious_in_dungeon_s01e01': return DELICIOUS_IN_DUNGEON_S01E01_ALIGNED_UTTERANCES;
      case 'frieren_s01e02': return FRIEREN_S01E02_ALIGNED_UTTERANCES;
      case 'sakura_s01e02': return SAKURA_S01E02_ALIGNED_UTTERANCES;
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
