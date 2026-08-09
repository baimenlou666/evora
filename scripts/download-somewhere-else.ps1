$ErrorActionPreference = 'Stop'

$siteRoot = 'https://kunfucutsman.neocities.org'
$pageUrl = "$siteRoot/about-me/somewhere-else/"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$layoutPath = Join-Path $workspaceRoot 'layouts/about-me/single.html'
$staticRoot = Join-Path $workspaceRoot 'static'

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $layoutPath) | Out-Null
New-Item -ItemType Directory -Force -Path $staticRoot | Out-Null

$pageResponse = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing
$utf8NoBom = [Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($layoutPath, $pageResponse.Content, $utf8NoBom)

function Save-SiteAsset([string] $assetUrl) {
    $absoluteUri = [Uri]::new([Uri]$siteRoot, $assetUrl)
    if ($absoluteUri.Host -ne ([Uri]$siteRoot).Host) { return $null }

    $relativePath = [Uri]::UnescapeDataString($absoluteUri.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relativePath)) { return $null }

    $destination = Join-Path $staticRoot ($relativePath -replace '/', [IO.Path]::DirectorySeparatorChar)
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Invoke-WebRequest -Uri $absoluteUri.AbsoluteUri -UseBasicParsing -OutFile $destination
    return $destination
}

$html = $pageResponse.Content
$assetMatches = [regex]::Matches($html, '(?:src|href)=["''](?<url>/[^"''?#]+(?:\?[^"'']*)?)["'']')
$assetUrls = $assetMatches | ForEach-Object { $_.Groups['url'].Value } |
    Where-Object { $_ -match '^/(assets/|about-me/somewhere-else/)' } |
    Sort-Object -Unique

$downloadedCss = @()
foreach ($assetUrl in $assetUrls) {
    $savedPath = Save-SiteAsset $assetUrl
    if ($savedPath -and $savedPath.EndsWith('.css')) { $downloadedCss += $savedPath }
}

foreach ($cssPath in $downloadedCss) {
    $css = Get-Content -LiteralPath $cssPath -Raw
    $cssMatches = [regex]::Matches($css, 'url\(["'']?(?<url>[^)"'']+)["'']?\)')
    foreach ($match in $cssMatches) {
        $url = $match.Groups['url'].Value.Trim()
        if ($url.StartsWith('data:')) { continue }
        $cssWebPath = '/' + ((Resolve-Path -LiteralPath $cssPath).Path.Substring((Resolve-Path -LiteralPath $staticRoot).Path.Length).TrimStart('\') -replace '\\', '/')
        $resolved = [Uri]::new([Uri]::new([Uri]$siteRoot, $cssWebPath), $url)
        Save-SiteAsset $resolved.AbsoluteUri | Out-Null
    }
}

Write-Host "Saved layout: $layoutPath"
Write-Host "Downloaded $($assetUrls.Count) directly referenced assets."
