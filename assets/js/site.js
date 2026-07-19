/* site.js — shared nav, footer, and utilities */

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

const SEARCH_SVG = `<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <circle cx="7.5" cy="7.5" r="5.5"/><path d="M13 13l3 3"/>
</svg>`;

function buildNavLinks(currentPage) {
  return NAV_ITEMS.map(item => {
    if (item.children) {
      const childActive = item.children.some(c => c.key === currentPage);
      const ddItems = item.children.map(c =>
        `<a href="${c.href}"${c.key === currentPage ? ' class="active"' : ''}>${c.label}</a>`
      ).join('');
      return `<li class="nav-dd${childActive ? ' child-active' : ''}">
        <button class="nav-dd-btn${childActive ? ' active' : ''}" aria-haspopup="true" aria-expanded="false">
          ${item.label}
          <svg class="nav-dd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="nav-dd-menu" role="menu">${ddItems}</div>
      </li>`;
    }
    const active = item.key === currentPage;
    return `<li><a href="${item.href}"${active ? ' class="active" aria-current="page"' : ''}>${item.label}</a></li>`;
  }).join('');
}

function buildMobileMenu(currentPage) {
  return NAV_ITEMS.map(item => {
    if (item.children) {
      const childItems = item.children.map(c =>
        `<a href="${c.href}" class="indent${c.key === currentPage ? ' active' : ''}">${c.label}</a>`
      ).join('');
      return `<span class="nav-mobile-section">${item.label}</span>${childItems}`;
    }
    return `<a href="${item.href}"${item.key === currentPage ? ' class="active"' : ''}>${item.label}</a>`;
  }).join('');
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
  /* Desktop dropdown toggles — use .nav-dd class (not .filter-dd) */
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

  /* Nav search button — focus the page's search input if present */
  const searchBtn = document.getElementById('nav-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const input = document.getElementById('search-input') || document.getElementById('glossary-search');
      if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      else { window.location.href = 'lyrics.html'; }
    });
  }

  /* Mobile hamburger */
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
  el.outerHTML = `<footer class="site-footer">
  <nav class="footer-links" aria-label="Footer navigation">
    <a href="lyrics.html">Lyrics</a>
    <a href="books.html">Books</a>
    <a href="audio.html">Audio</a>
    <a href="about.html">About</a>
    <a href="acknowledgements.html">Acknowledgements</a>
    <a href="glossary.html">Glossary</a>
    <a href="contact.html">Contact</a>
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

document.addEventListener('DOMContentLoaded', () => {
  injectNav();
  injectFooter();
});
