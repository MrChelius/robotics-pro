# AGENTS.md

## What this is

Static storefront for ROBOTICS PRO (Unitree robots, reseller). Russian language. Hosted on GitHub Pages from the `main` branch root.

No build step, no bundler, no package manager. Pure HTML + CSS + vanilla JS.

## Files

- `index.html` — homepage, catalog, product features
- `product.html` — single product page (loads via `?product=<id>`)
- `script.js` — shared JS: cart (localStorage), search, drawers, mobile menu
- `style.css` — all shared styles
- `product.html` — also contains page-specific inline `<style>` and a full product data block in an inline `<script>` (specs, capabilities, use cases)
- `images/` — local images (e.g. `loona.jpg`)

## Architecture gotchas

- **Product data is duplicated.** `script.js:11-50` has a `PRODUCTS` object (id, name, price, image) for the cart and search. `product.html:1892+` has a separate, much larger `PRODUCTS` object with specs/capabilities/applications. These must be kept in sync when adding or modifying products.
- **Cart uses localStorage** key `robotics_pro_cart`. No server.
- **Add-to-cart is delegated.** All add buttons — including the product page button — are handled by a single delegated click listener on `[data-add-cart]` in `script.js`. The product page's inline script sets `data-add-cart` on the button (`product.html`). Do NOT add a second direct click handler on `[data-product-add]` — that caused a double-add bug (fixed).
- **Checkout goes through a manager** — the cart "checkout" button opens the contact drawer, not a payment flow.

## Editing rules

- When adding a new product, update `PRODUCTS` in **both** `script.js` and the inline script in `product.html`.
- Product page URL format: `product.html?product=<id>` (e.g. `?product=go2-air`).
- CSS for the product page lives inside `product.html` in a `<style>` tag — not in `style.css`.
- Contact links (Telegram, VK, email, phone) appear in multiple places: header, footer, contact drawer, mobile menu, product page. Update all of them if contacts change.
- The site uses Inter font from Google Fonts. Do not change the font without updating both HTML files.
- All user-facing text is in Russian.

## Deployment

Push to `main`. GitHub Pages serves from root (`/`). No build or deploy command needed.
