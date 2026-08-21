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
import { SystemEvidenceView } from './components/SystemEvidenceView';
import type { VoiceRAGResponse } from './types';

const API_BASE = "";

export const App: React.FC = () => {
  const [workspaceMode, setWorkspaceMode] = useState<'voice' | 'evidence'>('voice');
  const [isRevealed, setIsRevealed] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [glimmerTrigger, setGlimmerTrigger] = useState<number>(0);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [chunkingStrategy, setChunkingStrategy] = useState('recursive_hierarchical');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [ragResult, setRagResult] = useState<VoiceRAGResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  // Handle Mic Click (Drops mic down & toggles voice recording)
  const handleMicClick = () => {
    setErrorMsg(null);
    if (!isListening) {
      setRagResult(null);
      setGlimmerTrigger((prev) => prev + 1);
    }
    setIsListening((prev) => !prev);
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

  const voiceSceneState = isListening
    ? 'LISTENING'
    : isLoading
    ? 'PROCESSING'
    : ragResult
    ? 'RESPONDING'
    : 'IDLE';

  const isNight = isListening || isLoading;

  const sampleQuestions = [
    "What is the capital of Goa and official language?",
    "गोवा की राजधानी क्या है और आधिकारिक भाषा कौन सी है?",
    "What makes Goa's heritage architecture and churches unique?",
    "How does HNSW indexing enable sub-10ms vector retrieval?"
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05070D] font-sans select-none">
      {/* 🧭 Top Minimalist Header with Dual Workspace Switcher */}
      {isRevealed && (
        <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:px-8 flex items-center justify-between pointer-events-none animate-slide-up">
          {/* Left Brand & Lang */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="px-3 py-1.5 bg-[#FF2A55] text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center space-x-1.5 text-xs font-black font-display uppercase tracking-wider">
              <Palmtree className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Goa Voice RAG</span>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black text-white border-2 border-black rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी HI</option>
            </select>
          </div>

          {/* Center: Dual Workspace Switcher (Voice Workspace vs System Evidence) */}
          <div className="flex items-center p-1 bg-[#0F172A]/90 border border-slate-700/80 rounded-full shadow-2xl backdrop-blur-xl pointer-events-auto">
            <button
              onClick={() => setWorkspaceMode('voice')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                workspaceMode === 'voice'
                  ? 'bg-[#FF2A55] text-white shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎙️ Voice Workspace</span>
            </button>

            <button
              onClick={() => setWorkspaceMode('evidence')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                workspaceMode === 'evidence'
                  ? 'bg-[#00F5D4] text-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡ System Evidence</span>
            </button>
          </div>

          {/* Right Specs Trigger */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => setIsSpecsOpen(true)}
              className="btn-memphis px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Specs 🤓</span>
            </button>
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: VOICE WORKSPACE (Beach Landscape & Hanging Pendulum Mic)          */}
      {/* ========================================================================= */}
      {workspaceMode === 'voice' && (
        <>
          {/* 🌴 1. Goa Coastal & Twilight Landscape (Pure Living Vector Scene) */}
          <GoaBeachEnvironment
            isRevealed={isRevealed}
            glimmerTrigger={glimmerTrigger}
            sceneState={voiceSceneState}
            isNight={isNight}
          />

          {/* 🎙️ 2. Hanging Studio Microphone (Interactive Click/Pull Stage) */}
          <HangingMicClickStage
            isRevealed={isRevealed}
            onMicClick={handleMicClick}
            onTranscriptReady={handleTranscriptReady}
            isListening={isListening}
            language={language}
          />

          {/* 🌟 3. Floating Organic Answer Card */}
          {ragResult && (
            <FloatingOrganicAnswer
              response={ragResult}
              onDismiss={() => setRagResult(null)}
              onOpenSpecs={() => setIsSpecsOpen(true)}
            />
          )}

          {/* 💬 4. Minimalist Bottom Input & Prompt Chips with High-Contrast Styling */}
          {isRevealed && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 flex flex-col items-center space-y-3 pointer-events-auto animate-slide-up">
              {/* Sample Chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {sampleQuestions.slice(0, 3).map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleTextSubmit(sq)}
                    className="px-3.5 py-1.5 bg-[#05070D]/90 backdrop-blur-md text-amber-200 border-2 border-black rounded-full text-[11px] font-bold shadow-[3px_3px_0px_#000] hover:bg-[#FF2A55] hover:text-white transition-all truncate max-w-xs cursor-pointer"
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
                className="w-full flex gap-2 bg-[#05070D]/95 backdrop-blur-xl p-1.5 rounded-3xl border-2 border-black shadow-[6px_6px_0px_#000]"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask anything about Goa (or click the hanging mic)..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 px-4 py-3 text-xs font-medium focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !textInput.trim()}
                  className="px-6 py-3 bg-[#FF2A55] hover:bg-[#E6194B] text-white font-black text-xs uppercase tracking-wider border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SYSTEM EVIDENCE & VERIFICATION DASHBOARD                          */}
      {/* ========================================================================= */}
      {workspaceMode === 'evidence' && (
        <div className="pt-20 pb-16 min-h-screen bg-[#070A12] overflow-y-auto">
          <SystemEvidenceView apiBase={API_BASE} />
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
