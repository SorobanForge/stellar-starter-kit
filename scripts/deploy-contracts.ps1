# PowerShell script to deploy optimized contracts to Stellar Testnet and generate TS bindings.
$WorkspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BinDir = Join-Path $WorkspaceRoot "bin"
$StellarCli = Join-Path $BinDir "stellar.exe"

if (-not (Test-Path $StellarCli)) {
    $StellarCli = "stellar"
}

# 1. Setup Network
Write-Host "Configuring Stellar network: testnet..."
& $StellarCli network add --rpc-url https://soroban-testnet.stellar.org --passphrase "Test SDF Network ; September 2015" testnet --global 2>$null

# 2. Setup Deployer Key
$AccountName = "deployer"
Write-Host "Verifying deployer key pair..."
$KeysList = & $StellarCli keys ls
$HasKey = $false
if ($KeysList) {
    foreach ($k in $KeysList) {
        if ($k.Trim() -eq $AccountName) {
            $HasKey = $true
            break
        }
    }
}
if (-not $HasKey) {
    Write-Host "Generating deployer key pair..."
    & $StellarCli keys generate $AccountName
    Write-Host "Funding deployer account with Friendbot..."
    & $StellarCli keys fund $AccountName --network testnet
} else {
    Write-Host "Deployer key found."
}

# 3. Deploy and Generate Bindings
$OptimizedDir = Join-Path $WorkspaceRoot "contracts\target\wasm32-unknown-unknown\release"
$DeploymentsFile = Join-Path $WorkspaceRoot "apps/web/src/generated/deployments.json"

# Ensure output folder for deployments exists
$DeploymentsDir = [System.IO.Path]::GetDirectoryName($DeploymentsFile)
if (-not (Test-Path $DeploymentsDir)) {
    New-Item -ItemType Directory -Path $DeploymentsDir | Out-Null
}

$Deployments = @{}
if (Test-Path $DeploymentsFile) {
    $Deployments = Get-Content $DeploymentsFile | ConvertFrom-Json -AsHashtable
}

# Contracts to deploy
$Contracts = @("counter")

foreach ($Contract in $Contracts) {
    $WasmPath = Join-Path $OptimizedDir "$($Contract).optimized.wasm"
    if (-not (Test-Path $WasmPath)) {
        Write-Host "Optimized WASM not found at $WasmPath, falling back to unoptimized..."
        $WasmPath = Join-Path $OptimizedDir "$($Contract).wasm"
    }

    if (-not (Test-Path $WasmPath)) {
        Write-Error "WASM file not found for $Contract."
        exit 1
    }

    Write-Host "Deploying $Contract to Testnet..."
    # Execute deployment and capture output (which contains the deployed contract ID)
    $ContractId = & $StellarCli contract deploy --wasm $WasmPath --source-account $AccountName --network testnet
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy $Contract."
        exit 1
    }

    $ContractId = $ContractId.Trim()
    Write-Host "Deployed $Contract successfully. ID: $ContractId"
    $Deployments[$Contract] = $ContractId

    # Generate TS bindings
    $OutputDir = Join-Path $WorkspaceRoot "packages/contracts/src/generated/$Contract"
    Write-Host "Generating TS client bindings for $Contract at: $OutputDir"
    if (Test-Path $OutputDir) {
        Remove-Item $OutputDir -Recurse -Force
    }
    
    # Run the stellar contract bindings command
    & $StellarCli contract bindings typescript --wasm $WasmPath --output-dir $OutputDir --overwrite
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to generate TypeScript bindings for $Contract."
        exit 1
    }
}

# Save deployment IDs
$DeploymentsJson = $Deployments | ConvertTo-Json
$DeploymentsJson | Out-File $DeploymentsFile -Encoding utf8
Write-Host "Deployments saved to: $DeploymentsFile"
