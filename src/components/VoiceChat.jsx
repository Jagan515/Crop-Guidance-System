import React, { useState } from "react";
import axios from "axios";

const VoiceChat = () => {
  const [response, setResponse] = useState("");
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      setRecording(false);
      const blob = new Blob(chunks, { type: "audio/wav" });
      const base64Audio = await blobToBase64(blob);

      const res = await axios.post("http://localhost:3001/voice-chat", {
        audio: base64Audio,
      });

      setResponse(`You said: ${res.data.originalText}\nAI: ${res.data.response}`);
      chunks = [];
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000); // record 5 sec
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  return (
    <div style={{ padding: 20 }}>
      <button onClick={startRecording} disabled={recording}>
        {recording ? "Recording..." : "Talk to AI"}
      </button>
      <pre>{response}</pre>
    </div>
  );
};

export default VoiceChat;
