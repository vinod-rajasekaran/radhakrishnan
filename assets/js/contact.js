/* contact.js — mockup form (no backend) */

(function () {
  const form     = document.getElementById('contact-form');
  const noteEl   = document.getElementById('form-note');
  const TO_EMAIL = 'radhakrishnan.anthology@gmail.com';

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    const body   = [name && `From: ${name}`, email && `Reply-to: ${email}`, '', message].filter(Boolean).join('\n');
    const mailTo = `mailto:${TO_EMAIL}?subject=${encodeURIComponent('Anthology enquiry')}&body=${encodeURIComponent(body)}`;

    window.location.href = mailTo;
  });
})();
