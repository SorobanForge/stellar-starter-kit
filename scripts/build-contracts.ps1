# PowerShell script to build Soroban smart contracts.
$WorkspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ContractsDir = Join-Path $WorkspaceRoot "contracts"
$TargetWasm = "wasm32v1-none"

Write-Host "Building smart contracts in Rust workspace..."
cargo build --manifest-path (Join-Path $ContractsDir "Cargo.toml") --target $TargetWasm --release

if ($LASTEXITCODE -ne 0) {
    Write-Error "Cargo build failed."
    exit 1
}

Write-Host "Compilation successful!"
