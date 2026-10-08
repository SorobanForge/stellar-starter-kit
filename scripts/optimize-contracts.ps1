# PowerShell script to optimize compiled WASM contracts.
$WorkspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BinDir = Join-Path $WorkspaceRoot "bin"
$StellarCli = Join-Path $BinDir "stellar.exe"

if (-not (Test-Path $StellarCli)) {
    $StellarCli = "stellar"
}

Write-Host "Optimizing WASM contracts using Stellar CLI..."

$ReleaseDir = Join-Path $WorkspaceRoot "contracts\target\wasm32v1-none\release"
if (-not (Test-Path $ReleaseDir)) {
    Write-Error "Release directory not found. Please build contracts first."
    exit 1
}

# Add more contracts to this array as we implement them
$Contracts = @("stream", "splits", "escrow")

foreach ($Contract in $Contracts) {
    $WasmName = "$Contract.wasm"
    $InputWasm = Join-Path $ReleaseDir $WasmName

    if (-not (Test-Path $InputWasm)) {
        Write-Warning "Could not find WASM for $Contract at $InputWasm"
        continue
    }

    Write-Host "Optimizing $WasmName ..."
    & $StellarCli contract optimize --wasm $InputWasm
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to optimize $Contract."
        exit 1
    }
}

Write-Host "Optimizations complete!"
