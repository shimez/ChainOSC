[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Name,

  [string]$M5ChainOSCPath,
  [string]$ChainOSCminiPath,
  [string]$ChainOSCnanoPath,
  [string]$ChainOSCPadPath,
  [string]$ChainOSCWindowsPath,

  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$oneDriveRoot = Split-Path -Parent $root

function Show-Usage {
  Write-Host 'Creates a ChainOSC Device Preset compatibility test result.'
  Write-Host ''
  Write-Host 'Usage:'
  Write-Host '  .\scripts\new_device_preset_test_result.ps1 -Name <result-file-name>'
  Write-Host ''
  Write-Host 'Example:'
  Write-Host '  .\scripts\new_device_preset_test_result.ps1 -Name 2026-08-27-device-preset-v1'
  Write-Host ''
  Write-Host 'Overwrite an existing result:'
  Write-Host '  .\scripts\new_device_preset_test_result.ps1 -Name 2026-08-27-device-preset-v1 -Force'
}

if ([string]::IsNullOrWhiteSpace($Name)) {
  Show-Usage
  exit 0
}

if (-not $M5ChainOSCPath) {
  $M5ChainOSCPath = Join-Path $oneDriveRoot 'Arduino\M5ChainOSC'
}
if (-not $ChainOSCminiPath) {
  $ChainOSCminiPath = Join-Path $oneDriveRoot 'Arduino\ChainOSCmini'
}
if (-not $ChainOSCnanoPath) {
  $ChainOSCnanoPath = Join-Path $oneDriveRoot 'Arduino\ChainOSCnano'
}
if (-not $ChainOSCPadPath) {
  $ChainOSCPadPath = Join-Path $oneDriveRoot 'Arduino\ChainOSCPad'
}
if (-not $ChainOSCWindowsPath) {
  $ChainOSCWindowsPath = Join-Path $oneDriveRoot 'ChainOSC-for-Windows'
}

$fileName = [IO.Path]::GetFileName($Name)
if ($fileName -ne $Name -or $fileName -in '.', '..') {
  throw 'Name must be a file name without a directory path.'
}
if (-not $fileName.EndsWith('.md', [StringComparison]::OrdinalIgnoreCase)) {
  $fileName += '.md'
}

$templatePath = Join-Path $root 'test-results\DEVICE_PRESET_RESULT_TEMPLATE.md'
$resultDirectory = Join-Path $root 'test-results'
$resultPath = Join-Path $resultDirectory $fileName

if (-not (Test-Path -LiteralPath $templatePath -PathType Leaf)) {
  throw "Template was not found: $templatePath"
}
if ((Test-Path -LiteralPath $resultPath) -and -not $Force) {
  throw "Result file already exists: $resultPath. Use -Force to replace it."
}

function Assert-Repository([string]$Path, [string]$Name) {
  if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    throw "$Name repository was not found: $Path"
  }
  $gitDirectory = Join-Path $Path '.git'
  if (-not (Test-Path -LiteralPath $gitDirectory)) {
    throw "$Name is not a Git repository: $Path"
  }
}

function Invoke-RepositoryGit([string]$Path, [string[]]$Arguments) {
  $safePath = $Path.Replace('\', '/')
  $output = & git -c "safe.directory=$safePath" -C $Path @Arguments 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "git failed in ${Path}: $($output -join [Environment]::NewLine)"
  }
  return $output
}

function Get-CommitDescription([string]$Path) {
  $commit = (Invoke-RepositoryGit $Path @('rev-parse', '--short', 'HEAD') | Select-Object -First 1).Trim()
  $status = Invoke-RepositoryGit $Path @('status', '--porcelain')
  if ($status.Count -gt 0) {
    return "$commit + local changes"
  }
  return $commit
}

function Get-HeaderVersion([string]$Path, [string]$RelativePath) {
  $configPath = Join-Path $Path $RelativePath
  if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw "Version file was not found: $configPath"
  }
  $text = [IO.File]::ReadAllText($configPath)
  $match = [regex]::Match($text, 'APP_VERSION(?:\[\])?\s*=\s*"([^"]+)"')
  if (-not $match.Success) {
    throw "APP_VERSION was not found: $configPath"
  }
  return $match.Groups[1].Value
}

