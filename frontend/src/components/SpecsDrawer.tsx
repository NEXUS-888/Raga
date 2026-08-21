import React, { useState } from 'react';
import { X, Activity, Layers, Database, BookOpen, Zap } from 'lucide-react';
import { BenchmarkDashboard } from './BenchmarkDashboard';
import { StrategyComparator } from './StrategyComparator';
import { DatasetExplorer } from './DatasetExplorer';

interface SpecsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  chunkingStrategy: string;
  onSelectStrategy: (strat: string) => void;
  llmProvider: 'auto' | 'groq' | 'turbo';
  onSelectLlmProvider: (provider: 'auto' | 'groq' | 'turbo') => void;
}

export const SpecsDrawer: React.FC<SpecsDrawerProps> = ({
  isOpen,
  onClose,
  apiBase,
  chunkingStrategy,
  onSelectStrategy,
  llmProvider,
  onSelectLlmProvider,
}) => {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'chunking' | 'dataset' | 'architecture'>('benchmark');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-slide-up">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#0C0F1E] border-3 border-black rounded-3xl shadow-[10px_10px_0px_#000] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#FF2A55] text-white border-b-3 border-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black text-[#FFE500] border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-black font-display tracking-wide uppercase">
                HH Goa • Engineering Telemetry &amp; Specs
              </h2>
              <p className="text-xs text-white/80 font-mono-data">
                Sub-200ms Architecture • HNSW + BM25Okapi • Groq LPU + Turbo RAG • MSMARCO-XI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black text-white hover:bg-[#FFE500] hover:text-black border-2 border-black shadow-[3px_3px_0px_#000] transition-colors"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Top Control Bar: LLM Engine Mode Selector */}
        <div className="p-3.5 bg-[#0F1426] border-b-2 border-black space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span className="text-xs font-black uppercase text-white font-display flex items-center space-x-1.5">
                <span>🧠 Generation Engine:</span>
              </span>
              <div className="flex items-center p-1 bg-black rounded-xl border border-slate-700 shadow-inner">
                <button
                  onClick={() => onSelectLlmProvider('auto')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    llmProvider === 'auto'
                      ? 'bg-[#00F5D4] text-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Smart routing: Fast local RAG for factual lookup, Groq LLM for complex synthesis"
                >
                  🚀 Auto Gateway (Smart)
                </button>
                <button
                  onClick={() => onSelectLlmProvider('groq')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    llmProvider === 'groq'
                      ? 'bg-[#FF2A55] text-white shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Force every question through Groq Cloud Llama-3.1-8B Instant (<150ms)"
                >
                  ☁️ Groq Cloud (Llama 3.1 Instant)
                </button>
                <button
                  onClick={() => onSelectLlmProvider('turbo')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    llmProvider === 'turbo'
                      ? 'bg-[#FFE500] text-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Force ultra-fast local in-memory RAG synthesis (<10ms)"
                >
                  ⚡ Turbo Local (&lt;10ms)
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Active Mode: <span className="font-bold text-amber-300">{llmProvider === 'auto' ? '🚀 Auto Smart Gateway' : llmProvider === 'groq' ? '☁️ Groq Cloud LPU' : '⚡ In-Memory Turbo RAG'}</span>
            </div>
          </div>

          {/* Dynamic "Why & What" Explanation Card */}
          <div className="p-3 rounded-2xl bg-black/70 border border-slate-700/80 text-xs text-slate-300 font-sans shadow-inner">
            {llmProvider === 'auto' && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-black text-[#00F5D4] font-display uppercase tracking-wide flex items-center gap-1.5">
                    <span>🚀 Auto Smart Gateway (Recommended)</span>
                  </span>
                  <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 font-bold">
                    Target: 3 ms – 140 ms • Zero-Wasted Latency
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed pt-1">
                  <div>
                    <span className="text-white font-bold">🔍 What it does: </span>
                    <span>Classifies incoming queries automatically. Direct factual lookups (capital, languages, beaches) resolve in <strong>&lt;10ms</strong> via Local RAG; open/creative queries route to <strong>Groq Llama 3.1</strong>.</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">🎯 Why choose this: </span>
                    <span>Best of both worlds for hackathons—guarantees instant factual responses while preserving full conversational LLM capabilities under the 200ms voice budget.</span>
                  </div>
                </div>
              </div>
            )}

            {llmProvider === 'groq' && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-black text-[#FF2A55] font-display uppercase tracking-wide flex items-center gap-1.5">
                    <span>☁️ Groq Cloud (Llama 3.1 8B Instant)</span>
                  </span>
                  <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#FF2A55]/10 text-[#FF2A55] border border-[#FF2A55]/30 font-bold">
                    Target: ~90 ms – 150 ms • 1,200+ tokens/sec
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed pt-1">
                  <div>
                    <span className="text-white font-bold">🔍 What it does: </span>
                    <span>Sends retrieved MSMARCO-XI context directly to <strong>Groq's LPUs</strong> running <strong>Llama-3.1-8B-Instant</strong> with a concise 90-token voice synthesis budget.</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">🎯 Why choose this: </span>
                    <span>Demonstrates full generative multi-clause AI reasoning and conversational natural language while leveraging hardware-accelerated LPU chips for sub-150ms speed.</span>
                  </div>
                </div>
              </div>
            )}

            {llmProvider === 'turbo' && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-black text-[#FFE500] font-display uppercase tracking-wide flex items-center gap-1.5">
                    <span>⚡ Turbo Local In-Memory Grounded Synthesizer</span>
                  </span>
                  <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/30 font-bold">
                    Target: 1.6 ms – 8.5 ms • 100% In-Memory
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed pt-1">
                  <div>
                    <span className="text-white font-bold">🔍 What it does: </span>
                    <span>Extracts and ranks factually grounded sentences directly from indexed vector chunks on the server with zero cloud API round-trips or cold starts.</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">🎯 Why choose this: </span>
                    <span>Peak benchmark performance with sub-5ms response times, 100% offline resilience, and zero hallucination risk across all verified documents.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 p-3 bg-black border-b-2 border-black overflow-x-auto custom-scrollbar">
          {[
            { id: 'benchmark', label: 'Latency Analytics (P50/P70/P100)', icon: Activity },
            { id: 'chunking', label: 'Vast Chunking Engine', icon: Layers },
            { id: 'dataset', label: 'MSMARCO-XI Corpus', icon: Database },
            { id: 'architecture', label: 'Technical Specifications', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-black font-display uppercase tracking-wider whitespace-nowrap border-2 border-black transition-all ${
                  isActive
                    ? 'bg-[#FFE500] text-black shadow-[3px_3px_0px_#000]'
                    : 'bg-[#161B30] text-slate-300 hover:bg-[#1E2540]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0A0D1A]">
          {activeTab === 'benchmark' && <BenchmarkDashboard apiBase={apiBase} />}
          {activeTab === 'chunking' && (
            <StrategyComparator
              activeStrategy={chunkingStrategy}
              onSelectStrategy={onSelectStrategy}
            />
          )}
          {activeTab === 'dataset' && <DatasetExplorer apiBase={apiBase} />}
          {activeTab === 'architecture' && (
            <div className="memphis-card p-8 space-y-6 text-sm font-sans leading-relaxed">
              <h2 className="text-base font-black text-white flex items-center space-x-2.5 font-display uppercase tracking-wide">
                <Zap className="w-5 h-5 text-[#FFE500]" />
                <span>HH Goa 2026: Architecture &amp; Engineering Specification</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-black border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000]">
                  <h3 className="text-xs font-mono-data uppercase tracking-wider text-[#FFE500] font-black">
                    1. Sub-200ms Latency Pipeline Target
                  </h3>
                  <p className="text-xs text-slate-300">Every stage of the pipeline is built for microsecond efficiency:</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-mono-data">
                    <li>Embedding generation: Subword character-gram TF-IDF &lt; 2ms.</li>
                    <li>Vector Retrieval: In-memory HNSW + BM25Okapi with Reciprocal Rank Fusion &lt; 5ms.</li>
                    <li>Inference: Groq Llama-3.3-70B / Compound-mini with TTFT &lt; 120ms.</li>
                    <li>Guardrail evaluation: Inlined single-pass validation &lt; 1ms.</li>
                  </ul>
                </div>

                <div className="space-y-3 bg-black border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000]">
                  <h3 className="text-xs font-mono-data uppercase tracking-wider text-[#00F5D4] font-black">
                    2. Vast Multi-Strategy Chunking Engine
                  </h3>
                  <p className="text-xs text-slate-300">Four production chunking strategies implemented:</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-mono-data">
                    <li><strong>Semantic Breakpoints:</strong> Cosine inflection point detection.</li>
                    <li><strong>Recursive Hierarchical:</strong> Multi-level paragraph/sentence delimiters.</li>
                    <li><strong>Sliding Window:</strong> 33% continuous token overlap.</li>
                    <li><strong>Metadata &amp; Language:</strong> Section hierarchy context injection.</li>
                  </ul>
                </div>

                <div className="space-y-3 bg-black border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000]">
                  <h3 className="text-xs font-mono-data uppercase tracking-wider text-[#3A86FF] font-black">
                    3. Model Orchestration Harness
                  </h3>
                  <p className="text-xs text-slate-300">Resilient production execution harness:</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-mono-data">
                    <li>Structured Pydantic schemas for inputs, outputs, and latency traces.</li>
                    <li>Async retry policy with jittered exponential backoff.</li>
                    <li>Circuit breaker preventing cascading upstream service failures.</li>
                  </ul>
                </div>

                <div className="space-y-3 bg-black border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000]">
                  <h3 className="text-xs font-mono-data uppercase tracking-wider text-[#FF2A55] font-black">
                    4. Strict Guardrails &amp; Active Abstention
                  </h3>
                  <p className="text-xs text-slate-300">Mandatory abstention policy (&quot;Knows when not to answer&quot;):</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 font-mono-data">
                    <li><strong>Input Safety:</strong> Blocks prompt injections and toxic inputs.</li>
                    <li><strong>Topic Domain:</strong> Rejects queries outside MSMARCO-XI / Goa corpus.</li>
                    <li><strong>Grounding Gate:</strong> Enforces 100% factual faithfulness to context.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
