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

  function renderLatest(posts){
    var wrap = document.getElementById('latest-blogs');
    if (!wrap) return;
    posts.slice(0,3).forEach(function(p){
      var card = el('article', {class:'card'} , [
        el('div', {class:'card-body'}, [
          el('h3', {class:'card-title', text:p.title}),
          el('p', {class:'muted', text:new Date(p.date).toLocaleDateString()}),
          el('p', {text:p.excerpt}),
          el('a', {class:'btn btn-link', href:'blogs.html#'+p.slug, text:'Read'})
        ])
      ]);
      wrap.appendChild(card);
    });
  }

  function renderAll(posts){
    var list = document.getElementById('blogs-list');
    if (!list) return;
    posts.forEach(function(p){
      var art = el('article', {class:'update', id:p.slug}, [
        el('h2', {text:p.title}),
        el('p', {class:'muted', text:new Date(p.date).toLocaleDateString()}),
      ]);
      (p.content||[]).forEach(function(par){ art.appendChild(el('p', {text:par})); });
      list.appendChild(art);
    });
  }

  function load(){
    fetch('assets/data/blogs.json', {credentials:'same-origin'})
      .then(function(r){ return r.json(); })
      .then(function(data){ var posts = (data||[]).slice().sort(byDateDesc); renderLatest(posts); renderAll(posts); })
      .catch(function(){ /* no-op */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, {once:true});
  else load();
})();

