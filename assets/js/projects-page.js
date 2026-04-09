// Populate the projects page from the centralized projects data file.
(function () {
  var items = Array.isArray(window.siteProjects) ? window.siteProjects.slice() : [];
  if (!items.length) return;

  var projectsGrid = document.getElementById("projects-grid");
  var reportsGrid = document.getElementById("reports-grid");
  if (!projectsGrid && !reportsGrid) return;

  items.sort(function (a, b) {
    return Date.parse(b && b.date ? b.date : 0) - Date.parse(a && a.date ? a.date : 0);
  });

  if (projectsGrid) {
    renderGroup(projectsGrid, "tools");
  }
  if (reportsGrid) {
    renderGroup(reportsGrid, "reports");
  }

  if (typeof window.initUI === "function") window.initUI();

  function renderGroup(container, category) {
    var fragment = document.createDocumentFragment();
    items
      .filter(function (item) { return item && item.category === category; })
      .forEach(function (item) {
        fragment.appendChild(createCard(item));
      });
    container.innerHTML = "";
    container.appendChild(fragment);
  }

  function createCard(item) {
    var article = document.createElement("article");
    article.className = "card";
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
