# CCCTrade

Static HTML/CSS/vanilla JavaScript storefront, GitHub Pages from `main` root. No build step.

- `catalog.js` is the single product-data source for product pages, cart, comparison and search. Do not duplicate prices or product objects elsewhere.
- `translations.js` contains RU/EN/ZH UI dictionaries. Update all languages when changing copy.
- `index.html` and `product.html` load the same catalog and app. Product URL contract: `product.html?product=<id>&lang=<optional-language>`.
- `script.js` handles one delegated click listener. Do not attach a second add-to-cart handler.
- Keep existing cart key `robotics_pro_cart` compatible. Validate storage and tolerate unavailable localStorage.
- Checkout opens manager contacts, never a payment flow. Do not automatically send messages.
- Galleries support native horizontal touch scrolling, mouse dragging, buttons and keyboard navigation. Product galleries use local WebP assets; record image provenance in `SOURCES.md`.
- Keep manufacturer model/configuration distinctions (especially Air/Pro vs EDU).
- Preserve contact details and GA4 unless explicitly asked to change them. Contacts must be displayed/copied locally; do not link to external websites or applications.
- All CSS is in `style.css`, including product-page styles.
- Before deployment, check language switching, cart persistence, galleries, filters, comparison, mobile layout and missing assets.

- Brand: CCCTrade. Office: Yiwu, China. Keep this information consistent in all languages.
- Use system fonts; do not add remote font dependencies.
