$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$stage = Join-Path $dist "stage"
$xpi = Join-Path $dist "personafake.xpi"

$include = @(
  "manifest.json",
  "background.js",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "options.html",
  "options.css",
  "options.js",
  "lib",
  "icons",
  "demo"
)

if (Test-Path $dist) {
  Remove-Item $dist -Recurse -Force
}
New-Item -ItemType Directory -Path $stage | Out-Null

foreach ($item in $include) {
  $source = Join-Path $root $item
  $destination = Join-Path $stage $item
  Copy-Item $source $destination -Recurse
}

if (Test-Path $xpi) {
  Remove-Item $xpi -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stage, $xpi)
Remove-Item $stage -Recurse -Force
Write-Host "Listo: $xpi"
