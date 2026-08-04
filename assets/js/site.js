/* site.js — shared nav, footer, modal, and utilities */

const DEITY_META = {
  'Muruga':        { image: 'assets/images/thumbs/Muruga.jpg',     ta: 'முருகா' },
  'Ganesha':       { image: 'assets/images/thumbs/Ganesha.jpg',    ta: 'கணேசா' },
  'Shiva':         { image: 'assets/images/thumbs/Shiva.jpg',      ta: 'சிவா' },
  'Vishnu':        { image: 'assets/images/thumbs/Vishnu.jpg',     ta: 'விஷ்ணு' },
  'Lakshmi':       { image: 'assets/images/thumbs/Lakshmi.jpg',    ta: 'லக்ஷ்மி' },
  'Saraswathi':    { image: 'assets/images/thumbs/Saraswathi.jpg', ta: 'சரஸ்வதி' },
  'Parvathi':      { image: 'assets/images/thumbs/Parvathi.jpg',   ta: 'பார்வதி' },
  'Aiyappan':      { image: 'assets/images/thumbs/Aiyappan.jpg',   ta: 'ஐயப்பன்' },
  'Anchaneya':     { image: 'assets/images/thumbs/Anchaneya.jpg',  ta: 'ஆஞ்சநேயா' },
  'Nature':        { image: 'assets/images/thumbs/Nature.jpg',     ta: 'இயற்கை' },
  'Navarasa':      { image: null,                                   ta: 'நவரசம்' },
  'Miscellaneous': { image: null,                                   ta: 'பலவகை' },
};

const NAV_ITEMS = [
  { key: 'home',             label: 'Home',             href: 'index.html' },
  { key: 'about',            label: 'About',            href: 'about.html' },
  { key: 'lyrics',          label: 'Lyrics',            href: 'lyrics.html' },
  { key: 'books',            label: 'Books',            href: 'books.html' },
  { key: 'audio',            label: 'Audio',            href: 'audio.html' },
  { key: 'acknowledgments', label: 'Acknowledgments', href: 'acknowledgments.html' },
  { key: 'glossary',         label: 'Glossary',         href: 'glossary.html' },
  { key: 'contact',          label: 'Contact',          href: 'contact.html' },
];

const BRAND_SVG = `<svg class="nav-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
  <path d="M12 3c-2 3-2 5 0 7 2-2 2-4 0-7Z"/>
  <path d="M6 21c0-6 2.5-10 6-10s6 4 6 10"/>
  <path d="M4 21h16"/>
</svg>`;

const CC_SVG = `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
  <circle cx="16" cy="16" r="14.5"/>
  <text x="16" y="21" font-size="13" text-anchor="middle" fill="currentColor" stroke="none" font-family="IBM Plex Mono, monospace">cc</text>
</svg>`;

const LICENSE_TEXT = `These songs are shared under a Creative Commons Attribution-NonCommercial license.
      Share, quote, or perform them freely with credit to Dr. R. Radhakrishnan —
      just not for commercial use without asking first.`;

function buildNavLinks(currentPage) {
  return NAV_ITEMS.map(item => {
    const active = item.key === currentPage;
    return `<li><a href="${item.href}"${active ? ' class="active" aria-current="page"' : ''}>${item.label}</a></li>`;
  }).join('');
}

function buildMobileMenu(currentPage) {
  return NAV_ITEMS.map(item =>
    `<a href="${item.href}"${item.key === currentPage ? ' class="active"' : ''}>${item.label}</a>`
  ).join('');
}

function injectNav() {
  const el = document.getElementById('site-header');
  if (!el) return;
  const page = document.body.dataset.page || '';

  el.outerHTML = `<header>
  <nav class="site-nav" aria-label="Main navigation">
    <a href="index.html" class="nav-brand" aria-label="Radhakrishnan's Anthology — home">
      ${BRAND_SVG}
      Radhakrishnan's Anthology
    </a>
    <ul class="nav-links" role="list">${buildNavLinks(page)}</ul>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="nav-mobile-menu" id="nav-mobile" role="navigation" aria-label="Mobile navigation">
    ${buildMobileMenu(page)}
  </div>
</header>`;

  initNavBehavior();
}

function initNavBehavior() {
  document.querySelectorAll('.nav-dd-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const li = btn.closest('.nav-dd');
      const wasOpen = li.classList.contains('dd-open');
      closeAllNavDropdowns();
      if (!wasOpen) {
        li.classList.add('dd-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', closeAllNavDropdowns);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllNavDropdowns();
  });

  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }
}

function closeAllNavDropdowns() {
  document.querySelectorAll('.nav-dd.dd-open').forEach(el => {
    el.classList.remove('dd-open');
    el.querySelector('.nav-dd-btn').setAttribute('aria-expanded', 'false');
  });
}

function injectFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  const footerLinks = NAV_ITEMS.map(item => `<a href="${item.href}">${item.label}</a>`).join('\n    ');
  el.outerHTML = `<footer class="site-footer">
  <nav class="footer-links" aria-label="Footer navigation">
    ${footerLinks}
  </nav>
  <div class="footer-lower">
    <a href="https://creativecommons.org/licenses/by-nc/4.0/" class="cc-badge" target="_blank" rel="noopener noreferrer">
      ${CC_SVG} CC BY-NC 4.0
    </a>
    <p class="footer-license-text">${LICENSE_TEXT}</p>
  </div>
  <div class="footer-copy">© 2026 Dr. R. Radhakrishnan</div>
</footer>`;
}

function injectModal() {
  if (document.getElementById('modal-overlay')) return;
  const tpl = document.createElement('div');
  tpl.innerHTML = `<div class="modal-overlay" id="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal" id="modal">
      <div class="modal-print-header">
        ${BRAND_SVG} Radhakrishnan's Anthology
      </div>
      <button class="modal-close" id="modal-close" aria-label="Close song">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="modal-deity-banner" id="modal-deity-banner" hidden>
        <img class="modal-deity-banner-img" id="modal-deity-banner-img" src="" alt="">
        <div class="modal-deity-overlay"></div>
        <div class="modal-deity-text">
          <span class="modal-deity-eyebrow">Deity</span>
          <p class="modal-deity-name" id="modal-deity-name"></p>
          <p class="modal-deity-ta-text" id="modal-deity-ta" lang="ta"></p>
        </div>
      </div>
      <div class="modal-header">
        <div class="modal-meta-row">
          <div class="modal-meta" id="modal-meta"></div>
          <button class="modal-print-btn" id="modal-print-btn" aria-label="Print song">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
          </button>
        </div>
        <h2 class="modal-title" id="modal-title" lang="ta"></h2>
        <p class="modal-en-title" id="modal-en-title"></p>
      </div>
      <div class="modal-body" id="modal-body">
        <div class="modal-loading" id="modal-loading" aria-live="polite">
          <span class="loading-spinner" aria-hidden="true"></span> Loading…
        </div>
      </div>
      <div class="modal-print-footer">
        <p class="modal-print-cc">${CC_SVG} CC BY-NC 4.0</p>
        <p class="modal-print-license">${LICENSE_TEXT}</p>
      </div>
    </div>
  </div>`;
  document.body.appendChild(tpl.firstElementChild);
  document.getElementById('modal-print-btn').addEventListener('click', () => {
    const enTitle = document.getElementById('modal-en-title').textContent.trim();
    const prev = document.title;
    if (enTitle) document.title = enTitle;
    window.print();
    document.title = prev;
  });
}

/* ── Shared song card (used by lyrics.js and audio.js) ── */

const CARD_NON_DEITY = ['Navarasa', 'Miscellaneous', 'Nature'];
const CARD_AUDIO_ICON = `<span class="song-audio-icon" aria-label="Audio available">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg></span>`;

function buildSongCard(song) {
  const isNonDeity = CARD_NON_DEITY.includes(song.deity);
  const themes     = [...new Set([...(song.themes || []), ...(isNonDeity ? [song.deity] : [])])];
  const themeChips = themes.slice(0, 2).map(t => `<span class="mini-tag theme">${t}</span>`).join('');
  const deityTag   = isNonDeity ? '' : `<span class="mini-tag">${song.deity}</span>`;

  const card = document.createElement('article');
  card.className = 'song-card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${song.tamil} — ${song.en}`);
  card.dataset.id    = song.id;
  card.dataset.tamil = song.tamil;
  card.dataset.deity = song.deity;
  card.innerHTML = `
    <div class="song-tags">
      ${themeChips}
      ${deityTag}
      ${song.audio ? CARD_AUDIO_ICON : ''}
    </div>
    <p class="song-title-tamil tamil" lang="ta">${song.tamil}</p>
    <p class="song-title-en">${song.en}</p>
    <p class="song-excerpt">${song.excerpt ? '“' + song.excerpt + '…”' : ''}</p>
    <p class="song-open-hint">Click to read →</p>`;
  return card;
}

/* ── Shared modal utilities (used by lyrics.js and audio.js) ── */

const NOTES_LIMIT = 500;

function safeTruncate(text, limit) {
  let cut = text.slice(0, limit);
  const lastOpen  = cut.lastIndexOf('<');
  const lastClose = cut.lastIndexOf('>');
  if (lastOpen > lastClose) cut = cut.slice(0, lastOpen);
  return cut.trimEnd();
}

