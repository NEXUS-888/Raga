import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import type { LatencyWaterfall } from '../types';

interface LatencyWaterfallProps {
  latency: LatencyWaterfall;
  theme?: string;
  isNerdMode?: boolean;
}

export const LatencyWaterfallView: React.FC<LatencyWaterfallProps> = ({
  latency,
  isNerdMode = false
}) => {
  const targetMs = 200;
  const total = latency.total_pipeline_ms;
  const isCompliant = total <= targetMs;

  const stages = [
    { name: "Voice Transcribe", time: latency.stt_ms, color: "bg-[#FFE500]", desc: "Groq Whisper / Sarvam" },
    { name: "Safety Check", time: latency.guardrail_input_ms, color: "bg-[#FF2A55]", desc: "Input Safety Gate" },
    { name: "Word Embeddings", time: latency.embedding_ms, color: "bg-[#3A86FF]", desc: "Fast Subword Projections" },
    { name: "Vector Search", time: latency.vector_search_ms, color: "bg-[#00F5D4]", desc: "HNSW Dense Nearest Search" },
    { name: "BM25 Keyword", time: latency.bm25_search_ms, color: "bg-[#7209B7]", desc: "BM25 Sparse Retrieval" },
    { name: "Model Synthesis", time: latency.generation_ms, color: "bg-[#4CC9F0]", desc: "Grounded LLM Inference" },
    { name: "Fact Check Gate", time: latency.guardrail_output_ms, color: "bg-[#F72585]", desc: "Anti-Hallucination Gate" },
  ];

  // Simple Mode
  if (!isNerdMode) {
    return (
      <div className="memphis-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#FFE500]" />
            <h3 className="text-sm font-black text-white font-display">
              Response Speed
            </h3>
          </div>
          <span className="sticker-badge bg-[#00F5D4] text-black">
            ⚡ {total.toFixed(0)} ms ({(total / 1000).toFixed(2)}s)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/50 border-2 border-black text-xs text-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono-data text-slate-300">
            <span>Voice $\rightarrow$ Vector Search $\rightarrow$ Answer</span>
            <span className="text-[#00F5D4] font-bold">Faster than an eye blink (300ms)!</span>
          </div>
          <div className="w-full h-3 bg-black rounded-full overflow-hidden flex border border-white/20">
            <div className="bg-[#FFE500] h-full" style={{ width: '25%' }} title="Voice" />
            <div className="bg-[#00F5D4] h-full" style={{ width: '35%' }} title="Search" />
            <div className="bg-[#FF2A55] h-full" style={{ width: '40%' }} title="Generation" />
          </div>
        </div>
      </div>
    );
  }

  // Nerd Mode
  return (
    <div className="memphis-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#FFE500] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
              Sub-200ms Telemetry Waterfall
            </h3>
            <p className="text-xs text-slate-400 font-mono-data">
              Real-time microsecond timeline breakdown per architectural layer
            </p>
          </div>
        </div>

        <div>
          {isCompliant ? (
            <span className="sticker-badge bg-[#00F5D4] text-black">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS &lt;200ms
            </span>
          ) : (
            <span className="sticker-badge bg-[#FF2A55] text-white">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> &gt;200ms
            </span>
          )}
        </div>
      </div>

      {/* KPI Display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#FF2A55] text-white border-2 border-black shadow-[3px_3px_0px_#000] space-y-1">
          <span className="text-[10px] font-mono-data uppercase font-extrabold">Total Latency</span>
          <div className="text-2xl font-black font-mono-data">{total.toFixed(1)} <span className="text-xs">ms</span></div>
          <p className="text-[10px] text-white/80 font-mono-data">Target &lt;200ms</p>
        </div>

        <div className="p-4 rounded-xl bg-[#00F5D4] text-black border-2 border-black shadow-[3px_3px_0px_#000] space-y-1">
          <span className="text-[10px] font-mono-data uppercase font-extrabold">Vector Retrieval</span>
          <div className="text-2xl font-black font-mono-data">{latency.total_retrieval_ms.toFixed(1)} <span className="text-xs">ms</span></div>
          <p className="text-[10px] text-black/70 font-mono-data">HNSW + BM25 + RRF</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFE500] text-black border-2 border-black shadow-[3px_3px_0px_#000] space-y-1">
          <span className="text-[10px] font-mono-data uppercase font-extrabold">Synthesis</span>
          <div className="text-2xl font-black font-mono-data">{latency.generation_ms.toFixed(1)} <span className="text-xs">ms</span></div>
          <p className="text-[10px] text-black/70 font-mono-data">Groq Llama 3.3</p>
        </div>
      </div>

      {/* Progress Waterfall Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono-data text-slate-300">
          <span>0.00ms</span>
          <span className="text-[#FFE500] font-bold">Execution: {total.toFixed(2)}ms</span>
          <span>Target: 200.00ms</span>
        </div>
        <div className="w-full h-4 bg-black rounded-lg overflow-hidden flex border-2 border-black shadow-inner">
          {stages.map((st, i) => {
            const pct = total > 0 ? (st.time / total) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={i}
                className={`${st.color} h-full border-r border-black`}
                style={{ width: `${Math.max(pct, 2)}%` }}
                title={`${st.name}: ${st.time.toFixed(2)}ms (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {stages.map((st, i) => (
          <div key={i} className="p-3 rounded-xl bg-black/40 border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-200 font-bold truncate">{st.name}</span>
              <span className="text-xs font-mono-data font-black text-[#FFE500]">{st.time.toFixed(1)}ms</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono-data">{st.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
