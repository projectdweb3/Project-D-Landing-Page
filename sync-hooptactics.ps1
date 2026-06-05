# HoopTactics Integration Sync Script
# Run this script to sync local updates from 'The Collection App' project to the projectd.io website.

$sourceDir = "C:\Users\tmull\OneDrive\Documents\The Collection App"
$destDir = "C:\Users\tmull\OneDrive\Documents\Project D Landing Page\hooptactics"

# Create destination directory if it doesn't exist
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

# 1. Copy and modify index.html to add <base href="/hooptactics/">
$sourceIndex = Join-Path $sourceDir "index.html"
$destIndex = Join-Path $destDir "index.html"

if (Test-Path $sourceIndex) {
    Write-Host "Syncing index.html..." -ForegroundColor Cyan
    $htmlContent = Get-Content $sourceIndex -Raw -Encoding utf8
    
    # Inject <base href="/hooptactics/"> right after the opening <head> tag
    if ($htmlContent -notmatch '<base href="/hooptactics/">') {
        $htmlContent = $htmlContent -replace '(<head\b[^>]*>)', "`$1`r`n  <base href=`"/hooptactics/`">"
    }
    
    [System.IO.File]::WriteAllText($destIndex, $htmlContent, [System.Text.Encoding]::UTF8)
} else {
    Write-Warning "Source index.html not found at $sourceIndex"
}

# 2. Copy JS files
$sourceJs = Join-Path $sourceDir "js"
$destJs = Join-Path $destDir "js"

if (Test-Path $sourceJs) {
    Write-Host "Syncing JS files..." -ForegroundColor Cyan
    if (-not (Test-Path $destJs)) {
        New-Item -ItemType Directory -Force -Path $destJs | Out-Null
    }
    Copy-Item -Path (Join-Path $sourceJs "*") -Destination $destJs -Force
} else {
    Write-Warning "Source js folder not found at $sourceJs"
}

# 3. Mirror Assets directory (cards, sounds) using robocopy (super fast and efficient)
$sourceAssets = Join-Path $sourceDir "assets"
$destAssets = Join-Path $destDir "assets"

if (Test-Path $sourceAssets) {
    Write-Host "Syncing assets (cards, sounds)..." -ForegroundColor Cyan
    # Robocopy /MIR mirrors the directory structure, copying only new or updated files.
    # Exclude temporary pycache or scratch directories.
    # Exclude parallel card variants (*_gold_front.png, *_one-of-one_front.png, etc.) to optimize repository size.
    $robocopyArgs = @($sourceAssets, $destAssets, "/MIR", "/XD", "__pycache__", "scratch", "/XF", "*_gold_front.png", "*_one-of-one_front.png", "*_prismatic_front.png", "*_silver_front.png", "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np")
    & robocopy.exe @robocopyArgs
    
    # Robocopy exits with codes 0-7 on success. Ignore non-zero exit codes.
    $global:LASTEXITCODE = 0
} else {
    Write-Warning "Source assets folder not found at $sourceAssets"
}

Write-Host "Sync completed successfully! HoopTactics files are up to date." -ForegroundColor Green
