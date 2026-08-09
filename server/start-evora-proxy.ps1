param(
  [int]$Port = 8787,
  [string]$ApiBaseUrl = "https://xiaofeixia.chat",
  [string]$Model = "gpt-5.5"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$authPath = Join-Path $env:USERPROFILE ".codex\auth.json"
$apiKey = [string]$env:OPENAI_API_KEY

if ([string]::IsNullOrWhiteSpace($apiKey) -and (Test-Path -LiteralPath $authPath)) {
  $auth = Get-Content -Raw -LiteralPath $authPath | ConvertFrom-Json
  $apiKey = [string]$auth.OPENAI_API_KEY
}

if ([string]::IsNullOrWhiteSpace($apiKey)) {
  Write-Host "OPENAI_API_KEY is not set and ~/.codex/auth.json contains no usable key." -ForegroundColor Yellow
  $secureKey = Read-Host "Paste a valid API key (input is hidden)" -AsSecureString
  $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  }
}

if ([string]::IsNullOrWhiteSpace($apiKey)) {
  throw "No API key was supplied. The EVORA proxy was not started."
}

$env:OPENAI_API_KEY = $apiKey.Trim()
$env:EVORA_PROXY_PORT = [string]$Port
$env:EVORA_API_BASE_URL = $ApiBaseUrl
$env:EVORA_MODEL = $Model

Write-Host "Starting EVORA proxy at http://127.0.0.1:$Port" -ForegroundColor Cyan
Write-Host "API: $ApiBaseUrl | Model: $Model" -ForegroundColor DarkGray
Write-Host "Keep this window open while using /robot/. Press Ctrl+C to stop." -ForegroundColor DarkGray

Push-Location $projectRoot
try {
  & node ".\server\evora-proxy.mjs"
}
finally {
  Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
  Pop-Location
}
