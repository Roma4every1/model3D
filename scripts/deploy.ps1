# This script is used to deploy the client side of JS WMW.
# The script is run via deploy.bat and requires the archive with the build.

Set-ExecutionPolicy RemoteSigned -Scope process
Add-Type -AssemblyName System.IO.Compression.FileSystem

# --- Global constants ---

$versionPattern = '^\d\.(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))?(?:\.(?:0|[1-9]\d*))?(?:-\w+\.?(?:0|[1-9]\d*))?$'
$defaultWmwPath = "C:\GS\wmw"
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

function Get-ClientFileName {
  $files = @(Get-ChildItem -Path . -Filter 'client-*.zip' | Where-Object {
    $version = $_.BaseName -replace '^client-', ''
    $version -match $versionPattern
  })
  if ($files.Count -eq 0) {
    Write-Output "No valid client-*.zip files found" | Red
    exit 1
  }
  if ($files.Count -eq 1) {
    return $files[0]
  }
  Write-Host "Found $($files.Count) archives:"
  for ($i = 0; $i -lt $files.Count; $i++) {
    Write-Host "[$($i+1)] $($files[$i].Name)"
  }
  do {
    try {
      $index = [int](Read-Host "Select an archive (1-$($files.Count))")
      if ($index -lt 1 -or $index -gt $files.Count) { throw }
      $selectedFile = $files[$index - 1]
      break
    } catch {
      Write-Output "Invalid input. Please enter a number between 1 and $($files.Count)" | Red
    }
  } while ($true)
  $selectedFile.Name
}

# --- Input ---

$wmwPath = Read-Host -Prompt "Enter the full path to the WMW directory [default to $defaultWmwPath]"
if ($wmwPath -eq "") {
  $wmwPath = $defaultWmwPath
}
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

$needUpdateSystems = 0
if ($wmwDirectoryContent -contains "client") {
  $p = Read-Host -Prompt "Client already exist. The directory will be overwritten [Y/n]"
  if ($p -eq "Y" -or $p -eq "y" -or $p -eq "") {
    Remove-Item -LiteralPath (Join-Path -Path $wmwPath -ChildPath "client" -Resolve) -Force -Recurse
  } else {
    $needUpdateSystems = 1
  }
}

if ($needUpdateSystems -eq 1) {
  Write-Output "Check system list..."

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

$zipFileName = Get-ClientFileName
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
