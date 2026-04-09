param(
    [int]$Port = 8765
)

$ErrorActionPreference = "Stop"

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))

function Get-PreferredBrowserPath {
    $candidates = @(
        "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    return $null
}

function Get-AvailablePort {
    param(
        [int]$StartPort
    )

    for ($candidate = $StartPort; $candidate -lt ($StartPort + 20); $candidate++) {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidate)
        try {
            $listener.Start()
            $listener.Stop()
            return $candidate
        } catch {
            if ($listener) {
                try { $listener.Stop() } catch {}
            }
        }
    }

    throw "Unable to find an open localhost port."
}

function Get-ContentType {
    param(
        [string]$Path
    )

    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css" { return "text/css; charset=utf-8" }
        ".js" { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg" { return "image/svg+xml" }
        ".png" { return "image/png" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".webp" { return "image/webp" }
        ".gif" { return "image/gif" }
        ".pdf" { return "application/pdf" }
        ".ico" { return "image/x-icon" }
        ".txt" { return "text/plain; charset=utf-8" }
        ".xml" { return "application/xml; charset=utf-8" }
        ".webmanifest" { return "application/manifest+json; charset=utf-8" }
        default { return "application/octet-stream" }
    }
}

function Write-Redirect {
    param(
        [System.Net.HttpListenerResponse]$Response,
        [string]$Location
    )

    $Response.StatusCode = 302
    $Response.RedirectLocation = $Location
    $Response.Close()
}

function Write-ErrorResponse {
    param(
        [System.Net.HttpListenerResponse]$Response,
        [int]$StatusCode,
        [string]$Message
    )

    $Response.StatusCode = $StatusCode
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($Message)
    $Response.ContentType = "text/plain; charset=utf-8"
    $Response.ContentLength64 = $buffer.Length
    $Response.OutputStream.Write($buffer, 0, $buffer.Length)
    $Response.Close()
}

$Port = Get-AvailablePort -StartPort $Port
$prefix = "http://127.0.0.1:$Port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Content Studio server running."
Write-Host "Open in browser: $($prefix)tools/content-studio-simple.html"
Write-Host "Keep this window open while editing. Press Ctrl+C to stop the server."

$targetUrl = "$($prefix)tools/content-studio-simple.html"
$preferredBrowser = Get-PreferredBrowserPath
if ($preferredBrowser) {
    Write-Host "Launching in: $preferredBrowser"
    Start-Process -FilePath $preferredBrowser -ArgumentList $targetUrl | Out-Null
} else {
    Write-Host "Edge/Chrome not found. Falling back to the default browser."
    Start-Process $targetUrl | Out-Null
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        try {
            $relativePath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart("/"))
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                Write-Redirect -Response $response -Location "/tools/content-studio-simple.html"
                continue
            }

            $safeRelativePath = $relativePath.Replace("/", "\")
            $fullPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $safeRelativePath))
            if (-not $fullPath.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
                Write-ErrorResponse -Response $response -StatusCode 403 -Message "Forbidden"
                continue
            }

            if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
                Write-ErrorResponse -Response $response -StatusCode 404 -Message "Not found"
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.StatusCode = 200
            $response.ContentType = Get-ContentType -Path $fullPath
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
        } catch {
            if ($response.OutputStream.CanWrite) {
                Write-ErrorResponse -Response $response -StatusCode 500 -Message "Server error"
            }
        }
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
