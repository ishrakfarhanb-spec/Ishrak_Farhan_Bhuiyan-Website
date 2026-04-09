(function () {
  const typeSelect = document.getElementById("type");
  const form = document.getElementById("entry-form");
  const statusEl = document.getElementById("status");
  const assetStatusEl = document.getElementById("asset-status");
  const connectBtn = document.getElementById("connect-folder");
  const saveBtn = document.getElementById("save-entry");
  const downloadBtn = document.getElementById("download-file");
  const pickImageBtn = document.getElementById("pick-image");
  const pickPdfBtn = document.getElementById("pick-pdf");
  const dropzone = document.getElementById("dropzone");
  const recentList = document.getElementById("recent-list");
  const categoryField = document.getElementById("category-field");

  const supportsFolderAccess = typeof window.showDirectoryPicker === "function";
  const supportsFileImport = typeof window.showOpenFilePicker === "function";

  const CONTENT_TYPES = {
    blogs: {
      label: "Blog",
      filePath: "assets/js/blogs-data.js",
      globalName: "siteBlogs",
      assetDirectories: { image: "assets/img/Blogs", pdf: "assets/pdfs" },
      required: ["title", "summary", "date", "body", "category"]
    },
    news: {
      label: "News",
      filePath: "assets/js/news-data.js",
      globalName: "siteNews",
      assetDirectories: { image: "assets/img/News" },
      required: ["title", "summary", "date", "body"]
    },
    updates: {
      label: "Update",
      filePath: "assets/js/updates-data.js",
      globalName: "siteUpdates",
      assetDirectories: {},
      required: ["title", "summary", "date", "body"]
    }
  };

  const state = {
    directoryHandle: null,
    assets: { image: "", pdf: "" },
    data: {
      blogs: Array.isArray(window.siteBlogs) ? cloneDeep(window.siteBlogs) : [],
      news: Array.isArray(window.siteNews) ? cloneDeep(window.siteNews) : [],
      updates: Array.isArray(window.siteUpdates) ? cloneDeep(window.siteUpdates) : []
    }
  };

  connectBtn.addEventListener("click", connectFolder);
  saveBtn.addEventListener("click", saveEntry);
  downloadBtn.addEventListener("click", downloadActiveFile);
  pickImageBtn.addEventListener("click", () => pickAsset("image"));
  pickPdfBtn.addEventListener("click", () => pickAsset("pdf"));
  typeSelect.addEventListener("change", handleTypeChange);

  if (dropzone) {
    dropzone.addEventListener("dragover", handleDragOver);
    dropzone.addEventListener("dragleave", handleDragLeave);
    dropzone.addEventListener("drop", handleDrop);
  }

  handleTypeChange();
  renderRecent();
  setStatus(supportsFolderAccess
    ? "Connect your site folder to enable direct saving and file uploads."
    : "Your browser cannot save directly. Use Edge or Chrome for seamless uploads.", false);

  function handleTypeChange() {
    const type = getActiveType();
    state.assets = { image: "", pdf: "" };
    if (categoryField) {
      categoryField.style.display = type === "blogs" ? "grid" : "none";
    }
    pickPdfBtn.disabled = type !== "blogs";
    assetStatusEl.textContent = "No files uploaded yet.";
    renderRecent();
  }

  async function connectFolder() {
    if (!supportsFolderAccess) {
      setStatus("This browser does not support direct folder access. Use Edge or Chrome.", true);
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const valid = await looksLikeSiteRoot(handle);
      if (!valid) {
        setStatus("That folder does not look like your website repo. Choose the folder that contains index.html, assets, and tools.", true);
        return;
      }
      const allowed = await ensureDirectoryPermission(handle);
      if (!allowed) {
        setStatus("Folder access was not granted, so direct save is disabled.", true);
        return;
      }
      state.directoryHandle = handle;
      setStatus("Folder connected. You can now upload files and save entries.", false);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Unable to connect the folder: " + getErrorMessage(error), true);
    }
  }

  async function pickAsset(kind) {
    if (!supportsFileImport) {
      setStatus("This browser cannot open the file picker. Use Edge or Chrome.", true);
      return;
    }
    if (!state.directoryHandle) {
      setStatus("Connect your site folder first.", true);
      return;
    }
    const type = getActiveType();
    const config = CONTENT_TYPES[type];
    const targetDirectory = config.assetDirectories[kind];
    if (!targetDirectory) {
      setStatus("This content type does not accept that file.", true);
      return;
    }
    try {
      const types = kind === "pdf"
        ? [{ description: "PDF files", accept: { "application/pdf": [".pdf"] } }]
        : [{ description: "Images", accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] } }];
      const result = await window.showOpenFilePicker({ multiple: false, types });
      const handle = result && result[0];
      if (!handle) return;
      const file = await handle.getFile();
      await importAsset(file, kind, targetDirectory);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setStatus("Unable to import file: " + getErrorMessage(error), true);
    }
  }

  async function importAsset(file, kind, targetDirectory) {
    const baseName = slugify(getFieldValue("title") || file.name.replace(/\.[^.]+$/, "") || kind);
    const extension = getFileExtension(file.name);
    const targetPath = targetDirectory + "/" + baseName + extension;
    await writeBinaryFile(state.directoryHandle, targetPath, file);
    state.assets[kind] = targetPath;
    assetStatusEl.textContent = "Uploaded: " + targetPath;
  }

  async function handleDrop(event) {
    event.preventDefault();
    dropzone.classList.remove("is-drag");
    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) return;
    if (!state.directoryHandle) {
      setStatus("Connect your site folder before dropping files.", true);
      return;
    }
    const type = getActiveType();
    const config = CONTENT_TYPES[type];
    for (const file of files) {
      const ext = getFileExtension(file.name);
      if (isImageExt(ext) && config.assetDirectories.image) {
        await importAsset(file, "image", config.assetDirectories.image);
      } else if (ext === ".pdf" && config.assetDirectories.pdf) {
        await importAsset(file, "pdf", config.assetDirectories.pdf);
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    dropzone.classList.add("is-drag");
  }

  function handleDragLeave() {
    dropzone.classList.remove("is-drag");
  }

  function saveEntry() {
    const type = getActiveType();
    const config = CONTENT_TYPES[type];
    const entry = buildEntry(type);
    const missing = config.required.filter((field) => !entry[field]);
    if (missing.length) {
      setStatus("Missing required fields: " + missing.join(", "), true);
      return;
    }

    state.data[type].push(entry);
    state.data[type] = sortByDateDesc(state.data[type]);
    renderRecent();

    if (!state.directoryHandle) {
      setStatus("Entry saved in memory. Connect the site folder or download the file to publish.", true);
      return;
    }

    writeTextFile(state.directoryHandle, config.filePath, buildFileContent(type))
      .then(() => setStatus("Saved to " + config.filePath + ". Run publish-site.cmd when ready.", false))
      .catch((err) => setStatus("Unable to save file: " + getErrorMessage(err), true));
  }

  function downloadActiveFile() {
    const type = getActiveType();
    const config = CONTENT_TYPES[type];
    const blob = new Blob([buildFileContent(type)], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = config.filePath.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("Downloaded " + a.download + ". Replace the site file to publish.", false);
  }

  function buildEntry(type) {
    const entry = {
      title: getFieldValue("title"),
      kicker: getFieldValue("kicker"),
      summary: getFieldValue("summary"),
      date: getFieldValue("date"),
      displayDate: formatDate(getFieldValue("date")),
      body: parseBody(getFieldValue("body"))
    };

    entry.id = slugify(entry.title || "entry");

    if (type === "blogs") {
      entry.author = "Ishrak Farhan";
      entry.category = getFieldValue("category");
    }

    if (state.assets.image) entry.image = state.assets.image;
    if (state.assets.pdf) entry.pdf = state.assets.pdf;

    return entry;
  }

  function renderRecent() {
    const type = getActiveType();
    const items = state.data[type].slice().sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0)).slice(0, 3);
    if (!items.length) {
      recentList.innerHTML = "<div class=\"recent-card\">No entries yet.</div>";
      return;
    }
    recentList.innerHTML = items.map((item) => {
      return [
        '<div class="recent-card">',
        "<strong>" + escapeHtml(item.title || "Untitled") + "</strong><br>",
        "<small>" + escapeHtml(item.displayDate || item.date || "") + "</small>",
        "</div>"
      ].join("");
    }).join("");
  }

  function buildFileContent(type) {
    const config = CONTENT_TYPES[type];
    const items = sortByDateDesc(cloneDeep(state.data[type]));
    const header = [
      "// Managed by Content Studio (Simple Upload).",
      "window." + config.globalName + " = " + JSON.stringify(items, null, 2) + ";",
      ""
    ].join("\n");
    return header;
  }

  function parseBody(raw) {
    if (!raw) return [];
    return raw.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((block) => block.replace(/\n+/g, " ").trim()).filter(Boolean);
  }

  function getActiveType() {
    return typeSelect.value || "blogs";
  }

  function getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function sortByDateDesc(items) {
    return items.sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0));
  }

  function formatDate(value) {
    const timestamp = Date.parse(value || "");
    if (Number.isNaN(timestamp)) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(timestamp);
  }

  function slugify(value) {
    return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function getFileExtension(name) {
    const match = String(name || "").match(/(\.[^.]+)$/);
    return match ? match[1].toLowerCase() : "";
  }

  function isImageExt(ext) {
    return [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);
  }

  function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[char]);
  }

  async function looksLikeSiteRoot(handle) {
    try {
      await handle.getFileHandle("index.html");
      const assets = await handle.getDirectoryHandle("assets");
      await assets.getDirectoryHandle("js");
      await handle.getDirectoryHandle("tools");
      return true;
    } catch {
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
      directory = await directory.getDirectoryHandle(parts[index], { create });
    }
    return directory.getFileHandle(fileName, { create });
  }

  function getErrorMessage(error) {
    return error && error.message ? error.message : "Unknown error";
  }
})();
