import React from 'react';
import { X, Sparkles, CheckCircle2, Tag } from 'lucide-react';
import type { VoiceRAGResponse } from '../types';

interface FloatingOrganicAnswerProps {
  response: VoiceRAGResponse;
  onDismiss: () => void;
  onOpenSpecs: () => void;
}

export const FloatingOrganicAnswer: React.FC<FloatingOrganicAnswerProps> = ({
  response,
  onDismiss,
  onOpenSpecs,
}) => {
  return (
    <div
      className="fixed left-6 sm:left-12 top-20 sm:top-24 z-40 max-w-lg lg:max-w-xl w-[calc(100%-3rem)] sm:w-full p-6 sm:p-7 bg-[#FFFDF8] text-slate-900 border-3 border-black rounded-3xl shadow-[8px_8px_0px_#000] animate-slide-up select-none pointer-events-auto"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#FFE500] text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
            <Sparkles className="w-4 h-4 fill-current text-black" />
          </div>
          <span className="text-xs font-black uppercase text-slate-950 font-display tracking-wide">
            {response.query.includes("No speech") ? "Voice Prompt" : response.is_refusal ? "Question Refused" : "Grounded Goa Answer"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className="sticker-badge bg-[#00F5D4] text-black text-[10px] font-black font-mono-data cursor-help"
            title={`Local RAG Engine: ${((response.latency.total_retrieval_ms || 0) + (response.latency.guardrail_input_ms || 0) + (response.latency.guardrail_output_ms || 0)).toFixed(1)} ms | Full Cloud Voice: ${response.latency.total_pipeline_ms.toFixed(0)} ms`}
          >
            ⚡ RAG: {((response.latency.total_retrieval_ms || 0) + (response.latency.guardrail_input_ms || 0) + (response.latency.guardrail_output_ms || 0)).toFixed(1)} ms
          </span>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg bg-black text-white hover:bg-[#FF2A55] border-2 border-black transition-colors"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Query Banner */}
      <div className="mb-3 px-3 py-2 bg-[#0A0D1A] text-white border-2 border-black rounded-xl text-xs font-bold font-sans">
        <span className="text-[#FFE500]">Q: </span>
        <span>{response.query}</span>
      </div>

      {/* Answer Paragraph */}
      <div className="text-sm font-semibold text-slate-900 leading-relaxed font-sans mb-4">
        {response.answer}
      </div>

      {/* Trust & Citation Strip */}
      <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center text-emerald-800 font-bold text-[11px]">
          <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600 fill-emerald-100" />
          Verified with Goa knowledge base
        </span>

        <button
          onClick={onOpenSpecs}
          className="text-xs font-black text-[#FF2A55] hover:underline font-mono-data cursor-pointer"
        >
          View Telemetry &amp; Specs 🤓 →
        </button>
      </div>

      {/* Snippet tags if citations exist */}
      {response.citations && response.citations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
          {response.citations.slice(0, 2).map((c, i) => (
            <span key={i} className="text-[10px] font-mono-data bg-black/5 border border-black/20 px-2 py-0.5 rounded text-slate-700 flex items-center">
              <Tag className="w-2.5 h-2.5 mr-1 text-[#FF2A55]" />
              {c.metadata?.title || c.doc_id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
