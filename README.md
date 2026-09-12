# ROBOTICS PRO

Static multilingual robot catalog. Hosted by GitHub Pages from `main`, repository root. No build step or package installation.

## Files
- `index.html` / `product.html`: shared HTML shell, metadata and existing GA4 integration.
- `catalog.js`: single catalog for all five models, prices, local galleries and RU/EN/ZH descriptions.
- `translations.js`: complete Russian, English and Simplified Chinese interface dictionaries.
- `script.js`: rendering, filters, search, up to three comparison columns, local cart, native dialogs and image gallery.
- `style.css`: responsive design, keyboard focus states, reduced-motion support.
- `SOURCES.md`: manufacturer references and photo provenance.

Run `python3 -m http.server 8765` and open `http://localhost:8765`.

Product URLs remain `product.html?product=g1` (also `r1`, `go2-air`, `go2-pro`, `loona`). Optional `lang=ru|en|zh` overrides the saved language. Prices remain in RUB in all languages.

Cart key `robotics_pro_cart` is preserved. Old cart entries are migrated to current catalog prices and local images. Additional keys: `robotics_pro_language`, `robotics_pro_compare`. No online payment; customers contact the manager to confirm an order. Contact buttons never automatically send a message.

## Content maintenance
Update products only in `catalog.js`; keep all three languages complete. Prices were preserved from the previous site. Availability and final configuration require manager confirmation. Manufacturer specifications were checked on 2026-09-12. Air/Pro/base humanoid capabilities must not be conflated with EDU features.

## Validation (2026-09-12)
- JavaScript syntax and catalog/dictionary/asset validation.
- Desktop and 390 px mobile visual checks.
- Language switching, preserved query parameters and reload persistence.
- Quadruped filter and Air/Pro comparison.
- Add-to-cart single increment, quantity update and reload persistence.
- Gallery selection, zoom and next-photo controls.
- Native mobile menu and contact dialogs.

Deploy with `git push origin main`; GitHub Pages publishes the root.
