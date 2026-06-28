@echo off
set "ROOT=%~dp0"
cd /d "%ROOT%"

python -c "import flask, flask_cors" 2>nul
if errorlevel 1 (
    echo Instalando dependencias...
    python -m pip install -r requirements.txt
)

if not exist "Back\tini.db" (
    echo Creando base de datos de prueba...
    python Back\create_db.py
)

start "Tini Restaurant API" cmd /k "python Back\app.py"
timeout /t 2 >nul
start "" "%ROOT%Front\TiniRestaurant.html"
