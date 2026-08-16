/* audio.js — dynamic grid + lyrics modal */

(function () {
  const COLLECTIONS = [
    {
      key:      'cd',
      label:    'The CD',
      name:     'Thenum Thinaiyum ',
      subtitle: 'Music composed and rendered by Smt. Asha Ramesh',
      btnClass: 'btn',
    },
    {
      key:      'dance',
      label:    'Dance pieces',
      name:     'Bharatanatyam recitals ',
      subtitle: 'Music composed and rendered by Smt. Asha Ramesh',
      btnClass: 'btn btn-magenta',
    },
    {
      key:      'live',
      label:    'Recordings',
      name:     'Songs from recording sessions',
      subtitle: 'Music composed and rendered by Bhavadhaarini Anantharaman',
      btnClass: 'btn btn-peacock',
    },
  ];

  /* ── Section builder ──────────────────────────────────────── */
  function buildSection(col, songs) {
    const section = document.createElement('section');
    section.className = 'audio-section';
    section.setAttribute('aria-labelledby', `${col.key}-heading`);
    section.innerHTML = `
      <div class="audio-section-head">
        <div>
          <span class="audio-collection-label${col.key !== 'cd' ? ' ' + col.key : ''}">${col.label}</span>
          <h2 class="audio-collection-name" id="${col.key}-heading">${col.name}</h2>
          <p class="audio-collection-by">${col.subtitle}</p>
        </div>
      </div>
      <div class="song-grid" role="group"></div>`;

    const grid = section.querySelector('.song-grid');
    songs.forEach(s => grid.appendChild(SiteShared.buildSongCard(s)));
    return section;
  }

  /* ── Modal refs ───────────────────────────────────────────── */
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');
  const modalMeta    = document.getElementById('modal-meta');
  const modalTitle   = document.getElementById('modal-title');
  const modalEnTitle = document.getElementById('modal-en-title');
  const modalBody    = document.getElementById('modal-body');
  const modalLoading = document.getElementById('modal-loading');

  /* ── Modal open ───────────────────────────────────────────── */
  function openModal(card) {
    const id    = card.dataset.id;
    const tamil = card.dataset.tamil || card.querySelector('.song-title-tamil')?.textContent || '';
    const en    = card.querySelector('.song-title-en')?.textContent || '';
    const deity = card.dataset.deity || '';

    SiteShared.updateModalDeityBanner(deity);
    modalTitle.textContent   = tamil;
    modalEnTitle.textContent = en;
    modalMeta.innerHTML = '';

    const existing = document.getElementById('modal-audio-bar');
    if (existing) existing.remove();

    modalBody.innerHTML = '';
    modalBody.appendChild(modalLoading);
    modalLoading.hidden = false;
    if (!modalOverlay.classList.contains('open')) SiteShared.openModalHistory();
    modalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus();

    fetch(`data/lyrics/${id}.json?v=20260816a`)
      .then(r => r.json())
      .then(song => {
        modalMeta.innerHTML = SiteShared.buildModalMeta(song);

        if (song.collection) {
          const bar = SiteShared.buildAudioBar(song);
          modalClose.insertAdjacentElement('afterend', bar);
          SiteShared.initAudioBar(bar);
        }
        SiteShared.renderLyrics(song, modalBody, modalLoading);
      })
      .catch(() => {
        modalLoading.hidden = true;
        modalBody.innerHTML += '<p class="error-msg">Could not load lyrics.</p>';
      });
  }

  /* ── Wire card clicks ─────────────────────────────────────── */
  function wireCards(container) {
    container.querySelectorAll('.song-card').forEach(card => {
      card.addEventListener('click', () => openModal(card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
      });
    });
  }

  /* ── Bootstrap ────────────────────────────────────────────── */
  if (!modalOverlay) return;

  const container = document.getElementById('audio-sections');
  if (!container) return;

  fetch('data/songs.json?v=20260816a')
    .then(r => r.json())
    .then(data => {
      const audioSongs = data.songs.filter(s => s.collection);
      COLLECTIONS.forEach(col => {
        const songs = audioSongs.filter(s => s.collection === col.key);
        if (!songs.length) return;
        const section = buildSection(col, songs);
        container.appendChild(section);
      });
      wireCards(container);
    })
    .catch(() => {
      container.innerHTML = '<p class="error-msg">Could not load songs. Please try reloading the page.</p>';
    });

  modalClose.addEventListener('click', () => SiteShared.closeModal(modalOverlay));
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) SiteShared.closeModal(modalOverlay); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) SiteShared.closeModal(modalOverlay); });
})();
