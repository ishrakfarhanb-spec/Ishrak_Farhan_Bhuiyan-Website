// Populate hero and latest news cards on the home page.
(function () {
  const newsItems = Array.isArray(window.siteNews) ? [...window.siteNews] : [];
  if (!newsItems.length) {
    return;
  }

  newsItems.sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });

  const heroCard = document.querySelector("[data-news-hero]");
  if (heroCard) {
    const hero = newsItems[0];
    const heroImage = heroCard.querySelector("[data-news-hero-image]");
    const heroKicker = heroCard.querySelector("[data-news-hero-kicker]");
    const heroTitle = heroCard.querySelector("[data-news-hero-title]");
    const heroSummary = heroCard.querySelector("[data-news-hero-summary]");
    const heroLink = heroCard.querySelector("[data-news-hero-link]");

    if (heroImage) {
      heroImage.setAttribute("data-src", hero.image);
      heroImage.setAttribute("alt", hero.imageAlt || hero.title);
    }
    if (heroKicker) {
      heroKicker.textContent = hero.kicker || "Update";
    }
    if (heroTitle) {
      heroTitle.textContent = hero.title;
    }
    if (heroSummary) {
      heroSummary.textContent = hero.summary;
    }
    if (heroLink) {
      heroLink.setAttribute("href", hero.url || "news.html");
      heroLink.innerHTML = "Read update &rarr;";
    }
  }

  const latestContainer = document.querySelector("[data-news-latest]");
  if (!latestContainer) {
    return;
  }

  const latestNews = newsItems.slice(1, 4);
  latestNews.forEach((item) => {
    latestContainer.appendChild(createNewsCard(item));
  });

  function createNewsCard(item) {
    const article = document.createElement("article");
    article.className = "card";

    const media = document.createElement("div");
    media.className = "card-media";

    const img = document.createElement("img");
    img.className = "lazy";
    img.setAttribute("data-src", item.image);
    img.setAttribute("alt", item.imageAlt || item.title);
    img.setAttribute("width", "800");
    img.setAttribute("height", "450");
    media.appendChild(img);

    const body = document.createElement("div");
    body.className = "card-body";

    if (item.kicker) {
      const kicker = document.createElement("span");
      kicker.className = "eyebrow";
      kicker.textContent = item.kicker;
      body.appendChild(kicker);
    }

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title;
    body.appendChild(title);

    if (item.displayDate) {
      const date = document.createElement("p");
      date.className = "muted";
      date.textContent = item.displayDate;
      body.appendChild(date);
    }

    if (item.summary) {
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      body.appendChild(summary);
    }

    const link = document.createElement("a");
    link.className = "btn btn-link";
    link.setAttribute("href", item.url || "news.html");
    link.innerHTML = "Read more &rarr;";
    body.appendChild(link);

    article.appendChild(media);
    article.appendChild(body);
    return article;
  }
})();
