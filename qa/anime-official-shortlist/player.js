// Load YouTube only after a playback request; retain its official player and controls.
let selected = 0, player, apiPromise, generation = 0, starting = false;
const results = {};
const playButton = document.querySelector('#play');
const renderStatus = text => document.querySelector('#status').textContent = text;
function renderResults() {
  document.querySelector('#evidence').replaceChildren(...Object.entries(results).map(([id, text]) => {
    const li = document.createElement('li');
    li.textContent = options.find(item => item.id === id).name + ': ' + text;
    return li;
  }));
}
function select(index) {
  generation++;
  selected = index;
  starting = false;
  player?.destroy();
  player = undefined;
  const item = options[index];
  document.querySelector('#title').textContent = item.name;
  document.querySelector('#detail').textContent = item.detail;
  document.querySelector('#language').textContent = item.language;
  document.querySelector('#source').href = 'https://www.youtube.com/watch?v=' + item.id;
  document.querySelectorAll('nav button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  const placeholder = document.createElement('div');
  placeholder.id = 'player';
  placeholder.className = 'player-placeholder';
  const launch = document.createElement('button');
  launch.type = 'button';
  launch.textContent = '▶ Xem ' + item.name;
  launch.onclick = startPlayback;
  placeholder.append(launch);
  document.querySelector('#player-wrap').replaceChildren(placeholder);
  playButton.disabled = false;
  renderStatus('Bấm Phát thử để tải video từ YouTube.');
}
function loadAPI() {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = resolve;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { script.remove(); apiPromise = undefined; reject(new Error('YouTube unavailable')); };
    document.head.append(script);
  });
  return apiPromise;
}
async function startPlayback() {
  if (starting) return;
  if (player) { player.playVideo(); return; }
  const version = generation;
  const item = options[selected];
  starting = true;
  playButton.disabled = true;
  renderStatus('Đang tải trình phát YouTube…');
  try {
    await loadAPI();
    if (version !== generation) return;
    player = new YT.Player('player', {
      host: 'https://www.youtube-nocookie.com',
      videoId: item.id,
      playerVars: { origin: location.origin, hl: 'de', playsinline: 1 },
      events: {
        onReady: event => {
          if (version !== generation) return;
          starting = false;
          playButton.disabled = false;
          renderStatus('Trình phát sẵn sàng. Bấm Phát thử nếu video chưa bắt đầu.');
          event.target.playVideo();
        },
        onStateChange: event => {
          if (version !== generation) return;
          if (event.data === 1) {
            results[item.id] = 'Đã phát trong trình nhúng';
            renderStatus('Đang phát trong trình nhúng');
            renderResults();
          } else if (event.data === 0) renderStatus('Video đã phát hết.');
          else if (event.data === 2) renderStatus('Đã tạm dừng.');
        },
        onError: event => {
          if (version !== generation) return;
          starting = false;
          playButton.disabled = false;
          results[item.id] = 'Lỗi trình phát ' + event.data;
          renderStatus('Video hiện không phát được. Chị có thể mở video gốc hoặc chọn video khác.');
          renderResults();
        }
      }
    });
  } catch (error) {
    if (version !== generation) return;
    starting = false;
    playButton.disabled = false;
    renderStatus('Chưa tải được YouTube. Chị bấm Phát thử để thử lại.');
  }
}
options.forEach((item, index) => {
  const button = document.createElement('button');
  const title = document.createElement('strong');
  title.textContent = item.name;
  const scope = document.createElement('small');
  scope.textContent = item.scope;
  button.append(title, scope);
  button.onclick = () => select(index);
  document.querySelector('#choices').append(button);
});
playButton.onclick = startPlayback;
document.querySelector('#pause').onclick = () => player?.pauseVideo();
select(0);
