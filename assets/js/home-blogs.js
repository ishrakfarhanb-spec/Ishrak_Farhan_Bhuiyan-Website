// Populate the Latest Blogs section on the home page using local data
;(function () {
  const container = document.getElementById('latest-blogs');
  if (!container) return;

  const posts = Array.isArray(window.siteBlogs) ? window.siteBlogs.slice() : [];
  if (!posts.length) {
    container.innerHTML = '<p class="muted">Blog posts are on the way. Check back soon.</p>';
    return;
  }

  posts.sort(function (a, b) {
    const da = Date.parse(a.date || 0);
    const db = Date.parse(b.date || 0);
    return isNaN(db) ? -1 : (isNaN(da) ? 1 : db - da);
  });

  const latest = posts.slice(0, 3);
  container.innerHTML = latest.map(function (post) {
    return [
      '<article class="card">',
      '  <div class="card-media">',
      post.image ? '    <img data-src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.imageAlt || post.title) + '" class="lazy" width="640" height="360" />' : '',
      '  </div>',
      '  <div class="card-body">',
      post.kicker ? '    <span class="eyebrow">' + escapeHtml(post.kicker) + '</span>' : '',
      '    <h3 class="card-title">' + escapeHtml(post.title) + '</h3>',
      '    <p class="muted">' + escapeHtml(post.displayDate || formatDate(post.date)) + '</p>',
      post.summary ? '    <p>' + escapeHtml(post.summary) + '</p>' : '',
      '    <a class="btn btn-link" href="blogs.html" data-blog-link="' + escapeHtml(post.id) + '">Read more</a>',
      '  </div>',
      '</article>'
    ].join('');
  }).join('');

  if (window.initUI) window.initUI();

  container.querySelectorAll('[data-blog-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      sessionStorage.setItem('blogs:open', link.getAttribute('data-blog-link'));
    });
  });

  function formatDate(value) {
    const time = Date.parse(value);
    if (isNaN(time)) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(time);
  }

  function escapeHtml(str) {
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