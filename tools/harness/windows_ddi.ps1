# windows_ddi.ps1 -Action {to-windows|to-wsl} -HardwareId <vid:pid>
#
# Moves the iPhone between Windows and WSL ownership for the DDI mount.
#
# WHY THIS EXISTS: the ~15 MB Developer Disk Image upload cannot be done over USB/IP.
# usbipd-win's user-mode timing lets bulk OUT transfers bunch up, which desynchronises the
# usbmux sequence counter; the phone reports it as a type-4 control message reading
# "detected duplicate packet. Expected 2408 received 2411" and the mux session then wedges
# permanently. See usbipd-win#867, where the maintainer states it is "by design" and "not
# something that can be fixed". So the upload is done over native Windows USB instead, and
# only afterwards is the phone handed to WSL, which needs no upload because the mount is
# device-side state that survives the handover.
#
# EACH ACTION IS ONE ELEVATION. The steps are grouped by the transition they perform rather
# than run individually, because every separate Start-Process -Verb RunAs is another UAC
# prompt in the operator's face. Two prompts per cold mount is the floor: usbipd's bind and
# unbind both require elevation, and so does stopping a service.
#
# AMDS IS LEFT STOPPED AFTER `to-wsl`, deliberately. It is not restarted on teardown because
# the phone stays force-bound to the USB/IP stub, so Windows cannot see it either way and a
# restart would only buy another UAC prompt on every cycle. `to-windows` starts it again
# when the phone is next needed on that side, and the service is StartType Automatic, so a
# Windows reboot restores it regardless. The one case this leaves flat is a manual `usbipd
# unbind` outside the harness: iTunes will not see the phone until AMDS is started.
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('to-windows', 'to-wsl')]
    [string]$Action,

    [Parameter(Mandatory = $true)]
    [string]$HardwareId
)

$ErrorActionPreference = 'Stop'
$service = 'Apple Mobile Device Service'

# AMDS HOLDS THE PHONE. While the service is running, usbipd cannot complete the handover:
# `attach` fails with "Device busy (exported)" and Windows reports the device as in use,
# with PnP showing BOTH the USBIP stub and the Apple device at once. Stopping the service
# releases it immediately, with no replug and no re-enumeration.
$steps = if ($Action -eq 'to-windows') {
    @(
        "usbipd.exe unbind --hardware-id $HardwareId",
        "Start-Service -Name '$service'"
    )
} else {
    @(
        "Stop-Service -Name '$service' -Force",
        "usbipd.exe bind --force --hardware-id $HardwareId"
    )
}

# `exit $LASTEXITCODE` only reports the LAST step, so each step is checked as it runs and
# the first failure aborts. Without this a failed unbind would be reported as success by a
# subsequent step that happened to work.
$script = ($steps | ForEach-Object {
    "$_; if (-not `$?) { exit 1 }; if (`$LASTEXITCODE -ne 0 -and `$null -ne `$LASTEXITCODE) { exit `$LASTEXITCODE }"
}) -join '; '

# An elevated process cannot inherit the \\wsl.localhost working directory this is invoked
# from: it refuses to launch at all, reporting "The operation was canceled by the user",
# which reads as the operator dismissing the UAC prompt.
$process = Start-Process -FilePath 'powershell.exe' `
    -ArgumentList @('-NoProfile', '-NonInteractive', '-Command', $script) `
    -Verb RunAs -Wait -PassThru -WorkingDirectory 'C:\Windows\Temp'

if ($process.ExitCode -ne 0) {
    Write-Error "$Action failed with exit code $($process.ExitCode)"
    exit $process.ExitCode
}
