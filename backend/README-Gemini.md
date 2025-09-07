# CropWise Gemini AI Integration

This directory contains the Node.js service for Google Gemini AI integration, providing voice-to-text and chat functionality for the CropWise application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Google API Key for Gemini AI

### Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Set up Google API Key:**
   ```bash
   # Windows
   set GOOGLE_API_KEY=your-api-key-here
   
   # Linux/Mac
   export GOOGLE_API_KEY=your-api-key-here
   ```

3. **Start services:**
   ```bash
   # Windows
   start-services.bat
   
   # Linux/Mac
   ./start-services.sh
   ```

## 📡 API Endpoints

### Voice-to-Text
- **URL:** `POST http://localhost:3001/voice-to-text`
- **Body:** 
  ```json
  {
    "audio": "base64-encoded-audio",
    "mimeType": "audio/wav"
  }
  ```
- **Response:**
  ```json
  {
    "text": "Which crop should I plant this season?",
    "confidence": 0.95,
    "language": "en",
    "processingTime": "1.2s"
  }
  ```

### Text-to-Speech
- **URL:** `POST http://localhost:3001/text-to-speech`
- **Body:**
  ```json
  {
    "text": "Hello farmer!",
    "voice": "Kore"
  }
  ```
- **Response:** Audio file (WAV format)

### Chat with Gemini
- **URL:** `POST http://localhost:3001/chat`
- **Body:**
  ```json
  {
    "message": "How to improve soil health?",
    "context": "farming"
  }
  ```
- **Response:**
  ```json
  {
    "response": "To improve soil health, you can...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

### Health Check
- **URL:** `GET http://localhost:3001/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "gemini-ai-service",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

## 🔧 Configuration

### Environment Variables
- `GOOGLE_API_KEY`: Your Google Gemini AI API key
- `PORT`: Service port (default: 3001)

### Voice Options
Available voices for text-to-speech:
- `Kore` (default)
- `Aoede`
- `Charon`
- `Fenrir`
- `Kore`

## 🏗️ Architecture

```
Frontend (React) → Flask Backend → Node.js Gemini Service → Google Gemini AI
     ↓                    ↓                    ↓
  Voice Input         API Gateway         AI Processing
```

## 🛠️ Development

### Running in Development Mode
```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Start with auto-restart
npm run dev
```

### Testing
```bash
# Test voice-to-text
curl -X POST http://localhost:3001/voice-to-text \
  -H "Content-Type: application/json" \
  -d '{"audio":"base64-audio-data","mimeType":"audio/wav"}'

# Test chat
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How to grow tomatoes?","context":"farming"}'
```

## 🔒 Security Notes

- Keep your Google API key secure
- Use environment variables for sensitive data
- Implement rate limiting in production
- Add authentication for production deployment

## 📝 Troubleshooting

### Common Issues

1. **"GOOGLE_API_KEY not found"**
   - Set the environment variable with your API key
   - Restart the service after setting the variable

2. **"Port 3001 already in use"**
   - Kill existing processes: `lsof -ti:3001 | xargs kill -9`
   - Or change the port in the code

3. **"Voice conversion failed"**
   - Check if the audio data is properly base64 encoded
   - Ensure the mime type is correct
   - Verify Google API key is valid

### Logs
Check the console output for detailed error messages and processing logs.

## 🚀 Production Deployment

For production deployment:

1. Use PM2 for process management
2. Set up proper logging
3. Implement rate limiting
4. Add authentication
5. Use HTTPS
6. Set up monitoring and alerts

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start gemini-service.js --name "cropwise-gemini"
```
