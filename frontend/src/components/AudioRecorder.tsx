import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, ArrowRight, Sliders } from 'lucide-react';
import { ThreeAcousticCore } from './ThreeAcousticCore';
import { VUMeter } from './VUMeter';
import { Card3D } from './Card3D';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, filename: string) => void;
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
  activeProvider: string;
  theme: 'amber' | 'cyan' | 'emerald';
  isNerdMode: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onTextSubmit,
  isLoading,
  activeProvider,
  theme,
  isNerdMode
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const samplePrompts = [
    { label: "🌴 Goa Capital & Language", text: "What is the capital of Goa and what is the official language?", desc: "Ask about Goa's capital & culture" },
    { label: "🇮🇳 गोवा की राजधानी (हिंदी)", text: "गोवा की राजधानी क्या है और आधिकारिक भाषा कौन सी है?", desc: "Ask in Hindi language" },
    { label: "⚡ How Fast Is Search?", text: "How does HNSW indexing enable sub-10ms vector search?", desc: "Test speed explanation" },
    { label: "🛡️ Off-Topic Cake Test", text: "What is the best secret recipe to bake a chocolate cake?", desc: "See how it rejects off-topic queries" },
  ];

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
      setAudioLevel(0);
      setFrequencyData(null);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onAudioRecorded(audioBlob, `voice_${Date.now()}.wav`);
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      trackAudioSpectrum();
    } catch (err) {
      console.warn("Using simulated audio recording:", err);
      simulateMockRecording();
    }
  };

  const simulateMockRecording = () => {
    setIsRecording(true);
    let count = 0;
    const simInterval = setInterval(() => {
      setAudioLevel(Math.random() * 0.7 + 0.2);
      count++;
      if (count > 20) {
        clearInterval(simInterval);
        setIsRecording(false);
        const mockBlob = new Blob([new Uint8Array(2048)], { type: 'audio/wav' });
        onAudioRecorded(mockBlob, 'simulated_voice.wav');
      }
    }, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const trackAudioSpectrum = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(update);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / (dataArray.length * 255);
      setAudioLevel(avg);
      setFrequencyData(new Uint8Array(dataArray));
    };

    update();
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onTextSubmit(textInput.trim());
      setTextInput('');
    }
  };

  return (
    <Card3D className="p-6 space-y-5 crt-scanlines">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-amber-400 shadow-inner">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide font-display">
              {isNerdMode ? "ACOUSTIC INGESTION CONSOLE MK-III" : "Ask Goa Voice AI"}
            </h2>
            <p className="text-xs text-slate-400">
              {isNerdMode
                ? `Engine: ${activeProvider.toUpperCase()} • Sub-200ms Active`
                : "Speak in English or Hindi, or type your question below"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono-data text-emerald-400 font-bold">
            {isNerdMode ? "ONLINE" : "Ready"}
          </span>
        </div>
      </div>

      {/* 3D Holographic Core (Only in Nerd Mode) OR Friendly Audio Wave in Simple Mode */}
      {isNerdMode ? (
        <div className="relative rounded-2xl bg-black/70 border border-white/[0.08] p-3 overflow-hidden shadow-2xl">
          <div className="absolute top-2 left-3 text-[10px] font-mono-data text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Interactive 3D Neural Constellation</span>
          </div>

          <ThreeAcousticCore
            isRecording={isRecording}
            isLoading={isLoading}
            theme={theme}
            audioFrequencyData={frequencyData}
          />

          <div className="mt-2">
            <VUMeter level={audioLevel} isActive={isRecording} theme={theme} />
          </div>
        </div>
      ) : (
        /* Friendly Simple Mode Recording Deck */
        <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col items-center justify-center space-y-4 text-center">
          <div className="text-xs text-slate-300">
            {isRecording ? "🔴 Listening to your voice... Press Stop when finished" : "Click the button below to start speaking"}
          </div>

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="btn-hardware p-6 rounded-full text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform disabled:opacity-40"
              title="Click to speak"
            >
              <Mic className="w-8 h-8 stroke-[2.2]" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn-hardware p-6 rounded-full text-rose-400 bg-rose-950/60 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse"
              title="Click to stop"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
          )}

          {isRecording && (
            <div className="text-xs font-mono-data text-rose-400 font-bold">
              Recording in progress: {recordingTime}s
            </div>
          )}
        </div>
      )}

      {/* Manual Question Input */}
      <form onSubmit={handleSubmitText} className="flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={isNerdMode ? "Enter query text directly into telemetry stream..." : "Or type your question here (English or Hindi)..."}
          className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans shadow-inner"
          disabled={isLoading || isRecording}
        />
        <button
          type="submit"
          disabled={isLoading || isRecording || !textInput.trim()}
          className="btn-hardware px-5 py-3 rounded-xl text-xs font-bold text-amber-400 flex items-center space-x-2 disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          <span>{isNerdMode ? "Transmit" : "Ask"}</span>
        </button>
      </form>

      {/* Suggested Questions */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="text-[11px] font-medium text-slate-400">
          💡 Try asking these questions:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onTextSubmit(p.text)}
              disabled={isLoading || isRecording}
              className="btn-hardware p-2.5 text-left text-xs font-sans text-slate-300 hover:text-white rounded-xl flex items-center justify-between"
            >
              <span className="font-medium truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Card3D>
  );
};
