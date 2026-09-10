/* DEEB — site scripts
   Fixed: removed dead code, duplicate window.open handlers, added
   modal a11y (aria-hidden, focus trap), form validation, Escape-key
   handling for menu + modal, single-source pricing. */

const CONFIG = {
  instagramUrl: 'https://www.instagram.com/deeb_egy',
  tiktokUrl: 'https://www.tiktok.com/@deeb.eg',
  deliveryNote: 'Delivery Available in Cairo Only.',
  currency: 'EGP',
  priceCurrent: 750,
  priceOld: 800
};

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  setupMobileMenu();
  setupReveal();
  setupGalleries();
  setupSwipers();
  setupOrderModal();
  setupActiveNav();
  setupPrices();
  setupYear();
});

/* ---------- Header shadow on scroll ---------- */
function setupHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile menu (with Escape close) ---------- */
let closeMobileMenu = () => {};

function setupMobileMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!btn || !nav) return;

  const close = () => {
    if (!nav.classList.contains('open')) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  };

  const open = () => {
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  };

  btn.addEventListener('click', () => {
    nav.classList.contains('open') ? close() : open();
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 780) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  closeMobileMenu = close;
}

/* ---------- Scroll reveal ---------- */
function setupReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!items.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('show'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

/* ---------- Product image galleries ---------- */
function setupGalleries() {
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const main = gallery.querySelector('[data-gallery-main]');
    const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
    if (!main || !thumbs.length) return;

    thumbs.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.__deebDragged) return;
        thumbs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const src = btn.getAttribute('data-src');
        const alt = btn.getAttribute('data-alt') || main.alt;
        if (src) {
          main.src = src;
          if (alt) main.alt = alt;
        }
        /* Color-swap galleries: keep the card's order button + label in sync */
        const color = btn.getAttribute('data-color');
        if (color) {
          const card = gallery.closest('.product-card');
          const orderBtn = card?.querySelector('[data-open-order]');
          if (orderBtn) orderBtn.dataset.color = color;
          const label = card?.querySelector('[data-color-label]');
          if (label) label.textContent = color;
        }
      });
    });
  });
}

/* ---------- Order modal ---------- */
function setupOrderModal() {
  const modal = document.querySelector('[data-order-modal]');
  if (!modal) return;

  const card = modal.querySelector('.modal-card');
  const form = modal.querySelector('[data-order-form]');
  const preview = modal.querySelector('[data-order-preview]');
  const copyBtn = modal.querySelector('[data-copy-order]');
  const closeBtn = modal.querySelector('[data-modal-close]');
  const fields = {
    product: modal.querySelector('[name="product"]'),
    color: modal.querySelector('[name="color"]'),
    size: modal.querySelector('[name="size"]'),
    name: modal.querySelector('[name="name"]'),
    phone: modal.querySelector('[name="phone"]'),
    address: modal.querySelector('[name="address"]')
  };
  const openButtons = document.querySelectorAll('[data-open-order]');
  let lastTrigger = null;

  const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your full name.',
    phone: v => /^01[0-9]{9}$/.test(v.trim().replace(/\s/g, '')) || 'Enter a valid phone number, e.g. 01xxxxxxxxx.',
    address: v => v.trim().length >= 8 || 'Please enter a complete delivery address.'
  };

  const getValues = () => ({
    product: fields.product?.value.trim() || 'DEEB Oversized T-Shirt',
    color: fields.color?.value || 'Black',
    size: fields.size?.value || 'M',
    name: fields.name?.value || '',
    phone: fields.phone?.value || '',
    address: fields.address?.value || ''
  });

  const updatePreview = () => {
    if (preview) preview.textContent = buildOrderText(getValues());
  };

  const showFieldError = (input, message) => {
    if (!input) return;
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    const err = modal.querySelector(`[data-error-for="${input.name}"]`);
    if (err) { err.textContent = message; err.hidden = false; }
  };

  const clearFieldError = (input) => {
    if (!input) return;
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    const err = modal.querySelector(`[data-error-for="${input.name}"]`);
    if (err) { err.textContent = ''; err.hidden = true; }
  };

  const validate = () => {
    let firstInvalid = null;
    ['name', 'phone', 'address'].forEach(key => {
      const input = fields[key];
      if (!input) return;
      clearFieldError(input);
      const result = validators[key](input.value);
      if (result !== true) {
        showFieldError(input, result);
        if (!firstInvalid) firstInvalid = input;
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  };

  const openModal = (trigger) => {
    lastTrigger = trigger || document.activeElement;

    if (trigger?.dataset.product && fields.product) fields.product.value = trigger.dataset.product;
    if (trigger?.dataset.color && fields.color) fields.color.value = trigger.dataset.color;
    if (trigger?.dataset.size && fields.size) fields.size.value = trigger.dataset.size;

    updatePreview();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => fields.name?.focus(), 50);
  };

  const closeModal = () => {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastTrigger?.focus?.();
  };

  openButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(btn);
  }));

  closeBtn?.addEventListener('click', closeModal);

  /* Close on overlay click */
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  /* Escape closes modal (and mobile menu via its own handler) */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* Simple focus trap while the dialog is open */
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !card) return;
    const focusables = card.querySelectorAll('button, input, select, textarea, a[href]');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  form?.addEventListener('input', (e) => {
    if (e.target instanceof HTMLElement) clearFieldError(e.target);
    updatePreview();
  });
  form?.addEventListener('change', updatePreview);

  copyBtn?.addEventListener('click', async () => {
    if (!validate()) {
      showToast('Please complete the highlighted fields', true);
      return;
    }
    await copyText(buildOrderText(getValues()));
    showToast('Order copied');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please complete the highlighted fields', true);
      return;
    }
    await copyText(buildOrderText(getValues()));
    showToast('Copied. Opening Instagram...');
    window.open(CONFIG.instagramUrl, '_blank', 'noopener,noreferrer');
  });
}

