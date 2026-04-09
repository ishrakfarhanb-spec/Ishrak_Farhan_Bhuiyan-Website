# Local Content Studio

Use the local content workflow when you want to add blogs, news, or projects from your PC without editing source files manually.

This is the only content editor now. The older standalone blog and news editors have been removed.

## Start the editor

1. Double-click `open-content-studio.cmd`.
2. Your browser will open `tools/content-studio.html` through a local server.
3. Click `Connect site folder` and choose this repo folder.

## Add content

- Pick `Blogs`, `News`, or `Projects`.
- Add or edit entries in the form.
- For blogs, news, and projects, use the import buttons to copy images, Excel files, or PDFs from your PC into the correct site folders.
- Click `Save to working list` before writing the file back to the site.

## Save and publish

1. Click `Save active section` or `Save all sections` in the studio.
2. Double-click `publish-site.cmd`.
3. Enter a commit message, then let the script commit and push the site.

## Notes

- Direct save works best in Microsoft Edge or Google Chrome because the editor uses the File System Access API.
- If direct save is unavailable, use `Download active file` and replace the matching file in `assets/js/`.
