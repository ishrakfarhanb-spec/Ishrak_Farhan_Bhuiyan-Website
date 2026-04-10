# Local Content Studio

Use the local content workflow when you want to add blogs, news, or projects from your PC without editing source files manually.

This is the only content editor now. The older standalone blog and news editors have been removed.

## Start the editor

1. Double-click `open-content-studio.cmd`.
2. Your browser will open `tools/content-studio.html` through a local server.
3. Click `Connect site folder` and choose this repo folder.

## Add content

- Pick `Blogs`, `News`, or `Projects`.
- Fill the short form and drop images, PDFs, or project files into the upload box.
- Click `Save Entry` to write the content into the site data file.

## Save and publish

1. Click `Save Entry` or `Download file instead` in the studio.
2. Double-click `publish-site.cmd`.
3. Enter a commit message, then let the script commit and push the site.

## Notes

- Direct save works best in Microsoft Edge or Google Chrome because the editor uses the File System Access API.
- If direct save is unavailable, use `Download file instead` and replace the matching file in `assets/js/`.

## Simple editor (optional)

If you ever need the smaller fallback form, open `tools/content-studio-simple.html` while the local server is running.
