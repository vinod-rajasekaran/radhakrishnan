/* audio.js — carousel scroll + lyrics modal (shared pattern via SiteShared) */

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
    const tamil  = card.dataset.tamil  || card.querySelector('.song-title-tamil')?.textContent || '';
    const en     = card.querySelector('.song-title-en')?.textContent || '';
    const deity  = card.dataset.deity  || card.querySelector('.mini-tag')?.textContent || '';

    SiteShared.updateModalDeityBanner(deity);
    modalTitle.textContent   = tamil;
    modalEnTitle.textContent = en;
    modalMeta.innerHTML = `
      <span class="mini-tag">${deity}</span>
      ${singer ? `<span class="mini-tag">${singer}</span>` : ''}
    `;

    const existing = document.getElementById('modal-audio-bar');
    if (existing) existing.remove();
    if (singer) {
      const bar = SiteShared.buildAudioBar(singer, card.dataset.audio || null);
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
      .then(song => SiteShared.renderLyrics(song, modalBody, modalLoading))
      .catch(() => {
        modalLoading.hidden = true;
        modalBody.innerHTML += '<p class="error-msg">Could not load lyrics.</p>';
      });
  }

  modalClose.addEventListener('click', () => SiteShared.closeModal(modalOverlay));
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) SiteShared.closeModal(modalOverlay); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) SiteShared.closeModal(modalOverlay); });
})();
