@echo off
title HH Goa 2026 Voice-Enabled RAG Pipeline
cd /d "%~dp0"

echo =========================================================
echo    Starting HH Goa 2026 Voice-Enabled RAG Pipeline       
echo =========================================================

echo [1/2] Launching FastAPI Backend on http://localhost:8000...
start "Voice RAG FastAPI Backend" cmd /k "cd /d %~dp0 && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
cd /d "%~dp0frontend"
npm run dev
pause
