/* VokabelGo — "Cảnh học của bạn": kho cảnh người học tự thêm vào Kino.
   Thiết kế: workspace/VokabelGo_CanhHocCuaBan_ThietKe.md.
   - Metadata + lời thoại: localStorage 'vokabelgo_user_scenes_v1'.
   - Video + bản thu lồng tiếng: IndexedDB 'vokabelgo-user-media' (stores: videos, takes).
   - Mỗi cảnh đăng ký một "phim ảo" user_<id> vào KINO_CHAPTER_DATA / KINO_VIDEOS /
     KINO_ALIASES để dùng nguyên máy bài học Kino; KinoData/KinoMedia có nhánh riêng
     cho khóa user_ (chuẩn bị blob URL + poster). Video KHÔNG rời khỏi thiết bị. */
(function () {
  'use strict';
  const LS_KEY = 'vokabelgo_user_scenes_v1';
  const DB_NAME = 'vokabelgo-user-media';
  const MAX_TOTAL_BYTES = 300 * 1024 * 1024;   /* D5 */
  const MAX_FILE_BYTES = 200 * 1024 * 1024;    /* D5 */
  const blobUrls = new Map();
  let dbPromise = null;

  /* ---------- IndexedDB ---------- */
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = e => {
        const d = req.result;
        if (e.oldVersion < 1) { d.createObjectStore('videos'); d.createObjectStore('takes'); }
        if (e.oldVersion < 2) d.createObjectStore('audio-cache');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function idb(store, mode, run) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, mode);
      const req = run(tx.objectStore(store));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      if (req) req.onerror = () => reject(req.error);
    });
  }
  const idbGet = (store, k) => idb(store, 'readonly', s => s.get(k));
  const idbPut = (store, k, v) => idb(store, 'readwrite', s => s.put(v, k));
  const idbDel = (store, k) => idb(store, 'readwrite', s => s.delete(k));
  const idbKeys = store => idb(store, 'readonly', s => s.getAllKeys());

  /* ---------- Metadata ---------- */
  function loadMeta() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  let scenes = loadMeta();
  function saveMeta() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(scenes)); return true; }
    catch (e) { return false; }
  }
  const keyOf = id => 'user_' + id;
  const idOf = k => String(k || '').replace(/^user_/, '');
  const get = id => scenes.find(s => s.id === idOf(id)) || null;
  const getByKey = k => get(idOf(k));
  const fmtDur = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  /* ---------- Đăng ký phim ảo ---------- */
  function levelLabel(scene) {
    if (scene.source === 'asr') return scene.reviewed ? 'Phụ đề máy · Đã rà' : 'Phụ đề máy — chưa rà';
    return 'Phụ đề của bạn';
  }
  function register(scene) {
    const k = keyOf(scene.id);
    try {
      KINO_CHAPTER_DATA[k] = {
        title: scene.title, series: 'CẢNH CỦA BẠN',
        levelLabel: levelLabel(scene),
        storageKey: 'vokabelgo_kino_chapters_v1_' + k,
        cueCount: scene.cues.length,
        posterUrl: scene.poster || '',
        userScene: true, source: scene.source, reviewed: !!scene.reviewed,
        cues: scene.cues, chapters: scene.chapters
      };
      KINO_ALIASES[k] = k;
    } catch (e) { /* KINO_CHAPTER_DATA chưa sẵn sàng — lần đăng ký sau sẽ bổ sung. */ }
    try {
      KINO_VIDEOS[k] = {
        key: k, series: 'Cảnh của bạn', seriesIcon: '🎬',
        episodeTitle: scene.title, icon: '🎬', title: scene.title,
        src: blobUrls.get(k) || '', defaultSegs: scene.cues,
        fullDurationStr: fmtDur(scene.duration || 0), userScene: true
      };
    } catch (e) { /* KINO_VIDEOS chưa được định nghĩa ở thời điểm script này chạy;
                    prepare() và DOMContentLoaded sẽ đăng ký lại đầy đủ. */ }
  }
  function unregister(id) {
    const k = keyOf(id);
    try { delete KINO_CHAPTER_DATA[k]; } catch (e) { /* chưa có */ }
    try { delete KINO_VIDEOS[k]; } catch (e) { /* chưa có */ }
    try { delete KINO_ALIASES[k]; } catch (e) { /* chưa có */ }
    if (blobUrls.has(k)) { URL.revokeObjectURL(blobUrls.get(k)); blobUrls.delete(k); }
  }
  /* KinoData.load() gọi trước khi mở bài: dựng blob URL cho video của cảnh. */
  async function prepare(k) {
    const scene = getByKey(k);
    if (scene) register(scene);   /* hoàn tất đăng ký (gồm KINO_VIDEOS) trước khi mở bài */
    if (blobUrls.has(k)) {
      try { if (KINO_VIDEOS[k]) KINO_VIDEOS[k].src = blobUrls.get(k); } catch (e) { /* bỏ qua */ }
      return true;
    }
    const blob = await idbGet('videos', idOf(k));
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    blobUrls.set(k, url);
    if (typeof KINO_VIDEOS !== 'undefined' && KINO_VIDEOS[k]) KINO_VIDEOS[k].src = url;
    return true;
  }

  /* ---------- CRUD ---------- */
  function videoBytesTotal() { return scenes.reduce((a, s) => a + (s.videoBytes || 0), 0); }
  async function create(data) {
    if (data.videoBlob && data.videoBlob.size > MAX_FILE_BYTES) {
      throw new Error('Video nặng hơn 200MB — hãy cắt ngắn lại trước khi thêm.');
    }
    if (data.videoBlob && videoBytesTotal() + data.videoBlob.size > MAX_TOTAL_BYTES) {
      throw new Error('Đã dùng hết 300MB cho cảnh tự thêm. Xóa bớt cảnh cũ rồi thử lại.');
    }
    const scene = {
      id: 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
      title: data.title || 'Cảnh chưa đặt tên',
      createdAt: new Date().toISOString(),
      source: data.source || 'srt',
      reviewed: !!data.reviewed,
      hasVi: !!data.hasVi,
      duration: data.duration || 0,
      videoBytes: data.videoBlob ? data.videoBlob.size : 0,
      poster: data.poster || '',
      cues: data.cues || [],
      chapters: data.chapters || []
    };
    if (data.videoBlob) await idbPut('videos', scene.id, data.videoBlob);
    scenes.push(scene);
    if (!saveMeta()) { scenes = scenes.filter(s => s.id !== scene.id); throw new Error('Không lưu được lời thoại của cảnh (bộ nhớ trình duyệt đã đầy).'); }
    register(scene);
    return scene;
  }
  function update(id, patch) {
    const scene = get(id);
    if (!scene) return null;
    Object.assign(scene, patch);
    if (!saveMeta()) return null;
    register(scene);
    return scene;
  }
  async function remove(id) {
    id = idOf(id);
    const k = keyOf(id);
    await idbDel('videos', id);
    const takeKeys = (await idbKeys('takes')).filter(t => String(t).startsWith(k + ':'));
    for (const t of takeKeys) await idbDel('takes', t);
    try { localStorage.removeItem('vokabelgo_kino_chapters_v1_' + k); } catch (e) { /* bỏ qua */ }
    scenes = scenes.filter(s => s.id !== id);
    saveMeta();
    unregister(id);
  }

  /* ---------- Cache tiếng đã tách (16kHz mono) cho ASR ---------- */
  const cacheAudio = (fp, buffer) => idbPut('audio-cache', fp, buffer);
  const getCachedAudio = fp => idbGet('audio-cache', fp);
  const clearAudioCache = async () => { for (const k of await idbKeys('audio-cache')) await idbDel('audio-cache', k); };

  /* ---------- Bản thu lồng tiếng theo cảnh ---------- */
  const takeKey = (sceneKey, idx) => sceneKey + ':' + idx;
  const saveTake = (sceneKey, idx, blob) => idbPut('takes', takeKey(sceneKey, idx), blob);
  const loadTake = (sceneKey, idx) => idbGet('takes', takeKey(sceneKey, idx));
  const deleteTake = (sceneKey, idx) => idbDel('takes', takeKey(sceneKey, idx));
  async function takeIndexes(sceneKey) {
    const keys = await idbKeys('takes');
    return keys.filter(t => String(t).startsWith(sceneKey + ':'))
      .map(t => String(t).slice(sceneKey.length + 1)).sort();
  }

  /* ---------- Truy vấn cho các module khác ---------- */
  const isUserKey = k => typeof k === 'string' && k.startsWith('user_');
  function isUnreviewed(k) {
    const s = getByKey(k);
    return !!s && s.source === 'asr' && !s.reviewed;
  }
  function posterFor(k) {
    const s = getByKey(k);
    return (s && s.poster) || '';
  }
  function cuesFor(k) {
    const s = getByKey(k);
    return s ? s.cues : [];
  }

  /* Đăng ký ngay khi script chạy (thẻ script nằm sau các định nghĩa toàn cục)
     và nhắc lại ở DOMContentLoaded cho chắc — register() là idempotent. */
  scenes.forEach(register);
  document.addEventListener('DOMContentLoaded', () => { scenes.forEach(register); });

  window.UserScenes = {
    list: () => scenes.slice(), get, getByKey, keyOf, idOf, isUserKey, isUnreviewed,
    create, update, remove, prepare, register, posterFor, cuesFor, levelLabel,
    saveTake, loadTake, deleteTake, takeIndexes, videoBytesTotal,
    cacheAudio, getCachedAudio, clearAudioCache,
    limits: { MAX_TOTAL_BYTES, MAX_FILE_BYTES }
  };
})();
