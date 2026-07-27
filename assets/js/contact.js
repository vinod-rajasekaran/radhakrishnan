/* contact.js — Formspree fetch */
(function () {
  const form      = document.getElementById('contact-form');
  const successEl = document.querySelector('[data-fs-success]');
  const formErrEl = document.querySelector('[data-fs-error=""]');
  const submitBtn = form && form.querySelector('[data-fs-submit-btn]');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    form.querySelectorAll('[data-fs-error]').forEach(el => {
      el.textContent = '';
      el.hidden = true;
    });
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res  = await fetch('https://formspree.io/f/xvzedgyg', {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
      });
      const json = await res.json();

      if (res.ok) {
        form.hidden = true;
        if (successEl) successEl.hidden = false;
      } else {
        const errs = json.errors || [];
        errs.forEach(err => {
          const el = err.field
            ? form.querySelector(`[data-fs-error="${err.field}"]`)
            : formErrEl;
          if (el) { el.textContent = err.message; el.hidden = false; }
        });
        if (!errs.length && formErrEl) {
          formErrEl.textContent = 'Something went wrong. Please try again.';
          formErrEl.hidden = false;
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch (_) {
      if (formErrEl) {
        formErrEl.textContent = 'Network error — please check your connection and try again.';
        formErrEl.hidden = false;
      }
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
