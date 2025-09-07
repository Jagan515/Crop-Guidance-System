import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Mic,
  Image as ImageIcon,
  Send,
  Bot,
  User,
  Loader2,
  Languages,
  MessageSquare,
  Sparkles,
  Camera,
  MicOff
} from 'lucide-react';

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  chips?: string[];
  imageUrl?: string;
}

const sampleQuestions: string[] = [
  'Which crop should I plant this season?',
  'How do I improve soil health?',
  'Will it rain this week?',
  'Best fertilizer for tomatoes?',
  'What to do about leaf spots?'
];

const ChatAssistant: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: 'Hi! I am your farming assistant. Ask me about crops, soil, weather, or upload a plant image for disease help.'
    },
    {
      id: 'm2',
      role: 'assistant',
      cardTitle: 'Try asking:',
      chips: sampleQuestions
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addUserMessage = (text: string) => {
    const m: ChatMessage = { id: crypto.randomUUID(), role: 'user', text };
    setMessages(prev => [...prev, m]);
  };

  const addAssistantCard = (title: string, subtitle?: string, chips?: string[]) => {
    const m: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', cardTitle: title, cardSubtitle: subtitle, chips };
    setMessages(prev => [...prev, m]);
  };

  const addImageMessage = (url: string) => {
    const m: ChatMessage = { id: crypto.randomUUID(), role: 'user', imageUrl: url, text: 'Uploaded image' };
    setMessages(prev => [...prev, m]);
  };

  const handleSend = async (messageText?: string) => {
    const trimmed = (messageText ?? input).trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    if (!messageText) setInput('');
    setIsSending(true);

    try {
      // Call Node.js Gemini service for chat
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          context: 'farming'
        })
      });

      if (response.ok) {
        const data = await response.json();
        addAssistantCard('AI Response', data.response, [
          'More details',
          'Related topics',
          'Expert advice'
        ]);
      } else {
        // Fallback to mock response
        addAssistantCard('Suggested Crop: Tomato', 'High demand and suitable for your current weather.', [
          'Irrigation tips',
          'Fertilizer schedule',
          'Common diseases'
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addAssistantCard('Error', 'Something went wrong while connecting to the AI.');
    } finally {
      setIsSending(false);
    }
  };

  const handleChipClick = (q: string) => {
    setInput(q);
  };

  // Voice-to-text + auto-send to Gemini
  const convertVoiceToText = async (audioBlob: Blob): Promise<void> => {
    try {
      setIsProcessingVoice(true);
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Call Node.js Gemini service for transcription
      const response = await fetch('http://localhost:3001/voice-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: audioBlob.type
        })
      });
      
      if (!response.ok) {
        throw new Error('Voice conversion failed');
      }
      
      const data = await response.json();
      const userText = data.text || 'Could not understand audio';

      // Show user message
      addUserMessage(userText);

      // Auto-send to Gemini
      await handleSend(userText);
    } catch (error) {
      console.error('Voice conversion error:', error);
      addAssistantCard('Error', 'Sorry, I could not process your voice. Please try again.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await convertVoiceToText(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const onPickImage = () => {
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addImageMessage(url);
    setTimeout(() => {
      addAssistantCard('Possible Leaf Spot Detected', 'Consider using a copper-based fungicide and remove affected leaves.', [
        'Prevention tips',
        'Organic options',
        'When to consult expert'
      ]);
    }, 700);
  };

  const bubble = (m: ChatMessage) => {
    const isUser = m.role === 'user';
    return (
      <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
        <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm border ${
          isUser ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-800 border-gray-100'
        }`}>
          <div className="flex items-center mb-2">
            {isUser ? (
              <User className="h-4 w-4 mr-2 opacity-80" />
            ) : (
              <Bot className="h-4 w-4 mr-2 text-green-600" />
            )}
            <span className="text-xs opacity-80">{isUser ? 'You' : 'Assistant'}</span>
          </div>
          {m.text && <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>{m.text}</p>}
          {m.imageUrl && (
            <div className="mt-2 overflow-hidden rounded-lg">
              <img src={m.imageUrl} alt="uploaded" className="w-full h-48 object-cover" />
            </div>
          )}
          {m.cardTitle && (
            <div className={`mt-2 ${isUser ? 'bg-white/10' : 'bg-gray-50'} rounded-lg p-3`}>
              <div className="flex items-center mb-1">
                <MessageSquare className={`h-4 w-4 mr-2 ${isUser ? 'text-white' : 'text-green-600'}`} />
                <h4 className={`text-sm font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`}>{m.cardTitle}</h4>
              </div>
              {m.cardSubtitle && (
                <p className={`text-xs ${isUser ? 'text-green-50' : 'text-gray-600'}`}>{m.cardSubtitle}</p>
              )}
              {m.chips && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleChipClick(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        isUser ? 'bg-white/20 text-white border-white/30' : 'bg-white text-gray-700 border-gray-200'
                      } hover:opacity-90`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                  Chat & Voice Assistant
                </h1>
                <p className="text-sm text-gray-600">Ask in your language. Get simple answers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tips row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center text-sm text-gray-700"><Languages className="h-4 w-4 text-green-600 mr-2" /> Speak in Hindi, Tamil, Telugu, or English</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center text-sm text-gray-700"><Camera className="h-4 w-4 text-green-600 mr-2" /> Upload crop images for quick disease hints</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center text-sm text-gray-700"><MessageSquare className="h-4 w-4 text-green-600 mr-2" /> Tap a suggestion chip to auto-fill</div>
          </div>
        </div>

        {/* Chat area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[70vh]">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map(m => bubble(m))}
            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center space-x-2 bg-white border border-gray-100 px-3 py-2 rounded-xl">
                  <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleRecording}
                disabled={isProcessingVoice}
                className={`p-3 rounded-xl border transition-colors ${
                  isRecording 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : isProcessingVoice
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50`}
                aria-label="Voice input"
                title={isProcessingVoice ? "Processing voice..." : "Voice input"}
              >
                {isProcessingVoice ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-5 w-5 animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={onPickImage}
                className="p-3 rounded-xl border bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                aria-label="Upload image"
                title="Upload image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about crops, soil, weather…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={isSending}
                className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
