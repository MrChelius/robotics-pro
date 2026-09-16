const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('dji-products.js', 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const catalog = context.window.DJI_CATALOG;
assert(catalog && Array.isArray(catalog.products), 'DJI catalog must expose products');
assert.strictEqual(catalog.products.length, 10, 'DJI catalog must contain exactly 10 products');

const languages = ['ru','en','zh','it','fr','de','ja','ko'];
const ids = new Set();
for (const product of catalog.products) {
  assert(product.id && !ids.has(product.id), `Duplicate or missing product id: ${product.id}`);
  ids.add(product.id);
  assert(product.name, `${product.id}: missing name`);
  assert(Number.isFinite(product.price) && product.price > 0, `${product.id}: invalid price`);
  assert(product.source && /^https:\/\//.test(product.source), `${product.id}: invalid source URL`);
  assert(Array.isArray(product.images) && product.images.length >= 4 && product.images.length <= 5, `${product.id}: expected 4-5 gallery images`);
  assert(product.specs && Object.keys(product.specs).length >= 5, `${product.id}: insufficient specifications`);
  for (const key of ['tagline','description','use']) {
    assert(product[key] && typeof product[key] === 'object', `${product.id}: missing ${key}`);
    for (const language of languages) assert(product[key][language], `${product.id}: ${key} missing ${language}`);
  }
}

console.log(`DJI catalog OK: ${catalog.products.length} products, ${languages.length} languages, galleries validated.`);
