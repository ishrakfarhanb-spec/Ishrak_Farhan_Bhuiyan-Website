(function () {
  "use strict";

  const refs = {
    form: document.getElementById("entry-form"),
    formGrid: document.getElementById("form-grid"),
    typeNav: document.getElementById("type-nav"),
    entryList: document.getElementById("entry-list"),
    entriesTitle: document.getElementById("entries-title"),
    entriesMeta: document.getElementById("entries-meta"),
    editorTitle: document.getElementById("editor-title"),
    editorMeta: document.getElementById("editor-meta"),
    sectionKicker: document.getElementById("section-kicker"),
    sectionName: document.getElementById("section-name"),
    sectionDescription: document.getElementById("section-description"),
    sectionFile: document.getElementById("section-file"),
    activeStatus: document.getElementById("active-status"),
    folderStatus: document.getElementById("folder-status"),
    browserStatus: document.getElementById("browser-status"),
    statusMessage: document.getElementById("status-message"),
    footnote: document.getElementById("footnote"),
    connectFolderBtn: document.getElementById("connect-folder"),
    saveActiveBtn: document.getElementById("save-active"),
    saveAllBtn: document.getElementById("save-all"),
    downloadActiveBtn: document.getElementById("download-active"),
    loadActiveFileBtn: document.getElementById("load-active-file"),
    loadFilePcBtn: document.getElementById("load-file-pc"),
    saveEditorFileBtn: document.getElementById("save-editor-file"),
    editorPathInput: document.getElementById("editor-path"),
    fileEditorText: document.getElementById("file-editor-text"),
    newEntryBtn: document.getElementById("new-entry"),
    clearFormBtn: document.getElementById("clear-form"),
    entrySearchInput: document.getElementById("entry-search"),
    previewMedia: document.getElementById("preview-media"),
    previewEyebrow: document.getElementById("preview-eyebrow"),
    previewTitle: document.getElementById("preview-title"),
    previewMeta: document.getElementById("preview-meta"),
    previewSummary: document.getElementById("preview-summary"),
    previewBody: document.getElementById("preview-body"),
    previewChips: document.getElementById("preview-chips")
  };

  if (!refs.form || !refs.formGrid || !refs.typeNav || !refs.entryList) {
    return;
  }

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
        { name: "image", label: "Image path", assetKind: "image", placeholder: "assets/img/Blogs/post-image.jpg", full: true, help: "Use Import from PC to copy an image into the repo." },
        { name: "imageAlt", label: "Image alt text", full: true },
        { name: "pdf", label: "PDF path", assetKind: "pdf", placeholder: "assets/pdfs/post.pdf", full: true, help: "Optional PDF for the Read more button." },
        { name: "heroBadge", label: "Hero badge", placeholder: "Featured" },
        { name: "body", label: "Body", type: "textarea", required: true, full: true, editor: true, help: "Leave blank lines between paragraphs. Use > for quotes and - for bullet items." }
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
        { name: "image", label: "Image path", assetKind: "image", placeholder: "assets/img/News/example.jpg", full: true, help: "Use Import from PC to copy an image into the repo." },
        { name: "imageAlt", label: "Image alt text", full: true },
        { name: "url", label: "URL override", placeholder: "news.html#entry-id", full: true },
        { name: "imageAspect", label: "Image aspect ratio", placeholder: "4 / 3" },
        { name: "imageFit", label: "Image fit", placeholder: "cover" },
        { name: "imagePosition", label: "Image position", placeholder: "center center" },
        { name: "body", label: "Body", type: "textarea", required: true, full: true, editor: true, help: "Leave one blank line between paragraphs." }
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
        { name: "image", label: "Cover image path", assetKind: "image", placeholder: "assets/img/Projects/example.jpg", full: true, help: "Optional for reports. Use Import from PC to copy an image into the repo." },
        { name: "imageAlt", label: "Image alt text", full: true },
        { name: "file", label: "Project file path", assetKind: "projectFile", placeholder: "Excel_Projects/example.xlsx or assets/All Reports/report.pdf", required: true, full: true, help: "Excel projects use XLSX/XLS. Reports use PDF." }
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

  bindEvents();
  renderSupportStatus();
  renderTypeNav();
  renderActiveType();
  setStatus("Choose a section, edit the working list, then save the generated data file back into the site.", false);

  function bindEvents() {
    if (refs.connectFolderBtn) refs.connectFolderBtn.addEventListener("click", connectFolder);
    if (refs.saveActiveBtn) refs.saveActiveBtn.addEventListener("click", saveActiveSection);
    if (refs.saveAllBtn) refs.saveAllBtn.addEventListener("click", saveAllSections);
    if (refs.downloadActiveBtn) refs.downloadActiveBtn.addEventListener("click", downloadActiveSection);
    if (refs.loadActiveFileBtn) refs.loadActiveFileBtn.addEventListener("click", loadActiveFileIntoEditor);
    if (refs.loadFilePcBtn) refs.loadFilePcBtn.addEventListener("click", loadFileFromPc);
    if (refs.saveEditorFileBtn) refs.saveEditorFileBtn.addEventListener("click", saveEditorFile);
    if (refs.newEntryBtn) refs.newEntryBtn.addEventListener("click", resetActiveForm);
    if (refs.clearFormBtn) refs.clearFormBtn.addEventListener("click", resetActiveForm);
    refs.form.addEventListener("submit", saveEntryToWorkingList);
    refs.form.addEventListener("input", handleDraftInput);

    if (refs.entrySearchInput) {
      refs.entrySearchInput.addEventListener("input", function () {
        state.searchQuery[state.activeType] = refs.entrySearchInput.value || "";
        renderEntryList();
        renderSectionMeta();
      });
    }

    refs.typeNav.addEventListener("click", function (event) {
      const button = event.target.closest("[data-type]");
      if (!button) return;
      state.activeType = button.getAttribute("data-type") || "blogs";
      renderTypeNav();
      renderActiveType();
    });

    refs.entryList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const config = getActiveConfig();
      const index = Number(button.getAttribute("data-index"));
      const action = button.getAttribute("data-action");
      if (Number.isNaN(index)) return;
      if (action === "edit") {
        populateForm(index);
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

    refs.formGrid.addEventListener("click", function (event) {
      const importButton = event.target.closest("[data-import-field]");
      if (importButton) {
        importAsset(importButton.getAttribute("data-import-field"), importButton.getAttribute("data-asset-kind"));
        return;
      }

      const editorButton = event.target.closest("[data-editor-action]");
      if (!editorButton) return;
      const target = editorButton.getAttribute("data-editor-target");
      const action = editorButton.getAttribute("data-editor-action");
      const field = refs.form.elements.namedItem(target);
      if (!field || field.tagName !== "TEXTAREA") return;
      applyEditorAction(field, action, getActiveConfig());
      updatePreview(readFormDraft(getActiveConfig()), getActiveConfig());
      field.focus();
    });
  }

  function renderSupportStatus() {
    if (refs.browserStatus) {
      refs.browserStatus.textContent = supportsFolderAccess
        ? "Direct save supported"
        : !isSecureContextSupported
          ? "Open through local launcher"
          : "Download-only mode";
    }

    if (refs.footnote) {
      refs.footnote.textContent = supportsFolderAccess
        ? "Direct save and asset import work best in Edge or Chrome after opening this tool through the local launcher."
        : !isSecureContextSupported
          ? "This page is not running in a secure local context. Start it with open-content-studio.cmd, then use Edge or Chrome."
          : "This browser cannot save directly into the site folder. Use Edge or Chrome, or use Download Active File instead.";
    }
  }

  function renderTypeNav() {
    refs.typeNav.innerHTML = Object.keys(CONTENT_TYPES).map((key) => {
      const config = CONTENT_TYPES[key];
      return [
        '<button class="type-btn' + (key === state.activeType ? " is-active" : "") + '" type="button" data-type="' + key + '">',
        "  <span>",
        "    <strong>" + escapeHtml(config.label) + "</strong><br>",
        "    <small>" + escapeHtml(config.filePath) + "</small>",
        "  </span>",
        '  <span class="type-count">' + String(state.data[key].length) + "</span>",
        "</button>"
      ].join("");
    }).join("");
  }

  function renderActiveType() {
    const config = getActiveConfig();
    if (refs.activeStatus) refs.activeStatus.textContent = config.label;
    if (refs.sectionKicker) refs.sectionKicker.textContent = "Structured Content";
    if (refs.sectionName) refs.sectionName.textContent = config.label;
    if (refs.sectionDescription) refs.sectionDescription.textContent = config.description;
    if (refs.sectionFile) refs.sectionFile.textContent = config.filePath;
    if (refs.entriesTitle) refs.entriesTitle.textContent = config.label + " Library";
    if (refs.editorTitle) refs.editorTitle.textContent = state.editIndex[config.key] === null ? "Add " + capitalize(config.singular) : "Edit " + capitalize(config.singular);
    if (refs.editorMeta) refs.editorMeta.textContent = "Fill the form, keep the working list clean, and save the generated file when you are ready.";

    if (refs.entrySearchInput) {
      refs.entrySearchInput.value = state.searchQuery[config.key] || "";
      refs.entrySearchInput.placeholder = config.key === "blogs"
        ? "Search title, summary, id, tag, category..."
        : config.key === "projects"
          ? "Search title, summary, id, category, file..."
          : "Search title, summary, id, kicker...";
    }

    renderSectionMeta();
    renderEntryList();
    renderForm();
    syncEditorPathDefault();
  }

  function renderSectionMeta() {
    const config = getActiveConfig();
    const totalCount = state.data[config.key].length;
    const visibleCount = getVisibleItems(config.key).length;
    const label = hasSearch(config.key)
      ? visibleCount + " of " + totalCount + " " + pluralize(config.singular, totalCount)
      : totalCount + " " + pluralize(config.singular, totalCount);
    if (refs.entriesMeta) refs.entriesMeta.textContent = label;
  }

  function renderEntryList() {
    const config = getActiveConfig();
    const visibleItems = getVisibleItems(config.key);
    if (!visibleItems.length) {
      refs.entryList.innerHTML = hasSearch(config.key)
        ? '<div class="entry-empty">No matching ' + escapeHtml(pluralize(config.singular, 2)) + " in the current working list. Try a wider search or clear the search field.</div>"
        : '<div class="entry-empty">No ' + escapeHtml(pluralize(config.singular, 2)) + " yet. Start with the form on the right.</div>";
      return;
    }

    refs.entryList.innerHTML = visibleItems.map((record) => {
      const item = record.item;
      const index = record.index;
      const meta = [item.displayDate || formatDate(item.date), config.getSubtitle(item)].filter(Boolean).join(" | ");
      const tags = buildEntryTags(item, config.key);
      return [
        '<article class="entry-card' + (state.editIndex[config.key] === index ? " is-editing" : "") + '">',
        '  <div class="entry-card-top">',
        "    <div>",
        "      <h3>" + escapeHtml(item.title || "Untitled") + "</h3>",
        "      <p>" + escapeHtml(meta) + "</p>",
        "    </div>",
        '    <div class="entry-tags">',
        item.id ? '      <span class="entry-tag entry-tag--soft">' + escapeHtml(item.id) + "</span>" : "",
        state.editIndex[config.key] === index ? '      <span class="entry-tag">Editing</span>' : "",
        "    </div>",
        "  </div>",
        item.summary ? "  <p>" + escapeHtml(item.summary) + "</p>" : "",
        tags.length ? '  <div class="entry-tags" style="margin-top:0.8rem;">' + tags.join("") + "</div>" : "",
        '  <div class="entry-actions" style="margin-top:0.9rem;">',
        '    <button class="btn btn-secondary" type="button" data-action="edit" data-index="' + String(index) + '">Edit</button>',
        '    <button class="btn btn-ghost" type="button" data-action="duplicate" data-index="' + String(index) + '">Duplicate</button>',
        '    <button class="btn btn-danger" type="button" data-action="delete" data-index="' + String(index) + '">Remove</button>',
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderForm() {
    const config = getActiveConfig();
    const currentItem = getCurrentItemForForm(config.key);
    refs.formGrid.innerHTML = config.fields.map((field) => renderField(field, currentItem, config)).join("");

    const titleInput = refs.form.elements.namedItem("title");
    const idInput = refs.form.elements.namedItem("id");
    if (idInput) {
      idInput.dataset.autofill = currentItem.id ? "false" : "true";
    }
    if (titleInput && typeof titleInput.focus === "function") {
      titleInput.focus({ preventScroll: true });
    }

    updatePreview(readFormDraft(config), config);
  }

  function renderField(field, item, config) {
    const classes = ["field"];
    if (field.full) classes.push("full");

    const inputId = "field-" + field.name;
    const value = getFieldValue(field, item, config);
    const placeholder = field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : "";
    const required = field.required ? " required" : "";
    const pattern = field.pattern ? ' pattern="' + escapeHtml(field.pattern) + '"' : "";
    const help = field.help ? "<small>" + escapeHtml(field.help) + "</small>" : "";
    const assetButton = field.assetKind
      ? '<button class="btn btn-secondary" type="button" data-import-field="' + field.name + '" data-asset-kind="' + field.assetKind + '"' + (!supportsFileImport ? " disabled" : "") + ">Import from PC</button>"
      : "";

    let control = "";
    if (field.type === "textarea") {
      control = (field.editor ? buildEditorToolbar(field, config) : "") +
        '<textarea class="textarea" id="' + inputId + '" name="' + field.name + '"' + required + placeholder + ">" + escapeHtml(value) + "</textarea>";
    } else if (field.type === "select") {
      control = '<select class="input" id="' + inputId + '" name="' + field.name + '"' + required + ">" +
        field.options.map((option) => {
          return '<option value="' + escapeHtml(option.value) + '"' + (option.value === value ? " selected" : "") + ">" + escapeHtml(option.label) + "</option>";
        }).join("") +
        "</select>";
    } else {
      control = '<input class="input" id="' + inputId + '" name="' + field.name + '" type="' + escapeHtml(field.type || "text") + '"' + required + pattern + placeholder + ' value="' + escapeHtml(value) + '">';
    }

    return [
      '<div class="' + classes.join(" ") + '">',
      '  <label for="' + inputId + '">' + escapeHtml(field.label) + (field.required ? " *" : "") + "</label>",
      field.assetKind ? '  <div class="asset-row">' + control + assetButton + "</div>" : "  " + control,
      help,
      "</div>"
    ].join("");
  }

  function buildEditorToolbar(field, config) {
    const actions = [
      { key: "paragraph", label: "Paragraph" },
      { key: "line", label: "Line break" }
    ];
    if (config.key === "blogs" && field.name === "body") {
      actions.push({ key: "quote", label: "Quote" });
      actions.push({ key: "bullet", label: "Bullets" });
    }
    return '<div class="editor-toolbar">' +
      actions.map((action) => {
        return '<button class="editor-btn" type="button" data-editor-action="' + action.key + '" data-editor-target="' + field.name + '">' + action.label + "</button>";
      }).join("") +
      "</div>";
  }

  function syncEditorPathDefault() {
    const config = getActiveConfig();
    if (!refs.editorPathInput) return;
    if (!refs.editorPathInput.value || refs.editorPathInput.dataset.auto === "true") {
      refs.editorPathInput.value = config.filePath;
      refs.editorPathInput.dataset.auto = "true";
    }
  }

  function handleDraftInput(event) {
    const config = getActiveConfig();
    const target = event && event.target ? event.target : null;
    const titleInput = refs.form.elements.namedItem("title");
    const idInput = refs.form.elements.namedItem("id");

    if (target && target.name === "title" && titleInput && idInput && (!idInput.value || idInput.dataset.autofill === "true")) {
      idInput.value = slugify(titleInput.value);
      idInput.dataset.autofill = "true";
    }

    if (target && target.name === "id" && idInput) {
      idInput.dataset.autofill = idInput.value ? "false" : "true";
    }

    if (target && target.name === "category" && config.key === "projects") {
      const imageInput = refs.form.elements.namedItem("image");
      if (target.value === "reports" && imageInput && imageInput.value === "assets/img/Projects/Excel.png") {
        imageInput.value = "";
      }
      if (target.value === "tools" && imageInput && !imageInput.value) {
        imageInput.value = "assets/img/Projects/Excel.png";
      }
    }

    updatePreview(readFormDraft(config), config);
  }

  function applyEditorAction(textarea, action, config) {
    if (action === "paragraph") {
      insertAtCursor(textarea, "\n\n");
      return;
    }
    if (action === "line") {
      insertAtCursor(textarea, "\n");
      return;
    }
    if (action === "quote" && config.key === "blogs") {
      prefixSelectionLines(textarea, "> ");
      return;
    }
    if (action === "bullet" && config.key === "blogs") {
      prefixSelectionLines(textarea, "- ");
    }
  }

  function insertAtCursor(textarea, value) {
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    textarea.value = textarea.value.slice(0, start) + value + textarea.value.slice(end);
    const cursor = start + value.length;
    textarea.setSelectionRange(cursor, cursor);
  }

  function prefixSelectionLines(textarea, prefix) {
    const value = textarea.value;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const blockStart = value.lastIndexOf("\n", start - 1) + 1;
    let blockEnd = value.indexOf("\n", end);
    if (blockEnd === -1) blockEnd = value.length;
    const block = value.slice(blockStart, blockEnd);
    const updated = block.split("\n").map((line) => {
      return line.trim() ? prefix + line : line;
    }).join("\n");
    textarea.value = value.slice(0, blockStart) + updated + value.slice(blockEnd);
    textarea.setSelectionRange(blockStart, blockStart + updated.length);
  }

  function populateForm(index) {
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

  function saveEntryToWorkingList(event) {
    event.preventDefault();
    const config = getActiveConfig();
    const entry = readFormDraft(config);
    const currentIndex = state.editIndex[config.key];

    if (!entry.title || !entry.id) {
      setStatus("Title and unique ID are required before saving this " + config.singular + ".", true);
      return;
    }

    const conflictIndex = state.data[config.key].findIndex((item, index) => {
      return item.id === entry.id && index !== currentIndex;
    });
    if (conflictIndex >= 0) {
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

  function duplicateEntry(typeKey, index) {
    const config = CONTENT_TYPES[typeKey];
    const original = state.data[typeKey][index];
    if (!original) return;
    const duplicate = cloneDeep(original);
    duplicate.title = duplicate.title ? duplicate.title + " (Copy)" : "Untitled Copy";
    duplicate.id = createUniqueId(typeKey, duplicate.id || slugify(duplicate.title));
    state.data[typeKey].push(duplicate);
    state.data[typeKey] = sortEntries(state.data[typeKey], typeKey);
    renderTypeNav();
    renderActiveType();
    setStatus(capitalize(config.singular) + " duplicated into the working list.", false);
  }

  async function connectFolder() {
    if (!supportsFolderAccess) {
      setStatus("This browser cannot open the site folder directly. Use Edge or Chrome through open-content-studio.cmd, or use Download Active File instead.", true);
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const valid = await looksLikeSiteRoot(handle);
      if (!valid) {
        setStatus("That folder does not look like this website repo. Choose the folder that contains index.html, assets, and tools.", true);
        return;
      }
      const granted = await ensureDirectoryPermission(handle);
      if (!granted) {
        setStatus("Folder access was denied, so direct save is still unavailable.", true);
        return;
      }
      state.directoryHandle = handle;
      if (refs.folderStatus) refs.folderStatus.textContent = handle.name;
      setStatus("Site folder connected. You can now save data files directly and import local assets into the repo.", false);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Unable to connect the site folder: " + getErrorMessage(error), true);
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
      setStatus("Failed to save " + config.label + ": " + getErrorMessage(error), true);
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
      setStatus("Failed while saving all sections: " + getErrorMessage(error), true);
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

  async function loadActiveFileIntoEditor() {
    const config = getActiveConfig();
    if (!refs.editorPathInput || !refs.fileEditorText) return;
    refs.editorPathInput.value = config.filePath;
    refs.editorPathInput.dataset.auto = "true";
    if (!state.directoryHandle) {
      setStatus("Connect the site folder before loading files.", true);
      return;
    }
    try {
      refs.fileEditorText.value = await readTextFile(state.directoryHandle, config.filePath);
      setStatus("Loaded " + config.filePath + " into the editor.", false);
    } catch (error) {
      setStatus("Could not load file: " + getErrorMessage(error), true);
    }
  }

  async function loadFileFromPc() {
    if (!supportsFileImport) {
      setStatus("This browser cannot open the local file picker. Use Edge or Chrome.", true);
      return;
    }
    try {
      const result = await window.showOpenFilePicker({ multiple: false });
      const handle = result && result[0];
      if (!handle) return;
      const file = await handle.getFile();
      if (refs.fileEditorText) refs.fileEditorText.value = await file.text();
      if (refs.editorPathInput) {
        refs.editorPathInput.value = refs.editorPathInput.value || "assets/js/" + file.name;
        refs.editorPathInput.dataset.auto = "false";
      }
      setStatus("Loaded " + file.name + " from your PC. Set the target path then save to the site folder.", false);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Could not load file from PC: " + getErrorMessage(error), true);
    }
  }

  async function saveEditorFile() {
    if (!refs.editorPathInput || !refs.fileEditorText) return;
    const path = String(refs.editorPathInput.value || "").trim();
    if (!path) {
      setStatus("Enter a target path before saving. Example: assets/js/news-data.js.", true);
      return;
    }
    if (!state.directoryHandle) {
      setStatus("Connect the site folder before saving files.", true);
      return;
    }
    try {
      await writeTextFile(state.directoryHandle, path, refs.fileEditorText.value || "");
      setStatus("Saved file to " + path + ".", false);
    } catch (error) {
      setStatus("Could not save file: " + getErrorMessage(error), true);
    }
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
      const result = await window.showOpenFilePicker({ multiple: false, types: getPickerTypes(config.key, assetKind) });
      const sourceHandle = result && result[0];
      if (!sourceHandle) return;
      const sourceFile = await sourceHandle.getFile();
      const targetDirectory = resolveAssetDirectory(config, assetKind, sourceFile);
      if (!targetDirectory) {
        setStatus("No target folder is configured for that asset type.", true);
        return;
      }
      const extension = getFileExtension(sourceFile.name);
      const idField = refs.form.elements.namedItem("id");
      const baseName = slugify(String(idField && idField.value || "").trim() || sourceFile.name.replace(/\.[^.]+$/, "") || assetKind);
      const targetPath = targetDirectory + "/" + baseName + extension;
      await writeBinaryFile(state.directoryHandle, targetPath, sourceFile);
      const targetField = refs.form.elements.namedItem(fieldName);
      if (targetField) targetField.value = targetPath;
      updatePreview(readFormDraft(config), config);
      setStatus("Imported " + sourceFile.name + " to " + targetPath + ".", false);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Unable to import file: " + getErrorMessage(error), true);
    }
  }

  function getCurrentItemForForm(typeKey) {
    const editIndex = state.editIndex[typeKey];
    if (editIndex === null || !state.data[typeKey][editIndex]) {
      return getDefaultItem(typeKey);
    }
    return cloneDeep(state.data[typeKey][editIndex]);
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
    config.fields.forEach((field) => {
      const control = refs.form.elements.namedItem(field.name);
      const rawValue = String(control && control.value || "").trim();
      if (!rawValue) return;
      if (field.name === "tags") {
        entry.tags = rawValue.split(",").map((tag) => tag.trim()).filter(Boolean);
        return;
      }
      if (field.name === "body") {
        entry.body = config.parseBody(rawValue);
        return;
      }
      entry[field.name] = rawValue;
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
    if (config.key === "projects") {
      if (entry.category === "tools" && !entry.image) {
        entry.image = "assets/img/Projects/Excel.png";
      }
      if (entry.category === "reports" && entry.image === "assets/img/Projects/Excel.png") {
        delete entry.image;
      }
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

  function hasSearch(typeKey) {
    return Boolean(String(state.searchQuery[typeKey] || "").trim());
  }

  function getVisibleItems(typeKey) {
    const query = String(state.searchQuery[typeKey] || "").trim().toLowerCase();
    return state.data[typeKey].map((item, index) => ({ item: item, index: index })).filter((record) => {
      return !query || matchesQuery(record.item, query);
    });
  }

  function matchesQuery(item, query) {
    const haystack = [
      item.title,
      item.summary,
      item.id,
      item.kicker,
      item.category,
      item.author,
      item.displayDate,
      item.date,
      item.file,
      item.url,
      Array.isArray(item.tags) ? item.tags.join(" ") : "",
      normalizeBodyBlocks(item.body).join(" ")
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
    if (!refs.previewTitle) return;
    if (!isMeaningfulEntry(entry, config.key)) {
      renderPreviewPlaceholder(config);
      return;
    }

    refs.previewEyebrow.textContent = config.key === "projects"
      ? (entry.category === "reports" ? "Report" : "Excel Project")
      : (entry.kicker || config.previewHint);
    refs.previewTitle.textContent = entry.title || "Untitled " + capitalize(config.singular);
    refs.previewMeta.textContent = buildPreviewMeta(entry, config);
    refs.previewSummary.textContent = entry.summary || buildSummaryFallback(entry);
    refs.previewChips.innerHTML = buildPreviewChips(entry, config.key).join("");

    const bodyBlocks = normalizeBodyBlocks(entry.body).slice(0, 3);
    refs.previewBody.innerHTML = bodyBlocks.length
      ? bodyBlocks.map((block) => "<p>" + escapeHtml(block) + "</p>").join("")
      : config.key === "projects" && entry.file
        ? "<p>" + escapeHtml(buildProjectLinkHint(entry)) + "</p>"
        : "<p>No body copy yet.</p>";

    renderPreviewMedia(entry);
  }

  function renderPreviewPlaceholder(config) {
    refs.previewEyebrow.textContent = config.previewHint;
    refs.previewTitle.textContent = "Start typing to preview your " + config.singular + ".";
    refs.previewMeta.textContent = config.label + " preview updates from the current form.";
    refs.previewSummary.textContent = config.description;
    refs.previewChips.innerHTML = '<span class="entry-tag entry-tag--soft">Draft</span>';
    refs.previewBody.innerHTML = "<p>The first paragraphs, metadata, and asset indicators will appear here as soon as the draft has content.</p>";
    if (refs.previewMedia) {
      refs.previewMedia.innerHTML = '<span class="preview-media-label">No media selected</span>';
    }
  }

  function renderPreviewMedia(entry) {
    if (!refs.previewMedia) return;
    if (entry.image) {
      const image = document.createElement("img");
      image.src = resolveAssetPath(entry.image);
      image.alt = entry.imageAlt || entry.title || "Preview image";
      refs.previewMedia.innerHTML = "";
      refs.previewMedia.appendChild(image);
      return;
    }
    refs.previewMedia.innerHTML = "";
    const label = document.createElement("span");
    label.className = "preview-media-label";
    label.textContent = entry.pdf ? "PDF linked, no cover image selected" : "No media selected";
    refs.previewMedia.appendChild(label);
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
      chips.push('<span class="entry-tag entry-tag--soft">' + escapeHtml(getProjectFileBadge(entry)) + "</span>");
    }
    if (entry.image) {
      chips.push('<span class="entry-tag entry-tag--soft">Image ready</span>');
    }
    return chips;
  }

  function buildSummaryFallback(entry) {
    const blocks = normalizeBodyBlocks(entry.body);
    return blocks[0] || "No summary yet.";
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

  function isMeaningfulEntry(entry, typeKey) {
    if (!entry) return false;
    return Object.keys(entry).some((key) => {
      if (typeKey === "blogs" && key === "author" && entry[key] === "Ishrak Farhan") return false;
      if (typeKey === "projects" && key === "category" && entry[key] === "tools") return false;
      if (typeKey === "projects" && key === "image" && entry[key] === "assets/img/Projects/Excel.png") return false;
      if (Array.isArray(entry[key])) return entry[key].length > 0;
      return Boolean(entry[key]);
    });
  }

  function resolveAssetPath(value) {
    if (!value) return "";
    if (/^(https?:)?\/\//i.test(value) || String(value).indexOf("data:") === 0) {
      return value;
    }
    return "../" + String(value).replace(/^\.?\//, "");
  }

  function buildProjectLinkHint(entry) {
    if (!entry || !entry.file) return "No file attached yet.";
    return entry.category === "reports"
      ? "This entry will open the request-download flow for the linked PDF."
      : "This entry will trigger a direct file download from the linked project file.";
  }

  function getProjectFileBadge(item) {
    const extension = getFileExtension(item && item.file ? item.file : "");
    return extension ? extension.replace(".", "").toUpperCase() : (item && item.category === "reports" ? "PDF" : "FILE");
  }

  function buildFileContent(typeKey) {
    const config = CONTENT_TYPES[typeKey];
    const items = sortEntries(cloneDeep(state.data[typeKey]), typeKey);
    return config.commentLines.concat(
      "window." + config.globalName + " = " + JSON.stringify(items, null, 2) + ";",
      ""
    ).join("\n");
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

  async function readTextFile(rootHandle, relativePath) {
    const fileHandle = await getFileHandle(rootHandle, relativePath, false);
    const file = await fileHandle.getFile();
    return file.text();
  }

  async function writeBinaryFile(rootHandle, relativePath, file) {
    const fileHandle = await getFileHandle(rootHandle, relativePath, true);
    const writable = await fileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();
  }

  async function getFileHandle(rootHandle, relativePath, create) {
    const parts = String(relativePath || "").split("/").filter(Boolean);
    const fileName = parts.pop();
    let directory = rootHandle;
    for (let index = 0; index < parts.length; index += 1) {
      directory = await directory.getDirectoryHandle(parts[index], { create: create });
    }
    return directory.getFileHandle(fileName, { create: create });
  }

  function getPickerTypes(typeKey, assetKind) {
    if (assetKind === "pdf") {
      return [{ description: "PDF files", accept: { "application/pdf": [".pdf"] } }];
    }
    if (assetKind === "projectFile") {
      const categoryField = refs.form.elements.namedItem("category");
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
      const categoryField = refs.form.elements.namedItem("category");
      const category = String(categoryField && categoryField.value || "").trim();
      const extension = getFileExtension(sourceFile && sourceFile.name);
      if (category === "reports" || extension === ".pdf") {
        return "assets/All Reports";
      }
      return "Excel_Projects";
    }
    return config.assetDirectories[assetKind];
  }

  function setStatus(message, isError) {
    if (!refs.statusMessage) return;
    refs.statusMessage.textContent = message;
    refs.statusMessage.classList.toggle("is-error", Boolean(isError));
  }

  function sortEntries(items, typeKey) {
    return items.sort((a, b) => {
      if (typeKey === "projects" && (a && a.category) !== (b && b.category)) {
        return (a && a.category) === "tools" ? -1 : 1;
      }
      return Date.parse(b && b.date ? b.date : 0) - Date.parse(a && a.date ? a.date : 0);
    });
  }

  function parsePlainBody(raw) {
    if (!raw) return [];
    return String(raw).replace(/\r\n/g, "\n").split(/\n\s*\n/).map((block) => {
      return block.replace(/\n+/g, " ").trim();
    }).filter(Boolean);
  }

  function stringifyPlainBody(blocks) {
    if (!Array.isArray(blocks)) return "";
    return blocks.map((block) => {
      return typeof block === "string" ? block.trim() : "";
    }).filter(Boolean).join("\n\n");
  }

  function parseRichBody(raw) {
    if (!raw) return [];
    const lines = String(raw).replace(/\r\n/g, "\n").split("\n");
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

    function flush() {
      if (!current.length) return;
      blocks.push(current.join("\n"));
      current = [];
    }
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
    }).filter(Boolean).join("\n\n");
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
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  }

  function slugify(value) {
    return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function getFileExtension(name) {
    const match = String(name || "").match(/(\.[^.]+)$/);
    return match ? match[1].toLowerCase() : "";
  }

  function getErrorMessage(error) {
    return error && error.message ? error.message : "Unknown error";
  }

  function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
