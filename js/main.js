// Navigation, small interactions and accessible scroll reveals.
(() => {
  const menuBtn = document.getElementById('menuBtn');
  const links = document.getElementById('links');
  const toTop = document.getElementById('toTop');

  if (menuBtn && links) {
    menuBtn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('click', event => {
      if (!links.contains(event.target) && !menuBtn.contains(event.target)) {
        links.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in-view'));
  }

  const countItems = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && countItems.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count) || 0;
        const start = performance.now();
        const duration = 900;
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + (el.dataset.suffix || '');
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    countItems.forEach(item => counterObserver.observe(item));
  } else {
    countItems.forEach(item => item.textContent = item.dataset.count);
  }

  const onScroll = () => toTop && toTop.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Direct contact delivery via FormSubmit's documented JSON/AJAX endpoint.
  const form = document.getElementById('form');
  const formMsg = document.getElementById('formMsg');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button?.textContent || 'Send message';
    if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    if (formMsg) formMsg.textContent = '';
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      payload._replyto = payload.email;
      const response = await fetch('https://formsubmit.co/ajax/yuvrajsinghpathania26@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      // FormSubmit can return HTTP 200 for failures, so check its success field explicitly.
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error(result.message || 'Form service rejected the submission. Please verify the receiving email address.');
      }
      form.reset();
      if (formMsg) formMsg.textContent = 'Message sent successfully! Thank you for reaching out.';
    } catch (error) {
      console.error('Portfolio contact form:', error);
      if (formMsg) formMsg.textContent = error?.message
        ? 'Message not sent: ' + error.message
        : 'Could not connect to the email service. Please try again or use the Email link below.';
    } finally {
      if (button) { button.disabled = false; button.textContent = originalLabel; }
    }
  });
})();
