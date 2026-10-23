/* One local Peppa scene: sentence takes, persistent on this device, one mixed timeline. */
const KinoDubbingScene = (() => {
  const SCENE = 'peppa-market-11-42_6-uvr-v1';
  const START = 11, LENGTH = 31.6, RATE = 44100;
  const ASSETS = 'assets/kino-dubbing/peppa-market/';
  let cues = [];
  const takes = new Map(), mixes = new Map();
  let invite, dialog, video, selected = 0, phase = 'idle', latest, automatic = false;
  let ctx, assetPromise, background, original, restorePromise, databasePromise;
  let generation = 0, activeSource, frame, stream, recorder, countdownTimer, tailTimer;
  let cancelCountdown, session, revision = 0, storageWarning = '', playingKind = '';
  const $ = id => document.getElementById(id);
  const time = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;
  const opened = () => Boolean(dialog?.open);
  const busy = () => ['loading', 'permission', 'countdown', 'recording', 'saving'].includes(phase);
  const tell = text => { $('kdsStatus').textContent = text; };

  function mount(panel) {
    if (dialog) return;
    cues = PEPPA_ALIGNED_UTTERANCES.filter(c => c.start >= START && c.end <= START + LENGTH)
      .map(c => ({ ...c, start: c.start - START, end: c.end - START }));
    invite = document.createElement('section');
    invite.id = 'kinoDubbingInvite';
    invite.className = 'kds-invite';
    invite.hidden = true;
    invite.innerHTML = '<div><span class="kds-eyebrow">THỬ LÀM DIỄN VIÊN LỒNG TIẾNG</span><h3>Một cảnh Peppa, giọng của bạn</h3><p>Thu từng câu rồi xem lại cảnh 32 giây có tiếng nền.</p></div><button type="button" id="kinoOpenDubbingScene">Vào phòng thu →</button>';
    panel.querySelector('.kino-v3-grid').before(invite);
    dialog = document.createElement('dialog');
    dialog.id = 'kinoDubbingScene';
    dialog.className = 'kds-dialog';
    dialog.setAttribute('aria-labelledby', 'kdsTitle');
    dialog.innerHTML = `
      <header class="kds-header"><div><p class="kds-eyebrow">PHÒNG THU NHỎ · PEPPA WUTZ</p><h2 id="kdsTitle">Cảnh siêu thị, giọng của bạn</h2><p>Thử một câu thôi cũng được. Không chấm điểm.</p></div><button type="button" id="kdsClose" aria-label="Đóng phòng thu">✕</button></header>
      <div class="kds-layout"><section class="kds-stage-column" aria-label="Xem và thu lời thoại">
        <div class="kds-stage"><video id="kdsVideo" poster="assets/kino-posters/peppa_supermarkt-1.jpg" playsinline muted preload="none" aria-label="Cảnh Peppa trong siêu thị, 32 giây"></video><span id="kdsBadge">Cảnh 32 giây</span><div id="kdsCountdown" hidden aria-live="assertive"></div></div>
        <div class="kds-transport"><button type="button" id="kdsPause" disabled aria-label="Tạm dừng cảnh">Ⅱ</button><span id="kdsClock">0:00 / 0:31</span><input id="kdsSeek" type="range" min="0" max="31.6" step="0.05" value="0" aria-label="Vị trí trong cảnh"></div>
        <div class="kds-quote"><div class="kds-cue-nav"><button type="button" id="kdsPrev" aria-label="Chọn câu trước">← Câu trước</button><p id="kdsCueLabel"></p><button type="button" id="kdsNext" aria-label="Chọn câu tiếp">Câu tiếp →</button></div><p id="kdsDe" lang="de"></p><p id="kdsVi" lang="vi"></p></div>
        <div class="kds-sentence-actions"><button type="button" id="kdsOriginal">▷ Nghe mẫu câu</button><button type="button" id="kdsRecord" class="kds-primary">● Thu câu này</button><button type="button" id="kdsOwn" disabled>▷ Nghe câu của mình</button></div>
        <p id="kdsStatus" role="status">Đang chuẩn bị cảnh…</p>
        <p class="kds-tip">Đeo tai nghe khi thu để tiếng phim không lọt vào micro. Phim sẽ chạy cùng nền; bạn nói theo nhịp nhân vật.</p>
        <div class="kds-result"><div><span class="kds-eyebrow">BẢN DIỄN CỦA BẠN</span><h3>Xem mình trong cả cảnh</h3><p id="kdsResultHint">Câu chưa thu vẫn dùng giọng gốc.</p></div><button type="button" id="kdsPreview" class="kds-primary" disabled>▶ Xem cả cảnh với giọng mình</button><button type="button" id="kdsCompare">▷ Xem cảnh gốc</button></div>
      </section><aside class="kds-lines" aria-label="Chọn câu muốn diễn"><div class="kds-lines-heading"><h3>Lời thoại của cảnh</h3><p id="kdsProgress">Chọn câu bạn muốn thử</p></div><ol id="kdsCueList"></ol><p id="kdsStorage" class="kds-storage">Bản thu lưu trên trình duyệt của thiết bị này, không tải lên máy chủ. Xóa dữ liệu trình duyệt sẽ mất bản thu.</p><p class="kds-storage">Bản thử dùng nền UVR đã tách. Một ít tiếng nhân vật hoặc hiệu ứng có thể còn sót hoặc bị mất.</p></aside></div>`;
    document.body.append(dialog);
    video = $('kdsVideo');
    for (const [i, cue] of cues.entries()) {
      const item = document.createElement('li');
      item.innerHTML = `<button type="button" class="kds-cue" data-cue="${i}"><span class="kds-cue-index">${i + 1}</span><span><span class="kds-cue-text" lang="de"></span><small></small></span></button><button type="button" class="kds-delete" data-delete="${i}" hidden aria-label="Xóa bản thu câu ${i + 1}">Xóa</button>`;
      item.querySelector('.kds-cue-text').textContent = cue.text;
      item.querySelector('.kds-cue').onclick = () => {
        select(i);
        dialog.scrollTo({ top: 0, behavior: 'smooth' });
      };
      item.querySelector('.kds-delete').onclick = () => removeTake(i);
      $('kdsCueList').append(item);
    }
    $('kinoOpenDubbingScene').onclick = open;
    $('kdsClose').onclick = close;
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('close', cancelWork);
    $('kdsRecord').onclick = () => busy() ? cancelWork('Đã hủy lượt thu. Bản thu trước vẫn được giữ.') : record();
    $('kdsOriginal').onclick = () => preview('original', selected);
    $('kdsPrev').onclick = () => select(selected - 1);
    $('kdsNext').onclick = () => select(selected + 1);
    $('kdsOwn').onclick = () => preview('personal', selected);
    $('kdsPreview').onclick = () => preview('personal');
    $('kdsCompare').onclick = () => preview('original');
    $('kdsPause').onclick = () => cancelWork('Đã dừng. Bạn có thể chọn nghe hoặc xem lại.');
    $('kdsSeek').addEventListener('input', async event => {
      const position = Number(event.target.value);
      const resume = phase === 'playing', kind = playingKind;
      cancelWork();
      video.currentTime = position;
      showPosition(position);
      if (resume) preview(kind, null, position);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && opened()) cancelWork('Đã dừng khi bạn rời màn hình.'); });
    window.addEventListener('pagehide', cancelWork);
    window.addEventListener('popstate', () => { if (opened()) close(); });
    new MutationObserver(() => {
      if (opened() && document.body.dataset.hub !== 'kino') close();
    }).observe(document.body, { attributes: true, attributeFilter: ['data-hub'] });
    refresh();
  }

  function update(data) {
    latest = data;
    if (!invite && data.key === 'peppa_supermarkt') mount($('kinoLessonPanel'));
    if (!invite) return;
    const sceneHere = data.key === 'peppa_supermarkt' && data.index === 0;
    invite.hidden = !sceneHere || data.activity !== 'speak';
    if (opened() && !sceneHere) close();
    if (!automatic && sceneHere && new URLSearchParams(location.search).get('dub') === 'peppa-market'
      && $('diktatMode').dataset.kinoView === 'lesson') {
      automatic = true;
      setTimeout(() => { $('kinoSpeakChoice').click(); open(); }, 0);
    }
  }

  function audioContext() {
    if (!ctx) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio || !window.OfflineAudioContext) throw new Error('unsupported-audio');
      ctx = new Audio();
    }
    return ctx;
  }
  async function loadAssets() {
    const context = audioContext();
    if (!assetPromise) {
      const load = async name => {
        const response = await fetch(ASSETS + name);
        if (!response.ok) throw new Error('media-load');
        return context.decodeAudioData(await response.arrayBuffer());
      };
      const picture = fetch(ASSETS + 'scene.mp4').then(response => {
        if (!response.ok) throw new Error('picture-load');
        return response.blob();
      });
      assetPromise = Promise.all([load('background.mp3'), load('original-voice.mp3'), picture])
        .then(([bg, voice, movie]) => {
          background = bg; original = voice;
          // Cache this small scene locally before playing, so buffering cannot outrun the mix.
          video.preload = 'auto';
          video.src = URL.createObjectURL(movie);
          video.load();
        })
        .catch(error => { assetPromise = null; throw error; });
    }
    await assetPromise;
  }

  function database() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('vokabelgo-kino-dubbing', 1);
      const timer = setTimeout(() => reject(new Error('storage-timeout')), 5000);
      request.onupgradeneeded = () => request.result.createObjectStore('takes', { keyPath: 'id' });
      request.onsuccess = () => { clearTimeout(timer); resolve(request.result); };
      request.onerror = () => { clearTimeout(timer); reject(request.error); };
      request.onblocked = () => { clearTimeout(timer); reject(new Error('storage-blocked')); };
    });
    return databasePromise;
  }
  async function stored(action, value) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('takes', action === 'getAll' ? 'readonly' : 'readwrite');
      const store = tx.objectStore('takes');
      const request = action === 'getAll' ? store.getAll() : store[action](value);
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = tx.onerror = () => reject(tx.error || new Error('storage-failed'));
    });
  }
  function restore() {
    if (!restorePromise) restorePromise = (async () => {
      try {
        const records = await stored('getAll');
        for (const record of records) {
          const cue = cues.find(c => record.id === `${SCENE}:${c.id}`);
          if (!cue || !(record.blob instanceof Blob) || !record.blob.size) continue;
          try {
            const buffer = await audioContext().decodeAudioData(await record.blob.arrayBuffer());
            takes.set(cue.id, { ...record, buffer, lead: Math.max(0, Math.min(Number(record.lead) || 0, buffer.duration - .01)) });
          } catch (_) { /* A damaged take never prevents the remaining scene from opening. */ }
        }
        revision++;
      } catch (_) { storageWarning = 'Chưa mở được nơi lưu. Bản thu mới chỉ giữ trong phiên này; đóng hoặc tải lại trang có thể mất.'; }
    })();
    return restorePromise;
  }

  async function open() {
    if (opened() || latest?.key !== 'peppa_supermarkt' || latest.index !== 0) return;
    KinoCatalog.stopPlayback();
    dialog.showModal();
    document.body.classList.add('kds-open');
    dialog.scrollTop = 0;
    phase = 'loading';
    refresh();
    const token = ++generation;
    tell('Đang chuẩn bị cảnh và các bản thu đã lưu…');
    try {
      audioContext().resume().catch(() => {});
      await Promise.all([loadAssets(), restore()]);
      if (token !== generation || !opened()) return;
      phase = 'idle';
      select(selected);
      tell(takes.size ? 'Các câu đã thu của bạn vẫn ở đây. Chọn câu để nghe hoặc thu lại nhé.' : 'Nghe mẫu một câu, rồi thử nói theo khi bạn sẵn sàng.');
    } catch (_) {
      if (token !== generation || !opened()) return;
      phase = 'idle';
      tell('Chưa tải được âm thanh cảnh. Bạn thử nhấn Nghe mẫu lần nữa nhé.');
    }
    refresh();
  }
  function close() {
    cancelWork();
    if (opened()) dialog.close();
    document.body.classList.remove('kds-open');
  }
  function releaseMic() {
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  function haltPlayback() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    if (activeSource) { activeSource.onended = null; try { activeSource.stop(); } catch (_) {} activeSource = null; }
    if (video) video.pause();
  }
  function cancelWork(message) {
    ++generation;
    clearTimeout(tailTimer);
    tailTimer = null;
    if (cancelCountdown) cancelCountdown();
    cancelCountdown = null;
    clearTimeout(countdownTimer);
    if (session) session.accept = false;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    recorder = null;
    releaseMic();
    haltPlayback();
    phase = 'idle';
    if (dialog) { $('kdsCountdown').hidden = true; $('kdsBadge').textContent = 'Cảnh 32 giây'; refresh(); }
    if (typeof message === 'string') tell(message);
  }

  function refresh() {
    if (!dialog) return;
    dialog.dataset.phase = phase;
    dialog.dataset.takeCount = takes.size;
    const locked = busy(), cue = cues[selected];
    $('kdsCueLabel').textContent = `Câu ${selected + 1} · ${(cue.end - cue.start).toFixed(1).replace('.', ',')} giây`;
    if (phase !== 'playing') { $('kdsDe').textContent = cue.text; $('kdsVi').textContent = cue.vi; }
    $('kdsProgress').textContent = `Đã thu ${takes.size} / ${cues.length} câu`;
    $('kdsRecord').disabled = ['loading', 'saving'].includes(phase) || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder;
    $('kdsRecord').textContent = ['permission', 'countdown', 'recording'].includes(phase) ? '■ Hủy lượt thu' : takes.has(cue.id) ? '● Thu lại câu này' : '● Thu câu này';
    $('kdsRecord').classList.toggle('is-recording', phase === 'recording');
    $('kdsOriginal').disabled = locked;
    $('kdsOwn').disabled = locked || !takes.has(cue.id);
    $('kdsPreview').disabled = locked || !takes.size;
    $('kdsCompare').disabled = locked;
    $('kdsPause').disabled = phase !== 'playing';
    $('kdsSeek').disabled = locked;
    $('kdsPrev').disabled = locked || selected === 0;
    $('kdsNext').disabled = locked || selected === cues.length - 1;
    $('kdsResultHint').textContent = takes.size === cues.length ? 'Cả cảnh đã có giọng của bạn và tiếng nền.' : 'Câu đã thu dùng giọng bạn. Câu chưa thu vẫn dùng giọng gốc.';
    $('kdsStorage').textContent = storageWarning || 'Bản thu lưu trên trình duyệt của thiết bị này, không tải lên máy chủ. Xóa dữ liệu trình duyệt sẽ mất bản thu.';
    for (const [i, c] of cues.entries()) {
      const button = dialog.querySelector(`[data-cue="${i}"]`), recorded = takes.has(c.id);
      button.disabled = locked;
      button.setAttribute('aria-current', String(i === selected));
      button.querySelector('small').textContent = recorded ? '✓ Đã thu · có thể thu lại' : 'Giọng gốc · thử khi bạn muốn';
      const remove = dialog.querySelector(`[data-delete="${i}"]`);
      remove.hidden = !recorded;
      remove.disabled = locked;
    }
  }
  function select(index) {
    if (busy() || index < 0 || index >= cues.length) return;
    cancelWork();
    selected = index;
    video.currentTime = cues[index].start;
    showPosition(cues[index].start);
    $('kdsBadge').textContent = 'Cảnh 32 giây';
    refresh();
    tell(takes.has(cues[index].id) ? 'Câu này đã có giọng của bạn. Nghe lại hoặc thu lại khi muốn nhé.' : 'Nghe mẫu câu này, rồi thử nói theo khi bạn sẵn sàng.');
  }
  function showPosition(position) {
    $('kdsClock').textContent = `${time(position)} / ${time(LENGTH)}`;
    $('kdsSeek').value = position;
    if (phase === 'playing') {
      const cue = cues.find(c => position >= c.start && position < c.end);
      $('kdsDe').textContent = cue?.text || '';
      $('kdsVi').textContent = cue?.vi || '';
    }
  }

  async function mix(kind) {
    await loadAssets();
    const cacheKey = `${kind}:${kind === 'personal' ? revision : 0}`;
    if (mixes.has(cacheKey)) return mixes.get(cacheKey);
    const offline = new OfflineAudioContext(2, Math.round(LENGTH * RATE), RATE);
    const add = (buffer, gainValue = 1) => {
      const source = offline.createBufferSource(), gain = offline.createGain();
      source.buffer = buffer; gain.gain.value = gainValue;
      source.connect(gain).connect(offline.destination);
      return { source, gain };
    };
    add(background).source.start(0);
    if (kind !== 'background') {
      const voice = add(original);
      voice.source.start(0);
      const mutedRanges = [];
      if (kind === 'personal') for (const cue of cues) {
        const take = takes.get(cue.id);
        if (!take) continue;
        const available = Math.min(cue.end - cue.start, take.buffer.duration - take.lead);
        if (available <= 0) continue;
        const last = mutedRanges.at(-1);
        if (last && cue.start <= last.end + .03) last.end = Math.max(last.end, cue.end);
        else mutedRanges.push({ start: cue.start, end: cue.end });
        let peak = 0;
        for (let ch = 0; ch < take.buffer.numberOfChannels; ch++) {
          const data = take.buffer.getChannelData(ch);
          for (const sample of data) peak = Math.max(peak, Math.abs(sample));
        }
        add(take.buffer, Math.min(2, .8 / Math.max(.01, peak))).source.start(cue.start, take.lead, available);
      }
      for (const range of mutedRanges) {
        voice.gain.gain.setValueAtTime(1, Math.max(0, range.start - .015));
        voice.gain.gain.linearRampToValueAtTime(0, range.start);
        voice.gain.gain.setValueAtTime(0, range.end);
        voice.gain.gain.linearRampToValueAtTime(1, Math.min(LENGTH, range.end + .015));
      }
    }
    const rendered = await offline.startRendering();
    let peak = 0;
    for (let ch = 0; ch < rendered.numberOfChannels; ch++) for (const sample of rendered.getChannelData(ch)) peak = Math.max(peak, Math.abs(sample));
    if (peak > .95) for (let ch = 0; ch < rendered.numberOfChannels; ch++) {
      const data = rendered.getChannelData(ch);
      for (let i = 0; i < data.length; i++) data[i] *= .95 / peak;
    }
    if (kind === 'personal') for (const key of mixes.keys()) if (key.startsWith('personal:')) mixes.delete(key);
    mixes.set(cacheKey, rendered);
    return rendered;
  }

  async function seek(position) {
    if (video.error) throw new Error('video-error');
    if (video.readyState >= 2 && Math.abs(video.currentTime - position) < .025) return;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('video-timeout')), 10000);
      function finish(error) {
        clearTimeout(timer);
        video.removeEventListener('seeked', done); video.removeEventListener('loadeddata', ready); video.removeEventListener('error', failed);
        error ? reject(error) : resolve();
      }
      const done = () => { if (video.readyState >= 2) finish(); };
      const ready = () => { if (Math.abs(video.currentTime - position) < .025) finish(); else video.currentTime = position; };
      const failed = () => finish(new Error('video-load'));
      video.addEventListener('seeked', done); video.addEventListener('loadeddata', ready); video.addEventListener('error', failed);
      video.currentTime = position;
    });
  }
  async function play(buffer, start, end, token, done) {
    await seek(start);
    if (token !== generation || !opened()) return;
    video.muted = true;
    await video.play();
    if (token !== generation || !opened()) { video.pause(); return; }
    const offset = Math.min(end - .001, Math.max(start, video.currentTime));
    const source = audioContext().createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    activeSource = source;
    const origin = ctx.currentTime - offset;
    source.onended = () => {
      if (token !== generation) return;
      activeSource = null;
      video.pause(); video.currentTime = end;
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      showPosition(end);
      done();
    };
    source.start(0, offset, end - offset);
    if (session && phase === 'recording') session.lead = Math.max(0, ctx.currentTime - session.captureAt - (offset - start));
    const tick = () => {
      if (token !== generation || !activeSource) return;
      const position = Math.min(end, ctx.currentTime - origin);
      if (video.readyState >= 2 && Math.abs(video.currentTime - position) > .12) video.currentTime = position;
      showPosition(position);
      frame = requestAnimationFrame(tick);
    };
    tick();
  }

  async function preview(kind, index = null, from = null) {
    if (busy()) return;
    cancelWork();
    const token = generation;
    phase = 'loading'; refresh(); tell('Đang chuẩn bị bản nghe…');
    try {
      await audioContext().resume();
      const buffer = await mix(kind);
      if (token !== generation || !opened()) return;
      phase = 'playing'; playingKind = kind;
      $('kdsBadge').textContent = kind === 'personal' ? 'Giọng của bạn + tiếng nền' : 'Nghe bản gốc';
      tell(kind === 'personal' ? 'Đang phát bản diễn của bạn. Câu chưa thu dùng giọng gốc.' : 'Nghe nhịp và cách nói của nhân vật.');
      refresh();
      await play(buffer, from ?? (index === null ? 0 : cues[index].start), index === null ? LENGTH : cues[index].end, token, () => {
        phase = 'idle'; refresh(); tell('Bạn có thể nghe lại hoặc chọn một câu để thu tiếp.');
      });
    } catch (_) {
      if (token === generation) { cancelWork(); tell('Chưa phát được cảnh. Bạn thử nhấn nghe lại nhé.'); }
    }
  }

  function countdown(token) {
    return new Promise(resolve => {
      let count = 3;
      $('kdsCountdown').hidden = false;
      const done = () => { clearTimeout(countdownTimer); $('kdsCountdown').hidden = true; cancelCountdown = null; resolve(); };
      cancelCountdown = done;
      const next = () => {
        if (token !== generation || count === 0) { done(); return; }
        $('kdsCountdown').textContent = String(count--);
        countdownTimer = setTimeout(next, 750);
      };
      next();
    });
  }
  async function record() {
    cancelWork();
    const token = generation, index = selected, cue = cues[index];
    phase = 'permission'; refresh(); tell('Đang mở micro. Bạn có thể hủy bất cứ lúc nào.');
    try {
      await audioContext().resume();
      const buffer = await mix('background');
      if (token !== generation || !opened()) return;
      const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (token !== generation || !opened()) { mic.getTracks().forEach(t => t.stop()); return; }
      stream = mic;
      await seek(cue.start);
      if (token !== generation || !opened()) return;
      phase = 'countdown'; refresh(); tell('Chuẩn bị… Nói khi hiện “Đang thu”.');
      await countdown(token);
      if (token !== generation || !opened()) return;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
      const capture = new MediaRecorder(mic, mimeType ? { mimeType } : undefined);
      recorder = capture;
      const takeSession = { accept: true, token, chunks: [], lead: 0, captureAt: ctx.currentTime };
      session = takeSession;
      capture.ondataavailable = event => { if (event.data.size) takeSession.chunks.push(event.data); };
      capture.onstop = () => acceptTake(takeSession, capture.mimeType, index);
      capture.onerror = () => { if (token === generation) { cancelWork(); tell('Micro bị ngắt. Bản thu trước vẫn được giữ, bạn thử lại nhé.'); } };
      phase = 'recording'; refresh();
      $('kdsBadge').textContent = '● Đang thu · đến lượt bạn';
      tell('Đang thu… Bạn nói theo cảnh nhé. Hết câu sẽ tự dừng.');
      await new Promise((resolve, reject) => {
        capture.onstart = () => { takeSession.captureAt = ctx.currentTime; resolve(); };
        capture.addEventListener('error', reject, { once: true });
        capture.start(100);
      });
      if (token !== generation || !opened()) return;
      await play(buffer, cue.start, cue.end, token, () => {
        // Keep the codec's final frame, then trim playback to the sentence window.
        tailTimer = setTimeout(() => {
          if (token !== generation || capture.state === 'inactive') return;
          capture.stop(); releaseMic(); phase = 'saving'; refresh(); tell('Đang giữ lại câu vừa thu…');
        }, 100);
      });
    } catch (error) {
      if (token !== generation) return;
      cancelWork();
      tell(error.name === 'NotAllowedError' ? 'Chưa được phép dùng micro. Bạn vẫn nghe mẫu được; cho phép micro khi muốn thu nhé.' : 'Chưa thu được câu này. Kiểm tra micro và thử lại; bản thu trước vẫn được giữ.');
    }
  }
  async function acceptTake(current, mime, index) {
    if (!current.accept || current.token !== generation || !opened()) return;
    phase = 'saving'; refresh();
    recorder = null; releaseMic();
    try {
      const blob = new Blob(current.chunks, { type: mime || current.chunks[0]?.type || 'audio/webm' });
      if (!blob.size) throw new Error('empty-take');
      const buffer = await audioContext().decodeAudioData(await blob.arrayBuffer());
      if (current.token !== generation || !opened()) return;
      if (buffer.duration <= current.lead + .1) throw new Error('short-take');
      const cue = cues[index];
      const take = { id: `${SCENE}:${cue.id}`, cueId: cue.id, blob, lead: current.lead, createdAt: Date.now() };
      takes.set(cue.id, { ...take, buffer });
      revision++;
      try { await stored('put', take); }
      catch (_) { storageWarning = 'Câu vừa thu nghe lại được, nhưng chưa lưu lâu dài. Đóng hoặc tải lại trang có thể mất câu này.'; }
      if (current.token !== generation || !opened()) return;
      session = null; phase = 'idle'; refresh();
      $('kdsBadge').textContent = '✓ Đã thu câu này';
      tell(storageWarning || `Đã lưu câu ${index + 1} trên thiết bị này. Nghe lại, thu tiếp hoặc xem cả cảnh nhé.`);
    } catch (_) {
      if (current.token === generation) { phase = 'idle'; refresh(); tell('Bản thu chưa đọc được. Bạn thử thu lại; bản thu trước vẫn được giữ.'); }
    }
  }
  async function removeTake(index) {
    if (busy()) return;
    cancelWork(); phase = 'saving'; refresh();
    const cue = cues[index];
    try {
      await stored('delete', `${SCENE}:${cue.id}`);
      takes.delete(cue.id); revision++;
      tell(`Đã xóa bản thu câu ${index + 1}. Cảnh sẽ dùng lại giọng gốc cho câu này.`);
    } catch (_) { tell('Chưa xóa được bản thu đã lưu. Bạn thử lại nhé.'); }
    phase = 'idle'; refresh();
  }
  return { mount, update, open, close };
})();
