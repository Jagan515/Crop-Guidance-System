@echo off
echo Starting CropWise Services...
echo.

echo Installing Node.js dependencies...
call npm install

echo.
echo Starting Gemini AI Service (Node.js) on port 3001...
start "Gemini Service" cmd /k "npm start"

echo.
echo Waiting for Gemini service to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Flask Backend on port 5000...
start "Flask Backend" cmd /k "python app.py"

echo.
echo Both services are starting...
echo - Gemini AI Service: http://localhost:3001
echo - Flask Backend: http://localhost:5000
echo - React Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul

