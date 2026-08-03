/* home.js — opacity-based slider, verse teaser */

(function () {
  /* ── Slider (opacity crossfade) ──────────────────────────────── */
  const sliderEl = document.querySelector('.slider');
  const dotsEl   = document.getElementById('slider-dots');
  const prevBtn  = document.getElementById('slider-prev');
  const nextBtn  = document.getElementById('slider-next');
  const pauseBtn = document.getElementById('slider-pause');

  if (!sliderEl) return;

  const slides = Array.from(sliderEl.querySelectorAll('.slide'));
  let current  = 0;
  let timer;
  let paused   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
  const PLAY_ICON  = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M7 5l12 7-12 7V5z"/></svg>';

  function setPaused(next) {
    paused = next;
    clearInterval(timer);
    if (!paused) timer = setInterval(() => goTo(current + 1), 15000);
    if (pauseBtn) {
      pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
      pauseBtn.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      pauseBtn.setAttribute('aria-pressed', String(paused));
    }
  }

  function buildDots() {
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(btn);
    });
  }

  function updateDots(idx) {
    dotsEl.querySelectorAll('.dot').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
      btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  function goTo(idx) {
    slides[current].style.opacity = '0';
    slides[current].style.pointerEvents = 'none';
    slides[current].classList.remove('active');

    current = (idx + slides.length) % slides.length;

    slides[current].style.opacity = '1';
    slides[current].style.pointerEvents = 'auto';
    slides[current].classList.add('active');

    updateDots(current);
    resetTimer();
  }

  function resetTimer() {
    setPaused(paused);
  }

  /* Init first slide */
  slides.forEach((s, i) => {
    s.style.opacity = i === 0 ? '1' : '0';
    s.style.pointerEvents = i === 0 ? 'auto' : 'none';
  });

  buildDots();
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  if (pauseBtn) pauseBtn.addEventListener('click', () => setPaused(!paused));
  setPaused(paused);

  sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
  sliderEl.addEventListener('mouseleave', () => resetTimer());
  sliderEl.addEventListener('focusin',   () => clearInterval(timer));
  sliderEl.addEventListener('focusout',  () => resetTimer());
  sliderEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ── Verse teaser ─────────────────────────────────────────────── */
  const enTitleEl     = document.getElementById('verse-en-title');
  const tamilTitleEl  = document.getElementById('verse-tamil-title');
  const chipsEl       = document.getElementById('verse-chips');
  const verseGrid  = document.getElementById('verse-grid');
  const notesBlock = document.getElementById('verse-notes-block');
  const anotherBtn = document.getElementById('verse-another');

  let songs = [];

  function showVerse() {
    if (!songs.length) return;
    const meta = songs[Math.floor(Math.random() * songs.length)];

    fetch(`data/lyrics/${meta.id}.json?v=20260803b`)
      .then(r => r.json())
      .then(song => {
        if (!(song.sections || []).length) return;
        enTitleEl.textContent = song.en;
        tamilTitleEl.textContent = song.tamil;
        chipsEl.innerHTML = `<span class="verse-deity-chip">${song.deity}</span>`;
        notesBlock.innerHTML = '';
        const fakeLoader = document.createElement('div');
        SiteShared.renderLyrics(song, verseGrid, fakeLoader);
      })
      .catch(() => {});
  }

  if (enTitleEl) {
    fetch('data/songs.json?v=20260803b')
      .then(r => r.json())
      .then(data => {
        songs = data.songs;
        showVerse();
      })
      .catch(() => {
        const section = document.querySelector('.verse-section');
        if (section) section.hidden = true;
      });

    if (anotherBtn) anotherBtn.addEventListener('click', showVerse);
  }
})();
