/* lyrics.js — song grid, search/filter, modal */

(function () {
  const SONGS_URL = 'data/songs.json';

  let allSongs   = [];
  let allMeta    = {};
  let activeFilters = { deity: '', theme: '', volume: '', singer: '' };
  let searchTerm = '';

  /* ── DOM refs ─────────────────────────────────────────────── */
  const grid         = document.getElementById('song-grid');
  const loading      = document.getElementById('loading-state');
  const empty        = document.getElementById('empty-state');
  const countEl      = document.getElementById('results-count');
  const chipsEl      = document.getElementById('filter-chips');
  const clearBtn     = document.getElementById('filter-clear');
  const searchInput  = document.getElementById('search-input');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');
  const modalMeta    = document.getElementById('modal-meta');
  const modalTitle   = document.getElementById('modal-title');
  const modalEnTitle = document.getElementById('modal-en-title');
  const modalBody    = document.getElementById('modal-body');
  const modalLoading = document.getElementById('modal-loading');

  /* ── Load songs ───────────────────────────────────────────── */
  function initData(data) {
    allSongs = data.songs;
    allMeta  = data.meta;
    loading.hidden = true;
    buildFilterMenus();
    applyUrlParams();
    render();
  }

  fetch(SONGS_URL)
    .then(r => r.json())
    .then(initData)
    .catch(() => {
      grid.innerHTML = '<p class="error-msg">Could not load songs. Please try reloading the page.</p>';
    });

  /* ── URL params ───────────────────────────────────────────── */
  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    ['volume', 'deity', 'theme', 'singer'].forEach(key => {
      const val = params.get(key);
      if (val) {
        activeFilters[key] = val;
        const opt = document.querySelector(`#menu-${key} [data-value="${val}"]`);
        if (opt) selectOption(key, val, opt.textContent.trim());
      }
    });
  }

  /* ── Filter menus ─────────────────────────────────────────── */
  function buildFilterMenus() {
    buildMenu('deity',  'menu-deity',  allMeta.deities, 'All deities');
    buildMenu('theme',  'menu-theme',  allMeta.themes,  'All themes');
    buildMenu('singer', 'menu-singer', allMeta.singers, 'All singers');
  }

  function buildMenu(key, menuId, values, allLabel) {
    const ul = document.getElementById(menuId);
    if (!ul) return;
    const allItem = document.createElement('li');
    allItem.className = 'filter-option';
    allItem.setAttribute('role', 'option');
    allItem.dataset.value = '';
    allItem.setAttribute('aria-selected', 'true');
    allItem.textContent = allLabel;
    allItem.addEventListener('click', () => selectOption(key, '', allLabel));
    ul.appendChild(allItem);
    (values || []).forEach(val => {
      const li = document.createElement('li');
      li.className = 'filter-option';
      li.setAttribute('role', 'option');
      li.dataset.value = val;
      li.setAttribute('aria-selected', 'false');
      li.textContent = val;
      li.addEventListener('click', () => selectOption(key, val, val));
      ul.appendChild(li);
    });
  }

  function selectOption(key, value, label) {
    activeFilters[key] = value;
    document.querySelectorAll(`#menu-${key} .filter-option`).forEach(li => {
      li.setAttribute('aria-selected', li.dataset.value === value ? 'true' : 'false');
    });
    const btn = document.querySelector(`#dd-${key} .filter-dd-btn`);
    const baseLabel = { deity: 'Deity', theme: 'Theme', volume: 'Volume', singer: 'Singer' }[key];
    if (btn) {
      btn.firstChild.textContent = value ? label : baseLabel + ' ';
      btn.classList.toggle('has-active', !!value);
    }
    closeAllDropdowns();
    updateChips();
    render();
  }

  /* ── Dropdown toggle ──────────────────────────────────────── */
  document.querySelectorAll('.filter-dd-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = btn.closest('.filter-dd');
      const wasOpen = dd.classList.contains('dd-open');
      closeAllDropdowns();
      if (!wasOpen) {
        dd.classList.add('dd-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllDropdowns(); });

  function closeAllDropdowns() {
    document.querySelectorAll('.filter-dd.dd-open').forEach(dd => {
      dd.classList.remove('dd-open');
      dd.querySelector('.filter-dd-btn').setAttribute('aria-expanded', 'false');
    });
  }

  /* ── Active chips ─────────────────────────────────────────── */
  function updateChips() {
    chipsEl.innerHTML = '';
    let hasAny = false;
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (!val) return;
      hasAny = true;
      const chip = document.createElement('button');
      chip.className = 'filter-chip--active';
      chip.innerHTML = val + ' <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7"/></svg>';
      chip.setAttribute('aria-label', `Remove filter: ${val}`);
      chip.addEventListener('click', () => selectOption(key, '', ''));
      chipsEl.appendChild(chip);
    });
    clearBtn.hidden = !hasAny;
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Object.keys(activeFilters).forEach(k => activeFilters[k] = '');
      updateChips();
      searchInput.value = '';
      searchTerm = '';
      render();
    });
  }

  if (document.getElementById('clear-search')) {
    document.getElementById('clear-search').addEventListener('click', () => {
      Object.keys(activeFilters).forEach(k => activeFilters[k] = '');
      updateChips();
      searchInput.value = '';
      searchTerm = '';
      render();
    });
  }

  /* ── Search ───────────────────────────────────────────────── */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  /* ── Filter + render ──────────────────────────────────────── */
  function filtered() {
    return allSongs.filter(s => {
      if (activeFilters.deity  && s.deity !== activeFilters.deity) return false;
      if (activeFilters.theme  && !s.themes.includes(activeFilters.theme)) return false;
      if (activeFilters.volume && String(s.volume) !== activeFilters.volume) return false;
      if (activeFilters.singer && s.singer !== activeFilters.singer) return false;
      if (searchTerm) {
        const hay = (s.en + ' ' + s.tamil + ' ' + (s.excerpt || '')).toLowerCase();
        if (!hay.includes(searchTerm)) return false;
      }
      return true;
    });
  }

  function render() {
    const songs = filtered();
    grid.innerHTML = '';
    empty.hidden = songs.length > 0;
    countEl.textContent = songs.length === allSongs.length
      ? `${allSongs.length} songs`
      : `${songs.length} of ${allSongs.length} songs`;

    songs.forEach(song => {
      const card = document.createElement('article');
      card.className = 'song-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${song.tamil} — ${song.en}`);
      card.dataset.id = song.id;

      const themeChips = (song.themes || []).slice(0, 2).map(t =>
        `<span class="mini-tag theme">${t}</span>`
      ).join('');

      card.innerHTML = `
        <div class="song-tags">
          <span class="mini-tag">${song.deity}</span>
          ${themeChips}
          ${song.singer ? `<span class="song-audio-icon" aria-label="Audio available" title="Audio — ${song.singer}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span>` : ''}
        </div>
        <p class="song-title-tamil tamil">${song.tamil}</p>
        <p class="song-title-en">${song.en}</p>
        <p class="song-excerpt">${song.excerpt ? '"' + song.excerpt + '"' : ''}</p>
        <p class="song-open-hint">Click to read →</p>
      `;

      card.addEventListener('click',  () => openModal(song));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(song); } });
      grid.appendChild(card);
    });
  }

  /* ── Modal ────────────────────────────────────────────────── */
  function openModal(song) {
    modalTitle.textContent   = song.tamil;
    modalEnTitle.textContent = song.en;
    modalMeta.innerHTML = `
      <span class="mini-tag">Vol ${song.volume}</span>
      <span class="mini-tag">${song.deity}</span>
      ${song.singer ? `<span class="mini-tag">${song.singer}</span>` : ''}
    `;
    /* Audio bar — show for songs with a singer, remove if absent */
    const existing = document.getElementById('modal-audio-bar');
    if (existing) existing.remove();
    if (song.singer) {
      const bar = document.createElement('div');
      bar.id = 'modal-audio-bar';
      bar.className = 'modal-audio-bar';
      const musicIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
      if (song.audio) {
        bar.innerHTML = `
          <p class="modal-audio-label">${musicIcon} ${song.singer}</p>
          <div class="audio-player">
            <button class="play-btn" id="modal-play-btn" aria-label="Play">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <div class="progress-track"><div class="progress-fill" id="modal-progress-fill"></div></div>
            <audio id="modal-audio-el" src="${song.audio}" preload="none"></audio>
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
          <p class="modal-audio-label">${musicIcon} ${song.singer} — audio not yet available for streaming</p>
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

    if (song.sections) {
      renderLyrics(song);
    } else {
      fetch(`data/lyrics/${song.id}.json`)
        .then(r => r.json())
        .then(full => renderLyrics(full))
        .catch(() => {
          modalLoading.hidden = true;
          modalBody.innerHTML += '<p class="error-msg">Could not load full lyrics.</p>';
        });
    }
  }

  function renderLyrics(song) {
    modalLoading.hidden = true;
    const sections = song.sections || [];

    /* Lyrics & transliteration first */
    const taHtml = sections.map(sec => `
      <div class="lyrics-section">
        <h3 class="lyrics-section-label">${sec.label}</h3>
        <p class="lyrics-ta tamil">${sec.ta.replace(/\n/g, '<br>')}</p>
        <p class="lyrics-translit">${sec.translit.replace(/\n/g, '<br>')}</p>
      </div>
    `).join('');

    /* Translation second */
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
