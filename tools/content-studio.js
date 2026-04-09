(function () {
  const form = document.getElementById("entry-form");
  const formGrid = document.getElementById("form-grid");
  const typeNav = document.getElementById("type-nav");
  const entryList = document.getElementById("entry-list");
  const entriesTitle = document.getElementById("entries-title");
  const entriesMeta = document.getElementById("entries-meta");
  const editorTitle = document.getElementById("editor-title");
  const editorMeta = document.getElementById("editor-meta");
  const sectionKicker = document.getElementById("section-kicker");
  const sectionName = document.getElementById("section-name");
  const sectionDescription = document.getElementById("section-description");
  const sectionFile = document.getElementById("section-file");
  const activeStatus = document.getElementById("active-status");
  const folderStatus = document.getElementById("folder-status");
  const browserStatus = document.getElementById("browser-status");
  const statusMessage = document.getElementById("status-message");
  const footnote = document.getElementById("footnote");
  const connectFolderBtn = document.getElementById("connect-folder");
  const saveActiveBtn = document.getElementById("save-active");
  const saveAllBtn = document.getElementById("save-all");
  const downloadActiveBtn = document.getElementById("download-active");
  const newEntryBtn = document.getElementById("new-entry");
  const clearFormBtn = document.getElementById("clear-form");
  const entrySearchInput = document.getElementById("entry-search");
  const previewMedia = document.getElementById("preview-media");
  const previewEyebrow = document.getElementById("preview-eyebrow");
  const previewTitle = document.getElementById("preview-title");
  const previewMeta = document.getElementById("preview-meta");
  const previewSummary = document.getElementById("preview-summary");
  const previewBody = document.getElementById("preview-body");
  const previewChips = document.getElementById("preview-chips");

  const isSecureContextSupported = window.isSecureContext === true;
  const supportsFolderAccess = isSecureContextSupported && typeof window.showDirectoryPicker === "function";
  const supportsFileImport = isSecureContextSupported && typeof window.showOpenFilePicker === "function";

  const CONTENT_TYPES = {
    blogs: {
      key: "blogs",
      label: "Blogs",
      singular: "blog post",
      description: "Long-form stories, field notes, and feature pieces with optional PDF attachments.",
      previewHint: "Feature Draft",
      globalName: "siteBlogs",
      filePath: "assets/js/blogs-data.js",
      assetDirectories: { image: "assets/img/Blogs", pdf: "assets/pdfs" },
      source: Array.isArray(window.siteBlogs) ? window.siteBlogs : [],
      commentLines: [
        "// Centralized blog entries used across the site.",
        "// Ordered newest to oldest."
      ],
      fields: [
        { name: "title", label: "Post title", required: true, full: true },
        { name: "id", label: "Unique ID", required: true, pattern: "[a-z0-9\\-]+", help: "Lowercase with dashes. Example: cozy-minimalism." },
        { name: "kicker", label: "Kicker / eyebrow" },
        { name: "summary", label: "Summary", type: "textarea", required: true, full: true },
        { name: "author", label: "Author", placeholder: "Ishrak Farhan" },
        { name: "category", label: "Category", required: true },
        { name: "tags", label: "Tags", placeholder: "design, minimalism, home", help: "Comma-separated tags." },
        { name: "date", label: "Publish date", type: "date", required: true },
        { name: "displayDate", label: "Friendly date", placeholder: "Jan 18, 2026" },
        { name: "image", label: "Image path", assetKind: "image", placeholder: "assets/img/Blogs/post-image.jpg", full: true, help: "Use the import button to copy an image from your PC." },
        { name: "imageAlt", label: "Image alt text", full: true },
        { name: "pdf", label: "PDF path", assetKind: "pdf", placeholder: "assets/pdfs/post.pdf", full: true, help: "Optional PDF for the Read more button." },
        { name: "heroBadge", label: "Hero badge", placeholder: "Featured" },
        { name: "body", label: "Body", type: "textarea", required: true, full: true, help: "Leave blank lines between paragraphs. Use > for quotes and - for bullet items." }
      ],
      parseBody: parseRichBody,
      stringifyBody: stringifyRichBody,
      getSubtitle(item) {
        return item.category || item.kicker || "No category";
      }
    },
    news: {
      key: "news",
      label: "News",
      singular: "news entry",
      description: "Timeline-style announcements, milestones, and richer update cards for the news page.",
      previewHint: "News Draft",
      globalName: "siteNews",
      filePath: "assets/js/news-data.js",
      assetDirectories: { image: "assets/img/News" },
      source: Array.isArray(window.siteNews) ? window.siteNews : [],
      commentLines: [
        "// Centralized news entries used across the site.",
        "// Ordered newest to oldest."
      ],
      fields: [
        { name: "title", label: "News title", required: true, full: true },
        { name: "id", label: "Unique ID", required: true, pattern: "[a-z0-9\\-]+", help: "Example: news-brandrill-finale-2025." },
        { name: "kicker", label: "Kicker / label", placeholder: "Event" },
        { name: "summary", label: "Summary", type: "textarea", required: true, full: true },
        { name: "date", label: "Publish date", type: "date", required: true },
        { name: "displayDate", label: "Friendly date", placeholder: "Nov 2, 2025" },
        { name: "image", label: "Image path", assetKind: "image", placeholder: "assets/img/News/example.jpg", full: true, help: "Use the import button to copy an image from your PC." },
        { name: "imageAlt", label: "Image alt text", full: true },
        { name: "url", label: "URL override", placeholder: "news.html#entry-id", full: true },
        { name: "imageAspect", label: "Image aspect ratio", placeholder: "4 / 3" },
        { name: "imageFit", label: "Image fit", placeholder: "cover" },
        { name: "imagePosition", label: "Image position", placeholder: "center center" },
        { name: "body", label: "Body", type: "textarea", required: true, full: true, help: "Leave one blank line between paragraphs." }
      ],
      parseBody: parsePlainBody,
      stringifyBody: stringifyPlainBody,
      getSubtitle(item) {
        return item.kicker || "Update";
      }
    },
    projects: {
      key: "projects",
      label: "Projects",
      singular: "project entry",
      description: "Manage Excel projects and PDF reports from one shared library used by the homepage and the projects page.",
      previewHint: "Project Draft",
      globalName: "siteProjects",
      filePath: "assets/js/projects-data.js",
      assetDirectories: { image: "assets/img/Projects" },
      source: Array.isArray(window.siteProjects) ? window.siteProjects : [],
      commentLines: [
        "// Centralized project entries used across the site.",
        "// Ordered newest to oldest within each category."
      ],
      fields: [
        { name: "title", label: "Project title", required: true, full: true },
        { name: "id", label: "Unique ID", required: true, pattern: "[a-z0-9\\-]+", help: "Lowercase with dashes. Example: bank-loan-default-risk-dashboard." },
        {
          name: "category",
          label: "Category",
          type: "select",
          required: true,
          options: [
            { value: "tools", label: "Excel Project" },
            { value: "reports", label: "Report" }
          ]
        },
        { name: "summary", label: "Summary", type: "textarea", required: true, full: true },
        { name: "date", label: "Publish date", type: "date", required: true },
        { name: "displayDate", label: "Friendly date", placeholder: "Apr 9, 2026" },
        { name: "image", label: "Cover image path", assetKind: "image", placeholder: "assets/img/Projects/example.jpg", full: true, help: "Optional for reports. Use the import button to copy an image from your PC." },
        { name: "imageAlt", label: "Image alt text", full: true },
        { name: "file", label: "Project file path", assetKind: "projectFile", placeholder: "Excel_Projects/example.xlsx or assets/All Reports/report.pdf", required: true, full: true, help: "For Excel projects this should be XLSX or XLS. For reports this should be a PDF." }
      ],
      parseBody: parsePlainBody,
      stringifyBody: stringifyPlainBody,
      getSubtitle(item) {
        return item.category === "reports" ? "Report" : "Excel Project";
      }
    }
  };

  const state = {
    activeType: "blogs",
    directoryHandle: null,
    data: {},
    editIndex: { blogs: null, news: null, projects: null },
    searchQuery: { blogs: "", news: "", projects: "" }
  };

  Object.keys(CONTENT_TYPES).forEach((key) => {
    state.data[key] = sortEntries(cloneDeep(CONTENT_TYPES[key].source), key);
  });

  browserStatus.textContent = supportsFolderAccess
    ? "Direct save supported"
    : !isSecureContextSupported
      ? "Open through local launcher"
      : "Download-only mode";
  footnote.textContent = supportsFolderAccess
    ? "Direct save and asset import work best in Edge or Chrome after opening this tool through the local launcher."
    : !isSecureContextSupported
      ? "This page is not running in a secure local context. Start it with open-content-studio.cmd, then use Edge or Chrome."
      : "This browser cannot save directly into the site folder. Use Edge or Chrome, or use Download active file instead.";

  renderTypeNav();
  renderActiveType();
  setStatus("Choose a section, edit the working list, then save the generated data file back into the site.", false);

  connectFolderBtn.addEventListener("click", connectFolder);
  saveActiveBtn.addEventListener("click", saveActiveSection);
  saveAllBtn.addEventListener("click", saveAllSections);
  downloadActiveBtn.addEventListener("click", downloadActiveSection);
  newEntryBtn.addEventListener("click", resetActiveForm);
  clearFormBtn.addEventListener("click", resetActiveForm);
  form.addEventListener("submit", saveEntryToWorkingList);
  form.addEventListener("input", handleDraftInput);
  if (entrySearchInput) {
    entrySearchInput.addEventListener("input", function () {
      state.searchQuery[state.activeType] = entrySearchInput.value || "";
      renderEntryList();
      renderSectionMeta();
    });
  }

  function renderTypeNav() {
    typeNav.innerHTML = Object.keys(CONTENT_TYPES).map((key) => {
      const config = CONTENT_TYPES[key];
      const isActive = key === state.activeType;
      return [
        '<button class="type-btn' + (isActive ? " is-active" : "") + '" type="button" data-type="' + key + '">',
        "  <span>",
        "    <strong>" + escapeHtml(config.label) + "</strong><br>",
        '    <small>' + escapeHtml(config.filePath) + "</small>",
        "  </span>",
        '  <span class="type-count">' + String(state.data[key].length) + "</span>",
        "</button>"
      ].join("");
    }).join("");

    typeNav.querySelectorAll("[data-type]").forEach((button) => {
      button.addEventListener("click", function () {
        state.activeType = button.getAttribute("data-type") || "blogs";
        renderTypeNav();
        renderActiveType();
      });
    });
  }

  function renderActiveType() {
    const config = getActiveConfig();
    activeStatus.textContent = config.label;
    if (sectionKicker) sectionKicker.textContent = "Structured Content";
    if (sectionName) sectionName.textContent = config.label;
    if (sectionDescription) sectionDescription.textContent = config.description;
    if (sectionFile) sectionFile.textContent = config.filePath;
    entriesTitle.textContent = config.label + " Library";
    editorTitle.textContent = state.editIndex[config.key] === null ? "Add " + capitalize(config.singular) : "Edit " + capitalize(config.singular);
    editorMeta.textContent = "Fill the form, keep the working list clean, and save the generated file when you are ready.";
    if (entrySearchInput) {
      entrySearchInput.value = state.searchQuery[config.key] || "";
      entrySearchInput.placeholder = config.key === "blogs"
        ? "Search title, summary, id, tag, category..."
        : config.key === "projects"
          ? "Search title, summary, id, category, file..."
          : "Search title, summary, id, kicker...";
    }
    renderSectionMeta();
    renderEntryList();
    renderForm();
  }

  function renderSectionMeta() {
    const config = getActiveConfig();
    const totalCount = state.data[config.key].length;
    const visibleCount = getVisibleItems(config.key).length;
    const hasSearch = Boolean((state.searchQuery[config.key] || "").trim());
    entriesMeta.textContent = hasSearch
      ? visibleCount + " of " + totalCount + " " + pluralize(config.singular, totalCount)
      : totalCount + " " + pluralize(config.singular, totalCount);
  }

  function renderEntryList() {
    const config = getActiveConfig();
    const visibleItems = getVisibleItems(config.key);
    if (!visibleItems.length) {
      entryList.innerHTML = (state.searchQuery[config.key] || "").trim()
        ? '<div class="entry-empty">No matching ' + escapeHtml(pluralize(config.singular, 2)) + " in the current working list. Try a wider search or clear the search field.</div>"
        : '<div class="entry-empty">No ' + escapeHtml(pluralize(config.singular, 2)) + " yet. Start with the form on the right.</div>";
      return;
    }

    entryList.innerHTML = visibleItems.map((record) => {
      const item = record.item;
      const index = record.index;
      const isEditing = state.editIndex[config.key] === index;
      const metaParts = [item.displayDate || formatDate(item.date), config.getSubtitle(item)].filter(Boolean);
      const extraTags = buildEntryTags(item, config.key);
      return [
        '<article class="entry-card' + (isEditing ? " is-editing" : "") + '">',
        '  <div class="entry-card-top">',
        '    <div>',
        "      <h3>" + escapeHtml(item.title || "Untitled") + "</h3>",
        "      <p>" + escapeHtml(metaParts.join(" | ")) + "</p>",
        "    </div>",
        '    <div class="entry-tags">',
        item.id ? '      <span class="entry-tag entry-tag--soft">' + escapeHtml(item.id) + "</span>" : "",
        isEditing ? '      <span class="entry-tag">Editing</span>' : "",
        "    </div>",
        "  </div>",
        item.summary ? "  <p>" + escapeHtml(item.summary) + "</p>" : "",
        extraTags.length ? '  <div class="entry-tags" style="margin-top:0.8rem;">' + extraTags.join("") + "</div>" : "",
        '  <div class="entry-actions" style="margin-top:0.9rem;">',
        '    <button class="btn btn-secondary" type="button" data-action="edit" data-index="' + String(index) + '">Edit</button>',
        '    <button class="btn btn-ghost" type="button" data-action="duplicate" data-index="' + String(index) + '">Duplicate</button>',
        '    <button class="btn btn-danger" type="button" data-action="delete" data-index="' + String(index) + '">Remove</button>',
        "  </div>",
        "</article>"
      ].join("");
    }).join("");

    entryList.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", function () {
        const action = button.getAttribute("data-action");
        const index = Number(button.getAttribute("data-index"));
        if (Number.isNaN(index)) return;
        if (action === "edit") {
          populateForm(state.data[config.key][index], index);
          return;
        }
        if (action === "duplicate") {
          duplicateEntry(config.key, index);
          return;
        }
        if (action === "delete" && window.confirm("Remove this " + config.singular + " from the working list?")) {
          state.data[config.key].splice(index, 1);
          state.editIndex[config.key] = null;
          renderTypeNav();
          renderActiveType();
          setStatus(capitalize(config.singular) + " removed from the working list.", false);
        }
      });
    });
  }

  function renderForm() {
    const config = getActiveConfig();
    const currentItem = getCurrentItemForForm(config.key);

    formGrid.innerHTML = config.fields.map((field) => renderField(field, currentItem, config)).join("");

    const titleInput = document.querySelector('[name="title"]');
    const idInput = document.querySelector('[name="id"]');
    if (titleInput && idInput) {
      titleInput.addEventListener("input", function () {
        if (!idInput.value || idInput.dataset.autofill === "true") {
          idInput.value = slugify(titleInput.value);
          idInput.dataset.autofill = "true";
          updatePreview(readFormDraft(config), config);
        }
      });
      idInput.addEventListener("input", function () {
        idInput.dataset.autofill = idInput.value ? "false" : "true";
      });
    }

    formGrid.querySelectorAll("[data-import-field]").forEach((button) => {
      button.addEventListener("click", function () {
        importAsset(button.getAttribute("data-import-field"), button.getAttribute("data-asset-kind"));
      });
    });

    updatePreview(readFormDraft(config), config);
  }

  function renderField(field, currentItem, config) {
    const value = getFieldValue(field, currentItem, config);
    const classes = ["field"];
    if (field.full) classes.push("full");
    const inputId = "field-" + field.name;
    const required = field.required ? " required" : "";
    const pattern = field.pattern ? ' pattern="' + field.pattern + '"' : "";
    const placeholder = field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : "";
    const help = field.help ? '<small>' + escapeHtml(field.help) + "</small>" : "";
    const isTextarea = field.type === "textarea";
    const isSelect = field.type === "select";
    const assetButton = field.assetKind
      ? '<button class="btn btn-secondary" type="button" data-import-field="' + field.name + '" data-asset-kind="' + field.assetKind + '"' + (!supportsFileImport ? " disabled" : "") + '>Import from PC</button>'
      : "";
    const control = isTextarea
      ? '<textarea class="textarea" id="' + inputId + '" name="' + field.name + '"' + required + placeholder + ">" + escapeHtml(value) + "</textarea>"
      : isSelect
        ? '<select class="input" id="' + inputId + '" name="' + field.name + '"' + required + ">" + field.options.map((option) => {
            const optionValue = option && option.value ? option.value : "";
            const optionLabel = option && option.label ? option.label : optionValue;
            return '<option value="' + escapeHtml(optionValue) + '"' + (optionValue === value ? " selected" : "") + '>' + escapeHtml(optionLabel) + "</option>";
          }).join("") + "</select>"
        : '<input class="input" id="' + inputId + '" name="' + field.name + '" type="' + escapeHtml(field.type || "text") + '"' + required + pattern + placeholder + ' value="' + escapeHtml(value) + '">';

    return [
      '<div class="' + classes.join(" ") + '">',
      '  <label for="' + inputId + '">' + escapeHtml(field.label) + (field.required ? " *" : "") + "</label>",
      field.assetKind ? '  <div class="asset-row">' + control + assetButton + "</div>" : "  " + control,
      help,
      "</div>"
    ].join("");
  }

  function populateForm(item, index) {
    const config = getActiveConfig();
    state.editIndex[config.key] = index;
    renderActiveType();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetActiveForm() {
    const config = getActiveConfig();
    state.editIndex[config.key] = null;
    renderActiveType();
    setStatus("Form cleared for a new " + config.singular + ".", false);
  }

  function duplicateEntry(typeKey, index) {
    const config = CONTENT_TYPES[typeKey];
    const original = state.data[typeKey][index];
    if (!original) return;
    const duplicate = cloneDeep(original);
    if (duplicate.title) {
      duplicate.title = duplicate.title + " (Copy)";
    }
    duplicate.id = createUniqueId(typeKey, duplicate.id || slugify(duplicate.title || config.label));
    state.data[typeKey].push(duplicate);
    state.data[typeKey] = sortEntries(state.data[typeKey], typeKey);
    const nextIndex = state.data[typeKey].findIndex((item) => item.id === duplicate.id);
    renderTypeNav();
    renderActiveType();
    if (nextIndex >= 0) {
      populateForm(state.data[typeKey][nextIndex], nextIndex);
    }
    setStatus(capitalize(config.singular) + " duplicated into the working list.", false);
  }

  function saveEntryToWorkingList(event) {
    event.preventDefault();
    const config = getActiveConfig();
    const entry = readFormDraft(config);
    const currentIndex = state.editIndex[config.key];

    if (!entry.title || !entry.id) {
      setStatus("Title and unique ID are required before saving this " + config.singular + ".", true);
      return;
    }

    const existingConflict = state.data[config.key].findIndex((item, index) => {
      return item.id === entry.id && index !== currentIndex;
    });
    if (existingConflict >= 0) {
      setStatus("That unique ID is already in use. Change the ID before saving.", true);
      return;
    }

    if (currentIndex === null) {
      state.data[config.key].push(entry);
    } else {
      state.data[config.key][currentIndex] = entry;
    }

    state.data[config.key] = sortEntries(state.data[config.key], config.key);
    state.editIndex[config.key] = null;
    renderTypeNav();
    renderActiveType();
    setStatus(capitalize(config.singular) + " saved into the working list. Save the section to write it into the site files.", false);
  }

  async function connectFolder() {
    if (!supportsFolderAccess) {
      setStatus("This browser does not support direct folder access. Use Edge or Chrome, or use the download button.", true);
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const valid = await looksLikeSiteRoot(handle);
      if (!valid) {
        setStatus("That folder does not look like this website repo. Choose the folder that contains index.html, assets, and tools.", true);
        return;
      }
      const allowed = await ensureDirectoryPermission(handle);
      if (!allowed) {
        setStatus("Folder access was not granted, so direct save is still disabled.", true);
        return;
      }
      state.directoryHandle = handle;
      folderStatus.textContent = handle.name;
      setStatus("Site folder connected. You can now save data files directly and import local assets into the repo.", false);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Unable to connect the folder: " + (error && error.message ? error.message : "Unknown error"), true);
    }
  }

  async function saveActiveSection() {
    const config = getActiveConfig();
    if (!state.directoryHandle) {
      setStatus("Connect the site folder first so I know where to save " + config.filePath + ".", true);
      return;
    }
    try {
      await writeTextFile(state.directoryHandle, config.filePath, buildFileContent(config.key));
      setStatus(config.label + " saved to " + config.filePath + ".", false);
    } catch (error) {
      setStatus("Failed to save " + config.label + ": " + (error && error.message ? error.message : "Unknown error"), true);
    }
  }

  async function saveAllSections() {
    if (!state.directoryHandle) {
      setStatus("Connect the site folder first so all generated files can be written into the repo.", true);
      return;
    }
    try {
      const keys = Object.keys(CONTENT_TYPES);
      for (let index = 0; index < keys.length; index += 1) {
        const key = keys[index];
        await writeTextFile(state.directoryHandle, CONTENT_TYPES[key].filePath, buildFileContent(key));
      }
      setStatus("All content sections were saved into assets/js. Run publish-site.cmd when you want to push them live.", false);
    } catch (error) {
      setStatus("Failed while saving all sections: " + (error && error.message ? error.message : "Unknown error"), true);
    }
  }

  function downloadActiveSection() {
    const config = getActiveConfig();
    const blob = new Blob([buildFileContent(config.key)], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = config.filePath.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus(config.label + " downloaded as " + link.download + ".", false);
  }

  async function importAsset(fieldName, assetKind) {
    const config = getActiveConfig();
    if (!supportsFileImport) {
      setStatus("This browser cannot open the local file picker for asset import. Use Edge or Chrome.", true);
      return;
    }
    if (!state.directoryHandle) {
      setStatus("Connect the site folder before importing files from your PC.", true);
      return;
    }
    try {
      const pickerTypes = getPickerTypes(config.key, assetKind);
      const result = await window.showOpenFilePicker({ multiple: false, types: pickerTypes });
      const sourceHandle = result && result[0];
      if (!sourceHandle) return;
      const sourceFile = await sourceHandle.getFile();
      const targetDirectory = resolveAssetDirectory(config, assetKind, sourceFile);
      if (!targetDirectory) {
        setStatus("No target folder is configured for that asset type.", true);
        return;
      }
      const extension = getFileExtension(sourceFile.name);
      const idValue = String((form.elements.namedItem("id") && form.elements.namedItem("id").value) || "").trim();
      const fallbackName = sourceFile.name.replace(/\.[^.]+$/, "");
      const baseName = slugify(idValue || fallbackName || assetKind);
      const targetPath = targetDirectory + "/" + baseName + extension;
      await writeBinaryFile(state.directoryHandle, targetPath, sourceFile);
      const field = form.elements.namedItem(fieldName);
      if (field) field.value = targetPath;
      updatePreview(readFormDraft(config), config);
      setStatus("Imported " + sourceFile.name + " to " + targetPath + ".", false);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Unable to import file: " + (error && error.message ? error.message : "Unknown error"), true);
    }
  }

  function buildFileContent(typeKey) {
    const config = CONTENT_TYPES[typeKey];
    const items = sortEntries(cloneDeep(state.data[typeKey]), typeKey);
    return config.commentLines.concat(
      "window." + config.globalName + " = " + JSON.stringify(items, null, 2) + ";",
      ""
    ).join("\n");
  }

  async function looksLikeSiteRoot(handle) {
    try {
      await handle.getFileHandle("index.html");
      const assets = await handle.getDirectoryHandle("assets");
      await assets.getDirectoryHandle("js");
      await handle.getDirectoryHandle("tools");
      return true;
    } catch (error) {
      return false;
    }
  }

  async function ensureDirectoryPermission(handle) {
    if (!handle || typeof handle.queryPermission !== "function") return false;
    const options = { mode: "readwrite" };
    if ((await handle.queryPermission(options)) === "granted") return true;
    return (await handle.requestPermission(options)) === "granted";
  }

  async function writeTextFile(rootHandle, relativePath, contents) {
    const fileHandle = await getFileHandle(rootHandle, relativePath, true);
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  async function writeBinaryFile(rootHandle, relativePath, file) {
    const fileHandle = await getFileHandle(rootHandle, relativePath, true);
    const writable = await fileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();
  }

  async function getFileHandle(rootHandle, relativePath, create) {
    const parts = relativePath.split("/").filter(Boolean);
    const fileName = parts.pop();
    let directory = rootHandle;
    for (let index = 0; index < parts.length; index += 1) {
      directory = await directory.getDirectoryHandle(parts[index], { create: create });
    }
    return directory.getFileHandle(fileName, { create: create });
  }

  function getCurrentItemForForm(typeKey) {
    const editIndex = state.editIndex[typeKey];
    if (editIndex === null || !state.data[typeKey][editIndex]) {
      return getDefaultItem(typeKey);
    }
    return state.data[typeKey][editIndex];
  }

  function getDefaultItem(typeKey) {
    if (typeKey === "blogs") {
      return { author: "Ishrak Farhan" };
    }
    if (typeKey === "projects") {
      return { category: "tools", image: "assets/img/Projects/Excel.png" };
    }
    return {};
  }

  function readFormDraft(config) {
    const entry = getDefaultItem(config.key);
    const formData = new FormData(form);

    config.fields.forEach((field) => {
      const rawValue = String(formData.get(field.name) || "").trim();
      if (field.name === "tags") {
        if (rawValue) {
          entry.tags = rawValue.split(",").map((tag) => tag.trim()).filter(Boolean);
        }
        return;
      }
      if (field.name === "body") {
        const parsed = config.parseBody(rawValue);
        if (parsed.length) {
          entry.body = parsed;
        }
        return;
      }
      if (rawValue) {
        entry[field.name] = rawValue;
      }
    });

    if (!entry.id && entry.title) {
      entry.id = slugify(entry.title);
    }
    if (!entry.displayDate && entry.date) {
      entry.displayDate = formatDate(entry.date);
    }
    if (config.key === "blogs" && !entry.author) {
      entry.author = "Ishrak Farhan";
    }
    if (config.key === "projects" && entry.category === "reports" && entry.image === "assets/img/Projects/Excel.png") {
      delete entry.image;
    }

    return entry;
  }

  function getFieldValue(field, item, config) {
    if (!item) return "";
    if (field.name === "tags") {
      return Array.isArray(item.tags) ? item.tags.join(", ") : "";
    }
    if (field.name === "body") {
      return config.stringifyBody(item.body);
    }
    return item[field.name] || "";
  }

  function getActiveConfig() {
    return CONTENT_TYPES[state.activeType];
  }

  function handleDraftInput() {
    updatePreview(readFormDraft(getActiveConfig()), getActiveConfig());
  }

  function getVisibleItems(typeKey) {
    const query = String(state.searchQuery[typeKey] || "").trim().toLowerCase();
    return state.data[typeKey].map((item, index) => ({ item, index })).filter((record) => {
      return !query || matchesQuery(record.item, query);
    });
  }

  function matchesQuery(item, query) {
    const bodyText = normalizeBodyBlocks(item.body).join(" ");
    const haystack = [
      item.title,
      item.summary,
      item.id,
      item.kicker,
      item.category,
      item.author,
      item.displayDate,
      item.date,
      bodyText,
      Array.isArray(item.tags) ? item.tags.join(" ") : ""
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.indexOf(query) >= 0;
  }

  function buildEntryTags(item, typeKey) {
    const tags = [];
    if (typeKey === "blogs" && Array.isArray(item.tags)) {
      item.tags.slice(0, 4).forEach((tag) => {
        tags.push('<span class="entry-tag">' + escapeHtml(tag) + "</span>");
      });
    }
    if (typeKey === "projects" && item.category) {
      tags.push('<span class="entry-tag">' + escapeHtml(item.category === "reports" ? "Report" : "Excel Project") + "</span>");
    }
    if (item.pdf) {
      tags.push('<span class="entry-tag entry-tag--soft">PDF</span>');
    }
    if (typeKey === "projects" && item.file) {
      tags.push('<span class="entry-tag entry-tag--soft">' + escapeHtml(getProjectFileBadge(item)) + "</span>");
    }
    if (item.image) {
      tags.push('<span class="entry-tag entry-tag--soft">Image</span>');
    }
    return tags;
  }

  function updatePreview(entry, config) {
    if (!previewTitle) return;

    if (!isMeaningfulEntry(entry, config.key)) {
      renderPreviewPlaceholder(config);
      return;
    }

    previewEyebrow.textContent = config.key === "projects"
      ? (entry.category === "reports" ? "Report" : "Excel Project")
      : (entry.kicker || config.previewHint);
    previewTitle.textContent = entry.title || "Untitled " + capitalize(config.singular);
    previewMeta.textContent = buildPreviewMeta(entry, config);
    previewSummary.textContent = entry.summary || buildSummaryFallback(entry);
    previewChips.innerHTML = buildPreviewChips(entry, config.key).join("");

    const bodyBlocks = normalizeBodyBlocks(entry.body).slice(0, 3);
    previewBody.innerHTML = bodyBlocks.length
      ? bodyBlocks.map((block) => "<p>" + escapeHtml(block) + "</p>").join("")
      : config.key === "projects" && entry.file
        ? "<p>" + escapeHtml(buildProjectLinkHint(entry)) + "</p>"
        : "<p>No body copy yet.</p>";

    renderPreviewMedia(entry);
  }

  function renderPreviewPlaceholder(config) {
    previewEyebrow.textContent = config.previewHint;
    previewTitle.textContent = "Start typing to preview your " + config.singular + ".";
    previewMeta.textContent = config.label + " preview updates from the current form.";
    previewSummary.textContent = config.description;
    previewChips.innerHTML = '<span class="entry-tag entry-tag--soft">Draft</span>';
    previewBody.innerHTML = "<p>The first paragraphs, metadata, and asset indicators will appear here as soon as the draft has content.</p>";
    if (previewMedia) {
      previewMedia.innerHTML = '<span class="preview-media-label">No media selected</span>';
    }
  }

  function renderPreviewMedia(entry) {
    if (!previewMedia) return;
    if (entry.image) {
      const img = document.createElement("img");
      img.src = resolveAssetPath(entry.image);
      img.alt = entry.imageAlt || entry.title || "Preview image";
      previewMedia.innerHTML = "";
      previewMedia.appendChild(img);
      return;
    }
    previewMedia.innerHTML = "";
    const label = document.createElement("span");
    label.className = "preview-media-label";
    label.textContent = entry.pdf ? "PDF linked, no cover image selected" : "No media selected";
    previewMedia.appendChild(label);
  }

  function buildPreviewMeta(entry, config) {
    return [
      entry.displayDate || formatDate(entry.date),
      config.getSubtitle(entry),
      config.key === "blogs" ? entry.author : "",
      config.key === "projects" ? getProjectFileBadge(entry) : ""
    ].filter(Boolean).join(" | ");
  }

  function buildPreviewChips(entry, typeKey) {
    const chips = [];
    if (entry.id) {
      chips.push('<span class="entry-tag entry-tag--soft">' + escapeHtml(entry.id) + "</span>");
    }
    if (typeKey === "blogs" && Array.isArray(entry.tags)) {
      entry.tags.slice(0, 3).forEach((tag) => {
        chips.push('<span class="entry-tag">' + escapeHtml(tag) + "</span>");
      });
    }
    if (typeKey === "projects" && entry.category) {
      chips.push('<span class="entry-tag">' + escapeHtml(entry.category === "reports" ? "Report" : "Excel Project") + "</span>");
    }
    if (entry.pdf) {
      chips.push('<span class="entry-tag">PDF attached</span>');
    }
    if (typeKey === "projects" && entry.file) {
      chips.push('<span class="entry-tag entry-tag--soft">' + escapeHtml(getProjectFileBadge(entry)) + "</span>');
    }
    if (entry.image) {
      chips.push('<span class="entry-tag entry-tag--soft">Image ready</span>');
    }
    return chips;
  }

  function buildSummaryFallback(entry) {
    const bodyBlocks = normalizeBodyBlocks(entry.body);
    return bodyBlocks[0] || "No summary yet.";
  }

  function normalizeBodyBlocks(body) {
    if (!Array.isArray(body)) return [];
    return body.map((block) => {
      if (typeof block === "string") return block.trim();
      if (block && block.type === "quote") return block.text || "";
      if (block && block.type === "list" && Array.isArray(block.items)) {
        return block.items.join(" | ");
      }
      return "";
    }).filter(Boolean);
  }

  function resolveAssetPath(value) {
    if (!value) return "";
    if (/^(https?:)?\/\//i.test(value) || value.indexOf("data:") === 0) {
      return value;
    }
    return "../" + String(value).replace(/^\.?\//, "");
  }

  function isMeaningfulEntry(entry, typeKey) {
    if (!entry) return false;
    const keys = Object.keys(entry).filter((key) => {
      if (typeKey === "blogs" && key === "author" && entry[key] === "Ishrak Farhan") {
        return false;
      }
      if (typeKey === "projects" && key === "category" && entry[key] === "tools") {
        return false;
      }
      if (typeKey === "projects" && key === "image" && entry[key] === "assets/img/Projects/Excel.png") {
        return false;
      }
      if (Array.isArray(entry[key])) {
        return entry[key].length > 0;
      }
      return Boolean(entry[key]);
    });
    return keys.length > 0;
  }

  function createUniqueId(typeKey, baseId) {
    const safeBase = slugify(baseId || "entry") || "entry";
    const used = new Set(state.data[typeKey].map((item) => item && item.id).filter(Boolean));
    if (!used.has(safeBase)) return safeBase;
    let counter = 2;
    while (used.has(safeBase + "-" + counter)) {
      counter += 1;
    }
    return safeBase + "-" + counter;
  }

  function setStatus(message, isError) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("is-error", Boolean(isError));
  }

  function sortEntries(items, typeKey) {
    return items.sort((a, b) => {
      if (typeKey === "projects") {
        if ((a && a.category) !== (b && b.category)) {
          return (a && a.category) === "tools" ? -1 : 1;
        }
      }
      return Date.parse(b && b.date ? b.date : 0) - Date.parse(a && a.date ? a.date : 0);
    });
  }

  function getPickerTypes(typeKey, assetKind) {
    if (assetKind === "pdf") {
      return [{ description: "PDF files", accept: { "application/pdf": [".pdf"] } }];
    }
    if (assetKind === "projectFile") {
      const categoryField = form.elements.namedItem("category");
      const category = String(categoryField && categoryField.value || "").trim();
      if (typeKey === "projects" && category === "reports") {
        return [{ description: "PDF reports", accept: { "application/pdf": [".pdf"] } }];
      }
      return [{
        description: "Excel and spreadsheet files",
        accept: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
          "application/vnd.ms-excel": [".xls"]
        }
      }];
    }
    return [{ description: "Images", accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] } }];
  }

  function resolveAssetDirectory(config, assetKind, sourceFile) {
    if (assetKind === "projectFile" && config.key === "projects") {
      const categoryField = form.elements.namedItem("category");
      const category = String(categoryField && categoryField.value || "").trim();
      const extension = getFileExtension(sourceFile && sourceFile.name);
      if (category === "reports" || extension === ".pdf") {
        return "assets/All Reports";
      }
      return "Excel_Projects";
    }
    return config.assetDirectories[assetKind];
  }

  function getProjectFileBadge(item) {
    const extension = getFileExtension(item && item.file ? item.file : "");
    return extension ? extension.replace(".", "").toUpperCase() : (item && item.category === "reports" ? "PDF" : "FILE");
  }

  function buildProjectLinkHint(entry) {
    if (!entry || !entry.file) return "No file attached yet.";
    return entry.category === "reports"
      ? "This entry will open the request-download flow for the linked PDF."
      : "This entry will trigger a direct file download from the linked project file.";
  }

  function parsePlainBody(raw) {
    if (!raw) return [];
    return raw.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((block) => block.replace(/\n+/g, " ").trim()).filter(Boolean);
  }

  function stringifyPlainBody(blocks) {
    if (!Array.isArray(blocks)) return "";
    return blocks.map((block) => typeof block === "string" ? block.trim() : "").filter(Boolean).join("\n\n");
  }

  function parseRichBody(raw) {
    if (!raw) return [];
    const lines = raw.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let current = [];
    lines.forEach((line) => {
      if (!line.trim()) {
        flush();
        return;
      }
      current.push(line);
    });
    flush();

    function flush() {
      if (!current.length) return;
      blocks.push(current.join("\n"));
      current = [];
    }

    return blocks.map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.indexOf(">") === 0) {
        return { type: "quote", text: trimmed.replace(/^>\s?/gm, "").trim() };
      }
      if (trimmed.indexOf("-") === 0) {
        return {
          type: "list",
          ordered: false,
          items: trimmed.split("\n").map((line) => line.replace(/^-\s*/, "").trim()).filter(Boolean)
        };
      }
      return trimmed.replace(/\s+/g, " ");
    }).filter(Boolean);
  }

  function stringifyRichBody(blocks) {
    if (!Array.isArray(blocks)) return "";
    return blocks.map((block) => {
      if (!block) return "";
      if (typeof block === "string") return block;
      if (block.type === "quote") return "> " + (block.text || "");
      if (block.type === "list" && Array.isArray(block.items)) {
        return block.items.map((item) => "- " + item).join("\n");
      }
      return block.text || "";
    }).join("\n\n");
  }

  function formatDate(value) {
    const timestamp = Date.parse(value || "");
    if (Number.isNaN(timestamp)) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(timestamp);
  }

  function pluralize(word, count) {
    return count === 1 ? word : word + "s";
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function slugify(value) {
    return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function getFileExtension(name) {
    const match = String(name || "").match(/(\.[^.]+)$/);
    return match ? match[1].toLowerCase() : "";
  }

  function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }
})();
