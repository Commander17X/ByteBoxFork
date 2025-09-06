# H0L0 Web OS - Native App Integration Startup Script
Write-Host "Starting H0L0 Web OS with Native App Integration..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to electron directory
$electronDir = Join-Path $PSScriptRoot "..\electron"
Set-Location $electronDir

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Electron dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the Next.js development server in background
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
$nextjsDir = Join-Path $PSScriptRoot ".."
Start-Process -FilePath "cmd" -ArgumentList "/k", "cd /d `"$nextjsDir`" && npm run dev" -WindowStyle Normal

# Wait for the server to start
Write-Host "Waiting for development server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Electron
Write-Host "Starting Electron with native app integration..." -ForegroundColor Green
npm run dev

Read-Host "Press Enter to exit"
