;(function () {
  function initUI() {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);

    const toggle = document.getElementById('theme-toggle');
    if (toggle && !toggle.dataset.bound) {
      const setLabel = function(){
        toggle.textContent = 'Toggle Theme';
        toggle.setAttribute('aria-label', 'Toggle Theme');
        toggle.setAttribute('title', 'Toggle Theme');
        const cur = root.getAttribute('data-theme') === 'dark' ? 'true' : 'false';
        toggle.setAttribute('aria-pressed', cur);
      };
      setLabel();
      toggle.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setLabel();
      });
      toggle.dataset.bound = 'true';
    }

    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-header .site-nav');
    const list = document.getElementById('nav-list');
    if (btn && nav && list && !btn.dataset.bound) {
      const mq = window.matchMedia('(max-width: 900px)');
      function closeMenu(){
        nav.classList.remove('open');
        nav.dataset.open = 'false';
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', onDocClick);
      }
      function onDocClick(e){ if (!nav.contains(e.target)) closeMenu(); }
      function toggleMenu(){
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) { closeMenu(); }
        else {
          nav.classList.add('open');
          nav.dataset.open = 'true';
          btn.setAttribute('aria-expanded', 'true');
          setTimeout(function(){ document.addEventListener('click', onDocClick); }, 0);
        }
      }
      btn.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });
      if (mq && mq.addEventListener) { mq.addEventListener('change', function(e){ if (!e.matches) closeMenu(); }); }
      window.addEventListener('resize', function(){ if (window.innerWidth > 900) closeMenu(); });
      // Close on nav link click
      list.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
      btn.dataset.bound = 'true';
    }

    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    const navLinks = document.querySelectorAll('.site-nav a');
    navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
    navLinks.forEach(function (a) {
      if (!a.getAttribute('href')) return;
      const href = new URL(a.href, location.origin).pathname;
      if (href === path) a.setAttribute('aria-current', 'page');
    });

    const grid = document.getElementById('projects-grid');
    if (grid) {
      document.querySelectorAll('.filters [data-filter]').forEach(function (fbtn) {
        if (fbtn.dataset.bound) return;
        fbtn.addEventListener('click', function () {
          const f = fbtn.getAttribute('data-filter');
          grid.querySelectorAll('.card').forEach(function (card) {
            const tags = (card.getAttribute('data-tags') || '').split(',').map(function (s) { return s.trim(); });
            card.style.display = (f === 'all' || tags.includes(f)) ? '' : 'none';
          });
        });
        fbtn.dataset.bound = 'true';
      });
    }

    // Interactive tiles â†’ highlight corresponding right-side info card
    document.querySelectorAll('.xp-split .tile').forEach(function (tile) {
      if (tile.dataset.bound) return;
      function findBrandEl() {
        var id = 'brand-' + (tile.getAttribute('data-brand') || '').toLowerCase();
        return document.getElementById(id);
      }
      function setActive(tileEl) {
        var scope = tileEl.closest('.xp-split');
        if (!scope) return;
        scope.querySelectorAll('.tile.is-active').forEach(function(el){ el.classList.remove('is-active'); el.setAttribute('aria-expanded','false'); });
        tileEl.classList.add('is-active');
        tileEl.setAttribute('aria-expanded','true');
      }
      tile.addEventListener('mouseenter', function(){ var t=findBrandEl(); if (t) t.classList.add('highlight'); });
      tile.addEventListener('mouseleave', function(){ var t=findBrandEl(); if (t) t.classList.remove('highlight'); });
      tile.addEventListener('click', function(){ var t=findBrandEl(); setActive(tile); if (t) { t.classList.add('highlight'); t.scrollIntoView({behavior:'smooth', block:'start'}); setTimeout(function(){ t.classList.remove('highlight'); }, 1200); } });
      tile.addEventListener('keydown', function(e){ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); var t=findBrandEl(); setActive(tile); if (t) { t.classList.add('highlight'); t.scrollIntoView({behavior:'smooth', block:'start'}); setTimeout(function(){ t.classList.remove('highlight'); }, 1200); } } });
      tile.dataset.bound = 'true';
    });

    
  }

  window.initUI = initUI;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }

    // Match all showcase text box heights to the Unilever logo height
    (function syncShowcaseHeights() {
      var refImg = document.querySelector('section[data-scope="professional"] .xp-media .xp-logo-large');
      var refBox = document.querySelector('section[data-scope="professional"] .xp-media');
      if (!refImg || !refBox) return;

      function measureAndSet() {
        // Use the media container height, which follows the image's rendered height
        var h = refBox.getBoundingClientRect().height;
        if (h > 0) {
          document.documentElement.style.setProperty('--xpHeight', Math.round(h) + 'px');
        }
      }

      if (!refImg.complete) {
        refImg.addEventListener('load', function(){ requestAnimationFrame(measureAndSet); }, { once: true });
      }
      measureAndSet();
      window.addEventListener('resize', measureAndSet);
      window.addEventListener('orientationchange', measureAndSet);
    })();
  }

  ready(initUI);
  window.addEventListener('partials:ready', initUI);
})();


