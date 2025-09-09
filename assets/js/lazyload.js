(function() {
  const lazy = [].slice.call(document.querySelectorAll('img.lazy'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });
    lazy.forEach(img => io.observe(img));
  } else {
    lazy.forEach(img => { img.src = img.getAttribute('data-src'); img.classList.remove('lazy'); });
  }
})();
