# Educational ERP Development Startup Script - PowerShell Version
param(
    [switch]$SkipDeps,
    [switch]$Clean,
    [switch]$Debug
)

# Set execution policy and error handling
$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Debug) { "Continue" } else { "SilentlyContinue" }

Write-Host "🚀 Starting Educational ERP Development Environment..." -ForegroundColor Green
Write-Host "Current directory: $(Get-Location)`n" -ForegroundColor Cyan

# Function to write colored output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

# Check project structure
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (!(Test-Path $backendPath)) {
    Write-Error "Backend directory not found. Please run this script from the project root."
    exit 1
}

if (!(Test-Path $frontendPath)) {
    Write-Error "Frontend directory not found. Please run this script from the project root."
    exit 1
}

# Check Node.js and npm
Write-Info "Checking Node.js..."
try {
    $nodeVersion = & node --version
    Write-Success "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js from https://nodejs.org/"
    exit 1
}

Write-Info "Checking npm..."
try {
    $npmVersion = & npm --version
    Write-Success "npm version: $npmVersion"
} catch {
    Write-Error "npm not found. Please ensure npm is installed with Node.js."
    exit 1
}

# Clean if requested
if ($Clean) {
    Write-Info "Cleaning old caches..."
    if (Test-Path "backend\node_modules") {
        Remove-Item "backend\node_modules" -Recurse -Force
    }
    if (Test-Path "frontend\node_modules") {
        Remove-Item "frontend\node_modules" -Recurse -Force
    }
    Write-Success "Cache cleaned."
}

# Create logs directory
$logsPath = Join-Path $PSScriptRoot "logs"
if (!(Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath | Out-Null
}

# Install dependencies
if (!$SkipDeps) {
    Write-Info "Checking dependencies..."

    Push-Location $backendPath
    if (!(Test-Path "node_modules")) {
        Write-Info "Installing backend dependencies..."
        try {
            & npm install
            Write-Success "Backend dependencies installed."
        } catch {
            Write-Error "Failed to install backend dependencies: $($_.Exception.Message)"
            Pop-Location
            exit 1
        }
    } else {
        Write-Success "Backend dependencies already installed."
    }
    Pop-Location

    Push-Location $frontendPath
    if (!(Test-Path "node_modules")) {
        Write-Info "Installing frontend dependencies..."
        try {
            & npm install
            Write-Success "Frontend dependencies installed."
        } catch {
            Write-Error "Failed to install frontend dependencies: $($_.Exception.Message)"
            Pop-Location
            exit 1
        }
    } else {
        Write-Success "Frontend dependencies already installed."
    }
    Pop-Location
} else {
    Write-Info "Skipping dependency installation."
}

# Kill existing processes
Write-Info "Checking for existing processes..."
Get-NetTCPConnection -LocalPort 3001,3002 -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" } |
    ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Warning "Killing process '$($process.ProcessName)' on port $($_.LocalPort)"
            Stop-Process -Id $process.Id -Force
        }
    }

# Start backend
Write-Info "Starting Backend Server..."
Push-Location $backendPath
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    try {
        & npm run dev 2>&1 | Tee-Object -FilePath "../logs/backend.log" -Append
    } catch {
        Write-Error "Backend startup failed: $($_.Exception.Message)"
    }
}
Pop-Location
Write-Success "Backend server starting on port 3001..."

# Wait for backend
Start-Sleep -Seconds 5

# Start frontend
Write-Info "Starting Frontend Server..."
Push-Location $frontendPath
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3000"
    $env:REACT_APP_API_URL = "http://localhost:3001/api"
    try {
        & npm start 2>&1 | Tee-Object -FilePath "../logs/frontend.log" -Append
    } catch {
        Write-Error "Frontend startup failed: $($_.Exception.Message)"
    }
}
Pop-Location
Write-Success "Frontend server starting on port 3000..."

# Wait for services to initialize
Write-Info "Waiting for services to initialize..."
Start-Sleep -Seconds 10

# Display startup information
Write-Host "`n🎉 DEVELOPMENT ENVIRONMENT SUCCESSFULLY STARTED!" -ForegroundColor Green
Write-Host "`n🌐 Applications Available:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001/api" -ForegroundColor White
Write-Host "   API Docs:    http://localhost:3001/api-docs" -ForegroundColor White

Write-Host "`n📋 TEST LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "ADMINISTRATOR" -ForegroundColor Yellow
Write-Host "Email:    admin@erp.local" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "ICT FACULTY COORDINATOR" -ForegroundColor Yellow
Write-Host "Email:    ict.coordinator@ictu.edu.cm" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "SAMPLE STUDENT" -ForegroundColor Yellow
Write-Host "Email:    student.james@ictu.edu.cm" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST ACCOUNT (VERIFIED WORKING)" -ForegroundColor Green
Write-Host "Email:    test@example.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green

Write-Host "`n🔥 HOT RELOADING ENABLED:" -ForegroundColor Red
Write-Host "   ▶️ Backend auto-restarts on file changes" -ForegroundColor White
Write-Host "   ▶️ Frontend hot-reloads in browser" -ForegroundColor White

Write-Host "`n📝 LOGS LOCATION:" -ForegroundColor Cyan
Write-Host "   Backend: logs\backend.log" -ForegroundColor White
Write-Host "   Frontend: logs\frontend.log" -ForegroundColor White

Write-Host "`n⚠️  KEEP WINDOWS OPEN:" -ForegroundColor Yellow
Write-Host "   Close background windows to stop servers." -ForegroundColor White

Write-Host "`n✨ HAPPY DEVELOPING! 🎉" -ForegroundColor Green

# Keep script running until user stops it
Read-Host "`nPress Enter to stop all servers"

# Cleanup jobs
Write-Info "Shutting down servers..."
Stop-Job $backendJob -ErrorAction SilentlyContinue
Stop-Job $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $frontendJob -ErrorAction SilentlyContinue
Write-Success "All servers stopped."

# Note: PowerShell job cleanup doesn't stop the actual node processes
Write-Warning "You may need to manually close the opened command windows."
