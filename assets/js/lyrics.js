/* lyrics.js — song grid, search/filter, modal */

(function () {
  const SONGS_URL = 'data/songs.json?v=20260815j';

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
    updateChips();
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
    const q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
      searchTerm = q.trim().toLowerCase();
    }
    ['volume', 'deity', 'theme'].forEach(key => {
      const val = params.get(key);
      if (val) {
        const opt = document.querySelector(`#menu-${key} [data-value="${CSS.escape(val)}"]`);
        if (opt) selectOption(key, val, opt.textContent.trim());
      }
    });
  }

  /* ── Keep the URL in sync with current filters/search (bookmarkable/shareable) ── */
  function syncUrl() {
    const params = new URLSearchParams();
    if (activeFilters.deity)  params.set('deity', activeFilters.deity);
    if (activeFilters.theme)  params.set('theme', activeFilters.theme);
    if (activeFilters.volume) params.set('volume', activeFilters.volume);
    if (audioOnly)            params.set('audio', '1');
    if (searchTerm)           params.set('q', searchTerm);
    const qs = params.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
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
        count: allSongs.filter(s => s.deity === 'Nature' || (s.themes || []).includes('Nature')).length,
        verse: 'எங்கிருந்தோ காற்றில் பறந்த விதையும்\nமழைத்துளியும் மண்ணும் சங்கமித்தது',
        translit: 'engirundhO kAtRil paRandha vidhaiyum\nmazhaitthuLiyum maNNum sangamitthadhu',
        verseAttr: 'A seed, carried by the wind, mingled with raindrops and soil.' },
      { key: 'Navarasa',      label: 'Navarasa',       ta: 'நவரசம்',  cssClass: 'theme-slide--navarasa',
        count: allSongs.filter(s => s.deity === 'Navarasa' || (s.themes || []).includes('Navarasa')).length,
        verse: 'ஆலஹால விஷத்தையும் அமுதாக்கிய அன்னையே\nமூல ஓல நீலகண்டனின் இடமுறை நாயகியே',
        translit: 'AlahAla vishatthaiyum amudhAkkiya annaiyE\nmUla Ola nIlakantanin idamuRai nayakiyE',
        verseAttr: 'Oh Mother, you converted the poison, that emanated during the churning of the milky ocean, into an immortality-yielding sweet nectar just by the touch of your hand. You reside on the left side of Lord Nilakanta, the originator of the primordial sound Aum.' },
      { key: 'Miscellaneous', label: 'Miscellaneous',  ta: 'பலவகை',   cssClass: 'theme-slide--misc',
        count: allSongs.filter(s => s.deity === 'Miscellaneous' || (s.themes || []).includes('Miscellaneous')).length,
        verse: 'வெண்ணிலா ஒன்று வானினின்று இறங்கி வந்தது\nமண்ணிலா என்ற கேள்வி மனதில் எழுந்தது',
        translit: 'veNNilA ondRu vAninindRu iRangi vandhadhu\nmaNNila endRa kELvi manadhil ezhundhadhu',
        verseAttr: 'A pure white moon descended from the sky. A question arose in my mind of whether this phenomenon is really happening on earth.' },
    ];

    let selectedTheme  = '';

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
            <p class="theme-slide-translit" lang="ta-Latn">${theme.translit.replace(/\n/g, '<br>')}</p>
            <span class="theme-slide-verse-attr">${theme.verseAttr}</span>
          </div>
        </div>
      `;
      const slideLeft = slide.querySelector('.theme-slide-left');
      slideLeft.setAttribute('tabindex', '0');
      slideLeft.setAttribute('role', 'button');
      slideLeft.setAttribute('aria-label', `Filter by ${theme.label}`);
      slideLeft.addEventListener('click', () => onThemeClick(theme.key, theme.label));
      slideLeft.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onThemeClick(theme.key, theme.label); }
      });
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

    const slider = SiteShared.initCrossfadeSlider({
      slides: Array.from(section.querySelectorAll('.theme-slide')),
      dotsEl, prevBtn, nextBtn, pauseBtn, container: section,
      pauseLabel: 'Pause theme carousel',
      playLabel:  'Play theme carousel',
      stopPropagationOnControls: true,
    });

    function onThemeClick(key, label) {
      const idx = THEME_SLIDES.findIndex(t => t.key === key);
      if (idx !== -1) slider.goTo(idx);
      if (selectedTheme === key) {
        clearCarouselSelection();
        selectOption('theme', '', 'All themes');
      } else {
        slider.stopTimer();
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
      li.setAttribute('tabindex', '-1');
      li.addEventListener('click', () => selectOption('volume', val, li.textContent.trim()));
    });
  }

  function buildMenu(key, menuId, values, allLabel) {
    const ul = document.getElementById(menuId);
    if (!ul) return;
    const allItem = document.createElement('li');
    allItem.className = 'filter-option';
    allItem.setAttribute('role', 'option');
    allItem.setAttribute('tabindex', '-1');
    allItem.dataset.value = '';
    allItem.setAttribute('aria-selected', 'true');
    allItem.textContent = allLabel;
    allItem.addEventListener('click', () => selectOption(key, '', allLabel));
    ul.appendChild(allItem);
    (values || []).forEach(val => {
      const li = document.createElement('li');
      li.className = 'filter-option';
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '-1');
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
    syncUrl();
    render();
  }

  function setAudioOnly(next) {
    audioOnly = next;
    updateChips();
    syncUrl();
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
        focusMenuOption(dd);
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

  /* ── Dropdown keyboard navigation (roving tabindex) ──────────── */
  function setRovingTabindex(options, target) {
    options.forEach(o => o.setAttribute('tabindex', o === target ? '0' : '-1'));
  }

  function focusMenuOption(dd) {
    const options = Array.from(dd.querySelectorAll('.filter-option'));
    if (!options.length) return;
    const target = options.find(o => o.getAttribute('aria-selected') === 'true') || options[0];
    setRovingTabindex(options, target);
    target.focus();
  }

  document.querySelectorAll('.filter-dd-menu').forEach(ul => {
    ul.addEventListener('keydown', e => {
      const options = Array.from(ul.querySelectorAll('.filter-option'));
      const idx = options.indexOf(document.activeElement);
      if (idx === -1) return;
      const dd = ul.closest('.filter-dd');
      const ddBtn = dd && dd.querySelector('.filter-dd-btn');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = options[(idx + 1) % options.length];
        setRovingTabindex(options, next);
        next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = options[(idx - 1 + options.length) % options.length];
        setRovingTabindex(options, prev);
        prev.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.activeElement.click();
        if (ddBtn) ddBtn.focus();
      } else if (e.key === 'Escape') {
        closeAllDropdowns();
        if (ddBtn) ddBtn.focus();
      }
    });
  });

  /* ── Active chips ─────────────────────────────────────────── */
  const CHIP_REMOVE_ICON = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7"/></svg>';

  function updateChips() {
    chipsEl.innerHTML = '';
    let hasAny = false;
    Object.entries(activeFilters).forEach(([key, val]) => {
      if (!val) return;
      hasAny = true;
      const chip = document.createElement('button');
      chip.className = 'filter-chip--active';
      chip.textContent = val + ' ';
      chip.insertAdjacentHTML('beforeend', CHIP_REMOVE_ICON);
      chip.setAttribute('aria-label', `Remove filter: ${val}`);
      chip.addEventListener('click', () => selectOption(key, '', ''));
      chipsEl.appendChild(chip);
    });
    if (audioOnly) {
      hasAny = true;
      const chip = document.createElement('button');
      chip.className = 'filter-chip--active';
      chip.textContent = 'Audio only ';
      chip.insertAdjacentHTML('beforeend', CHIP_REMOVE_ICON);
      chip.setAttribute('aria-label', 'Remove filter: Audio only');
      chip.addEventListener('click', () => setAudioOnly(false));
      chipsEl.appendChild(chip);
    }
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
    clearTimeout(searchDebounce);
    searchTerm = '';
    audioOnly = false;
    updateChips();
    syncUrl();
    render();
  }

  if (clearBtn) clearBtn.addEventListener('click', clearAll);
  if (document.getElementById('clear-search')) {
    document.getElementById('clear-search').addEventListener('click', clearAll);
  }

  /* ── Search ───────────────────────────────────────────────── */
  let searchDebounce;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        searchTerm = searchInput.value.trim().toLowerCase();
        syncUrl();
        render();
      }, 250);
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
          const inCategory = s.deity === activeFilters.theme || (s.themes || []).includes(activeFilters.theme);
          if (!inCategory) return false;
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
    modalMeta.innerHTML = SiteShared.buildModalMeta(song);

    const existing = document.getElementById('modal-audio-bar');
    if (existing) existing.remove();
    if (song.collection) {
      const bar = SiteShared.buildAudioBar(song);
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
      fetch(`data/lyrics/${song.id}.json?v=20260815j`)
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
