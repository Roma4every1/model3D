# This script is used to deploy the application using the compiled client.
# The script runs under "deploy.bat" and requires the archive "client.zip".

Add-Type -AssemblyName System.IO.Compression.FileSystem
Set-ExecutionPolicy RemoteSigned -Scope process

# --- Global constants ---

$zipFileName = "client.zip"
$htmlFileName = "index.html"
$webRequestsFileName = "WebRequests.svc"
$systemInfoFileName = "System.Info.xml"
$replaceHandle = "/PATH_TO_REPLACE/"

# --- Utility Functions ---

function Green {
  process { Write-Host $_ -ForegroundColor Green }
}
function Red {
  process { Write-Host $_ -ForegroundColor Red }
}

function Unzip {
  param([string]$zipfile, [string]$outpath)
  [System.IO.Compression.ZipFile]::ExtractToDirectory($zipfile, $outpath)
}

function Get-WMWSystemList {
  param ([string[]]$wmwDirectoryContent)

  $systemList = New-Object String[] (0)
  foreach ($item in $wmwDirectoryContent) {
    if ($item -contains ".") { continue }
    $directoryContent = Get-ChildItem (Join-Path -Path $wmwPath -ChildPath $item) -Name
    if ($directoryContent -contains $systemInfoFileName) { $systemList += $item }
  }
  $systemList
}

function Get-BaseURL {
  param ([string]$wmwPath)

  try {
    $iisApps = Get-WebApplication
  } catch {
    Write-Output @(
    "Cannot get IIS application list. Most likely there are insufficient rights"
    "or the required 'WebAdministrator' module is missing`r`n"
    ) | Red
    exit 1
  }
  $baseURL = ""

  foreach ($app in $iisApps) {
    if ($app.PhysicalPath -eq $wmwPath) {
      $baseURL = $app.Path + "/client/"
    }
  }
  if ($baseURL -eq "") {
    Write-Output "Cannot find IIS application with path $wmwPath" | Red
    exit 1
  }
  $baseURL
}

# --- Input ---

$wmwPath = Read-Host -Prompt "Enter the full path to the directory with WMW"
if (-Not (Test-Path $wmwPath)) {
  Write-Output "Cannot resolve WMW path`r`n" | Red
  exit 1
}

$wmwPath = (Resolve-Path $wmwPath).Path
$clientPath = Join-Path -Path $wmwPath -ChildPath "client"

$wmwDirectoryContent = Get-ChildItem $wmwPath -Name
if (-Not ($wmwDirectoryContent -contains $webRequestsFileName)) {
  Write-Output "$webRequestsFileName file not found`r`n" | Red
  exit 1
}

# The case when the client is already installed.
# Just need to update the list of systems.
if ($wmwDirectoryContent -contains "client") {
  Write-Output "Client already exist. Check system list..."

  $systemListDirectory = Join-Path -Path $wmwPath -ChildPath "client/systems" -Resolve
  $systemList = Get-WMWSystemList $wmwDirectoryContent
  $currentSystemList = Get-ChildItem $systemListDirectory -Name

  if ($systemList.Count -eq 0) {
    Write-Output "No systems found`r`n" | Red
    exit 0
  }

  $changed = $false
  $htmlContent = Get-Content (Join-Path -Path $clientPath -ChildPath $htmlFileName -Resolve)

  foreach ($systemName in $currentSystemList) {
    if (-Not ($systemList -contains $systemName)) {
      Write-Output "Remove system $systemName"
      $systemPath = Join-Path -Path $systemListDirectory -ChildPath $systemName
      Remove-Item -Path $systemPath -Force -Recurse
      $changed = $true
    }
  }
  foreach ($systemName in $systemList) {
    if (-Not ($currentSystemList -contains $systemName)) {
      Write-Output "Add system $systemName"
      $systemPath = Join-Path -Path $systemListDirectory -ChildPath $systemName
      [void](New-Item -ItemType Directory -Path $systemPath -Force)
      Set-Content -Path (Join-Path -Path $systemPath -ChildPath $htmlFileName) -Value $htmlContent
      $changed = $true
    }
  }
  if (-Not $changed) {
    Write-Output "Files up to date" | Green
  }
  exit 0
}

# --- Deploy ---

if (-Not ((Get-ChildItem (Get-Location) -Name) -contains $zipFileName)) {
  Write-Output "Cannot find `"$zipFileName`" in current location`r`n" | Red
  exit 1  
}

Write-Output "Create client directory..."
[void](New-Item -ItemType Directory -Path $clientPath -Force)
Unzip $zipFileName $clientPath

$baseURL = Get-BaseURL $wmwPath
$htmlPath = Join-Path -Path $clientPath -ChildPath $htmlFileName
$newHtmlContent = (Get-Content $htmlPath) | ForEach-Object { $_ -replace $replaceHandle, $baseURL }

# replace

Set-Content -Path $htmlPath -Value $newHtmlContent
$assetDirPath = Join-Path -Path $clientPath -ChildPath "assets"
$neededAssetFiles = (Get-ChildItem -Path $assetDirPath) | Where-Object { $_ -like "*.js" -or $_ -like "*.css" }

foreach ($assetFile in $neededAssetFiles) {
  $assetFilePath = $assetFile.FullName
  (Get-Content $assetFilePath) | ForEach-Object { $_ -replace $replaceHandle, $baseURL } | Set-Content $assetFilePath
}

# add HTML files for systems

Write-Output "Check system list..."
$systemList = Get-WMWSystemList $wmwDirectoryContent
if ($systemList.Count -eq 0) {
  Write-Output "No systems found`r`n" | Red
}

foreach ($systemName in $systemList) {
  $systemPath = Join-Path -Path $clientPath -ChildPath ("systems/" + $systemName)
  [void](New-Item -ItemType Directory -Path $systemPath -Force)
  Set-Content -Path (Join-Path -Path $systemPath -ChildPath $htmlFileName) -Value $newHtmlContent
}

# --- Log ---

Write-Output "Client deployed successfully" | Green
