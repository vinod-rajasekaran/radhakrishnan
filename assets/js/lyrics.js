/* lyrics.js — song grid, search/filter, modal */

(function () {
  const SONGS_URL = 'data/songs.json?v=20260802y';

  let allSongs   = [];
  let allMeta    = {};
  let activeFilters = { deity: '', theme: '', volume: '' };
  let searchTerm = '';
  let audioOnly  = false;
  let fuse       = null;

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
    fuse = new Fuse(allSongs, {
      keys: [
        { name: 'en',      weight: 2 },
        { name: 'tamil',   weight: 2 },
        { name: 'excerpt', weight: 1 },
      ],
      threshold:          0.35,
      minMatchCharLength: 2,
      ignoreLocation:     true,
    });
    loading.hidden = true;
    buildThemeCarousel();
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
    if (params.get('audio') === '1') audioOnly = true;
    ['volume', 'deity', 'theme'].forEach(key => {
      const val = params.get(key);
      if (val) {
        activeFilters[key] = val;
        const opt = document.querySelector(`#menu-${key} [data-value="${val}"]`);
        if (opt) selectOption(key, val, opt.textContent.trim());
      }
    });
  }

  /* ── Non-deity categories (stored as deity in data but shown as themes) ── */
  const NON_DEITY_CATS = ['Navarasa', 'Miscellaneous', 'Nature'];

  /* ── Theme carousel ───────────────────────────────────────── */
  function buildThemeCarousel() {
    const wrap = document.getElementById('theme-carousel-wrap');
    if (!wrap) return;

    const devotionCount = allSongs.filter(s => !NON_DEITY_CATS.includes(s.deity)).length;
    const THEME_SLIDES = [
      { key: 'Devotion',      label: 'Devotion',      ta: 'பக்தி',    cssClass: 'theme-slide--devotion',
        count: devotionCount,
        verse: 'வேல் அவாவினால் மனம் கசிந்து நாவார\nவேலவா எனும்போது வினை நசியுமன்றோ',
        translit: 'vEl avAvinAl manam kasindhu nAvAra\nvElavA enumpOdhu vinai nasiyumandRO',
        verseAttr: 'When your mind melts with a deep desire to look at the spear, and the tongue utters the name Velava or Muruga, is it not true that all your past sins will disintegrate?' },
      { key: 'Nature',        label: 'Nature',         ta: 'இயற்கை',  cssClass: 'theme-slide--nature',
        count: allSongs.filter(s => s.deity === 'Nature').length,
        verse: 'எங்கிருந்தோ காற்றில் பறந்த விதையும்\nமழைத்துளியும் மண்ணும் சங்கமித்தது',
        translit: 'engirundhO kAtRil paRandha vidhaiyum\nmazhaitthuLiyum maNNum sangamitthadhu',
        verseAttr: 'A seed, carried by the wind, mingled with raindrops and soil.' },
      { key: 'Navarasa',      label: 'Navarasa',       ta: 'நவரசம்',  cssClass: 'theme-slide--navarasa',
        count: allSongs.filter(s => s.deity === 'Navarasa').length,
        verse: 'ஆலஹால விஷத்தையும் அமுதாக்கிய அன்னையே\nமூல ஓல நீலகண்டனின் இடமுறை நாயகியே',
        translit: 'AlahAla vishatthaiyum amudhAkkiya annaiyE\nmUla Ola nIlakantanin idamuRai nayakiyE',
        verseAttr: 'Oh Mother, you converted the poison, that emanated during the churning of the milky ocean, into an immortality-yielding sweet nectar just by the touch of your hand. You reside on the left side of Lord Nilakanta, the originator of the primordial sound Aum.' },
      { key: 'Miscellaneous', label: 'Miscellaneous',  ta: 'பலவகை',   cssClass: 'theme-slide--misc',
        count: allSongs.filter(s => s.deity === 'Miscellaneous').length,
        verse: 'வெண்ணிலா ஒன்று வானினின்று இறங்கி வந்தது\nமண்ணிலா என்ற கேள்வி மனதில் எழுந்தது',
        translit: 'veNNilA ondRu vAninindRu iRangi vandhadhu\nmaNNila endRa kELvi manadhil ezhundhadhu',
        verseAttr: 'A pure white moon descended from the sky. A question arose in my mind of whether this phenomenon is really happening on earth.' },
    ];

    let current        = 0;
    let selectedTheme  = '';
    let timer;
    let paused         = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
    const PLAY_ICON  = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M7 5l12 7-12 7V5z"/></svg>';

    const section = document.createElement('section');
    section.className = 'theme-carousel';
    section.setAttribute('aria-label', 'Browse songs by theme');

    THEME_SLIDES.forEach((theme, i) => {
      const slide = document.createElement('div');
      slide.className = `theme-slide ${theme.cssClass}` + (i === 0 ? ' active' : '');
      slide.style.opacity       = i === 0 ? '1' : '0';
      slide.style.pointerEvents = i === 0 ? 'auto' : 'none';
      slide.dataset.theme = theme.key;
      slide.innerHTML = `
        <div class="theme-slide-content">
          <div class="theme-slide-left">
            <span class="theme-slide-count">${theme.count} song${theme.count !== 1 ? 's' : ''}</span>
            <p class="theme-slide-name">${theme.label}</p>
            <p class="theme-slide-ta" lang="ta">${theme.ta}</p>
            <span class="theme-slide-cta">Click to browse →</span>
          </div>
          <div class="theme-slide-right">
            <p class="theme-slide-verse" lang="ta">${theme.verse.replace(/\n/g, '<br>')}</p>
            <p class="theme-slide-translit">${theme.translit.replace(/\n/g, '<br>')}</p>
            <span class="theme-slide-verse-attr">${theme.verseAttr}</span>
          </div>
        </div>
      `;
      slide.querySelector('.theme-slide-left').addEventListener('click', () => onThemeClick(theme.key, theme.label));
      section.appendChild(slide);
    });

    const prevBtn = document.createElement('button');
    prevBtn.className = 'slider-arrow arrow-prev';
    prevBtn.setAttribute('aria-label', 'Previous theme');
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slider-arrow arrow-next';
    nextBtn.setAttribute('aria-label', 'Next theme');
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

    const dotsEl = document.createElement('div');
    dotsEl.className = 'theme-slider-dots';
    THEME_SLIDES.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', t.label);
      btn.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      dotsEl.appendChild(btn);
    });

    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'slider-arrow theme-slider-pause';
    pauseBtn.setAttribute('aria-pressed', 'false');

    const controlsEl = document.createElement('div');
    controlsEl.className = 'theme-slider-controls';
    controlsEl.appendChild(pauseBtn);
    controlsEl.appendChild(dotsEl);

    section.appendChild(prevBtn);
    section.appendChild(nextBtn);
    section.appendChild(controlsEl);
    wrap.appendChild(section);

    function updateDots(idx) {
      dotsEl.querySelectorAll('.dot').forEach((b, i) => b.classList.toggle('active', i === idx));
    }

    function goTo(idx) {
      const allSlides = section.querySelectorAll('.theme-slide');
      allSlides[current].style.opacity       = '0';
      allSlides[current].style.pointerEvents = 'none';
      allSlides[current].classList.remove('active');
      current = (idx + THEME_SLIDES.length) % THEME_SLIDES.length;
      allSlides[current].style.opacity       = '1';
      allSlides[current].style.pointerEvents = 'auto';
      allSlides[current].classList.add('active');
      updateDots(current);
      resetTimer();
    }

    function setPaused(next) {
      paused = next;
      clearInterval(timer);
      if (!paused) timer = setInterval(() => goTo(current + 1), 15000);
      pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
      pauseBtn.setAttribute('aria-label', paused ? 'Play theme carousel' : 'Pause theme carousel');
      pauseBtn.setAttribute('aria-pressed', String(paused));
    }

    function resetTimer() {
      setPaused(paused);
    }
    pauseBtn.addEventListener('click', e => { e.stopPropagation(); setPaused(!paused); });

    function onThemeClick(key, label) {
      const idx = THEME_SLIDES.findIndex(t => t.key === key);
      if (idx !== -1) goTo(idx);
      if (selectedTheme === key) {
        clearCarouselSelection();
        selectOption('theme', '', 'All themes');
      } else {
        clearInterval(timer);
        selectedTheme = key;
        section.querySelectorAll('.theme-slide').forEach(s => s.classList.remove('is-selected'));
        section.querySelector(`.theme-slide[data-theme="${key}"]`).classList.add('is-selected');
        selectOption('theme', key, label);
        const carouselBottom = section.getBoundingClientRect().bottom + window.scrollY;
        window.scrollTo({ top: carouselBottom, behavior: 'smooth' });
      }
    }

    function clearCarouselSelection() {
      selectedTheme = '';
      section.querySelectorAll('.theme-slide').forEach(s => s.classList.remove('is-selected'));
    }

    prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    section.addEventListener('mouseenter', () => clearInterval(timer));
    section.addEventListener('mouseleave', resetTimer);
    resetTimer();

    wrap._clearCarouselSelection = clearCarouselSelection;
  }

  /* ── Filter menus ─────────────────────────────────────────── */
  function buildFilterMenus() {
    const devotionalDeities = allMeta.deities.filter(d => !NON_DEITY_CATS.includes(d));
    const extendedThemes    = ['Devotion', ...NON_DEITY_CATS, ...(allMeta.themes || [])].filter((v, i, a) => a.indexOf(v) === i).sort();
    buildMenu('deity',  'menu-deity',  devotionalDeities, 'All deities');
    buildMenu('theme',  'menu-theme',  extendedThemes,    'All themes');
    document.querySelectorAll('#menu-volume .filter-option').forEach(li => {
      const val = li.dataset.value;
      li.addEventListener('click', () => selectOption('volume', val, li.textContent.trim()));
    });
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

  const BASE_LABELS = { deity: 'Deity', theme: 'Theme', volume: 'Volume' };

  function disableFilter(key) {
    activeFilters[key] = '';
    document.querySelectorAll(`#menu-${key} .filter-option`).forEach(li =>
      li.setAttribute('aria-selected', li.dataset.value === '' ? 'true' : 'false')
    );
    const dd  = document.getElementById(`dd-${key}`);
    const btn = dd && dd.querySelector('.filter-dd-btn');
    if (dd)  dd.classList.add('filter-dd--disabled');
    if (btn) { btn.firstChild.textContent = BASE_LABELS[key] + ' '; btn.classList.remove('has-active'); }
  }

  function enableFilter(key) {
    const dd = document.getElementById(`dd-${key}`);
    if (dd) dd.classList.remove('filter-dd--disabled');
  }

  function selectOption(key, value, label) {
    activeFilters[key] = value;
    document.querySelectorAll(`#menu-${key} .filter-option`).forEach(li => {
      li.setAttribute('aria-selected', li.dataset.value === value ? 'true' : 'false');
    });
    const btn = document.querySelector(`#dd-${key} .filter-dd-btn`);
    if (btn) {
      btn.firstChild.textContent = value ? label : BASE_LABELS[key] + ' ';
      btn.classList.toggle('has-active', !!value);
    }
    if (key === 'deity' && value)  disableFilter('theme');
    if (key === 'deity' && !value) enableFilter('theme');
    if (key === 'theme' && value && value !== 'Devotion') disableFilter('deity');
    if (key === 'theme' && value === 'Devotion') enableFilter('deity');
    if (key === 'theme' && !value) {
      enableFilter('deity');
      const wrap = document.getElementById('theme-carousel-wrap');
      if (wrap && wrap._clearCarouselSelection) wrap._clearCarouselSelection();
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

  function clearAll() {
    Object.keys(activeFilters).forEach(k => {
      activeFilters[k] = '';
      const btn = document.querySelector(`#dd-${k} .filter-dd-btn`);
      if (btn) { btn.firstChild.textContent = BASE_LABELS[k] + ' '; btn.classList.remove('has-active'); }
      document.querySelectorAll(`#menu-${k} .filter-option`).forEach(li =>
        li.setAttribute('aria-selected', li.dataset.value === '' ? 'true' : 'false')
      );
    });
    enableFilter('deity');
    enableFilter('theme');
    const wrap = document.getElementById('theme-carousel-wrap');
    if (wrap && wrap._clearCarouselSelection) wrap._clearCarouselSelection();
    if (searchInput) searchInput.value = '';
    searchTerm = '';
    updateChips();
    render();
  }

  if (clearBtn) clearBtn.addEventListener('click', clearAll);
  if (document.getElementById('clear-search')) {
    document.getElementById('clear-search').addEventListener('click', clearAll);
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
    const base = searchTerm && fuse
      ? fuse.search(searchTerm).map(r => r.item)
      : allSongs;

    return base.filter(s => {
      if (audioOnly && !s.audio) return false;
      if (activeFilters.deity && s.deity !== activeFilters.deity) return false;
      if (activeFilters.theme) {
        if (activeFilters.theme === 'Devotion') {
          if (NON_DEITY_CATS.includes(s.deity)) return false;
        } else if (NON_DEITY_CATS.includes(activeFilters.theme)) {
          if (s.deity !== activeFilters.theme) return false;
        } else {
          if (!(s.themes || []).includes(activeFilters.theme)) return false;
        }
      }
      if (activeFilters.volume && String(s.volume) !== activeFilters.volume) return false;
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
      const card = SiteShared.buildSongCard(song);
      card.addEventListener('click',  () => openModal(song));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(song); } });
      grid.appendChild(card);
    });
  }

  /* ── Modal ────────────────────────────────────────────────── */
  function openModal(song) {
    SiteShared.updateModalDeityBanner(song.deity);
    modalTitle.textContent   = song.tamil;
    modalEnTitle.textContent = song.en;
    const isNonDeityModal = NON_DEITY_CATS.includes(song.deity);
    const modalThemes = [...new Set([...(song.themes || []), ...(isNonDeityModal ? [song.deity] : [])])];
    const modalThemeChips = modalThemes.slice(0, 2).map(t => `<span class="mini-tag theme">${t}</span>`).join('');
    const modalDeityTag   = isNonDeityModal ? '' : `<span class="mini-tag">${song.deity}</span>`;
    modalMeta.innerHTML = `
      <span class="mini-tag">Vol ${song.volume}</span>
      ${modalThemeChips}
      ${modalDeityTag}
    `;

    const existing = document.getElementById('modal-audio-bar');
    if (existing) existing.remove();
    if (song.collection) {
      const bar = SiteShared.buildAudioBar(song.singer, song.audio || null);
      modalClose.insertAdjacentElement('afterend', bar);
      SiteShared.initAudioBar(bar);
    }

    modalBody.innerHTML = '';
    modalBody.appendChild(modalLoading);
    modalLoading.hidden = false;
    if (!modalOverlay.classList.contains('open')) SiteShared.openModalHistory();
    modalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus();

    if (song.sections) {
      SiteShared.renderLyrics(song, modalBody, modalLoading);
    } else {
      fetch(`data/lyrics/${song.id}.json?v=20260802y`)
        .then(r => r.json())
        .then(full => SiteShared.renderLyrics(full, modalBody, modalLoading))
        .catch(() => {
          modalLoading.hidden = true;
          modalBody.innerHTML += '<p class="error-msg">Could not load full lyrics.</p>';
        });
    }
  }

  modalClose.addEventListener('click', () => SiteShared.closeModal(modalOverlay));
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) SiteShared.closeModal(modalOverlay); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) SiteShared.closeModal(modalOverlay); });
})();
