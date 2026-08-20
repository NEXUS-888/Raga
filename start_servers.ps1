# PowerShell script to start both Backend (FastAPI) and Frontend (Vite)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = Get-Location }

Set-Location $ScriptDir

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   Starting HH Goa 2026 Voice-Enabled RAG Pipeline       " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Start Backend in a separate window or background process
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir'; Write-Host 'FastAPI Backend Running on http://localhost:8000' -ForegroundColor Green; python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

# 2. Start Frontend in this window
Write-Host "[2/2] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Set-Location (Join-Path $ScriptDir "frontend")
npm run dev
