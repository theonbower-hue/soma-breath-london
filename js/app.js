(() => {
  const video = document.querySelector('#hero-video');
  const toggle = document.querySelector('#video-toggle');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let loaded = false;
  let manuallyPaused = false;
  const label = () => {
    const paused = video.paused;
    toggle.innerHTML = paused ? 'Play footage <span aria-hidden="true">▶</span>' : 'Pause footage <span aria-hidden="true">Ⅱ</span>';
    toggle.setAttribute('aria-label', paused ? 'Play session footage' : 'Pause session footage');
  };
  async function play() {
    if (!loaded) {
      // Every <source> carries data-src, so the browser can pick WebM over MP4.
      video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
      video.load();
      loaded = true;
    }
    try { await video.play(); } catch { label(); }
  }
  toggle.addEventListener('click', () => {
    if (video.paused) { manuallyPaused = false; play(); }
    else { manuallyPaused = true; video.pause(); }
  });
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { toggle.hidden = true; });
  if (!motion.matches && !navigator.connection?.saveData) play();
  motion.addEventListener('change', () => { if (motion.matches) video.pause(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (loaded && !motion.matches && !manuallyPaused) play();
  });
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('visible'); observer.unobserve(entry.target);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px 10px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    document.documentElement.classList.add('motion-ready');
  }
})();
