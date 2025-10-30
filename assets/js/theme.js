// Simple theme toggle: toggles data-theme on <html> and persists to localStorage
(function(){
  var LABEL = 'Toggle theme';
  var SELECTOR = '#theme-toggle, [data-theme-toggle]';
  var SOUND_PREF_KEY = 'themeToggleSound';
  var floatingToggle = null;
  var floatingListenersAdded = false;
  var scrollTick = false;
  var lastScrollY = window.scrollY || 0;
  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var soundEnabled = false;
  var soundListenersAdded = false;
  var soundStatusNode = null;
  var audioCtx = null;

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
    var nextTheme = current() === 'dark' ? 'light' : 'dark';
    apply(nextTheme);
    afterToggle(nextTheme);
  }

  function syncButtons(theme){
    var buttons = document.querySelectorAll(SELECTOR);
    if(!buttons.length) return;
    buttons.forEach(function(btn){
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', LABEL);
      btn.setAttribute('title', LABEL);
      btn.dataset.themeState = theme;
      var sr = btn.querySelector('.sr-only');
      if(sr){
        sr.textContent = LABEL;
      } else if(!btn.dataset.themeHasText){
        btn.textContent = LABEL;
      }
      btn.dataset.themeHasText = 'true';
      if(!btn.getAttribute('type')) btn.setAttribute('type', 'button');
      if(!btn.dataset.themeBound){
        btn.addEventListener('click', toggle);
        btn.dataset.themeBound = 'true';
      }
    });
  }

  function afterToggle(theme){
    revealFloatingToggle();
    playToggleSound(theme);
  }

  function revealFloatingToggle(){
    if(floatingToggle){
      floatingToggle.classList.remove('is-hidden');
    }
  }

  function init(){
    apply(current());
    setupFloatingToggle();
    initSoundControls();
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

  function setupFloatingToggle(){
    floatingToggle = document.querySelector('.theme-toggle-floating');
    if(!floatingToggle){
      return;
    }
    if(!floatingListenersAdded){
      floatingListenersAdded = true;
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
    }
    updateFloatingState(true);
  }

  function handleScroll(){
    if(!floatingToggle) return;
    if(!scrollTick){
      scrollTick = true;
      window.requestAnimationFrame(function(){
        updateFloatingState();
        scrollTick = false;
      });
    }
  }

  function handleResize(){
    if(!floatingToggle) return;
    updateFloatingState(true);
  }

  function updateFloatingState(force){
    if(!floatingToggle) return;
    var y = window.scrollY || window.pageYOffset || 0;
    if(force){
      lastScrollY = y;
    }

    if(!force){
      var diff = y - lastScrollY;
      if(y > 160 && diff > 6){
        floatingToggle.classList.add('is-hidden');
      } else if(diff < -6 || y <= 160){
        floatingToggle.classList.remove('is-hidden');
      }
    } else {
      floatingToggle.classList.remove('is-hidden');
    }

    lastScrollY = y;
  }

  function initSoundControls(){
    soundEnabled = readSoundPreference();
    applySoundState();
    ensureSoundStatusNode();
    if(!soundListenersAdded){
      soundListenersAdded = true;
      document.addEventListener('keydown', handleSoundShortcut, true);
    }
  }

  function readSoundPreference(){
    var stored = null;
    try { stored = localStorage.getItem(SOUND_PREF_KEY); }
    catch(err){ stored = null; }
    return stored === 'on';
  }

  function setSoundPreference(enabled){
    soundEnabled = !!enabled;
    try { localStorage.setItem(SOUND_PREF_KEY, soundEnabled ? 'on' : 'off'); }
    catch(err){}
    applySoundState();
    announceSoundState();
    if(soundEnabled){
      warmAudioContext();
      playToggleSound(current());
    }
  }

  function applySoundState(){
    document.documentElement.dataset.themeSound = soundEnabled ? 'on' : 'off';
  }

  function handleSoundShortcut(event){
    if(event.defaultPrevented) return;
    if(!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    var key = event.key || event.code;
    if(!key) return;
    var target = event.target;
    if(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)){
      return;
    }
    if(key.toLowerCase() === 't'){
      event.preventDefault();
      setSoundPreference(!soundEnabled);
    }
  }

  function ensureSoundStatusNode(){
    if(soundStatusNode) return;
    soundStatusNode = document.querySelector('[data-theme-sound-status]');
    if(!soundStatusNode){
      soundStatusNode = document.createElement('div');
      soundStatusNode.setAttribute('role', 'status');
      soundStatusNode.setAttribute('aria-live', 'polite');
      soundStatusNode.setAttribute('aria-atomic', 'true');
      soundStatusNode.dataset.themeSoundStatus = 'true';
      soundStatusNode.className = 'sr-only';
      document.body.appendChild(soundStatusNode);
    }
  }

  function announceSoundState(){
    if(!soundStatusNode) return;
    var message = soundEnabled ? 'Theme chime enabled' : 'Theme chime muted';
    soundStatusNode.textContent = message;
  }

  function warmAudioContext(){
    if(audioCtx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    try {
      audioCtx = new Ctx();
    } catch(err){
      audioCtx = null;
    }
  }

  function playToggleSound(theme){
    if(!soundEnabled) return;
    if(reduceMotionQuery && reduceMotionQuery.matches) return;
    warmAudioContext();
    if(!audioCtx) return;
    if(audioCtx.state === 'suspended'){
      try { audioCtx.resume(); }
      catch(err){ return; }
    }
    var now = audioCtx.currentTime + 0.01;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var base = theme === 'dark' ? 320 : 220;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.35, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
})();
