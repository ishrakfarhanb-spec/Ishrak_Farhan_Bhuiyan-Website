// Simple theme toggle: toggles data-theme on <html> and persists to localStorage
(function(){
  function apply(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch(e){}
    var btn = document.getElementById('theme-toggle');
    if(btn){
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      // Keep a single, consistent label
      btn.textContent = 'Toggle Theme';
      btn.setAttribute('aria-label', 'Toggle Theme');
      btn.setAttribute('title', 'Toggle Theme');
    }
  }

  function current(){
    var t = document.documentElement.getAttribute('data-theme');
    if(!t){ try { t = localStorage.getItem('theme') || 'light'; } catch(e){ t='light'; } }
    return t === 'dark' ? 'dark' : 'light';
  }

  function toggle(){ apply(current() === 'dark' ? 'light' : 'dark'); }

  document.addEventListener('DOMContentLoaded', function(){
    // Initialize from storage
    var saved = 'light';
    try { saved = localStorage.getItem('theme') || 'light'; } catch(e){}
    apply(saved);
    var btn = document.getElementById('theme-toggle');
    if(btn){
      // Ensure consistent button label
      btn.textContent = 'Toggle Theme';
      btn.setAttribute('aria-label', 'Toggle Theme');
      btn.setAttribute('title', 'Toggle Theme');
      btn.addEventListener('click', toggle);
    }
  });
})();

