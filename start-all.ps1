Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting CampusCart AI (MERN + Machine Learning)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Check if ports are already listening
$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
$mlRunning = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
$backendRunning = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$clientRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if (-not $mongoRunning) {
    Write-Host "Starting MongoDB on port 27017..." -ForegroundColor Yellow
    if (-not (Test-Path "$PSScriptRoot\data\db")) { New-Item -ItemType Directory -Path "$PSScriptRoot\data\db" -Force | Out-Null }
    if (Test-Path "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe") {
        Start-Process "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" -ArgumentList "--dbpath `"$PSScriptRoot\data\db`" --bind_ip 127.0.0.1 --port 27017" -WindowStyle Minimized
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "MongoDB is already running on port 27017." -ForegroundColor Green
}

if (-not $mlRunning) {
    Write-Host "Starting ML Microservice on port 8001..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml-service; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"
} else {
    Write-Host "ML Microservice is already running on port 8001." -ForegroundColor Green
}

if (-not $backendRunning) {
    Write-Host "Starting Express Backend on port 5000..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"
} else {
    Write-Host "Express Backend is already running on port 5000." -ForegroundColor Green
}

if (-not $clientRunning) {
    Write-Host "Starting React Frontend on port 5173..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"
} else {
    Write-Host "React Frontend is already running on port 5173." -ForegroundColor Green
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "CampusCart AI is Live at: http://localhost:5173" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Start-Process "http://localhost:5173"
