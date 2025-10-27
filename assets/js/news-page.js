// Enhanced news page rendering with featured spotlight and progressive loading.
(function () {
  const listEl = document.querySelector("[data-news-list]");
  const featuredEl = document.querySelector("[data-news-featured]");
  const loadMoreBtn = document.querySelector("[data-news-load-more]");
  const detailEl = document.querySelector("[data-news-detail]");
  const detailMediaEl = detailEl ? detailEl.querySelector("[data-news-detail-media]") : null;
  const detailKickerEl = detailEl ? detailEl.querySelector("[data-news-detail-kicker]") : null;
  const detailTitleEl = detailEl ? detailEl.querySelector("[data-news-detail-title]") : null;
  const detailMetaEl = detailEl ? detailEl.querySelector("[data-news-detail-meta]") : null;
  const detailBodyEl = detailEl ? detailEl.querySelector("[data-news-detail-body]") : null;
  const detailBackEl = detailEl ? detailEl.querySelector("[data-news-detail-back]") : null;
  const detailCloseEls = detailEl ? detailEl.querySelectorAll("[data-news-detail-close]") : [];

  if (!listEl || !Array.isArray(window.siteNews)) {
    return;
  }

  const NEWS_PER_BATCH = 4;
  const items = [...window.siteNews].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });

  if (!items.length) {
    listEl.innerHTML = '<p class="muted">No news yet. Check back soon.</p>';
    return;
  }

  const featured = items[0];
  const rest = items.slice(1);
  let renderedCount = 0;
  let lastFocused = null;
  let detailOpen = false;
  const refreshLazy = function () {
    if (typeof window.refreshLazyImages === "function") {
      window.refreshLazyImages();
    } else {
      document.dispatchEvent(new Event("lazyload:refresh"));
    }
  };

  if (featured && featuredEl) {
    renderFeatured(featured);
    featuredEl.hidden = false;
  }

  renderBatch(true);
  toggleLoadMore();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      renderBatch(false);
      toggleLoadMore();
    });
  }

  if (detailEl && detailCloseEls.length) {
    detailCloseEls.forEach((el) => {
      el.addEventListener("click", closeDetail);
    });
  }

  if (detailBackEl) {
    detailBackEl.addEventListener("click", function () {
      closeDetail();
      if (listEl && typeof listEl.scrollIntoView === "function") {
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (detailEl) {
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && detailOpen) {
        event.preventDefault();
        closeDetail();
      }
    });
  }

  function renderBatch(reset) {
    const source = rest;
    if (reset) {
      renderedCount = 0;
    }
    const nextItems = source.slice(renderedCount, renderedCount + NEWS_PER_BATCH);
    if (reset || renderedCount === 0) {
      listEl.innerHTML = "";
    }
    if (!nextItems.length) return;

    const fragment = document.createDocumentFragment();
    nextItems.forEach((item) => {
      fragment.appendChild(createNewsCard(item));
    });
    listEl.appendChild(fragment);
    renderedCount += nextItems.length;
    refreshLazy();
  }

  function toggleLoadMore() {
    if (!loadMoreBtn) return;
    const remaining = rest.length - renderedCount;
    loadMoreBtn.hidden = remaining <= 0;
  }

  function renderFeatured(item) {
    const fragment = document.createDocumentFragment();

    if (item.image) {
      const media = document.createElement("div");
      media.className = "featured-media";
      if (item.imageAspect) {
        media.style.aspectRatio = item.imageAspect;
      }
      const img = document.createElement("img");
      img.className = "lazy";
      img.setAttribute("data-src", item.image);
      img.setAttribute("alt", item.imageAlt || item.title);
      img.setAttribute("width", "1080");
      img.setAttribute("height", "1080");
      if (item.imageFit) {
        img.style.objectFit = item.imageFit;
      }
      if (item.imagePosition) {
        img.style.objectPosition = item.imagePosition;
      }
      media.appendChild(img);
      fragment.appendChild(media);
    }

    const body = document.createElement("div");
    body.className = "featured-body";
    if (item.kicker) {
      const kicker = document.createElement("span");
      kicker.className = "featured-kicker";
      kicker.textContent = item.kicker;
      body.appendChild(kicker);
    }

    const title = document.createElement("h2");
    title.className = "featured-title";
    title.textContent = item.title;
    body.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "featured-meta";
    const details = [];
    if (item.displayDate) {
      details.push(item.displayDate);
    }
    details.push(estimateReadingTime(item));
    meta.textContent = details.join(" | ");
    body.appendChild(meta);

    const summary = document.createElement("p");
    summary.className = "featured-summary";
    summary.textContent = item.summary || (item.body && item.body[0]) || "";
    body.appendChild(summary);

    const link = document.createElement("button");
    link.type = "button";
    link.className = "btn btn-primary featured-link";
    link.textContent = "Read full story";
    link.addEventListener("click", function () {
      openDetail(item);
    });
    body.appendChild(link);

    fragment.appendChild(body);
    featuredEl.appendChild(fragment);
    refreshLazy();
  }

  function createNewsCard(item) {
    const article = document.createElement("article");
    article.className = "news-card";
    article.dataset.animateItem = "";
    if (item.id) {
      article.id = item.id;
    }

    if (item.image) {
      const imageWrap = document.createElement("div");
      imageWrap.className = "news-image";
      if (item.imageAspect) {
        imageWrap.style.aspectRatio = item.imageAspect;
      }
      const img = document.createElement("img");
      img.className = "lazy";
      img.setAttribute("data-src", item.image);
      img.setAttribute("alt", item.imageAlt || item.title);
      img.setAttribute("width", "1080");
      img.setAttribute("height", "1080");
      if (item.imageFit) {
        img.style.objectFit = item.imageFit;
      }
      if (item.imagePosition) {
        img.style.objectPosition = item.imagePosition;
      }
      imageWrap.appendChild(img);
      article.appendChild(imageWrap);
    }

    const head = document.createElement("div");
    head.className = "news-card-head";
    const kicker = document.createElement("span");
    kicker.className = "featured-kicker";
    kicker.textContent = item.kicker || "Update";
    head.appendChild(kicker);

    const title = document.createElement("h3");
    title.textContent = item.title;
    head.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "news-meta";
    const metaParts = [];
    if (item.displayDate) {
      metaParts.push(item.displayDate);
    }
    metaParts.push(estimateReadingTime(item));
    meta.textContent = metaParts.join(" | ");
    head.appendChild(meta);

    article.appendChild(head);

    const copy = document.createElement("p");
    copy.textContent = item.summary || (item.body && item.body[0]) || "";
    article.appendChild(copy);

    const footer = document.createElement("div");
    footer.className = "news-card-footer";

    const reading = document.createElement("span");
    reading.className = "news-reading";
    reading.textContent = item.kicker ? item.kicker : "";
    footer.appendChild(reading);

    const link = document.createElement("button");
    link.type = "button";
    link.className = "btn btn-link";
    link.textContent = "Read more";
    link.addEventListener("click", function () {
      openDetail(item);
    });
    footer.appendChild(link);

    article.appendChild(footer);

    return article;
  }

  function estimateReadingTime(item) {
    const content = Array.isArray(item.body) && item.body.length
      ? item.body.join(" ")
      : (item.summary || "");
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (!wordCount) return "1 min read";
    const minutes = Math.max(1, Math.round(wordCount / 200));
    return minutes + " min read";
  }

  function openDetail(item) {
    if (!detailEl) {
      if (item.url) {
        window.location.href = item.url;
      }
      return;
    }

    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (detailMediaEl) {
      detailMediaEl.innerHTML = "";
      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.imageAlt || item.title;
        img.loading = "lazy";
        img.width = 1080;
        img.height = 1080;
        detailMediaEl.appendChild(img);
      }
    }

    if (detailKickerEl) {
      detailKickerEl.textContent = item.kicker || "";
      detailKickerEl.hidden = !item.kicker;
    }

    if (detailTitleEl) {
      detailTitleEl.textContent = item.title;
    }

    if (detailMetaEl) {
      const bits = [];
      if (item.displayDate) bits.push(item.displayDate);
      bits.push(estimateReadingTime(item));
      detailMetaEl.textContent = bits.join(" | ");
    }

    if (detailBodyEl) {
      detailBodyEl.innerHTML = "";
      if (Array.isArray(item.body) && item.body.length) {
        item.body.forEach((paragraph) => {
          const p = document.createElement("p");
          p.textContent = paragraph;
          detailBodyEl.appendChild(p);
        });
      } else if (item.summary) {
        const p = document.createElement("p");
        p.textContent = item.summary;
        detailBodyEl.appendChild(p);
      }
    }

    detailEl.hidden = false;
    requestAnimationFrame(function () {
      detailEl.classList.add("is-active");
      detailEl.setAttribute("aria-hidden", "false");
      document.body.classList.add("news-detail-open");
      detailOpen = true;
      const closeButton = detailEl.querySelector(".news-detail-close");
      if (closeButton) {
        closeButton.focus();
      }
    });
  }

  function closeDetail() {
    if (!detailEl || detailEl.hidden) {
      return;
    }
    detailEl.classList.remove("is-active");
    detailEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("news-detail-open");
    detailOpen = false;
    setTimeout(function () {
      if (detailEl.classList.contains("is-active")) return;
      detailEl.hidden = true;
      if (detailMediaEl) {
        detailMediaEl.innerHTML = "";
      }
    }, 220);

    if (lastFocused && document.body.contains(lastFocused)) {
      lastFocused.focus();
    }
  }
})();
