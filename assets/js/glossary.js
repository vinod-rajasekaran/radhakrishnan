/* glossary.js — live filter for glossary table */

(function () {
  const input   = document.getElementById('glossary-search');
  const rows    = Array.from(document.querySelectorAll('.g-row'));
  const empty   = document.getElementById('glossary-empty');
  const countEl = document.getElementById('glossary-count');
  const clearBtn = document.getElementById('glossary-clear');

  if (!input) return;

  countEl.textContent = `${rows.length} terms`;

  input.addEventListener('input', filter);
  if (clearBtn) clearBtn.addEventListener('click', () => { input.value = ''; filter(); input.focus(); });

  function filter() {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const match = !q || text.includes(q);
      row.hidden = !match;
      if (match) shown++;
    });
    empty.hidden = shown > 0;
    countEl.textContent = q ? `${shown} of ${rows.length} terms` : `${rows.length} terms`;
  }
})();
