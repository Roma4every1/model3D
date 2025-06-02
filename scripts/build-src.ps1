<#
.SYNOPSIS
  Build a specific version of JS WMW from source code.

.DESCRIPTION
  This script is used to build a specific version of JS Well Manager Web
  from source code. The script downloads the sources from a remote server,
  installs dependencies and compiles the application.

  The version is defined by tag name, branch name or commit hash.
  By default the latest stable version is used.

.PARAMETER VersionDescriptor
  Application version descriptor: tag name, branch name, or commit hash.
  For example: "v1.8", "main", "62a351786ee13f4e799a1b52db15872938606876".

.PARAMETER SourceDirectory
  The relative path of the directory where the source code and dependencies
  will be placed. Default to "js-wmw".

.PARAMETER OutputDirectory
  The relative path of the directory where the output files will be placed
  (ZIP archive and deploy scripts). Default to current location.

.EXAMPLE
  ./build-src
.EXAMPLE
  ./build-src v1.8 -o build/v1.8

.NOTES
  Script version: 1.0 (2025-06-02).
  Git remote server: http://gs-git.gs/geospline
#>

param(
  [Parameter(Position=0)]
  [string]$VersionDescriptor = "main",

  [Alias("s")]
  [string]$SourceDirectory = "js-wmw",

  [Alias("o")]
  [string]$OutputDirectory = "."
)

# --- --- ---

function Write-ColorText {
  param(
    [Parameter(Mandatory=$true)]
    [string]$Text,
    [switch]$NoNewLine
  )
  $colorMap = @{
    [char]'B' = 'Blue'
    [char]'C' = 'Cyan'
    [char]'G' = 'Green'
    [char]'M' = 'Magenta'
    [char]'R' = 'Red'
    [char]'W' = 'White'
    [char]'Y' = 'Yellow'
  }
  foreach ($token in ($Text -split "(%\(.*?\)[A-Z])")) {
    if ([string]::IsNullOrEmpty($token)) {
      continue
    }
    if ($token.StartsWith("%(")) {
      $color = $colorMap[$token[-1]]
      $content = $token.Substring(2, $token.Length - 4)
      Write-Host $content -ForegroundColor $color -NoNewline
    } else {
      Write-Host $token -NoNewline
    }
  }
  if (-not $NoNewLine) {
    Write-Host
  }
}

function Exit-WithError {
  param (
    [Parameter(Mandatory=$true)]
    [string]$Text
  )
  Write-Host "ERROR" -ForegroundColor Red -NoNewline
  Write-Host ": " -NoNewline
  Write-ColorText $Text
  exit 1
}

function Test-Version {
  param(
    [string]$Current,
    [string]$Min
  )
  $currentParts = $Current.Split('.')
  $minParts = $Min.Split('.')

  while ($minParts.Count -lt 3) {
    $minParts += '0'
  }
  for ($i = 0; $i -lt 3; $i++) {
    $currentPart = [int]$currentParts[$i]
    $minPart = [int]$minParts[$i]
    if ($currentPart -gt $minPart) { return $true }
    if ($currentPart -lt $minPart) { return $false }
  }
  return $true
}

# --- --- ---

function Test-MemorySize {
  param(
    [Parameter(Mandatory=$true)]
    [System.Int64]$LowerBound
  )
  try {
    $memAvailable = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory * 1KB
    if ($memAvailable -ge $LowerBound) { return }
  } catch {
    return
  }
  $memGB = [math]::Round($memAvailable / 1GB, 1)
  $minGB = [math]::Round($LowerBound / 1GB, 1)
  Write-ColorText "%(WARN)Y: Requires %(~$($minGB)GB)W free RAM, %($($memGB)GB)W available"

  $result = Read-Host "Continue? [y/n]"
  if (-not ($result.ToLower() -eq "y")) { exit 0 }
}

function Test-Component {
  param(
    [Parameter(Mandatory=$true)]
    [string]$Name,
    [string]$MinVersion,
    [string]$VersionArg = "--version"
  )
  try {
    if ((& $Name $VersionArg 2>&1) -match '\d+\.\d+\.\d+') {
      $version = $matches[0]
      $needCheckVersion = $PSBoundParameters.ContainsKey('MinVersion')
      if ($needCheckVersion -and (-not (Test-Version -Current $version -Min $MinVersion))) {
        Exit-WithError "Requires %($Name)Y version $MinVersion or higher, detected %($version)R"
      }
      Write-ColorText "Detected %($name)Y v$version"
    } else {
      Exit-WithError "Cannot recognize %($Name)Y version"
    }
  } catch [System.Management.Automation.CommandNotFoundException] {
    Exit-WithError "Cannot find %($Name)Y: command not found"
  }
}

function Resolve-SourceDirectory {
  param (
    [Parameter(Mandatory=$true)]
    [string]$RelativePath
  )
  if (Test-Path -Path $RelativePath) {
    if (-not (Test-Path -Path $RelativePath -PathType Container)) {
      Exit-WithError "Source path is not a directory"
    }
    if ((Get-ChildItem $RelativePath).Count -gt 0) {
      Exit-WithError "Source directory is not empty"
    }
  } else {
    New-Item -Path $RelativePath -ItemType Directory -Force | Out-Null
  }
  return (Resolve-Path -Path $RelativePath)
}

function Resolve-OutputDirectory {
  param (
    [Parameter(Mandatory=$true)]
    [string]$RelativePath
  )
  if (Test-Path -Path $RelativePath) {
    if (-not (Test-Path -Path $RelativePath -PathType Container)) {
      Exit-WithError "Output path is not a directory"
    }
  } else {
    New-Item -Path $RelativePath -ItemType Directory -Force | Out-Null
  }
  return (Resolve-Path -Path $RelativePath)
}

function Get-GitArchive {
  param(
    [Parameter(Mandatory=$true)]
    [string]$Descriptor
  )
  $archiveLocation = "http://gs-git.gs/geospline/js-wmw/archive/$Descriptor.zip"
  try {
    $webClient = New-Object System.Net.WebClient
    return $webClient.DownloadData($archiveLocation)
  } catch [System.Net.WebException] {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
      Exit-WithError "Archive not found: $archiveLocation"
    } else {
      Exit-WithError $_.Exception.Message
    }
  }
}

function Initialize-GitRepository {
  param (
    [Parameter(Mandatory=$true, Position=0)]
    [byte[]]$Data,
    [Parameter(Mandatory=$true, Position=1)]
    [string]$RootPath
  )
  try {
    $memoryStream = [System.IO.MemoryStream]::new($Data)
    $zipArchive = [System.IO.Compression.ZipArchive]::new($memoryStream)

    $zipArchive.Entries | ForEach-Object {
      $fullPath = Join-Path $RootPath $_.FullName.Substring(7)
      $dirPath = [System.IO.Path]::GetDirectoryName($fullPath)

      if (-not (Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath | Out-Null
      }
      if ($_.Length -gt 0) {
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($_, $fullPath, $true)
      }
    }
  } catch {
    Exit-WithError $_.Exception.Message
  }
}

function Test-ClientVersion {
  $packageJson = Get-Content -Path "package.json" -Raw -Encoding UTF8
  if ($packageJson -match '"version": "([^"]+)"') {
    $versionMatch = $matches[1]
    Write-ColorText "Detected client version %($versionMatch)W"
    return $versionMatch
  } else {
    Exit-WithError "Cannot detect package.json"
  }
}

function Compress-BuildDirectory {
  param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$BuildDirectoryPath,
    [Parameter(Mandatory=$true, Position=1)]
    [string]$OutputDirectoryPath,
    [Parameter(Mandatory=$true, Position=2)]
    [string]$ClientVersion
  )
  $buildPath = Resolve-Path -Path $BuildDirectoryPath
  $zipFilePath = Join-Path -Path $OutputDirectoryPath -ChildPath "client-$ClientVersion.zip"
  $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal

  if (Test-Path -Path $zipFilePath -PathType Leaf) {
    Remove-Item -Path $zipFilePath
  }
  [System.IO.Compression.ZipFile]::CreateFromDirectory(
    $buildPath, $zipFilePath,
    $compressionLevel, $false
  )
}

# --- --- ---

Test-MemorySize 2GB
Test-Component "node" -MinVersion "22"
Test-Component "npm"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = Resolve-SourceDirectory $SourceDirectory
$outputDir = Resolve-OutputDirectory $OutputDirectory
Initialize-GitRepository (Get-GitArchive $VersionDescriptor) $sourceDir

$currentLocation = Get-Location
Set-Location $sourceDir
$clientVersion = Test-ClientVersion

Write-Host "Downloading packages..."
npm install
Write-Host "Run npm build script..."
npm run build

$clientConfig = '{"contactEmail": "support@geospline.ru"}'
Set-Content -Path "build/client-configuration.json" -Value $clientConfig -Encoding UTF8

Compress-BuildDirectory "build" $outputDir $clientVersion
Copy-Item -Path "scripts/deploy.bat" -Destination $outputDir -Force
Copy-Item -Path "scripts/deploy.ps1" -Destination $outputDir -Force

Set-Location $currentLocation
Write-Host "Client built successfully" -ForegroundColor Green
