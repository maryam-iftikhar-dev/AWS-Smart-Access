Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting AWS Smart Access & Campus IT Assistant" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
Write-Host "Launching Backend on http://localhost:4000..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\backend`" && npm run dev"

Write-Host "Launching Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev"

Write-Host ""
Write-Host "Both servers started in separate terminal windows." -ForegroundColor Yellow
Write-Host "Open your browser to: http://localhost:5173" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
