// Simple theme toggle: toggles data-theme on <html> and persists to localStorage
(function(){
  var LABEL = 'Toggle Theme';
  var SELECTOR = '#theme-toggle, [data-theme-toggle]';

  function apply(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch(e){}
    syncButtons(theme);
  }

  function current(){
    var t = document.documentElement.getAttribute('data-theme');
    if(!t){
      try { t = localStorage.getItem('theme') || 'light'; }
      catch(e){ t = 'light'; }
    }
    return t === 'dark' ? 'dark' : 'light';
  }

  function toggle(){
    apply(current() === 'dark' ? 'light' : 'dark');
  }

  function syncButtons(theme){
    var buttons = document.querySelectorAll(SELECTOR);
    if(!buttons.length) return;
    buttons.forEach(function(btn){
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.textContent = LABEL;
      btn.setAttribute('aria-label', LABEL);
      btn.setAttribute('title', LABEL);
      if(!btn.getAttribute('type')) btn.setAttribute('type', 'button');
      if(!btn.dataset.themeBound){
        btn.addEventListener('click', toggle);
        btn.dataset.themeBound = 'true';
      }
    });
  }

  function init(){
    apply(current());
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('partials:ready', init);
  if(window.__partialsReady) init();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e){
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch(err){ stored = null; }
    if(stored) return;
    apply(e.matches ? 'dark' : 'light');
  });
})();

