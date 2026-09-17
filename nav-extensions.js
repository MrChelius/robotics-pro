(() => {
  'use strict';

  const labels = {
    ru: { services: 'Услуги', partners: 'Партнёры', news: 'Новости технологий и IT', blog: 'Блог' },
    en: { services: 'Services', partners: 'Partners', news: 'Tech & IT News', blog: 'Blog' },
    zh: { services: '服务', partners: '合作伙伴', news: '科技与 IT 新闻', blog: '博客' },
    it: { services: 'Servizi', partners: 'Partner', news: 'Notizie Tech & IT', blog: 'Blog' },
    fr: { services: 'Services', partners: 'Partenaires', news: 'Actualités Tech & IT', blog: 'Blog' },
    de: { services: 'Services', partners: 'Partner', news: 'Tech- & IT-News', blog: 'Blog' },
    ja: { services: 'サービス', partners: 'パートナー', news: 'テック＆ITニュース', blog: 'ブログ' },
    ko: { services: '서비스', partners: '파트너', news: '테크 & IT 뉴스', blog: '블로그' },
  };

  const paths = {
    services: 'services.html',
    partners: 'partners.html',
    news: 'news.html',
    blog: 'blog.html',
  };

  function currentLanguage() {
    const params = new URLSearchParams(location.search);
    let stored = '';
    try { stored = JSON.parse(localStorage.getItem('robotics_pro_language') || '""'); } catch {}
    const lang = params.get('lang') || stored || 'ru';
    return labels[lang] ? lang : 'ru';
  }

  function href(path, lang) {
    const url = new URL(path, document.baseURI);
    url.searchParams.set('lang', lang);
    return url.pathname + url.search + url.hash;
  }

  function makeLink(kind, mobile = false) {
    const lang = currentLanguage();
    const a = document.createElement('a');
    a.dataset.extraNav = kind;
    a.href = href(paths[kind], lang);
    a.textContent = labels[lang][kind] + (mobile ? ' ↗' : '');
    return a;
  }

  function optimizeImages() {
    document.querySelectorAll('img').forEach((img, index) => {
      img.decoding = 'async';
      if (!img.closest('.hero') && index > 0 && !img.hasAttribute('loading')) img.loading = 'lazy';
    });
  }

  function improveNavigationAccessibility() {
    document.querySelectorAll('nav').forEach((nav, index) => {
      if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', index === 0 ? 'Primary navigation' : 'Navigation');
    });
    const currentPath = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a[href]').forEach(a => {
      try {
        const linkPath = new URL(a.href, document.baseURI).pathname.split('/').pop() || 'index.html';
        if (linkPath === currentPath) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      } catch {}
    });
  }

  function syncLinks() {
    const lang = currentLanguage();
    document.querySelectorAll('[data-extra-nav]').forEach(a => {
      const kind = a.dataset.extraNav;
      if (!paths[kind]) return;
      const mobile = !!a.closest('#menuDialog');
      a.href = href(paths[kind], lang);
      a.textContent = labels[lang][kind] + (mobile ? ' ↗' : '');
    });

    const desktopNav = document.querySelector('.desktop-nav');
    if (desktopNav) {
      ['services', 'partners', 'news', 'blog'].forEach(kind => {
        if (!desktopNav.querySelector(`[data-extra-nav="${kind}"]`)) desktopNav.append(makeLink(kind));
      });
    }

    const mobileNav = document.querySelector('#menuDialog nav');
    if (mobileNav) {
      ['services', 'partners', 'news', 'blog'].forEach(kind => {
        if (!mobileNav.querySelector(`[data-extra-nav="${kind}"]`)) mobileNav.append(makeLink(kind, true));
      });
    }

    optimizeImages();
    improveNavigationAccessibility();
  }

  syncLinks();
  new MutationObserver(() => requestAnimationFrame(syncLinks)).observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('popstate', syncLinks);
})();
