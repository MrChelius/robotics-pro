(() => {
  'use strict';
  const root = new URL('./', document.baseURI);
  const fix = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('#')) return;
      const marker = '/robotics-pro/';
      let path = raw;
      const index = raw.indexOf(marker);
      if (index >= 0) path = raw.slice(index + marker.length);
      path = path.replace(/^\.\//, '').replace(/^\/robotics-pro\//, '');
      const target = new URL(path, root);
      const currentLang = new URLSearchParams(location.search).get('lang');
      if (currentLang) target.searchParams.set('lang', currentLang);
      a.href = target.pathname + target.search + target.hash;
    });
  };
  fix();
  new MutationObserver(() => requestAnimationFrame(fix)).observe(document.documentElement, {subtree:true, childList:true});
})();
