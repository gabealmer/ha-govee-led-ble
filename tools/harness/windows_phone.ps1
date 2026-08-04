param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('start-tunneld', 'start-serve-web', 'stop-serve-web', 'start-wda', 'stop-wda')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'
$Root = 'Z:\libimobiledevice'
$Runs = Join-Path $Root 'runs'
$Pmd3Python = Join-Path $Root '.venv-pmd3\Scripts\python.exe'
New-Item -ItemType Directory -Force -Path $Runs | Out-Null

function Stop-TrackedProcess {
    param([string]$Name)

    $pidFile = Join-Path $Runs "$Name.pid"
    if (-not (Test-Path $pidFile)) {
        return
    }
    $processId = Get-Content $pidFile -ErrorAction SilentlyContinue
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    if (-not $processId) {
        return
    }
    & taskkill.exe /PID $processId /T /F 2>$null | Out-Null
    for ($i = 0; $i -lt 20; $i++) {
        if (-not (Get-Process -Id $processId -ErrorAction SilentlyContinue)) {
            return
        }
        Start-Sleep -Milliseconds 250
    }
    & taskkill.exe /PID $processId /T /F 2>$null | Out-Null
    if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
        throw "$Name process $processId would not stop"
    }
}

function Start-TrackedProcess {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$Arguments
    )

    Stop-TrackedProcess $Name
    $process = Start-Process `
        -FilePath $FilePath `
        -ArgumentList $Arguments `
        -WorkingDirectory $Root `
        -RedirectStandardOutput (Join-Path $Runs "$Name.log") `
        -RedirectStandardError (Join-Path $Runs "$Name.err.log") `
        -PassThru `
        -WindowStyle Hidden
    $process.Id | Set-Content (Join-Path $Runs "$Name.pid")
}

switch ($Action) {
    'start-tunneld' {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 http://127.0.0.1:49151
            if ($response.Content -match 'tunnel-address') {
                exit 0
            }
        } catch {
        }
        Start-Process `
            -FilePath $Pmd3Python `
            -ArgumentList '-m', 'pymobiledevice3', 'remote', 'tunneld', '--protocol', 'tcp' `
            -WorkingDirectory $Root `
            -Verb RunAs `
            -WindowStyle Hidden
    }
    'start-serve-web' {
        Start-TrackedProcess `
            -Name 'serve-web' `
            -FilePath $Pmd3Python `
            -Arguments @(
                '-m', 'pymobiledevice3', 'developer', 'core-device', 'display', 'serve-web',
                '--bind', '127.0.0.1', '--http-port', '8080', '--tunnel', $env:PHONE_UDID
            )
    }
    'stop-serve-web' {
        Stop-TrackedProcess 'serve-web'
    }
    'start-wda' {
        Start-TrackedProcess `
            -Name 'wda' `
            -FilePath $Pmd3Python `
            -Arguments @((Join-Path $Root 'wda_daemon.py'))
        Start-TrackedProcess `
            -Name 'wda-forward' `
            -FilePath $Pmd3Python `
            -Arguments @('-m', 'pymobiledevice3', 'usbmux', 'forward', '8100', '8100')
    }
    'stop-wda' {
        Stop-TrackedProcess 'wda-forward'
        Stop-TrackedProcess 'wda'
    }
}
