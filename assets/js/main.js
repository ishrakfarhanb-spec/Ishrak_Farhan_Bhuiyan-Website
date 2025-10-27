;(function () {
  var siteUtils = window.siteUtils || (window.siteUtils = {});
  if (!siteUtils.escapeHtml) {
    siteUtils.escapeHtml = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    };
  }
  if (!siteUtils.formatDate) {
    siteUtils.formatDate = function (value) {
      var timestamp = Date.parse(value || '');
      if (isNaN(timestamp)) return '';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(timestamp);
    };
  }
  if (!siteUtils.toTimestamp) {
    siteUtils.toTimestamp = function (value) {
      var timestamp = Date.parse(value || '');
      return isNaN(timestamp) ? 0 : timestamp;
    };
  }

  var animateObserver = null;
  var animateMutationObservers = new WeakMap();

  function isAnimatableElement(node) {
    return node && node.nodeType === 1 && !node.matches('script, style, link, template');
  }

  function ensureAnimateAttributes() {
    var main = document.querySelector('main');
    if (!main) return;
    if (main.querySelector('[data-animate]')) return;

    Array.prototype.forEach.call(main.children, function (child) {
      if (!isAnimatableElement(child)) return;
      if (!child.hasAttribute('data-animate')) child.setAttribute('data-animate', '');
      Array.prototype.forEach.call(child.children, function (grand) {
        if (!isAnimatableElement(grand)) return;
        if (!grand.hasAttribute('data-animate-item')) grand.setAttribute('data-animate-item', '');
      });
    });
  }

  function ensureAnimateObserver() {
    if (animateObserver || !('IntersectionObserver' in window)) return animateObserver;
    animateObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var item = entry.target;
        var shouldReset = item.dataset.animateReset === 'true';
        if (entry.isIntersecting) {
          item.classList.add('is-visible');
          if (!shouldReset) animateObserver.unobserve(item);
        } else if (shouldReset) {
          item.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    return animateObserver;
  }

  function observeAnimateItems(container) {
    if (!container) return;
    if (!('IntersectionObserver' in window)) {
      container.querySelectorAll('[data-animate-item]').forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }
    var observer = ensureAnimateObserver();
    if (!observer) return;
    container.querySelectorAll('[data-animate-item]').forEach(function (item) {
      if (item.dataset.animateBound === 'true') return;
      item.dataset.animateBound = 'true';
      observer.observe(item);
    });
  }

  function initMorphAnimations() {
    ensureAnimateAttributes();

    var containers = document.querySelectorAll('[data-animate]');
    if (!containers.length) return;

    if (!('IntersectionObserver' in window)) {
      containers.forEach(function (container) {
        container.querySelectorAll('[data-animate-item]').forEach(function (item) {
          item.classList.add('is-visible');
        });
      });
      return;
    }

    ensureAnimateObserver();

    containers.forEach(function (container) {
      observeAnimateItems(container);
      if (!('MutationObserver' in window) || animateMutationObservers.has(container)) return;
      var mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          Array.prototype.forEach.call(mutation.addedNodes, function (node) {
            if (!isAnimatableElement(node)) return;
            if (!node.hasAttribute('data-animate-item')) node.setAttribute('data-animate-item', '');
          });
        });
        observeAnimateItems(container);
      });
      mo.observe(container, { childList: true, subtree: true });
      animateMutationObservers.set(container, mo);
    });
  }

  function initUI() {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);

    // Theme toggle handled by assets/js/theme.js to match Blogs site

    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-header .site-nav');
    const list = document.getElementById('nav-list');
    if (btn && nav && list && !btn.dataset.bound) {
      const mq = window.matchMedia('(max-width: 900px)');
      function closeMenu(){
        nav.classList.remove('open');
        nav.dataset.open = 'false';
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
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
          document.documentElement.classList.add('nav-open');
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

    function normalizePath(value) {
      return value.replace(/\/index\.html$/, '/');
    }

    const path = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll('.site-nav a');
    navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
    navLinks.forEach(function (a) {
      if (!a.getAttribute('href')) return;
      const href = normalizePath(new URL(a.href, location.origin).pathname);
      if (href === path) a.setAttribute('aria-current', 'page');
    });

    var filterButtons = document.querySelectorAll('.filters [data-filter]');
    var projectGroups = document.querySelectorAll('[data-project-group]');
    if (filterButtons.length && projectGroups.length) {
      filterButtons.forEach(function (btn) {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');

        btn.addEventListener('click', function () {
          var currentFilter = btn.getAttribute('data-filter');

          filterButtons.forEach(function (other) {
            var isActive = other === btn;
            other.classList.toggle('is-active', isActive);
            other.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });

          projectGroups.forEach(function (group) {
            var groupKey = group.getAttribute('data-project-group');
            var showGroup = currentFilter === 'all' || currentFilter === groupKey;
            group.style.display = showGroup ? '' : 'none';

            if (!showGroup) return;

            group.querySelectorAll('[data-tags]').forEach(function (card) {
              var tags = (card.getAttribute('data-tags') || '')
                .split(',')
                .map(function (s) { return s.trim(); })
                .filter(Boolean);
              card.style.display = (currentFilter === 'all' || tags.includes(currentFilter)) ? '' : 'none';
            });
          });
        });
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

    
    if (typeof window.refreshLazyImages === 'function') {
      window.refreshLazyImages();
    }

    initMorphAnimations();
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
  // If partials already loaded before this script, initialize now
  if (window.__partialsReady) initUI();
})();


