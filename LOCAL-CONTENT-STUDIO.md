# Local Content Studio

Use the local content workflow when you want to add blogs, news, or updates from your PC without editing source files manually.

This is the only content editor now. The older standalone blog and news editors have been removed.

## Start the editor (full mode)

1. Double-click `open-content-studio.cmd`.
2. Your browser will open `tools/content-studio.html` through a local server.
3. Click `Connect site folder` and choose this repo folder.

## Add content

- Pick `Blogs`, `News`, or `Projects`.
- Fill the structured form and use `Save To Working List`.
- Click `Save Active Section` to write the content into the site data file.

## Save and publish

1. Click `Save Active Section` or `Download Active File` in the studio.
2. Double-click `publish-site.cmd`.
3. Enter a commit message, then let the script commit and push the site.

## Notes

- Direct save works best in Microsoft Edge or Google Chrome because the editor uses the File System Access API.
- If direct save is unavailable, use `Download file instead` and replace the matching file in `assets/js/`.

## Simple editor (optional)

If you want the simpler upload-only UI, open `tools/content-studio-simple.html` while the local server is running.
