const fs = require("fs"),
  vm = require("vm"),
  assert = require("assert");
const dir = require("path").resolve(__dirname, "..") + "/";
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["catalog.js", "translations.js"])
  vm.runInContext(fs.readFileSync(dir + f, "utf8"), ctx);
const { products, ui } = ctx.window.RP;
assert.equal(products.length, 5);
assert.equal(new Set(products.map((p) => p.id)).size, 5);
for (const lang of ["ru", "en", "zh"]) {
  assert.deepEqual(Object.keys(ui[lang]).sort(), Object.keys(ui.ru).sort());
  for (const p of products) {
    for (const k of ["tagline", "description", "fit"]) assert(p[k][lang]);
    assert(p.paragraphs.every((v) => v[lang]));
    assert(p.images.length >= 4);
    for (const file of p.images)
      assert(fs.existsSync(dir + "images/" + file), file);
  }
}
console.log(
  "PASS: five unique products; matching RU/EN/ZH keys; translated descriptions; all gallery files exist.",
);

for (const lang of ["ru", "en", "zh"]) {
  assert(ui[lang].office);
  assert(ui[lang].swipe);
  assert(ui[lang].aboutText.includes("CCCTrade"));
}
const source = fs.readFileSync(dir + "script.js", "utf8");
assert(
  !/href=["'](?:https?:|mailto:|tel:)/.test(source),
  "No external navigation in templates",
);
assert(!source.includes("ROBOTICS PRO"), "No obsolete brand");
assert(
  !source.includes('href="${p.source}"'),
  "Manufacturer URLs are not navigation targets",
);
console.log(
  "PASS: CCCTrade brand, office and swipe translations; no external navigation templates.",
);
