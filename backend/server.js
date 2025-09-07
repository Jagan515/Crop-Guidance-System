import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
// import whisper from "openai-whisper"; // optional if using local STT

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const upload = multer({ dest: "uploads/" });
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// MOCK: STT function (replace with real Whisper or Google STT)
const speechToText = async (base64Audio) => {
  const mockResponses = [
    "Which crop should I plant this season?",
    "How do I improve soil health?",
    "Will it rain this week?",
  ];
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

// ---------------- Voice-to-Text Endpoint ----------------
app.post("/voice-to-text", async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ error: "No audio provided" });

    const transcribedText = await speechToText(audio);
    
    res.json({
      text: transcribedText,
      confidence: 0.95,
      language: 'en',
      processingTime: '1.2s'
    });
  } catch (error) {
    console.error("Voice-to-text error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Chat Endpoint ----------------
app.post("/chat", async (req, res) => {
  try {
    const { message, context = 'farming' } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are a helpful farming assistant. Answer this question about ${context}: ${message}.
    Provide practical, actionable advice for farmers. Keep responses concise and easy to understand.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Health Check ----------------
app.get("/health", (req, res) => {
  res.json({
    status: 'ok',
    service: 'gemini-ai-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Voice chatbot backend running on http://localhost:${PORT}`)
);
