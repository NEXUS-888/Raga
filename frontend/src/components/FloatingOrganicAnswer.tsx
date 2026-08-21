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
      className="fixed left-3 right-3 sm:left-10 sm:right-auto top-16 sm:top-24 z-40 max-w-lg lg:max-w-xl w-auto sm:w-full p-4 sm:p-6 bg-[#FFFDF8] text-slate-900 border-2 sm:border-3 border-black rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_#000] sm:shadow-[8px_8px_0px_#000] max-h-[58vh] sm:max-h-[75vh] overflow-y-auto animate-slide-up select-none pointer-events-auto"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2 sm:pb-3 mb-2.5 sm:mb-3">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className={`p-1 sm:p-1.5 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] sm:shadow-[2px_2px_0px_#000] ${response.is_refusal ? 'bg-[#FF2A55] text-white' : 'bg-[#FFE500] text-black'}`}>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase text-slate-950 font-display tracking-wide truncate max-w-[170px] sm:max-w-none">
            {response.is_refusal ? "🛡️ Guardrail Intercepted" : "Grounded Answer"}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span
            className={`sticker-badge text-[9px] sm:text-[10px] font-black font-mono-data cursor-help py-0.5 px-1.5 sm:px-2 ${response.is_refusal ? 'bg-[#FF2A55] text-white' : 'bg-[#00F5D4] text-black'}`}
            title={`Local RAG Engine: ${((response.latency.total_retrieval_ms || 0) + (response.latency.guardrail_input_ms || 0) + (response.latency.guardrail_output_ms || 0)).toFixed(1)} ms | Full Cloud Voice: ${response.latency.total_pipeline_ms.toFixed(0)} ms`}
          >
            {response.is_refusal ? "🛡️ 0.1 ms" : `⚡ RAG: ${((response.latency.total_retrieval_ms || 0) + (response.latency.guardrail_input_ms || 0) + (response.latency.guardrail_output_ms || 0)).toFixed(1)} ms`}
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
      <div className="mb-2.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#0A0D1A] text-white border-2 border-black rounded-xl text-[11px] sm:text-xs font-bold font-sans">
        <span className="text-[#FFE500]">Q: </span>
        <span>{response.query}</span>
      </div>

      {/* Answer Paragraph */}
      <div className={`text-xs sm:text-sm font-semibold leading-relaxed font-sans mb-3 sm:mb-4 ${response.is_refusal ? 'text-red-700 bg-red-50 p-2.5 sm:p-3 rounded-xl border border-red-200' : 'text-slate-900'}`}>
        {response.answer}
      </div>

      {/* Trust & Citation Strip */}
      <div className="pt-2.5 sm:pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
        <span className={`flex items-center font-bold text-[10px] sm:text-[11px] ${response.is_refusal ? 'text-amber-800' : 'text-emerald-800'}`}>
          <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0 ${response.is_refusal ? 'text-amber-600 fill-amber-100' : 'text-emerald-600 fill-emerald-100'}`} />
          <span className="truncate">{response.is_refusal ? "Enforced: Safety Guardrail" : "Verified MSMARCO-XI"}</span>
        </span>

        <button
          onClick={onOpenSpecs}
          className="text-[10px] sm:text-xs font-black text-[#FF2A55] hover:underline font-mono-data cursor-pointer"
        >
          Specs 🤓 →
        </button>
      </div>

      {/* Snippet tags if citations exist */}
      {response.citations && response.citations.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1 pt-2 border-t border-slate-200">
          {response.citations.slice(0, 2).map((c, i) => (
            <span key={i} className="text-[9px] sm:text-[10px] font-mono-data bg-black/5 border border-black/20 px-1.5 py-0.5 rounded text-slate-700 flex items-center">
              <Tag className="w-2.5 h-2.5 mr-1 text-[#FF2A55]" />
              <span className="truncate max-w-[180px]">{c.metadata?.title || c.doc_id}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
