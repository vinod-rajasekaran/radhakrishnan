/* audio.js — carousel scroll + lyrics modal (same pattern as lyrics.js) */

(function () {
  /* ── Carousel scroll ──────────────────────────────────────── */
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.carousel);
      if (!track) return;
      const cardWidth = track.querySelector('.song-card')?.offsetWidth || 280;
      const step = cardWidth + 18;
      track.scrollBy({ left: btn.classList.contains('carousel-prev') ? -step : step, behavior: 'smooth' });
    });
  });

  /* ── Modal refs ───────────────────────────────────────────── */
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');
  const modalMeta    = document.getElementById('modal-meta');
  const modalTitle   = document.getElementById('modal-title');
  const modalEnTitle = document.getElementById('modal-en-title');
  const modalBody    = document.getElementById('modal-body');
  const modalLoading = document.getElementById('modal-loading');

  if (!modalOverlay) return;

  /* ── Card clicks ──────────────────────────────────────────── */
  document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  function openModal(card) {
    const id     = card.dataset.id;
    const singer = card.dataset.singer || '';
    const tamil  = card.querySelector('.song-title-tamil')?.textContent || '';
    const en     = card.querySelector('.song-title-en')?.textContent || '';
    const deity  = card.querySelector('.mini-tag')?.textContent || '';

    modalTitle.textContent   = tamil;
    modalEnTitle.textContent = en;
    modalMeta.innerHTML = `
      <span class="mini-tag">${deity}</span>
      ${singer ? `<span class="mini-tag">${singer}</span>` : ''}
    `;

    /* Audio bar */
    const existing = document.getElementById('modal-audio-bar');
    if (existing) existing.remove();
    if (singer) {
      const bar = document.createElement('div');
      bar.id = 'modal-audio-bar';
      bar.className = 'modal-audio-bar';
      const musicIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
      const audioSrc = card.dataset.audio || null;
      if (audioSrc) {
        bar.innerHTML = `
          <p class="modal-audio-label">${musicIcon} ${singer}</p>
          <div class="audio-player">
            <button class="play-btn" id="modal-play-btn" aria-label="Play">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <div class="progress-track"><div class="progress-fill" id="modal-progress-fill"></div></div>
            <audio id="modal-audio-el" src="${audioSrc}" preload="none"></audio>
          </div>`;
        bar.querySelector('#modal-play-btn').addEventListener('click', () => {
          const audio = document.getElementById('modal-audio-el');
          const btn   = document.getElementById('modal-play-btn');
          const fill  = document.getElementById('modal-progress-fill');
          if (audio.paused) {
            audio.play();
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          } else {
            audio.pause();
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
          }
          audio.addEventListener('timeupdate', () => {
            if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
          });
          audio.addEventListener('ended', () => {
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
            fill.style.width = '0%';
          });
        });
      } else {
        bar.innerHTML = `
          <p class="modal-audio-label">${musicIcon} ${singer} — audio not yet available for streaming</p>
          <div class="audio-player">
            <button class="play-btn" disabled aria-label="Play (unavailable)">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <div class="progress-track"><div class="progress-fill"></div></div>
          </div>`;
      }
      modalClose.insertAdjacentElement('afterend', bar);
    }

    modalBody.innerHTML = '';
    modalBody.appendChild(modalLoading);
    modalLoading.hidden = false;
    modalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus();

    fetch(`data/lyrics/${id}.json`)
      .then(r => r.json())
      .then(renderLyrics)
      .catch(() => {
        modalLoading.hidden = true;
        modalBody.innerHTML += '<p class="error-msg">Could not load lyrics.</p>';
      });
  }

  function renderLyrics(song) {
    modalLoading.hidden = true;
    const sections = song.sections || [];

    const taHtml = sections.map(sec => `
      <div class="lyrics-section">
        <h3 class="lyrics-section-label">${sec.label}</h3>
        <p class="lyrics-ta tamil">${sec.ta.replace(/\n/g, '<br>')}</p>
        <p class="lyrics-translit">${sec.translit.replace(/\n/g, '<br>')}</p>
      </div>
    `).join('');

    const enHtml = sections.map(sec => `
      <div class="lyrics-section-en">
        <h3 class="lyrics-section-label">${sec.label}</h3>
        <p class="lyrics-en">${sec.en.replace(/\n/g, '<br>')}</p>
      </div>
    `).join('');

    const notes = song.notes
      ? `<aside class="song-notes"><strong>Notes:</strong> ${song.notes}</aside>`
      : '';

    modalBody.innerHTML = `
      <p class="lyrics-block-label">Lyrics &amp; transliteration</p>
      ${taHtml}
      <hr class="modal-divider">
      <p class="lyrics-block-label">Translation</p>
      ${enHtml}
    ` + notes;
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal(); });
})();
