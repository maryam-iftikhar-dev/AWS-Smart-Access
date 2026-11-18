@echo off
title AWS Smart Access Launcher
echo ===================================================
echo Starting AWS Smart Access & Campus IT Assistant
echo ===================================================
echo.
echo Launching Backend (Port 4000)...
start "AWS Smart Access - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Launching Frontend (Port 5173)...
start "AWS Smart Access - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Servers are starting in separate windows:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:4000
echo.
echo To stop them:
echo   1. Press Ctrl+C in each terminal window, OR
echo   2. Simply close the terminal windows, OR
echo   3. Double-click stop.bat
echo ===================================================
