#!/bin/bash

echo "Starting CropWise Gemini AI Service Only..."
echo

echo "Installing Node.js dependencies..."
npm install

echo
echo "Starting Gemini AI Service (Node.js) on port 3001..."
echo
echo "Service URLs:"
echo "- Gemini AI Service: http://localhost:3001"
echo "- Voice-to-Text: http://localhost:3001/voice-to-text"
echo "- Chat: http://localhost:3001/chat"
echo "- Health Check: http://localhost:3001/health"
echo
echo "Press Ctrl+C to stop the service..."
echo

node gemini-service.js
