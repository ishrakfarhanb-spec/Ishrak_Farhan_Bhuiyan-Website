// Populate featured projects and reports cards on the home page.
(function () {
  var items = Array.isArray(window.siteProjects) ? window.siteProjects.slice() : [];
  if (!items.length) return;

  var projectsContainer = document.querySelector("[data-home-projects]");
  var reportsContainer = document.querySelector("[data-home-reports]");
  if (!projectsContainer && !reportsContainer) return;

  items.sort(function (a, b) {
    return Date.parse(b && b.date ? b.date : 0) - Date.parse(a && a.date ? a.date : 0);
  });

  if (projectsContainer) {
    renderGroup(projectsContainer, getLatestItemsByCategory("tools", 4));
  }
  if (reportsContainer) {
    renderGroup(reportsContainer, getLatestItemsByCategory("reports", 4));
  }

  if (typeof window.initUI === "function") window.initUI();

  function renderGroup(container, groupItems) {
    var fragment = document.createDocumentFragment();
    groupItems.forEach(function (item) {
      fragment.appendChild(createCard(item));
    });
    container.innerHTML = "";
    container.appendChild(fragment);
  }

  function getLatestItemsByCategory(category, limit) {
    return items
      .filter(function (item) { return item && item.category === category; })
      .sort(function (a, b) {
        return Date.parse(b && b.date ? b.date : 0) - Date.parse(a && a.date ? a.date : 0);
      })
      .slice(0, limit);
  }

  function createCard(item) {
    var article = document.createElement("article");
    article.className = item.category === "tools" ? "card home-project-card" : "card";
    article.setAttribute("data-tags", item.category || "");
    article.setAttribute("data-animate-item", "");

    if (item.category === "tools" && item.image) {
      var media = document.createElement("div");
      media.className = "card-media";

      var img = document.createElement("img");
      img.className = "lazy";
      img.setAttribute("data-src", item.image);
      img.setAttribute("alt", item.imageAlt || item.title || "");
      img.setAttribute("width", "800");
      img.setAttribute("height", "450");
      media.appendChild(img);
      article.appendChild(media);
    }

    var body = document.createElement("div");
    body.className = "card-body";

    var title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title || "Untitled";
    body.appendChild(title);

    if (item.summary) {
      var summary = document.createElement("p");
      summary.className = "muted";
      summary.textContent = item.summary;
      body.appendChild(summary);
    }

    var impactText = buildImpactText(item);
    if (item.category === "tools" && impactText) {
      var impact = document.createElement("p");
      impact.className = "card-impact";
      impact.textContent = impactText;
      body.appendChild(impact);
    }

    var link = document.createElement("a");
    link.className = "btn btn-primary btn-small";
    link.href = buildHref(item);
    if (item.category === "tools") {
      link.setAttribute("download", "");
    }
    link.textContent = buildButtonLabel(item);
    body.appendChild(link);

    article.appendChild(body);
    return article;
  }

  function buildImpactText(item) {
    if (!item) return "";
    if (item.category !== "tools") return "";
    if (item.impact) return item.impact;
    if (item.summary) return item.summary;
    return "";
  }

  function buildHref(item) {
    if (!item || !item.file) return "projects.html";
    var normalizedFile = normalizeFilePath(item.file);
    if (item.category === "reports") {
      return "request-download.html?file=" + encodeURIComponent(normalizedFile);
    }
    return encodeURI(normalizedFile);
  }

  function buildButtonLabel(item) {
    if (!item || item.category === "reports") {
      return "Request download (PDF)";
    }
    var extMatch = String(item.file || "").match(/\.([^.?#/]+)(?:[?#].*)?$/i);
    var ext = extMatch ? extMatch[1].toUpperCase() : "FILE";
    return "Download (" + ext + ")";
  }

  function normalizeFilePath(value) {
    try {
      return decodeURIComponent(String(value || ""));
    } catch (error) {
      return String(value || "");
    }
  }
})();
