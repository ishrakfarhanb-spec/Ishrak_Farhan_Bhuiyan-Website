param(
    [string]$Message = "",
    [string]$Remote = "origin",
    [string]$Branch = ""
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Args
    )

    & git @Args

    if ($LASTEXITCODE -ne 0) {
        throw "git $($Args -join ' ') failed with exit code $LASTEXITCODE."
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$currentBranch = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Unable to determine the current Git branch."
}

if (-not $Branch) {
    $Branch = $currentBranch
}

$statusBeforeStage = (& git status --porcelain).Trim()
if (-not $statusBeforeStage) {
    Write-Host "Nothing to publish. Working tree is already clean."
    exit 0
}

Invoke-Git -Args @("add", "-A")

$statusAfterStage = (& git status --porcelain).Trim()
if (-not $statusAfterStage) {
    Write-Host "Nothing to publish after refreshing the Git index."
    exit 0
}

if (-not $Message) {
    $Message = "Update site content"
}

Invoke-Git -Args @("commit", "-m", $Message)
Invoke-Git -Args @("push", $Remote, $Branch)

Write-Host "Published commit to $Remote/$Branch."
l