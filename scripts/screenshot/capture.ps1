<#
.SYNOPSIS
    Saves the README screenshots from scripts/screenshot/demo.html.

.DESCRIPTION
    Serves the repository on localhost, opens the demo page in headless
    Chrome (or Edge) and writes docs/images/dashboard.png and card.png. The
    page loads the committed card bundle, so run npm run build first.
#>
[CmdletBinding()]
param(
    # Chrome first: Edge can ignore --screenshot when a policy manages it.
    [string] $Browser = (@(
            "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
            "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
        ) | Where-Object { Test-Path $_ } | Select-Object -First 1),
    [int] $Port = 8766
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$python = Join-Path $root '.venv\Scripts\python.exe'
$images = Join-Path $root 'docs\images'
New-Item -ItemType Directory -Force -Path $images | Out-Null

# Start-Process joins the arguments as they are, so quote the paths with spaces.
$server = Start-Process -FilePath $python -PassThru -WindowStyle Hidden -ArgumentList @(
    '-m', 'http.server', $Port, '--bind', '127.0.0.1', '--directory', "`"$root`""
)
try {
    $page = "http://127.0.0.1:$Port/scripts/screenshot/demo.html"
    $deadline = (Get-Date).AddSeconds(15)
    while ($true) {
        try {
            Invoke-WebRequest -Uri $page -UseBasicParsing -TimeoutSec 2 | Out-Null
            break
        }
        catch {
            if ((Get-Date) -gt $deadline) { throw "The local server did not start." }
            Start-Sleep -Milliseconds 300
        }
    }
    # Width and height in CSS pixels; the picture is twice as large.
    $shots = @(
        @{ View = 'dashboard'; Size = '1100,745' },
        @{ View = 'card'; Size = '480,850' }
    )
    foreach ($shot in $shots) {
        $file = Join-Path $images "$($shot.View).png"
        $url = "${page}?view=$($shot.View)"
        Remove-Item $file -ErrorAction SilentlyContinue
        # A profile of its own, so a running browser does not take over the job.
        $profileDir = Join-Path ([IO.Path]::GetTempPath()) "automation-pause-shot-$PID"
        Start-Process -FilePath $Browser -Wait -WindowStyle Hidden -ArgumentList @(
            '--headless=new', '--disable-gpu', '--hide-scrollbars',
            '--force-device-scale-factor=2', "--window-size=$($shot.Size)",
            '--virtual-time-budget=5000', "--user-data-dir=$profileDir",
            "--screenshot=`"$file`"", $url
        )
        if (-not (Test-Path $file)) {
            throw "No screenshot written for $($shot.View)."
        }
        Write-Host "Wrote $file"
    }
}
finally {
    Stop-Process -Id $server.Id -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force (Join-Path ([IO.Path]::GetTempPath()) "automation-pause-shot-$PID") -ErrorAction SilentlyContinue
}
