/* KakiGames – Partyspiele für Freunde auf einem Handy */
(function () {
  'use strict';

  const DATA = window.KG_DATA;
  const app = document.getElementById('app');

  /* Läuft die App eingebettet (z. B. als Vorschau-Link)? Dann ohne Browser-Verlauf und ohne Installations-Hinweis. */
  let IN_FRAME = false;
  try { IN_FRAME = window.self !== window.top; } catch (e) { IN_FRAME = true; }

  /* ================================================================
   * Speicher
   * ================================================================ */
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('kg:' + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem('kg:' + key, JSON.stringify(val)); } catch (e) { /* egal */ }
    }
  };

  const ALL_CATEGORY_IDS = DATA.imposterCategories.map(c => c.id);

  const state = {
    players: store.get('players', []),
    imposter: Object.assign({
      categories: ALL_CATEGORY_IDS.slice(),
      hintMode: 'word',          // 'none' | 'category' | 'word'
      imposterCount: 1,
      timer: 0,                  // Minuten, 0 = aus
      custom: ''                 // eigene Wörter, eine Zeile pro Wort
    }, store.get('imposterSettings', {})),
    usedWords: store.get('usedWords', [])
  };

  const savePlayers = () => store.set('players', state.players);
  const saveImposter = () => store.set('imposterSettings', state.imposter);

  /* ================================================================
   * Hilfsfunktionen
   * ================================================================ */
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC_MAP[c]);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function makeDeck(items) {
    let pile = [];
    return { draw() { if (!pile.length) pile = shuffle(items); return pile.pop(); } };
  }

  const AVATAR_COLORS = ['#ff5470', '#ff8a3d', '#ffc53d', '#2ee59d', '#22c3e6', '#7c5cff', '#f15bb5', '#00bbf9', '#9ef01a', '#ff6b6b'];
  function avatarColor(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }
  function avatar(name, size = '') {
    const first = (Array.from(name.trim())[0] || '?').toUpperCase();
    return `<span class="avatar ${size}" style="--av:${avatarColor(name)}" aria-hidden="true">${esc(first)}</span>`;
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* egal */ }
  }

  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
  }

  /* Bildschirm anlassen während eines Spiels */
  let wakeLock = null;
  let wantAwake = false;
  async function keepAwake(on) {
    wantAwake = on;
    try {
      if (on && !wakeLock && 'wakeLock' in navigator && document.visibilityState === 'visible') {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } else if (!on && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch (e) { /* nicht unterstützt */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (wantAwake && document.visibilityState === 'visible') keepAwake(true);
  });

  /* Ton für den Timer */
  let audioCtx = null;
  function unlockAudio() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { /* kein Audio */ }
  }
  function alarm() {
    vibrate([300, 120, 300, 120, 600]);
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime;
    [0, 0.28, 0.56].forEach((d, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = i === 2 ? 990 : 660;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.24);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0 + d);
      o.stop(t0 + d + 0.26);
    });
  }

  /* ================================================================
   * Bildschirme, Zurück-Taste & Dialoge
   * ================================================================ */
  const ICON = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>'
  };

  let cleanups = [];
  let currentActs = {};
  let backHandler = null;
  let pushed = false;
  let ignoreNextPop = false;

  function onCleanup(fn) { cleanups.push(fn); }
  function acts(map) { currentActs = map; }

  function ensurePushed() {
    if (pushed || IN_FRAME) return;
    try {
      history.pushState({ kg: true }, '');
      pushed = true;
    } catch (e) { /* ohne Verlauf weiter */ }
  }

  function render(html, { theme = '', back = null } = {}) {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* egal */ } });
    cleanups = [];
    currentActs = {};
    closeAllModals();
    backHandler = back;
    if (back) {
      ensurePushed();
    } else if (pushed) {
      // Auf dem Startbildschirm brauchen wir keinen Extra-Eintrag im Verlauf.
      pushed = false;
      ignoreNextPop = true;
      history.back();
    }
    document.body.dataset.theme = theme;
    app.innerHTML = html;
    window.scrollTo(0, 0);
    return app;
  }

  function goBack() {
    if (pushed) history.back();
    else if (backHandler) backHandler();
  }

  window.addEventListener('popstate', () => {
    if (ignoreNextPop) { ignoreNextPop = false; return; }
    pushed = false;
    if (closeTopModal()) { if (backHandler) ensurePushed(); return; }
    if (backHandler) backHandler();
  });

  app.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (!t || !app.contains(t) || t.disabled) return;
    const act = t.dataset.act;
    if (act === 'back') return goBack();
    if (act === 'gohome') return home();
    if (act === 'help') return showRules(t.dataset.game);
    if (currentActs[act]) currentActs[act](t, e);
  });

  app.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) {
      e.preventDefault();
      e.target.click();
    }
  });

  const ref = (root, name) => root.querySelector(`[data-ref="${name}"]`);

  function topbar({ title = '', left = 'back', right = '' } = {}) {
    let l = '<span class="icon-spacer"></span>';
    if (left === 'back') l = `<button class="icon-btn" data-act="back" aria-label="Zurück">${ICON.back}</button>`;
    if (left === 'close') l = `<button class="icon-btn" data-act="back" aria-label="Spiel beenden">${ICON.close}</button>`;
    if (left === 'home') l = `<button class="icon-btn" data-act="gohome" aria-label="Hauptmenü">${ICON.home}</button>`;
    return `<header class="topbar">${l}<h1 class="topbar-title">${esc(title)}</h1>${right || '<span class="icon-spacer"></span>'}</header>`;
  }
  const helpBtn = game => `<button class="icon-btn" data-act="help" data-game="${game}" aria-label="Spielregeln">?</button>`;

  /* --- Dialoge --- */
  const openModals = [];

  function openModal({ title = '', html = '', actions = [{ label: 'OK', value: true, primary: true }], onMount } = {}) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'modal-backdrop';
      wrap.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
          <div class="modal-body">${html}</div>
          <div class="modal-actions">
            ${actions.map((a, i) => `<button class="btn btn-sm ${a.primary ? '' : 'btn-ghost'}" data-i="${i}">${a.label}</button>`).join('')}
          </div>
        </div>`;
      document.body.appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('open'));

      const entry = {
        close(val) {
          const idx = openModals.indexOf(entry);
          if (idx === -1) return;
          openModals.splice(idx, 1);
          wrap.classList.remove('open');
          setTimeout(() => wrap.remove(), 200);
          resolve(val);
        }
      };
      openModals.push(entry);

      wrap.addEventListener('click', e => {
        if (e.target === wrap) return entry.close(null);
        const b = e.target.closest('[data-i]');
        if (!b) return;
        const a = actions[+b.dataset.i];
        entry.close(typeof a.value === 'function' ? a.value(wrap) : a.value);
      });
      if (onMount) onMount(wrap);
    });
  }
  function closeTopModal() {
    const top = openModals[openModals.length - 1];
    if (!top) return false;
    top.close(null);
    return true;
  }
  function closeAllModals() { while (closeTopModal()) { /* weiter */ } }

  async function confirmQuit(onQuit) {
    ensurePushed();
    const ok = await openModal({
      title: 'Spiel beenden?',
      html: '<p>Die aktuelle Runde geht dabei verloren.</p>',
      actions: [{ label: 'Weiterspielen', value: false }, { label: 'Beenden', value: true, primary: true }]
    });
    if (ok) onQuit();
  }

  /* --- Regeln --- */
  const RULES = {
    imposter: {
      title: '🕵️ So geht Imposter',
      html: `<ol class="rules">
        <li>Tragt alle Spieler ein und gebt das Handy reihum weiter.</li>
        <li>Jeder tippt auf die Karte und schaut sich <b>geheim</b> seine Rolle an. Alle bekommen dasselbe Wort – nur der <b>Imposter</b> nicht. Je nach Einstellung bekommt er einen kleinen Tipp.</li>
        <li>Reihum sagt jeder <b>ein Wort</b>, das zum Begriff passt. Nicht zu offensichtlich – sonst errät der Imposter das Wort!</li>
        <li>Dann wird diskutiert und abgestimmt: Wer ist der Imposter?</li>
        <li>Wird der Imposter erwischt, darf er noch das Wort raten. Liegt er richtig, gewinnt er trotzdem!</li>
      </ol>`
    },
    wwe: {
      title: '👉 So geht „Wer würde eher?“',
      html: `<ol class="rules">
        <li>Lest die Karte laut vor.</li>
        <li>Auf drei zeigen alle gleichzeitig auf die Person, die am ehesten passt.</li>
        <li>Wer die meisten Finger abbekommt, muss sich erklären. 😄</li>
      </ol>`
    },
    wop: {
      title: '🎲 So geht Wahrheit oder Pflicht',
      html: `<ol class="rules">
        <li>Die App sagt, wer dran ist.</li>
        <li>Die Person wählt <b>Wahrheit</b> (ehrlich antworten) oder <b>Pflicht</b> (Aufgabe erledigen).</li>
        <li>Wer kneift, bekommt von der Gruppe eine Ersatzaufgabe. Dann ist der Nächste dran.</li>
      </ol>`
    },
    ihnn: {
      title: '🙈 So geht „Ich hab noch nie …“',
      html: `<ol class="rules">
        <li>Lest die Karte laut vor.</li>
        <li>Wer es <b>schon mal gemacht</b> hat, hebt die Hand.</li>
        <li>Die anderen dürfen nachfragen – und es wird erzählt!</li>
      </ol>`
    }
  };
  function showRules(id) {
    const r = RULES[id];
    if (!r) return;
    if (backHandler) ensurePushed();
    openModal({ title: r.title, html: r.html, actions: [{ label: 'Alles klar!', value: true, primary: true }] });
  }

  /* ================================================================
   * Spieler-Verwaltung (wird von allen Spielen genutzt)
   * ================================================================ */
  const MAX_PLAYERS = 20;

  function playerEditorHTML() {
    return `
      <div class="player-editor">
        <form class="add-player" autocomplete="off">
          <input type="text" id="player-name" maxlength="18" placeholder="Name eingeben …" enterkeyhint="done" aria-label="Name eines Spielers">
          <button type="submit" class="add-btn" aria-label="Spieler hinzufügen">+</button>
        </form>
        <ul class="player-list" data-ref="plist"></ul>
      </div>`;
  }

  function mountPlayerEditor(root, onChange) {
    const form = root.querySelector('.add-player');
    const input = form.querySelector('input');
    const list = ref(root, 'plist');

    function draw() {
      list.innerHTML = state.players.length
        ? state.players.map((p, i) => `
            <li class="player-row">
              ${avatar(p)}
              <span class="pname">${esc(p)}</span>
              <button type="button" class="del" data-i="${i}" aria-label="${esc(p)} entfernen">${ICON.close}</button>
            </li>`).join('')
        : '<li class="empty">Noch keine Spieler. Tippe oben einen Namen ein. ✍️</li>';
      if (onChange) onChange();
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = input.value.trim().replace(/\s+/g, ' ');
      if (!name) return;
      if (state.players.some(p => p.toLowerCase() === name.toLowerCase())) { toast('Diesen Namen gibt es schon'); return; }
      if (state.players.length >= MAX_PLAYERS) { toast(`Maximal ${MAX_PLAYERS} Spieler`); return; }
      state.players.push(name);
      savePlayers();
      input.value = '';
      draw();
      list.lastElementChild.classList.add('pop');
    });

    list.addEventListener('click', e => {
      const b = e.target.closest('.del');
      if (!b) return;
      state.players.splice(+b.dataset.i, 1);
      savePlayers();
      draw();
    });

    draw();
  }

  function playersScreen() {
    render(`
      <div class="screen">
        ${topbar({ title: 'Spieler' })}
        <main class="content">
          <p class="lead">Die Spieler werden für alle Spiele gespeichert. Gebt das Handy später in dieser Reihenfolge weiter.</p>
          ${playerEditorHTML()}
        </main>
        <footer class="actions"><button class="btn" data-act="done">Fertig</button></footer>
      </div>`, { back: home });
    mountPlayerEditor(app);
    acts({ done: goBack });
  }

  /* ================================================================
   * Startbildschirm
   * ================================================================ */
  const GAMES = [
    { id: 'imposter', title: 'Imposter', emoji: '🕵️', desc: 'Einer kennt das Wort nicht. Findet ihn, bevor er euch austrickst!', meta: '3–20 Spieler', badge: 'Top', start: () => imposterSetup() },
    { id: 'wwe', title: 'Wer würde eher?', emoji: '👉', desc: 'Auf drei zeigen alle auf die Person, die am ehesten …', meta: '3+ Spieler', start: () => cardGame('wwe') },
    { id: 'wop', title: 'Wahrheit oder Pflicht', emoji: '🎲', desc: 'Der Klassiker – die App sagt, wer dran ist.', meta: '2–20 Spieler', start: () => wopSetup() },
    { id: 'ihnn', title: 'Ich hab noch nie …', emoji: '🙈', desc: 'Wer es schon mal gemacht hat, muss beichten!', meta: '2+ Spieler', start: () => cardGame('ihnn') }
  ];

  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    const box = document.querySelector('[data-ref="install"]');
    if (box) drawInstall(box);
  });

  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function drawInstall(box) {
    if (IN_FRAME || isStandalone() || store.get('installDismissed', false)) { box.hidden = true; return; }
    if (deferredInstall) {
      box.innerHTML = `<span>📲 Hol dir KakiGames als App auf den Homescreen!</span>
        <button class="pill" data-act="install">Installieren</button>`;
      box.hidden = false;
    } else if (isIOS()) {
      box.innerHTML = `<span>📲 Als App speichern: Tippe unten auf <b>Teilen</b> <span class="share-ico">⬆︎</span> und dann auf <b>„Zum Home-Bildschirm“</b>.</span>
        <button class="pill ghost" data-act="installno" aria-label="Hinweis schließen">✕</button>`;
      box.hidden = false;
    } else {
      box.hidden = true;
    }
  }

  function home() {
    keepAwake(false);
    const n = state.players.length;
    render(`
      <div class="screen home">
        <header class="home-header">
          <div class="logo">
            <img src="icons/icon.svg" alt="" class="logo-icon" width="48" height="48">
            <div class="logo-text">Kaki<span>Games</span></div>
          </div>
          <button class="players-chip" data-act="players" aria-label="Spieler verwalten">👥<span class="chip-label"> Spieler</span>${n ? ` <b class="chip-count">${n}</b>` : ''}</button>
        </header>
        <p class="tagline">Partyspiele für dich &amp; deine Freunde – alles auf einem Handy. 📱</p>
        <div class="game-list">
          ${GAMES.map((g, i) => `
            <button class="game-card game-${g.id}" data-act="game" data-id="${g.id}" style="--d:${i * 70}ms">
              <span class="game-emoji" aria-hidden="true">${g.emoji}</span>
              <span class="game-info">
                <span class="game-title">${esc(g.title)}</span>
                <span class="game-desc">${esc(g.desc)}</span>
                <span class="game-meta">${esc(g.meta)}</span>
              </span>
              ${g.badge ? `<span class="game-badge">${esc(g.badge)}</span>` : ''}
            </button>`).join('')}
        </div>
        <div class="install" data-ref="install" hidden></div>
        <p class="footer-note">Made with 🧡 – KakiGames</p>
      </div>`);
    drawInstall(ref(app, 'install'));
    acts({
      players: playersScreen,
      game: t => { const g = GAMES.find(x => x.id === t.dataset.id); if (g) g.start(); },
      install: async () => {
        if (!deferredInstall) return;
        deferredInstall.prompt();
        try { await deferredInstall.userChoice; } catch (e) { /* egal */ }
        deferredInstall = null;
        drawInstall(ref(app, 'install'));
      },
      installno: () => { store.set('installDismissed', true); drawInstall(ref(app, 'install')); }
    });
  }

  /* ================================================================
   * IMPOSTER
   * ================================================================ */
  const MIN_IMPOSTER_PLAYERS = 3;
  const maxImposters = n => Math.max(1, Math.floor((n - 1) / 2));

  const HINT_MODES = [
    { id: 'none', label: '🚫 Kein Tipp', desc: 'Der Imposter weiß nur, dass er der Imposter ist. Für Profis!' },
    { id: 'category', label: '📂 Kategorie', desc: 'Der Imposter sieht die Kategorie, z. B. „Tiere“.' },
    { id: 'word', label: '💡 Hinweis', desc: 'Der Imposter bekommt ein passendes Hinweiswort, z. B. „Leine“ bei „Hund“.' }
  ];
  const TIMER_OPTIONS = [0, 1, 2, 3, 5];

  function parseCustom(text) {
    return String(text || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const parts = l.split(/\s*[:–—]\s*|\s+-\s+/);
        return { word: (parts[0] || '').trim(), hint: (parts[1] || '').trim() };
      })
      .filter(x => x.word);
  }

  function imposterPool() {
    const s = state.imposter;
    const pool = [];
    DATA.imposterCategories.forEach(c => {
      if (s.categories.includes(c.id)) {
        c.words.forEach(([word, hint]) => pool.push({ word, hint, cat: c.name, emoji: c.emoji }));
      }
    });
    if (s.categories.includes('custom')) {
      parseCustom(s.custom).forEach(({ word, hint }) => pool.push({ word, hint, cat: 'Eigene Wörter', emoji: '✏️' }));
    }
    return pool;
  }

  function imposterSetup() {
    const s = state.imposter;
    render(`
      <div class="screen">
        ${topbar({ title: 'Imposter', right: helpBtn('imposter') })}
        <main class="content">
          <section class="section">
            <div class="section-head"><h3>👥 Spieler</h3><span class="badge" data-ref="pcount"></span></div>
            ${playerEditorHTML()}
          </section>

          <section class="section">
            <div class="section-head"><h3>📚 Kategorien</h3><button class="link-btn" data-act="allcats" data-ref="allcats"></button></div>
            <div class="chips" data-ref="cats"></div>
            <button class="link-btn custom-link" data-act="custom" data-ref="customlink"></button>
          </section>

          <section class="section">
            <div class="section-head"><h3>💡 Tipp für den Imposter</h3></div>
            <div class="segmented" data-ref="hint">
              ${HINT_MODES.map(h => `<button data-act="hint" data-v="${h.id}">${h.label}</button>`).join('')}
            </div>
            <p class="hint-text" data-ref="hintdesc"></p>
          </section>

          <section class="section">
            <div class="section-head"><h3>🕵️ Anzahl Imposter</h3></div>
            <div class="stepper">
              <button data-act="minus" aria-label="Weniger Imposter">−</button>
              <span data-ref="icount" aria-live="polite"></span>
              <button data-act="plus" aria-label="Mehr Imposter">+</button>
            </div>
          </section>

          <section class="section">
            <div class="section-head"><h3>⏱️ Diskussions-Timer</h3></div>
            <div class="segmented" data-ref="timer">
              ${TIMER_OPTIONS.map(m => `<button data-act="timer" data-v="${m}">${m ? m + ' Min' : 'Aus'}</button>`).join('')}
            </div>
          </section>
        </main>
        <footer class="actions">
          <p class="start-warn" data-ref="warn" aria-live="polite"></p>
          <button class="btn" data-act="start" data-ref="start">Spiel starten 🚀</button>
        </footer>
      </div>`, { theme: 'imposter', back: home });

    const root = app;

    function drawCats() {
      const customWords = parseCustom(s.custom);
      const chips = DATA.imposterCategories.map(c =>
        `<button class="chip" data-act="cat" data-id="${c.id}" aria-pressed="${s.categories.includes(c.id)}">${c.emoji} ${esc(c.name)}</button>`);
      if (customWords.length) {
        chips.push(`<button class="chip" data-act="cat" data-id="custom" aria-pressed="${s.categories.includes('custom')}">✏️ Eigene (${customWords.length})</button>`);
      }
      ref(root, 'cats').innerHTML = chips.join('');
      const allOn = ALL_CATEGORY_IDS.every(id => s.categories.includes(id));
      ref(root, 'allcats').textContent = allOn ? 'Keine' : 'Alle';
      ref(root, 'customlink').textContent = customWords.length ? '✏️ Eigene Wörter bearbeiten' : '✏️ Eigene Wörter hinzufügen';
    }

    function drawSettings() {
      root.querySelectorAll('[data-ref="hint"] button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === s.hintMode));
      ref(root, 'hintdesc').textContent = (HINT_MODES.find(h => h.id === s.hintMode) || HINT_MODES[0]).desc;
      root.querySelectorAll('[data-ref="timer"] button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === s.timer));
    }

    function drawStatus() {
      const n = state.players.length;
      ref(root, 'pcount').textContent = n;
      s.imposterCount = clamp(s.imposterCount, 1, maxImposters(n));
      ref(root, 'icount').textContent = s.imposterCount;
      root.querySelector('[data-act="minus"]').disabled = s.imposterCount <= 1;
      root.querySelector('[data-act="plus"]').disabled = s.imposterCount >= maxImposters(n);

      let warn = '';
      if (n < MIN_IMPOSTER_PLAYERS) warn = `Noch ${MIN_IMPOSTER_PLAYERS - n} Spieler nötig (mind. ${MIN_IMPOSTER_PLAYERS}).`;
      else if (!imposterPool().length) warn = 'Wähle mindestens eine Kategorie aus.';
      ref(root, 'warn').textContent = warn;
      ref(root, 'start').disabled = !!warn;
    }

    mountPlayerEditor(root, drawStatus);
    drawCats();
    drawSettings();
    drawStatus();

    const update = () => { saveImposter(); drawCats(); drawSettings(); drawStatus(); };

    acts({
      cat: t => {
        const id = t.dataset.id;
        s.categories = s.categories.includes(id) ? s.categories.filter(x => x !== id) : s.categories.concat(id);
        update();
      },
      allcats: () => {
        const allOn = ALL_CATEGORY_IDS.every(id => s.categories.includes(id));
        s.categories = allOn ? [] : ALL_CATEGORY_IDS.concat(s.categories.includes('custom') ? ['custom'] : []);
        update();
      },
      custom: async () => {
        ensurePushed();
        const text = await openModal({
          title: '✏️ Eigene Wörter',
          html: `<p class="modal-sub">Ein Wort pro Zeile. Optional mit Tipp für den Imposter:<br><code>Wort: Tipp</code></p>
                 <textarea class="textarea" id="custom-words" rows="8" placeholder="Pizza: Italien&#10;Lehrer Müller: Schule&#10;Unser Urlaub 2024">${esc(s.custom)}</textarea>`,
          actions: [{ label: 'Abbrechen', value: null }, { label: 'Speichern', primary: true, value: w => w.querySelector('textarea').value }],
          onMount: w => setTimeout(() => w.querySelector('textarea').focus(), 250)
        });
        if (text == null) return;
        s.custom = text;
        const has = parseCustom(text).length > 0;
        if (has && !s.categories.includes('custom')) s.categories = s.categories.concat('custom');
        if (!has) s.categories = s.categories.filter(x => x !== 'custom');
        update();
        if (has) toast(`${parseCustom(text).length} eigene Wörter gespeichert`);
      },
      hint: t => { s.hintMode = t.dataset.v; update(); },
      timer: t => { s.timer = +t.dataset.v; update(); },
      minus: () => { s.imposterCount--; update(); },
      plus: () => { s.imposterCount++; update(); },
      start: startImposter
    });
  }

  function startImposter() {
    const s = state.imposter;
    const players = state.players.slice();
    const pool = imposterPool();
    if (players.length < MIN_IMPOSTER_PLAYERS || !pool.length) { imposterSetup(); return; }

    // Wörter möglichst nicht wiederholen
    let fresh = pool.filter(w => !state.usedWords.includes(w.word));
    if (!fresh.length) {
      const poolWords = new Set(pool.map(w => w.word));
      state.usedWords = state.usedWords.filter(w => !poolWords.has(w));
      fresh = pool;
    }
    const w = pick(fresh);
    state.usedWords.push(w.word);
    if (state.usedWords.length > 400) state.usedWords = state.usedWords.slice(-400);
    store.set('usedWords', state.usedWords);

    const count = clamp(s.imposterCount, 1, maxImposters(players.length));
    const imposters = new Set(shuffle(players.map((_, i) => i)).slice(0, count));

    const round = {
      word: w.word,
      hint: w.hint,
      category: w.cat,
      emoji: w.emoji,
      players,
      imposters,
      starter: Math.floor(Math.random() * players.length),
      hintMode: s.hintMode,
      timer: s.timer ? { total: s.timer * 60, left: s.timer * 60, running: false, endAt: 0 } : null,
      current: 0
    };
    keepAwake(true);
    imposterReveal(round);
  }

  function roleHTML(round, i) {
    if (round.imposters.has(i)) {
      const multi = round.imposters.size > 1;
      let hint;
      if (round.hintMode === 'word' && round.hint) {
        hint = `<p class="role-label">Dein Tipp</p><p class="role-hint">${esc(round.hint)}</p>`;
      } else if (round.hintMode === 'category' || round.hintMode === 'word') {
        hint = `<p class="role-label">Kategorie</p><p class="role-hint">${round.emoji} ${esc(round.category)}</p>`;
      } else {
        hint = '<p class="role-label">Kein Tipp</p><p class="role-sub">Hör gut zu und bluffe!</p>';
      }
      return `
        <div class="role">
          <div class="role-emoji">🕵️</div>
          <p class="role-title">Du bist ${multi ? 'ein' : 'der'} <strong>IMPOSTER</strong></p>
          ${hint}
          <p class="role-foot">Lass dich nicht erwischen!</p>
        </div>`;
    }
    return `
      <div class="role">
        <p class="role-label">Das geheime Wort</p>
        <p class="role-word">${esc(round.word)}</p>
        <p class="role-cat">${round.emoji} ${esc(round.category)}</p>
        <p class="role-foot">Finde den Imposter – aber verrate das Wort nicht!</p>
      </div>`;
  }

  function imposterReveal(round) {
    const i = round.current;
    const n = round.players.length;
    const name = round.players[i];
    const isLast = i === n - 1;
    const isImposter = round.imposters.has(i);

    render(`
      <div class="screen">
        ${topbar({ title: `Spieler ${i + 1} von ${n}`, left: 'close' })}
        <div class="progress" aria-hidden="true"><span style="width:${(i / n) * 100}%"></span></div>
        <main class="content reveal">
          <p class="eyebrow">Gib das Handy an</p>
          <h2 class="pass-name">${avatar(name, 'lg')}<span>${esc(name)}</span></h2>
          <div class="flip enter" data-act="flip" role="button" tabindex="0" aria-label="Karte umdrehen">
            <div class="flip-inner">
              <div class="flip-face flip-front">
                <div class="front-mark">?</div>
                <p class="front-text">Tippe, um deine Rolle zu sehen</p>
                <p class="front-sub">Nur ${esc(name)} darf schauen 👀</p>
              </div>
              <div class="flip-face flip-back" data-ref="back"></div>
            </div>
          </div>
        </main>
        <footer class="actions">
          <button class="btn" data-act="next" data-ref="next" hidden>${isLast ? 'Verstecken &amp; los geht’s 🚀' : 'Verstecken &amp; weitergeben 👉'}</button>
          <p class="actions-hint" data-ref="nexthint">Erst aufdecken, dann weitergeben</p>
        </footer>
      </div>`, { theme: 'imposter', back: () => confirmQuit(imposterSetup) });

    const flip = app.querySelector('.flip');
    const back = ref(app, 'back');
    const nextBtn = ref(app, 'next');
    const nextHint = ref(app, 'nexthint');
    let hideTimer = null;
    let busy = false;

    function show() {
      clearTimeout(hideTimer);
      back.classList.toggle('is-imposter', isImposter);
      back.classList.toggle('is-crew', !isImposter);
      back.innerHTML = roleHTML(round, i);
      flip.classList.add('is-flipped');
      vibrate(15);
      nextBtn.hidden = false;
      nextHint.hidden = true;
    }
    function hide(done) {
      flip.classList.remove('is-flipped');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        back.innerHTML = '';
        back.classList.remove('is-imposter', 'is-crew');
        if (done) done();
      }, 450);
    }
    onCleanup(() => clearTimeout(hideTimer));

    acts({
      flip: () => {
        if (busy) return;
        if (flip.classList.contains('is-flipped')) hide(); else show();
      },
      next: () => {
        if (busy) return;
        busy = true;
        const go = () => {
          if (isLast) imposterDiscuss(round);
          else { round.current++; imposterReveal(round); }
        };
        if (flip.classList.contains('is-flipped')) hide(go); else go();
      }
    });
  }

  function timerHTML() {
    return `
      <div class="timer" data-ref="timer">
        <svg viewBox="0 0 120 120" class="timer-ring" aria-hidden="true">
          <circle cx="60" cy="60" r="54" class="ring-bg"/>
          <circle cx="60" cy="60" r="54" class="ring-fg" data-ref="ring"/>
        </svg>
        <span class="timer-time" data-ref="ttime" aria-live="off"></span>
      </div>
      <div class="timer-controls">
        <button class="pill" data-act="ttoggle" data-ref="ttoggle"></button>
        <button class="pill ghost" data-act="treset" aria-label="Timer zurücksetzen">↺ Neu</button>
      </div>`;
  }

  function mountTimer(root, ts) {
    const box = ref(root, 'timer');
    const ring = ref(root, 'ring');
    const time = ref(root, 'ttime');
    const toggle = ref(root, 'ttoggle');
    const C = 2 * Math.PI * 54;
    ring.style.strokeDasharray = C;
    let iv = null;

    function draw() {
      const left = Math.max(0, ts.left);
      const secs = Math.ceil(left);
      time.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
      ring.style.strokeDashoffset = C * (1 - left / ts.total);
      box.classList.toggle('done', left <= 0);
      box.classList.toggle('low', left > 0 && left <= 10);
      toggle.textContent = ts.running ? '⏸ Pause' : left <= 0 ? '⏰ Zeit ist um!' : left < ts.total ? '▶ Weiter' : '▶ Timer starten';
      toggle.disabled = left <= 0;
    }
    function tick() {
      ts.left = (ts.endAt - Date.now()) / 1000;
      if (ts.left <= 0) {
        ts.left = 0;
        stop();
        alarm();
      }
      draw();
    }
    function run() { clearInterval(iv); iv = setInterval(tick, 200); }
    function start() {
      if (ts.left <= 0) return;
      unlockAudio();
      ts.running = true;
      ts.endAt = Date.now() + ts.left * 1000;
      run();
      draw();
    }
    function stop() {
      if (ts.running) ts.left = Math.max(0, (ts.endAt - Date.now()) / 1000);
      ts.running = false;
      clearInterval(iv);
      iv = null;
      draw();
    }

    if (ts.running) { tick(); if (ts.running) run(); } else draw();
    onCleanup(() => clearInterval(iv)); // läuft im Hintergrund über endAt weiter

    return {
      toggle: () => (ts.running ? stop() : start()),
      reset: () => { stop(); ts.left = ts.total; draw(); }
    };
  }

  function imposterDiscuss(round) {
    const starter = round.players[round.starter];
    render(`
      <div class="screen">
        ${topbar({ title: 'Diskussion', left: 'close', right: helpBtn('imposter') })}
        <main class="content center">
          <div class="big-emoji bounce" aria-hidden="true">🗣️</div>
          <p class="eyebrow">Es beginnt</p>
          <h2 class="pass-name">${avatar(starter, 'lg')}<span>${esc(starter)}</span></h2>
          <p class="lead">Reihum sagt jeder <b>ein Wort</b>, das zum Begriff passt. Danach diskutiert ihr: Wer ist der Imposter?</p>
          ${round.timer ? timerHTML() : ''}
        </main>
        <footer class="actions"><button class="btn" data-act="vote">Zur Abstimmung 🗳️</button></footer>
      </div>`, { theme: 'imposter', back: () => confirmQuit(imposterSetup) });

    const timer = round.timer ? mountTimer(app, round.timer) : null;
    acts({
      vote: () => imposterVote(round),
      ttoggle: () => timer && timer.toggle(),
      treset: () => timer && timer.reset()
    });
  }

  function imposterVote(round) {
    const multi = round.imposters.size > 1;
    render(`
      <div class="screen">
        ${topbar({ title: 'Abstimmung' })}
        <main class="content">
          <h2 class="h2 center">Wer ist ${multi ? 'ein' : 'der'} Imposter? 🤔</h2>
          <p class="lead center">Zählt bis drei und zeigt alle gleichzeitig auf euren Verdacht. Dann tippt auf die Person mit den meisten Stimmen.</p>
          <div class="vote-grid">
            ${round.players.map((p, i) => `
              <button class="vote-card" data-act="pick" data-i="${i}" style="--d:${i * 40}ms">
                ${avatar(p, 'lg')}<span>${esc(p)}</span>
              </button>`).join('')}
          </div>
        </main>
        <footer class="actions"><button class="btn btn-ghost" data-act="skip">Ohne Abstimmung auflösen</button></footer>
      </div>`, { theme: 'imposter', back: () => imposterDiscuss(round) });

    acts({
      pick: t => voteReveal(round, +t.dataset.i),
      skip: () => imposterResult(round, null)
    });
  }

  function voteReveal(round, i) {
    const name = round.players[i];
    const caught = round.imposters.has(i);
    render(`
      <div class="screen">
        <main class="content center suspense-wrap">
          ${avatar(name, 'xl')}
          <h2 class="suspense">${esc(name)} ist …</h2>
          <div class="dots" data-ref="dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="verdict" data-ref="verdict" aria-live="assertive"></div>
        </main>
        <footer class="actions"><button class="btn" data-act="go" data-ref="go" hidden>Zur Auflösung</button></footer>
      </div>`, { theme: 'imposter', back: () => imposterVote(round) });

    const t = setTimeout(() => {
      ref(app, 'dots').hidden = true;
      ref(app, 'verdict').innerHTML = caught
        ? `<div class="verdict-badge good">🎉 ${round.imposters.size > 1 ? 'ein' : 'der'} IMPOSTER!</div>`
        : '<div class="verdict-badge bad">😱 UNSCHULDIG!</div>';
      vibrate(caught ? [60, 60, 60] : 300);
      ref(app, 'go').hidden = false;
    }, 1800);
    onCleanup(() => clearTimeout(t));
    acts({ go: () => imposterResult(round, i) });
  }

  function imposterResult(round, votedIdx) {
    const impNames = [...round.imposters].map(i => round.players[i]);
    const multi = impNames.length > 1;
    let headline = 'Auflösung 🔍';
    let sub = '';
    if (votedIdx != null) {
      const voted = esc(round.players[votedIdx]);
      if (round.imposters.has(votedIdx)) {
        headline = 'Erwischt! 🎉';
        sub = `<b>${voted}</b> war ${multi ? 'ein' : 'der'} Imposter.<br>Letzte Chance: ${multi ? 'Die Imposter dürfen' : 'Der Imposter darf'} jetzt das Wort raten – richtig geraten heißt trotzdem gewonnen!`;
      } else {
        headline = `${multi ? 'Die Imposter gewinnen' : 'Der Imposter gewinnt'}! 🕵️`;
        sub = `<b>${voted}</b> war unschuldig.`;
      }
    }

    let hintLine = '';
    if (round.hintMode === 'word' && round.hint) hintLine = `<p class="result-hint">Tipp für den Imposter: <b>${esc(round.hint)}</b></p>`;

    render(`
      <div class="screen">
        ${topbar({ title: '', left: 'home' })}
        <main class="content">
          <h2 class="result-title">${headline}</h2>
          ${sub ? `<p class="lead center">${sub}</p>` : ''}
          <div class="result-card result-imp enter">
            <p class="role-label">${multi ? 'Die Imposter waren' : 'Der Imposter war'}</p>
            <div class="imp-names">${impNames.map(nm => `<span class="imp-chip">${avatar(nm)}${esc(nm)}</span>`).join('')}</div>
          </div>
          <div class="result-card result-word enter" style="--d:120ms">
            <p class="role-label">Das geheime Wort</p>
            <p class="result-word-text">${esc(round.word)}</p>
            <p class="role-cat">${round.emoji} ${esc(round.category)}</p>
            ${hintLine}
          </div>
        </main>
        <footer class="actions stack">
          <button class="btn" data-act="again">Neue Runde 🔁</button>
          <div class="row">
            <button class="btn btn-ghost btn-sm" data-act="settings">⚙️ Optionen</button>
            <button class="btn btn-ghost btn-sm" data-act="gohome">🏠 Menü</button>
          </div>
        </footer>
      </div>`, { theme: 'imposter', back: imposterSetup });

    vibrate(40);
    acts({ again: startImposter, settings: imposterSetup });
  }

  /* ================================================================
   * WAHRHEIT ODER PFLICHT
   * ================================================================ */
  let wop = null;

  function wopSetup() {
    keepAwake(false);
    render(`
      <div class="screen">
        ${topbar({ title: 'Wahrheit oder Pflicht', right: helpBtn('wop') })}
        <main class="content">
          <section class="section">
            <div class="section-head"><h3>👥 Spieler</h3><span class="badge" data-ref="pcount"></span></div>
            ${playerEditorHTML()}
          </section>
        </main>
        <footer class="actions">
          <p class="start-warn" data-ref="warn" aria-live="polite"></p>
          <button class="btn" data-act="start" data-ref="start">Los geht’s! 🎲</button>
        </footer>
      </div>`, { theme: 'wop', back: home });

    mountPlayerEditor(app, () => {
      const n = state.players.length;
      ref(app, 'pcount').textContent = n;
      ref(app, 'warn').textContent = n < 2 ? `Noch ${2 - n} Spieler nötig (mind. 2).` : '';
      ref(app, 'start').disabled = n < 2;
    });

    acts({
      start: () => {
        if (state.players.length < 2) return;
        wop = {
          order: shuffle(state.players),
          idx: 0,
          decks: { w: makeDeck(DATA.wahrheit), p: makeDeck(DATA.pflicht) }
        };
        keepAwake(true);
        wopTurn();
      }
    });
  }

  function wopTurn() {
    const name = wop.order[wop.idx % wop.order.length];
    render(`
      <div class="screen">
        ${topbar({ title: 'Wahrheit oder Pflicht', left: 'close', right: helpBtn('wop') })}
        <main class="content center">
          <div class="turn enter">
            ${avatar(name, 'xl')}
            <h2 class="turn-name">${esc(name)}</h2>
            <p class="lead">ist dran! Was nimmst du?</p>
          </div>
          <div class="choice-grid">
            <button class="choice truth" data-act="w"><span aria-hidden="true">😇</span>Wahrheit</button>
            <button class="choice dare" data-act="p"><span aria-hidden="true">😈</span>Pflicht</button>
          </div>
          <button class="link-btn" data-act="rnd">🎲 Zufall entscheiden lassen</button>
        </main>
      </div>`, { theme: 'wop', back: wopSetup });

    acts({
      w: () => wopCard('w'),
      p: () => wopCard('p'),
      rnd: () => wopCard(Math.random() < 0.5 ? 'w' : 'p')
    });
  }

  function wopCard(type) {
    const name = wop.order[wop.idx % wop.order.length];
    const text = wop.decks[type].draw();
    const isTruth = type === 'w';
    render(`
      <div class="screen">
        ${topbar({ title: 'Wahrheit oder Pflicht', left: 'close', right: helpBtn('wop') })}
        <main class="content center">
          <div class="prompt-card ${isTruth ? 'truth' : 'dare'} enter">
            <p class="prompt-kicker">${isTruth ? '😇 Wahrheit' : '😈 Pflicht'}</p>
            <p class="prompt-text">${esc(text)}</p>
            <p class="prompt-for">${avatar(name)} ${esc(name)}</p>
          </div>
        </main>
        <footer class="actions stack">
          <button class="btn" data-act="next">Nächster Spieler 👉</button>
          <button class="btn btn-ghost btn-sm" data-act="other">🔄 Andere Karte</button>
        </footer>
      </div>`, { theme: 'wop', back: wopSetup });

    acts({
      next: () => { wop.idx++; wopTurn(); },
      other: () => wopCard(type)
    });
  }

  /* ================================================================
   * KARTENSPIELE: Wer würde eher? / Ich hab noch nie …
   * ================================================================ */
  const CARD_GAMES = {
    wwe: {
      title: 'Wer würde eher?', theme: 'wwe', prefix: 'Wer würde eher …', items: DATA.werWuerdeEher,
      intro: { emoji: '👉', title: 'Bereit?', text: 'Lest die Karte laut vor. Auf <b>drei</b> zeigen alle gleichzeitig auf die Person, die am ehesten passt!' }
    },
    ihnn: {
      title: 'Ich hab noch nie …', theme: 'ihnn', prefix: 'Ich hab noch nie …', items: DATA.ichHabNochNie,
      intro: { emoji: '🙈', title: 'Bereit?', text: 'Lest die Karte laut vor. Wer es <b>schon mal gemacht</b> hat, hebt die Hand – und muss erzählen!' }
    }
  };

  function cardGame(id) {
    const g = CARD_GAMES[id];
    let deck = shuffle(g.items);
    let pos = -1; // -1 = Startkarte
    keepAwake(true);

    render(`
      <div class="screen">
        ${topbar({ title: g.title, right: helpBtn(id) })}
        <main class="content center">
          <p class="counter" data-ref="counter"></p>
          <div class="prompt-card big" data-act="next" data-ref="card" role="button" tabindex="0" aria-live="polite"></div>
          <p class="tap-hint">Tippe auf die Karte für die nächste</p>
        </main>
        <footer class="actions row">
          <button class="btn btn-ghost btn-square" data-act="prev" data-ref="prev" aria-label="Vorherige Karte">${ICON.back}</button>
          <button class="btn" data-act="next">Nächste Karte</button>
        </footer>
      </div>`, { theme: g.theme, back: home });

    const card = ref(app, 'card');
    const counter = ref(app, 'counter');
    const prev = ref(app, 'prev');

    function show(anim) {
      card.classList.remove('enter', 'enter-back');
      void card.offsetWidth; // Animation neu starten
      card.classList.add(anim);
      if (pos < 0) {
        card.innerHTML = `<div class="prompt-emoji">${g.intro.emoji}</div><p class="prompt-title">${g.intro.title}</p><p class="prompt-sub">${g.intro.text}</p>`;
      } else if (pos >= deck.length) {
        card.innerHTML = '<div class="prompt-emoji">🎉</div><p class="prompt-title">Alle Karten gespielt!</p><p class="prompt-sub">Tippe, um neu zu mischen.</p>';
      } else {
        card.innerHTML = `<p class="prompt-kicker">${g.prefix}</p><p class="prompt-text">${esc(deck[pos])}</p>`;
      }
      counter.textContent = pos >= 0 && pos < deck.length ? `${pos + 1} / ${deck.length}` : ' ';
      prev.disabled = pos < 0;
    }

    show('enter');
    acts({
      next: () => {
        if (pos >= deck.length) { deck = shuffle(g.items); pos = 0; } else pos++;
        vibrate(8);
        show('enter');
      },
      prev: () => {
        if (pos < 0) return;
        pos--;
        show('enter-back');
      }
    });
  }

  /* ================================================================
   * Start
   * ================================================================ */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* offline-Modus optional */ });
    });
  }

  home();
})();
