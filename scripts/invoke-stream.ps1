# PowerShell script to invoke the deployed Stream contract.
$WorkspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BinDir = Join-Path $WorkspaceRoot "bin"
$StellarCli = Join-Path $BinDir "stellar.exe"

if (-not (Test-Path $StellarCli)) {
    $StellarCli = "stellar"
}

$DeploymentsFile = Join-Path $WorkspaceRoot "apps/web/src/generated/deployments.json"
if (-not (Test-Path $DeploymentsFile)) {
    Write-Error "Deployments file not found. Deploy the stream contract first."
    exit 1
}

$Deployments = Get-Content $DeploymentsFile | ConvertFrom-Json -AsHashtable
$ContractId = $Deployments["stream"]

if (-not $ContractId) {
    Write-Error "Stream contract id not found in deployments."
    exit 1
}

Write-Host "Invoking stream contract (ID: $ContractId)..." -ForegroundColor Green

Write-Host "`n1. Reading protocol config..."
& $StellarCli contract invoke --id $ContractId --source-account deployer --network testnet -- get_config

Write-Host "`n2. Reading next stream id..."
& $StellarCli contract invoke --id $ContractId --source-account deployer --network testnet -- next_stream_id

Write-Host "`nDone. Use the dashboard at /streams to create and manage streams."
