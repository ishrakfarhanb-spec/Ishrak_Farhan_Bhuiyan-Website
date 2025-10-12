// Render the full news list on the news page.
(function () {
  const container = document.querySelector("[data-news-list]");
  if (!container || !Array.isArray(window.siteNews)) {
    return;
  }

  const items = [...window.siteNews].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });

  if (!items.length) {
    container.innerHTML = '<p class="muted">No news yet. Check back soon.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    fragment.appendChild(createNewsArticle(item));
  });

  container.appendChild(fragment);

  function createNewsArticle(item) {
    const article = document.createElement("article");
    article.className = "update";
    if (item.id) {
      article.id = item.id;
    }

    const title = document.createElement("h2");
    title.textContent = item.title;
    article.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "muted";
    const parts = [];
    if (item.displayDate) {
      parts.push(item.displayDate);
    }
    if (item.kicker) {
      parts.push(item.kicker);
    }
    meta.textContent = parts.join(" \u2022 ");
    article.appendChild(meta);

    if (Array.isArray(item.body) && item.body.length) {
      item.body.forEach(function (paragraph) {
        const p = document.createElement("p");
        p.textContent = paragraph;
        article.appendChild(p);
      });
    } else if (item.summary) {
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      article.appendChild(summary);
    }

    if (item.image) {
      const media = document.createElement("div");
      media.className = "update-media";

      const img = document.createElement("img");
      img.className = "lazy";
      img.setAttribute("data-src", item.image);
      img.setAttribute("alt", item.imageAlt || item.title);
      img.setAttribute("width", "960");
      img.setAttribute("height", "540");

      media.appendChild(img);
      article.appendChild(media);
    }

    return article;
  }
})();
