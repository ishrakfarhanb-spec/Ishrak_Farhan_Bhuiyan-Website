// Enhanced news page rendering with featured spotlight and progressive loading.
(function () {
  var utils = window.siteUtils || {};
  var escapeHtml = utils.escapeHtml || function (value) { return String(value || ''); };
  var highlightText = utils.highlightText || function (value) { return escapeHtml(value || ''); };
  var matchesSearch = utils.matchesSearch || function () { return true; };

  var listEl = document.querySelector('[data-news-list]');
  var featuredEl = document.querySelector('[data-news-featured]');
  var detailEl = document.querySelector('[data-news-detail]');
  var detailMediaEl = detailEl ? detailEl.querySelector('[data-news-detail-media]') : null;
  var detailKickerEl = detailEl ? detailEl.querySelector('[data-news-detail-kicker]') : null;
  var detailTitleEl = detailEl ? detailEl.querySelector('[data-news-detail-title]') : null;
  var detailMetaEl = detailEl ? detailEl.querySelector('[data-news-detail-meta]') : null;
  var detailBodyEl = detailEl ? detailEl.querySelector('[data-news-detail-body]') : null;
  var detailBackEl = detailEl ? detailEl.querySelector('[data-news-detail-back]') : null;
  var detailCloseEls = detailEl ? detailEl.querySelectorAll('[data-news-detail-close]') : [];
  var searchInput = document.getElementById('news-search');
  var statusEl = document.getElementById('news-search-status');

  if (!listEl || !Array.isArray(window.siteNews)) {
    return;
  }

  var items = window.siteNews.slice().sort(function (a, b) {
    var dateA = new Date(a.date || 0);
    var dateB = new Date(b.date || 0);
    return dateB - dateA;
  });

  if (!items.length) {
    listEl.innerHTML = '<p class="muted">No news yet. Check back soon.</p>';
    return;
  }

  var lastFocused = null;
  var detailOpen = false;
  var state = {
    search: ''
  };

  var refreshLazy = function () {
    if (typeof window.refreshLazyImages === 'function') {
      window.refreshLazyImages();
    } else {
      document.dispatchEvent(new Event('lazyload:refresh'));
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = searchInput.value || '';
      renderAll();
    });
  }

  renderAll();

  if (detailEl && detailCloseEls.length) {
    detailCloseEls.forEach(function (el) {
      el.addEventListener('click', closeDetail);
    });
  }

  if (detailBackEl) {
    detailBackEl.addEventListener('click', function () {
      closeDetail();
      if (listEl && typeof listEl.scrollIntoView === 'function') {
        listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (detailEl) {
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && detailOpen) {
        event.preventDefault();
        closeDetail();
      }
    });
  }

  function renderAll() {
    var filteredItems = items.filter(function (item) {
      return matchesSearch(getSearchFields(item), state.search);
    });

    if (!filteredItems.length) {
      if (featuredEl) {
        featuredEl.innerHTML = '';
        featuredEl.hidden = true;
      }
      listEl.innerHTML = '<p class="muted search-empty">No news stories matched your search.</p>';
      updateStatus(0);
      return;
    }

    var featured = filteredItems[0];
    var rest = filteredItems.slice(1);

    if (featured && featuredEl) {
      featuredEl.innerHTML = '';
      renderFeatured(featured);
      featuredEl.hidden = false;
    }

    renderList(rest);
    updateStatus(filteredItems.length);
  }

  function renderList(list) {
    listEl.innerHTML = '';
    if (!list.length) return;
    var fragment = document.createDocumentFragment();
    list.forEach(function (item) {
      fragment.appendChild(createNewsCard(item));
    });
    listEl.appendChild(fragment);
    refreshLazy();
  }

  function renderFeatured(item) {
    if (!featuredEl) return;

    var fragment = document.createDocumentFragment();

    if (item.image) {
      var media = document.createElement('div');
      media.className = 'featured-media';
      if (item.imageAspect) {
        media.style.aspectRatio = item.imageAspect;
      }
      var img = document.createElement('img');
      img.className = 'lazy';
      img.setAttribute('data-src', item.image);
      img.setAttribute('alt', item.imageAlt || item.title);
      img.setAttribute('width', '1080');
      img.setAttribute('height', '1080');
      if (item.imageFit) {
        img.style.objectFit = item.imageFit;
      }
      if (item.imagePosition) {
        img.style.objectPosition = item.imagePosition;
      }
      media.appendChild(img);
      fragment.appendChild(media);
    }

    var body = document.createElement('div');
    body.className = 'featured-body';
    if (item.kicker) {
      var kicker = document.createElement('span');
      kicker.className = 'featured-kicker';
      kicker.innerHTML = highlightText(item.kicker, state.search);
      body.appendChild(kicker);
    }

    var title = document.createElement('h2');
    title.className = 'featured-title';
    title.innerHTML = highlightText(item.title, state.search);
    body.appendChild(title);

    var meta = document.createElement('p');
    meta.className = 'featured-meta';
    var details = [];
    if (item.displayDate) {
      details.push(item.displayDate);
    }
    details.push(estimateReadingTime(item));
    meta.textContent = details.join(' | ');
    body.appendChild(meta);

    var summary = document.createElement('p');
    summary.className = 'featured-summary';
    summary.innerHTML = highlightText(item.summary || (item.body && item.body[0]) || '', state.search);
    body.appendChild(summary);

    var link = document.createElement('button');
    link.type = 'button';
    link.className = 'btn btn-primary featured-link';
    link.textContent = 'Read full story';
    link.addEventListener('click', function () {
      openDetail(item);
    });
    body.appendChild(link);

    fragment.appendChild(body);
    featuredEl.appendChild(fragment);
    refreshLazy();
  }

  function createNewsCard(item) {
    var article = document.createElement('article');
    article.className = 'news-card';
    article.dataset.animateItem = '';
    if (item.id) {
      article.id = item.id;
    }

    if (item.image) {
      var imageWrap = document.createElement('div');
      imageWrap.className = 'news-image';
      if (item.imageAspect) {
        imageWrap.style.aspectRatio = item.imageAspect;
      }
      var img = document.createElement('img');
      img.className = 'lazy';
      img.setAttribute('data-src', item.image);
      img.setAttribute('alt', item.imageAlt || item.title);
      img.setAttribute('width', '1080');
      img.setAttribute('height', '1080');
      if (item.imageFit) {
        img.style.objectFit = item.imageFit;
      }
      if (item.imagePosition) {
        img.style.objectPosition = item.imagePosition;
      }
      imageWrap.appendChild(img);
      article.appendChild(imageWrap);
    }

    var head = document.createElement('div');
    head.className = 'news-card-head';
    var kicker = document.createElement('span');
    kicker.className = 'featured-kicker';
    kicker.innerHTML = highlightText(item.kicker || 'Update', state.search);
    head.appendChild(kicker);

    var title = document.createElement('h3');
    title.innerHTML = highlightText(item.title, state.search);
    head.appendChild(title);

    var meta = document.createElement('p');
    meta.className = 'news-meta';
    var metaParts = [];
    if (item.displayDate) {
      metaParts.push(item.displayDate);
    }
    metaParts.push(estimateReadingTime(item));
    meta.textContent = metaParts.join(' | ');
    head.appendChild(meta);

    article.appendChild(head);

    var copy = document.createElement('p');
    copy.innerHTML = highlightText(item.summary || (item.body && item.body[0]) || '', state.search);
    article.appendChild(copy);

    var footer = document.createElement('div');
    footer.className = 'news-card-footer';

    var reading = document.createElement('span');
    reading.className = 'news-reading';
    reading.textContent = item.kicker ? item.kicker : '';
    footer.appendChild(reading);

    var link = document.createElement('button');
    link.type = 'button';
    link.className = 'btn btn-link';
    link.textContent = 'Read more';
    link.addEventListener('click', function () {
      openDetail(item);
    });
    footer.appendChild(link);

    article.appendChild(footer);

    return article;
  }

  function getSearchFields(item) {
    return [
      item.title,
      item.kicker,
      item.summary,
      item.displayDate,
      Array.isArray(item.body) ? item.body.join(' ') : '',
      item.imageAlt
    ];
  }

  function estimateReadingTime(item) {
    var content = Array.isArray(item.body) && item.body.length
      ? item.body.join(' ')
      : (item.summary || '');
    var wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (!wordCount) return '1 min read';
    var minutes = Math.max(1, Math.round(wordCount / 200));
    return minutes + ' min read';
  }

  function updateStatus(total) {
    if (!statusEl) return;
    if (!total) {
      statusEl.textContent = state.search
        ? 'No news matched "' + state.search.trim() + '".'
        : 'No news items available.';
      return;
    }
    var label = total === 1 ? 'story' : 'stories';
    statusEl.textContent = state.search
      ? total + ' ' + label + ' for "' + state.search.trim() + '".'
      : total + ' ' + label + ' shown.';
  }

  function openDetail(item) {
    if (!detailEl) {
      if (item.url) {
        window.location.href = item.url;
      }
      return;
    }

    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (detailMediaEl) {
      detailMediaEl.innerHTML = '';
      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = item.imageAlt || item.title;
        img.loading = 'lazy';
        img.width = 1080;
        img.height = 1080;
        detailMediaEl.appendChild(img);
      }
    }

    if (detailKickerEl) {
      detailKickerEl.innerHTML = highlightText(item.kicker || '', state.search);
      detailKickerEl.hidden = !item.kicker;
    }

    if (detailTitleEl) {
      detailTitleEl.innerHTML = highlightText(item.title, state.search);
    }

    if (detailMetaEl) {
      var bits = [];
      if (item.displayDate) bits.push(item.displayDate);
      bits.push(estimateReadingTime(item));
      detailMetaEl.textContent = bits.join(' | ');
    }

    if (detailBodyEl) {
      detailBodyEl.innerHTML = '';
      if (Array.isArray(item.body) && item.body.length) {
        item.body.forEach(function (paragraph) {
          var p = document.createElement('p');
          p.innerHTML = highlightText(paragraph, state.search);
          detailBodyEl.appendChild(p);
        });
      } else if (item.summary) {
        var summary = document.createElement('p');
        summary.innerHTML = highlightText(item.summary, state.search);
        detailBodyEl.appendChild(summary);
      }
    }

    detailEl.hidden = false;
    requestAnimationFrame(function () {
      detailEl.classList.add('is-active');
      detailEl.setAttribute('aria-hidden', 'false');
      document.body.classList.add('news-detail-open');
      detailOpen = true;
      var closeButton = detailEl.querySelector('.news-detail-close');
      if (closeButton) {
        closeButton.focus();
      }
    });
  }

  function closeDetail() {
    if (!detailEl || detailEl.hidden) {
      return;
    }
    detailEl.classList.remove('is-active');
    detailEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('news-detail-open');
    detailOpen = false;
    setTimeout(function () {
      if (detailEl.classList.contains('is-active')) return;
      detailEl.hidden = true;
      if (detailMediaEl) {
        detailMediaEl.innerHTML = '';
      }
    }, 220);

    if (lastFocused && document.body.contains(lastFocused)) {
      lastFocused.focus();
    }
  }
})();
