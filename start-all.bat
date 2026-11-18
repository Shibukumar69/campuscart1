@echo off
title CampusCart AI Launcher
echo ===================================================
echo Starting CampusCart AI (MERN + Machine Learning)
echo ===================================================
echo.

echo 0. Checking MongoDB Database (Port 27017)...
powershell -Command "if (-not (Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue)) { if (-not (Test-Path 'data\db')) { New-Item -ItemType Directory -Path 'data\db' -Force | Out-Null }; if (Test-Path 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe') { Start-Process 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe' -ArgumentList '--dbpath D:\campuscart1\data\db --bind_ip 127.0.0.1 --port 27017' -WindowStyle Minimized; Start-Sleep -Seconds 2 } }"

echo 1. Starting Python FastAPI ML Service (Port 8001)...
start "CampusCart ML Service" powershell -NoExit -Command "cd ml-service; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

echo 2. Starting Express REST API Server (Port 5000)...
start "CampusCart Backend" powershell -NoExit -Command "cd server; npm run dev"

echo 3. Starting React Vite Frontend (Port 5173)...
start "CampusCart Frontend" powershell -NoExit -Command "cd client; npm run dev"

echo.
echo ===================================================
echo All services launched in dedicated terminals!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo ML Micro: http://127.0.0.1:8001
echo MongoDB:  127.0.0.1:27017
echo ===================================================
pause
