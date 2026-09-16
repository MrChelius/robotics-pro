(() => {
  'use strict';

  const productId = new URLSearchParams(location.search).get('product');
  const products = window.DJI_CATALOG?.products || [];
  const product = products.find(p => p.id === productId);

  const fallbackByProduct = {
    'dji-neo': 'https://www.outdoorphoto.co.za/cdn/shop/files/dji-neo-drone-2.jpg?v=1753277356&width=1500',
    'dji-mini-4-pro': 'https://drone.kz/upload/resize_cache/webp/resize_cache/iblock/aa2/85jodd4hhv1fm6iowl8kycxccusud1ai/2000_2000_140cd750bba9870f18aada2478b24840a/e8923caaaaedf808853c33394ff27f46_origin.webp',
    'dji-air-3': 'https://cdn.vatanbilgisayar.com/Upload/PRODUCT/dji/thumb/140232-2_large.jpg',
    'dji-air-3s': 'https://sktphotoworld.com/attachments/shop_images/164.jpg',
    'dji-avata-2': 'https://m.media-amazon.com/images/I/61Q9KZUvR4L._AC_SL1500_.jpg',
    'dji-mavic-3-pro': 'https://www.cameraland.nl/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/m/a/mavic-3-pro-sc-fly-more_7_1_1.jpg',
    'dji-matrice-30t': 'https://images.squarespace-cdn.com/content/v1/624cf3e05b54c2278195d5e3/1707290959516-7BPI9PRPM8M212SO2P7I/dji-m30t-web-4-tr.png',
    'dji-matrice-350-rtk': 'https://cielotec.ch/cdn/shop/files/DJIEnterpriseMultikopterMatrice350RTK_EU_DJICareBasic-284452774_xxl3.jpg?v=1718033048',
    'dji-inspire-3': 'https://cdn.mos.cms.futurecdn.net/dRF2gmfvAB7MVJTLAffdmR.jpg',
    'dji-agras-t50': 'https://dronelabs.ca/cdn/shop/files/ProductPhoto_5.png?v=1727392769&width=3413'
  };

  const defaultFallback = 'https://cdn.vatanbilgisayar.com/Upload/PRODUCT/dji/thumb/140232-2_large.jpg';

  function safeFallback(img) {
    if (!img || img.dataset.fallbackReady === '1') return;
    img.dataset.fallbackReady = '1';
    img.addEventListener('error', () => {
      const owner = img.closest('[data-product-id]')?.dataset.productId || productId;
      const fallback = fallbackByProduct[owner] || fallbackByProduct[product?.id] || defaultFallback;
      if (img.src !== fallback) {
        img.src = fallback;
        img.removeAttribute('srcset');
      }
    });
  }

  function tagCards() {
    document.querySelectorAll('.dji-card').forEach(card => {
      const link = card.querySelector('a[href*="product="]');
      if (!link) return;
      try {
        const url = new URL(link.href, location.href);
        card.dataset.productId = url.searchParams.get('product') || '';
      } catch {}
    });
  }

  function attachFallbacks() {
    tagCards();
    document.querySelectorAll('.dji-shell img').forEach(safeFallback);
  }

  function initSlider() {
    if (!product) return;
    const stage = document.querySelector('.dji-gallery-stage');
    const main = document.querySelector('#djiMainPhoto');
    if (!stage || !main || stage.dataset.sliderReady === '1') return;
    stage.dataset.sliderReady = '1';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', `${product.name} photo gallery`);

    let index = Math.max(0, product.images.findIndex(src => main.src.includes(src)));
    if (index < 0) index = 0;

    const prev = document.createElement('button');
    prev.className = 'dji-gallery-arrow dji-gallery-prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous photo');
    prev.innerHTML = '‹';

    const next = document.createElement('button');
    next.className = 'dji-gallery-arrow dji-gallery-next';
    next.type = 'button';
    next.setAttribute('aria-label', 'Next photo');
    next.innerHTML = '›';

    const counter = document.createElement('span');
    counter.className = 'dji-gallery-counter';
    stage.append(prev, next, counter);

    const thumbs = [...document.querySelectorAll('.dji-thumb')];

    function apply(nextIndex, direction = 1) {
      const total = product.images.length;
      if (!total) return;
      index = (nextIndex + total) % total;
      const cls = direction >= 0 ? 'slide-left' : 'slide-right';
      main.classList.remove('slide-left', 'slide-right');
      void main.offsetWidth;
      main.classList.add(cls);
      main.src = product.images[index];
      main.dataset.fallbackReady = '0';
      safeFallback(main);
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
      counter.textContent = `${index + 1} / ${total}`;
    }

    prev.addEventListener('click', e => { e.preventDefault(); apply(index - 1, -1); });
    next.addEventListener('click', e => { e.preventDefault(); apply(index + 1, 1); });

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => apply(i, i >= index ? 1 : -1));
    });

    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); apply(index - 1, -1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); apply(index + 1, 1); }
    });

    let startX = null;
    stage.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startX = e.clientX;
    });
    stage.addEventListener('pointerup', e => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 45) return;
      apply(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });

    apply(index, 1);
  }

  function run() {
    attachFallbacks();
    initSlider();
  }

  run();
  new MutationObserver(() => requestAnimationFrame(run)).observe(document.documentElement, {subtree:true, childList:true});
})();
