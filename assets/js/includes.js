// Simple HTML partials loader
// Redirect apex domain to www (fallback when registrar redirect is unavailable)
;(function () {
  try {
    var apex = 'ishrakfarhan-b.com';
    var preferred = 'www.ishrakfarhan-b.com';
    var host = (location.hostname || '').toLowerCase();
    if (host === apex) {
      var dest = 'https://' + preferred + location.pathname + location.search + location.hash;
      // Use replace to avoid creating back entries in history
      location.replace(dest);
      return; // stop executing rest of this file on apex
    }
  } catch (e) { /* no-op */ }

  (function () {
  function load(includeEl) {
    var name = includeEl.getAttribute('data-include');
    if (!name) return Promise.resolve();
    var url = '/assets/partials/' + name + '.html';
    return fetch(url, { credentials: 'same-origin' })
      .then(function (res) { return res.text(); })
      .then(function (html) { includeEl.outerHTML = html; })
      .catch(function () { /* fail silent */ });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var includes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    if (includes.length === 0) return;
    Promise.all(includes.map(load)).then(function () {
      window.dispatchEvent(new Event('partials:ready'));
      if (typeof window.initUI === 'function') window.initUI();
    });
  });
  })();
})();
