;(function(){
  function byDateDesc(a,b){ return (a.date<b.date)?1:(a.date>b.date)?-1:0; }

  function el(tag, attrs, children){
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k){
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children||[]).forEach(function(c){ e.appendChild(c); });
    return e;
  }

  function readingMinutes(post){
    var words = (post.content||[]).join(' ').trim().split(/\s+/).filter(Boolean).length;
    var mins = Math.max(1, Math.round(words / 200));
    return mins + ' mins read';
  }

  function renderLatest(posts){
    var wrap = document.getElementById('latest-blogs');
    if (!wrap) return;
    posts.slice(0,3).forEach(function(p){
      var card = el('article', {class:'card'} , [
        el('div', {class:'card-body'}, [
          el('h3', {class:'card-title', text:p.title}),
          el('p', {class:'muted', text:new Date(p.date).toLocaleDateString()}),
          el('p', {text:p.excerpt}),
          el('a', {class:'btn btn-link', href:'blogs/#'+p.slug, text:'Read'})
        ])
      ]);
      wrap.appendChild(card);
    });
  }

  function renderFeatured(posts){
    var hero = document.getElementById('blog-hero');
    if (!hero || !posts.length) return;
    var p = posts[0];
    hero.innerHTML = '';
    var inner = el('div', {class:'blog-hero-inner'});
    var left = el('div', {class:'hero-copy'});
    left.appendChild(el('span', {class:'badge', text:'Featured'}));
    left.appendChild(el('h2', {class:'hero-title', text:p.title}));
    left.appendChild(el('p', {class:'muted', text:p.excerpt}));
    var actions = el('div', {class:'hero-actions'});
    var read = el('a', {href:'blogs/#'+p.slug, class:'btn btn-primary', text:'Read'});
    read.addEventListener('click', function(e){ e.preventDefault(); openModal(p); history.replaceState(null,'','#'+p.slug); });
    actions.appendChild(read);
    left.appendChild(actions);

    var right = el('div', {class:'hero-meta'});
    right.appendChild(el('p', {class:'muted', text:new Date(p.date).toLocaleDateString() + ' • ' + readingMinutes(p)}));

    // If image present, set as hero background
    if (p.image) {
      hero.style.setProperty('--hero-image', 'url("'+p.image+'")');
    }
    inner.appendChild(left);
    inner.appendChild(right);
    hero.appendChild(inner);
  }

  function renderGrid(posts){
    var grid = document.getElementById('blogs-grid');
    if (!grid) return;
    posts.forEach(function(p){
      var a = el('a', {href: 'blogs/#'+p.slug, class:'card'});
      var media = el('div', {class:'card-media'});
      var imgSrc = p.image || 'assets/img/placeholder-wide.svg';
      var img = el('img', {src: imgSrc, alt:p.title});
      media.appendChild(img);
      if (p.category) media.appendChild(el('span', {class:'badge chip-on-image', text:p.category}));
      a.appendChild(media);

      var body = el('div', {class:'card-body'});
      var meta = el('div', {class:'card-meta', text: new Date(p.date).toLocaleDateString() + ' • ' + readingMinutes(p)});
      body.appendChild(meta);
      body.appendChild(el('h3', {class:'card-title', text:p.title}));
      body.appendChild(el('p', {class:'clamp-2', text:p.excerpt}));

      // Optional author row if provided
      if (p.author) {
        var row = el('div', {class:'author-row'});
        if (p.author.avatar) row.appendChild(el('img', {class:'avatar', src:p.author.avatar, alt:p.author.name||'Author'}));
        if (p.author.name) row.appendChild(el('span', {class:'author-name', text:p.author.name}));
        body.appendChild(row);
      }

      a.appendChild(body);
      a.addEventListener('click', function(e){
        e.preventDefault();
        openModal(p);
        history.replaceState(null, '', '#'+p.slug);
      });
      grid.appendChild(a);
    });
  }

  function openModal(post){
    var modal = document.getElementById('blog-modal');
    var content = document.getElementById('blog-modal-content');
    if (!modal || !content) return;
    content.innerHTML = '';
    content.appendChild(el('h2', {text: post.title}));
    content.appendChild(el('p', {class:'muted', text:new Date(post.date).toLocaleDateString()}));
    (post.content||[]).forEach(function(par){ content.appendChild(el('p', {text:par})); });
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    var modal = document.getElementById('blog-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  function bindModalControls(){
    var modal = document.getElementById('blog-modal');
    if (!modal) return;
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn && !closeBtn.dataset.bound){
      closeBtn.addEventListener('click', closeModal);
      closeBtn.dataset.bound = '1';
    }
    if (!modal.dataset.bound){
      modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', function(e){ if (e.key==='Escape') closeModal(); });
      modal.dataset.bound = '1';
    }
  }

  function load(){
    fetch('assets/data/blogs.json', {credentials:'same-origin'})
      .then(function(r){ return r.json(); })
      .then(function(data){ 
        var posts = (data||[]).slice().sort(byDateDesc);
        renderLatest(posts);
        renderFeatured(posts);
        renderGrid(posts);
        bindModalControls();
        // Sorting
        var sel = document.getElementById('blog-sort');
        if (sel && !sel.dataset.bound){
          sel.addEventListener('change', function(){
            var sorted = posts.slice().sort(byDateDesc);
            if (sel.value === 'oldest') sorted.reverse();
            document.getElementById('blogs-grid').innerHTML='';
            renderGrid(sorted);
          });
          sel.dataset.bound = '1';
        }
        // Open from hash if present
        var slug = (location.hash||'').replace(/^#/,'');
        if (slug) {
          var match = posts.find(function(p){ return p.slug === slug; });
          if (match) openModal(match);
        }
      })
      .catch(function(){ /* no-op */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, {once:true});
  else load();
})();

