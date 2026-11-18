@echo off
title AWS Smart Access - Stop Servers
echo ===================================================
echo Stopping AWS Smart Access Servers (Backend & Frontend)...
echo ===================================================
echo.

:: Kill processes on port 4000 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000 "') do (
    echo Terminating backend process PID %%a on port 4000...
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill processes on port 5173 (Frontend Vite)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
    echo Terminating frontend process PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

:: Terminate any remaining node processes associated with this app
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*AWS-Smart-Access*' -or $_.CommandLine -like '*vite*' -or $_.CommandLine -like '*server.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo.
echo [DONE] Both Backend (port 4000) and Frontend (port 5173) are completely stopped!
echo ===================================================
pause
