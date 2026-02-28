@echo off
setlocal enabledelayedexpansion
cd /d %~dp0\..

echo ============================================
echo  TWS Local API + Cloudflare Tunnel Launcher
echo ============================================
echo.

REM --- Start Redis ---
echo [1/4] Starting Redis...
start /B redis-server
timeout /t 3 >nul

REM --- Start FastAPI ---
echo [2/4] Starting FastAPI on port 8000...
start /B python -m uvicorn src.main:app --host 0.0.0.0 --port 8000

REM --- Start ARQ Worker ---
echo [3/4] Starting ARQ worker...
start /B python -m arq src.worker.WorkerSettings
timeout /t 2 >nul

REM --- Start Cloudflare Tunnel ---
echo [4/4] Starting Cloudflare Tunnel (http2)...
set TUNNEL_LOG=%TEMP%\cloudflared_output.log
start /B cmd /c "cloudflared tunnel --url http://localhost:8000 --no-autoupdate --protocol http2 > %TUNNEL_LOG% 2>&1"

REM --- Wait for tunnel URL ---
echo.
echo Waiting for tunnel URL...
set TUNNEL_URL=
for /l %%i in (1,1,20) do (
    timeout /t 1 >nul
    for /f "tokens=*" %%a in ('findstr /C:"trycloudflare.com" %TUNNEL_LOG% 2^>nul') do (
        set "LINE=%%a"
    )
    if defined LINE (
        for /f "tokens=*" %%u in ('echo !LINE! ^| findstr /r "https://[a-z\-]*\.trycloudflare\.com"') do (
            set "TUNNEL_URL=%%u"
        )
    )
    if defined TUNNEL_URL goto :found_url
)
echo ERROR: Could not detect tunnel URL after 20 seconds.
goto :end

:found_url
REM Extract just the URL from the log line
for /f "tokens=2 delims=|" %%u in ('findstr /C:"trycloudflare.com" %TUNNEL_LOG% ^| findstr /C:"Visit"') do (
    set "TUNNEL_URL=%%u"
)
REM Trim whitespace
set "TUNNEL_URL=!TUNNEL_URL: =!"

echo.
echo ============================================
echo  Tunnel URL: !TUNNEL_URL!
echo ============================================
echo.

REM --- Update N8N via Node.js helper ---
echo Updating N8N with new tunnel URL...
node "%~dp0\update-tunnel-url.js" "!TUNNEL_URL!"

:end
echo.
echo All services running. Press Ctrl+C to stop.
pause >nul
