@echo off
set "ROOT=%~dp0.."
cd /d "%ROOT%"
start "Flask Server" cmd /k "python Back\app.py"
timeout /t 2 >nul
start "" Front\TiniRestaurant.html