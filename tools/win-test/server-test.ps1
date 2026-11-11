#!/usr/bin/env pwsh
<#
Windows server package test, run by .github/workflows/win-test.yml on a Windows
runner (an administrator) with the packages in -Packages:

  CUBRID-Admin-server-<version>-windows-x64-setup.exe
  CUBRID-Admin-server-<version>-windows-x64.zip

Installer: silent install; the service "CUBRID Admin Server" (cubrid-admin) is
registered, not started, runs as NT SERVICE\cubrid-admin; the data folder
%ProgramData%\CUBRID Admin Server grants only SYSTEM, Administrators and the
service account; PORT set in its cwm.conf, the service started and
https://127.0.0.1:<port>/api/version answering; an upgrade (the same setup
again while the service runs) stops, replaces and starts it again with
secrets.json unchanged; a silent uninstall removes the program and the service
and keeps ProgramData.
Zip: unpacked into a folder, cwm.conf made from the sample with a free PORT,
the executable started from there and answering /api/version, with its
cwm-vault and ssl beside it.

Writes log.txt, service logs, results.json and results.md to -Out; exits 1 on
any failure.
#>
param(
  [Parameter(Mandatory = $true)] [string] $Packages,
  [Parameter(Mandatory = $true)] [string] $Out
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$PSNativeCommandUseErrorActionPreference = $false

$Product = 'CUBRID Admin Server'
$ServiceId = 'cubrid-admin'
$ServiceAccount = 'NT SERVICE\cubrid-admin'
$DataDir = Join-Path $env:ProgramData $Product
$InstallDir = Join-Path $env:ProgramFiles $Product
$UninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$Product"
$Temp = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }

New-Item -ItemType Directory -Force -Path $Out | Out-Null
$LogFile = Join-Path $Out 'log.txt'
$script:Results = @()

function Log([string] $Message) {
  $line = "[$((Get-Date).ToString('o'))] $Message"
  Write-Host $line
  Add-Content -Path $LogFile -Value $line
}

function Record([string] $Check, [string] $Status, [string] $Detail = '') {
  $script:Results += [pscustomobject]@{ check = $Check; status = $Status; detail = $Detail }
  $suffix = if ($Detail) { " -- $Detail" } else { '' }
  Log ("{0,-5} {1}{2}" -f $Status.ToUpper(), $Check, $suffix)
}

function Step([string] $Check, [scriptblock] $Body) {
  try {
    $detail = & $Body
    Record $Check 'pass' "$detail"
    return $true
  } catch {
    Record $Check 'fail' ("{0} (line {1})" -f $_.Exception.Message, $_.InvocationInfo.ScriptLineNumber)
    return $false
  }
}

function Assert([bool] $Condition, [string] $Message) {
  if (-not $Condition) { throw $Message }
}

function Get-FreePort {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  $port = $listener.LocalEndpoint.Port
  $listener.Stop()
  return $port
}

# The server answers when its port gives any HTTP status: /api/version is
# behind the app login (401 without one), the web screens at / are not.
function Wait-ApiVersion([int] $Port, [int] $Seconds = 120) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  $last = ''
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri "https://127.0.0.1:$Port/api/version" -SkipCertificateCheck -SkipHttpErrorCheck -TimeoutSec 5 -UseBasicParsing
      $version = "GET /api/version -> HTTP $($response.StatusCode) $(($response.Content -replace '\s+', ' ').Trim().Substring(0, [Math]::Min(160, ($response.Content -replace '\s+', ' ').Trim().Length)))"
      $root = Invoke-WebRequest -Uri "https://127.0.0.1:$Port/" -SkipCertificateCheck -SkipHttpErrorCheck -TimeoutSec 5 -UseBasicParsing
      $rootNote = "GET / -> HTTP $($root.StatusCode) ($($root.Content.Length) bytes$(if ($root.Content -match '<html') { ', html' }))"
      if ($root.StatusCode -ne 200) { throw "the web screens at / answer $($root.StatusCode), not 200 ($version)" }
      return "$version; $rootNote"
    } catch {
      $last = $_.Exception.Message
    }
    Start-Sleep -Seconds 2
  }
  throw "no answer from https://127.0.0.1:$Port in $Seconds s (last: $last)"
}

function Get-ServiceState {
  $service = Get-Service -Name $ServiceId -ErrorAction SilentlyContinue
  if ($service) { $state = $service.Status.ToString(); $service.Dispose(); return $state } else { return 'missing' }
}

# What the setup script reads before deciding about the data folder.
function Get-InstallRecord {
  $data = (Get-ItemProperty -Path 'HKLM:\Software\CUBRID\CUBRID Admin Server' -ErrorAction SilentlyContinue).DataFolder
  $loc = (Get-ItemProperty -Path $UninstallKey -ErrorAction SilentlyContinue).InstallLocation
  $query = (& sc.exe query $ServiceId 2>&1) | Out-String
  $queryExit = $LASTEXITCODE
  $ps32 = "$env:SystemRoot\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"
  $owner32 = if (Test-Path $ps32) {
    $raw = & $ps32 -NoProfile -NonInteractive -Command "[Console]::Write((Get-Acl -LiteralPath '$DataDir').GetOwner([System.Security.Principal.SecurityIdentifier]).Value)" 2>&1 | Out-String
    "'" + $raw.Trim() + "' (exit $LASTEXITCODE, $($raw.Length) chars raw)"
  } else { '(no 32-bit PowerShell)' }
  "DataFolder record '$data'; InstallLocation '$loc'; sc query exit $queryExit ($(($query -replace '\s+', ' ').Trim().Substring(0, [Math]::Min(80, ($query -replace '\s+', ' ').Trim().Length)))); owner by 32-bit PowerShell $owner32"
}

