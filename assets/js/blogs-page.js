;(function () {
  var utils = window.siteUtils || {};
  var escapeHtml = utils.escapeHtml || fallbackEscapeHtml;
  var formatDate = utils.formatDate || fallbackFormatDate;
  var toTimestamp = utils.toTimestamp || fallbackToTimestamp;

  var safeGet = (utils.safeStorageGet || function (storage, key) {
    if (!storage || typeof storage.getItem !== 'function') return null;
    try { return storage.getItem(key); } catch (err) { return null; }
  });
  var safeSet = (utils.safeStorageSet || function (storage, key, value) {
    if (!storage || typeof storage.setItem !== 'function') return;
    try { storage.setItem(key, value); } catch (err) { /* ignore */ }
  });
  var safeRemove = (utils.safeStorageRemove || function (storage, key) {
    if (!storage || typeof storage.removeItem !== 'function') return;
    try { storage.removeItem(key); } catch (err) { /* ignore */ }
  });

  function safeSessionGet(key) {
    return safeGet(window.sessionStorage, key);
  }
  function safeSessionSet(key, value) {
    safeSet(window.sessionStorage, key, value);
  }
  function safeSessionRemove(key) {
    safeRemove(window.sessionStorage, key);
  }

  var posts = Array.isArray(window.siteBlogs) ? window.siteBlogs.slice() : [];
  if (!posts.length) {
    var emptyGrid = document.getElementById('blogs-grid');
    if (emptyGrid) {
      emptyGrid.innerHTML = '<p class="muted">No blog posts yet. Check back soon.</p>';
    }
    return;
  }

  posts.sort(function (a, b) {
    return toTimestamp(b.date) - toTimestamp(a.date);
  });

  var state = { filter: 'all', sort: 'newest' };

  var heroEl = document.getElementById('blog-hero');
  if (heroEl) renderHero(posts[0], heroEl);

  var filtersEl = document.getElementById('blog-filters');
  if (filtersEl) renderFilters(posts, filtersEl, state);

  var sortSelect = document.getElementById('blog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sort = sortSelect.value || 'newest';
      renderGrid(posts, state);
    });
  }

  renderGrid(posts, state);

  function renderHero(item, container) {
    if (!item) return;
    var themeClass = document.documentElement.getAttribute('data-theme') === 'dark' ? 'theme-dark' : 'theme-light';
    var heroAction = item.pdf
      ? '      <a class="btn btn-primary" href="' + escapeHtml(item.pdf) + '" target="_blank" rel="noopener">Read story</a>'
      : '';
    container.innerHTML = [
      '<div class="blog-hero-inner ' + themeClass + '">',
      '  <div>',
      item.heroBadge ? '    <span class="badge">' + escapeHtml(item.heroBadge) + '</span>' : '',
      '    <h2 class="hero-title">' + escapeHtml(item.title) + '</h2>',
      '    <p class="muted">' + escapeHtml(item.summary || '') + '</p>',
      '    <div class="hero-actions">',
      heroAction,
      '    </div>',
      '  </div>',
      '  <div class="hero-meta">',
      '    <p class="muted">' + escapeHtml(item.displayDate || formatDate(item.date)) + '</p>',
      '  </div>',
      '</div>'
    ].join('');
    var inner = container.querySelector('.blog-hero-inner');
    if (inner) {
      if (item.image) {
        var safeUrl = String(item.image).replace(/"/g, '\\"');
        inner.style.backgroundImage = 'linear-gradient(180deg, color-mix(in srgb, var(--brand, var(--text)), transparent 94%), transparent), url("' + safeUrl + '")';
      } else {
        inner.style.removeProperty('background-image');
      }
    }
  }

  function renderFilters(items, container, current) {
    var categories = Array.from(new Set(items
      .map(function (post) { return (post.category || '').trim(); })
      .filter(Boolean)
    ));
    var chips = ['All'].concat(categories);
    container.innerHTML = chips.map(function (label) {
      var value = label.toLowerCase();
      var active = value === current.filter || (value === 'all' && current.filter === 'all');
      return '<button type="button" class="chip' + (active ? ' is-active' : '') + '" data-filter="' + value + '" role="tab" aria-selected="' + (active ? 'true' : 'false') + '">' + escapeHtml(label) + '</button>';
    }).join('');

    Array.prototype.forEach.call(container.querySelectorAll('[data-filter]'), function (chip) {
      chip.addEventListener('click', function () {
        Array.prototype.forEach.call(container.querySelectorAll('[data-filter]'), function (btn) {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('is-active');
        chip.setAttribute('aria-selected', 'true');
        current.filter = chip.getAttribute('data-filter') || 'all';
        renderGrid(posts, current);
      });
    });
  }

  function renderGrid(items, current) {
    var grid = document.getElementById('blogs-grid');
    if (!grid) return;

    var list = items.filter(function (post) {
      if (!current.filter || current.filter === 'all') return true;
      return (post.category || '').trim().toLowerCase() === current.filter;
    });

    list.sort(function (a, b) {
      var diff = toTimestamp(b.date) - toTimestamp(a.date);
      return current.sort === 'oldest' ? -diff : diff;
    });

    if (!list.length) {
      grid.innerHTML = '<p class="muted">No posts match this filter.</p>';
      return;
    }

    grid.innerHTML = list.map(function (item) {
      var cta = item.pdf
        ? '<a class="btn btn-link" href="' + escapeHtml(item.pdf) + '" target="_blank" rel="noopener">Read more</a>'
        : '';
      return [
        '<article class="card" data-blog-card data-id="' + escapeHtml(item.id) + '">',
        '  <div class="card-media">',
        item.image ? '    <img data-src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.imageAlt || item.title) + '" class="lazy" width="800" height="450" />' : '',
        '  </div>',
        '  <div class="card-body">',
        item.kicker ? '    <span class="eyebrow">' + escapeHtml(item.kicker) + '</span>' : '',
        '    <h3 class="card-title">' + escapeHtml(item.title) + '</h3>',
        '    <p class="muted">' + escapeHtml(item.displayDate || formatDate(item.date)) + '</p>',
        item.summary ? '    <p>' + escapeHtml(item.summary) + '</p>' : '',
        cta ? '    ' + cta : '',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (typeof window.initUI === 'function') window.initUI();

    bindGridInteractions(grid);
  }
  function bindGridInteractions(container) {
    if (!container) return;
    if (container.dataset.blogBound === 'true') return;
    container.addEventListener('click', function (event) {
      var card = event.target.closest('[data-blog-card]');
      if (!card || !container.contains(card)) return;
      var directLink = event.target.closest('a');
      if (directLink && card.contains(directLink)) return;
      var postId = card.getAttribute('data-id');
      if (!postId) return;
      var post = posts.find(function (entry) { return entry.id === postId; });
      if (!post) return;
      event.preventDefault();
      if (post.pdf) {
        window.open(post.pdf, '_blank', 'noopener');
      }
    });
    container.dataset.blogBound = 'true';
  }

  function fallbackToTimestamp(value) {
    var time = Date.parse(value || '');
    return isNaN(time) ? 0 : time;
  }

  function fallbackFormatDate(value) {
    var time = Date.parse(value || '');
    if (isNaN(time)) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(time);
  }

  function fallbackEscapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char];
    });
  }
})();