function renderNotes(text) {
  if (!text) return '';
  if (text.length <= NOTES_LIMIT) {
    return `<aside class="song-notes"><strong>Author's Notes:</strong> ${text.replace(/\n/g, '<br>')}</aside>`;
  }
  const preview = safeTruncate(text, NOTES_LIMIT).replace(/\n/g, '<br>');
  const full    = text.replace(/\n/g, '<br>');
  return `<aside class="song-notes"><strong>Author's Notes:</strong> <span class="notes-preview">${preview}…</span><span class="notes-full" hidden>${full}</span> <button class="notes-expand-btn" type="button">Read more</button></aside>`;
}

function wireNotesExpand(container) {
  if (!container) return;
  container.querySelectorAll('.song-notes a').forEach(a => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  const btn = container.querySelector('.notes-expand-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const aside = btn.closest('.song-notes');
    aside.querySelector('.notes-preview').hidden = true;
    aside.querySelector('.notes-full').hidden = false;
    btn.hidden = true;
  });
}

function renderLyrics(song, modalBody, modalLoading) {
  modalLoading.hidden = true;
  const sections = song.sections || [];

  const sectionsHtml = sections.map(sec => `
    <div class="lyrics-section modal-left-cell">
      <h3 class="lyrics-section-label">${sec.label}</h3>
      <p class="lyrics-ta tamil" lang="ta">${sec.ta.replace(/\n/g, '<br>')}</p>
      <p class="lyrics-translit">${sec.translit.replace(/\n/g, '<br>')}</p>
    </div>
    <div class="lyrics-section-en modal-right-cell">
      <h3 class="lyrics-section-label">${sec.label}</h3>
      <p class="lyrics-en">${sec.en.replace(/\n/g, '<br>')}</p>
    </div>
  `).join('');

  modalBody.innerHTML = `
    <div class="modal-lyrics-grid">
      <p class="lyrics-block-label modal-left-cell">Tamil &amp; transliteration</p>
      <p class="lyrics-block-label modal-right-cell">Translation</p>
      ${sectionsHtml}
    </div>
  ` + renderNotes(song.notes);

  wireNotesExpand(modalBody);
}

function buildAudioBar(singer, audioSrc) {
  const bar = document.createElement('div');
  bar.id = 'modal-audio-bar';
  bar.className = 'modal-audio-bar';
  const musicIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
  if (audioSrc) {
    bar.innerHTML = `
      <p class="modal-audio-label">${musicIcon} Recording</p>
      <audio class="modal-plyr" src="${audioSrc}" preload="none"></audio>`;
  } else {
    bar.innerHTML = `
      <p class="modal-audio-label">${musicIcon} Audio not yet available for streaming</p>`;
  }
  return bar;
}

let _activePlayer = null;

function initAudioBar(bar) {
  const audioEl = bar && bar.querySelector('.modal-plyr');
  if (!audioEl || !window.Plyr) return;
  _activePlayer = new Plyr(audioEl, {
    controls: ['play', 'progress', 'current-time', 'duration', 'download'],
    resetOnEnd: true,
  });
}

let _modalHistoryPushed = false;

function openModalHistory() {
  history.pushState({ modalOpen: true }, '');
  _modalHistoryPushed = true;
}

function closeModal(modalOverlay, opts = {}) {
  if (_activePlayer) {
    _activePlayer.pause();
    _activePlayer = null;
  }
  modalOverlay.classList.remove('open');
  document.body.classList.remove('modal-open');
  const shouldGoBack = _modalHistoryPushed && !opts.fromPopstate;
  _modalHistoryPushed = false;
  if (shouldGoBack) history.back();
}

window.addEventListener('popstate', () => {
  const overlay = document.getElementById('modal-overlay');
  if (overlay && overlay.classList.contains('open')) {
    closeModal(overlay, { fromPopstate: true });
  }
});

function updateModalDeityBanner(deity) {
  const banner = document.getElementById('modal-deity-banner');
  const img    = document.getElementById('modal-deity-banner-img');
  const nameEl = document.getElementById('modal-deity-name');
  const taEl   = document.getElementById('modal-deity-ta');
  if (!banner) return;
  const meta = DEITY_META[deity];
  if (meta && meta.image) {
    img.src = meta.image + '?v=20260719k';
    img.alt = deity;
    nameEl.textContent = deity;
    taEl.textContent   = meta.ta;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

window.SiteShared = { renderLyrics, renderNotes, wireNotesExpand, buildAudioBar, initAudioBar, closeModal, openModalHistory, updateModalDeityBanner, DEITY_META, buildSongCard };

/* Inject modal synchronously so lyrics.js/audio.js can query it immediately */
injectModal();

document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
});
