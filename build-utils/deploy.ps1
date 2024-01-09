# This script is used to deploy the application using the compiled client.
#
# WARNING: Do not use this script in Storage! This will change the build files.
#
# The script prompts the user for the necessary parameters and performs some
# actions with the build files (index.html and assets).

function Green {
  process { Write-Host $_ -ForegroundColor Green }
}
function Red {
  process { Write-Host $_ -ForegroundColor Red }
}
function StringifyArray([Array]$array) {
  $result = New-Object String[] ($array.Length)
  for ($i = 0; $i -le ($result.length - 1); $i += 1) {
    $result[$i] = "'" + $array[$i] + "'"
  }
  "[" + ($result -join ", ") + "]"
}

# --- Cliend build path ---

$inputClientPath = Read-Host -Prompt "Enter the full or relative path to the client build"
Push-Location $inputClientPath
$clientPath = Get-Location

$htmlFileName = "index.html"
$assetDirPath = Join-Path -Path $clientPath -ChildPath "assets"
$htmlPath = Join-Path -Path $clientPath -ChildPath $htmlFileName

if (-Not (Test-Path $assetDirPath)) {
  Write-Output "Cannot resolve path with assets`r`n" | Red
  exit 1
}
if (-Not (Test-Path $htmlPath)) {
  Write-Output "Cannot resolve path with assets`r`n" | Red
  exit 1
}

$clientPath = Resolve-Path -Path $clientPath
Write-Output "Client build path is '$($clientPath.Path)'`r`n" | Green

# --- Base URL ---

$baseURL = Read-Host -Prompt "Enter the path where the application will be hosted"

if (-Not $baseURL.StartsWith("/")) {
  Write-Output "The path must start with '/'`r`n" | Red
  exit 1
}
if (-Not $baseURL.EndsWith("/")) {
  $baseURL = $baseURL + "/"
}
Write-Output "Path is '$baseURL'`r`n" | Green

# --- System List ---

$inputSystemList = Read-Host -Prompt "Enter system names separated by commas"
$systemList = $inputSystemList -split " *, *"
Write-Output "Systems are $(StringifyArray $systemList)`r`n" | Green

# --- Contact Email ---

$contactEmail = "support@geospline.ru"
Write-Output "The contact email is '$contactEmail'"
$contactEmailSubmit = Read-Host -Prompt "Ok? (y/n)"

if ($contactEmailSubmit.StartsWith("n")) {
  $contactEmail = Read-Host -Prompt "Enter the new contact email"

  if (-Not $contactEmail) {
    Write-Output "Contact email cannot be empty" | Red
    exit 1
  }
}
Write-Output "Contact email is '$contactEmail'`r`n" | Green

# --- User Documentation Link ---

$userDocLink = Read-Host -Prompt "Enter a link to the user documentation (can be empty)"

if ($userDocLink) {
  Write-Output "User doc link is '$userDocLink'`r`n" | Green
} else {
  Write-Output "Link to user documentation not set`r`n" | Green
}

# --- Processing ---

$replaceHandle = "/PATH_TO_REPLACE/"
$newHtmlContent = (Get-Content $htmlPath) | ForEach-Object { $_ -replace $replaceHandle, $baseURL }

# replace

Set-Content -Path $htmlFileName -Value $newHtmlContent
$neededAssetFiles = (Get-ChildItem -Path $assetDirPath) | Where-Object { $_ -like "*.js" -or $_ -like "*.css" }

foreach ($assetFile in $neededAssetFiles) {
  $assetFilePath = $assetFile.FullName
  (Get-Content $assetFilePath) | ForEach-Object { $_ -replace $replaceHandle, $baseURL } | Set-Content $assetFilePath
}

# add HTML files for systems

foreach ($systemName in $systemList) {
  $systemPath = Join-Path -Path $clientPath -ChildPath ("systems/" + $systemName)
  New-Item -ItemType Directory -Path $systemPath -Force
  Set-Content -Path (Join-Path -Path $systemPath -ChildPath $htmlFileName) -Value $newHtmlContent
}

# replaces in "client-configuration.json"

$clientConfigurationFile = "client-configuration.json"
if ($userDocLink) {
  (Get-Content $clientConfigurationFile) `
    -replace '(?<="contactEmail": ").*?(?=")', $contactEmail `
    -replace '(?<="userDocLink": ").*?(?=")', $userDocLink | Set-Content $clientConfigurationFile
} else {
  (Get-Content $clientConfigurationFile) `
    -replace '(?<="contactEmail": ").*?(?=")', $contactEmail | Set-Content $clientConfigurationFile
}
