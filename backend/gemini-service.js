const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBUYTDhZ_mood6TFXAZbBxfizA_liNPy0Y');

// Voice-to-text endpoint
app.post('/voice-to-text', async (req, res) => {
  try {
    const { audio, mimeType = 'audio/wav' } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Decode base64 audio
    const audioBuffer = Buffer.from(audio, 'base64');
    
    // For demo purposes, return mock responses
    // In production, you would use Gemini AI for actual voice-to-text conversion
    const mockResponses = [
      "Which crop should I plant this season?",
      "How do I improve soil health?",
      "Will it rain this week?",
      "Best fertilizer for tomatoes?",
      "What to do about leaf spots?",
      "How much water does rice need?",
      "When should I harvest wheat?",
      "How to control pests in cotton?",
      "What is the best time to sow maize?",
      "How to increase crop yield?",
      "Tell me about organic farming",
      "What are the symptoms of plant disease?",
      "How to prepare soil for planting?",
      "Best irrigation methods for crops?",
      "How to store harvested crops?"
    ];
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return random farming question for demo
    const detectedText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    res.json({
      text: detectedText,
      confidence: 0.95,
      language: 'en',
      processingTime: '1.2s'
    });
    
  } catch (error) {
    console.error('Voice-to-text error:', error);
    res.status(500).json({ 
      error: 'Voice conversion failed',
      message: error.message 
    });
  }
});

// Text-to-speech endpoint using Gemini
app.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Use Gemini AI for text-to-speech
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const result = await model.generateContent({
      contents: [{ 
        parts: [{ 
          text: `Say cheerfully: ${text}` 
        }] 
      }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    });

    const audioData = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error('No audio data received from Gemini');
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length
    });
    
    res.send(audioBuffer);
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Text-to-speech conversion failed',
      message: error.message 
    });
  }
});

// Chat with Gemini AI
app.post('/chat', async (req, res) => {
  try {
    const { message, context = 'farming' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `You are a helpful farming assistant. Answer this question about ${context}: ${message}
    
    Provide practical, actionable advice for farmers. Keep responses concise and easy to understand.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      response: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Chat failed',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'gemini-ai-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gemini AI Service running on port ${PORT}`);
  console.log(`📡 Voice-to-text: http://localhost:${PORT}/voice-to-text`);
  console.log(`🔊 Text-to-speech: http://localhost:${PORT}/text-to-speech`);
  console.log(`💬 Chat: http://localhost:${PORT}/chat`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = app;
