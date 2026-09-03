@echo off
title SIAPS Mission Control - Bharati Antarctic Station
echo ================================================================
echo   SIAPS: Smart Integrated Autonomous Power System
echo   Bharati & Maitri Research Stations, Antarctica
echo   NCPOR / Ministry of Earth Sciences, Govt. of India
echo ================================================================
echo.

echo Starting SIAPS AI Backend (FastAPI + SCADA Engine on port 8000)...
start "SIAPS AI Backend" cmd /k "python -m uvicorn backend.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting SIAPS React Dashboard (Vite on port 5173)...
start "SIAPS Dashboard" cmd /k "npm run dev"

echo.
echo ================================================================
echo Both servers are launching!
echo   - Backend API & SCADA: http://localhost:8000
echo   - Interactive API Docs: http://localhost:8000/docs
echo   - Mission Dashboard UI: http://localhost:5173
echo ================================================================
pause
