;(function () {
  var toggles = document.querySelectorAll('.xp-toggle[aria-controls]');
  if (!toggles.length) return;

  toggles.forEach(function (toggle) {
    if (toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';
    toggle.addEventListener('click', function () {
      var panelId = toggle.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      var card = toggle.closest('.xp-card');
      var group = toggle.closest('.xp-grid');
      var willOpen = toggle.getAttribute('aria-expanded') !== 'true';

      if (group) {
        group.querySelectorAll('.xp-toggle[aria-expanded="true"]').forEach(function (other) {
          if (other === toggle) return;
          setCardState(other, false);
        });
      }

      setCardState(toggle, willOpen);

      if (willOpen && card && typeof card.scrollIntoView === 'function') {
        window.setTimeout(function () {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      }
    });
  });

  function setCardState(toggle, isOpen) {
    var panelId = toggle.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : null;
    var card = toggle.closest('.xp-card');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.textContent = isOpen ? 'Collapse' : 'Explore';
    if (card) {
      card.classList.toggle('is-open', isOpen);
    }
    if (panel) {
      panel.hidden = !isOpen;
    }
  }
})();
