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
}

export const SpecsDrawer: React.FC<SpecsDrawerProps> = ({
  isOpen,
  onClose,
  apiBase,
  chunkingStrategy,
  onSelectStrategy,
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
                Sub-200ms Architecture • HNSW + BM25Okapi • 4 Chunking Engines • MSMARCO-XI
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
