import React from 'react';
import { Layers, CheckCircle } from 'lucide-react';

interface StrategyComparatorProps {
  activeStrategy: string;
  onSelectStrategy: (strat: string) => void;
}

export const StrategyComparator: React.FC<StrategyComparatorProps> = ({
  activeStrategy,
  onSelectStrategy
}) => {
  const strategies = [
    {
      id: "recursive_hierarchical",
      name: "Recursive Hierarchical",
      tagline: "Structural Multi-Level Splitter",
      description: "Splits recursively down paragraph -> sentence -> clause delimiters with configurable overlap window. Preserves structural prose coherence.",
      overlap: "40 chars overlap",
      boundaryLogic: "Paragraphs (\\n\\n) -> Sentences (. ? !) -> Clauses (; ,)",
      optimalFor: "General MSMARCO articles & multi-sentence answers",
      latencyGrade: "< 1.5ms index / < 0.8ms query"
    },
    {
      id: "semantic_similarity",
      name: "Semantic Similarity",
      tagline: "Cosine Distance Breakpoint Splitter",
      description: "Calculates sentence-to-sentence semantic cosine distance. Places chunk boundaries at topical inflection points where similarity drops below threshold.",
      overlap: "Topical continuity buffer",
      boundaryLogic: "Inflection point where cosine similarity < 0.35",
      optimalFor: "Conversational shifts, QA transcripts, and thematic transitions",
      latencyGrade: "< 2.0ms index / < 0.9ms query"
    },
    {
      id: "sliding_window",
      name: "Sliding Window Overlap",
      tagline: "Continuous Overlapping Token Window",
      description: "Fixed word window with dense sliding overlap (e.g. 60 words window with 40 words step = 33% continuous overlap). Prevents cutting sentences in half.",
      overlap: "33% continuous token overlap",
      boundaryLogic: "Fixed token window with parameterized step size",
      optimalFor: "Dense continuous text and high-recall information lookup",
      latencyGrade: "< 1.2ms index / < 0.7ms query"
    },
    {
      id: "metadata_aware",
      name: "Metadata & Language Aware",
      tagline: "Hierarchical Context Injection Splitter",
      description: "Detects document section titles, Markdown headers, and Indic language tags. Injects parent header context directly into each chunk for high precision retrieval.",
      overlap: "Parent section header prepended",
      boundaryLogic: "Markdown # headers, # SECTION tags, and Indic punctuation",
      optimalFor: "Structured documents, technical manuals, multilingual Indic datasets",
      latencyGrade: "< 1.4ms index / < 0.8ms query"
    }
  ];

  return (
    <div className="memphis-card p-6 space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#00F5D4] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-wide font-display uppercase">
              Vast Multi-Strategy Chunking Engine
            </h2>
            <p className="text-xs text-slate-400 font-mono-data">
              Architectural comparison of boundary heuristics, overlap models, and retrieval latency
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((st) => {
          const isSelected = activeStrategy === st.id;
          return (
            <div
              key={st.id}
              onClick={() => onSelectStrategy(st.id)}
              className={`p-5 rounded-2xl border-2 border-black cursor-pointer transition-all duration-150 relative ${
                isSelected
                  ? 'bg-black text-white shadow-[5px_5px_0px_#FF2A55]'
                  : 'bg-black/40 text-white shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#FFE500]'
              }`}
            >
              {isSelected && (
                <span className="absolute top-4 right-4 sticker-badge bg-[#00F5D4] text-black">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active
                </span>
              )}

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-mono-data uppercase tracking-widest text-[#FFE500] font-black">
                    {st.tagline}
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5 font-display tracking-tight">
                    {st.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {st.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Overlap Model:</span>
                    <span className="text-slate-200 font-bold">{st.overlap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Boundary Logic:</span>
                    <span className="text-slate-200 truncate max-w-[200px]" title={st.boundaryLogic}>
                      {st.boundaryLogic}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retrieval Latency:</span>
                    <span className="text-[#00F5D4] font-bold">{st.latencyGrade}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStrategy(st.id);
                    }}
                    className={`btn-memphis w-full py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider ${
                      isSelected
                        ? 'bg-[#FF2A55] text-white border-2 border-black'
                        : 'bg-[#FFE500] text-black'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : 'Engage Strategy'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
