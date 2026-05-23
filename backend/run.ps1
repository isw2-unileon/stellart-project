# Run the backend with 64-bit Go + CGO (required for onnxruntime_go).
$goBin = "C:\Program Files\Go\bin"
$goExe = Join-Path $goBin "go.exe"

if (-not (Test-Path $goExe)) {
    Write-Error "64-bit Go not found at $goExe. Install from https://go.dev/dl/ (windows-amd64)."
    exit 1
}

$env:GOROOT = "C:\Program Files\Go"
$env:CGO_ENABLED = "1"
$env:Path = "$goBin;" + (
    $env:Path -split ';' |
    Where-Object { $_ -and ($_ -notlike '*Program Files (x86)\Go*') } |
    Select-Object -Unique
) -join ';'

Set-Location $PSScriptRoot
& $goExe run main.go
