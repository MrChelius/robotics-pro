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
      cap:'Я умею вести обычный диалог, отвечать про роботов, ИИ, LiDAR, компьютерное зрение, автономную навигацию, гуманоидных и четвероногих роботов, дроны, помогать выбирать товары, объяснять оплату и доставку.',
      payment:'На сайте предусмотрены Alipay China, UnionPay, Visa, Mastercard, MIR, WeChat Pay, крипто и банковский перевод. Фактическая доступность зависит от подключённого платёжного провайдера.',
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
      cap:'I can hold a normal conversation, answer questions about robots, AI, LiDAR, computer vision, autonomous navigation, humanoid and quadruped robots, drones, help choose products, and explain payments and shipping.',
      payment:'The site is prepared for Alipay China, UnionPay, Visa, Mastercard, MIR, WeChat Pay, crypto and bank transfer. Actual availability depends on the connected payment provider.',
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
      cap:'我可以进行日常对话，回答机器人、人工智能、LiDAR、计算机视觉、自动导航、人形机器人、四足机器人和无人机相关问题，也可以帮助选购、支付和配送。',
      payment:'网站已为 Alipay China、UnionPay、Visa、Mastercard、MIR、WeChat Pay、加密货币和银行转账做好准备。实际可用方式取决于接入的支付服务商。',
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
  const memory = { topic:'', turns:[], lastProducts:[] };
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

  function answer(raw){
    const q=raw.trim();
    lang=detectLang(q); renderLang();
    const t=TEXT[lang];
    const s=q.toLowerCase();
    memory.turns.push(q); if(memory.turns.length>8) memory.turns.shift();

    const exact=findProducts(s);
    if(exact.length){
      memory.topic='product';
      const names=exact.map(p=>p.name||p.id).join(', ');
      const intro=lang==='ru'?`Да, знаю ${names}. Могу рассказать о назначении, характеристиках, цене и помочь сравнить с другими моделями.`:lang==='zh'?`当然，我了解 ${names}。我可以介绍用途、参数、价格，也可以和其他型号比较。`:`Yes, I know ${names}. I can explain its purpose, specifications and pricing context, or compare it with other models.`;
      return {text:intro,extra:productCards(exact)};
    }

    if(/^(hi|hello|hey|привет|здрав|你好|您好)/i.test(s)) return {text:t.greet};
    if(/спасибо|thanks|thank you|谢谢/.test(s)) return {text:t.thanks};
    if(/как дела|how are you|你好吗|最近怎么样/.test(s)) return {text:t.mood};
    if(/кто ты|who are you|你是谁/.test(s)) return {text:t.identity};
    if(/what can you do|что ты умеешь|你会做什么/.test(s)) return {text:t.cap};
    if(/оплат|payment|pay|visa|mastercard|unionpay|alipay|mir|微信|支付/.test(s)){memory.topic='payment';return{text:t.payment};}
    if(/достав|shipping|delivery|ship|发货|配送/.test(s)){memory.topic='delivery';return{text:t.delivery};}
    if(/compare|сравн|比较/.test(s)){memory.topic='compare';return{text:t.compare};}
    if(/подоб|выбр|choose|recommend|select|选机器人|推荐/.test(s)){memory.topic='choose';return{text:t.choose,extra:productCards(products().slice(0,4))};}
    if(/lidar|лидар|激光雷达/.test(s)){memory.topic='lidar';return{text:t.lidar};}
    if(/computer vision|компьютерн.*зрен|视觉/.test(s)){memory.topic='vision';return{text:t.vision};}
    if(/humanoid|гуманоид|人形/.test(s)){memory.topic='humanoid';return{text:t.humanoid};}
    if(/quadruped|четвероног|四足/.test(s)){memory.topic='quadruped';return{text:t.quadruped};}
    if(/drone|дрон|无人机/.test(s)){memory.topic='drone';return{text:t.drone};}
    if(/battery|runtime|автоном|батаре|续航|电池/.test(s)){memory.topic='battery';return{text:t.battery};}
    if(/\bai\b|ии|artificial intelligence|人工智能/.test(s)){memory.topic='ai';return{text:t.ai};}

    if(memory.topic==='payment') return {text:t.payment};
    if(memory.topic==='delivery') return {text:t.delivery};
    if(memory.topic==='lidar') return {text:t.lidar};
    if(memory.topic==='vision') return {text:t.vision};
    if(memory.topic==='humanoid') return {text:t.humanoid};
    if(memory.topic==='quadruped') return {text:t.quadruped};
    if(memory.topic==='drone') return {text:t.drone};
    return {text:t.fallback};
  }

  function submit(v){
    const q=(v??input.value).trim(); if(!q) return;
    add(q,'user'); input.value='';
    setTimeout(()=>{const r=answer(q);add(r.text,'assistant',r.extra||'');},180);
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