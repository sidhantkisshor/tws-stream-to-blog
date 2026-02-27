@echo off
cd /d %~dp0\..
start /B redis-server
timeout /t 3
start /B python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
start /B python -m arq src.worker.WorkerSettings
echo TWS Stream Processor started.
