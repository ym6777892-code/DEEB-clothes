
const CONFIG = {
  instagramUrl: 'https://www.instagram.com/deeb_egy',
  tiktokUrl: 'https://www.tiktok.com/@deeb.eg',
  deliveryNote: 'Delivery Available in Cairo Only.'
};

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupReveal();
  setupHeader();
  setupGalleries();
  setupOrderModal();
  setupCloseOnOverlay();
  setupActiveNav();
  setupFooterLinks();
});

function setupHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupMobileMenu() {
  const btn = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!btn || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 780) close();
  });
}

function setupReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!items.length) return;

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

function setupGalleries() {
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const main = gallery.querySelector('[data-gallery-main]');
    const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
    if (!main || !thumbs.length) return;

    thumbs.forEach(btn => {
      btn.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const src = btn.getAttribute('data-src');
        const alt = btn.getAttribute('data-alt') || main.alt;
        if (src) main.src = src;
        if (alt) main.alt = alt;
      });
    });
  });
}

function setupOrderModal() {
  const modal = document.querySelector('[data-order-modal]');
  if (!modal) return;

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

  const updatePreview = () => {
    if (!preview) return;
    preview.textContent = buildOrderText({
      product: fields.product?.value || 'DEEB Oversized T-Shirt',
      color: fields.color?.value || 'Black',
      size: fields.size?.value || 'M',
      name: fields.name?.value || '',
      phone: fields.phone?.value || '',
      address: fields.address?.value || ''
    });
  };

  const openModal = (trigger) => {
    lastTrigger = trigger || document.activeElement;
    const product = trigger?.dataset.product || 'DEEB Oversized T-Shirt';
    const color = trigger?.dataset.color || 'Black';
    const size = trigger?.dataset.size || 'M';

    if (fields.product) fields.product.value = product;
    if (fields.color) fields.color.value = color;
    if (fields.size) fields.size.value = size;
    if (fields.name) fields.name.value = '';
    if (fields.phone) fields.phone.value = '';
    if (fields.address) fields.address.value = '';

    updatePreview();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => fields.name?.focus(), 50);
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    lastTrigger?.focus?.();
  };

  openButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(btn);
  }));

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form?.addEventListener('input', updatePreview);
  form?.addEventListener('change', updatePreview);

  copyBtn?.addEventListener('click', async () => {
    const text = buildOrderText({
      product: fields.product?.value || 'DEEB Oversized T-Shirt',
      color: fields.color?.value || 'Black',
      size: fields.size?.value || 'M',
      name: fields.name?.value || '',
      phone: fields.phone?.value || '',
      address: fields.address?.value || ''
    });
    await copyText(text);
    showToast('Order copied');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = buildOrderText({
      product: fields.product?.value || 'DEEB Oversized T-Shirt',
      color: fields.color?.value || 'Black',
      size: fields.size?.value || 'M',
      name: fields.name?.value || '',
      phone: fields.phone?.value || '',
      address: fields.address?.value || ''
    });

    await copyText(text);
    showToast('Copied. Opening Instagram...');
    window.open(CONFIG.instagramUrl, '_blank', 'noopener,noreferrer');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  modal.addEventListener('open-order', () => openModal(lastTrigger));
}

function setupCloseOnOverlay() {}

function setupActiveNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isActive =
      (current === 'index.html' && (href === 'index.html' || href === './' || href === '../index.html')) ||
      (current !== 'index.html' && href.endsWith(current));
    if (isActive) link.classList.add('active');
  });
}

function setupFooterLinks() {
  document.querySelectorAll('[data-open-instagram]').forEach(btn => {
    btn.addEventListener('click', () => window.open(CONFIG.instagramUrl, '_blank', 'noopener,noreferrer'));
  });
  document.querySelectorAll('[data-open-tiktok]').forEach(btn => {
    btn.addEventListener('click', () => window.open(CONFIG.tiktokUrl, '_blank', 'noopener,noreferrer'));
  });
}

function buildOrderText({ product, color, size, name, phone, address }) {
  return `Hello DEEB,

I would like to order a ${product}.

Product: ${product}
Color: ${color}
Size: ${size}

Name: ${name || ' '}
Phone: ${phone || ' '}
Address: ${address || ' '}

Price: 750 EGP
${CONFIG.deliveryNote}`;
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (err) {}
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
