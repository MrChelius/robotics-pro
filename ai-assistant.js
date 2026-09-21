(() => {
  'use strict';
  if (window.__roboChelAiLoaded) return;
  window.__roboChelAiLoaded = true;

  const TEXT = {
    ru: {
      status:'онлайн · готов к диалогу', sub:'Спросите меня о чём угодно',
      hello:'Привет! Я RoboChel AI — помощник CCCTrade. Я могу помочь с выбором робота или дрона, сравнить модели, объяснить технологии простыми словами, рассказать про оплату и доставку или просто поддержать разговор о робототехнике, ИИ и будущем технологий.',
      placeholder:'Напишите сообщение…', send:'Отправить', human:'Связаться с менеджером',
      chips:['Подобрать робота','Сравнить модели','Оплата','Доставка','Поговорим о технологиях','Что ты умеешь?'],
      greet:'Привет! Рад вас видеть 👋 О чём поговорим?', thanks:'Пожалуйста! Можем продолжить.',
      mood:'У меня всё отлично 🤖 Я на связи и готов обсуждать роботов, дроны, ИИ или помочь с каталогом CCCTrade.',
      identity:'Я RoboChel AI — виртуальный помощник CCCTrade. Я работаю прямо на сайте, знаю каталог и могу поддерживать разговор на русском, английском и китайском.',
      cap:'Я веду диалог с контекстом, знаю каталог CCCTrade, сравниваю роботов и DJI-дроны, помогаю подобрать модель под задачу и бюджет, объясняю характеристики, доставку и порядок заказа. На общие вопросы тоже отвечаю, но вопросы о товарах сайта всегда разбираю сначала по данным каталога.',
      payment:'Онлайн-оплата на публичном сайте сейчас не подключена. Корзина используется как список интересующих товаров: менеджер CCCTrade подтверждает итоговую цену, комплектацию, доступный способ оплаты и условия поставки перед оформлением заказа.',
      delivery:'CCCTrade работает из Иу, Китай. Срок и стоимость зависят от модели, страны, веса и способа перевозки. Назовите страну и модель — я подскажу, какие данные нужны для расчёта.',
      compare:'Назовите 2–3 модели — сравню назначение, характеристики, цену и типичные сценарии использования.',
      choose:'Расскажите, где будет использоваться устройство, что оно должно уметь и какой примерно бюджет. Я сузю выбор.',
      ai:'Искусственный интеллект в робототехнике помогает воспринимать окружение, распознавать объекты и речь, планировать действия и адаптироваться к ситуации. В реальных роботах ИИ обычно работает вместе с камерами, LiDAR, IMU и другими датчиками.',
      lidar:'LiDAR измеряет расстояние до объектов лазерными импульсами и строит точную 3D-карту окружения. Это особенно полезно для навигации, обхода препятствий и работы в помещениях или на сложной местности.',
      vision:'Компьютерное зрение позволяет роботу понимать изображения с камер: находить людей и предметы, оценивать расстояния, отслеживать объекты и ориентироваться в пространстве.',
      humanoid:'Гуманоидные роботы созданы под среду, рассчитанную на человека: двери, лестницы, инструменты и рабочие места. Их сильная сторона — универсальность, но они сложнее и дороже четвероногих платформ.',
      quadruped:'Четвероногие роботы устойчивы, мобильны и хорошо проходят неровную поверхность. Их часто используют для инспекций, исследований, охраны, образования и разработки автономных систем.',
      drone:'Дроны особенно полезны там, где важен обзор сверху: фото и видео, инспекции, картография, строительство, сельское хозяйство и мониторинг. При выборе важны камера, дальность, время полёта, вес и местные правила.',
      battery:'Время работы робота зависит от батареи, нагрузки, скорости, температуры и режима работы. Для точной оценки лучше смотреть характеристики конкретной модели и учитывать запас по времени.',
      fallback:'Интересный вопрос. Я постараюсь продолжить по смыслу. Если речь о роботах, дронах, ИИ, технологиях CCCTrade, оплате или доставке — можно задать вопрос свободно, обычными словами.',
      details:'Подробнее', matches:'Подходящие варианты:'
    },
    en: {
      status:'online · ready to chat', sub:'Ask me anything',
      hello:'Hi! I’m RoboChel AI, the CCCTrade assistant. I can help you choose a robot or drone, compare models, explain technology in plain language, discuss payments and shipping, or simply chat about robotics, AI and the future of technology.',
      placeholder:'Write a message…', send:'Send', human:'Talk to a manager',
      chips:['Choose a robot','Compare models','Payments','Shipping','Talk technology','What can you do?'],
      greet:'Hi! Great to see you 👋 What would you like to talk about?', thanks:'You’re welcome! We can keep going.',
      mood:'I’m doing great 🤖 I’m here and ready to talk robots, drones, AI, or help with the CCCTrade catalog.',
      identity:'I’m RoboChel AI, the virtual CCCTrade assistant. I run directly on the website, know the catalog, and can chat in English, Russian and Chinese.',
      cap:'I keep conversational context, know the CCCTrade catalog, compare robots and DJI drones, recommend models for a use case and budget, and explain specifications, shipping and ordering. I can also answer general questions, but site-product questions are always grounded in the catalog first.',
      payment:'Online payment is not connected on the public site right now. The cart works as an inquiry list: a CCCTrade manager confirms the final price, configuration, available payment method and delivery terms before the order is placed.',
      delivery:'CCCTrade operates from Yiwu, China. Shipping time and cost depend on the model, country, weight and transport method. Tell me the country and model and I’ll explain what is needed for a quote.',
      compare:'Name 2–3 models and I’ll compare purpose, specifications, price and common use cases.',
      choose:'Tell me where the device will be used, what it needs to do, and your approximate budget. I’ll narrow the options.',
      ai:'AI in robotics helps machines perceive their environment, recognize objects and speech, plan actions and adapt to changing situations. In real robots, AI usually works together with cameras, LiDAR, IMUs and other sensors.',
      lidar:'LiDAR measures distance using laser pulses and builds an accurate 3D map of the environment. It is especially useful for navigation, obstacle avoidance and operation in complex spaces.',
      vision:'Computer vision lets a robot interpret camera images: detect people and objects, estimate distance, track targets and understand its surroundings.',
      humanoid:'Humanoid robots are designed for environments built for people: doors, stairs, tools and workplaces. Their advantage is versatility, but they are generally more complex than quadruped platforms.',
      quadruped:'Quadruped robots are stable, mobile and good on uneven terrain. Common uses include inspection, research, security, education and autonomous-systems development.',
      drone:'Drones are especially useful when an aerial viewpoint matters: photography, inspection, mapping, construction, agriculture and monitoring. Key factors are camera, range, flight time, weight and local rules.',
      battery:'Robot runtime depends on battery capacity, payload, speed, temperature and operating mode. For a realistic estimate, use the specific model specs and keep a safety margin.',
      fallback:'Interesting question. I’ll try to continue from the context. You can ask freely about robots, drones, AI, CCCTrade technology, payments or shipping.',
      details:'Learn more', matches:'Good matches:'
    },
    zh: {
      status:'在线 · 可以对话', sub:'可以问我任何问题',
      hello:'你好！我是 RoboChel AI，CCCTrade 的智能助手。我可以帮助选择机器人或无人机、比较型号、用简单方式解释技术、介绍支付和配送，也可以聊机器人、人工智能和未来科技。',
      placeholder:'输入消息…', send:'发送', human:'联系经理',
      chips:['帮我选机器人','比较型号','支付','配送','聊聊科技','你会做什么？'],
      greet:'你好！很高兴见到你 👋 想聊什么？', thanks:'不客气！我们可以继续聊。',
      mood:'我很好 🤖 随时可以聊机器人、无人机、人工智能，或者帮助你了解 CCCTrade 的产品。',
      identity:'我是 RoboChel AI，CCCTrade 的虚拟助手。我直接运行在网站上，了解产品目录，并且可以使用中文、英文和俄文交流。',
      cap:'我会记住当前对话，了解 CCCTrade 商品目录，可以比较机器人和 DJI 无人机、按用途与预算选型，并解释参数、配送和下单流程。一般问题也可以回答，但只要涉及本站商品，我会优先依据本站目录。',
      payment:'目前公开网站没有启用在线支付。购物车作为询价清单使用；下单前由 CCCTrade 经理确认最终价格、配置、可用支付方式和配送条款。',
      delivery:'CCCTrade 位于中国义乌。配送时间和费用取决于型号、国家、重量和运输方式。告诉我国家和型号，我会说明报价需要哪些信息。',
      compare:'告诉我 2–3 个型号，我可以比较用途、参数、价格和常见使用场景。',
      choose:'请告诉我设备在哪里使用、需要完成什么任务，以及大概预算。我会缩小选择范围。',
      ai:'人工智能可以帮助机器人感知环境、识别物体和语音、规划动作并适应变化。实际机器人通常会把 AI 与摄像头、LiDAR、IMU 等传感器结合使用。',
      lidar:'LiDAR 通过激光脉冲测量距离，并建立精确的三维环境地图。它非常适合导航、避障和复杂环境中的自主移动。',
      vision:'计算机视觉让机器人理解摄像头画面，例如识别人和物体、估算距离、跟踪目标并理解周围环境。',
      humanoid:'人形机器人适合在人类环境中工作，例如门、楼梯、工具和工作台。它们的优势是通用性，但通常比四足机器人更复杂。',
      quadruped:'四足机器人稳定、灵活，适合不平整地面。常见用途包括巡检、科研、安防、教育和自主系统开发。',
      drone:'无人机适合需要空中视角的任务，例如摄影、巡检、测绘、建筑、农业和监控。选择时要关注摄像头、航程、续航、重量以及当地法规。',
      battery:'机器人的续航取决于电池容量、负载、速度、温度和工作模式。更准确的估算应参考具体型号参数并预留安全余量。',
      fallback:'这个问题很有意思。我会结合上下文继续回答。你可以自由询问机器人、无人机、人工智能、CCCTrade 技术、支付或配送。',
      details:'查看详情', matches:'推荐产品：'
    }
  };

  const detectLang = s => /[\u4e00-\u9fff]/.test(s) ? 'zh' : /[а-яё]/i.test(s) ? 'ru' : 'en';
  const initialLang = (() => {
    const q = new URLSearchParams(location.search).get('lang') || '';
    if (/^zh/.test(q)) return 'zh';
    if (/^en/.test(q)) return 'en';
    const d = document.documentElement.lang || '';
    return /^zh/.test(d) ? 'zh' : /^en/.test(d) ? 'en' : 'ru';
  })();

  let lang = initialLang;
  const memory = { topic:'', intent:'', turns:[], lastProducts:[], lastAnswer:'', profile:{budget:null,country:'',useCase:''} };
  const products = () => window.RP?.products || [];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const robotSVG = () => `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="13" y="14" width="38" height="27" rx="13" fill="#f7faf8" stroke="#9aa79f"/><rect x="18" y="19" width="28" height="18" rx="9" fill="#101713"/><path d="M23 28c2-4 6-4 8 0m2 0c2-4 6-4 8 0" fill="none" stroke="#79f2a8" stroke-width="3" stroke-linecap="round"/><path d="M25 32c4 4 10 4 14 0" fill="none" stroke="#79f2a8" stroke-width="2.5" stroke-linecap="round"/><path d="M24 42v9m16-9v9M17 30h-4m38 0h-4" stroke="#6b756f" stroke-width="3" stroke-linecap="round"/><rect x="22" y="41" width="20" height="14" rx="7" fill="#f7faf8" stroke="#9aa79f"/><path d="M32 7v7" stroke="#78847c" stroke-width="2.5"/><circle cx="32" cy="6" r="3" fill="#79f2a8"/></svg>`;

  const holder = document.createElement('div');
  holder.innerHTML = `<button class="robochel-chat-launcher" type="button" aria-label="RoboChel AI"><span class="robochel-chat-avatar">${robotSVG()}</span><span><strong>RoboChel AI</strong><small>${TEXT[lang].sub}</small></span></button><section class="robochel-chat-panel" role="dialog" aria-label="RoboChel AI"><header class="robochel-chat-head"><div class="robochel-chat-brand"><span class="robochel-chat-avatar">${robotSVG()}</span><div><b>RoboChel AI</b><span class="robochel-status">${TEXT[lang].status}</span></div></div><div class="robochel-lang"><button data-lang="en">EN</button><button data-lang="ru">RU</button><button data-lang="zh">中文</button></div><button class="robochel-chat-close" type="button" aria-label="Close">×</button></header><div class="robochel-chat-body"><div class="robochel-welcome"></div><div class="robochel-quick"></div><div class="robochel-messages" aria-live="polite"></div></div><footer class="robochel-compose"><div class="robochel-input-wrap"><textarea class="robochel-input" rows="1"></textarea><button class="robochel-send" type="button">➜</button></div><div class="robochel-foot"><span>RoboChel AI · CCCTrade</span><button class="robochel-human" type="button"></button></div></footer></section>`;
  document.body.append(...holder.children);

  const launcher=document.querySelector('.robochel-chat-launcher');
  const panel=document.querySelector('.robochel-chat-panel');
  const close=document.querySelector('.robochel-chat-close');
  const body=document.querySelector('.robochel-chat-body');
  const welcome=document.querySelector('.robochel-welcome');
  const quick=document.querySelector('.robochel-quick');
  const messages=document.querySelector('.robochel-messages');
  const input=document.querySelector('.robochel-input');
  const send=document.querySelector('.robochel-send');
  const human=document.querySelector('.robochel-human');
  const status=document.querySelector('.robochel-status');

  function renderLang(){
    const t=TEXT[lang];
    welcome.textContent=t.hello;
    input.placeholder=t.placeholder;
    send.setAttribute('aria-label',t.send);
    human.textContent=t.human;
    status.textContent=t.status;
    quick.innerHTML=t.chips.map(x=>`<button class="robochel-chip" type="button">${esc(x)}</button>`).join('');
    document.querySelectorAll('.robochel-lang button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  }
  renderLang();

  function add(text,who='assistant',extra=''){
    const row=document.createElement('div');
    row.className='robochel-msg-row '+who;
    if(who==='assistant'){
      const av=document.createElement('span'); av.className='robochel-mini'; av.innerHTML=robotSVG(); row.append(av);
    }
    const bubble=document.createElement('div'); bubble.className='robochel-msg '+who; bubble.textContent=text; row.append(bubble); messages.append(row);
    if(extra){ const e=document.createElement('div'); e.innerHTML=extra; messages.append(e); }
    body.scrollTop=body.scrollHeight;
  }

  function productText(p){
    return `${p.name||''} ${p.id||''} ${p.group||''} ${p.description?.[lang]||p.description?.en||''} ${p.fit?.[lang]||p.fit?.en||''}`.toLowerCase();
  }

  function findProducts(s){
    const q=s.toLowerCase();
    const all=products();
    const hits=all.filter(p=>{
      const name=String(p.name||'').toLowerCase();
      const id=String(p.id||'').toLowerCase();
      return (name && q.includes(name)) || (id && q.includes(id));
    });
    if(hits.length) return hits;
    return [];
  }

  function productCards(list){
    if(!list.length) return '';
    memory.lastProducts=list.slice(0,4);
    return `<div class="robochel-product-grid">${list.slice(0,4).map(p=>`<div class="robochel-product"><b>${esc(p.name||p.id||'Product')}</b><span>${esc(p.group||'Robot')}</span><a href="technologies/robots/product.html?product=${encodeURIComponent(p.id||'')}&lang=${lang}">${TEXT[lang].details}</a></div>`).join('')}</div>`;
  }


  const hash = str => {
    let h=2166136261;
    for(let i=0;i<String(str).length;i++){ h^=String(str).charCodeAt(i); h=Math.imul(h,16777619); }
    return h>>>0;
  };
  const pick = (arr,key='') => arr[hash(key+'|'+memory.turns.length)%arr.length];
  const norm = s => String(s||'').toLowerCase()
    .replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const tokens = s => norm(s).split(/\s+/).filter(x=>x.length>1);
  const loc = v => {
    if(v==null) return '';
    if(typeof v==='object' && !Array.isArray(v)) return v[lang]||v.en||v.ru||v.zh||'';
    return String(v);
  };
  const rub = n => typeof n==='number' ? new Intl.NumberFormat(lang==='ru'?'ru-RU':lang==='zh'?'zh-CN':'en-US').format(n)+' ₽' : '';
  const specNames = {
    ru:{weight:'масса',height:'высота',dof:'степени свободы',runtime:'время работы',vision:'система восприятия',connection:'связь',size:'размеры',speed:'скорость',slope:'подъём',battery:'батарея',dev:'разработка',display:'экран',camera:'камера'},
    en:{weight:'weight',height:'height',dof:'degrees of freedom',runtime:'runtime',vision:'perception',connection:'connectivity',size:'dimensions',speed:'speed',slope:'climbing angle',battery:'battery',dev:'development',display:'display',camera:'camera'},
    zh:{weight:'重量',height:'高度',dof:'自由度',runtime:'续航',vision:'感知系统',connection:'连接',size:'尺寸',speed:'速度',slope:'爬坡角度',battery:'电池',dev:'二次开发',display:'屏幕',camera:'摄像头'}
  };
  const specsOf = p => Object.fromEntries((p.specs||[]).map(([k,v])=>[k,loc(v)]));
  const aliases = p => {
    const a=[p.id,p.name].filter(Boolean).map(norm);
    const id=norm(p.id||'');
    if(id.includes('go2')) a.push('go2');
    if(id.includes('g1')) a.push('g1');
    if(id.includes('r1')) a.push('r1');
    return [...new Set(a)];
  };
  const smartProductMatches = q => {
    const nq=norm(q), qt=tokens(q);
    const ranked=products().map(p=>{
      let score=0;
      const na=norm(p.name), id=norm(p.id);
      aliases(p).forEach(a=>{ if(a && nq.includes(a)) score+=a.length>3?20:12; });
      qt.forEach(w=>{
        if(w.length<2) return;
        if(na.split(' ').includes(w)) score+=6;
        if(id.split(' ').includes(w)) score+=8;
        if(productText(p).includes(w)) score+=1;
      });
      return {p,score};
    }).filter(x=>x.score>=8).sort((a,b)=>b.score-a.score);
    return ranked.map(x=>x.p).slice(0,4);
  };
  const extractBudget = q => {
    const s=norm(q).replace(/\s+/g,'');
    let m=s.match(/(?:до|under|budget|бюджет|预算)(\d+(?:[.,]\d+)?)(млн|million|m|тыс|k|万)?/i);
    if(!m) m=s.match(/(\d+(?:[.,]\d+)?)(млн|million|m|тыс|k|万)(?:руб|₽|rub)?/i);
    if(!m) return null;
    let n=parseFloat(m[1].replace(',','.')); const u=m[2]||'';
    if(/млн|million|^m$/i.test(u)) n*=1e6;
    if(/тыс|^k$/i.test(u)) n*=1e3;
    if(u==='万') n*=1e4;
    return n>1000?n:null;
  };
  const rememberContext = q => {
    const b=extractBudget(q); if(b) memory.profile.budget=b;
    const n=norm(q);
    const countries=[
      ['росси','Russia','俄罗斯'],['кита','China','中国'],['казах','Kazakhstan','哈萨克斯坦'],
      ['сша','United States','美国'],['герман','Germany','德国'],['франц','France','法国']
    ];
    const c=countries.find(x=>n.includes(x[0])||n.includes(norm(x[1]))||n.includes(x[2]));
    if(c) memory.profile.country=c[lang==='ru'?0:lang==='zh'?2:1];
    if(/лаборатор|research|研发|科研|sdk|разработ/.test(n)) memory.profile.useCase=lang==='ru'?'исследования и разработка':lang==='zh'?'科研与开发':'research and development';
    else if(/демонстр|event|выстав|展示|活动/.test(n)) memory.profile.useCase=lang==='ru'?'демонстрации и мероприятия':lang==='zh'?'展示与活动':'demonstrations and events';
    else if(/инспек|охрана|巡检|security/.test(n)) memory.profile.useCase=lang==='ru'?'инспекции и мониторинг':lang==='zh'?'巡检与监控':'inspection and monitoring';
  };
  const witty = key => {
    const lines={
      ru:[
        'Немного инженерной магии — но без дыма, пожалуйста 🤖',
        'Роботы пока не требуют кофе, и это уже серьёзное конкурентное преимущество.',
        'Железо любит точные цифры. Я тоже — почти родственники.',
        'Если коротко: датчики смотрят, алгоритмы думают, моторы стараются не паниковать.'
      ],
      en:[
        'A little engineering magic — preferably without the smoke. 🤖',
        'Robots still do not ask for coffee, which is a surprisingly strong advantage.',
        'Hardware likes precise numbers. So do I — practically family.',
        'Short version: sensors watch, algorithms think, motors try not to panic.'
      ],
      zh:[
        '一点工程魔法——最好不要冒烟。🤖',
        '机器人暂时还不喝咖啡，这已经是很大的优势了。',
        '硬件喜欢准确数字。我也喜欢，算是半个同行。',
        '简单说：传感器负责看，算法负责想，电机负责别慌。'
      ]
    };
    return hash(key)%5===0 ? '\n\n'+pick(lines[lang],key) : '';
  };
  const openings = {
    ru:['Если по делу:','Короткий ответ:','Разберём без маркетингового тумана:','С практической стороны:','Хороший вопрос.'],
    en:['Straight answer:','Short version:','Without the marketing fog:','From a practical angle:','Good question.'],
    zh:['直接说结论：','简单说：','不绕营销术语：','从实际使用来看：','这个问题问得好。']
  };
  const closings = {
    ru:['Если скажете сценарий и бюджет, я сузю выбор точнее.','Могу сравнить это с другой моделью по пунктам.','Если нужно, разложу характеристики по таблице прямо здесь.'],
    en:['Give me the use case and budget and I can narrow it down.','I can compare it against another model point by point.','If useful, I can break the specs down into a compact comparison.'],
    zh:['告诉我用途和预算，我可以进一步缩小选择范围。','我也可以和另一款型号逐项比较。','如果需要，我可以把参数整理成简洁对比。']
  };
  const productSummary = (p,q='') => {
    const desc=loc(p.description), fit=loc(p.fit), sp=specsOf(p), nq=norm(q);
    const priceLine=p.price?rub(p.price):'';
    const wantsPrice=/цен|стоим|price|cost|多少钱|价格/.test(nq);
    const wantsSpecs=/характер|парамет|spec|weight|speed|runtime|参数|规格|重量|速度|续航/.test(nq);
    const wantsUse=/для чего|подходит|use case|what is it for|适合|用途/.test(nq);
    if(wantsPrice){
      const body=lang==='ru'?`${p.name}: ${priceLine}. ${desc}`:lang==='zh'?`${p.name}：${priceLine}。${desc}`:`${p.name}: ${priceLine}. ${desc}`;
      return pick(openings[lang],q)+' '+body+witty(q+p.id);
    }
    if(wantsSpecs){
      const order=['speed','runtime','weight','height','dof','vision','battery','connection','dev','camera'];
      const rows=order.filter(k=>sp[k]).slice(0,6).map(k=>`${specNames[lang][k]||k}: ${sp[k]}`);
      const head=lang==='ru'?`${p.name} — ключевые характеристики:`:lang==='zh'?`${p.name} — 主要参数：`:`${p.name} — key specifications:`;
      return `${head}\n• ${rows.join('\n• ')}${p.price?`\n• ${lang==='ru'?'цена':lang==='zh'?'价格':'price'}: ${priceLine}`:''}`+witty(q+p.id);
    }
    if(wantsUse){
      return `${pick(openings[lang],q)} ${desc}\n\n${lang==='ru'?'Лучше всего подходит:':lang==='zh'?'比较适合：':'Best suited to:'} ${fit}`+witty(q+p.id);
    }
    return `${pick(openings[lang],q)} ${p.name} — ${desc}${priceLine?`\n\n${lang==='ru'?'Цена на сайте:':lang==='zh'?'网站价格：':'Site price:'} ${priceLine}`:''}\n${lang==='ru'?'Сценарий:':lang==='zh'?'适用场景：':'Use case:'} ${fit}`+witty(q+p.id);
  };
  const compareProducts = (list,q) => {
    const unique=[...new Map(list.map(p=>[p.id,p])).values()].slice(0,3);
    if(unique.length<2) return TEXT[lang].compare;
    const lines=unique.map(p=>{
      const sp=specsOf(p);
      const bits=[];
      if(sp.speed) bits.push(`${specNames[lang].speed}: ${sp.speed}`);
      if(sp.runtime) bits.push(`${specNames[lang].runtime}: ${sp.runtime}`);
      if(sp.weight) bits.push(`${specNames[lang].weight}: ${sp.weight}`);
      if(sp.dof) bits.push(`${specNames[lang].dof}: ${sp.dof}`);
      if(p.price) bits.push(`${lang==='ru'?'цена':lang==='zh'?'价格':'price'}: ${rub(p.price)}`);
      return `• ${p.name} — ${bits.join(' · ')}\n  ${loc(p.fit)}`;
    });
    const cheapest=[...unique].filter(p=>p.price).sort((a,b)=>a.price-b.price)[0];
    const ending=cheapest
      ? (lang==='ru'?`По цене самый доступный из этой группы — ${cheapest.name}. Но «лучше» зависит от задачи: для исследований, демонстраций и готовых функций критерии разные.`
        :lang==='zh'?`按价格看，这组里门槛最低的是 ${cheapest.name}。不过“更好”取决于用途：科研、展示和现成功能的判断标准不同。`
        :`By price, ${cheapest.name} is the lowest-cost option here. But “better” depends on the job: research, demonstrations and ready-made features favor different things.`)
      :'';
    return `${pick(openings[lang],q)}\n${lines.join('\n\n')}\n\n${ending}`+witty(q+'compare');
  };
  const recommendProducts = q => {
    const n=norm(q), budget=extractBudget(q)||memory.profile.budget;
    const all=products();
    const scored=all.map(p=>{
      let score=0; const hay=productText(p);
      if(/гуманоид|humanoid|人形/.test(n)&&p.group==='humanoid')score+=8;
      if(/четвероног|robot dog|quadruped|робопес|四足/.test(n)&&p.group==='quadruped')score+=8;
      if(/дрон|drone|无人机/.test(n)&&/drone|dji/.test(hay))score+=8;
      if(/лаборатор|research|sdk|разработ|科研|研发/.test(n)&&/edu|research|sdk|разработ|科研/.test(hay))score+=6;
      if(/демонстр|выстав|event|展示|活动/.test(n)&&/демонстр|demonstr|展示|event/.test(hay))score+=5;
      if(/инспек|охрана|monitor|inspection|巡检|监控/.test(n)&&/inspect|инспек|巡检|monitor|security|охран/.test(hay))score+=5;
      tokens(q).forEach(w=>{if(w.length>3&&hay.includes(w))score+=1});
      if(budget && p.price){
        if(p.price<=budget) score+=7;
        else score-=Math.min(8,(p.price-budget)/Math.max(1,budget)*10);
      }
      return {p,score};
    }).sort((a,b)=>b.score-a.score);
    let list=scored.filter(x=>x.score>0).slice(0,4).map(x=>x.p);
    if(!list.length) list=all.filter(p=>!budget||!p.price||p.price<=budget).slice(0,4);
    memory.lastProducts=list;
    const budgetTxt=budget?rub(budget):'';
    const head=lang==='ru'
      ? `${pick(openings.ru,q)} ${budgetTxt?`При бюджете около ${budgetTxt} `:''}я бы начал с этих вариантов:`
      :lang==='zh'
      ? `${pick(openings.zh,q)} ${budgetTxt?`预算约 ${budgetTxt} 时，`:''}我会先看这些型号：`
      : `${pick(openings.en,q)} ${budgetTxt?`With a budget around ${budgetTxt}, `:''}I would start with these options:`;
    const rows=list.map(p=>`• ${p.name}${p.price?` — ${rub(p.price)}`:''}: ${loc(p.fit)}`).join('\n');
    return {text:`${head}\n${rows}\n\n${pick(closings[lang],q)}`+witty(q+'recommend'),extra:productCards(list)};
  };
  const KNOWLEDGE = [
    {re:/\bslam\b|локализац|картограф|定位|建图/,txt:{
      ru:'SLAM — это одновременная локализация и построение карты. Робот оценивает собственное положение и параллельно собирает карту по LiDAR, камерам и IMU. Самая интересная часть начинается, когда датчики слегка не согласны друг с другом.',
      en:'SLAM means simultaneous localization and mapping. A robot estimates its own pose while building a map from LiDAR, cameras and IMU data. The interesting part starts when the sensors disagree a little.',
      zh:'SLAM 是“同步定位与建图”。机器人一边估计自己的位置，一边利用 LiDAR、摄像头和 IMU 构建地图。真正有意思的地方，是不同传感器意见不完全一致的时候。'}},
    {re:/\bros\b|robot operating system|робот.*операц|机器人操作系统/,txt:{
      ru:'ROS — не операционная система в обычном смысле, а набор инструментов и соглашений для связи модулей робота. Драйверы, навигация, камеры и планирование могут работать отдельными узлами и обмениваться сообщениями.',
      en:'ROS is not an operating system in the usual sense. It is a framework and set of conventions that lets robot modules communicate: drivers, navigation, cameras and planning can run as separate nodes.',
      zh:'ROS 并不是传统意义上的操作系统，而是一套机器人软件框架和通信约定。驱动、导航、摄像头和规划模块可以作为独立节点交换消息。'}},
    {re:/\bimu\b|инерциал|惯性测量/,txt:{
      ru:'IMU измеряет ускорения и угловые скорости, обычно с помощью акселерометра и гироскопа. Для робота это внутреннее чувство равновесия: без него динамичная ходьба быстро превращается в очень дорогой способ познакомиться с полом.',
      en:'An IMU measures acceleration and angular velocity, usually with accelerometers and gyroscopes. It acts like the robot’s inner sense of balance; without it, dynamic walking becomes an expensive way to meet the floor.',
      zh:'IMU 通过加速度计和陀螺仪测量加速度与角速度，相当于机器人的“平衡感”。没有它，动态行走很容易变成昂贵的“亲地板实验”。'}},
    {re:/лидар|\blidar\b|激光雷达/,txt:{ru:TEXT.ru.lidar,en:TEXT.en.lidar,zh:TEXT.zh.lidar}},
    {re:/computer vision|компьютерн.*зрен|машинн.*зрен|视觉|图像识别/,txt:{ru:TEXT.ru.vision,en:TEXT.en.vision,zh:TEXT.zh.vision}},
    {re:/гуманоид|humanoid|人形机器人/,txt:{ru:TEXT.ru.humanoid,en:TEXT.en.humanoid,zh:TEXT.zh.humanoid}},
    {re:/четвероног|quadruped|робопес|robot dog|四足机器人/,txt:{ru:TEXT.ru.quadruped,en:TEXT.en.quadruped,zh:TEXT.zh.quadruped}},
    {re:/дрон|drone|无人机/,txt:{ru:TEXT.ru.drone,en:TEXT.en.drone,zh:TEXT.zh.drone}},
    {re:/батаре|аккумуля|runtime|battery|续航|电池/,txt:{ru:TEXT.ru.battery,en:TEXT.en.battery,zh:TEXT.zh.battery}},
    {re:/нейросет|neural network|神经网络/,txt:{
      ru:'Нейросеть — модель, которая учится находить закономерности в данных через множество связанных вычислительных слоёв. В робототехнике её могут использовать для зрения, речи, оценки сцены и выбора действий, но управление безопаснее строить вместе с обычной логикой и ограничителями.',
      en:'A neural network learns patterns through layers of connected computations. In robotics it can support vision, speech, scene understanding and action selection, while safety-critical control is usually combined with conventional logic and constraints.',
      zh:'神经网络通过多层计算从数据中学习规律。在机器人中可用于视觉、语音、场景理解和动作选择，但安全关键控制通常还会结合传统控制逻辑和约束。'}},
    {re:/\bllm\b|языков.*модел|language model|大语言模型/,txt:{
      ru:'LLM — большая языковая модель: она прогнозирует и генерирует текст по контексту. В роботе LLM удобно использовать как слой общения и планирования высокого уровня, но команды движения должны проходить через проверяемый контроллер, а не напрямую в моторы.',
      en:'An LLM is a large language model that generates text from context. In a robot it is useful for dialogue and high-level planning, but motion commands should pass through a validated controller rather than going straight to the motors.',
      zh:'LLM 是大语言模型，根据上下文生成语言。在机器人中适合负责对话和高层规划，但运动指令应经过可验证的控制器，而不是直接发送到电机。'}},
    {re:/автоном|autonom|自主导航|自主/,txt:{
      ru:'Автономность — это цепочка: восприятие → локализация → планирование → управление → контроль безопасности. Чем реальнее среда, тем важнее резервные сценарии: идеальных датчиков и идеальных полов пока не завезли.',
      en:'Autonomy is a pipeline: perception → localization → planning → control → safety supervision. The messier the real world, the more important fallback behavior becomes; perfect sensors and perfect floors are still out of stock.',
      zh:'自主系统通常是：感知 → 定位 → 规划 → 控制 → 安全监督。真实环境越复杂，备用策略越重要——完美传感器和完美地面目前都还没上市。'}},
    {re:/искусствен.*интеллект|\bai\b|\bии\b|artificial intelligence|人工智能/,txt:{ru:TEXT.ru.ai,en:TEXT.en.ai,zh:TEXT.zh.ai}}
  ];
  const knowledgeAnswer = (q,n) => {
    const k=KNOWLEDGE.find(x=>x.re.test(n));
    if(!k) return null;
    memory.topic='knowledge';
    return `${pick(openings[lang],q)} ${k.txt[lang]}`+witty(q+'knowledge');
  };
  const contextualFallback = (q,n) => {
    if(memory.lastProducts.length){
      const p=memory.lastProducts[0];
      if(/а цена|цена\??$|price\??$|多少钱|价格/.test(n)) return productSummary(p,'цена');
      if(/а характеристики|характеристики\??$|specs?\??$|参数/.test(n)) return productSummary(p,'характеристики');
      if(/а для чего|для чего\??$|use case|用途/.test(n)) return productSummary(p,'для чего');
    }
    const lead=pick(openings[lang],q);
    const safe={
      ru:[
        `${lead} я могу рассуждать по контексту, но не хочу уверенно выдумывать факт, которого нет в моей встроенной базе. Сформулируйте вопрос чуть конкретнее — модель, задача, бюджет или технология — и я отвечу по существу.`,
        `${lead} вопрос шире моей встроенной базы. Если речь о технике, роботах, ИИ, дронах или каталоге CCCTrade — дайте один ориентир, и я разберу тему нормально, а не отвечу заготовкой.`,
        `${lead} контекста пока мало. Напишите, что именно хотите узнать: как это работает, сколько стоит, с чем сравнить или подходит ли для конкретной задачи.`
      ],
      en:[
        `${lead} I can reason from the conversation, but I would rather not invent a fact that is not in my built-in knowledge. Give me one anchor — a model, use case, budget or technology — and I’ll answer directly.`,
        `${lead} that is broader than my built-in knowledge. If it is about robotics, AI, drones or the CCCTrade catalog, give me one concrete detail and I’ll dig in rather than repeat a canned reply.`,
        `${lead} I need one more piece of context. Tell me whether you want how it works, pricing, a comparison, or suitability for a specific task.`
      ],
      zh:[
        `${lead} 我可以结合上下文分析，但不会把内置知识库里没有的事实说得像真的一样。给我一个具体方向——型号、用途、预算或技术——我就能直接回答。`,
        `${lead} 这个问题比我的内置知识范围更宽。如果与机器人、AI、无人机或 CCCTrade 产品有关，给我一个具体线索，我会继续深入，而不是重复模板回答。`,
        `${lead} 还差一点上下文。告诉我是想了解原理、价格、对比，还是某个具体使用场景是否合适。`
      ]
    };
    return pick(safe[lang],q)+witty(q+'fallback');
  };

  let djiCatalogPromise=null;
  const djiProducts = () => window.DJI_CATALOG?.products || [];
  const localized = v => {
    if(v==null) return '';
    if(typeof v==='object' && !Array.isArray(v)) return v[lang]||v.en||v.ru||v.zh||Object.values(v)[0]||'';
    return String(v);
  };
  async function ensureDjiCatalog(){
    if(djiProducts().length) return djiProducts();
    if(djiCatalogPromise) return djiCatalogPromise;
    djiCatalogPromise=new Promise(resolve=>{
      const existing=document.querySelector('script[data-robochel-dji-catalog]');
      if(existing){
        if(window.DJI_CATALOG) return resolve(djiProducts());
        existing.addEventListener('load',()=>resolve(djiProducts()),{once:true});
        existing.addEventListener('error',()=>resolve([]),{once:true});
        setTimeout(()=>resolve(djiProducts()),2500);
        return;
      }
      const sc=document.createElement('script');
      sc.src=new URL('./dji-products.js',document.baseURI).href;
      sc.async=true;
      sc.dataset.robochelDjiCatalog='1';
      sc.onload=()=>resolve(djiProducts());
      sc.onerror=()=>resolve([]);
      document.head.append(sc);
      setTimeout(()=>resolve(djiProducts()),3000);
    }).finally(()=>{djiCatalogPromise=null;});
    return djiCatalogPromise;
  }

  const siteIntent = (q,n,hits=[]) => {
    if(hits.length) return true;
    return /ccctrade|ccc trade|этот сайт|наш сайт|ваш сайт|на сайте|каталог|ассортимент|что прода|что у вас|товар|купить|заказ|заказать|цена|стоим|оплат|достав|менеджер|контакт|телеграм|telegram|email|почт|офис|yiwu|иву|иу|unitree|go2|g1|r1|loona|dji|дрон|робот|humanoid|quadruped|robot|drone|无人机|机器人|目录|价格|购买|配送|支付|义乌/.test(n);
  };

  const compactRobotLine = p => {
    const price=p.price?rub(p.price):'';
    const fit=localized(p.fit);
    return `• ${p.name}${price?` — ${price}`:''}${fit?`\n  ${fit}`:''}`;
  };
  const compactDroneLine = p => {
    const price=p.price?rub(p.price):'';
    const use=localized(p.use);
    const sp=p.specs||{};
    const specs=[sp.camera,sp.flight,sp.weight].filter(Boolean).join(' · ');
    return `• ${p.name}${price?` — ${price}`:''}${specs?`\n  ${specs}`:''}${use?`\n  ${use}`:''}`;
  };

  async function siteFirstAnswer(q,n,hits=[]){
    if(!siteIntent(q,n,hits)) return null;
    const conceptual=/что такое робот|что такое дрон|what is a robot|what is a drone|机器人是什么|无人机是什么/.test(n);
    if(conceptual) return null;

    if(/контакт|связат|менеджер|телеграм|telegram|email|почт|телефон|phone|contact|联系|邮箱|电话/.test(n)){
      memory.topic='site';
      const text=lang==='ru'
        ? 'Контакты CCCTrade:\n• Telegram: @CheliUsNick\n• Email: helloitisnick@gmail.com\n• Телефон: +7 952 082-45-39\n• Офис: Yiwu, China.\n\nЕсли скажете, какая модель вас интересует и в какую страну нужна доставка, я помогу подготовить вопросы менеджеру.'
        :lang==='zh'
        ? 'CCCTrade 联系方式：\n• Telegram: @CheliUsNick\n• Email: helloitisnick@gmail.com\n• 电话: +7 952 082-45-39\n• 办公地点: 中国义乌。\n\n告诉我你感兴趣的型号和目的国家，我可以帮你整理给经理的问题。'
        : 'CCCTrade contacts:\n• Telegram: @CheliUsNick\n• Email: helloitisnick@gmail.com\n• Phone: +7 952 082-45-39\n• Office: Yiwu, China.\n\nTell me the model and destination country and I can help prepare the questions for the manager.';
      return {text:text+witty(q+'contact')};
    }

    if(/где вы|где офис|где находит|location|where are you|where.*office|地址|在哪里|办公/.test(n)){
      memory.topic='site';
      return {text:lang==='ru'?'CCCTrade работает из Иу (Yiwu), Китай. Отсюда мы подбираем робототехнику и дроны и помогаем организовать поставку в другие страны.':lang==='zh'?'CCCTrade 位于中国义乌。我们从这里协助选择机器人和无人机，并安排面向其他国家的供货。':'CCCTrade operates from Yiwu, China. From there we help select robotics and drones and arrange supply to other countries.'};
    }

    if(/как заказать|как купить|хочу купить|оформить заказ|order|how.*buy|how.*order|购买|下单|怎么购买/.test(n)){
      memory.topic='site';
      const text=lang==='ru'
        ? 'Заказ через CCCTrade устроен просто:\n1. Вы выбираете модель и нужную комплектацию.\n2. Мы уточняем наличие, конфигурацию и конечную цену.\n3. Согласовываем страну назначения и вариант доставки.\n4. После подтверждения менеджер согласовывает доступный способ оплаты и оформление поставки.\n\nНапишите модель, страну и примерный бюджет — я сразу помогу сузить варианты.'
        :lang==='zh'
        ? '通过 CCCTrade 下单可以按这几个步骤：\n1. 选择型号和配置。\n2. 确认库存、配置和最终价格。\n3. 确认目的国家和运输方式。\n4. 确认后由经理沟通可用支付方式和交付安排。\n\n告诉我型号、国家和大概预算，我可以先帮你筛选。'
        : 'Ordering through CCCTrade is straightforward:\n1. Choose the model and configuration.\n2. Confirm availability, configuration and final price.\n3. Agree on destination country and shipping method.\n4. The manager confirms the available payment method and delivery arrangement.\n\nTell me the model, country and approximate budget and I can narrow the options first.';
      return {text:text+witty(q+'order')};
    }

    const wantsDji=/dji|дрон|drone|无人机/.test(n);
    const wantsInventory=/каталог|ассортимент|что прода|что у вас|какие модели|какие роботы|какие дроны|что есть|available|catalog|what.*sell|what.*have|models|目录|有哪些|卖什么/.test(n);
    const wantsPrices=/цены|прайс|сколько стоят|стоимость моделей|prices|price list|how much.*models|价格|多少钱/.test(n);

    if(wantsDji || (wantsInventory && /дрон|drone|dji|无人机/.test(n))){
      memory.topic='dji';
      const drones=await ensureDjiCatalog();
      if(drones.length){
        const named=drones.filter(p=>n.includes(norm(p.name))||n.includes(norm(p.id)));
        const list=(named.length?named:drones).slice(0,named.length?4:8);
        const head=lang==='ru'?'На сайте есть отдельный каталог DJI. Вот варианты из каталога CCCTrade:':lang==='zh'?'网站有独立的 DJI 无人机目录。CCCTrade 目录中的部分型号：':'The site has a dedicated DJI catalog. Here are options from the CCCTrade catalog:';
        const tail=lang==='ru'?'\n\nМогу подобрать дрон под путешествия, FPV, профессиональную съёмку, инспекции или конкретный бюджет — и буду опираться именно на каталог сайта.':lang==='zh'?'\n\n我可以按旅行、FPV、专业拍摄、巡检或预算来筛选，并优先使用网站目录数据。':'\n\nI can narrow these by travel, FPV, professional video, inspection or budget, using the site catalog first.';
        return {text:head+'\n\n'+list.map(compactDroneLine).join('\n\n')+tail+witty(q+'dji')};
      }
      return {text:lang==='ru'?'На сайте есть раздел DJI с дронами для компактной съёмки, путешествий, FPV и профессионального применения. Каталог дронов сейчас не успел загрузиться в помощник, поэтому я не буду придумывать модели или цены. Можно открыть раздел «Дроны» или спросить меня чуть позже.':lang==='zh'?'网站有 DJI 无人机板块，覆盖轻便拍摄、旅行、FPV 和专业用途。无人机目录暂时没有加载到助手中，所以我不会编造型号或价格。可以打开“无人机”板块，或稍后再问。':'The site has a DJI drone section covering compact shooting, travel, FPV and professional use. The drone catalog did not load into the assistant just now, so I will not invent models or prices. Open the Drones section or ask again shortly.'};
    }

    if(wantsInventory){
      memory.topic='catalog';
      const robots=products();
      const drones=await ensureDjiCatalog();
      const robotHead=lang==='ru'?'Роботы в каталоге CCCTrade:':lang==='zh'?'CCCTrade 机器人目录：':'Robots in the CCCTrade catalog:';
      const droneHead=lang==='ru'?'Дроны DJI:':lang==='zh'?'DJI 无人机：':'DJI drones:';
      const robotText=robots.length?robots.slice(0,10).map(compactRobotLine).join('\n\n'):(lang==='ru'?'Каталог роботов не загрузился.':lang==='zh'?'机器人目录暂未加载。':'Robot catalog is not loaded.');
      const droneText=drones.length?drones.slice(0,8).map(p=>`• ${p.name}${p.price?` — ${rub(p.price)}`:''}`).join('\n'):(lang==='ru'?'Каталог DJI загружается отдельно.':lang==='zh'?'DJI 目录单独加载。':'DJI catalog loads separately.');
      const tail=lang==='ru'?'\n\nСкажите, для чего нужен робот или дрон и какой бюджет — я сравню именно товары с сайта, а не случайные модели из интернета.':lang==='zh'?'\n\n告诉我用途和预算，我会优先比较网站里的商品，而不是随机引用互联网上的型号。':'\n\nTell me the use case and budget and I will compare the products on this site, not random models from the internet.';
      return {text:robotHead+'\n\n'+robotText+'\n\n'+droneHead+'\n'+droneText+tail+witty(q+'catalog')};
    }

    if(wantsPrices && !hits.length){
      memory.topic='catalog';
      const robots=products();
      const lines=robots.filter(p=>p.price).map(p=>`• ${p.name} — ${rub(p.price)}`);
      const text=lang==='ru'?'Цены, которые сейчас указаны в каталоге сайта:\n'+lines.join('\n')+'\n\nЭто цены из каталога CCCTrade; конкретная комплектация и финальная стоимость поставки могут потребовать уточнения.':lang==='zh'?'网站目录当前显示的价格：\n'+lines.join('\n')+'\n\n这些是 CCCTrade 目录价格；具体配置和最终交付价格可能需要进一步确认。':'Prices currently shown in the site catalog:\n'+lines.join('\n')+'\n\nThese are CCCTrade catalog prices; configuration and final delivered price may still need confirmation.';
      return {text:text+witty(q+'prices')};
    }

    if(/сайт|ccctrade|ccc trade|о компании|company|about.*site|about.*company|网站|公司/.test(n)){
      memory.topic='site';
      const text=lang==='ru'?'CCCTrade — сайт по робототехнике и дронам с офисом в Иу, Китай. Здесь собраны роботы Unitree и другие модели, отдельный каталог DJI, характеристики, ориентировочные цены, сравнение, подбор, информация об оплате и доставке. Моя основная задача здесь — помогать именно по этому каталогу и по покупке, а уже потом отвечать на общие вопросы.':lang==='zh'?'CCCTrade 是一个机器人与无人机网站，办公地点在中国义乌。网站包含 Unitree 等机器人、独立 DJI 目录、参数、参考价格、对比、选型、支付和配送信息。我的首要任务是回答与本网站目录和购买相关的问题，其次才是一般知识问题。':'CCCTrade is a robotics and drone site based in Yiwu, China. It includes Unitree and other robots, a dedicated DJI catalog, specifications, indicative prices, comparisons, product selection, payments and shipping information. My first job here is to answer from this site catalog and help with purchasing; general questions come second.';
      return {text:text+witty(q+'site')};
    }

    if(hits.length){
      memory.topic='product';
      memory.lastProducts=hits;
      return {text:productSummary(hits[0],q),extra:productCards([hits[0]])};
    }

    return null;
  }
  let freeSession=null;
  const randomPick = arr => arr[Math.floor(Math.random()*arr.length)];
  const timeout = (p,ms=7000) => Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);

  async function freeFormAnswer(q,n,allowInternet=true){
    const persona = lang==='ru'
      ? 'Ты RoboChel AI — умный, спокойный и иногда остроумный помощник CCCTrade. Отвечай естественно и содержательно. На простой вопрос отвечай кратко, на сложный — подробно, обычно 2–5 абзацев. Помни контекст разговора. Не выдумывай точные факты и не притворяйся уверенным, если данных нет. Лёгкий юмор допустим иногда, но не в каждом ответе.'
      : lang==='zh'
      ? '你是 RoboChel AI，CCCTrade 的智能助手。回答自然、有逻辑、有内容。简单问题简洁回答，复杂问题通常用 2–5 段解释。记住上下文，不要编造精确事实。不确定时明确说明。可以偶尔幽默，但不要每次开玩笑。'
      : 'You are RoboChel AI, the intelligent CCCTrade assistant. Answer naturally and substantively. Keep simple answers concise and explain harder questions in 2–5 paragraphs. Remember conversational context. Do not invent precise facts or fake certainty. Light humor is welcome occasionally, not in every reply.';
    const history = memory.turns.slice(-10).map(x=>typeof x==='string'?x:x.q).filter(Boolean).join('\n');

    try{
      if(globalThis.LanguageModel && typeof globalThis.LanguageModel.create==='function'){
        if(!freeSession){
          const availability = typeof globalThis.LanguageModel.availability==='function' ? await timeout(globalThis.LanguageModel.availability(),1800) : 'available';
          if(availability!=='unavailable') freeSession = await timeout(globalThis.LanguageModel.create({initialPrompts:[{role:'system',content:persona}]}),6000);
        }
        if(freeSession){
          const out = await timeout(freeSession.prompt('Recent conversation:\n'+history+'\n\nUser question:\n'+q),9000);
          if(out && String(out).trim().length>20) return String(out).trim();
        }
      }
      if(globalThis.ai && globalThis.ai.languageModel && typeof globalThis.ai.languageModel.create==='function'){
        if(!freeSession) freeSession = await timeout(globalThis.ai.languageModel.create({systemPrompt:persona}),6000);
        const out = await timeout(freeSession.prompt('Recent conversation:\n'+history+'\n\nUser question:\n'+q),9000);
        if(out && String(out).trim().length>20) return String(out).trim();
      }
    }catch(err){ console.debug('RoboChel on-device AI unavailable',err); freeSession=null; }

    try{
      if(allowInternet && navigator.onLine){
        const host = lang==='ru' ? 'ru.wikipedia.org' : lang==='zh' ? 'zh.wikipedia.org' : 'en.wikipedia.org';
        const subject = String(q).replace(/^(расскажи( мне)? про|расскажи( мне)? о|что такое|кто такой|кто такая|объясни|tell me about|what is|who is|explain|什么是|谁是|介绍一下)\s*/i,'').replace(/[?!？。]+$/,'').trim().slice(0,160);
        if(subject.length>1){
          const su='https://'+host+'/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(subject)+'&utf8=1&format=json&origin=*&srlimit=2';
          const sr=await timeout(fetch(su,{mode:'cors'}).then(r=>r.ok?r.json():Promise.reject(new Error('wiki '+r.status))),5000);
          const hit=sr && sr.query && sr.query.search && sr.query.search[0];
          if(hit){
            const eu='https://'+host+'/w/api.php?action=query&prop=extracts&explaintext=1&exintro=1&pageids='+hit.pageid+'&format=json&origin=*';
            const er=await timeout(fetch(eu,{mode:'cors'}).then(r=>r.ok?r.json():Promise.reject(new Error('wiki '+r.status))),5000);
            const page=er && er.query && er.query.pages && er.query.pages[hit.pageid];
            if(page && page.extract && page.extract.length>80){
              const text=String(page.extract).replace(/\s+/g,' ').slice(0,2200);
              const intro=lang==='ru' ? 'Разберём подробнее. По справочной информации о «'+page.title+'»:' : lang==='zh' ? '详细说一下。关于“'+page.title+'”的参考信息：' : 'Here is a fuller explanation. Reference information on “'+page.title+'”: ';
              const tail=lang==='ru' ? '\n\nЕсли хотите, я могу продолжить: объяснить проще, глубже, сравнить с чем-то или разобрать конкретную часть.' : lang==='zh' ? '\n\n如果你愿意，我可以继续：用更简单的方式解释、深入分析、做对比或只讲某一个部分。' : '\n\nI can keep going: simplify it, go deeper, compare it with something else, or focus on one specific part.';
              return intro+'\n\n'+text+tail+(Math.random()<0.22?witty(q+'wiki'):'');
            }
          }
        }
      }
    }catch(err){ console.debug('RoboChel knowledge lookup unavailable',err); }

    const starts = lang==='ru'
      ? ['Давайте разберём это спокойно и по смыслу.','Попробую ответить как на нормальный вопрос, а не шаблоном.','Здесь полезно сначала отделить факты от предположений.','Разложу мысль по частям.']
      : lang==='zh'
      ? ['我们按逻辑来拆开这个问题。','我尽量像正常对话一样回答，而不是套模板。','这里先把事实和假设分开比较有用。','我把这个问题分成几个部分来说。']
      : ['Let’s unpack this properly.','I’ll answer it like a real question rather than a canned prompt.','It helps to separate facts from assumptions first.','Let me break the idea into parts.'];
    const middles = lang==='ru'
      ? ['Я могу рассуждать по контексту, но не хочу придумывать конкретные факты, которых нет в моей локальной базе.','Если вопрос требует точных свежих данных, лучше опираться на проверяемый источник; если это объяснение или выбор между вариантами, я могу разложить логику прямо здесь.','Самый полезный путь — уточнить цель, ограничения и то, какой результат для вас считается хорошим.']
      : lang==='zh'
      ? ['我可以结合上下文分析，但不会编造本地知识库里没有的具体事实。','如果问题需要非常新的精确数据，最好依赖可验证来源；如果是解释或方案比较，我可以直接把逻辑拆开。','最有用的做法通常是明确目标、限制条件，以及什么结果才算理想。']
      : ['I can reason from context, but I do not want to invent specific facts that are outside my local knowledge.','If the question needs exact fresh data, a verifiable source matters; if it is an explanation or a choice between options, I can work through the logic here.','The most useful approach is usually to clarify the goal, constraints, and what a good outcome actually means.'];
    const endings = lang==='ru'
      ? ['Сформулируйте вопрос чуть конкретнее — и я продолжу без повторения всей темы.','Можно продолжить одним коротким уточнением, и я раскрою ответ глубже.','Если дадите один дополнительный факт или пример, я смогу сделать ответ заметно точнее.']
      : lang==='zh'
      ? ['再补充一个具体点，我就可以继续深入，不用你重复整个问题。','你只要再给一个简短细节，我就能把答案展开得更深。','如果再给一个事实或例子，我可以把答案做得更准确。']
      : ['Give me one more concrete detail and I can continue without making you repeat the whole topic.','One short clarification is enough for me to go much deeper.','Add one fact or example and I can make the answer substantially more precise.'];
    const humor = lang==='ru'
      ? [' Роботы любят точность. Я тоже, хотя у меня хотя бы нет сервоприводов, которые начинают обижаться.',' И да, иногда лучший алгоритм — сначала понять, что именно мы пытаемся решить.',' Магии тут немного: в основном логика, данные и один очень терпеливый процессор.']
      : lang==='zh'
      ? [' 机器人喜欢准确，我也是——至少我没有会闹脾气的伺服电机。',' 有时候最好的算法，是先弄清楚我们到底要解决什么。',' 这里没多少魔法，主要是逻辑、数据和一个很有耐心的处理器。']
      : [' Robots like precision. So do I, although I do not have servos that get offended.',' Sometimes the best algorithm is figuring out what problem we are actually solving first.',' Not much magic here: mostly logic, data, and one very patient processor.'];
    return randomPick(starts)+'\n\n'+randomPick(middles)+'\n\n'+randomPick(endings)+(Math.random()<0.3?randomPick(humor):'');
  }
  async function answer(raw){
    const q=raw.trim();
    lang=detectLang(q); renderLang();
    const t=TEXT[lang], n=norm(q);
    memory.turns.push({q,lang,at:Date.now()}); if(memory.turns.length>24) memory.turns.shift();
    rememberContext(q);

    let hits=smartProductMatches(q);
    const explicitCompare=/compare|сравн|比较|разниц|difference|vs\b|versus|против/.test(n);

    if(/^(hi|hello|hey|привет|здрав|你好|您好|哈喽)/i.test(q)){
      return {text:pick([
        t.greet,
        lang==='ru'?'Привет 👋 Я на связи. Можно про роботов, дроны, ИИ или просто устроить маленький техно-разбор.':
        lang==='zh'?'你好 👋 我在线。机器人、无人机、AI，或者来个小型科技讨论都可以。':
        'Hi 👋 I’m online. Robots, drones, AI, or a quick tech deep-dive — your choice.',
        lang==='ru'?'Привет! RoboChel проснулся, датчики протёр, готов думать 🤖 Что разбираем?':
        lang==='zh'?'你好！RoboChel 已上线，传感器也“擦亮”了 🤖 想聊什么？':
        'Hey! RoboChel is awake, sensors polished, ready to think. 🤖 What are we unpacking?'
      ],q)};
    }
    if(/спасибо|благодар|thanks|thank you|谢谢|多谢/.test(n)) return {text:pick([
      t.thanks,
      lang==='ru'?'Всегда пожалуйста. Если появится второй вопрос — я не убегу, у меня даже ног не на всех версиях хватает. 🤖':
      lang==='zh'?'不客气。还有问题继续问，我跑不了——有些版本连腿都没有。🤖':
      'Any time. Ask the next one — I’m not going anywhere; some of my versions do not even have legs. 🤖',
      lang==='ru'?'Пожалуйста! Продолжаем — можно углубиться в детали.':lang==='zh'?'不客气！继续吧，我们可以深入一点。':'You’re welcome! We can go deeper if you want.'
    ],q)};
    if(/как дела|how are you|你好吗|最近怎么样/.test(n)) return {text:pick([t.mood,lang==='ru'?'Отлично: температура нормальная, чувство юмора тоже в допуске. 🤖 А у вас что на повестке?':lang==='zh'?'很好：温度正常，幽默模块也在工作。🤖 今天想聊什么？':'Doing well: temperature nominal, humor module within tolerance. 🤖 What’s on the agenda?'],q)};
    if(/кто ты|who are you|你是谁/.test(n)) return {text:t.identity};
    if(/what can you do|что ты умеешь|你会做什么|твои возможност/.test(n)) return {text:`${t.cap}\n\n${lang==='ru'?'Я также помню контекст текущего диалога: можно спросить «а цена?», «а чем он отличается?» или продолжить сравнение без повторения названия модели.':lang==='zh'?'我还会记住当前对话上下文，所以可以直接追问“价格呢？”“有什么区别？”而不用重复型号。':'I also keep the current conversation context, so you can follow up with “what about the price?” or “how is it different?” without repeating the model name.'}`};

    if(/оплат|payment|pay|visa|mastercard|unionpay|alipay|mir|微信|支付/.test(n)){memory.topic='payment';return{text:t.payment+witty(q)};}
    if(/достав|shipping|delivery|ship|发货|配送/.test(n)){
      memory.topic='delivery';
      const tail=memory.profile.country ? (lang==='ru'?`\n\nВы указали направление: ${memory.profile.country}. Для точного расчёта ещё нужна модель и способ перевозки.`:lang==='zh'?`\n\n目前方向：${memory.profile.country}。要精确估算，还需要具体型号和运输方式。`:`\n\nYou mentioned ${memory.profile.country}. For a precise quote I still need the model and transport method.`) : '';
      return{text:t.delivery+tail+witty(q)};
    }

    const djiContext=/dji|дрон|drone|无人机/.test(n);
    if(djiContext){
      const djiSite=await siteFirstAnswer(q,n,hits);
      if(djiSite) return djiSite;
    }
    if(explicitCompare){
      if(hits.length<2 && memory.lastProducts.length>=2) hits=memory.lastProducts;
      if(hits.length>=2){ memory.topic='compare'; memory.lastProducts=hits.slice(0,3); return {text:compareProducts(hits,q),extra:productCards(hits)}; }
      return {text:t.compare};
    }

    if(/подоб|выбр|choose|recommend|select|посовет|какой лучше|что лучше|选机器人|推荐|怎么选/.test(n)){
      memory.topic='choose'; return recommendProducts(q);
    }

    if(hits.length){
      memory.topic='product'; memory.lastProducts=hits;
      if(hits.length>1 && /или|or|还是/.test(n)) return {text:compareProducts(hits,q),extra:productCards(hits)};
      return {text:productSummary(hits[0],q),extra:productCards([hits[0]])};
    }

    const site=await siteFirstAnswer(q,n,hits);
    if(site) return site;

    const k=knowledgeAnswer(q,n);
    if(k) return {text:k};

    if(memory.topic==='payment' && /а как|как именно|подробнее|how|怎么|详细/.test(n)) return {text:t.payment};
    if(memory.topic==='delivery' && /сколько|срок|стоим|how long|cost|多久|多少钱/.test(n)) return {text:t.delivery};
    const siteFocused=siteIntent(q,n,hits);
    const free=await freeFormAnswer(q,n,!siteFocused);
    return {text:free||contextualFallback(q,n)};
  }

  async function submit(v){
    const q=(v??input.value).trim(); if(!q) return;
    add(q,'user'); input.value=''; send.disabled=true;
    status.textContent=lang==='ru'?'думаю…':lang==='zh'?'思考中…':'thinking…';
    try{const r=await answer(q);add(r.text,'assistant',r.extra||'');memory.lastAnswer=r.text||'';}
    catch(err){console.error(err);add(lang==='ru'?'На секунду запутался в собственных проводах. Повторите вопрос — попробую ещё раз. 🤖':lang==='zh'?'我刚刚在自己的“电线”里绕了一下。请再问一次，我会重试。🤖':'I briefly tangled myself in my own wiring. Ask again and I’ll retry. 🤖','assistant');}
    finally{send.disabled=false;status.textContent=TEXT[lang].status;input.focus();}
  }

  launcher.addEventListener('click',()=>panel.classList.toggle('open'));
  close.addEventListener('click',()=>panel.classList.remove('open'));
  send.addEventListener('click',()=>submit());
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}});
  quick.addEventListener('click',e=>{const b=e.target.closest('.robochel-chip');if(b)submit(b.textContent);});
  human.addEventListener('click',()=>add('helloitisnick@gmail.com · +7 952 082-45-39','assistant'));
  document.querySelector('.robochel-lang').addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(b){lang=b.dataset.lang;renderLang();}});

  window.RoboChelAI={
    open(){panel.classList.add('open');setTimeout(()=>input.focus(),50);},
    close(){panel.classList.remove('open');}
  };
})();