function Wait-ServiceState([string] $Expected, [int] $Seconds = 60) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    if ((Get-ServiceState) -eq $Expected) { return }
    Start-Sleep -Seconds 2
  }
  throw "service is $(Get-ServiceState), not $Expected, after $Seconds s"
}

function Get-AclLines([string] $Path) {
  (Get-Acl -Path $Path).Access | ForEach-Object {
    $inherited = if ($_.IsInherited) { ' (inherited)' } else { '' }
    "{0}: {1}{2}" -f $_.IdentityReference, $_.FileSystemRights, $inherited
  }
}

function Get-ServerProcess {
  Get-CimInstance Win32_Process -Filter "Name = 'cubrid-admin.exe'" -ErrorAction SilentlyContinue
}

function Get-ProcessOwner($Process) {
  $owner = Invoke-CimMethod -InputObject $Process -MethodName GetOwner
  return "$($owner.Domain)\$($owner.User)"
}

function Copy-ServiceLogs([string] $Label) {
  $logs = Join-Path $DataDir 'logs'
  if (Test-Path $logs) {
    $target = Join-Path $Out "service-logs-$Label"
    Copy-Item -Path $logs -Destination $target -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Get-FileSha256([string] $Path) {
  (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

# What can be said about secrets.json without showing it: hash, size, times, ACL, and the vault folder's entries.
function Get-SecretsInfo {
  $vault = Join-Path $DataDir 'cwm-vault'
  $file = Join-Path $vault 'secrets.json'
  if (-not (Test-Path $file)) { return "secrets.json missing; cwm-vault holds $((Get-ChildItem $vault -Force -ErrorAction SilentlyContinue | ForEach-Object Name) -join ', ')" }
  $item = Get-Item $file
  $keys = try { ((Get-Content $file -Raw | ConvertFrom-Json).PSObject.Properties.Name) -join ',' } catch { 'unreadable' }
  "sha256 $((Get-FileSha256 $file).Substring(0, 12))…, $($item.Length) bytes, keys [$keys], created $($item.CreationTimeUtc.ToString('HH:mm:ss.fff')), written $($item.LastWriteTimeUtc.ToString('HH:mm:ss.fff')), acl [$((Get-AclLines $file) -join '; ')], cwm-vault holds $((Get-ChildItem $vault -Force | ForEach-Object Name) -join ', ')"
}

# The data folder as the installer's upgrade sees it: its owner SID (both PowerShells),
# the creation times of its folders, and its siblings in ProgramData (a moved-aside copy).
function Get-DataFolderFacts {
  $owner = try { (Get-Acl -LiteralPath $DataDir).GetOwner([System.Security.Principal.SecurityIdentifier]).Value } catch { "error: $($_.Exception.Message)" }
  $ownerName = try { (Get-Acl -LiteralPath $DataDir).Owner } catch { '?' }
  $ps51 = try {
    $raw = & "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -Command "[Console]::Write((Get-Acl -LiteralPath '$DataDir').GetOwner([System.Security.Principal.SecurityIdentifier]).Value)" 2>&1 | Out-String
    "'" + $raw + "' (exit $LASTEXITCODE, $($raw.Length) chars)"
  } catch { "error: $($_.Exception.Message)" }
  $times = @('conf', 'logs', 'ssl', 'cwm-vault', 'storage') | ForEach-Object {
    $d = Join-Path $DataDir $_
    if (Test-Path $d) { "{0} created {1}" -f $_, (Get-Item $d).CreationTimeUtc.ToString('HH:mm:ss.fff') } else { "$_ missing" }
  }
  $siblings = Get-ChildItem $env:ProgramData -Directory -Filter 'CUBRID Admin Server*' -ErrorAction SilentlyContinue | ForEach-Object {
    "{0} (created {1}: {2})" -f $_.Name, $_.CreationTimeUtc.ToString('HH:mm:ss.fff'), ((Get-ChildItem $_.FullName -ErrorAction SilentlyContinue | ForEach-Object Name) -join ',')
  }
  $port = try { (Get-Content (Join-Path $DataDir 'conf\cwm.conf') -Raw | ConvertFrom-Json).PORT } catch { '?' }
  "owner $owner ($ownerName); powershell 5.1 prints $ps51; folder created $((Get-Item $DataDir).CreationTimeUtc.ToString('HH:mm:ss.fff')); $($times -join ', '); conf PORT $port; ProgramData entries: $($siblings -join ' | ')"
}

function Get-PreexistingFolders {
  @(Get-ChildItem $env:ProgramData -Directory -Filter 'CUBRID Admin Server.preexisting-*' -ErrorAction SilentlyContinue | ForEach-Object Name)
}

function Get-VaultLogLines {
  $log = Join-Path $DataDir 'logs\service\cubrid-admin-service.out.log'
  if (-not (Test-Path $log)) { return '(no service out log)' }
  $lines = @(Get-Content $log | Where-Object { $_ -match 'cwm-vault|secrets' })
  if ($lines.Count -eq 0) { return '(no cwm-vault lines in the service out log)' }
  ($lines | ForEach-Object { $_.Trim() }) -join ' | '
}

# ── packages ──────────────────────────────────────────────────────────────────

$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$isAdmin = ([System.Security.Principal.WindowsPrincipal] $identity).IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
Log "runner $env:COMPUTERNAME, user $($identity.Name), administrator $isAdmin, pwsh $($PSVersionTable.PSVersion), temp $Temp"
Record 'packages' 'info' ((Get-ChildItem $Packages | ForEach-Object { "{0} ({1:N1} MB)" -f $_.Name, ($_.Length / 1MB) }) -join '; ')

$Setup = Get-ChildItem $Packages -Filter '*-windows-x64-setup.exe' | Select-Object -First 1
$Zip = Get-ChildItem $Packages -Filter '*-windows-x64.zip' | Select-Object -First 1
$Version = $null
if ($Setup -and $Setup.Name -match 'server-(\d+\.\d+\.\d+\.\d+)-windows') { $Version = $Matches[1] }
Record 'version from the package name' 'info' "$Version"
$FallbackNote = Join-Path $Packages 'FALLBACK-BUILT-SETUP.txt'
if (Test-Path $FallbackNote) {
  Record 'setup.exe origin' 'info' ("fallback-built setup: " + (Get-Content $FallbackNote -Raw).Trim())
}

if (-not $Setup) {
  Record 'setup.exe present' 'fail' "no *-windows-x64-setup.exe in $Packages"
} else {
  $info = (Get-Item $Setup.FullName).VersionInfo
  Record 'setup.exe version resource' 'info' ("ProductName '{0}', ProductVersion '{1}', FileVersion '{2}', CompanyName '{3}'" -f $info.ProductName, $info.ProductVersion, $info.FileVersion, $info.CompanyName)
  Record 'state before the install' 'info' ("service {0}; install folder {1}; data folder {2}" -f (Get-ServiceState), (Test-Path $InstallDir), (Test-Path $DataDir))

  # ── install ───────────────────────────────────────────────────────────────
  $installed = Step 'silent install (/S)' {
    $p = Start-Process -FilePath $Setup.FullName -ArgumentList '/S' -Wait -PassThru
    Assert ($p.ExitCode -eq 0) "installer exit code $($p.ExitCode)"
    $expected = @('cubrid-admin.exe', 'cubrid-admin-service.exe', 'cubrid-admin-service.xml', 'cwm.conf.sample', 'cwm.conf.reference.md', 'Uninstall.exe')
    $missing = $expected | Where-Object { -not (Test-Path (Join-Path $InstallDir $_)) }
    Assert (-not $missing) "missing in ${InstallDir}: $($missing -join ', ')"
    Assert (Test-Path $UninstallKey) "no uninstall entry $UninstallKey"
    $entry = Get-ItemProperty $UninstallKey
    Assert ($entry.DisplayVersion -eq $Version) "DisplayVersion '$($entry.DisplayVersion)', expected '$Version'"
    "exit code 0; $InstallDir holds $((Get-ChildItem $InstallDir | ForEach-Object Name) -join ', '); DisplayVersion $($entry.DisplayVersion), Publisher $($entry.Publisher)"
  }

  if ($installed) {
    Step 'service registered, not started, automatic start' {
      $service = Get-Service -Name $ServiceId -ErrorAction SilentlyContinue
      Assert ($null -ne $service) "service $ServiceId is not registered"
      Assert ($service.DisplayName -eq $Product) "display name '$($service.DisplayName)'"
      Assert ($service.Status -eq 'Stopped') "status $($service.Status)"
      Assert ($service.StartType -eq 'Automatic') "start type $($service.StartType)"
      "display name '$($service.DisplayName)', status $($service.Status), start type $($service.StartType)"
    } | Out-Null

    Step "service runs as $ServiceAccount" {
      $qc = (& sc.exe qc $ServiceId 2>&1) | Out-String
      Assert ($LASTEXITCODE -eq 0) "sc qc exit code ${LASTEXITCODE}: $qc"
      $startName = ($qc -split "`r?`n" | Where-Object { $_ -match 'SERVICE_START_NAME' }) -replace '^\s*SERVICE_START_NAME\s*:\s*', ''
      $binary = ($qc -split "`r?`n" | Where-Object { $_ -match 'BINARY_PATH_NAME' }) -replace '^\s*BINARY_PATH_NAME\s*:\s*', ''
      Assert ($startName.Trim() -ieq $ServiceAccount) "SERVICE_START_NAME '$startName'"
      Assert ($binary -like '*cubrid-admin-service.exe*') "BINARY_PATH_NAME '$binary'"
      "SERVICE_START_NAME '$($startName.Trim())', BINARY_PATH_NAME '$($binary.Trim())'"
    } | Out-Null

    Step 'data folder with conf\cwm.conf and logs\' {
      Assert (Test-Path $DataDir) "$DataDir is missing"
      Assert (Test-Path (Join-Path $DataDir 'conf\cwm.conf')) 'conf\cwm.conf is missing'
      Assert (Test-Path (Join-Path $DataDir 'logs')) 'logs\ is missing'
      $sample = Get-Content (Join-Path $InstallDir 'cwm.conf.sample') -Raw
      $conf = Get-Content (Join-Path $DataDir 'conf\cwm.conf') -Raw
      Assert ($sample -eq $conf) 'conf\cwm.conf differs from cwm.conf.sample on a new install'
      "$DataDir holds $((Get-ChildItem $DataDir | ForEach-Object Name) -join ', ')"
    } | Out-Null

    Step 'data folder ACL: only SYSTEM, Administrators and the service account, nothing inherited' {
      $lines = Get-AclLines $DataDir
      $raw = (& icacls.exe $DataDir 2>&1) | Out-String
      Add-Content -Path (Join-Path $Out 'icacls.txt') -Value "== $DataDir`r`n$raw"
      $access = (Get-Acl -Path $DataDir).Access
      $identities = @($access | ForEach-Object { $_.IdentityReference.Value.ToUpperInvariant() } | Sort-Object -Unique)
      $expected = @('NT AUTHORITY\SYSTEM', 'BUILTIN\ADMINISTRATORS', $ServiceAccount.ToUpperInvariant()) | Sort-Object
      Assert (($identities -join '|') -eq ($expected -join '|')) "ACL identities: $($lines -join '; ')"
      Assert (-not ($access | Where-Object IsInherited)) "inherited entries: $($lines -join '; ')"
      $notFull = $access | Where-Object { $_.FileSystemRights -ne 'FullControl' -or $_.AccessControlType -ne 'Allow' }
      Assert (-not $notFull) "not full control: $($lines -join '; ')"
      $child = (Get-Acl -Path (Join-Path $DataDir 'conf\cwm.conf')).Access
      $childIdentities = @($child | ForEach-Object { $_.IdentityReference.Value.ToUpperInvariant() } | Sort-Object -Unique)
      Assert (($childIdentities -join '|') -eq ($expected -join '|')) "conf\cwm.conf ACL: $((Get-AclLines (Join-Path $DataDir 'conf\cwm.conf')) -join '; ')"
      $lines -join '; '
    } | Out-Null

    # ── start on a free port ──────────────────────────────────────────────
    $Port = Get-FreePort
    $ConfPath = Join-Path $DataDir 'conf\cwm.conf'
    $started = Step "PORT=$Port in cwm.conf, service started, the port answers (https)" {
      $conf = Get-Content $ConfPath -Raw | ConvertFrom-Json
      $conf.PORT = "$Port"
      $conf | ConvertTo-Json | Set-Content -Path $ConfPath -Encoding utf8
      Start-Service -Name $ServiceId
      Wait-ServiceState 'Running' 60
      $body = Wait-ApiVersion $Port 120
      "service Running; $body"
    }
    Copy-ServiceLogs 'after-start'

    if ($started) {
      Step 'server process runs as the service account, with cwm-vault and ssl in the data folder' {
        $process = Get-ServerProcess
        Assert ($null -ne $process) 'no cubrid-admin.exe process'
        $owner = Get-ProcessOwner ($process | Select-Object -First 1)
        Assert ($owner -ieq $ServiceAccount) "process owner '$owner'"
        Assert (Test-Path (Join-Path $DataDir 'cwm-vault\secrets.json')) 'cwm-vault\secrets.json is missing'
        Assert (Test-Path (Join-Path $DataDir 'ssl\cert.pem')) 'ssl\cert.pem is missing'
        Assert ($process.ExecutablePath -ieq (Join-Path $InstallDir 'cubrid-admin.exe')) "executable $($process.ExecutablePath)"
        "owner '$owner', pid $($process.ProcessId), $DataDir holds $((Get-ChildItem $DataDir | ForEach-Object Name) -join ', ')"
      } | Out-Null

      Record 'secrets.json after the first start' 'info' ("$(Get-SecretsInfo); service log: $(Get-VaultLogLines)")
      Record 'data folder before the upgrade' 'info' (Get-DataFolderFacts)

      # A plain restart, before the upgrade: does the server keep its secrets.json on its own?
      Step 'service restart alone keeps secrets.json' {
        $secrets = Join-Path $DataDir 'cwm-vault\secrets.json'
        $hashBefore = Get-FileSha256 $secrets
        Restart-Service -Name $ServiceId
        Wait-ServiceState 'Running' 60
        $body = Wait-ApiVersion $Port 120
        $hashAfter = Get-FileSha256 $secrets
        $info = Get-SecretsInfo
        $logLines = Get-VaultLogLines
        Assert ($hashAfter -eq $hashBefore) "secrets.json changed on a plain restart: $info; service log: $logLines"
        "unchanged; $info; service log: $logLines; $body"
      } | Out-Null

      # The installer's upgrade steps one at a time, the vault looked at after each.
      Step 'installer upgrade steps one by one (stopwait, sc config, icacls grant, icacls reset, start): secrets.json stays' {
        $svc = Join-Path $InstallDir 'cubrid-admin-service.exe'
        $secrets = Join-Path $DataDir 'cwm-vault\secrets.json'
        $hashBefore = Get-FileSha256 $secrets
        $notes = @()
        $out = (& $svc stopwait 2>&1) | Out-String
        Wait-ServiceState 'Stopped' 60
        $notes += "after stopwait (exit $LASTEXITCODE): $(Get-SecretsInfo)"
        $null = (& sc.exe config $ServiceId obj= $ServiceAccount 2>&1)
        $notes += "after sc config (exit $LASTEXITCODE): $(Get-SecretsInfo)"
        $null = (& icacls.exe $DataDir /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' "${ServiceAccount}:(OI)(CI)F" /Q 2>&1)
        $notes += "after icacls grant (exit $LASTEXITCODE): $(Get-SecretsInfo)"
        $null = (& icacls.exe "$DataDir\*" /reset /T /C /Q 2>&1)
        $notes += "after icacls reset (exit $LASTEXITCODE): $(Get-SecretsInfo)"
        $out = (& $svc start 2>&1) | Out-String
        Wait-ServiceState 'Running' 60
        $null = Wait-ApiVersion $Port 120
        $notes += "after start (exit $LASTEXITCODE): $(Get-SecretsInfo); service log: $(Get-VaultLogLines)"
        $joined = $notes -join ' || '
        Assert ((Get-FileSha256 $secrets) -eq $hashBefore) "secrets.json changed: $joined"
        "unchanged; $joined"
      } | Out-Null

      # ── upgrade while the service runs ────────────────────────────────────
      Step 'upgrade (same setup /S while the service runs): stopped, replaced, started again, secrets.json unchanged' {
        $secrets = Join-Path $DataDir 'cwm-vault\secrets.json'
        $hashBefore = Get-FileSha256 $secrets
        $createdBefore = (Get-Item $secrets).CreationTimeUtc
        $folderCreatedBefore = (Get-Item $DataDir).CreationTimeUtc
        $pidBefore = (Get-ServerProcess | Select-Object -First 1).ProcessId
        # Files the installer must write again (the running exe cannot be touched from here).
        $sample = Join-Path $InstallDir 'cwm.conf.sample'
        $reference = Join-Path $InstallDir 'cwm.conf.reference.md'
        $sampleHash = Get-FileSha256 $sample
        $referenceHash = Get-FileSha256 $reference
        Set-Content -Path $sample -Value '{ "PORT": "1" }' -Encoding utf8
        Set-Content -Path $reference -Value 'changed before the upgrade' -Encoding utf8
        $p = Start-Process -FilePath $Setup.FullName -ArgumentList '/S' -Wait -PassThru
        Assert ($p.ExitCode -eq 0) "installer exit code $($p.ExitCode)"
        Wait-ServiceState 'Running' 90
        $pidAfter = (Get-ServerProcess | Select-Object -First 1).ProcessId
        Assert ($pidAfter -ne $pidBefore) "the server process was not restarted (pid $pidBefore)"
        Assert ((Get-FileSha256 $sample) -eq $sampleHash) 'cwm.conf.sample was not written again by the upgrade'
        Assert ((Get-FileSha256 $reference) -eq $referenceHash) 'cwm.conf.reference.md was not written again by the upgrade'
        $info = Get-SecretsInfo
        $logLines = Get-VaultLogLines
        $facts = Get-DataFolderFacts
        Record 'data folder after the upgrade' 'info' $facts
        $recreated = if ((Get-Item $secrets -ErrorAction SilentlyContinue).CreationTimeUtc -ne $createdBefore) { 'a new file (CreationTime changed)' } else { 'the same file' }
        $answers8080 = try { (Invoke-WebRequest -Uri 'https://127.0.0.1:8080/' -SkipCertificateCheck -SkipHttpErrorCheck -TimeoutSec 5 -UseBasicParsing).StatusCode } catch { 'no' }
        Assert ((Get-FileSha256 $secrets) -eq $hashBefore) "cwm-vault\secrets.json changed: $recreated; now $info; service log after the restart: $logLines; port 8080 answers: $answers8080; $facts"
        $moved = Get-PreexistingFolders
        Assert ($moved.Count -eq 0) "the data folder was moved aside: $($moved -join ', ')"
        Assert ((Get-Item $DataDir).CreationTimeUtc -eq $folderCreatedBefore) "the data folder is a new folder (created $((Get-Item $DataDir).CreationTimeUtc.ToString('HH:mm:ss.fff')), was $($folderCreatedBefore.ToString('HH:mm:ss.fff')))"
        $conf = Get-Content $ConfPath -Raw | ConvertFrom-Json
        Assert ($conf.PORT -eq "$Port") "cwm.conf PORT is $($conf.PORT) after the upgrade"
        $body = Wait-ApiVersion $Port 120
        $owner = Get-ProcessOwner (Get-ServerProcess | Select-Object -First 1)
        Assert ($owner -ieq $ServiceAccount) "process owner after the upgrade '$owner'"
        "pid $pidBefore -> $pidAfter, secrets.json sha256 $hashBefore unchanged, PORT kept, owner '$owner'; $body"
      } | Out-Null

      Step 'data folder ACL unchanged after the upgrade' {
        $access = (Get-Acl -Path $DataDir).Access
        $identities = @($access | ForEach-Object { $_.IdentityReference.Value.ToUpperInvariant() } | Sort-Object -Unique)
        $expected = @('NT AUTHORITY\SYSTEM', 'BUILTIN\ADMINISTRATORS', $ServiceAccount.ToUpperInvariant()) | Sort-Object
        Assert (($identities -join '|') -eq ($expected -join '|')) "ACL: $((Get-AclLines $DataDir) -join '; ')"
        (Get-AclLines $DataDir) -join '; '
      } | Out-Null
      Copy-ServiceLogs 'after-upgrade'
    }

    # ── uninstall ─────────────────────────────────────────────────────────
    Step 'silent uninstall (/S): service and program gone, ProgramData kept' {
      $secrets = Join-Path $DataDir 'cwm-vault\secrets.json'
      $hashBefore = if (Test-Path $secrets) { Get-FileSha256 $secrets } else { '(none)' }
      $p = Start-Process -FilePath (Join-Path $InstallDir 'Uninstall.exe') -ArgumentList '/S' -Wait -PassThru
      Assert ($p.ExitCode -eq 0) "uninstaller exit code $($p.ExitCode)"
      # The uninstaller runs on from a copy of itself: give it time.
      $deadline = (Get-Date).AddSeconds(120)
      while ((Get-Date) -lt $deadline -and ((Test-Path $InstallDir) -or (Get-ServiceState) -ne 'missing')) { Start-Sleep -Seconds 2 }
      Assert ((Get-ServiceState) -eq 'missing') "service is $(Get-ServiceState) after the uninstall"
      Assert (-not (Test-Path $InstallDir)) "$InstallDir still holds $((Get-ChildItem $InstallDir -ErrorAction SilentlyContinue | ForEach-Object Name) -join ', ')"
      Assert (-not (Test-Path $UninstallKey)) 'the uninstall entry is still there'
      Assert (Test-Path $DataDir) "$DataDir was removed"
      Assert (Test-Path $ConfPath) 'conf\cwm.conf was removed'
      $hashAfter = if (Test-Path $secrets) { Get-FileSha256 $secrets } else { '(none)' }
      Assert ($hashAfter -eq $hashBefore) "cwm-vault\secrets.json changed or was removed ($hashBefore -> $hashAfter)"
      Assert ($null -eq (Get-ServerProcess)) 'a cubrid-admin.exe process is still running'
      "$DataDir kept: $((Get-ChildItem $DataDir | ForEach-Object Name) -join ', ')"
    } | Out-Null
    Copy-ServiceLogs 'after-uninstall'

    # Install again over the kept data folder: the record (conf, cwm-vault) and the
    # owner match, so the folder must stay in place with its keys and settings.
    Step 'install again after the uninstall: data folder kept in place, same secrets.json, PORT kept' {
      $secrets = Join-Path $DataDir 'cwm-vault\secrets.json'
      Assert (Test-Path $secrets) 'no secrets.json left by the uninstall to check with'
      $hashBefore = Get-FileSha256 $secrets
      $folderCreatedBefore = (Get-Item $DataDir).CreationTimeUtc
      $portBefore = (Get-Content $ConfPath -Raw | ConvertFrom-Json).PORT
      # Let the deleted service go for good (a service stays marked for deletion
      # while a handle to it is open) before the setup registers it again.
      [GC]::Collect(); [GC]::WaitForPendingFinalizers()
      $deadline = (Get-Date).AddSeconds(90)
      do { Start-Sleep -Seconds 5; $null = (& sc.exe query $ServiceId 2>&1); $gone = ($LASTEXITCODE -eq 1060) } while (-not $gone -and (Get-Date) -lt $deadline)
      Start-Sleep -Seconds 10
      Record 'before the reinstall' 'info' (Get-InstallRecord)
      $started = Get-Date
      $p = Start-Process -FilePath $Setup.FullName -ArgumentList '/S' -Wait -PassThru
      $took = [int] ((Get-Date) - $started).TotalMilliseconds
      $programFiles = if (Test-Path $InstallDir) { "present: $((Get-ChildItem $InstallDir -Force -ErrorAction SilentlyContinue | ForEach-Object { "$($_.Name) ($($_.Length) B)" }) -join ', ')" } else { 'absent' }
      $facts = Get-DataFolderFacts
      Record 'data folder after the reinstall' 'info' ("installer exit code $($p.ExitCode) after $took ms; program folder $programFiles; service $(Get-ServiceState); $facts")
      if ($p.ExitCode -ne 0) {
        # Once more after a minute: a timing problem would pass now.
        Start-Sleep -Seconds 60
        $p2 = Start-Process -FilePath $Setup.FullName -ArgumentList '/S' -Wait -PassThru
        Record 'second silent reinstall attempt after 60 s' 'info' ("exit code $($p2.ExitCode); service $(Get-ServiceState); program folder $(if (Test-Path (Join-Path $InstallDir 'Uninstall.exe')) { 'installed' } else { 'not installed' })")
        if ($p2.ExitCode -eq 0) { $p = $p2 }
      }
      Assert ($p.ExitCode -eq 0) "installer exit code $($p.ExitCode) (2 = aborted by the setup script); $facts"
      $moved = Get-PreexistingFolders
      Assert ($moved.Count -eq 0) "the data folder was moved aside: $($moved -join ', '); $facts"
      Assert ((Get-Item $DataDir).CreationTimeUtc -eq $folderCreatedBefore) "the data folder is a new folder; $facts"
      Assert (Test-Path $secrets) 'secrets.json is gone after the reinstall'
      Assert ((Get-FileSha256 $secrets) -eq $hashBefore) 'secrets.json changed by the reinstall'
      $port = (Get-Content $ConfPath -Raw | ConvertFrom-Json).PORT
      Assert ($port -eq $portBefore) "conf PORT is $port, was $portBefore"
      $service = Get-Service -Name $ServiceId -ErrorAction SilentlyContinue
      Assert ($null -ne $service -and $service.Status -eq 'Stopped') "service after the reinstall: $(Get-ServiceState)"
      Start-Service -Name $ServiceId
      Wait-ServiceState 'Running' 60
      $body = Wait-ApiVersion ([int] $port) 120
      Assert ((Get-FileSha256 $secrets) -eq $hashBefore) 'secrets.json changed when the service started after the reinstall'
      "kept (created $($folderCreatedBefore.ToString('HH:mm:ss.fff'))), same secrets.json, PORT $port, service registered and started: $body"
    } | Out-Null

    # When the silent reinstall stopped: which of the setup's commands fails, run
    # by hand from the copied program files, and what the setup says on screen.
    if (-not (Test-Path (Join-Path $InstallDir 'Uninstall.exe'))) {
      Step 'reinstall diagnostics: the setup commands by hand' {
        $svc = Join-Path $InstallDir 'cubrid-admin-service.exe'
        Assert (Test-Path $svc) "no program files to run by hand ($InstallDir holds: $((Get-ChildItem $InstallDir -Force -ErrorAction SilentlyContinue | ForEach-Object Name) -join ', '))"
        $notes = @()
        $out = (& $svc install 2>&1) | Out-String
        $notes += "WinSW install exit $LASTEXITCODE: $(($out -replace '\s+', ' ').Trim())"
        $out = (& sc.exe config $ServiceId obj= $ServiceAccount 2>&1) | Out-String
        $notes += "sc config exit $LASTEXITCODE: $(($out -replace '\s+', ' ').Trim())"
        $out = (& icacls.exe $DataDir /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' "${ServiceAccount}:(OI)(CI)F" /Q 2>&1) | Out-String
        $notes += "icacls grant exit $LASTEXITCODE: $(($out -replace '\s+', ' ').Trim())"
        $out = (& icacls.exe "$DataDir\*" /reset /T /C /Q 2>&1) | Out-String
        $notes += "icacls reset exit $LASTEXITCODE: $(($out -replace '\s+', ' ').Trim())"
        $out = (& icacls.exe $DataDir /setowner '*S-1-5-32-544' /T /C /Q 2>&1) | Out-String
        $notes += "icacls setowner exit $LASTEXITCODE: $(($out -replace '\s+', ' ').Trim())"
        $out = (& $svc uninstall 2>&1) | Out-String
        $notes += "WinSW uninstall (cleanup) exit $LASTEXITCODE"
        $notes -join ' || '
      } | Out-Null

      Step 'reinstall diagnostics: the setup run with its window, screenshots' {
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        $shell = New-Object -ComObject WScript.Shell
        $shots = @()
        $capture = {
          param($name)
          $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
          $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
          $g = [System.Drawing.Graphics]::FromImage($bmp)
          $g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
          $file = Join-Path $Out "setup-$name.png"
          $bmp.Save($file); $g.Dispose(); $bmp.Dispose()
          $file
        }
        $p = Start-Process -FilePath $Setup.FullName -PassThru
        Start-Sleep -Seconds 6
        $shots += & $capture 'directory-page'
        $null = $shell.AppActivate('CUBRID Admin Server Setup')
        Start-Sleep -Milliseconds 500
        [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
        for ($i = 1; $i -le 8 -and -not $p.HasExited; $i++) {
          Start-Sleep -Seconds 5
          $shots += & $capture "after-install-$i"
        }
        $null = $shell.AppActivate('CUBRID Admin Server Setup')
        [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
        Start-Sleep -Seconds 5
        $shots += & $capture 'after-enter'
        if (-not $p.HasExited) { Start-Sleep -Seconds 10 }
        if (-not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue; $exit = 'killed' } else { $exit = $p.ExitCode }
        "setup exit $exit; service $(Get-ServiceState); screenshots: $(($shots | ForEach-Object { Split-Path $_ -Leaf }) -join ', ')"
      } | Out-Null
    }

    Step 'silent uninstall again: service and program gone, ProgramData kept' {
      Assert (Test-Path (Join-Path $InstallDir 'Uninstall.exe')) 'nothing installed to uninstall (the reinstall did not happen)'
      $p = Start-Process -FilePath (Join-Path $InstallDir 'Uninstall.exe') -ArgumentList '/S' -Wait -PassThru
      Assert ($p.ExitCode -eq 0) "uninstaller exit code $($p.ExitCode)"
      $deadline = (Get-Date).AddSeconds(120)
      while ((Get-Date) -lt $deadline -and ((Test-Path $InstallDir) -or (Get-ServiceState) -ne 'missing')) { Start-Sleep -Seconds 2 }
      Assert ((Get-ServiceState) -eq 'missing') "service is $(Get-ServiceState) after the uninstall"
      Assert (-not (Test-Path $InstallDir)) "$InstallDir still exists"
      Assert (Test-Path (Join-Path $DataDir 'cwm-vault\secrets.json')) 'secrets.json removed by the uninstall'
      "$DataDir kept: $((Get-ChildItem $DataDir | ForEach-Object Name) -join ', ')"
    } | Out-Null
    Copy-ServiceLogs 'after-reinstall'
  }
}

# ── zip ───────────────────────────────────────────────────────────────────────

if (-not $Zip) {
  Record 'zip present' 'fail' "no *-windows-x64.zip in $Packages"
} else {
  $portableRoot = Join-Path $Temp 'cwm-server-portable'
  $proc = $null
  try {
    Step 'zip unpacks to <name>\cubrid-admin.exe and conf\' {
      if (Test-Path $portableRoot) { Remove-Item $portableRoot -Recurse -Force }
      Expand-Archive -Path $Zip.FullName -DestinationPath $portableRoot -Force
      $name = [System.IO.Path]::GetFileNameWithoutExtension($Zip.Name)
      $dir = Join-Path $portableRoot $name
      Assert (Test-Path $dir) "no $name folder in the zip: $((Get-ChildItem $portableRoot | ForEach-Object Name) -join ', ')"
      foreach ($file in @('cubrid-admin.exe', 'conf\cwm.conf.sample', 'conf\cwm.conf.reference.md')) {
        Assert (Test-Path (Join-Path $dir $file)) "$file is missing in the zip"
      }
      $info = (Get-Item (Join-Path $dir 'cubrid-admin.exe')).VersionInfo
      "$dir holds $((Get-ChildItem $dir -Recurse -File | ForEach-Object { $_.FullName.Substring($dir.Length + 1) }) -join ', '); exe ProductVersion '$($info.ProductVersion)'"
    } | Out-Null

    $dir = Join-Path $portableRoot ([System.IO.Path]::GetFileNameWithoutExtension($Zip.Name))
    if (Test-Path (Join-Path $dir 'cubrid-admin.exe')) {
      $zipPort = Get-FreePort
      Step "portable server on PORT=$zipPort answers (https), with cwm-vault and ssl beside it" {
        $conf = Get-Content (Join-Path $dir 'conf\cwm.conf.sample') -Raw | ConvertFrom-Json
        $conf.PORT = "$zipPort"
        $conf | ConvertTo-Json | Set-Content -Path (Join-Path $dir 'conf\cwm.conf') -Encoding utf8
        $stdout = Join-Path $Out 'portable-server-stdout.log'
        $stderr = Join-Path $Out 'portable-server-stderr.log'
        $script:proc = Start-Process -FilePath (Join-Path $dir 'cubrid-admin.exe') -WorkingDirectory $dir -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -NoNewWindow
        $body = Wait-ApiVersion $zipPort 120
        Assert (-not $script:proc.HasExited) "the server exited with $($script:proc.ExitCode)"
        Assert (Test-Path (Join-Path $dir 'cwm-vault\secrets.json')) 'cwm-vault\secrets.json is not beside the exe'
        Assert (Test-Path (Join-Path $dir 'ssl\cert.pem')) 'ssl\cert.pem is not beside the exe'
        "pid $($script:proc.Id); $body; $dir holds $((Get-ChildItem $dir | ForEach-Object Name) -join ', ')"
      } | Out-Null
    }
  } finally {
    if ($script:proc -and -not $script:proc.HasExited) {
      Stop-Process -Id $script:proc.Id -Force -ErrorAction SilentlyContinue
      Log "portable server pid $($script:proc.Id) stopped"
    }
  }
}

# ── results ───────────────────────────────────────────────────────────────────

$failed = @($script:Results | Where-Object status -eq 'fail')
$passed = @($script:Results | Where-Object status -eq 'pass')
$script:Results | ConvertTo-Json -Depth 3 | Set-Content -Path (Join-Path $Out 'results.json') -Encoding utf8
$rows = $script:Results | ForEach-Object { "| {0} | {1} | {2} |" -f $_.check, $_.status, (($_.detail -replace '\|', '\|') -replace "`r?`n", ' ') }
$table = @("### Server x64: $($failed.Count) failed, $($passed.Count) passed", '', '| check | status | detail |', '|---|---|---|') + $rows + @('')
$table -join "`n" | Set-Content -Path (Join-Path $Out 'results.md') -Encoding utf8
if ($env:GITHUB_STEP_SUMMARY) { Add-Content -Path $env:GITHUB_STEP_SUMMARY -Value ($table -join "`n") }
Write-Host ($table -join "`n")
if ($failed.Count -gt 0) { exit 1 }
exit 0
