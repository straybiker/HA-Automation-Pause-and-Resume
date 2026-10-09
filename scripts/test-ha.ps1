<#
.SYNOPSIS
Runs the full test suite, including the Home Assistant tests, in Docker.

.DESCRIPTION
The Home Assistant test harness needs Linux. This script builds a small
image with the pinned test dependencies (cached after the first build) and
runs pytest against the repository mounted at /src.

The first argument -Oldest selects the oldest supported Home Assistant
(requirements-dev-oldest.txt) instead of the newest (requirements-dev.txt).
Every other argument goes to pytest unchanged, for example:
    .\scripts\test-ha.ps1 tests/ha -x -p no:logging
    .\scripts\test-ha.ps1 -Oldest tests/ha
#>

# No param() block on purpose: PowerShell would match pytest options such as
# -p against a script parameter name and swallow them.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$dockerfile = 'ha-tests.Dockerfile'
$image = 'automation-pause-tests'
$pytestArgs = @($args)

if ($pytestArgs.Count -gt 0 -and $pytestArgs[0] -eq '-Oldest') {
    $dockerfile = 'ha-tests-oldest.Dockerfile'
    $image = 'automation-pause-tests-oldest'
    $pytestArgs = @($pytestArgs | Select-Object -Skip 1)
}

docker build -q -f "$repo/scripts/$dockerfile" -t $image $repo | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$cmd = @('pytest', '-q', '-p', 'no:cacheprovider') + $pytestArgs
docker run --rm -v "${repo}:/src" $image @cmd
exit $LASTEXITCODE