/* ---------- Active nav highlighting ---------- */
function setupActiveNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === 'index.html' && (href === './' || href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

/* ---------- Single-source pricing ---------- */
function setupPrices() {
  document.querySelectorAll('[data-price-current]').forEach(el => {
    el.textContent = `${CONFIG.priceCurrent} ${CONFIG.currency}`;
  });
  document.querySelectorAll('[data-price-old]').forEach(el => {
    el.textContent = `${CONFIG.priceOld} ${CONFIG.currency}`;
  });
  document.querySelectorAll('[data-price-save]').forEach(el => {
    el.textContent = `Save ${CONFIG.priceOld - CONFIG.priceCurrent} ${CONFIG.currency}`;
  });
}

/* ---------- Dynamic footer year ---------- */
function setupYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Order message builder ---------- */
function buildOrderText({ product, color, size, name, phone, address }) {
  return `Hello DEEB,

I would like to place an order.

Product: ${product}
Color: ${color}
Size: ${size}

Name: ${name.trim()}
Phone: ${phone.trim()}
Address: ${address.trim()}

Price: ${CONFIG.priceCurrent} ${CONFIG.currency}
${CONFIG.deliveryNote}`;
}

/* ---------- Clipboard with fallback ---------- */
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (err) { /* fall through to legacy path */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (err) { /* no-op */ }
  ta.remove();
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(message, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Collection swipers: arrows + drag-to-scroll ---------- */
function setupSwipers() {
  document.querySelectorAll('[data-swiper]').forEach(sw => {
    const track = sw.querySelector('.swiper-track');
    const prev = sw.querySelector('[data-swiper-prev]');
    const next = sw.querySelector('[data-swiper-next]');
    if (!track) return;

    const step = () => {
      const first = track.querySelector(':scope > *');
      return first ? first.getBoundingClientRect().width + 18 : 320;
    };

    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

    /* Drag with mouse (touch uses native scrolling). Clicks right after a
       drag are suppressed via window.__deebDragged. */
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      isDown = true;
      window.__deebDragged = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        window.__deebDragged = true;
        track.classList.add('dragging');
      }
      track.scrollLeft = startScroll - dx;
    });

    window.addEventListener('pointerup', () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('dragging');
      setTimeout(() => { window.__deebDragged = false; }, 0);
    });
  });
}
