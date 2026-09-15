const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
const languages=['ru','en','zh','it','fr','de','ja','ko'];
for(const f of ['catalog.js','translations.js',...languages.slice(3).map(l=>`locales/${l}.js`),'localization.js','categories.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const rp=ctx.window.RP;
for(const lang of languages){
 assert.deepEqual(Object.keys(rp.ui[lang]).sort(),Object.keys(rp.ui.en).sort(),lang+' UI keys');
 function check(value){if(!value||typeof value!=='object')return;if('en'in value&&'ru'in value){assert.equal(typeof value[lang],'string');assert(value[lang].length);}else Object.values(value).forEach(check)}
 check(rp.products);check(rp.specs);
 assert.equal(rp.ui[lang].questions.length,4);assert.equal(rp.ui[lang].packageItems.length,4);
}
for(const category of Object.values(rp.categories))assert(fs.existsSync(path.join(root,category.path,'index.html')));
for(const p of rp.products){assert.equal(p.category,'robots');for(const img of p.images)assert(fs.existsSync(path.join(root,'images',img)))}
for(const file of ['index.html','product.html','technologies/robots/product.html','technologies/index.html',...Object.values(rp.categories).map(c=>c.path+'index.html')]){
 const s=fs.readFileSync(path.join(root,file),'utf8'),base=s.match(/<base href="([^"]+)"/),baseDir=path.resolve(root,path.dirname(file),base?base[1]:'.');
 for(const match of s.matchAll(/(?:src|href)="(\.\/[^"?]+)(?:\?[^" ]*)?"/g))assert(fs.existsSync(path.resolve(baseDir,match[1])),file+' '+match[1]);
}
console.log('PASS: complete UI/product/spec translations in eight languages; category pages and dependencies exist.');
