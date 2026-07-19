/* site.js — shared nav, footer, modal, and utilities */

const NAV_ITEMS = [
  { key: 'lyrics',           label: 'Lyrics',           href: 'lyrics.html' },
  { key: 'books',            label: 'Books',             href: 'books.html' },
  { key: 'audio',            label: 'Audio',             href: 'audio.html' },
  { key: 'about',            label: 'About',             href: 'about.html' },
  { key: 'acknowledgements', label: 'Acknowledgements',  href: 'acknowledgements.html' },
  { key: 'glossary',         label: 'Glossary',          href: 'glossary.html' },
  { key: 'contact',          label: 'Contact',           href: 'contact.html' },
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
    <p class="footer-license-text">
      These songs are shared under a Creative Commons Attribution-NonCommercial license.
      Share, quote, or perform them freely with credit to Dr. R. Radhakrishnan —
      just not for commercial use without asking first.
    </p>
  </div>
  <div class="footer-copy">© 2026 Dr. R. Radhakrishnan</div>
</footer>`;
}

function injectModal() {
  if (document.getElementById('modal-overlay')) return;
  const tpl = document.createElement('div');
  tpl.innerHTML = `<div class="modal-overlay" id="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal" id="modal">
      <button class="modal-close" id="modal-close" aria-label="Close song">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="modal-header">
        <div class="modal-meta" id="modal-meta"></div>
        <h2 class="modal-title" id="modal-title"></h2>
        <p class="modal-en-title" id="modal-en-title"></p>
      </div>
      <div class="modal-body" id="modal-body">
        <div class="modal-loading" id="modal-loading" aria-live="polite">
          <span class="loading-spinner" aria-hidden="true"></span> Loading…
        </div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(tpl.firstElementChild);
}

/* ── Shared modal utilities (used by lyrics.js and audio.js) ── */

function renderLyrics(song, modalBody, modalLoading) {
  modalLoading.hidden = true;
  const sections = song.sections || [];

  const sectionsHtml = sections.map(sec => `
    <div class="lyrics-section modal-left-cell">
      <h3 class="lyrics-section-label">${sec.label}</h3>
      <p class="lyrics-ta tamil">${sec.ta.replace(/\n/g, '<br>')}</p>
      <p class="lyrics-translit">${sec.translit.replace(/\n/g, '<br>')}</p>
    </div>
    <div class="lyrics-section-en modal-right-cell">
      <h3 class="lyrics-section-label">${sec.label}</h3>
      <p class="lyrics-en">${sec.en.replace(/\n/g, '<br>')}</p>
    </div>
  `).join('');

  const notes = song.notes
    ? `<aside class="song-notes"><strong>Notes:</strong> ${song.notes}</aside>`
    : '';

  modalBody.innerHTML = `
    <div class="modal-lyrics-grid">
      <p class="lyrics-block-label modal-left-cell">Tamil &amp; transliteration</p>
      <p class="lyrics-block-label modal-right-cell">Translation</p>
      ${sectionsHtml}
    </div>
  ` + notes;
}

function buildAudioBar(singer, audioSrc) {
  const bar = document.createElement('div');
  bar.id = 'modal-audio-bar';
  bar.className = 'modal-audio-bar';
  const musicIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
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
    const audioEl = bar.querySelector('#modal-audio-el');
    const fillEl  = bar.querySelector('#modal-progress-fill');
    bar.querySelector('#modal-play-btn').addEventListener('click', () => {
      const btn = bar.querySelector('#modal-play-btn');
      if (audioEl.paused) {
        audioEl.play();
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      } else {
        audioEl.pause();
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
      }
    });
    audioEl.addEventListener('timeupdate', () => {
      if (audioEl.duration) fillEl.style.width = (audioEl.currentTime / audioEl.duration * 100) + '%';
    });
    audioEl.addEventListener('ended', () => {
      bar.querySelector('#modal-play-btn').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
      fillEl.style.width = '0%';
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
  return bar;
}

function closeModal(modalOverlay) {
  modalOverlay.classList.remove('open');
  document.body.classList.remove('modal-open');
}

window.SiteShared = { renderLyrics, buildAudioBar, closeModal };

/* Inject modal synchronously so lyrics.js/audio.js can query it immediately */
injectModal();

document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
});
