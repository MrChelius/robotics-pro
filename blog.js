(() => {
  'use strict';

  const grid = document.querySelector('#blogGrid');
  const status = document.querySelector('#blogStatus');

  function renderPost(post) {
    const article = document.createElement('article');
    article.className = 'product-card';
    const copy = document.createElement('div');
    copy.className = 'card-copy';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = new Date(`${post.date}T00:00:00`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
    const title = document.createElement('h3');
    title.textContent = post.title;
    const summary = document.createElement('p');
    summary.textContent = post.summary;
    const details = document.createElement('details');
    const more = document.createElement('summary');
    more.className = 'text-button';
    more.textContent = 'Read article';
    const body = document.createElement('p');
    body.textContent = post.body;
    details.append(more, body);
    copy.append(eyebrow, title, summary, details);
    article.append(copy);
    return article;
  }

  fetch('./content/blog-posts.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(posts => {
      posts
        .slice()
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .forEach(post => grid.append(renderPost(post)));
      status.textContent = `${posts.length} articles loaded.`;
    })
    .catch(() => {
      status.textContent = 'Blog content is temporarily unavailable.';
    });
})();