# WebCA Server Deployment Script
# 배포 스크립트

param(
    [string]$Seed = "seed",
    [string]$Salt = "salt",
    [int]$Port = 8080,
    [switch]$NoPkg
)

# --- Configuration ---
$User = "cubrid"
$TargetHost = "192.168.2.50"
$RemoteDir = "/home/cubrid"
$LocalBinary = "dist/webca-server-linux"
$RemoteBinary = "$RemoteDir/webca-server-linux"
$LogFile = "$RemoteDir/webca.log"

Write-Host "=== WebCA Server Deployment ===" -ForegroundColor Cyan
Write-Host "Target: ${User}@${TargetHost}:${RemoteDir}" -ForegroundColor Yellow
if ($NoPkg) {
    Write-Host "Mode: No build/packaging (using existing binary)" -ForegroundColor Yellow
}
Write-Host ""

$StepNumber = 1
$TotalSteps = if ($NoPkg) { 4 } else { 6 }

if (-not $NoPkg) {
    # Step 1: Build
    Write-Host "[$StepNumber/$TotalSteps] Building project..." -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        exit 1
    }
    Write-Host "✓ Build completed" -ForegroundColor Green
    Write-Host ""
    $StepNumber++

    # Step 2: Package for Linux
    Write-Host "[$StepNumber/$TotalSteps] Packaging for Linux..." -ForegroundColor Green
    npm run pkg:linux
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Packaging failed!"
        exit 1
    }
    if (-not (Test-Path $LocalBinary)) {
        Write-Error "Binary not found: $LocalBinary"
        exit 1
    }
    Write-Host "✓ Packaging completed" -ForegroundColor Green
    Write-Host ""
    $StepNumber++
} else {
    # Verify binary exists when skipping build
    if (-not (Test-Path $LocalBinary)) {
        Write-Error "Binary not found: $LocalBinary. Cannot skip build/packaging."
        exit 1
    }
    Write-Host "Skipping build and packaging (using existing binary)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Stop existing server (before copying)
Write-Host "[$StepNumber/$TotalSteps] Stopping existing server on port $Port..." -ForegroundColor Green

# Stop processes running on port 8080
Write-Host "Killing processes on port $Port..." -ForegroundColor Yellow
$KillPortCommand = "if lsof -ti :$Port >/dev/null 2>&1; then echo 'Killing processes on port $Port...'; lsof -ti :$Port | xargs kill -9 2>/dev/null; sleep 1; fi"
ssh.exe "${User}@${TargetHost}" $KillPortCommand

# Stop existing webca-server-linux if running (fallback)
$StopCommand = "if pgrep -f 'webca-server-linux.*$Port' >/dev/null 2>&1; then echo 'Stopping webca-server-linux...'; pkill -f 'webca-server-linux.*$Port'; sleep 2; fi"
ssh.exe "${User}@${TargetHost}" $StopCommand
Write-Host "✓ Server stopped" -ForegroundColor Green
Write-Host ""
$StepNumber++

# Step 4: Copy to remote server
Write-Host "[$StepNumber/$TotalSteps] Copying binary to ${User}@${TargetHost}:${RemoteDir}..." -ForegroundColor Green
scp.exe $LocalBinary "${User}@${TargetHost}:${RemoteDir}/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "SCP failed!"
    exit 1
}
Write-Host "✓ File copied successfully" -ForegroundColor Green
Write-Host ""
$StepNumber++

# Step 5: Make executable
Write-Host "[$StepNumber/$TotalSteps] Making binary executable..." -ForegroundColor Green
ssh.exe "${User}@${TargetHost}" "chmod +x $RemoteBinary"
if ($LASTEXITCODE -ne 0) {
    Write-Error "chmod failed!"
    exit 1
}
Write-Host "✓ Binary is now executable" -ForegroundColor Green
Write-Host ""
$StepNumber++

# Step 6: Start new server
Write-Host "[$StepNumber/$TotalSteps] Starting new server..." -ForegroundColor Green
$StartCommand = "cd $RemoteDir; nohup ./webca-server-linux --SEED=$Seed --SALT=$Salt --PORT=$Port > $LogFile 2>&1 & disown"
ssh.exe "${User}@${TargetHost}" $StartCommand
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start server!"
    exit 1
}
Write-Host "✓ Server started" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Server: https://${TargetHost}:${Port}" -ForegroundColor Cyan
Write-Host "Log file: ${User}@${TargetHost}:${LogFile}" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check server status:" -ForegroundColor Yellow
Write-Host "  ssh ${User}@${TargetHost} 'ps aux | grep webca-server-linux'" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  ssh ${User}@${TargetHost} 'tail -f $LogFile'" -ForegroundColor Gray
