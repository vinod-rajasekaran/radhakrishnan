/* home.js — opacity-based slider, verse teaser */

(function () {
  /* ── Slider (opacity crossfade) ──────────────────────────────── */
  const sliderEl = document.querySelector('.slider');
  const dotsEl   = document.getElementById('slider-dots');
  const prevBtn  = document.getElementById('slider-prev');
  const nextBtn  = document.getElementById('slider-next');

  if (!sliderEl) return;

  const slides = Array.from(sliderEl.querySelectorAll('.slide'));
  let current  = 0;
  let timer;

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
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5200);
  }

  /* Init first slide */
  slides.forEach((s, i) => {
    s.style.opacity = i === 0 ? '1' : '0';
    s.style.pointerEvents = i === 0 ? 'auto' : 'none';
  });

  buildDots();
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  resetTimer();

  sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
  sliderEl.addEventListener('mouseleave', resetTimer);
  sliderEl.addEventListener('focusin',   () => clearInterval(timer));
  sliderEl.addEventListener('focusout',  resetTimer);
  sliderEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ── Verse teaser ─────────────────────────────────────────────── */
  const verseCard     = document.getElementById('verse-card');
  const enTitleEl     = document.getElementById('verse-en-title');
  const chipsEl       = document.getElementById('verse-chips');
  const leftBlock     = document.getElementById('verse-left-block');
  const rightBlock    = document.getElementById('verse-right-block');
  const anotherBtn    = document.getElementById('verse-another');

  let songs = [];

  function showVerse() {
    if (!songs.length) return;
    const song = songs[Math.floor(Math.random() * songs.length)];
    const sec  = song.sections && song.sections[0];
    if (!sec) return;

    enTitleEl.textContent = song.en;
    chipsEl.innerHTML = `<span class="verse-deity-chip">${song.deity}</span>`;

    leftBlock.innerHTML = `
      <p class="verse-section-label">${sec.label || 'Pallavi'}</p>
      <p class="verse-ta tamil">${sec.ta.replace(/\n/g, '<br>')}</p>
      <p class="verse-translit">${sec.translit.replace(/\n/g, '<br>')}</p>
    `;
    rightBlock.innerHTML = `
      <p class="verse-section-label">${sec.label || 'Pallavi'}</p>
      <p class="verse-en">${sec.en.replace(/\n/g, '<br>')}</p>
    `;
  }

  if (enTitleEl) {
    fetch('data/songs.json')
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
