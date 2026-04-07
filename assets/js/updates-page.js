// Render short-form updates with a featured note and expandable detail panel.
(function () {
  const featuredEl = document.querySelector("[data-updates-featured]");
  const listEl = document.querySelector("[data-updates-list]");
  const detailEl = document.querySelector("[data-updates-detail]");
  const detailKickerEl = detailEl ? detailEl.querySelector("[data-updates-detail-kicker]") : null;
  const detailTitleEl = detailEl ? detailEl.querySelector("[data-updates-detail-title]") : null;
  const detailMetaEl = detailEl ? detailEl.querySelector("[data-updates-detail-meta]") : null;
  const detailBodyEl = detailEl ? detailEl.querySelector("[data-updates-detail-body]") : null;
  const detailBackEl = detailEl ? detailEl.querySelector("[data-updates-detail-back]") : null;
  const detailCloseEls = detailEl ? detailEl.querySelectorAll("[data-updates-detail-close]") : [];

  if (!listEl || !Array.isArray(window.siteUpdates)) {
    return;
  }

  const items = [...window.siteUpdates].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });

  if (!items.length) {
    listEl.innerHTML = '<p class="muted">No updates yet. Check back soon.</p>';
    return;
  }

  const featured = items[0];
  const rest = items.slice(1);
  let detailOpen = false;
  let lastFocused = null;

  if (featuredEl && featured) {
    renderFeatured(featured);
    featuredEl.hidden = false;
  }

  renderList();

  if (detailBackEl) {
    detailBackEl.addEventListener("click", function () {
      closeDetail();
      if (listEl && typeof listEl.scrollIntoView === "function") {
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (detailCloseEls.length) {
    detailCloseEls.forEach((el) => {
      el.addEventListener("click", closeDetail);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && detailOpen) {
      event.preventDefault();
      closeDetail();
    }
  });

  function renderFeatured(item) {
    const meta = [item.displayDate, estimateReadingTime(item)].filter(Boolean).join(" | ");
    featuredEl.innerHTML = [
      '<div class="updates-featured-card">',
      '  <div class="updates-featured-copy">',
      item.kicker ? '    <p class="updates-kicker">' + escapeHtml(item.kicker) + "</p>" : "",
      '    <h2 class="updates-featured-title">' + escapeHtml(item.title || "") + "</h2>",
      meta ? '    <p class="updates-featured-meta">' + escapeHtml(meta) + "</p>" : "",
      '    <p class="updates-featured-summary">' + escapeHtml(item.summary || firstParagraph(item)) + "</p>",
      '  </div>',
      '  <div class="updates-featured-actions">',
      '    <button class="btn btn-primary" type="button" data-updates-open-featured>Read update</button>',
      "  </div>",
      "</div>"
    ].join("");

    const openButton = featuredEl.querySelector("[data-updates-open-featured]");
    if (openButton) {
      openButton.addEventListener("click", function () {
        openDetail(item);
      });
    }
  }

  function renderList() {
    listEl.innerHTML = "";
    const entries = rest.length ? rest : items.slice(0, 1);
    const fragment = document.createDocumentFragment();
    entries.forEach((item) => {
      fragment.appendChild(createCard(item));
    });
    listEl.appendChild(fragment);
  }

  function createCard(item) {
    const article = document.createElement("article");
    article.className = "update-card";

    const header = document.createElement("div");
    header.className = "update-card-head";

    if (item.kicker) {
      const kicker = document.createElement("span");
      kicker.className = "updates-kicker";
      kicker.textContent = item.kicker;
      header.appendChild(kicker);
    }

    const title = document.createElement("h3");
    title.className = "update-card-title";
    title.textContent = item.title || "";
    header.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "update-card-meta";
    meta.textContent = [item.displayDate, estimateReadingTime(item)].filter(Boolean).join(" | ");
    header.appendChild(meta);

    article.appendChild(header);

    const summary = document.createElement("p");
    summary.className = "update-card-summary";
    summary.textContent = item.summary || firstParagraph(item);
    article.appendChild(summary);

    const actions = document.createElement("div");
    actions.className = "update-card-actions";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-link";
    button.textContent = "Open note";
    button.addEventListener("click", function () {
      openDetail(item);
    });
    actions.appendChild(button);

    article.appendChild(actions);
    return article;
  }

  function openDetail(item) {
    if (!detailEl) {
      return;
    }

    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (detailKickerEl) {
      detailKickerEl.textContent = item.kicker || "";
      detailKickerEl.hidden = !item.kicker;
    }

    if (detailTitleEl) {
      detailTitleEl.textContent = item.title || "";
    }

    if (detailMetaEl) {
      detailMetaEl.textContent = [item.displayDate, estimateReadingTime(item)].filter(Boolean).join(" | ");
    }

    if (detailBodyEl) {
      detailBodyEl.innerHTML = "";
      const paragraphs = Array.isArray(item.body) && item.body.length ? item.body : [item.summary || ""];
      paragraphs.filter(Boolean).forEach((paragraph) => {
        const p = document.createElement("p");
        p.textContent = paragraph;
        detailBodyEl.appendChild(p);
      });
    }

    detailEl.hidden = false;
    requestAnimationFrame(function () {
      detailEl.classList.add("is-active");
      detailEl.setAttribute("aria-hidden", "false");
      document.body.classList.add("updates-detail-open");
      detailOpen = true;
      const closeButton = detailEl.querySelector(".updates-detail-close");
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
    document.body.classList.remove("updates-detail-open");
    detailOpen = false;

    setTimeout(function () {
      if (detailEl.classList.contains("is-active")) return;
      detailEl.hidden = true;
    }, 220);

    if (lastFocused && document.body.contains(lastFocused)) {
      lastFocused.focus();
    }
  }

  function estimateReadingTime(item) {
    const content = Array.isArray(item.body) && item.body.length
      ? item.body.join(" ")
      : (item.summary || "");
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(wordCount / 180)) + " min read";
  }

  function firstParagraph(item) {
    if (Array.isArray(item.body) && item.body.length) {
      return item.body[0];
    }
    return "";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char];
    });
  }
})();
