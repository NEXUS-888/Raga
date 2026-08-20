# PowerShell script to execute the complete test suite
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Running Complete HH Goa 2026 Voice RAG Test Suite                  " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

python run_all_tests.py
