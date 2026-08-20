import React from 'react';
import { Database, Tag, Layers } from 'lucide-react';
import type { Chunk } from '../types';

interface CitationsViewerProps {
  citations: Chunk[];
  strategyUsed: string;
}

export const CitationsViewer: React.FC<CitationsViewerProps> = ({ citations, strategyUsed }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="memphis-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00F5D4] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
              MSMARCO-XI Grounded Citations ({citations.length})
            </h3>
            <p className="text-xs text-slate-400 font-mono-data">
              Direct passages retrieved via Hybrid HNSW + BM25Okapi
            </p>
          </div>
        </div>
        <span className="sticker-badge bg-[#FFE500] text-black">
          {strategyUsed}
        </span>
      </div>

      <div className="space-y-3">
        {citations.map((chunk, idx) => (
          <div
            key={chunk.chunk_id || idx}
            className="p-4 rounded-xl bg-black/40 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2.5"
          >
            {/* Header info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-[#FF2A55] text-white border border-black font-mono-data text-[11px] font-black">
                  #{idx + 1} RRF: {(chunk.score || 0).toFixed(3)}
                </span>
                <span className="font-bold text-slate-100 truncate max-w-sm font-display">
                  {chunk.metadata?.title || chunk.doc_id}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono-data text-slate-400">
                <span className="flex items-center"><Tag className="w-3 h-3 mr-1 text-[#FFE500]" /> {chunk.metadata?.lang || 'en'}</span>
                <span className="flex items-center"><Layers className="w-3 h-3 mr-1 text-[#00F5D4]" /> {chunk.word_count} tokens</span>
              </div>
            </div>

            {/* Chunk content */}
            <p className="text-xs text-slate-200 leading-relaxed bg-black/60 p-3 rounded-lg border border-white/10">
              {chunk.content}
            </p>

            {/* Metadata badges */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {chunk.metadata?.section && (
                <span className="text-[10px] font-mono-data bg-black text-[#FFE500] px-2 py-0.5 rounded border border-black">
                  Section: {chunk.metadata.section}
                </span>
              )}
              {chunk.metadata?.source && (
                <span className="text-[10px] font-mono-data bg-black text-[#00F5D4] px-2 py-0.5 rounded border border-black">
                  Dataset: {chunk.metadata.source}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
