/* Muted welcome motion, paused when offscreen and respectful of motion preferences. */
(() => {
  const video = document.getElementById('mayHomeVideo');
  const toggle = document.getElementById('mayHomeMotionToggle');
  if (!video || !toggle) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let wantsMotion = !reducedMotion.matches;
  let inView = false;
  video.muted = true;
  const updateLabel = () => {
    toggle.textContent = video.paused ? 'Phát chuyển động' : 'Dừng chuyển động';
  };
  const syncPlayback = () => {
    if (wantsMotion && inView && !document.hidden) {
      video.play().catch(updateLabel);
    } else {
      video.pause();
    }
  };
  video.addEventListener('play', updateLabel);
  video.addEventListener('pause', updateLabel);
  video.addEventListener('error', () => {
    wantsMotion = false;
    toggle.hidden = true;
    video.load();
  }, { once: true });
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    wantsMotion = video.paused;
    syncPlayback();
  });
  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncPlayback();
  }, { threshold: 0.15 });
  observer.observe(video);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', event => {
    wantsMotion = !event.matches;
    syncPlayback();
  });
})();
