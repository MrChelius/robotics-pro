(() => {
  'use strict';

  const integrations = {
    cms: { provider: 'GitHub content files', status: 'active', note: 'Blog posts are managed from content/blog-posts.json.' },
    crm: { provider: 'CRM adapter', status: 'ready', note: 'Connect HubSpot, Pipedrive or another CRM after credentials are supplied.' },
    analytics: { provider: 'Google Analytics 4', status: 'active', note: 'GA4 is preserved and enhanced with service interaction events.' },
    liveChat: { provider: 'On-site chat', status: 'active', note: 'Local chat works now; external live-agent providers can be connected later.' },
    booking: { provider: 'Local booking request', status: 'active', note: 'No form data leaves the browser automatically.' },
    ai: { provider: 'Catalog consultant', status: 'active', note: 'Private client-side product matching based on the public catalog.' },
  };

  const services = [
    ['Product sourcing', 'Robot and drone selection, supplier coordination and cross-border project preparation.'],
    ['Robotics integration', 'Deployment planning, configuration guidance, education and R&D use-case matching.'],
    ['Ecommerce integration', 'Payments, lead routing, analytics, booking, chat and storefront automation.'],
    ['CMS & content', 'Repository-backed content for blog and landing pages, ready for a hosted CMS provider later.'],
    ['SEO & discoverability', 'Canonical URLs, metadata, structured data, sitemap and crawl directives.'],
    ['Performance', 'Static-first architecture, deferred JavaScript and dependency-light UI for fast GitHub Pages delivery.'],
    ['Accessibility', 'Semantic controls, visible focus, skip links, ARIA live regions and reduced-motion friendly effects.'],
    ['AI product consultant', 'On-site matching against CCCTrade catalog data without exposing private API keys.'],
  ];

  const payments = [
    ['Bank cards', 'Visa / Mastercard via a future PSP adapter. No card data is collected by this site.'],
    ['UnionPay', 'Ready for a supported PSP or merchant account.'],
    ['Alipay', 'Ready for merchant integration once account credentials are available.'],
    ['WeChat Pay', 'Ready for merchant integration once account credentials are available.'],
    ['Crypto', 'USDT, BTC and ETH can be enabled through a regulated payment processor or confirmed wallet workflow. No wallet address is hard-coded.'],
    ['Invoice / bank transfer', 'Manager-confirmed invoice and bank-transfer workflow for B2B orders.'],
  ];

  function track(name, params = {}) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch (_) {}
  }

  function card(title, text, badge) {
    const article = document.createElement('article');
    article.className = 'product-card';
    const copy = document.createElement('div');
    copy.className = 'card-copy';
    if (badge) {
      const small = document.createElement('span');
      small.className = 'eyebrow';
      small.textContent = badge;
      copy.append(small);
    }
    const h = document.createElement('h3'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = text;
    copy.append(h, p); article.append(copy); return article;
  }

  function render() {
    const serviceGrid = document.querySelector('#serviceGrid');
    services.forEach(([a,b]) => serviceGrid?.append(card(a,b,'Service')));
    const paymentGrid = document.querySelector('#paymentGrid');
    payments.forEach(([a,b]) => paymentGrid?.append(card(a,b,'Payment method')));
    const integrationGrid = document.querySelector('#integrationGrid');
    Object.entries(integrations).forEach(([key, item]) => integrationGrid?.append(card(item.provider, item.note, item.status.toUpperCase())));
  }

  function bookingText() {
    const form = document.querySelector('#bookingForm');
    if (!form) return '';
    const data = new FormData(form);
    return [
      'CCCTrade consultation request',
      `Name: ${data.get('name') || ''}`,
      `Contact: ${data.get('contact') || ''}`,
      `Topic: ${data.get('topic') || ''}`,
      `Project: ${data.get('message') || ''}`,
    ].join('\n');
  }

  function setupBooking() {
    const form = document.querySelector('#bookingForm');
    const status = document.querySelector('#bookingStatus');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const request = bookingText();
      try {
        const leads = JSON.parse(localStorage.getItem('robotics_pro_leads') || '[]');
        leads.push({ createdAt: new Date().toISOString(), request });
        localStorage.setItem('robotics_pro_leads', JSON.stringify(leads.slice(-20)));
        status.textContent = 'Request prepared and saved on this device. Copy it and send it to the CCCTrade manager.';
      } catch (_) {
        status.textContent = 'Request prepared. Local storage is unavailable, so please copy the request.';
      }
      track('consultation_request_prepared', { topic: new FormData(form).get('topic') || 'unknown' });
    });
    document.querySelector('#copyBooking')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(bookingText()); status.textContent = 'Request copied.'; }
      catch (_) { status.textContent = 'Copy is unavailable in this browser. Select the form text manually.'; }
    });
  }

  function scoreProduct(product, q) {
    const text = `${product.name} ${product.group} ${product.description?.en || ''} ${product.fit?.en || ''} ${(product.features || []).map(x => x?.en || '').join(' ')}`.toLowerCase();
    const words = q.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
    let score = words.reduce((n, word) => n + (text.includes(word) ? 2 : 0), 0);
    if (/research|lab|developer|development|edu|program/.test(q) && /g1|r1|go2/.test(product.id)) score += 4;
    if (/outdoor|inspection|quadruped|dog|terrain/.test(q) && /go2/.test(product.id)) score += 6;
    if (/home|companion|pet|child|kids/.test(q) && /loona|emo/.test(product.id)) score += 6;
    if (/humanoid|human|biped/.test(q) && /g1|r1/.test(product.id)) score += 6;
    return score;
  }

  function setupConsultant() {
    const button = document.querySelector('#askAi');
    const input = document.querySelector('#aiQuestion');
    const answer = document.querySelector('#aiAnswer');
    button?.addEventListener('click', () => {
      const q = (input.value || '').trim();
      if (!q) { answer.textContent = 'Describe your goal, environment and budget range.'; return; }
      const products = window.RP?.products || [];
      if (!products.length) { answer.textContent = 'The product catalog is temporarily unavailable.'; return; }
      const ranked = products.map(p => [p, scoreProduct(p, q)]).sort((a,b) => b[1]-a[1]).slice(0,3);
      answer.replaceChildren();
      const intro = document.createElement('p');
      intro.textContent = ranked[0][1] > 0 ? 'Best catalog matches based on your description:' : 'Closest catalog options to review:';
      answer.append(intro);
      ranked.forEach(([p]) => {
        const link = document.createElement('a');
        link.className = 'text-button';
        link.href = `./product.html?product=${encodeURIComponent(p.id)}&lang=en`;
        link.textContent = `${p.name} →`;
        answer.append(link);
      });
      track('ai_consultant_used', { query_length: q.length });
    });
  }

  function setupChat() {
    const input = document.querySelector('#chatInput');
    const log = document.querySelector('#chatLog');
    const send = () => {
      const value = (input.value || '').trim(); if (!value) return;
      const user = document.createElement('p'); user.textContent = `You: ${value}`; log.append(user); input.value = '';
      const reply = document.createElement('p');
      reply.textContent = /price|cost|buy|order/i.test(value)
        ? 'CCCTrade: For a current quote, use the consultation form above and include the model and destination country.'
        : 'CCCTrade: Thanks. Your message is kept in this browser. For a human follow-up, copy this transcript and send it to the CCCTrade contact shown on the page.';
      log.append(reply); track('local_chat_message');
    };
    document.querySelector('#chatSend')?.addEventListener('click', send);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    document.querySelector('#chatCopy')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(log.innerText); } catch (_) {}
    });
  }

  function setupMotion() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = [...document.querySelectorAll('.product-card')];
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out', fill: 'both' });
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    items.forEach(item => observer.observe(item));
  }

  render();
  setupBooking();
  setupConsultant();
  setupChat();
  requestAnimationFrame(setupMotion);
  window.CCCTradeIntegrations = Object.freeze(integrations);
})();