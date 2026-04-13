;(function () {
  var utils = window.siteUtils || {};
  var escapeHtml = utils.escapeHtml || fallbackEscapeHtml;
  var formatDate = utils.formatDate || fallbackFormatDate;
  var toTimestamp = utils.toTimestamp || fallbackToTimestamp;
  var highlightText = utils.highlightText || function (value) { return escapeHtml(value || ''); };
  var matchesSearch = utils.matchesSearch || function () { return true; };

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

  var state = { filter: 'all', sort: 'newest', search: '' };

  var heroEl = document.getElementById('blog-hero');
  var filtersEl = document.getElementById('blog-filters');
  var sortSelect = document.getElementById('blog-sort');
  var searchInput = document.getElementById('blog-search');
  var statusEl = document.getElementById('blog-search-status');

  if (filtersEl) renderFilters(posts, filtersEl, state);

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sort = sortSelect.value || 'newest';
      renderAll();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value || '';
      renderAll();
    });
  }

  renderAll();

  function renderAll() {
    var list = getFilteredPosts();
    if (heroEl) renderHero(list[0], heroEl);
    renderGrid(list);
    updateStatus(list.length);
  }

  function renderHero(item, container) {
    if (!item) {
      container.innerHTML = '';
      container.hidden = true;
      return;
    }

    container.hidden = false;
    var themeClass = document.documentElement.getAttribute('data-theme') === 'dark' ? 'theme-dark' : 'theme-light';
    var heroAction = item.pdf
      ? '      <a class="btn btn-primary" href="' + escapeHtml(item.pdf) + '" target="_blank" rel="noopener">Read story</a>'
      : '';

    container.innerHTML = [
      '<div class="blog-hero-inner ' + themeClass + '">',
      '  <div>',
      item.heroBadge ? '    <span class="badge">' + escapeHtml(item.heroBadge) + '</span>' : '',
      '    <h2 class="hero-title">' + highlightText(item.title, state.search) + '</h2>',
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
        renderAll();
      });
    });
  }

  function renderGrid(list) {
    var grid = document.getElementById('blogs-grid');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = '<p class="muted search-empty">No blog posts matched your search.</p>';
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
        item.kicker ? '    <span class="eyebrow">' + highlightText(item.kicker, state.search) + '</span>' : '',
        '    <h3 class="card-title">' + highlightText(item.title, state.search) + '</h3>',
        '    <p class="muted">' + escapeHtml(item.displayDate || formatDate(item.date)) + '</p>',
        item.summary ? '    <p>' + highlightText(item.summary, state.search) + '</p>' : '',
        cta ? '    ' + cta : '',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (typeof window.initUI === 'function') window.initUI();

    bindGridInteractions(grid);
  }

  function getFilteredPosts() {
    var list = posts.filter(function (post) {
      var matchesCategory = !state.filter || state.filter === 'all'
        ? true
        : (post.category || '').trim().toLowerCase() === state.filter;
      return matchesCategory && matchesSearch(getSearchFields(post), state.search);
    });

    list.sort(function (a, b) {
      var diff = toTimestamp(b.date) - toTimestamp(a.date);
      return state.sort === 'oldest' ? -diff : diff;
    });

    return list;
  }

  function getSearchFields(post) {
    return [
      post.title,
      post.kicker,
      post.summary,
      post.author,
      post.category,
      Array.isArray(post.tags) ? post.tags.join(' ') : '',
      Array.isArray(post.body) ? post.body.join(' ') : ''
    ];
  }

  function updateStatus(total) {
    if (!statusEl) return;
    if (!total) {
      statusEl.textContent = state.search
        ? 'No blogs matched "' + state.search.trim() + '".'
        : 'No blogs matched the active filter.';
      return;
    }
    var label = total === 1 ? 'post' : 'posts';
    statusEl.textContent = state.search
      ? total + ' ' + label + ' for "' + state.search.trim() + '".'
      : total + ' ' + label + ' shown.';
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
