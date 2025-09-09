(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    const hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) {
      e.preventDefault();
      return false;
    }
  });
})();
