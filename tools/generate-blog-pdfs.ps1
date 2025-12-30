param(
  [string]$Source = "assets/js/blogs-data.js",
  [string]$OutDir = "assets/pdfs",
  [string]$TmpDir = "tools/blog-pdf-html"
)

function Get-BlogPosts([string]$Path) {
  $raw = Get-Content $Path -Raw
  $raw = $raw -replace '(?m)^\s*//.*$',''
  if ($raw -notmatch 'window\.siteBlogs\s*=\s*(\[[\s\S]*?\])\s*;') {
    throw "Could not find siteBlogs array in $Path"
  }
  $array = $matches[1]
  $json = $array -replace '(?m)^\s*([A-Za-z0-9_]+)\s*:', '"$1":'
  return $json | ConvertFrom-Json
}

function To-FileUri([string]$Path) {
  return ([System.Uri]$Path).AbsoluteUri
}

$edgePaths = @(
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)
$edgeExe = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edgeExe) {
  throw "Microsoft Edge not found. Install Edge or update the path list."
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

$posts = Get-BlogPosts $Source

foreach ($post in $posts) {
  $id = if ($post.id) { $post.id } else { ($post.title -replace '\s+', '-').ToLower() }
  $title = $post.title
  $summary = $post.summary
  $date = if ($post.displayDate) { $post.displayDate } else { $post.date }
  $category = $post.category
  $author = $post.author
  $imagePath = $null
  if ($post.image) {
    $imagePath = Resolve-Path $post.image -ErrorAction SilentlyContinue
  }

  $bodyHtml = ""
  foreach ($entry in $post.body) {
    if ($null -eq $entry) { continue }
    if ($entry -is [string]) {
      $bodyHtml += "<p>$entry</p>`n"
    } elseif ($entry.type -eq "list" -and $entry.items) {
      $tag = if ($entry.ordered) { "ol" } else { "ul" }
      $items = ($entry.items | ForEach-Object { "<li>$_</li>" }) -join ""
      $bodyHtml += "<$tag>$items</$tag>`n"
    } else {
      $text = $entry.text
      if ($text) { $bodyHtml += "<p>$text</p>`n" }
    }
  }

  $imageHtml = ""
  if ($imagePath) {
    $imageUri = To-FileUri $imagePath.Path
    $imageHtml = "<img class='cover' src='$imageUri' alt='' />"
  }

  $html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>$title</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; margin: 48px 56px; color: #111; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .meta { font-size: 12px; text-transform: uppercase; letter-spacing: .16em; color: #555; }
    .summary { font-size: 14px; margin: 12px 0 24px; color: #333; }
    .cover { width: 100%; height: auto; border-radius: 12px; margin: 12px 0 22px; }
    p { font-size: 13px; line-height: 1.6; margin: 0 0 12px; }
    ul, ol { padding-left: 20px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="meta">$category | $date</div>
  <h1>$title</h1>
  <div class="meta">$author</div>
  <div class="summary">$summary</div>
  $imageHtml
  $bodyHtml
</body>
</html>
"@

  $htmlPath = Join-Path $TmpDir "$id.html"
  [System.IO.File]::WriteAllText($htmlPath, $html, (New-Object System.Text.UTF8Encoding($false)))

  $pdfPath = (Resolve-Path $OutDir).Path + "\$id.pdf"
  $htmlUri = To-FileUri (Resolve-Path $htmlPath).Path
  $args = @(
    "--headless",
    "--disable-gpu",
    "--print-to-pdf=$pdfPath",
    $htmlUri
  )
  Start-Process -FilePath $edgeExe -ArgumentList $args -Wait
}
