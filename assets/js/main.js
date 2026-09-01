/* ============================================================
   Salih Yeşil — personal site
   No dependencies. Everything degrades gracefully if it fails.
   ============================================================ */
(function () {
  'use strict';

  var GH_USER = 'salihyesil59';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- theme ---------------- */
  (function theme() {
    var root = document.documentElement;
    var btn = document.getElementById('theme-toggle');
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) { /* private mode */ }

    if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);

    function current() {
      var explicit = root.getAttribute('data-theme');
      if (explicit) return explicit;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#0a0c10' : '#fcfcfd');
    });
  })();

  /* ---------------- sticky header shadow ---------------- */
  (function header() {
    var el = document.querySelector('.site-header');
    if (!el) return;
    var tick = function () { el.classList.toggle('is-stuck', window.scrollY > 8); };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
  })();

  /* ---------------- year ---------------- */
  (function year() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  })();

  /* ---------------- email, assembled client-side ---------------- */
  (function mail() {
    var link = document.getElementById('mail-link');
    if (!link) return;
    var user = 'salihyesil59';
    var host = ['gmail', 'com'].join('.');
    var addr = user + '@' + host;
    link.setAttribute('href', 'mailto:' + addr);
    var slot = link.querySelector('[data-mail]');
    if (slot) slot.textContent = addr;
  })();

  /* ---------------- project filters ---------------- */
  (function filters() {
    var chips = document.querySelectorAll('.chip[data-filter]');
    var cards = document.querySelectorAll('.card--project');
    if (!chips.length || !cards.length) return;

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        var want = chip.getAttribute('data-filter');

        Array.prototype.forEach.call(chips, function (c) {
          c.classList.toggle('is-active', c === chip);
        });

        Array.prototype.forEach.call(cards, function (card) {
          var topics = (card.getAttribute('data-topics') || '').split(/\s+/);
          card.hidden = !(want === 'all' || topics.indexOf(want) !== -1);
        });
      });
    });
  })();

  /* ---------------- live star counts ---------------- */
  (function stars() {
    if (!window.fetch) return;
    var cards = document.querySelectorAll('.card--project[data-repo]');
    if (!cards.length) return;

    var CACHE_KEY = 'gh-stars-v1';
    var TTL = 6 * 60 * 60 * 1000; // 6 hours

    function paint(map) {
      Array.prototype.forEach.call(cards, function (card) {
        var name = card.getAttribute('data-repo');
        var slot = card.querySelector('[data-stars]');
        if (!slot || !(name in map)) return;
        slot.textContent = map[name];
        slot.hidden = false;
      });
    }

    // Serve from cache immediately, refresh in the background when stale.
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { /* ignore */ }
    if (cached && cached.data) paint(cached.data);
    if (cached && cached.at && Date.now() - cached.at < TTL) return;

    fetch('https://api.github.com/users/' + GH_USER + '/repos?per_page=100&sort=updated')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (repos) {
        var map = {};
        repos.forEach(function (repo) { map[repo.name] = repo.stargazers_count; });
        paint(map);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: map }));
        } catch (e) { /* ignore */ }
      })
      .catch(function () { /* rate-limited or offline: the counts just stay hidden */ });
  })();

  /* ---------------- scroll reveal ---------------- */
  (function reveal() {
    var targets = document.querySelectorAll('.card, .modellist li, .linklist li, .section__title');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 6, 5) * 55) + 'ms';
    });

    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fired = true;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

    // Safety net: content must never be permanently invisible because the
    // observer never ran. If nothing has revealed after 3s, show everything.
    setTimeout(function () {
      if (fired) return;
      io.disconnect();
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
    }, 3000);
  })();

  /* ---------------- cosmic-web background ----------------
     A slowly drifting field of points, with faint links between
     near neighbours. Deliberately sparse: it should read as
     texture, not as a screensaver.
  --------------------------------------------------------- */
  (function background() {
    var canvas = document.getElementById('cosmic-web');
    if (!canvas || reduceMotion) { if (canvas) canvas.style.display = 'none'; return; }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], raf = null;
    var LINK = 132;          // px within which two nodes are linked
    var DENSITY = 12500;     // one node per this many css px^2

    function accent() {
      var v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return v || '#79c0ff';
    }

    function hexToRgb(hex) {
      var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m
        ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
        : [121, 192, 255];
    }

    var rgb = hexToRgb(accent());

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(110, Math.max(28, (w * h) / DENSITY)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.3 + 0.5
        });
      }
      rgb = hexToRgb(accent());
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, dx, dy, d2, alpha;

      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
        if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;
      }

      // links
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          alpha = (1 - Math.sqrt(d2) / LINK) * 0.22;
          ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // nodes
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.55)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function start() { if (raf === null) raf = requestAnimationFrame(frame); }
    function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    }, { passive: true });

    // don't burn cycles in a hidden tab
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    // repaint in the new accent colour when the theme flips
    var toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.addEventListener('click', function () {
      setTimeout(function () { rgb = hexToRgb(accent()); }, 30);
    });

    resize();
    start();
  })();

})();
