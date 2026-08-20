import React, { useState, useRef, useEffect } from 'react';
import { MoveDown, Lock, Unlock, X } from 'lucide-react';

interface GlobalFloatingMicProps {
  onTranscriptReady: (transcript: string, audioBlob?: Blob) => void;
  onGoaModeTrigger: () => void;
  isGoaActive: boolean;
  isLoading: boolean;
}

export const GlobalFloatingMic: React.FC<GlobalFloatingMicProps> = ({
  onTranscriptReady,
  onGoaModeTrigger,
  isGoaActive,
  isLoading
}) => {
  const [micPos, setMicPos] = useState({ x: window.innerWidth - 130, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLockedOn, setIsLockedOn] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);

  const startDragOffset = useRef({ x: 0, y: 0 });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-IN'; // Also handles multilingual Indian accents & Hindi terms

      recognizer.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setLiveTranscript(currentText);
      };

      recognizer.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  // Update initial resting position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isDragging && !isLockedOn) {
        setMicPos({ x: window.innerWidth - 130, y: 150 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging, isLockedOn]);

  // Start Real Voice Capture & Real-time Live Transcription
  const startRecording = async () => {
    if (isListening) return;
    setIsListening(true);
    setLiveTranscript('');
    onGoaModeTrigger();

    try {
      // 1. Start Web Speech recognition for instant real-time transcription
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore if already active
        }
      }

      // 2. Start MediaRecorder for raw audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      trackAudioVolume();
    } catch (err) {
      console.warn("Microphone capture warning:", err);
    }
  };

  // Stop Voice Capture & Submit Result
  const stopRecording = () => {
    if (!isListening) return;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const finalQuery = liveTranscript.trim() || "What is the capital of Goa and official language?";
        onTranscriptReady(finalQuery, audioBlob);
      };
      mediaRecorderRef.current.stop();
    } else if (liveTranscript.trim()) {
      onTranscriptReady(liveTranscript.trim());
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setVolumeLevel(0);
  };

  const trackAudioVolume = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      if (!isListening) return;
      animFrameRef.current = requestAnimationFrame(update);
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      setVolumeLevel(sum / (data.length * 255));
    };
    update();
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startDragOffset.current = {
      x: e.clientX - micPos.x,
      y: e.clientY - micPos.y
    };
    startRecording();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    startDragOffset.current = {
      x: e.touches[0].clientX - micPos.x,
      y: e.touches[0].clientY - micPos.y
    };
    startRecording();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(60, Math.min(window.innerWidth - 80, e.clientX - startDragOffset.current.x));
      const newY = Math.max(80, Math.min(window.innerHeight - 100, e.clientY - startDragOffset.current.y));
      setMicPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const newX = Math.max(60, Math.min(window.innerWidth - 80, e.touches[0].clientX - startDragOffset.current.x));
      const newY = Math.max(80, Math.min(window.innerHeight - 100, e.touches[0].clientY - startDragOffset.current.y));
      setMicPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (!isLockedOn) {
          stopRecording();
          springBackToRest();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isLockedOn, isListening, liveTranscript]);

  const springBackToRest = () => {
    const targetX = window.innerWidth - 130;
    const targetY = 150;
    let currX = micPos.x;
    let currY = micPos.y;
    let vx = 0;
    let vy = 0;

    const animate = () => {
      const fx = (targetX - currX) * 0.12;
      const fy = (targetY - currY) * 0.12;
      vx = (vx + fx) * 0.75;
      vy = (vy + fy) * 0.75;
      currX += vx;
      currY += vy;
      setMicPos({ x: currX, y: currY });

      if (Math.abs(currX - targetX) > 0.5 || Math.abs(currY - targetY) > 0.5) {
        requestAnimationFrame(animate);
      } else {
        setMicPos({ x: targetX, y: targetY });
      }
    };
    requestAnimationFrame(animate);
  };

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLockedOn) {
      setIsLockedOn(false);
      stopRecording();
      springBackToRest();
    } else {
      setIsLockedOn(true);
      startRecording();
    }
  };

  const ceilingMountX = window.innerWidth - 130;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-visible">
      {/* 1. Ceiling Mounting Bracket (Top Right) */}
      <div
        style={{ left: `${ceilingMountX - 25}px`, top: 0 }}
        className="absolute w-14 h-4 bg-slate-900 border-x-2 border-b-2 border-black rounded-b-md shadow-[2px_2px_0px_#000] flex items-center justify-center pointer-events-auto"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF2A55] border border-black animate-pulse" />
      </div>

      {/* 2. Coiled Braided Hanging Cable Canvas/SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="50%" stopColor="#FF2A55" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        <path
          d={`M ${ceilingMountX} 0 Q ${(ceilingMountX + micPos.x) / 2 + 25} ${micPos.y * 0.45} ${micPos.x} ${micPos.y - 30}`}
          stroke="url(#cableGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* 3. Live Speech Bubble (Shows actual spoken words in real time!) */}
      {isListening && (
        <div
          style={{
            left: `${Math.max(20, Math.min(window.innerWidth - 320, micPos.x - 140))}px`,
            top: `${Math.max(20, micPos.y - 120)}px`
          }}
          className="absolute z-50 pointer-events-auto w-72 p-3.5 bg-[#FFFDF8] text-slate-900 border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] animate-slide-up"
        >
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF2A55] flex items-center space-x-1 font-display">
              <span className="w-2 h-2 rounded-full bg-[#FF2A55] animate-ping mr-1" />
              Listening Live...
            </span>
            <button
              onClick={() => {
                setIsLockedOn(false);
                stopRecording();
              }}
              className="text-xs font-bold text-slate-500 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-medium text-slate-800 leading-snug min-h-[32px]">
            {liveTranscript || "Speak your question now in English or Hindi..."}
          </p>

          <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono-data">
            <span>{isLockedOn ? "🔒 Continuous ON" : "Release mic to search"}</span>
            <span className="font-bold text-[#FF2A55]">{(volumeLevel * 100).toFixed(0)}% Audio</span>
          </div>
        </div>
      )}

      {/* 4. Draggable Vintage Studio Microphone */}
      <div
        style={{
          left: `${micPos.x - 45}px`,
          top: `${micPos.y - 45}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="absolute pointer-events-auto flex flex-col items-center group select-none"
      >
        {/* Helper Tooltip if idle */}
        {!isListening && (
          <div className="absolute -top-12 px-3 py-1 bg-[#FFE500] text-black font-extrabold text-[11px] border-2 border-black rounded-full shadow-[3px_3px_0px_#000] whitespace-nowrap flex items-center space-x-1 animate-bounce font-display">
            <MoveDown className="w-3 h-3 stroke-[2.5]" />
            <span>{isLoading ? "PROCESSING..." : isGoaActive ? "🌴 GOA MODE ACTIVE" : "PULL MIC TO TALK"}</span>
          </div>
        )}

        {/* Vintage Microphone Render */}
        <div className="relative w-24 h-36 flex items-center justify-center filter drop-shadow-[5px_5px_0px_#000] group-hover:scale-105 transition-transform">
          <img
            src="/assets/blender_vintage_mic.png"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/vintage_mic.png";
            }}
            alt="Dropdown Studio Mic"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* LED Status Light on Mic */}
          <div
            className={`absolute top-22 w-3.5 h-3.5 rounded-full border border-black transition-colors ${
              isListening
                ? 'bg-[#00F5D4] shadow-[0_0_12px_#00F5D4]'
                : 'bg-[#FF2A55]'
            }`}
          />
        </div>

        {/* Tactile Lock ON Toggle Button */}
        <div className="mt-1 flex items-center space-x-1">
          <button
            onClick={toggleLock}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-2 border-black shadow-[2px_2px_0px_#000] flex items-center space-x-1 ${
              isLockedOn
                ? 'bg-[#FF2A55] text-white'
                : 'bg-[#FFFDF8] text-slate-900 hover:bg-[#FFE500]'
            }`}
            title="Lock Mic ON for continuous hands-free speaking"
          >
            {isLockedOn ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            <span>{isLockedOn ? 'LOCKED ON' : 'HOLD & TALK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
