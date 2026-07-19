/* books.js — volume tab switching + URL hash */

(function () {
  const tabs   = Array.from(document.querySelectorAll('.vol-tab'));
  const panels = Array.from(document.querySelectorAll('.vol-panel'));

  if (!tabs.length) return;

  function activate(id) {
    tabs.forEach(t => {
      const active = t.dataset.vol === id;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(p => {
      const active = p.id === id;
      /* Use both hidden attribute and active class to ensure correct display */
      p.hidden = !active;
      p.classList.toggle('active', active);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activate(tab.dataset.vol);
      history.replaceState(null, '', '#' + tab.dataset.vol);
    });
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') {
        const next = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
        next.click();
        next.focus();
      }
      if (e.key === 'ArrowLeft') {
        const prev = tabs[(tabs.indexOf(tab) - 1 + tabs.length) % tabs.length];
        prev.click();
        prev.focus();
      }
    });
  });

  const hash  = window.location.hash.replace('#', '');
  const valid = tabs.some(t => t.dataset.vol === hash);
  activate(valid ? hash : 'vol1');
})();
