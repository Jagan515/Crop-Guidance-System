#!/bin/bash

echo "Starting CropWise Services..."
echo

echo "Installing Node.js dependencies..."
npm install

echo
echo "Starting Gemini AI Service (Node.js) on port 3001..."
npm start &
GEMINI_PID=$!

echo
echo "Waiting for Gemini service to start..."
sleep 3

echo
echo "Starting Flask Backend on port 5000..."
python app.py &
FLASK_PID=$!

echo
echo "Both services are starting..."
echo "- Gemini AI Service: http://localhost:3001"
echo "- Flask Backend: http://localhost:5000"
echo "- React Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping services..."
    kill $GEMINI_PID 2>/dev/null
    kill $FLASK_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for services
wait

