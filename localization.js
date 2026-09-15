/* Apply complete, local dictionaries before rendering. No translation service at runtime. */
(() => {
  const rp = window.RP;
  rp.languages = {ru:'Русский', en:'English', zh:'中文', it:'Italiano', fr:'Français', de:'Deutsch', ja:'日本語', ko:'한국어'};
  for (const [language, dictionary] of Object.entries(rp.locales)) {
    rp.ui[language] = dictionary.ui;
    const visit = value => {
      if (!value || typeof value !== 'object') return;
      if ('ru' in value && 'en' in value) {
        const translated = dictionary.catalog[value.en];
        if (typeof translated !== 'string') throw new Error(`Missing ${language} product translation: ${value.en}`);
        value[language] = translated;
      } else Object.values(value).forEach(visit);
    };
    visit(rp.products);
    visit(rp.specs);
  }
})();
