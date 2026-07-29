/* audio.js — dynamic grid + lyrics modal */

(function () {
  const NON_DEITY = ['Navarasa', 'Miscellaneous', 'Nature'];

  const COLLECTIONS = [
    {
      key:      'cd',
      label:    'The CD',
      name:     'Thenum Thinaiyum',
      subtitle: '',
      btnClass: 'btn',
    },
    {
      key:      'live',
      label:    'In performance',
      name:     'Songs from concert and recording sessions',
      subtitle: 'Performed live and recorded informally',
      btnClass: 'btn btn-peacock',
    },
  ];

  /* ── Card builder ─────────────────────────────────────────── */
  const AUDIO_ICON = `<span class="song-audio-icon" aria-label="Audio available">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg></span>`;

  function buildCard(song) {
    const isNonDeity  = NON_DEITY.includes(song.deity);
    const themes      = [...new Set([...(song.themes || []), ...(isNonDeity ? [song.deity] : [])])];
    const themeChips  = themes.slice(0, 2).map(t => `<span class="mini-tag theme">${t}</span>`).join('');
    const deityTag    = isNonDeity ? '' : `<span class="mini-tag">${song.deity}</span>`;

    const card = document.createElement('article');
    card.className = 'song-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.dataset.id    = song.id;
    card.dataset.tamil = song.tamil;
    card.dataset.deity = song.deity;
    card.innerHTML = `
      <div class="song-tags">
        ${themeChips}
        ${deityTag}
        ${AUDIO_ICON}
      </div>
      <p class="song-title-tamil tamil">${song.tamil}</p>
      <p class="song-title-en">${song.en}</p>
      <p class="song-excerpt">${song.excerpt ? '“' + song.excerpt + '…”' : ''}</p>
      <p class="song-open-hint">Click to read →</p>`;
    return card;
  }

  /* ── Section builder ──────────────────────────────────────── */
  function buildSection(col, songs) {
    const section = document.createElement('section');
    section.className = 'audio-section';
    section.setAttribute('aria-labelledby', `${col.key}-heading`);
    section.innerHTML = `
      <div class="audio-section-head">
        <div>
          <span class="audio-collection-label${col.key === 'live' ? ' live' : ''}">${col.label}</span>
          <h2 class="audio-collection-name" id="${col.key}-heading">${col.name}</h2>
          <p class="audio-collection-by">${col.subtitle}</p>
        </div>
        <a href="lyrics.html?audio=1" class="${col.btnClass}">Browse these songs →</a>
      </div>
      <div class="song-grid" role="list"></div>`;

    const grid = section.querySelector('.song-grid');
    songs.forEach(s => grid.appendChild(buildCard(s)));
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
    modalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus();

    fetch(`data/lyrics/${id}.json?v=20260729i`)
      .then(r => r.json())
      .then(song => {
        const isNonDeity  = NON_DEITY.includes(song.deity);
        const themes      = [...new Set([...(song.themes || []), ...(isNonDeity ? [song.deity] : [])])];
        const themeChips  = themes.slice(0, 2).map(t => `<span class="mini-tag theme">${t}</span>`).join('');
        const deityTag    = isNonDeity ? '' : `<span class="mini-tag">${song.deity}</span>`;
        modalMeta.innerHTML = `<span class="mini-tag">Vol ${song.volume}</span>${themeChips}${deityTag}`;

        if (song.collection) {
          const bar = SiteShared.buildAudioBar(song.singer, song.audio || null);
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

  fetch('data/songs.json?v=20260729i')
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
    });

  modalClose.addEventListener('click', () => SiteShared.closeModal(modalOverlay));
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) SiteShared.closeModal(modalOverlay); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) SiteShared.closeModal(modalOverlay); });
})();
