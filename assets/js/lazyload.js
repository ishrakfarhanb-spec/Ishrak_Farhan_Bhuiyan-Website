(function() {
  var observer = null;
  var supportsObserver = 'IntersectionObserver' in window;

  function loadImage(img) {
    if (!img || !img.getAttribute('data-src')) return;
    img.src = img.getAttribute('data-src');
    img.classList.remove('lazy');
    img.removeAttribute('data-src');
    if (supportsObserver && observer) observer.unobserve(img);
  }

  function bind(img) {
    if (!img || img.dataset.lazyBound === 'true') return;
    img.dataset.lazyBound = 'true';

    if (supportsObserver) {
      if (!observer) {
        observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              loadImage(entry.target);
            }
          });
        }, { rootMargin: '200px 0px' });
      }
      observer.observe(img);
    } else {
      loadImage(img);
    }
  }

  function refresh() {
    var lazy = document.querySelectorAll('img.lazy');
    lazy.forEach(bind);
  }

  refresh();
  window.refreshLazyImages = refresh;
  document.addEventListener('lazyload:refresh', refresh);
})();
