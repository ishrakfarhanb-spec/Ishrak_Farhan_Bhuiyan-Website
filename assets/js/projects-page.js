// Populate the projects page from the centralized projects data file.
(function () {
  var utils = window.siteUtils || {};
  var highlightText = utils.highlightText || function (value) { return String(value || ''); };
  var matchesSearch = utils.matchesSearch || function () { return true; };

  var items = Array.isArray(window.siteProjects) ? window.siteProjects.slice() : [];
  if (!items.length) return;

  var projectsGrid = document.getElementById('projects-grid');
  var reportsGrid = document.getElementById('reports-grid');
  if (!projectsGrid && !reportsGrid) return;

  var searchInput = document.getElementById('projects-search');
  var statusEl = document.getElementById('projects-search-status');
  var filterButtons = document.querySelectorAll('.filters [data-filter]');
  var state = {
    filter: resolveActiveFilter(),
    search: ''
  };

  items.sort(function (a, b) {
    return Date.parse(b && b.date ? b.date : 0) - Date.parse(a && a.date ? a.date : 0);
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value || '';
      renderAll();
    });
  }

  window.handleProjectFilter = function (currentFilter) {
    state.filter = currentFilter || 'all';
    renderAll();
  };

  renderAll();

  function renderAll() {
    var filteredItems = items.filter(function (item) {
      var matchesFilter = state.filter === 'all' || item.category === state.filter;
      return matchesFilter && matchesSearch(getSearchFields(item), state.search);
    });

    if (projectsGrid) renderGroup(projectsGrid, 'tools', filteredItems);
    if (reportsGrid) renderGroup(reportsGrid, 'reports', filteredItems);

    syncGroupVisibility('tools', filteredItems);
    syncGroupVisibility('reports', filteredItems);
    updateStatus(filteredItems.length);

    if (typeof window.initUI === 'function') window.initUI();
  }

  function renderGroup(container, category, source) {
    var list = source.filter(function (item) {
      return item && item.category === category;
    });

    container.innerHTML = '';
    if (!list.length) return;

    var fragment = document.createDocumentFragment();
    list.forEach(function (item) {
      fragment.appendChild(createCard(item));
    });
    container.appendChild(fragment);
  }

  function createCard(item) {
    var article = document.createElement('article');
    article.className = 'card';
    article.setAttribute('data-tags', item.category || '');
    article.setAttribute('data-animate-item', '');

    if (item.category === 'tools' && item.image) {
      var media = document.createElement('div');
      media.className = 'card-media';

      var img = document.createElement('img');
      img.className = 'lazy';
      img.setAttribute('data-src', item.image);
      img.setAttribute('alt', item.imageAlt || item.title || '');
      img.setAttribute('width', '800');
      img.setAttribute('height', '450');
      media.appendChild(img);
      article.appendChild(media);
    }

    var body = document.createElement('div');
    body.className = 'card-body';

    var title = document.createElement('h3');
    title.className = 'card-title';
    title.innerHTML = highlightText(item.title || 'Untitled', state.search);
    body.appendChild(title);

    if (item.displayDate) {
      var meta = document.createElement('p');
      meta.className = 'muted';
      meta.textContent = item.displayDate;
      body.appendChild(meta);
    }

    if (item.summary) {
      var summary = document.createElement('p');
      summary.innerHTML = highlightText(item.summary, state.search);
      body.appendChild(summary);
    }

    var link = document.createElement('a');
    link.className = 'btn btn-primary btn-small' + (item.category === 'reports' ? ' btn-report' : '');
    link.href = buildHref(item);
    if (item.category === 'tools') {
      link.setAttribute('download', '');
    }
    link.textContent = buildButtonLabel(item);
    body.appendChild(link);

    article.appendChild(body);
    return article;
  }

  function syncGroupVisibility(category, source) {
    var group = document.querySelector('[data-project-group="' + category + '"]');
    if (!group) return;
    var hasItems = source.some(function (item) {
      return item && item.category === category;
    });
    group.hidden = !hasItems;
    group.style.display = hasItems ? '' : 'none';
  }

  function updateStatus(total) {
    if (!statusEl) return;
    if (!total) {
      statusEl.textContent = state.search
        ? 'No projects matched "' + state.search.trim() + '".'
        : 'No projects matched the active filter.';
      return;
    }

    var label = total === 1 ? 'result' : 'results';
    statusEl.textContent = state.search
      ? total + ' ' + label + ' for "' + state.search.trim() + '".'
      : total + ' ' + label + ' shown.';
  }

  function resolveActiveFilter() {
    var active = document.querySelector('.filters [data-filter].is-active');
    return active ? (active.getAttribute('data-filter') || 'all') : 'all';
  }

  function getSearchFields(item) {
    return [
      item.title,
      item.summary,
      item.category,
      item.displayDate,
      item.file,
      item.imageAlt
    ];
  }

  function buildHref(item) {
    if (!item || !item.file) return 'projects.html';
    var normalizedFile = normalizeFilePath(item.file);
    if (item.category === 'reports') {
      return 'request-download.html?file=' + encodeURIComponent(normalizedFile);
    }
    return encodeURI(normalizedFile);
  }

  function buildButtonLabel(item) {
    if (!item || item.category === 'reports') {
      return 'Request download (PDF)';
    }
    var extMatch = String(item.file || '').match(/\.([^.?#/]+)(?:[?#].*)?$/i);
    var ext = extMatch ? extMatch[1].toUpperCase() : 'FILE';
    return 'Download (' + ext + ')';
  }

  function normalizeFilePath(value) {
    try {
      return decodeURIComponent(String(value || ''));
    } catch (error) {
      return String(value || '');
    }
  }
})();
