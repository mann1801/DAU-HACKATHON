@echo off
echo Starting Cyclone Monitoring Dashboard...
echo.

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask API server...
start "Cyclone API" python app.py

echo.
echo Installing React dependencies...
npm install

echo.
echo Starting React development server...
npm start

echo.
echo Dashboard will open at http://localhost:3000
echo API server running at http://localhost:5000
echo.
pause