function Get-WindowsVersion([string]$Path) {
  $configPath = Join-Path $Path 'tauri\src-tauri\tauri.conf.json'
  if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw "Tauri config was not found: $configPath"
  }
  $config = [IO.File]::ReadAllText($configPath) | ConvertFrom-Json
  if (-not $config.version) {
    throw "version was not found: $configPath"
  }
  return [string]$config.version
}

$repositories = @(
  @{ Name = 'ChainOSC'; Path = $root },
  @{ Name = 'M5ChainOSC'; Path = $M5ChainOSCPath },
  @{ Name = 'ChainOSCmini'; Path = $ChainOSCminiPath },
  @{ Name = 'ChainOSCnano'; Path = $ChainOSCnanoPath },
  @{ Name = 'ChainOSCPad'; Path = $ChainOSCPadPath },
  @{ Name = 'ChainOSC for Windows'; Path = $ChainOSCWindowsPath }
)

foreach ($repository in $repositories) {
  Assert-Repository $repository.Path $repository.Name
}

# Collect metadata before creating the result file so the new file itself does
# not make the ChainOSC repository appear dirty.
$chainCommit = Get-CommitDescription $root
$m5Version = Get-HeaderVersion $M5ChainOSCPath 'src\config.h'
$m5Commit = Get-CommitDescription $M5ChainOSCPath
$miniVersion = Get-HeaderVersion $ChainOSCminiPath 'src\config.h'
$miniCommit = Get-CommitDescription $ChainOSCminiPath
$nanoVersion = Get-HeaderVersion $ChainOSCnanoPath 'src\config.h'
$nanoCommit = Get-CommitDescription $ChainOSCnanoPath
$padVersion = Get-HeaderVersion $ChainOSCPadPath 'include\config.h'
$padCommit = Get-CommitDescription $ChainOSCPadPath
$windowsVersion = Get-WindowsVersion $ChainOSCWindowsPath
$windowsCommit = Get-CommitDescription $ChainOSCWindowsPath

$content = [IO.File]::ReadAllText($templatePath)
$content = [regex]::Replace(
  $content,
  '(?m)^(\|\s*[^|]+\|\s*)YYYY-MM-DD(\s*\|\s*)$',
  "`${1}$((Get-Date).ToString('yyyy-MM-dd'))`${2}"
)
$content = [regex]::Replace(
  $content,
  '(?m)^(\|\s*ChainOSC(?!mini|nano|Pad| for Windows)[^|]*\|\s*)commit:\s*(\|\s*)$',
  "`${1}commit: $chainCommit `${2}"
)
$content = $content.Replace('| M5ChainOSC | version: / commit: |', "| M5ChainOSC | version: $m5Version / commit: $m5Commit |")
$content = $content.Replace('| ChainOSCmini | version: / commit: |', "| ChainOSCmini | version: $miniVersion / commit: $miniCommit |")
$content = $content.Replace('| ChainOSCnano | version: / commit: |', "| ChainOSCnano | version: $nanoVersion / commit: $nanoCommit |")
$content = $content.Replace('| ChainOSCPad | version: / commit: |', "| ChainOSCPad | version: $padVersion / commit: $padCommit |")
$content = $content.Replace('| ChainOSC for Windows | version: / commit: |', "| ChainOSC for Windows | version: $windowsVersion / commit: $windowsCommit |")

[IO.Directory]::CreateDirectory($resultDirectory) | Out-Null
[IO.File]::WriteAllText($resultPath, $content, [Text.UTF8Encoding]::new($false))

Write-Host "Created: $resultPath"
Write-Host "ChainOSC: $chainCommit"
Write-Host "M5ChainOSC: $m5Version / $m5Commit"
Write-Host "ChainOSCmini: $miniVersion / $miniCommit"
Write-Host "ChainOSCnano: $nanoVersion / $nanoCommit"
Write-Host "ChainOSCPad: $padVersion / $padCommit"
Write-Host "ChainOSC for Windows: $windowsVersion / $windowsCommit"
