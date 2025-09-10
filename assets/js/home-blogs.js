// Render latest 3 blog cards from the Blogs site onto the home page
(function(){
  const containerId = 'latest-blogs';
  const blogBase = 'https://ishrakfarhanb-spec.github.io/Blogs/';
  const dataUrl  = blogBase + 'assets/data/blogs.json';

  function esc(s){
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function toCard(item){
    const img = blogBase + (item.image || 'assets/img/placeholder-wide.svg');
    const alt = esc(item.imageAlt || item.title || 'Blog image');
    const title = esc(item.title || 'Untitled');
    const excerpt = esc(item.excerpt || '');
    const meta = [item.category, item.author].filter(Boolean).map(esc).join(' • ');
    return `
    <article class="card">
      <div class="card-media"><img src="${img}" alt="${alt}" loading="lazy"></div>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        ${meta ? `<p class="muted">${meta}</p>` : ''}
        ${excerpt ? `<p>${excerpt}</p>` : ''}
        <a class="btn btn-link" href="${blogBase}" target="_blank" rel="noopener">Read on Blogs →</a>
      </div>
    </article>`;
  }

  function sortByDateDesc(list){
    return (Array.isArray(list) ? [...list] : []).sort((a,b)=>{
      const da = Date.parse(a && a.date);
      const db = Date.parse(b && b.date);
      const va = isNaN(da) ? -Infinity : da;
      const vb = isNaN(db) ? -Infinity : db;
      if(vb===va) return 0;
      return vb - va;
    });
  }

  async function init(){
    const el = document.getElementById(containerId);
    if(!el) return;
    try{
      const res = await fetch(dataUrl, { cache: 'no-cache' });
      if(!res.ok) throw new Error('Bad status '+res.status);
      const items = await res.json();
      const latest = sortByDateDesc(items).slice(0,3);
      el.innerHTML = latest.map(toCard).join('');
    }catch(err){
      el.innerHTML = `<p class="muted">Could not load latest blogs. <a href="${blogBase}" target="_blank" rel="noopener">Visit the blog →</a></p>`;
      // console.warn('Failed to load blogs:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
