import { useState, useRef } from "react";
import axios from "axios";

export default function Recorder({ onNewNote, token }) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | recording | processing
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setStatus("processing");
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
          alert("Recording too short or empty. Please try again.");
          setStatus("idle");
          return;
        }

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const res = await axios.post("http://localhost:5000/api/notes", formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          onNewNote(res.data);
        } catch (err) {
          console.error(err);
          alert("Failed to process note. Check the server.");
        } finally {
          setStatus("idle");
        }
      };

      mediaRecorder.start(250);
      setRecording(true);
      setStatus("recording");
    } catch {
      alert("Microphone access denied. Please allow mic access and try again.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const statusLabel =
    status === "recording"
      ? "Recording..."
      : status === "processing"
      ? "Processing..."
      : "Tap to record";

  const statusColor =
    status === "recording"
      ? "text-red-500"
      : status === "processing"
      ? "text-blue-500"
      : "text-slate-400";

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 py-6 sm:py-10">
      {/* Waveform bars — visible only while recording */}
      <div className="flex items-center gap-1.5 h-9">
        {status === "recording" ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="wave-bar" />
          ))
        ) : (
          <div className="h-9" /> /* placeholder to keep layout stable */
        )}
      </div>

      {/* Mic button with pulse rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse rings — only when recording */}
        {status === "recording" && (
          <>
            <span className="mic-ring absolute w-[96px] h-[96px] sm:w-[120px] sm:h-[120px] rounded-full bg-red-400 opacity-0" />
            <span className="mic-ring-delay absolute w-[96px] h-[96px] sm:w-[120px] sm:h-[120px] rounded-full bg-red-400 opacity-0" />
          </>
        )}

        <button
          id="mic-btn"
          onClick={status === "idle" ? startRecording : status === "recording" ? stopRecording : undefined}
          disabled={status === "processing"}
          aria-label={status === "recording" ? "Stop recording" : "Start recording"}
          className={`
            relative z-10 w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full
            flex items-center justify-center
            shadow-xl transition-all duration-300 select-none
            focus:outline-none focus:ring-4 focus:ring-offset-2
            ${status === "recording"
              ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-105"
              : status === "processing"
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:ring-blue-300 cursor-pointer"
            }
          `}
        >
          {status === "processing" ? (
            /* Spinning arc for processing */
            <svg
              className="spin-slow w-10 h-10 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeDasharray="60 20" d="M12 2a10 10 0 1 0 10 10" />
            </svg>
          ) : status === "recording" ? (
            /* Stop square icon */
            <span className="w-7 h-7 rounded-md bg-white opacity-90" />
          ) : (
            /* Mic SVG */
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Status label */}
      <p className={`text-sm font-medium tracking-wide transition-colors duration-300 ${statusColor}`}>
        {statusLabel}
      </p>
    </div>
  );
}