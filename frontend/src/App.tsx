import React, { useState } from 'react';
import {
  Zap,
  Palmtree,
  Send,
  Loader2
} from 'lucide-react';
import { GoaBeachEnvironment } from './components/GoaBeachEnvironment';
import { HangingMicClickStage } from './components/HangingMicClickStage';
import { FloatingOrganicAnswer } from './components/FloatingOrganicAnswer';
import { SpecsDrawer } from './components/SpecsDrawer';
import type { VoiceRAGResponse } from './types';

const API_BASE = "http://localhost:8001";

export const App: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [glimmerTrigger, setGlimmerTrigger] = useState<number>(0);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [chunkingStrategy, setChunkingStrategy] = useState('recursive_hierarchical');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<VoiceRAGResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  // Handle Mic Click (Drops mic down & triggers Goa glimmer reveal)
  const handleMicClick = () => {
    setErrorMsg(null);
    if (!isRevealed) {
      setIsRevealed(true);
      setGlimmerTrigger((prev) => prev + 1);
      setRagResult(null);
      setIsListening(true);
    } else {
      if (!isListening) {
        setRagResult(null);
      }
      setIsListening(!isListening);
    }
  };

  // Handle Voice Transcript or Audio Blob Received
  const handleTranscriptReady = async (transcript: string, audioBlob?: Blob) => {
    setIsListening(false);
    setErrorMsg(null);

    // Priority 1: If browser SpeechRecognition captured the words directly, execute immediately!
    if (transcript && transcript.trim().length > 1) {
      await handleTextSubmit(transcript.trim());
      return;
    }

    // Priority 2: If SpeechRecognition was quiet but audio was recorded, send audio to Groq Whisper backend
    if (audioBlob && audioBlob.size > 500) {
      if (!isRevealed) {
        setIsRevealed(true);
        setGlimmerTrigger((prev) => prev + 1);
      }
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const formData = new FormData();
        let filename = 'voice_recording.wav';
        if (audioBlob.type.includes('webm')) filename = 'voice_recording.webm';
        else if (audioBlob.type.includes('wav')) filename = 'voice_recording.wav';
        else if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) filename = 'voice_recording.m4a';
        else if (audioBlob.type.includes('ogg')) filename = 'voice_recording.ogg';

        formData.append('file', audioBlob, filename);
        formData.append('chunking_strategy', chunkingStrategy);
        formData.append('stt_provider', 'groq');
        formData.append('language', language);
        formData.append('top_k', '3');

        const res = await fetch(`${API_BASE}/api/rag/voice`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`Voice server error (${res.status}): ${res.statusText}`);
        const data: VoiceRAGResponse = await res.json();
        setRagResult(data);
      } catch (err: any) {
        console.error("Voice processing error:", err);
        setErrorMsg(err.message || "Failed to process voice query");
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMsg("No voice detected from your microphone. Please click the mic and speak clearly.");
    }
  };

  const handleTextSubmit = async (text: string) => {
    if (!text.trim()) return;
    if (!isRevealed) {
      setIsRevealed(true);
      setGlimmerTrigger((prev) => prev + 1);
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_text: text,
          chunking_strategy: chunkingStrategy,
          stt_provider: 'groq',
          language: language,
          top_k: 3
        }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      const data: VoiceRAGResponse = await res.json();
      setRagResult(data);
    } catch (err: any) {
      console.error("Text query failed:", err);
      setErrorMsg(err.message || "Failed to process query");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "What is the capital of Goa and official language?",
    "गोवा की राजधानी क्या है और आधिकारिक भाषा कौन सी है?",
    "What makes Goa's heritage architecture and churches unique?",
    "How does HNSW indexing enable sub-10ms vector retrieval?"
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05070D] font-sans select-none">
      {/* 🌴 1. Goa Coastal & Twilight Landscape (Pitch black until mic is clicked) */}
      <GoaBeachEnvironment isRevealed={isRevealed} glimmerTrigger={glimmerTrigger} />

      {/* 🎙️ 2. Hanging Studio Microphone (Positioned in highlighted upper-right/center) */}
      <HangingMicClickStage
        isRevealed={isRevealed}
        onMicClick={handleMicClick}
        onTranscriptReady={handleTranscriptReady}
        isListening={isListening}
        language={language}
      />

      {/* 🌟 3. Floating Organic Answer Card (Appears dynamically in open space) */}
      {ragResult && (
        <FloatingOrganicAnswer
          response={ragResult}
          onDismiss={() => setRagResult(null)}
          onOpenSpecs={() => setIsSpecsOpen(true)}
        />
      )}

      {/* 4. Top Minimalist Header Controls (Revealed after click) */}
      {isRevealed && (
        <header className="fixed top-0 left-0 right-0 z-20 p-4 sm:px-8 flex items-center justify-between pointer-events-none animate-slide-up">
          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="px-3 py-1.5 bg-[#FF2A55] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center space-x-1.5 text-xs font-black font-display uppercase tracking-wider">
              <Palmtree className="w-4 h-4 fill-current" />
              <span>Goa Voice AI</span>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black text-white border-2 border-black rounded-xl px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
            >
              <option value="en">English (en-IN)</option>
              <option value="hi">हिंदी Hindi (hi-IN)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            {/* Technical Specs Modal Trigger */}
            <button
              onClick={() => setIsSpecsOpen(true)}
              className="btn-memphis px-3.5 py-1.5 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Engine Specs 🤓</span>
            </button>
          </div>
        </header>
      )}

      {/* 5. Minimalist Bottom Input & Prompt Chips */}
      {isRevealed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 flex flex-col items-center space-y-3 pointer-events-auto animate-slide-up">
          {/* Sample Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {sampleQuestions.slice(0, 3).map((sq, i) => (
              <button
                key={i}
                onClick={() => handleTextSubmit(sq)}
                className="px-3 py-1 bg-[#FFFDF8] text-slate-900 border-2 border-black rounded-full text-[11px] font-bold shadow-[2px_2px_0px_#000] hover:bg-[#FFE500] transition-colors truncate max-w-xs"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Quick Query Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim()) {
                handleTextSubmit(textInput.trim());
                setTextInput('');
              }
            }}
            className="w-full flex gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ask anything about Goa (or click the hanging mic)..."
              className="flex-1 bg-black/80 text-white placeholder-slate-400 border-2 border-black rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#FFE500] shadow-[4px_4px_0px_#000]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !textInput.trim()}
              className="btn-memphis px-5 py-3 rounded-2xl text-xs font-black uppercase flex items-center space-x-1.5 disabled:opacity-40"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#FF2A55] text-white border-2 border-black px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_#000] text-xs font-bold flex items-center space-x-2">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 6. Technical Engineering Specs Modal Drawer */}
      <SpecsDrawer
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        apiBase={API_BASE}
        chunkingStrategy={chunkingStrategy}
        onSelectStrategy={(strat) => setChunkingStrategy(strat)}
      />
    </div>
  );
};

export default App;
