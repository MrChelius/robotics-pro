(() => {
  'use strict';
  if (window.__roboChelMascotLoaded) return;
  window.__roboChelMascotLoaded = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width:700px)').matches;
  const lang = (() => {
    const q = new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'ru';
    return /^zh/.test(q) ? 'zh' : /^en/.test(q) ? 'en' : 'ru';
  })();

  const SAY = {
    ru: ['Привет! Я RoboChel 👋', 'Нажми на меня — помогу!', 'Поговорим о роботах?', 'Мне скучно…', 'Я рядом 🤖', 'Смотри, как умею! ✨', 'Пожалуй, немного полежу…', 'Я снова бодр!'],
    en: ['Hi! I’m RoboChel 👋', 'Click me — I can help!', 'Want to talk robots?', 'I’m bored…', 'I’m right here 🤖', 'Watch this! ✨', 'I think I’ll lie down for a bit…', 'I’m awake again!'],
    zh: ['你好！我是 RoboChel 👋', '点我，我可以帮你！', '聊聊机器人吗？', '我有点无聊…', '我就在这里 🤖', '看我的！✨', '我先躺一会儿…', '我又精神起来了！']
  };
  const lines = SAY[lang];

  const root = document.createElement('div');
  root.className = 'robochel-mascot';
  root.innerHTML = `<button type="button" aria-label="RoboChel AI">
    <span class="robochel-bubble">${lines[0]}</span>
    <span class="robochel-zzz">Zzz</span>
    <span class="robochel-badge">RoboChel AI</span>
    <svg viewBox="0 0 120 150" role="img" aria-label="RoboChel">
      <g class="rc-core">
        <ellipse class="rc-shadow" cx="60" cy="139" rx="31" ry="6" fill="rgba(23,27,25,.15)"/>
        <path d="M44 99 35 132c-2 8 8 13 14 6l11-24 10 24c6 7 16 2 14-6L76 99Z" fill="#eef3ef" stroke="#9da8a1" stroke-width="2"/>
        <path d="M47 128c-7 1-12 7-11 13 8 4 17 3 23-2l-3-10Z" fill="#202724"/>
        <path d="M73 128c7 1 12 7 11 13-8 4-17 3-23-2l3-10Z" fill="#202724"/>
        <path d="M39 62c-8 7-13 21-10 32l14 7 6-29Z" fill="#f8fbf8" stroke="#9da8a1" stroke-width="2"/>
        <path d="M81 62c10 5 17 13 21 24 2 6-6 11-10 5L76 74Z" fill="#f8fbf8" stroke="#9da8a1" stroke-width="2"/>
        <circle cx="101" cy="90" r="7" fill="#202724"/>
        <path d="M41 69c0-14 9-23 19-23s19 9 19 23v32c0 13-38 13-38 0Z" fill="#f7faf7" stroke="#9da8a1" stroke-width="2"/>
        <path d="M50 79h20l8 15-18 10-18-10Z" fill="#202724"/>
        <path d="m60 86 5 8-5 4-5-4Z" fill="#79f2a8"/>
        <rect x="20" y="18" width="80" height="51" rx="25" fill="#f9fbf9" stroke="#9da8a1" stroke-width="2"/>
        <rect x="29" y="25" width="62" height="37" rx="18" fill="#101713"/>
        <path d="M36 39c3-5 9-5 12 0" fill="none" stroke="#79f2a8" stroke-width="5" stroke-linecap="round"/>
        <path d="M72 39c3-5 9-5 12 0" fill="none" stroke="#79f2a8" stroke-width="5" stroke-linecap="round"/>
        <path d="M45 49c7 8 23 8 30 0" fill="none" stroke="#79f2a8" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 16V5" stroke="#65716a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="4" r="4" fill="#79f2a8"/>
      </g>
    </svg>
  </button>`;
  document.body.append(root);

  const btn = root.querySelector('button');
  const bubble = root.querySelector('.robochel-bubble');

  let x = mobile ? 14 : 24;
  let groundY = Math.max(80, innerHeight - (mobile ? 120 : 170));
  let airY = 0;
  let velocityY = 0;
  let airborne = false;
  let flipping = false;
  let flipAngle = 0;
  let lastFrame = performance.now();
  let lastInteraction = Date.now();
  let idleTimer;
  let moveTimer;
  let restTimer;
  let bubbleTimer;
  let landingTimer;

  const clampPosition = () => {
    x = Math.max(8, Math.min(innerWidth - (mobile ? 82 : 118), x));
    groundY = Math.max(72, Math.min(innerHeight - (mobile ? 110 : 150), groundY));
  };

  const render = () => {
    clampPosition();
    root.style.setProperty('--rc-x', `${x}px`);
    root.style.setProperty('--rc-y', `${groundY + airY}px`);
    root.style.setProperty('--rc-flip', `${flipAngle}deg`);
    root.style.setProperty('--rc-air', `${Math.min(1, Math.max(0, -airY / 90))}`);
  };

  const say = (text, duration = 2200) => {
    clearTimeout(bubbleTimer);
    bubble.textContent = text;
    root.classList.add('show-bubble');
    bubbleTimer = setTimeout(() => root.classList.remove('show-bubble'), duration);
  };

  const clearRest = () => {
    clearTimeout(restTimer);
    root.classList.remove('is-resting', 'is-bored', 'is-dozing');
  };

  const wake = (showMessage = false) => {
    const wasResting = root.classList.contains('is-resting') || root.classList.contains('is-dozing');
    lastInteraction = Date.now();
    clearRest();
    clearTimeout(idleTimer);
    if (wasResting) {
      root.classList.add('is-waking');
      setTimeout(() => root.classList.remove('is-waking'), 520);
      if (showMessage) say(lines[7], 1400);
    }
    idleTimer = setTimeout(enterIdleMood, 14000 + Math.random() * 9000);
  };

  const enterIdleMood = () => {
    if (Date.now() - lastInteraction < 13000 || airborne || root.classList.contains('is-hidden')) {
      wake(false);
      return;
    }

    const roll = Math.random();
    if (roll < 0.42) {
      root.classList.add('is-bored');
      say(lines[3], 2200);
      restTimer = setTimeout(() => {
        if (Date.now() - lastInteraction > 17000) lieDown();
      }, 4500 + Math.random() * 4000);
    } else {
      lieDown();
    }
  };

  const lieDown = () => {
    if (airborne) return;
    clearRest();
    root.classList.add('is-resting');
    say(lines[6], 1800);
    restTimer = setTimeout(() => {
      if (Date.now() - lastInteraction > 18000) {
        root.classList.add('is-dozing');
      }
    }, 2600);
  };

  const land = () => {
    airY = 0;
    velocityY = 0;
    airborne = false;
    flipAngle = flipping ? 360 : 0;
    flipping = false;
    root.classList.remove('is-airborne', 'is-flipping');
    root.classList.add('is-landing');
    clearTimeout(landingTimer);
    landingTimer = setTimeout(() => {
      root.classList.remove('is-landing');
      flipAngle = 0;
      render();
    }, 260);
  };

  const jump = (power = 760, doFlip = false) => {
    if (reduce || airborne || root.classList.contains('is-resting')) {
      if (root.classList.contains('is-resting')) wake(true);
      return;
    }
    wake(false);
    airborne = true;
    velocityY = -power;
    flipping = doFlip && !mobile;
    flipAngle = 0;
    root.classList.add('is-airborne');
    if (flipping) root.classList.add('is-flipping');
  };

  const flip = () => {
    if (reduce) return;
    wake(false);
    say(lines[5], 1200);
    if (!airborne) jump(860, true);
    else if (!mobile) flipping = true;
  };

  const physics = now => {
    const dt = Math.min(0.032, (now - lastFrame) / 1000 || 0);
    lastFrame = now;

    if (airborne) {
      velocityY += 1850 * dt;
      airY += velocityY * dt;
      if (flipping) flipAngle += 500 * dt;
      if (airY >= 0 && velocityY > 0) land();
      render();
    }

    requestAnimationFrame(physics);
  };

  const moveTo = nx => {
    if (mobile || reduce || root.classList.contains('is-resting') || airborne) return;
    x = Math.max(12, Math.min(innerWidth - 130, nx));
    root.classList.add('is-running');
    render();
    setTimeout(() => root.classList.remove('is-running'), 1450);
  };

  const roam = () => {
    if (reduce || mobile || root.classList.contains('is-resting') || root.classList.contains('is-dozing')) return;
    moveTo(20 + Math.random() * Math.max(40, innerWidth - 170));

    const trick = Math.random();
    if (trick > 0.80) setTimeout(() => jump(720 + Math.random() * 100, false), 520);
    if (trick > 0.93) setTimeout(flip, 650);
  };

  const scheduleRoam = () => {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      if (Date.now() - lastInteraction < 18000) roam();
      scheduleRoam();
    }, 6500 + Math.random() * 7000);
  };

  btn.addEventListener('click', () => {
    wake(true);
    if (!airborne && Math.random() > 0.62) jump(690 + Math.random() * 80, false);
    say(lines[1], 1000);
    if (window.RoboChelAI?.open) setTimeout(() => window.RoboChelAI.open(), 130);
  });

  btn.addEventListener('dblclick', e => {
    e.preventDefault();
    flip();
  });

  btn.addEventListener('mouseenter', () => {
    wake(false);
    say(lines[Math.floor(Math.random() * lines.length)], 1800);
  });

  ['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => wake(false), { passive: true }));

  addEventListener('resize', () => {
    groundY = Math.min(groundY, Math.max(80, innerHeight - (mobile ? 120 : 170)));
    render();
  });

  const vis = () => {
    const hidden = !!document.querySelector('.robochel-chat-panel.open, dialog[open]');
    root.classList.toggle('is-hidden', hidden);
    if (!hidden) wake(false);
  };
  new MutationObserver(vis).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'open'] });

  render();
  wake(false);
  scheduleRoam();
  requestAnimationFrame(physics);
  setTimeout(() => say(lines[0], 2200), 700);
})();