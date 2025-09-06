@echo off
echo Starting Maternal Emergency Locator App...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend App...
start "Frontend App" cmd /k "npm run dev"

echo.
echo Both servers are starting up!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
