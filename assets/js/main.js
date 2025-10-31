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

  function safeStorageGet(storage, key) {
    if (!storage || typeof storage.getItem !== 'function') return null;
    try {
      return storage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeStorageSet(storage, key, value) {
    if (!storage || typeof storage.setItem !== 'function') return;
    try {
      storage.setItem(key, value);
    } catch (err) {
      /* ignore storage errors */
    }
  }

  function safeStorageRemove(storage, key) {
    if (!storage || typeof storage.removeItem !== 'function') return;
    try {
      storage.removeItem(key);
    } catch (err) {
      /* ignore storage errors */
    }
  }

  function initSiteLoader() {
    var root = window;
    var body = document.body;
    if (!root || !body) {
      root.addEventListener('DOMContentLoaded', initSiteLoader, { once: true });
      return;
    }

    var storage = root.sessionStorage;
    var hasShown = !!safeStorageGet(storage, 'site-loader-seen');
    if (hasShown) {
      return;
    }

    var loader = document.createElement('div');
    loader.className = 'site-loader is-visible';
    loader.innerHTML =
      '<div class="site-loader__inner" role="alert" aria-live="assertive">' +
        '<img class="site-loader__logo" src="assets/img/Brand Logo.png" alt="Ishrak Farhan logo" />' +
        '<div class="site-loader__spinner" aria-hidden="true"></div>' +
        '<div class="site-loader__progress" aria-hidden="true">' +
          '<div class="site-loader__bar"><span class="site-loader__bar-fill" data-loader-bar></span></div>' +
          '<span class="site-loader__percent"><span data-loader-progress>0</span>%</span>' +
        '</div>' +
        '<p class="site-loader__tagline">Preparing your experience...</p>' +
      '</div>';

    body.insertBefore(loader, body.firstChild);

    var progressFill = loader.querySelector('[data-loader-bar]');
    var progressValue = loader.querySelector('[data-loader-progress]');
    var current = 0;
    var rafId = null;
    var done = false;

    function render(value) {
      if (progressFill) {
        progressFill.style.transform = 'scaleX(' + Math.min(1, value / 100) + ')';
      }
      if (progressValue) {
        progressValue.textContent = Math.round(value);
      }
    }

    function progressLoop() {
      if (done) return;
      current += (90 - current) * 0.035;
      render(current);
      rafId = root.requestAnimationFrame(progressLoop);
    }

    rafId = root.requestAnimationFrame(progressLoop);

    function teardown() {
      if (done) return;
      done = true;
      if (rafId) root.cancelAnimationFrame(rafId);
      render(100);
      safeStorageSet(storage, 'site-loader-seen', '1');
      loader.classList.remove('is-visible');
      loader.classList.add('is-leaving');
      root.setTimeout(function () {
        loader.remove();
      }, 500);
    }

    root.addEventListener('load', teardown, { once: true });
    root.setTimeout(teardown, 9000);
  }

  initSiteLoader();

  function initIntroGuide() {
    var root = window;
    var doc = document;
    if (!root || !doc.querySelector('.hero')) return;

    var storage = root.sessionStorage || root.localStorage;
    var INTRO_KEY = 'site-intro-session-v1';
    if (storage !== root.localStorage) {
      safeStorageRemove(root.localStorage, INTRO_KEY);
    }
    if (safeStorageGet(storage, INTRO_KEY) === '1') return;

    var steps = [
      {
        selectors: ['#theme-toggle', '[data-theme-toggle]'],
        title: 'Switch the theme',
        body: 'Use the floating toggle to swap between light and dark modes anytime.',
        placement: 'left',
        padding: 20,
        adjust: { y: -40 }
      },
      {
        selectors: ['.nav-toggle', '.site-header .site-nav'],
        title: 'Open the site menu',
        body: 'Tap the menu icon to jump directly to any section of the site.',
        placement: 'bottom',
        padding: 18
      },
      {
        selectors: ['.hero'],
        title: 'Scroll to explore',
        body: 'Scroll down to find the latest updates, projects, and stories.',
        placement: 'bottom',
        padding: 28
      }
    ];

    var overlay = null;
    var focusEl = null;
    var calloutEl = null;
    var titleEl = null;
    var bodyEl = null;
    var stepLabelEl = null;
    var skipBtn = null;
    var hintEl = null;
    var currentStep = 0;
    var active = false;
    var rafId = null;
    var previousTarget = null;

    function resolveElement(step) {
      for (var i = 0; i < step.selectors.length; i++) {
        var el = doc.querySelector(step.selectors[i]);
        if (!el) continue;
        var style = root.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        return el;
      }
      return null;
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function placeCallout(rect, step) {
      var placement = step.placement || 'right';
      var offset = 24;
      var adjust = step.adjust || {};
      var calloutWidth = calloutEl.offsetWidth || 260;
      var calloutHeight = calloutEl.offsetHeight || 160;
      var viewportWidth = root.innerWidth;
      var viewportHeight = root.innerHeight;
      var top = rect.top;
      var left = rect.left;

      if (placement === 'left') {
        left = rect.left - offset - calloutWidth;
        top = rect.top + rect.height / 2 - calloutHeight / 2;
      } else if (placement === 'right') {
        left = rect.right + offset;
        top = rect.top + rect.height / 2 - calloutHeight / 2;
      } else if (placement === 'top') {
        left = rect.left + rect.width / 2 - calloutWidth / 2;
        top = rect.top - offset - calloutHeight;
      } else {
        // bottom default
        left = rect.left + rect.width / 2 - calloutWidth / 2;
        top = rect.bottom + offset;
      }

      left = clamp(left, 16, Math.max(16, viewportWidth - calloutWidth - 16));
      top = clamp(top, 16, Math.max(16, viewportHeight - calloutHeight - 16));

      if (adjust.x) left = clamp(left + adjust.x, 16, Math.max(16, viewportWidth - calloutWidth - 16));
      if (adjust.y) top = clamp(top + adjust.y, 16, Math.max(16, viewportHeight - calloutHeight - 16));

      calloutEl.dataset.placement = placement;
      calloutEl.style.top = top + 'px';
      calloutEl.style.left = left + 'px';
      calloutEl.style.transform = 'none';
    }

    function highlightTarget(target, step) {
      if (!target || !focusEl) return;
      var rect = target.getBoundingClientRect();
      var padding = step.padding || 18;

      var width = rect.width + padding * 2;
      var height = rect.height + padding * 2;
      var top = rect.top - padding;
      var left = rect.left - padding;

      var maxW = root.innerWidth - 32;
      var maxH = root.innerHeight - 32;
      if (width > maxW) {
        width = maxW;
        left = (root.innerWidth - width) / 2;
      } else {
        left = clamp(left, 16, root.innerWidth - width - 16);
      }

      if (height > maxH) {
        height = maxH;
        top = (root.innerHeight - height) / 2;
      } else {
        top = clamp(top, 16, root.innerHeight - height - 16);
      }

      focusEl.style.width = Math.max(80, width) + 'px';
      focusEl.style.height = Math.max(80, height) + 'px';
      focusEl.style.top = top + 'px';
      focusEl.style.left = left + 'px';
      focusEl.style.borderRadius = step.radius ? step.radius + 'px' : '22px';

      placeCallout(rect, step);
    }

    function updateContent(stepIndex) {
      var step = steps[stepIndex];
      var target = step.element;
      if (!target) return;

      if (previousTarget && previousTarget !== target) {
        previousTarget.classList.remove('site-intro__target');
      }
      target.classList.add('site-intro__target');
      previousTarget = target;

      highlightTarget(target, step);
      stepLabelEl.textContent = 'Step ' + (stepIndex + 1) + ' of ' + steps.length;
      titleEl.textContent = step.title || '';
      bodyEl.textContent = step.body || '';
      if (hintEl) {
        hintEl.innerHTML = stepIndex === steps.length - 1 ? '<strong>Tap anywhere</strong> to finish' : '<strong>Tap anywhere</strong> to continue';
      }
    }

    function applyStep() {
      if (!active) return;
      updateContent(currentStep);
    }

    function handleResize() {
      if (rafId) root.cancelAnimationFrame(rafId);
      rafId = root.requestAnimationFrame(function () {
        rafId = null;
        applyStep();
      });
    }

    function teardownOverlay() {
      if (!overlay) return;
      active = false;
      doc.documentElement.classList.remove('site-intro-open');
      doc.body.classList.remove('site-intro-open');
      root.removeEventListener('resize', handleResize);
      root.removeEventListener('scroll', handleResize);
      root.removeEventListener('keydown', handleKeydown);
      if (previousTarget) previousTarget.classList.remove('site-intro__target');
      overlay.remove();
      overlay = null;
      safeStorageSet(storage, INTRO_KEY, '1');
    }

    function handleKeydown(event) {
      if (!active) return;
      var key = event.key || event.code;
      if (key === 'Escape') {
        event.preventDefault();
        teardownOverlay();
      } else if (key === 'ArrowRight') {
        event.preventDefault();
        goToStep(currentStep + 1);
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        goToStep(currentStep - 1);
      }
    }

    function goToStep(index) {
      if (index < 0) index = 0;
      if (index >= steps.length) {
        teardownOverlay();
        return;
      }
      currentStep = index;
      applyStep();
    }

    function buildOverlay() {
      overlay = doc.createElement('div');
      overlay.className = 'site-intro';
      overlay.innerHTML =
        '<div class="site-intro__backdrop" role="presentation"></div>' +
        '<div class="site-intro__focus" aria-hidden="true"></div>' +
        '<div class="site-intro__callout" role="dialog" aria-modal="true">' +
          '<div class="site-intro__step" data-intro-step></div>' +
          '<h2 class="site-intro__title" data-intro-title></h2>' +
          '<p class="site-intro__body" data-intro-body></p>' +
          '<div class="site-intro__controls">' +
            '<span class="site-intro__hint" data-intro-hint><strong>Tap anywhere</strong> to continue</span>' +
            '<button type="button" class="site-intro__skip" data-intro-skip>Skip</button>' +
          '</div>' +
        '</div>';

      focusEl = overlay.querySelector('.site-intro__focus');
      calloutEl = overlay.querySelector('.site-intro__callout');
      titleEl = overlay.querySelector('[data-intro-title]');
      bodyEl = overlay.querySelector('[data-intro-body]');
      stepLabelEl = overlay.querySelector('[data-intro-step]');
      skipBtn = overlay.querySelector('[data-intro-skip]');
      hintEl = overlay.querySelector('[data-intro-hint]');

      skipBtn.addEventListener('pointerdown', function (evt) {
        evt.stopPropagation();
      });
      skipBtn.addEventListener('click', function (evt) {
        evt.stopPropagation();
        teardownOverlay();
      });

      overlay.addEventListener('click', function (event) {
        if (!active) return;
        var target = event.target;
        if (skipBtn && skipBtn.contains(target)) {
          return;
        }
        goToStep(currentStep + 1);
      });

      overlay.addEventListener('pointerdown', function (event) {
        if (skipBtn && skipBtn.contains(event.target)) {
          event.stopPropagation();
        }
      });

      doc.body.appendChild(overlay);
      root.requestAnimationFrame(function () {
        if (!overlay) return;
        overlay.classList.add('is-active');
        doc.documentElement.classList.add('site-intro-open');
        doc.body.classList.add('site-intro-open');
        active = true;
        applyStep();
        skipBtn.focus();
      });

      root.addEventListener('resize', handleResize);
      root.addEventListener('scroll', handleResize, { passive: true });
      root.addEventListener('keydown', handleKeydown);
    }

    function startGuide() {
      if (active || overlay) return;
      for (var i = 0; i < steps.length; i++) {
        steps[i].element = resolveElement(steps[i]);
      }
      var ready = steps.every(function (step) { return !!step.element; });
      if (!ready) {
        root.setTimeout(startGuide, 300);
        return;
      }
      buildOverlay();
    }

    function scheduleStart() {
      if (active || overlay) return;
      startGuide();
    }

    if (doc.readyState === 'complete') {
      root.setTimeout(scheduleStart, 700);
    } else {
      root.addEventListener('load', function () {
        root.setTimeout(scheduleStart, 700);
      }, { once: true });
    }

    root.addEventListener('partials:ready', function () {
      if (overlay || active) return;
      root.setTimeout(scheduleStart, 400);
    });
  }

  initIntroGuide();

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
    const saved = safeStorageGet(localStorage, 'theme');
    if (saved) root.setAttribute('data-theme', saved);

    // Theme toggle handled by assets/js/theme.js to match Blogs site
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-header .site-nav');
    const list = document.getElementById('nav-list');
    const backdrop = document.querySelector('.nav-backdrop');
    if (backdrop && !backdrop.dataset.bound) {
      backdrop.setAttribute('hidden', '');
    }
    if (btn && nav && list && !btn.dataset.bound) {
      const mq = window.matchMedia('(max-width: 900px)');

      let rafHandle = null;

      function positionMenu() {
        if (!nav.classList.contains('open')) return;
        const rect = btn.getBoundingClientRect();
        const margin = 16;
        const panelWidth = list.offsetWidth || 0;
        const panelHeight = list.offsetHeight || 0;
        let top = rect.bottom + 12;
        if (top + panelHeight + margin > window.innerHeight) {
          top = Math.max(margin, rect.top - panelHeight - 12);
        }
        top = Math.max(margin, top);
        const left = Math.max(margin, window.innerWidth - panelWidth - margin);
        nav.style.setProperty('--nav-panel-top', Math.round(top) + 'px');
        nav.style.setProperty('--nav-panel-left', Math.round(left) + 'px');
      }

      function scheduleMenuPosition() {
        if (!nav.classList.contains('open')) return;
        if (rafHandle !== null) return;
        rafHandle = window.requestAnimationFrame(function () {
          rafHandle = null;
          positionMenu();
        });
      }

      function bindViewportEvents() {
        window.addEventListener('scroll', scheduleMenuPosition, { passive: true });
        window.addEventListener('resize', scheduleMenuPosition);
      }

      function unbindViewportEvents() {
        window.removeEventListener('scroll', scheduleMenuPosition);
        window.removeEventListener('resize', scheduleMenuPosition);
        if (rafHandle !== null) {
          window.cancelAnimationFrame(rafHandle);
          rafHandle = null;
        }
      }

      function onKeydown(e) {
        if (e.key === 'Escape') {
          closeMenu();
        }
      }

      function closeMenu(options){
        options = options || {};
        const shouldMorph = !!options.animateToggle && !options.immediate && btn.classList.contains('is-active');
        if (shouldMorph && nav.classList.contains('is-closing')) return;

        btn.setAttribute('aria-expanded', 'false');
        unbindViewportEvents();
        document.removeEventListener('keydown', onKeydown);
        document.removeEventListener('click', onDocClick);

        let isFinalized = false;
        let toggleEndHandler = null;
        let panelEndHandler = null;
        let backdropEndHandler = null;
        const finalize = function(){
          if (isFinalized) return;
          isFinalized = true;
          if (toggleEndHandler) {
            btn.removeEventListener('animationend', toggleEndHandler);
            toggleEndHandler = null;
          }
          if (panelEndHandler) {
            list.removeEventListener('animationend', panelEndHandler);
            panelEndHandler = null;
          }
          if (backdrop && backdropEndHandler) {
            backdrop.removeEventListener('transitionend', backdropEndHandler);
            backdropEndHandler = null;
          }
          nav.classList.remove('open', 'is-closing');
          nav.dataset.open = 'false';
          nav.style.removeProperty('--nav-panel-top');
          nav.style.removeProperty('--nav-panel-left');
          btn.classList.remove('is-closing');
          if (backdrop) {
            backdrop.classList.remove('is-fading');
            backdrop.setAttribute('hidden', '');
          }
          if (shouldMorph) {
            requestAnimationFrame(function(){ btn.classList.remove('is-active'); });
          } else {
            btn.classList.remove('is-active');
          }
        };

        if (shouldMorph) {
          btn.classList.add('is-closing');
          nav.classList.add('is-closing');
          if (backdrop) {
            backdrop.classList.add('is-fading');
            backdrop.removeAttribute('hidden');
            backdropEndHandler = function (event) {
              if (event.target !== backdrop) return;
              backdrop.removeEventListener('transitionend', backdropEndHandler);
              backdropEndHandler = null;
            };
            backdrop.addEventListener('transitionend', backdropEndHandler);
          }

          toggleEndHandler = function (event) {
            if (event.target !== btn || event.animationName !== 'navToggleMorphWrapper') return;
            btn.classList.remove('is-closing');
            btn.removeEventListener('animationend', toggleEndHandler);
            toggleEndHandler = null;
          };

          panelEndHandler = function (event) {
            if (event.target !== list || event.animationName !== 'navPanelFoldOut') return;
            list.removeEventListener('animationend', panelEndHandler);
            panelEndHandler = null;
            finalize();
          };

          btn.addEventListener('animationend', toggleEndHandler);
          list.addEventListener('animationend', panelEndHandler);

          setTimeout(finalize, 650);
        } else {
          if (backdrop) backdrop.setAttribute('hidden', '');
          finalize();
        }
      }
      function onDocClick(e){ if (!nav.contains(e.target)) closeMenu(); }
      function toggleMenu(){
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) { closeMenu({ animateToggle: true }); }
        else {
          nav.classList.add('open');
          nav.dataset.open = 'true';
          btn.setAttribute('aria-expanded', 'true');
          btn.classList.add('is-active');
          if (backdrop) {
            backdrop.classList.remove('is-fading');
            backdrop.removeAttribute('hidden');
          }
          positionMenu();
          scheduleMenuPosition();
          bindViewportEvents();
          document.addEventListener('keydown', onKeydown);
          setTimeout(function(){ document.addEventListener('click', onDocClick); }, 0);
        }
      }
      btn.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function(e){
          if (!e.matches) closeMenu({ immediate: true });
        });
      }
      window.addEventListener('resize', function(){
        if (window.innerWidth > 900) closeMenu({ immediate: true });
      });
      // Close on nav link click
      list.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){ closeMenu(); });
      });
      btn.dataset.bound = 'true';
      if (backdrop && !backdrop.dataset.bound) {
        backdrop.addEventListener('click', function(){ closeMenu(); });
        backdrop.dataset.bound = 'true';
      }
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
    const navStatusCurrent = document.querySelector('.nav-status .status-current');
    function syncNavStatusLabel() {
      if (!navStatusCurrent) return;
      var active = document.querySelector('.site-nav a[aria-current="page"]');
      var text = active ? active.textContent.trim() : (document.title || '');
      if (!active) {
        text = text.split(' | ')[0].split(' – ')[0].trim();
      }
      if (!text) text = 'Menu';
      navStatusCurrent.textContent = text;
    }
    syncNavStatusLabel();

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

  if (!siteUtils.safeStorageGet) siteUtils.safeStorageGet = safeStorageGet;
  if (!siteUtils.safeStorageSet) siteUtils.safeStorageSet = safeStorageSet;
  if (!siteUtils.safeStorageRemove) siteUtils.safeStorageRemove = safeStorageRemove;
})();


