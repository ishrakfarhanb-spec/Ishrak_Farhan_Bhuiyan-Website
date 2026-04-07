param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if (-not $Message) {
    Add-Type -AssemblyName Microsoft.VisualBasic
    $Message = [Microsoft.VisualBasic.Interaction]::InputBox(
        "Enter a commit message for this publish. Leave it blank to use the default message.",
        "Publish Site",
        "Update site content"
    )

    if (-not $Message) {
        $Message = "Update site content"
    }
}

& (Join-Path $repoRoot "publish.ps1") -Message $Message
