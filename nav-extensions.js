(() => {
  'use strict';

  const labels = {
    ru: { partners: 'Партнёры', news: 'Новости технологий и IT' },
    en: { partners: 'Partners', news: 'Tech & IT News' },
    zh: { partners: '合作伙伴', news: '科技与 IT 新闻' },
    it: { partners: 'Partner', news: 'Notizie Tech & IT' },
    fr: { partners: 'Partenaires', news: 'Actualités Tech & IT' },
    de: { partners: 'Partner', news: 'Tech- & IT-News' },
    ja: { partners: 'パートナー', news: 'テック＆ITニュース' },
    ko: { partners: '파트너', news: '테크 & IT 뉴스' },
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
    a.href = href(kind === 'partners' ? 'partners.html' : 'news.html', lang);
    a.textContent = labels[lang][kind] + (mobile ? ' ↗' : '');
    return a;
  }

  function syncLinks() {
    const lang = currentLanguage();
    document.querySelectorAll('[data-extra-nav]').forEach(a => {
      const kind = a.dataset.extraNav;
      const mobile = !!a.closest('#menuDialog');
      a.href = href(kind === 'partners' ? 'partners.html' : 'news.html', lang);
      a.textContent = labels[lang][kind] + (mobile ? ' ↗' : '');
    });

    const desktopNav = document.querySelector('.desktop-nav');
    if (desktopNav) {
      if (!desktopNav.querySelector('[data-extra-nav="partners"]')) desktopNav.append(makeLink('partners'));
      if (!desktopNav.querySelector('[data-extra-nav="news"]')) desktopNav.append(makeLink('news'));
    }

    const mobileNav = document.querySelector('#menuDialog nav');
    if (mobileNav) {
      if (!mobileNav.querySelector('[data-extra-nav="partners"]')) mobileNav.append(makeLink('partners', true));
      if (!mobileNav.querySelector('[data-extra-nav="news"]')) mobileNav.append(makeLink('news', true));
    }
  }

  syncLinks();
  new MutationObserver(() => requestAnimationFrame(syncLinks)).observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('popstate', syncLinks);
})();
