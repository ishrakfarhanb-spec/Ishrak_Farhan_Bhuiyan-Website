;(function () {
  var containers = document.querySelectorAll('[data-animate]');
  if (!containers.length) return;

  function revealAll(container) {
    container.querySelectorAll('[data-animate-item]').forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  if (!('IntersectionObserver' in window)) {
    containers.forEach(revealAll);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  function bind(container) {
    container.querySelectorAll('[data-animate-item]').forEach(function (item) {
      if (item.dataset.animateBound === 'true') return;
      item.dataset.animateBound = 'true';
      observer.observe(item);
    });
  }

  containers.forEach(function (container) {
    bind(container);
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { bind(container); });
      mo.observe(container, { childList: true, subtree: true });
    }
  });

  document.querySelectorAll('.about-logo-track').forEach(function (track) {
    var base = 20 + Math.random() * 6;
    track.style.animationDuration = base.toFixed(1) + 's';
  });
})();
