;(function () {
  var container = document.getElementById('latest-blogs');
  if (!container) return;

  var utils = window.siteUtils || {};
  var formatDate = utils.formatDate || fallbackFormatDate;
  var toTimestamp = utils.toTimestamp || fallbackToTimestamp;

  var posts = Array.isArray(window.siteBlogs) ? window.siteBlogs.slice() : [];
  if (!posts.length) {
    container.innerHTML = '<p class="muted">Blog posts are on the way. Check back soon.</p>';
    return;
  }

  posts.sort(function (a, b) {
    return toTimestamp(b.date) - toTimestamp(a.date);
  });

  var fragment = document.createDocumentFragment();
  posts.slice(0, 3).forEach(function (post) {
    fragment.appendChild(createCard(post));
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  if (typeof window.initUI === 'function') window.initUI();

  function createCard(post) {
    var article = document.createElement('article');
    article.className = 'card';
    article.setAttribute('data-animate-item', '');

    var media = document.createElement('div');
    media.className = 'card-media';
    if (post.image) {
      var img = document.createElement('img');
      img.className = 'lazy';
      img.setAttribute('data-src', post.image);
      img.setAttribute('alt', post.imageAlt || post.title || '');
      img.setAttribute('width', '640');
      img.setAttribute('height', '360');
      media.appendChild(img);
    }
    article.appendChild(media);

    var body = document.createElement('div');
    body.className = 'card-body';

    if (post.kicker) {
      var kicker = document.createElement('span');
      kicker.className = 'eyebrow';
      kicker.textContent = post.kicker;
      body.appendChild(kicker);
    }

    var title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = post.title;
    body.appendChild(title);

    var date = document.createElement('p');
    date.className = 'muted';
    date.textContent = post.displayDate || formatDate(post.date);
    body.appendChild(date);

    if (post.summary) {
      var summary = document.createElement('p');
      summary.textContent = post.summary;
      body.appendChild(summary);
    }

    var link = document.createElement('a');
    link.className = 'btn btn-link btn-link-arrow';
    link.href = 'blogs.html';
    if (post.id) link.dataset.blogLink = post.id;
    link.innerHTML = '<span>Read more</span><span aria-hidden="true" class="link-arrow">→</span>';
    link.addEventListener('click', function () {
      if (post.id) {
        sessionStorage.setItem('blogs:open', post.id);
      }
    });
    body.appendChild(link);

    article.appendChild(body);
    return article;
  }

  function fallbackFormatDate(value) {
    var timestamp = Date.parse(value || '');
    if (isNaN(timestamp)) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(timestamp);
  }

  function fallbackToTimestamp(value) {
    var timestamp = Date.parse(value || '');
    return isNaN(timestamp) ? 0 : timestamp;
  }
})();
