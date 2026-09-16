(() => {
  'use strict';

  const products = window.DJI_CATALOG?.products || [];
  const supported = ['ru','en','zh','it','fr','de','ja','ko'];
  const languageNames = {ru:'Русский',en:'English',zh:'中文',it:'Italiano',fr:'Français',de:'Deutsch',ja:'日本語',ko:'한국어'};
  const wordsByLang = {
    ru:{technology:'Технологии',robots:'Роботы',drones:'Дроны и БПЛА',partners:'Партнёры',news:'Новости',title:'Дроны и БПЛА DJI',hero:'Подборка из 10 моделей DJI — от компактных дронов для съёмки до профессиональных, промышленных и аграрных платформ.',catalog:'Каталог DJI',catalogText:'Сравнивайте назначение, характеристики и ориентировочные цены российского рынка.',market:'Цены для рынка России',marketText:'Указаны ориентировочные стартовые цены. Итоговая стоимость зависит от комплектации, курса, наличия, доставки и условий поставки.',from:'от',details:'Подробнее',request:'Запросить поставку',back:'Назад к дронам',overview:'Описание',specs:'Характеристики',use:'Применение',weight:'Масса',camera:'Камера',video:'Видео',flight:'Полёт',range:'Передача',protection:'Системы / защита',payload:'Полезная нагрузка',availability:'Цена и наличие подтверждаются перед заказом.',contactTitle:'Подберём комплектацию и поставку',contactText:'CCCTrade работает из Иу, Китай. Сообщите модель и желаемую комплектацию — подтвердим цену, наличие и варианты поставки.',copy:'Копировать контакты',copied:'Скопировано',priceNote:'Ориентировочная цена для российского рынка, не публичная оферта.',photo:'Фото',source:'Источник характеристик',all:'Все модели',compact:'Компактные',creator:'Для съёмки',fpv:'FPV',professional:'Профессиональные',enterprise:'Enterprise',cinema:'Кино',agriculture:'Агро',model:'Модель',gallery:'Галерея',previous:'Предыдущее фото',next:'Следующее фото',imageUnavailable:'Изображение временно недоступно',models:'10 моделей',office:'Офис',contact:'Контакты'},
    en:{technology:'Technology',robots:'Robots',drones:'Drones & UAVs',partners:'Partners',news:'News',title:'DJI Drones & UAVs',hero:'A curated range of 10 DJI models — from compact creator drones to professional, enterprise and agricultural platforms.',catalog:'DJI catalog',catalogText:'Compare use cases, specifications and indicative Russian-market pricing.',market:'Russia-market pricing',marketText:'Prices are indicative starting points. Final cost depends on configuration, exchange rates, stock, delivery and supply terms.',from:'from',details:'View details',request:'Request supply',back:'Back to drones',overview:'Overview',specs:'Specifications',use:'Applications',weight:'Weight',camera:'Camera',video:'Video',flight:'Flight',range:'Transmission',protection:'Systems / protection',payload:'Payload',availability:'Price and availability are confirmed before ordering.',contactTitle:'We will configure and source your drone',contactText:'CCCTrade operates from Yiwu, China. Send the model and desired configuration and we will confirm pricing, stock and supply options.',copy:'Copy contacts',copied:'Copied',priceNote:'Indicative Russian-market price, not a public offer.',photo:'Photo',source:'Specification source',all:'All models',compact:'Compact',creator:'Creator',fpv:'FPV',professional:'Professional',enterprise:'Enterprise',cinema:'Cinema',agriculture:'Agriculture',model:'Model',gallery:'Gallery',previous:'Previous photo',next:'Next photo',imageUnavailable:'Image temporarily unavailable',models:'10 models',office:'Office',contact:'Contact'},
    zh:{technology:'科技产品',robots:'机器人',drones:'无人机',partners:'合作伙伴',news:'新闻',title:'DJI 无人机与行业平台',hero:'精选 10 款 DJI 产品，从轻量影像无人机到专业、行业与农业平台。',catalog:'DJI 产品目录',catalogText:'对比用途、技术参数与俄罗斯市场参考价格。',market:'俄罗斯市场参考价格',marketText:'页面价格为参考起售价，最终价格取决于配置、汇率、库存、物流和供货条件。',from:'起',details:'查看详情',request:'咨询供货',back:'返回无人机',overview:'产品介绍',specs:'技术参数',use:'应用场景',weight:'重量',camera:'相机',video:'视频',flight:'飞行',range:'图传',protection:'系统 / 防护',payload:'载荷',availability:'下单前确认最终价格与库存。',contactTitle:'为您确认配置与供货',contactText:'CCCTrade 位于中国义乌。请发送所需机型和配置，我们将确认价格、库存和供货方案。',copy:'复制联系方式',copied:'已复制',priceNote:'俄罗斯市场参考价格，不构成公开报价。',photo:'图片',source:'参数来源',all:'全部',compact:'轻量',creator:'影像创作',fpv:'FPV',professional:'专业',enterprise:'行业',cinema:'电影',agriculture:'农业',model:'机型',gallery:'图片',previous:'上一张',next:'下一张',imageUnavailable:'图片暂时无法显示',models:'10 款机型',office:'办公室',contact:'联系'},
    it:{technology:'Tecnologia',robots:'Robot',drones:'Droni e UAV',partners:'Partner',news:'Notizie',title:'Droni e UAV DJI',hero:'Una gamma selezionata di 10 modelli DJI, dai droni compatti alle piattaforme professionali, enterprise e agricole.',catalog:'Catalogo DJI',catalogText:'Confronta utilizzi, specifiche e prezzi indicativi per il mercato russo.',market:'Prezzi indicativi in Russia',marketText:'I prezzi sono indicativi. Il costo finale dipende da configurazione, cambio, disponibilità e logistica.',from:'da',details:'Dettagli',request:'Richiedi fornitura',back:'Torna ai droni',overview:'Panoramica',specs:'Specifiche',use:'Applicazioni',weight:'Peso',camera:'Fotocamera',video:'Video',flight:'Volo',range:'Trasmissione',protection:'Sistemi / protezione',payload:'Carico utile',availability:'Prezzo e disponibilità vengono confermati prima dell’ordine.',contactTitle:'Configuriamo e troviamo il drone giusto',contactText:'CCCTrade opera da Yiwu, Cina. Inviaci modello e configurazione desiderata per confermare prezzo, disponibilità e fornitura.',copy:'Copia contatti',copied:'Copiato',priceNote:'Prezzo indicativo per il mercato russo, non è un’offerta pubblica.',photo:'Foto',source:'Fonte specifiche',all:'Tutti',compact:'Compatti',creator:'Creator',fpv:'FPV',professional:'Professionali',enterprise:'Enterprise',cinema:'Cinema',agriculture:'Agricoltura',model:'Modello',gallery:'Galleria',previous:'Foto precedente',next:'Foto successiva',imageUnavailable:'Immagine temporaneamente non disponibile',models:'10 modelli',office:'Ufficio',contact:'Contatti'},
    fr:{technology:'Technologie',robots:'Robots',drones:'Drones et UAV',partners:'Partenaires',news:'Actualités',title:'Drones et UAV DJI',hero:'Une sélection de 10 modèles DJI, des drones compacts aux plateformes professionnelles, industrielles et agricoles.',catalog:'Catalogue DJI',catalogText:'Comparez usages, caractéristiques et prix indicatifs du marché russe.',market:'Prix indicatifs en Russie',marketText:'Les prix affichés sont indicatifs. Le coût final dépend de la configuration, du taux de change, du stock et de la livraison.',from:'à partir de',details:'Voir le détail',request:'Demander une offre',back:'Retour aux drones',overview:'Présentation',specs:'Caractéristiques',use:'Applications',weight:'Poids',camera:'Caméra',video:'Vidéo',flight:'Vol',range:'Transmission',protection:'Systèmes / protection',payload:'Charge utile',availability:'Prix et disponibilité confirmés avant commande.',contactTitle:'Nous configurons et sourçons votre drone',contactText:'CCCTrade opère depuis Yiwu, Chine. Envoyez le modèle et la configuration souhaitée pour confirmer prix, stock et options de livraison.',copy:'Copier les contacts',copied:'Copié',priceNote:'Prix indicatif du marché russe, non contractuel.',photo:'Photo',source:'Source des spécifications',all:'Tous',compact:'Compacts',creator:'Création',fpv:'FPV',professional:'Professionnels',enterprise:'Enterprise',cinema:'Cinéma',agriculture:'Agriculture',model:'Modèle',gallery:'Galerie',previous:'Photo précédente',next:'Photo suivante',imageUnavailable:'Image temporairement indisponible',models:'10 modèles',office:'Bureau',contact:'Contact'},
    de:{technology:'Technologie',robots:'Roboter',drones:'Drohnen & UAVs',partners:'Partner',news:'News',title:'DJI Drohnen & UAVs',hero:'Eine kuratierte Auswahl von 10 DJI Modellen – von kompakten Creator-Drohnen bis zu Profi-, Enterprise- und Agrarplattformen.',catalog:'DJI Katalog',catalogText:'Vergleichen Sie Einsatzzwecke, Daten und Richtpreise für den russischen Markt.',market:'Richtpreise in Russland',marketText:'Die Preise sind unverbindliche Startpreise. Der Endpreis hängt von Konfiguration, Wechselkurs, Lagerbestand, Lieferung und Lieferbedingungen ab.',from:'ab',details:'Details',request:'Lieferung anfragen',back:'Zurück zu Drohnen',overview:'Übersicht',specs:'Spezifikationen',use:'Anwendungen',weight:'Gewicht',camera:'Kamera',video:'Video',flight:'Flug',range:'Übertragung',protection:'Systeme / Schutz',payload:'Nutzlast',availability:'Preis und Verfügbarkeit werden vor der Bestellung bestätigt.',contactTitle:'Wir konfigurieren und beschaffen Ihre Drohne',contactText:'CCCTrade arbeitet aus Yiwu, China. Senden Sie Modell und gewünschte Konfiguration für Preis-, Bestands- und Lieferbestätigung.',copy:'Kontakte kopieren',copied:'Kopiert',priceNote:'Unverbindlicher Richtpreis für den russischen Markt.',photo:'Foto',source:'Spezifikationsquelle',all:'Alle',compact:'Kompakt',creator:'Creator',fpv:'FPV',professional:'Professional',enterprise:'Enterprise',cinema:'Cinema',agriculture:'Agrar',model:'Modell',gallery:'Galerie',previous:'Vorheriges Foto',next:'Nächstes Foto',imageUnavailable:'Bild vorübergehend nicht verfügbar',models:'10 Modelle',office:'Büro',contact:'Kontakt'},
    ja:{technology:'テクノロジー',robots:'ロボット',drones:'ドローン・UAV',partners:'パートナー',news:'ニュース',title:'DJI ドローン・UAV',hero:'コンパクトな撮影用ドローンからプロ・業務・農業向けまで、DJI 10モデルを厳選。',catalog:'DJI カタログ',catalogText:'用途、仕様、ロシア市場の参考価格を比較できます。',market:'ロシア市場の参考価格',marketText:'表示価格は参考価格です。最終価格は構成、為替、在庫、配送条件により変動します。',from:'約',details:'詳細を見る',request:'供給を相談',back:'ドローン一覧へ',overview:'概要',specs:'仕様',use:'用途',weight:'重量',camera:'カメラ',video:'動画',flight:'飛行',range:'伝送',protection:'システム / 保護',payload:'ペイロード',availability:'価格と在庫は注文前に確認します。',contactTitle:'構成と供給をご案内します',contactText:'CCCTradeは中国・義烏を拠点にしています。希望モデルと構成をお送りください。価格、在庫、供給方法を確認します。',copy:'連絡先をコピー',copied:'コピーしました',priceNote:'ロシア市場の参考価格であり、公開オファーではありません。',photo:'写真',source:'仕様出典',all:'すべて',compact:'コンパクト',creator:'クリエイター',fpv:'FPV',professional:'プロ',enterprise:'業務用',cinema:'シネマ',agriculture:'農業',model:'モデル',gallery:'ギャラリー',previous:'前の写真',next:'次の写真',imageUnavailable:'画像を一時的に表示できません',models:'10モデル',office:'オフィス',contact:'連絡先'},
    ko:{technology:'테크놀로지',robots:'로봇',drones:'드론·UAV',partners:'파트너',news:'뉴스',title:'DJI 드론 & UAV',hero:'소형 촬영 드론부터 전문가용, 엔터프라이즈, 농업 플랫폼까지 DJI 10개 모델을 엄선했습니다.',catalog:'DJI 카탈로그',catalogText:'용도, 사양, 러시아 시장 참고 가격을 비교하세요.',market:'러시아 시장 참고 가격',marketText:'표시 가격은 참고 시작가입니다. 최종 가격은 구성, 환율, 재고, 배송 및 공급 조건에 따라 달라집니다.',from:'부터',details:'상세 보기',request:'공급 문의',back:'드론으로 돌아가기',overview:'개요',specs:'사양',use:'용도',weight:'무게',camera:'카메라',video:'비디오',flight:'비행',range:'전송',protection:'시스템 / 보호',payload:'페이로드',availability:'가격과 재고는 주문 전 확인합니다.',contactTitle:'구성과 공급을 도와드립니다',contactText:'CCCTrade는 중국 이우에서 운영합니다. 원하는 모델과 구성을 보내주시면 가격, 재고, 공급 옵션을 확인합니다.',copy:'연락처 복사',copied:'복사됨',priceNote:'러시아 시장 참고 가격이며 공개 제안이 아닙니다.',photo:'사진',source:'사양 출처',all:'전체',compact:'컴팩트',creator:'크리에이터',fpv:'FPV',professional:'프로',enterprise:'엔터프라이즈',cinema:'시네마',agriculture:'농업',model:'모델',gallery:'갤러리',previous:'이전 사진',next:'다음 사진',imageUnavailable:'이미지를 일시적으로 표시할 수 없습니다',models:'10개 모델',office:'사무실',contact:'연락처'}
  };

  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params = new URLSearchParams(location.search);
  let saved=''; try{saved=JSON.parse(localStorage.getItem('robotics_pro_language')||'""')}catch{}
  let lang = params.get('lang') || saved || 'ru';
  if(!supported.includes(lang)) lang='ru';
  let filter='all';
  let galleryIndex=0;
  const productId=params.get('product');
  const currentProduct=products.find(p=>p.id===productId);
  const isProduct=location.pathname.endsWith('/product.html');
  const words=()=>wordsByLang[lang];
  const text=v=>typeof v==='object'?(v[lang]||v.en||v.ru||''):v;
  const money=v=>new Intl.NumberFormat({ru:'ru-RU',en:'en-US',zh:'zh-CN',it:'it-IT',fr:'fr-FR',de:'de-DE',ja:'ja-JP',ko:'ko-KR'}[lang],{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(v);
  const rootPath=()=>location.pathname.includes('/technologies/drones/')?'../../':'./';
  const link=(path)=>{const u=new URL(rootPath()+path,location.href);u.searchParams.set('lang',lang);return u.pathname+u.search+u.hash};
  const productLink=p=>link(`technologies/drones/product.html?product=${encodeURIComponent(p.id)}`);
  const contactText=()=>`CCCTrade · Yiwu, China\nTelegram: @CheliUsNick\nEmail: helloitisnick@gmail.com\nPhone: +7 952 082-45-39`;

  function proxied(src){
    if(!src) return '';
    if(src.startsWith('./')||src.startsWith('../')||src.startsWith('/robotics-pro/')) return src;
    return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=1800&fit=contain&output=webp&q=88`;
  }
  function placeholder(name){
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#f0f2f5"/><text x="800" y="480" text-anchor="middle" font-family="Arial,sans-serif" font-size="72" font-weight="700" fill="#15171a">${esc(name)}</text><text x="800" y="555" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#777">CCCTrade · DJI</text></svg>`;
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }
  function imageMarkup(p,i,cls=''){
    const src=p.images?.[i]||'';
    return `<img class="${cls}" src="${proxied(src)}" data-original="${esc(src)}" data-fallback="${placeholder(p.name)}" alt="${esc(p.name)} — ${esc(words().photo)} ${i+1}" loading="${i===0?'eager':'lazy'}" decoding="async" referrerpolicy="no-referrer">`;
  }

  function header(){
    const w=words();
    return `<header class="dji-header"><a class="dji-brand" href="${link('index.html')}"><span class="dji-brand-mark">C</span><span>CCCTrade</span></a><nav class="dji-nav" aria-label="Main navigation"><a href="${link('technologies/')}">${w.technology}</a><a href="${link('technologies/robots/')}">${w.robots}</a><a class="active" href="${link('technologies/drones/')}">${w.drones}</a><a href="${link('partners.html')}">${w.partners}</a><a href="${link('news.html')}">${w.news}</a></nav><label class="dji-language"><span>◎</span><select id="djiLanguage" aria-label="Language">${supported.map(code=>`<option value="${code}" ${code===lang?'selected':''}>${languageNames[code]}</option>`).join('')}</select></label></header>`;
  }

  function footer(){const w=words();return `<footer class="dji-footer"><div><a class="dji-brand footer-brand" href="${link('index.html')}"><span class="dji-brand-mark">C</span><span>CCCTrade</span></a><p>Technology sourcing · Yiwu, China</p></div><div class="dji-footer-meta"><span>${w.office}: Yiwu, China</span><span>helloitisnick@gmail.com</span><span>+7 952 082-45-39</span><span>© ${new Date().getFullYear()} CCCTrade</span></div></footer>`}

  function contactBlock(){const w=words();return `<section class="dji-contact"><div><span class="dji-kicker">CCCTrade · Yiwu, China</span><h2>${w.contactTitle}</h2><p>${w.contactText}</p></div><button class="dji-btn light" data-copy-contact>${w.copy}</button></section>`}

  function card(p,index){const w=words();return `<article class="dji-card"><a class="dji-card-media" href="${productLink(p)}">${imageMarkup(p,0)}<span class="dji-card-index">${String(index+1).padStart(2,'0')}</span><span class="dji-card-arrow">↗</span></a><div class="dji-card-copy"><div class="dji-card-head"><div><span class="dji-badge">${esc(w[p.segment]||p.segment)}</span><h3><a href="${productLink(p)}">${esc(p.name)}</a></h3></div><div class="dji-card-price"><small>${w.from}</small><strong>${money(p.price)}</strong></div></div><p>${esc(text(p.tagline))}</p><div class="dji-card-actions"><a class="dji-btn" href="${productLink(p)}">${w.details}<span>↗</span></a><button class="dji-text-btn" data-request="${p.id}">${w.request}<span>→</span></button></div></div></article>`}

  function catalogPage(){
    const w=words();
    const visible=filter==='all'?products:products.filter(p=>p.segment===filter);
    const filters=['all','compact','creator','fpv','professional','enterprise','cinema','agriculture'];
    return `${header()}<main><section class="dji-hero"><div class="dji-hero-copy"><span class="dji-kicker">CCCTrade · DJI · Yiwu, China</span><h1>${w.title}</h1><p>${w.hero}</p><div class="dji-hero-stats"><div><strong>${w.models}</strong><span>DJI</span></div><div><strong>8</strong><span>languages</span></div><div><strong>RU</strong><span>market pricing</span></div></div></div><aside class="dji-price-note"><span class="dji-kicker">MARKET NOTE</span><strong>${w.market}</strong><p>${w.marketText}</p></aside></section><section class="dji-section"><div class="dji-section-head"><div><span class="dji-kicker">01 / DJI</span><h2>${w.catalog}</h2></div><p>${w.catalogText}</p></div><div class="dji-filterbar" role="group" aria-label="${esc(w.catalog)}">${filters.map(k=>`<button data-filter="${k}" class="${filter===k?'active':''}" aria-pressed="${filter===k}">${w[k]}</button>`).join('')}</div><div class="dji-grid" id="djiGrid">${visible.map(card).join('')}</div><p class="dji-note catalog-note">${w.priceNote}</p></section>${contactBlock()}</main>${footer()}`;
  }

  function specRows(p){const w=words();const labels={weight:w.weight,camera:w.camera,video:w.video,flight:w.flight,range:w.range,protection:w.protection,payload:w.payload};return Object.entries(p.specs||{}).map(([k,v])=>`<tr><th>${esc(labels[k]||k)}</th><td>${esc(text(v))}</td></tr>`).join('')}

  function productPage(){
    const w=words();
    if(!currentProduct) return `${header()}<main class="dji-empty"><span class="dji-kicker">404</span><h1>Product not found</h1><a class="dji-btn" href="${link('technologies/drones/')}">← ${w.back}</a></main>${footer()}`;
    const p=currentProduct;
    galleryIndex=Math.max(0,Math.min(galleryIndex,(p.images?.length||1)-1));
    return `${header()}<main><section class="dji-product"><nav class="dji-breadcrumbs"><a href="${link('index.html')}">CCCTrade</a><span>/</span><a href="${link('technologies/drones/')}">${w.drones}</a><span>/</span><span>${esc(p.name)}</span></nav><div class="dji-product-layout"><div class="dji-gallery" aria-label="${esc(w.gallery)}"><div class="dji-gallery-stage" tabindex="0">${imageMarkup(p,galleryIndex,'dji-main-photo')}<button type="button" class="dji-gallery-arrow prev" data-gallery-step="-1" aria-label="${esc(w.previous)}">‹</button><button type="button" class="dji-gallery-arrow next" data-gallery-step="1" aria-label="${esc(w.next)}">›</button><span class="dji-gallery-counter">${galleryIndex+1} / ${p.images.length}</span></div><div class="dji-thumbs">${p.images.map((_,i)=>`<button class="dji-thumb ${i===galleryIndex?'active':''}" data-photo="${i}" aria-label="${esc(w.photo)} ${i+1}" aria-pressed="${i===galleryIndex}">${imageMarkup(p,i)}</button>`).join('')}</div></div><div class="dji-info"><span class="dji-badge">DJI · ${esc(w[p.segment]||p.segment)}</span><h1>${esc(p.name)}</h1><h2>${esc(text(p.tagline))}</h2><p class="lead">${esc(text(p.description))}</p><div class="dji-price"><div><small>${w.from}</small><strong>${money(p.price)}</strong></div><span class="dji-status">${w.availability}</span></div><div class="dji-card-actions"><button class="dji-btn" data-request="${p.id}">${w.request}<span>↗</span></button><a class="dji-text-btn" href="${link('technologies/drones/')}">← ${w.back}</a></div><p class="dji-note">${w.priceNote}</p><div class="dji-order-panel" id="orderPanel" hidden></div></div></div></section><section class="dji-details"><div class="dji-detail-grid"><div><span class="dji-kicker">01 / ${w.overview}</span><h2>${w.overview}</h2></div><div><p>${esc(text(p.description))}</p><p><strong>${w.use}:</strong> ${esc(text(p.use))}</p></div></div><div class="dji-detail-grid"><div><span class="dji-kicker">02 / ${w.specs}</span><h2>${w.specs}</h2></div><div><div class="dji-spec-table-wrap"><table class="dji-specs"><tbody>${specRows(p)}</tbody></table></div><p class="dji-note"><a href="${esc(p.source)}" target="_blank" rel="noopener">${w.source}: DJI ↗</a></p></div></div></section>${contactBlock()}</main>${footer()}`;
  }

  function installImageFallbacks(){
    document.querySelectorAll('.dji-shell img').forEach(img=>{
      if(img.dataset.safe==='1') return;
      img.dataset.safe='1';
      img.addEventListener('error',()=>{
        if(img.dataset.triedOriginal!=='1'&&img.dataset.original){img.dataset.triedOriginal='1';img.src=img.dataset.original;return;}
        img.src=img.dataset.fallback||'';
      });
    });
  }

  function render(){
    document.documentElement.lang=lang==='zh'?'zh-CN':lang;
    document.body.className='dji-shell';
    document.querySelector('#app').innerHTML=isProduct?productPage():catalogPage();
    document.title=isProduct&&currentProduct?`${currentProduct.name} — CCCTrade`:`${words().title} — CCCTrade`;
    const meta=document.querySelector('meta[name="description"]');
    if(meta) meta.content=isProduct&&currentProduct?text(currentProduct.description):words().hero;
    installImageFallbacks();
  }

  function setGallery(next,direction=1){
    if(!currentProduct?.images?.length) return;
    const total=currentProduct.images.length;
    galleryIndex=(next+total)%total;
    const stage=document.querySelector('.dji-gallery-stage');
    const main=document.querySelector('.dji-main-photo');
    const counter=document.querySelector('.dji-gallery-counter');
    if(!stage||!main) return;
    main.classList.remove('slide-left','slide-right');
    void main.offsetWidth;
    main.classList.add(direction>=0?'slide-left':'slide-right');
    main.dataset.triedOriginal='0';
    main.src=proxied(currentProduct.images[galleryIndex]);
    main.dataset.original=currentProduct.images[galleryIndex];
    counter.textContent=`${galleryIndex+1} / ${total}`;
    document.querySelectorAll('.dji-thumb').forEach((b,i)=>{b.classList.toggle('active',i===galleryIndex);b.setAttribute('aria-pressed',String(i===galleryIndex));});
  }

  function showRequest(id){
    const p=products.find(x=>x.id===id);
    const w=words();
    const panel=document.querySelector('#orderPanel');
    if(panel&&p){panel.hidden=false;panel.innerHTML=`<span class="dji-kicker">${w.contact}</span><strong>${esc(p.name)}</strong><p>Telegram: @CheliUsNick<br>Email: helloitisnick@gmail.com<br>Phone: +7 952 082-45-39</p><button class="dji-btn secondary" data-copy-contact>${w.copy}</button>`;panel.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
    navigator.clipboard?.writeText(contactText()).catch(()=>{});
  }

  document.addEventListener('change',e=>{
    if(e.target.id!=='djiLanguage') return;
    lang=e.target.value;localStorage.setItem('robotics_pro_language',JSON.stringify(lang));
    const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState(null,'',u);render();
  });

  document.addEventListener('click',async e=>{
    const filterButton=e.target.closest('[data-filter]');
    if(filterButton){filter=filterButton.dataset.filter;render();return;}
    const thumb=e.target.closest('[data-photo]');
    if(thumb){const i=Number(thumb.dataset.photo);setGallery(i,i>=galleryIndex?1:-1);return;}
    const step=e.target.closest('[data-gallery-step]');
    if(step){const delta=Number(step.dataset.galleryStep);setGallery(galleryIndex+delta,delta);return;}
    const req=e.target.closest('[data-request]');
    if(req){showRequest(req.dataset.request);return;}
    const copy=e.target.closest('[data-copy-contact]');
    if(copy){try{await navigator.clipboard.writeText(contactText());const old=copy.textContent;copy.textContent=words().copied;setTimeout(()=>copy.textContent=old,1400)}catch{} }
  });

  document.addEventListener('keydown',e=>{
    if(!isProduct||!document.querySelector('.dji-gallery-stage')) return;
    if(e.key==='ArrowLeft'){e.preventDefault();setGallery(galleryIndex-1,-1);}
    if(e.key==='ArrowRight'){e.preventDefault();setGallery(galleryIndex+1,1);}
  });

  let swipeStart=null;
  document.addEventListener('pointerdown',e=>{if(e.target.closest('.dji-gallery-stage')) swipeStart={x:e.clientX,y:e.clientY};});
  document.addEventListener('pointerup',e=>{if(!swipeStart||!e.target.closest('.dji-gallery-stage')){swipeStart=null;return;}const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.2)setGallery(galleryIndex+(dx<0?1:-1),dx<0?1:-1);});

  render();
})();
