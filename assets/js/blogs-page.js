;(function () {
  var utils = window.siteUtils || {};
  var escapeHtml = utils.escapeHtml || fallbackEscapeHtml;
  var formatDate = utils.formatDate || fallbackFormatDate;
  var toTimestamp = utils.toTimestamp || fallbackToTimestamp;

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
  var modal = setupModal();

  var heroEl = document.getElementById('blog-hero');
  if (heroEl) renderHero(posts[0], heroEl, modal);

  var filtersEl = document.getElementById('blog-filters');
  if (filtersEl) renderFilters(posts, filtersEl, state, modal);

  var sortSelect = document.getElementById('blog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sort = sortSelect.value || 'newest';
      renderGrid(posts, state, modal);
    });
  }

  renderGrid(posts, state, modal);

  var saved = sessionStorage.getItem('blogs:open');
  if (saved && modal) {
    var entry = posts.find(function (p) { return p.id === saved; });
    if (entry) modal.open(entry);
    sessionStorage.removeItem('blogs:open');
  }

  function renderHero(item, container, modalApi) {
    if (!item) return;
    var themeClass = document.documentElement.getAttribute('data-theme') === 'dark' ? 'theme-dark' : 'theme-light';
    container.innerHTML = [
      '<div class="blog-hero-inner ' + themeClass + '">',
      '  <div>',
      item.heroBadge ? '    <span class="badge">' + escapeHtml(item.heroBadge) + '</span>' : '',
      '    <h2 class="hero-title">' + escapeHtml(item.title) + '</h2>',
      '    <p class="muted">' + escapeHtml(item.summary || '') + '</p>',
      '    <div class="hero-actions">',
      '      <button class="btn btn-primary" type="button" data-blog-open="' + escapeHtml(item.id) + '">Read story</button>',
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
    var trigger = container.querySelector('[data-blog-open]');
    if (trigger && trigger.dataset.bound !== 'true') {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        if (modalApi) {
          modalApi.open(item);
        } else {
          sessionStorage.setItem('blogs:open', item.id);
          window.location.hash = 'blogs-grid';
        }
      });
      trigger.dataset.bound = 'true';
    }
  }

  function renderFilters(items, container, current, modalApi) {
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
        renderGrid(posts, current, modalApi);
      });
    });
  }

  function renderGrid(items, current, modalApi) {
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
        '    <button class="btn btn-link" type="button">Read more</button>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (typeof window.initUI === 'function') window.initUI();

    bindGridInteractions(grid, modalApi);
  }

  function setupModal() {
    var dialog = document.getElementById('blog-modal');
    if (!dialog) return null;
    var titleEl = document.getElementById('modal-title');
    var metaEl = document.getElementById('modal-meta');
    var subtitleEl = document.getElementById('modal-subtitle');
    var bodyEl = document.getElementById('modal-body');
    var closeBtn = dialog.querySelector('.modal-close');

    function open(post) {
      if (!post) return;
      if (titleEl) titleEl.textContent = post.title || '';
      if (metaEl) {
        var metaPieces = [post.category, post.displayDate || formatDate(post.date)]
          .filter(Boolean)
          .map(function (piece) {
            return '<span class="meta-pill">' + escapeHtml(piece) + '</span>';
          }).join('');
        metaEl.innerHTML = metaPieces;
      }
      if (subtitleEl) subtitleEl.textContent = post.author || '';
      if (bodyEl) {
        var paragraphs = Array.isArray(post.body) ? post.body : [post.summary || ''];
        bodyEl.innerHTML = paragraphs.map(function (entry, index) {
          var type = 'paragraph';
          var text = '';
          var items = null;
          var ordered = false;

          if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
            type = entry.type || 'paragraph';
            text = entry.text || entry.content || '';
            if (type === 'list') {
              items = Array.isArray(entry.items) ? entry.items : null;
              ordered = Boolean(entry.ordered);
            }
          } else {
            text = entry;
          }

          if (type === 'list' && items) {
            var tag = ordered ? 'ol' : 'ul';
            var listClass = 'modal-list' + (ordered ? ' modal-list--ordered' : '');
            var listItems = items.map(function (item) {
              return '<li>' + escapeHtml(item) + '</li>';
            }).join('');
            return '<' + tag + ' class="' + listClass + '">' + listItems + '</' + tag + '>';
          }

          var safeText = escapeHtml(text);
          if (!safeText) return '';
          if (type === 'quote') {
            return '<blockquote>' + safeText + '</blockquote>';
          }
          var cls = index === 0 ? ' class="lead"' : '';
          return '<p' + cls + '>' + safeText + '</p>';
        }).join('');
      }
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', 'true');
    }

    function close() {
      if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && dialog.open) close();
    });

    return { open: open, close: close };
  }

  function bindGridInteractions(container, modalApi) {
    if (!container) return;
    if (container.dataset.blogBound === 'true') return;
    container.addEventListener('click', function (event) {
      var card = event.target.closest('[data-blog-card]');
      if (!card || !container.contains(card)) return;
      var postId = card.getAttribute('data-id');
      if (!postId) return;
      var post = posts.find(function (entry) { return entry.id === postId; });
      if (!post) return;
      event.preventDefault();
      if (modalApi) {
        modalApi.open(post);
      } else {
        sessionStorage.setItem('blogs:open', postId);
        window.location.hash = card.id || 'blogs-grid';
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
