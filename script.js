(() => {
  "use strict";
  const { products, ui, specs } = window.RP;
  // HTML templates stay readable and keep product data in one place.
  const html = String.raw;
  const $ = (s) => document.querySelector(s);
  const esc = (v) =>
    String(v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const get = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Browsing remains available without storage. */
    }
  };
  const initial =
    new URLSearchParams(location.search).get("lang") ||
    get("robotics_pro_language", "ru");
  let lang = ["ru", "en", "zh"].includes(initial) ? initial : "ru";
  const t = (v) => (typeof v === "object" ? v[lang] || v.ru : v);
  let words = ui[lang],
    filter = "all",
    query = "",
    selected = get("robotics_pro_compare", []);
  if (!Array.isArray(selected)) selected = [];
  selected = [...new Set(selected)]
    .filter((id) => products.some((p) => p.id === id))
    .slice(0, 3);
  let stored = get("robotics_pro_cart", []);
  let cart = Array.isArray(stored)
    ? stored
        .filter(
          (x) =>
            x &&
            products.some((p) => p.id === x.id) &&
            Number.isFinite(x.quantity) &&
            x.quantity > 0,
        )
        .map((x) => ({
          id: x.id,
          quantity: Math.min(99, Math.floor(x.quantity)),
        }))
    : [];
  const money = (v) =>
    new Intl.NumberFormat({ ru: "ru-RU", en: "en-US", zh: "zh-CN" }[lang], {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(v);
  const productId = new URLSearchParams(location.search).get("product");
  const isProduct = location.pathname.endsWith("product.html");
  const product = products.find((p) => p.id === productId);
  const href = (p) => `./product.html?product=${p.id}&lang=${lang}`;
  const home = (hash) => `./index.html?lang=${lang}${hash || ""}`;
  const img = (p, i = 0, extra = "") =>
    `<img src="./images/${p.images[i]}" alt="${esc(p.name)} — ${words.photo} ${i + 1}" width="1600" height="1000" ${extra}>`;
  let photoIndex = 0,
    toastTimer;
  function toast(text) {
    $("#toast").textContent = text;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      2800,
    );
  }
  function office() {
    return html`<div class="office">
      <span class="eyebrow">${words.office}</span><strong>Yiwu, China</strong>
      <p>${words.officeText}</p>
    </div>`;
  }
  function contacts() {
    return `${office()}<div class="contact-links">${[
      ["Telegram", "@CheliUsNick"],
      ["VK", "1031496517"],
      [words.email, "helloitisnick@gmail.com"],
      [words.phone, "+7 952 082-45-39"],
    ]
      .map(
        ([label, value]) =>
          `<div class="contact-row"><div><small>${label}</small><strong>${value}</strong></div><button class="copy-contact" data-copy-value="${value}" aria-label="${words.copyContact}: ${value}">${words.copyContact}</button></div>`,
      )
      .join("")}</div><p class="muted">${words.contactLocal}</p>`;
  }

  function header() {
    return html`<a class="skip" href="#main">${words.skip}</a>
      <header class="site-header">
        <a class="brand" href="${home()}"><span>CCCTrade</span></a>
        <nav class="desktop-nav" aria-label="${words.menu}">
          <a href="${home("#all-products")}">${words.catalog}</a
          ><a href="${home("#compare")}">${words.compare}</a
          ><a href="${home("#about")}">${words.about}</a>
        </nav>
        <div class="header-tools">
          <label class="language"
            ><span aria-hidden="true">◎</span
            ><select id="language" aria-label="${words.language}">
              <option value="ru" ${lang === "ru" ? "selected" : ""}>RU</option>
              <option value="en" ${lang === "en" ? "selected" : ""}>EN</option>
              <option value="zh" ${lang === "zh" ? "selected" : ""}>
                中文
              </option>
            </select></label
          ><button class="cart-button" data-cart aria-label="${words.cart}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 8h14l1 13H4L5 8ZM8 8V6a4 4 0 0 1 8 0v2" /></svg
            ><span id="cartCount"
              >${cart.reduce((n, x) => n + x.quantity, 0)}</span
            ></button
          ><button class="button small desktop-contact" data-contact>
            ${words.contact}<span>↗</span></button
          ><button class="menu-button" data-menu aria-label="${words.menu}">
            ☰
          </button>
        </div>
      </header>`;
  }
  function card(p) {
    return html`<article class="product-card">
      <a href="${href(p)}" class="card-image"
        >${img(p, 0, 'loading="lazy"')}<span
          class="round-arrow"
          aria-hidden="true"
          >↗</span
        ></a
      >
      <div class="card-copy">
        <span class="eyebrow">${words[p.group]}</span>
        <h3><a href="${href(p)}">${p.name}</a></h3>
        <p>${esc(t(p.description))}</p>
        <div class="card-stats">
          ${p.highlights
            .slice(0, 2)
            .map(([v, k]) => html`<span><b>${v}</b>${t(k)}</span>`)
            .join("")}
        </div>
        <div class="card-bottom">
          <span
            ><small>${words.from}</small
            ><strong>${money(p.price)}</strong></span
          ><button
            class="compare-toggle ${selected.includes(p.id) ? "selected" : ""}"
            data-compare="${p.id}"
            aria-pressed="${selected.includes(p.id)}"
          >
            ${selected.includes(p.id) ? "✓" : "+"}
            ${selected.includes(p.id) ? words.compared : words.compareAdd}
          </button>
        </div>
      </div>
    </article>`;
  }
  function homePage() {
    return html`<section class="hero" id="professional">
        <div class="hero-copy">
          <span class="eyebrow"><i></i>${words.heroLabel}</span>
          <h1>${words.heroTitle}</h1>
          <p>${words.heroText}</p>
          <div class="actions">
            <a class="button" href="#all-products"
              >${words.explore}<span>↗</span></a
            ><button class="text-button" data-contact>
              ${words.consult}<span>→</span>
            </button>
          </div>
          <div class="hero-foot">
            <span>CCCTrade · Yiwu, China</span><span>01 — 05</span>
          </div>
        </div>
        <a
          class="hero-visual"
          href="${href(products[1])}"
          aria-label="Unitree R1"
          ><span class="visual-index">R1.</span
          ><img
            src="./images/r1-cover.webp"
            alt="Unitree R1"
            width="1000"
            height="1000"
            fetchpriority="high"
          /><span class="hero-caption">${words.heroCaption}<b>↗</b></span></a
        >
      </section>
      <div class="brand-strip">
        <span>UNITREE ROBOTICS</span><span>HUMANOID</span><span>QUADRUPED</span
        ><span>KEYi TECH</span><span>AI COMPANION</span>
      </div>
      <section class="section catalog" id="all-products">
        <div class="section-heading">
          <div>
            <span class="eyebrow">01 / ${words.catalog}</span>
            <h2>${words.intro}</h2>
          </div>
          <p>${words.introText}</p>
        </div>
        <div class="catalog-tools">
          <div class="filters" role="group" aria-label="${words.catalog}">
            ${["all", "humanoid", "quadruped", "companion"]
              .map(
                (k) =>
                  html`<button
                    data-filter="${k}"
                    class="${filter === k ? "active" : ""}"
                    aria-pressed="${filter === k}"
                  >
                    ${words[k]}
                  </button>`,
              )
              .join("")}
          </div>
          <label class="search"
            ><span aria-hidden="true">⌕</span
            ><input
              type="search"
              id="search"
              placeholder="${words.search}"
              aria-label="${words.search}"
              value="${esc(query)}"
          /></label>
        </div>
        <div id="catalogGrid" class="catalog-grid"></div>
        <p class="muted catalog-note">${words.priceNote}</p>
      </section>
      <section class="section comparison-section" id="compare">
        <div class="section-heading">
          <div>
            <span class="eyebrow">02 / ${words.compare}</span>
            <h2>${words.compareTitle}</h2>
          </div>
          <p>${words.compareText}</p>
        </div>
        <div id="comparison"></div>
      </section>
      <section class="section about" id="about">
        <div class="about-visual">
          <img
            src="./images/go2-cover.webp"
            alt="Unitree Go2"
            width="1000"
            height="900"
            loading="lazy"
          /><span>CCCTrade · Yiwu, China</span>
        </div>
        <div class="about-copy">
          <span class="eyebrow">03 / CCCTrade</span>
          <h2>${words.aboutTitle}</h2>
          <p>${words.aboutText}</p>
          ${office()}
          <div class="steps">
            ${words.steps
              .map(
                ([a, b], i) =>
                  html`<div>
                    <span>0${i + 1}</span>
                    <div>
                      <h3>${a}</h3>
                      <p>${b}</p>
                    </div>
                  </div>`,
              )
              .join("")}
          </div>
        </div>
      </section>
      <section class="section faq">
        <div>
          <span class="eyebrow">04 / FAQ</span>
          <h2>${words.faq}</h2>
        </div>
        <div>
          ${words.questions
            .map(
              ([q, a]) =>
                html`<details>
                  <summary>${q}<span>+</span></summary>
                  <p>${a}</p>
                </details>`,
            )
            .join("")}
        </div>
      </section>
      ${cta()}`;
  }
  function cta() {
    return html`<section class="cta">
      <div>
        <span class="eyebrow">CCCTrade · Yiwu, China</span>
        <h2>${words.ctaTitle}</h2>
        <p>${words.ctaText}</p>
      </div>
      <button class="button light" data-contact>
        ${words.contact}<span>↗</span>
      </button>
    </section>`;
  }
  function productPage() {
    if (!product)
      return html`<section class="section not-found">
        <span class="eyebrow">404</span>
        <h1>${words.notFound}</h1>
        <p>${words.notFoundText}</p>
        <a class="button" href="${home("#all-products")}"
          >${words.goCatalog} →</a
        >
      </section>`;
    const p = product;
    return html`<section class="product-top section">
        <nav class="breadcrumb">
          <a href="${home("#all-products")}">${words.catalog}</a><span>/</span
          ><span>${p.name}</span>
        </nav>
        <div class="product-layout">
          <div class="gallery">
            <div class="gallery-stage">
              <div
                class="gallery-track"
                id="galleryTrack"
                tabindex="0"
                role="region"
                aria-label="${words.gallery}"
              >
                ${p.images
                  .map(
                    (_, i) =>
                      html`<div
                        class="gallery-slide"
                        role="group"
                        aria-label="${words.photo} ${i + 1} / ${p.images
                          .length}"
                      >
                        ${img(
                          p,
                          i,
                          `${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} draggable="false"`,
                        )}
                      </div>`,
                  )
                  .join("")}
              </div>
              <button
                class="gallery-arrow previous"
                data-step="-1"
                aria-label="${words.prev}"
              >
                ‹</button
              ><button
                class="gallery-arrow next"
                data-step="1"
                aria-label="${words.next}"
              >
                ›</button
              ><button
                class="gallery-expand"
                data-zoom
                aria-label="${words.zoom}"
              >
                ⤢</button
              ><span
                class="gallery-counter"
                id="galleryCount"
                aria-live="polite"
                >${photoIndex + 1} / ${p.images.length}</span
              >
            </div>
            <p class="swipe-hint">${words.swipe}</p>
            <div class="thumbnails" aria-label="${words.gallery}">
              ${p.images
                .map(
                  (_, i) =>
                    html`<button
                      data-photo="${i}"
                      aria-label="${words.photo} ${i + 1}"
                      aria-pressed="${i === photoIndex}"
                    >
                      ${img(p, i, 'loading="lazy"')}
                    </button>`,
                )
                .join("")}
            </div>
            <p class="muted">${words.galleryNote}</p>
          </div>
          <div class="product-info">
            <span class="eyebrow"
              >${words[p.group]} /
              ${p.source.includes("unitree") ? "UNITREE" : "KEYi TECH"}</span
            >
            <h1>${p.name}</h1>
            <h2>${t(p.tagline)}</h2>
            <p class="lead">${t(p.description)}</p>
            <div class="metrics">
              ${p.highlights
                .map(
                  ([v, l]) =>
                    html`<div><strong>${v}</strong><span>${t(l)}</span></div>`,
                )
                .join("")}
            </div>
            <div class="price-block">
              <div>
                <small>${words.from}</small><strong>${money(p.price)}</strong>
              </div>
              <span class="availability">${words.stock}</span>
            </div>
            <div class="actions">
              <button class="button" data-add="${p.id}">
                ${words.add}<span>+</span></button
              ><button class="text-button" data-contact>${words.ask} →</button>
            </div>
            <p class="muted">${words.priceNote}</p>
          </div>
        </div>
      </section>
      <nav class="product-tabs">
        <a href="#overview">${words.overview}</a
        ><a href="#specifications">${words.specifications}</a
        ><a href="#applications">${words.applications}</a>
      </nav>
      <section class="section product-overview" id="overview">
        <div>
          <span class="eyebrow">01 / ${words.overview}</span>
          <h2>${t(p.tagline)}</h2>
        </div>
        <div>
          ${p.paragraphs.map((x) => html`<p>${t(x)}</p>`).join("")}
          <div class="feature-list">
            ${p.features.map((x) => html`<span>↗ ${t(x)}</span>`).join("")}
          </div>
        </div>
      </section>
      <section class="section specifications" id="specifications">
        <div>
          <span class="eyebrow">02 / ${words.specifications}</span>
          <h2>${words.specifications}</h2>
          <p class="spec-note">${words.specLocal}</p>
          <p class="muted">${words.sourceNote}</p>
        </div>
        <table>
          <caption class="sr-only">
            ${p.name} — ${words.specifications}
          </caption>
          <tbody>
            ${p.specs
              .map(
                ([k, v]) =>
                  html`<tr>
                    <th scope="row">${t(specs[k])}</th>
                    <td>${t(v)}</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </section>
      <section class="section applications" id="applications">
        <div>
          <span class="eyebrow">03 / ${words.applications}</span>
          <h2>${words.applications}</h2>
          <p>${t(p.fit)}</p>
          <button class="button" data-contact>${words.consult} ↗</button>
        </div>
        ${img(p, 2, 'loading="lazy"')}
      </section>
      <section class="section configuration-guide">
        <span class="eyebrow">CCCTrade / Yiwu, China</span>
        <h2>${words.packageTitle}</h2>
        <div class="guide-grid">
          ${(p.group === "companion"
            ? words.companionPackageItems
            : words.packageItems
          )
            .map(
              ([title, text], i) =>
                html`<article class="guide-item">
                  <span>0${i + 1}</span>
                  <h3>${title}</h3>
                  <p>${text}</p>
                </article>`,
            )
            .join("")}
        </div>
      </section>
      <section class="section">
        <div class="section-heading">
          <h2>${words.related}</h2>
          <a href="${home("#all-products")}">${words.all} ↗</a>
        </div>
        <div class="catalog-grid related">
          ${products
            .filter((x) => x.id !== p.id)
            .slice(0, 3)
            .map(card)
            .join("")}
        </div>
      </section>
      ${cta()}`;
  }
  function renderCatalog() {
    const matches = products.filter(
      (p) =>
        (filter === "all" || p.group === filter) &&
        `${p.name} ${t(p.description)} ${words[p.group]}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    );
    $("#catalogGrid").innerHTML = matches.length
      ? matches.map(card).join("")
      : `<div class="empty"><p>${words.emptySearch}</p><button class="button" data-reset>${words.reset}</button></div>`;
  }
  function renderCompare() {
    const el = $("#comparison");
    if (!el) return;
    const ps = selected.map((id) => products.find((p) => p.id === id));
    el.innerHTML = ps.length
      ? `<div class="table-scroll" tabindex="0" role="region" aria-label="${words.compare}"><table class="compare-table"><caption class="sr-only">${words.compare}</caption><thead><tr><th scope="col">${words.parameter}</th>${ps.map((p) => html`<th scope="col"><a href="${href(p)}">${p.name} ↗</a><button data-compare="${p.id}" aria-label="${words.remove} ${p.name}">×</button></th>`).join("")}</tr></thead><tbody><tr><th scope="row">${words.type}</th>${ps.map((p) => html`<td>${words[p.group]}</td>`).join("")}</tr>${[
          "weight",
          "height",
          "speed",
          "runtime",
          "vision",
          "dev",
        ]
          .map(
            (k) =>
              html`<tr>
                <th scope="row">${t(specs[k])}</th>
                ${ps
                  .map(
                    (p) =>
                      html`<td>
                        ${t(p.specs.find((x) => x[0] === k)?.[1] || "—")}
                      </td>`,
                  )
                  .join("")}
              </tr>`,
          )
          .join(
            "",
          )}<tr><th scope="row">${words.price}</th>${ps.map((p) => html`<td>${money(p.price)}</td>`).join("")}</tr></tbody></table></div><button class="text-button" data-clear-compare>${words.clearCompare} ×</button>`
      : `<div class="compare-empty"><span>＋</span><p>${words.chooseCompare}</p><a class="text-button" href="#all-products">${words.goCatalog} ↑</a></div>`;
  }
  function orderText() {
    return (
      words.order +
      "\n" +
      cart
        .map((x) => {
          const p = products.find((p) => p.id === x.id);
          return `${p.name} × ${x.quantity} — ${money(p.price * x.quantity)}`;
        })
        .join("\n")
    );
  }
  function renderCart() {
    const total = cart.reduce(
      (sum, x) => sum + products.find((p) => p.id === x.id).price * x.quantity,
      0,
    );
    $("#cartContent").innerHTML = cart.length
      ? `<p>${words.cartText}</p><div class="cart-items">${cart
          .map((x) => {
            const p = products.find((p) => p.id === x.id);
            return html`<article class="cart-item">
              ${img(p, 0)}
              <div>
                <h3>${p.name}</h3>
                <span>${money(p.price)}</span>
                <div class="quantity">
                  <button
                    data-quantity="${x.id}"
                    data-delta="-1"
                    aria-label="${words.less}"
                  >
                    −</button
                  ><span>${x.quantity}</span
                  ><button
                    data-quantity="${x.id}"
                    data-delta="1"
                    aria-label="${words.more}"
                    ${x.quantity >= 99 ? "disabled" : ""}
                  >
                    +</button
                  ><button data-remove="${x.id}" class="remove">
                    ${words.remove}
                  </button>
                </div>
              </div>
            </article>`;
          })
          .join(
            "",
          )}</div><div class="cart-total"><span>${words.total}</span><strong>${money(total)}</strong></div><p class="muted">${words.priceNote}</p><button class="button full" data-checkout>${words.checkout} ↗</button><button class="text-button" data-copy>${words.copy}</button>`
      : `<div class="empty"><p>${words.emptyCart}</p><a class="button" href="${home("#all-products")}">${words.goCatalog} →</a></div>`;
    $("#cartCount").textContent = cart.reduce((n, x) => n + x.quantity, 0);
  }
  function dialogs() {
    return html`<dialog
        id="contactDialog"
        class="drawer"
        aria-labelledby="contactTitle"
      >
        <button class="dialog-close" data-close aria-label="${words.close}">
          ×</button
        ><span class="eyebrow">CCCTrade / CONTACT</span>
        <h2 id="contactTitle">${words.contactTitle}</h2>
        <p>${words.contactText}</p>
        <pre id="orderSummary" hidden></pre>
        <button class="text-button" id="copySummary" data-copy hidden>
          ${words.copy}</button
        >${contacts()}
      </dialog>
      <dialog id="cartDialog" class="drawer" aria-labelledby="cartTitle">
        <button class="dialog-close" data-close aria-label="${words.close}">
          ×
        </button>
        <h2 id="cartTitle">${words.cart}</h2>
        <div id="cartContent"></div>
      </dialog>
      <dialog
        id="menuDialog"
        class="drawer menu-dialog"
        aria-label="${words.menu}"
      >
        <button class="dialog-close" data-close aria-label="${words.close}">
          ×</button
        ><strong>CCCTrade</strong>
        <nav>
          ${[
            ["catalog", "#all-products"],
            ["compare", "#compare"],
            ["about", "#about"],
          ]
            .map(([k, h]) => html`<a href="${home(h)}">${words[k]} ↗</a>`)
            .join("")}
        </nav>
        <button class="button" data-contact>${words.contact}</button>
      </dialog>
      <dialog id="photoDialog" class="lightbox" aria-label="${words.gallery}">
        <button class="dialog-close" data-close aria-label="${words.close}">
          ×</button
        ><img
          id="zoomPhoto"
          alt=""
          src="./images/${product?.images[0] || "g1-0.webp"}"
        />
        <div class="lightbox-controls">
          <button data-step="-1" aria-label="${words.prev}">←</button
          ><span id="photoCount"></span
          ><button data-step="1" aria-label="${words.next}">→</button>
        </div>
      </dialog>`;
  }
  function render() {
    document.body.classList.remove("lock-scroll");
    clearTimeout(toastTimer);
    $("#toast").classList.remove("visible");
    words = ui[lang];
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.title = isProduct
      ? `${product?.name || words.notFound} — CCCTrade`
      : `CCCTrade — ${words.catalog}`;
    document.querySelector('meta[name="description"]').content = product
      ? t(product.description)
      : words.heroText;
    $("#app").innerHTML =
      header() +
      `<main id="main">${isProduct ? productPage() : homePage()}</main><footer><a class="brand" href="${home()}"><span>CCCTrade</span></a><p>${words.footer}</p><div><button class="footer-contact" data-contact>${words.contact}</button><span class="footer-office">${words.office}: Yiwu, China</span><span>© ${new Date().getFullYear()} CCCTrade</span></div></footer>${dialogs()}`;
    if (!isProduct) {
      renderCatalog();
      renderCompare();
    }
    renderCart();
    initGallery();
    document.querySelectorAll("dialog").forEach((d) => {
      d.addEventListener("close", () => {
        if (!document.querySelector("dialog[open]"))
          document.body.classList.remove("lock-scroll");
      });
      d.addEventListener("click", (e) => {
        if (e.target === d) {
          const r = d.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            d.close();
        }
      });
    });
  }
  function open(id) {
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    $(id).showModal();
    document.body.classList.add("lock-scroll");
  }
  function showPhoto(scroll = true) {
    if (!product) return;
    const track = $("#galleryTrack");
    if (scroll && track)
      track.scrollTo({
        left: photoIndex * track.clientWidth,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    document
      .querySelectorAll("[data-photo]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", Number(b.dataset.photo) === photoIndex),
      );
    $("#galleryCount").textContent =
      `${photoIndex + 1} / ${product.images.length}`;
    $("#zoomPhoto").src = "./images/" + product.images[photoIndex];
    $("#zoomPhoto").alt = `${product.name} — ${words.photo} ${photoIndex + 1}`;
    $("#photoCount").textContent =
      `${photoIndex + 1} / ${product.images.length}`;
  }
  function initGallery() {
    const track = $("#galleryTrack");
    if (!track || !product) return;
    // Native horizontal scrolling supports touch and trackpads, with CSS snap points.
    track.scrollLeft = photoIndex * track.clientWidth;
    let frame;
    track.addEventListener(
      "scroll",
      () => {
        clearTimeout(frame);
        frame = setTimeout(() => {
          const next = Math.round(track.scrollLeft / track.clientWidth);
          if (next !== photoIndex) {
            photoIndex = Math.max(0, Math.min(product.images.length - 1, next));
            showPhoto(false);
          }
        }, 100);
      },
      { passive: true },
    );
    // Mouse dragging supplements native touch without blocking vertical page scrolling.
    let start = null;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      start = { x: e.clientX, left: track.scrollLeft };
      track.setPointerCapture(e.pointerId);
      track.classList.add("dragging");
    });
    track.addEventListener("pointermove", (e) => {
      if (!start) return;
      track.scrollLeft = start.left + start.x - e.clientX;
    });
    const end = () => {
      if (!start) return;
      start = null;
      track.classList.remove("dragging");
      photoIndex = Math.round(track.scrollLeft / track.clientWidth);
      showPhoto();
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    let touchStart = null;
    const zoom = $("#zoomPhoto");
    zoom.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1)
          touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      },
      { passive: true },
    );
    zoom.addEventListener(
      "touchend",
      (e) => {
        if (!touchStart) return;
        const dx = e.changedTouches[0].clientX - touchStart.x,
          dy = e.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          photoIndex =
            (photoIndex + (dx < 0 ? 1 : -1) + product.images.length) %
            product.images.length;
          showPhoto();
        }
      },
      { passive: true },
    );
    showPhoto(false);
  }

  document.addEventListener("change", (e) => {
    if (e.target.id === "language") {
      lang = e.target.value;
      save("robotics_pro_language", lang);
      const url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
      render();
      $("#language").focus();
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "search") {
      query = e.target.value;
      renderCatalog();
    }
  });
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.copyValue) {
      try {
        await navigator.clipboard.writeText(b.dataset.copyValue);
        toast(words.copied);
      } catch {
        toast(words.copyFail);
      }
      return;
    }
    if (b.hasAttribute("data-close")) {
      b.closest("dialog").close();
      return;
    }
    if (b.hasAttribute("data-cart")) {
      renderCart();
      open("#cartDialog");
    }
    if (b.hasAttribute("data-contact")) {
      $("#orderSummary").hidden = true;
      $("#copySummary").hidden = true;
      open("#contactDialog");
    }
    if (b.hasAttribute("data-menu")) open("#menuDialog");
    if (b.hasAttribute("data-checkout")) {
      $("#orderSummary").textContent = orderText();
      $("#orderSummary").hidden = false;
      $("#copySummary").hidden = false;
      open("#contactDialog");
    }
    if (b.hasAttribute("data-copy")) {
      try {
        await navigator.clipboard.writeText(orderText());
        toast(words.copied);
      } catch {
        toast(words.copyFail);
        $("#orderSummary").textContent = orderText();
        $("#orderSummary").hidden = false;
        $("#copySummary").hidden = false;
        open("#contactDialog");
      }
    }
    if (b.dataset.filter) {
      filter = b.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((x) => {
        x.classList.toggle("active", x.dataset.filter === filter);
        x.setAttribute("aria-pressed", x.dataset.filter === filter);
      });
      renderCatalog();
    }
    if (b.hasAttribute("data-reset")) {
      filter = "all";
      query = "";
      $("#search").value = "";
      document.querySelectorAll("[data-filter]").forEach((x) => {
        x.classList.toggle("active", x.dataset.filter === "all");
        x.setAttribute("aria-pressed", x.dataset.filter === "all");
      });
      renderCatalog();
      $("#search").focus();
    }
    if (b.hasAttribute("data-clear-compare")) {
      selected = [];
      save("robotics_pro_compare", selected);
      renderCompare();
      renderCatalog();
    }
    if (b.dataset.compare) {
      const id = b.dataset.compare;
      if (selected.includes(id)) selected = selected.filter((x) => x !== id);
      else if (selected.length < 3) selected.push(id);
      else {
        toast(words.maxCompare);
        return;
      }
      save("robotics_pro_compare", selected);
      renderCompare();
      document.querySelectorAll("[data-compare]").forEach((x) => {
        if (x.classList.contains("compare-toggle")) {
          const yes = selected.includes(x.dataset.compare);
          x.classList.toggle("selected", yes);
          x.setAttribute("aria-pressed", yes);
          x.textContent = `${yes ? "✓" : "+"} ${yes ? words.compared : words.compareAdd}`;
        }
      });
    }
    if (b.dataset.add) {
      const id = b.dataset.add;
      if (!products.some((p) => p.id === id)) return;
      const existing = cart.find((x) => x.id === id);
      if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
      else cart.push({ id, quantity: 1 });
      save("robotics_pro_cart", cart);
      renderCart();
      toast(words.added);
    }
    if (b.dataset.quantity) {
      const x = cart.find((x) => x.id === b.dataset.quantity);
      if (x) x.quantity = Math.min(99, x.quantity + Number(b.dataset.delta));
      cart = cart.filter((x) => x.quantity > 0);
      save("robotics_pro_cart", cart);
      renderCart();
      const next = document.querySelector(
        `[data-quantity="${b.dataset.quantity}"][data-delta="${b.dataset.delta}"]`,
      );
      (next || $("#cartDialog .dialog-close")).focus();
    }
    if (b.dataset.remove) {
      cart = cart.filter((x) => x.id !== b.dataset.remove);
      save("robotics_pro_cart", cart);
      renderCart();
    }
    if (b.hasAttribute("data-photo")) {
      photoIndex = Number(b.dataset.photo);
      showPhoto();
    }
    if (b.hasAttribute("data-zoom")) {
      showPhoto();
      open("#photoDialog");
    }
    if (b.dataset.step && product) {
      photoIndex =
        (photoIndex + Number(b.dataset.step) + product.images.length) %
        product.images.length;
      showPhoto();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      product &&
      ($("#photoDialog")?.open || e.target.closest?.(".gallery")) &&
      ["ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
      photoIndex =
        (photoIndex +
          (e.key === "ArrowRight" ? 1 : -1) +
          product.images.length) %
        product.images.length;
      showPhoto();
    }
  });
  window.addEventListener("resize", () => {
    const track = $("#galleryTrack");
    if (track) track.scrollLeft = photoIndex * track.clientWidth;
  });
  render();
  // Preserve category deep links from the previous site.
  const legacy = {
    humanoid: "humanoid",
    quadruped: "quadruped",
    companion: "companion",
  };
  if (!isProduct && legacy[location.hash.slice(1)]) {
    filter = legacy[location.hash.slice(1)];
    render();
    requestAnimationFrame(() => $("#all-products").scrollIntoView());
  } else if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
})();
