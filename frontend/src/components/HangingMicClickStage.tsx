import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MoveDown, Square, Volume2, Mic, ArrowRight } from 'lucide-react';
import { pcmToWavBlob, mergePcmChunks, resamplePcm } from '../utils/audioWavEncoder';
import { SUPPORTED_LANGUAGES } from './LanguagePickerModal';

interface HangingMicClickStageProps {
  isRevealed: boolean;
  onMicClick: () => void;
  onTranscriptReady: (transcript: string, audioBlob?: Blob) => void;
  isListening: boolean;
  language?: string;
}

const SPEECH_LANG_MAP: Record<string, string> = {
  'auto': 'en-IN',
  'hi': 'hi-IN',
  'hinglish': 'hi-IN',
  'en': 'en-IN',
  'kok': 'kok-IN',
  'mr': 'mr-IN',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'gu': 'gu-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'pa': 'pa-IN',
  'or': 'or-IN',
  'as': 'as-IN',
  'ne': 'ne-NP',
};

export const HangingMicClickStage: React.FC<HangingMicClickStageProps> = ({
  isRevealed,
  onMicClick,
  onTranscriptReady,
  isListening,
  language = 'en',
}) => {
  const [liveTranscript, setLiveTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioDetected, setAudioDetected] = useState(false);

  // Pendulum Physics States
  const [swayAngle, setSwayAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const transcriptRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const physicsAnimRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wasListeningRef = useRef<boolean>(false);
  const suppressClickRef = useRef<boolean>(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  // 1. Web Speech Language sync
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = SPEECH_LANG_MAP[language] || 'en-IN';
    }
  }, [language]);

  // 2. Continuous Harmonic Pendulum Sway Physics
  useEffect(() => {
    let currentAngle = 0;

    const updatePhysics = (timestamp: number) => {
      if (!isDragging) {
        if (isListening) {
          // Subtle, steady micro-sway when recording
          currentAngle = Math.sin(timestamp * 0.0015) * 1.5;
        } else {
          // Relaxed coastal breeze pendulum sway
          currentAngle = Math.sin(timestamp * 0.0018) * 3.5;
        }
        setSwayAngle(currentAngle);
      }
      physicsAnimRef.current = requestAnimationFrame(updatePhysics);
    };

    physicsAnimRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (physicsAnimRef.current) cancelAnimationFrame(physicsAnimRef.current);
    };
  }, [isDragging, isListening]);

  // 3. Audio capture lifecycle
  useEffect(() => {
    if (isListening) {
      wasListeningRef.current = true;
      transcriptRef.current = '';
      setLiveTranscript('');
      setAudioDetected(false);
      startLiveAudioStream();
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

  const startLiveAudioStream = async () => {
    pcmChunksRef.current = [];
    transcriptRef.current = '';
    setLiveTranscript('');
    setAudioDetected(false);

    // 1. Initialize Web Speech Recognition FIRST (synchronously on user gesture)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }

        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.maxAlternatives = 1;
        
        let targetLang = SPEECH_LANG_MAP[language];
        if (!targetLang || language === 'auto') {
          targetLang = navigator.language || 'en-IN';
        }
        recognizer.lang = targetLang;

        recognizer.onresult = (event: any) => {
          let interimText = '';
          let finalText = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript + ' ';
            } else {
              interimText += event.results[i][0].transcript + ' ';
            }
          }
          const currentText = (finalText + interimText).trim();
          if (currentText) {
            transcriptRef.current = currentText;
            setLiveTranscript(currentText);
            setAudioDetected(true);
          }
        };

        recognizer.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e?.error || e);
        };

        recognizer.onend = () => {
          if (wasListeningRef.current) {
            try { recognizer.start(); } catch (e) {}
          }
        };

        recognizer.start();
        recognitionRef.current = recognizer;
      } catch (err) {
        console.warn("Speech recognition start notice:", err);
      }
    }

    // 2. Microphone stream for PCM audio & volume meter
    try {
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
        const audioCtx = new AudioCtxClass();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        audioCtxRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.2;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          pcmChunksRef.current.push(new Float32Array(inputData));
        };
        source.connect(processor);
        processor.connect(audioCtx.destination);
        processorRef.current = processor;

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
      setVolumeLevel(Math.min(1.0, avg * 2.5));

      if (avg > 0.015) {
        setAudioDetected(true);
      }
    };
    update();
  };

  const stopLiveAudioStream = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const audioCtx = audioCtxRef.current;
    const pcmChunks = pcmChunksRef.current;
    const sourceSampleRate = audioCtx?.sampleRate || 44100;

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    let wavBlob: Blob | undefined;
    if (pcmChunks.length > 0) {
      const mergedSamples = mergePcmChunks(pcmChunks);
      const resampledSamples = resamplePcm(mergedSamples, sourceSampleRate, 16000);
      wavBlob = pcmToWavBlob(resampledSamples, 16000);
    }

    const finalTranscript = (transcriptRef.current || liveTranscript).trim();
    onTranscriptReady(finalTranscript, wavBlob);
    setVolumeLevel(0);
  };

  // 4. Drag & Physical Pendulum Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = Math.max(0, Math.min(100, e.clientY - startPosRef.current.y));
    setDragOffset({ x: dx, y: dy });

    // Calculate angular deflection from horizontal drag
    const angle = Math.max(-20, Math.min(20, dx * 0.15));
    setSwayAngle(angle);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    // If pulled down meaningfully, toggle voice
    if (dragOffset.y > 30 || Math.abs(dragOffset.x) > 40) {
      suppressClickRef.current = true;
      onMicClick();
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMicActivate = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.preventDefault();
      return;
    }
    onMicClick();
  };

  // Base hanging cable length
  const baseCableHeight = isListening ? 160 : 75;
  const cableHeight = isDragging ? baseCableHeight + dragOffset.y * 0.4 : baseCableHeight;
  const pulseScale = isListening ? Math.min(1.12, 1 + volumeLevel * 0.25) : 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-visible">
      {/* ======================================================== */}
      {/* 1. TOP CEILING MOUNT DISH (Anchored at Top Center)       */}
      {/* ======================================================== */}
      <div
        style={{ left: '50%', transform: 'translateX(-50%)', top: 0, width: '140px', height: '36px' }}
        className="absolute z-20 pointer-events-auto flex items-center justify-center filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
      >
        <img
          src="/assets/vintage_ceiling_mount.png"
          alt="Ceiling Mount"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. UNIFIED PENDULUM ASSEMBLY (Wire + Mic Capsule in ONE Transform Tree)  */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '30px', // Anchored right at ceiling dish collar
          transformOrigin: '50% 0px', // PIVOTS CLEANLY FROM CEILING
          transform: `translateX(-50%) rotate(${swayAngle}deg)`,
          transition: isDragging ? 'none' : 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing z-20 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleMicActivate}
      >
        {/* Pulsing Helper Prompt */}
        {!isRevealed && !isListening && (
          <div className="absolute -top-3 px-4 py-1.5 bg-[#FFE500] text-black font-black text-xs border-2 border-black rounded-full shadow-[4px_4px_0px_#000] whitespace-nowrap flex items-center space-x-1.5 animate-bounce font-display z-30">
            <Sparkles className="w-3.5 h-3.5 fill-current text-black" />
            <span>PULL OR CLICK MIC TO ENTER GOA</span>
            <MoveDown className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}

        {isRevealed && !isListening && (
          <div className="absolute -top-2 px-3.5 py-1 bg-[#00F5D4] text-black font-black text-[11px] border-2 border-black rounded-full shadow-[3px_3px_0px_#000] whitespace-nowrap flex items-center space-x-1 font-display z-30">
            <span>PULL DOWN TO SPEAK</span>
            <MoveDown className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}

        {/* 2A. HANGING BRAIDED CABLE */}
        <div
          style={{
            width: '8px',
            height: `${cableHeight}px`,
            backgroundImage: "url('/assets/vintage_cable_tile.png')",
            backgroundRepeat: 'repeat-y',
            backgroundSize: '8px auto',
            transition: isDragging ? 'none' : 'height 900ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          className="filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.85)] pointer-events-none"
        />

        {/* 2B. MICROPHONE CAPSULE (Seamlessly locked into the cable bottom) */}
        <div
          style={{
            width: '134px',
            marginTop: '-12px', // Deep physical overlap into the top purple connector collar
            transform: `scale(${pulseScale})`,
            transformOrigin: '49% 12px',
            filter: isListening
              ? 'drop-shadow(0 0 30px #00F5D4) drop-shadow(0 0 60px rgba(0, 245, 212, 0.6)) drop-shadow(8px 8px 0px rgba(0,0,0,0.9))'
              : 'drop-shadow(8px 8px 0px rgba(0,0,0,0.85))',
          }}
          className="relative group transition-all duration-300 pointer-events-auto"
        >
          {/* Ambient Glowing Aura when Recording */}
          {isListening && (
            <div
              style={{ transform: `scale(${1.2 + volumeLevel * 1.5})` }}
              className="absolute -inset-4 rounded-full bg-[#00F5D4]/25 blur-xl transition-transform duration-75 pointer-events-none"
            />
          )}

          <img
            src="/assets/vintage_mic_capsule.png"
            alt="Vintage Studio Microphone"
            className="w-full h-auto object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LIVE SPEECH BALLOON & AUDIO VU EQUALIZER              */}
      {/* ======================================================== */}
      {isListening && (
        <div
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            top: `${baseCableHeight + 175}px`,
          }}
          className="absolute pointer-events-auto w-full max-w-lg px-4 sm:px-0 z-40 animate-slide-up"
        >
          <div className="p-5 sm:p-6 bg-[#FFFDF8] text-slate-900 border-3 border-black rounded-3xl shadow-[8px_8px_0px_#000]">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5 mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[#FF2A55] text-white border border-black animate-pulse">
                  <Mic className="w-4 h-4 fill-current" />
                </span>
                <div>
                  <span className="text-xs font-black uppercase text-[#FF2A55] font-display tracking-wide block leading-tight">
                    Live Speech Stream
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Language: {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'Auto'}
                  </span>
                </div>
              </div>

              <button
                onClick={onMicClick}
                className="px-3.5 py-1.5 rounded-xl bg-[#00F5D4] text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center space-x-1.5 hover:bg-[#FFE500] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Done Speaking</span>
              </button>
            </div>

            {/* Real-Time Live Transcribed Text (Large High-Visibility Display) */}
            <div className="p-4 bg-black/5 rounded-2xl border-2 border-black/15 min-h-[72px] flex items-center">
              <p className="text-sm sm:text-base font-extrabold text-slate-950 leading-snug font-sans w-full flex items-center flex-wrap">
                {liveTranscript ? (
                  <>
                    <span className="text-slate-950 font-black">
                      &ldquo;{liveTranscript}&rdquo;
                    </span>
                    <span className="inline-block w-2 h-4 bg-[#FF2A55] ml-1.5 animate-pulse rounded-xs" />
                  </>
                ) : (
                  <span className="text-slate-500 font-semibold italic text-xs sm:text-sm flex items-center">
                    <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-ping mr-2.5" />
                    Listening to your voice in real time... Speak now!
                  </span>
                )}
              </p>
            </div>

            {/* Real-time Audio VU Meter & Status */}
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
                {audioDetected ? "⚡ Voice Signal Active" : "Waiting for audio..."}
              </span>
            </div>

            {/* Direct submit button if words detected */}
            {liveTranscript.trim() && (
              <button
                onClick={onMicClick}
                className="mt-3 w-full py-2 bg-[#FFE500] hover:bg-[#FF2A55] hover:text-white text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Ask: &quot;{liveTranscript.slice(0, 32)}...&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
