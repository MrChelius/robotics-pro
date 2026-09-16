(() => {
  'use strict';
  const projectRoot = new URL('./', document.baseURI);

  const lang = () => new URLSearchParams(location.search).get('lang') || 'ru';
  const build = path => {
    const u = new URL(path, projectRoot);
    u.searchParams.set('lang', lang());
    return u.pathname + u.search + u.hash;
  };

  function fix() {
    const brand = document.querySelector('.dji-brand');
    if (brand) brand.href = build('./index.html');

    const nav = document.querySelectorAll('.dji-nav a');
    const navPaths = [
      './technologies/',
      './technologies/robots/',
      './technologies/drones/',
      './partners.html',
      './news.html'
    ];
    nav.forEach((a, i) => {
      if (navPaths[i]) a.href = build(navPaths[i]);
    });

    document.querySelectorAll('.dji-card-media, .dji-card h3 a').forEach(a => {
      const u = new URL(a.href, location.href);
      const product = u.searchParams.get('product');
      if (product) a.href = build(`./technologies/drones/product.html?product=${encodeURIComponent(product)}`);
    });

    const crumbs = document.querySelectorAll('.dji-breadcrumbs a');
    if (crumbs[0]) crumbs[0].href = build('./index.html');
    if (crumbs[1]) crumbs[1].href = build('./technologies/drones/');

    document.querySelectorAll('.dji-info .dji-btn.secondary').forEach(a => {
      a.href = build('./technologies/drones/');
    });
  }

  fix();
  new MutationObserver(() => requestAnimationFrame(fix)).observe(document.documentElement, {
    subtree: true,
    childList: true
  });
})();
