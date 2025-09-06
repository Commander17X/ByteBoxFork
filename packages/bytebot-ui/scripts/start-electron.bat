@echo off
echo Starting H0L0 Web OS with Native App Integration...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Electron is installed
cd /d "%~dp0..\electron"
if not exist "node_modules" (
    echo Installing Electron dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Start the development server
echo Starting Next.js development server...
start "Next.js Dev Server" cmd /k "cd /d %~dp0.. && npm run dev"

REM Wait a moment for the server to start
timeout /t 5 /nobreak >nul

REM Start Electron
echo Starting Electron with native app integration...
cd /d "%~dp0..\electron"
npm run dev

pause
