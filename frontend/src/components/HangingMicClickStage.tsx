import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MoveDown, Square, Volume2, Mic, ArrowRight } from 'lucide-react';
import { GraffitiMicVector } from './GraffitiMicVector';
import { pcmToWavBlob } from '../utils/audioWavEncoder';

interface HangingMicClickStageProps {
  isRevealed: boolean;
  onMicClick: () => void;
  onTranscriptReady: (transcript: string, audioBlob?: Blob) => void;
  isListening: boolean;
}

export const HangingMicClickStage: React.FC<HangingMicClickStageProps> = ({
  isRevealed,
  onMicClick,
  onTranscriptReady,
  isListening,
}) => {
  const [liveTranscript, setLiveTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioDetected, setAudioDetected] = useState(false);

  const transcriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wasListeningRef = useRef<boolean>(false);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = 'en-IN';

        recognizer.onresult = (event: any) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + ' ';
          }
          const clean = fullText.trim();
          if (clean) {
            transcriptRef.current = clean;
            setLiveTranscript(clean);
          }
        };

        recognizer.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e?.error || e);
        };

        recognitionRef.current = recognizer;
      } catch (err) {
        console.warn("Speech recognition init error:", err);
      }
    }
  }, []);

  // Audio capture lifecycle
  useEffect(() => {
    if (isListening) {
      wasListeningRef.current = true;
      transcriptRef.current = '';
      setLiveTranscript('');
      setAudioDetected(false);
      startLiveAudioStream();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } else {
      if (wasListeningRef.current) {
        wasListeningRef.current = false;
        stopLiveAudioStream();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
      }
    }
  }, [isListening]);

  // Real-time Microphone Audio Capture with direct 16kHz PCM Buffer & Analyser
  const startLiveAudioStream = async () => {
    try {
      pcmChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.35;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        // ScriptProcessor to capture raw PCM float32 samples directly
        const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
        scriptNode.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Copy buffer
          pcmChunksRef.current.push(new Float32Array(inputData));
        };
        source.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        scriptNodeRef.current = scriptNode;

        trackMicrophoneVolume();
      }
    } catch (err) {
      console.warn("Microphone access notice:", err);
    }
  };

  const trackMicrophoneVolume = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      if (!isListening) return;
      animFrameRef.current = requestAnimationFrame(update);
      analyser.getByteFrequencyData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      const avg = sum / (data.length * 255);
      setVolumeLevel(avg);

      if (avg > 0.04) {
        setAudioDetected(true);
      }
    };
    update();
  };

  const stopLiveAudioStream = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Merge PCM chunks into one Float32Array
    let totalLength = 0;
    for (const chunk of pcmChunksRef.current) {
      totalLength += chunk.length;
    }
    const mergedPcm = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of pcmChunksRef.current) {
      mergedPcm.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert raw PCM to a standardized 16kHz WAV Blob
    let wavBlob: Blob | undefined;
    if (totalLength > 1600) {
      // More than 100ms of audio recorded
      wavBlob = pcmToWavBlob(mergedPcm, 16000);
    }

    if (scriptNodeRef.current) {
      try {
        scriptNodeRef.current.disconnect();
      } catch (e) {}
      scriptNodeRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const finalTranscript = (transcriptRef.current || liveTranscript).trim();
    onTranscriptReady(finalTranscript, wavBlob);
    setVolumeLevel(0);
  };

  // Mic anchor coordinates
  const mountRight = 240;
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);

  // Handle Drag Pulling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - startYRef.current;
    // Allow pulling down between 0 and 160px
    setDragY(Math.max(0, Math.min(160, delta)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (dragY > 35) {
      // User pulled down significantly -> toggle mic listening
      onMicClick();
    }
    setDragY(0);
  };

  // Base Y + Drag Y
  const baseMicY = isListening ? 190 : 75;
  const currentMicY = isDragging ? (isListening ? 190 : 75) + dragY : baseMicY;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-visible">
      {/* ======================================================== */}
      {/* 1. TOP CEILING MOUNT DISH (Exact Reference Cutout)        */}
      {/* ======================================================== */}
      <div
        style={{ right: `${mountRight - 65}px`, top: 0, width: '130px', height: '36px' }}
        className="absolute z-10 pointer-events-auto flex items-center justify-center filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
      >
        <img
          src="/assets/vintage_ceiling_mount.png"
          alt="Ceiling Mount"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ======================================================== */}
      {/* 2. DYNAMIC STRETCHING BRAIDED CABLE (Exact Reference Tile) */}
      {/* ======================================================== */}
      <div
        style={{
          right: `${mountRight - 5}px`,
          top: '30px',
          height: `${Math.max(0, currentMicY - 24)}px`,
          width: '10px',
          backgroundImage: "url('/assets/vintage_cable_tile.png')",
          backgroundRepeat: 'repeat-y',
          backgroundSize: '10px auto',
          backgroundPosition: 'center top',
        }}
        className="absolute z-0 pointer-events-none filter drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
      />

      {/* ======================================================== */}
      {/* 3. LIVE SPEECH BALLOON & AUDIO VU EQUALIZER              */}
      {/* ======================================================== */}
      {isListening && (
        <div
          style={{
            right: `${mountRight + 110}px`,
            top: `${currentMicY - 30}px`,
          }}
          className="absolute pointer-events-auto w-80 p-5 bg-[#FFFDF8] text-slate-900 border-3 border-black rounded-3xl shadow-[8px_8px_0px_#000] animate-slide-up z-30"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-[#FF2A55] text-white border border-black">
                <Mic className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="text-xs font-black uppercase text-[#FF2A55] font-display tracking-wide">
                Live Voice Stream
              </span>
            </div>

            <button
              onClick={onMicClick}
              className="px-3 py-1 rounded-lg bg-[#00F5D4] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center space-x-1 hover:bg-[#FFE500] cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Done Speaking</span>
            </button>
          </div>

          {/* Real-Time Live Transcribed Text */}
          <div className="p-3 bg-black/5 rounded-xl border border-black/20 min-h-[44px]">
            <p className="text-xs font-bold text-slate-900 leading-relaxed font-sans">
              {liveTranscript || (
                <span className="text-slate-400 font-medium italic">
                  🎙️ Speak your question now into your microphone... (English or Hindi)
                </span>
              )}
            </p>
          </div>

          {/* Real-time Audio VU Meter */}
          <div className="mt-3 pt-2.5 border-t-2 border-black flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className={`w-4 h-4 ${volumeLevel > 0.04 ? 'text-[#FF2A55] animate-bounce' : 'text-slate-400'}`} />
              <div className="flex items-end space-x-1 h-5">
                {[0.1, 0.25, 0.4, 0.6, 0.8].map((threshold, idx) => {
                  const isActive = volumeLevel >= threshold * 0.35;
                  return (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-sm border border-black transition-all ${
                        isActive
                          ? idx > 3
                            ? 'bg-[#FF2A55] h-5'
                            : idx > 1
                            ? 'bg-[#FFE500] h-4'
                            : 'bg-[#00F5D4] h-3'
                          : 'bg-slate-200 h-1.5'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <span className="text-[10px] font-mono-data font-black text-slate-700">
              {audioDetected ? "⚡ Audio Active" : "Waiting for voice..."}
            </span>
          </div>

          {/* Direct submit button if words detected */}
          {liveTranscript.trim() && (
            <button
              onClick={onMicClick}
              className="mt-2.5 w-full py-1.5 bg-[#FFE500] text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-center space-x-1 shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-[#FF2A55] hover:text-white transition-colors"
            >
              <span>Submit &quot;{liveTranscript.slice(0, 26)}...&quot;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. HANGING RETRO STUDIO MICROPHONE (Click or Pull/Drag)   */}
      {/* ======================================================== */}
      <div
        style={{
          right: `${mountRight - 67}px`,
          top: `${currentMicY}px`,
          transition: isDragging ? 'none' : 'top 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={onMicClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute z-20 pointer-events-auto flex flex-col items-center cursor-grab active:cursor-grabbing group touch-none"
      >
        {/* Pulsing Helper Prompt in Initial Pitch Black state */}
        {!isRevealed && !isListening && (
          <div className="absolute -top-12 px-4 py-1.5 bg-[#FFE500] text-black font-black text-xs border-2 border-black rounded-full shadow-[4px_4px_0px_#000] whitespace-nowrap flex items-center space-x-1.5 animate-bounce font-display">
            <Sparkles className="w-3.5 h-3.5 fill-current text-black" />
            <span>PULL OR CLICK MIC TO ENTER GOA</span>
            <MoveDown className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}

        {isRevealed && !isListening && (
          <div className="absolute -top-10 px-3.5 py-1 bg-[#00F5D4] text-black font-black text-[11px] border-2 border-black rounded-full shadow-[3px_3px_0px_#000] whitespace-nowrap flex items-center space-x-1 font-display">
            <span>PULL DOWN TO SPEAK</span>
            <MoveDown className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}

        {/* Vector Illustrated Retro Yellow & Purple Microphone */}
        <div className="group-hover:scale-105 group-active:scale-95 transition-transform duration-150">
          <GraffitiMicVector isListening={isListening} volumeLevel={volumeLevel} />
        </div>
      </div>
    </div>
  );
};
