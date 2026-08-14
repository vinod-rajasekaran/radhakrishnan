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

  SiteShared.initCrossfadeSlider({
    slides, dotsEl, prevBtn, nextBtn, pauseBtn, container: sliderEl,
    enableFocusPause: true,
    enableArrowKeys:  true,
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

    fetch(`data/lyrics/${meta.id}.json?v=20260815b`)
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
    fetch('data/songs.json?v=20260815b')
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
