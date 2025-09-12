// Simple HTML partials loader
;(function () {
  function load(includeEl) {
    var name = includeEl.getAttribute('data-include');
    if (!name) return Promise.resolve();
    var primary = 'assets/partials/' + name + '.html';
    var fallback = '../assets/partials/' + name + '.html';
    function fetchText(url){
      return fetch(url, { credentials: 'same-origin' }).then(function(res){
        if (!res.ok) throw new Error('HTTP '+res.status);
        return res.text();
      });
    }
    return fetchText(primary).catch(function(){ return fetchText(fallback); })
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
      // Mark readiness and notify listeners; some scripts may attach later.
      window.__partialsReady = true;
      window.dispatchEvent(new Event('partials:ready'));
      if (typeof window.initUI === 'function') window.initUI();
    });
  });
})();
