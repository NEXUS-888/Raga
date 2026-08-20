import React, { useState, useEffect } from 'react';
import { Database, Search } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DatasetExplorerProps {
  apiBase: string;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ apiBase }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/api/dataset/documents`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
        if (data.length > 0) setSelectedDoc(data[0]);
      })
      .catch((err) => console.error("Failed to load documents", err));

    fetch(`${apiBase}/api/dataset/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load stats", err));
  }, [apiBase]);

  const filteredDocs = documents.filter((doc) => {
    const matchesLang = selectedLanguage === "all" || doc.language === selectedLanguage;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Dataset Statistics Matrix */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FFE500] text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
            <div className="text-[10px] font-mono-data font-black uppercase tracking-widest">Corpus Standard</div>
            <div className="text-sm font-black font-display truncate">{stats.dataset_name}</div>
            <div className="text-[10px] font-bold text-black/70">AI4Bharat HuggingFace</div>
          </div>
          <div className="p-4 rounded-xl bg-[#00F5D4] text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
            <div className="text-[10px] font-mono-data font-black uppercase tracking-widest">Knowledge Documents</div>
            <div className="text-2xl font-mono-data font-black">{stats.total_documents}</div>
            <div className="text-[10px] font-bold text-black/70">Multilingual Indic &amp; Tech</div>
          </div>
          <div className="p-4 rounded-xl bg-[#FF2A55] text-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
            <div className="text-[10px] font-mono-data font-black uppercase tracking-widest">Indexed Chunks</div>
            <div className="text-2xl font-mono-data font-black">{stats.total_indexed_chunks}</div>
            <div className="text-[10px] font-bold text-white/80">{stats.active_chunking_strategy}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#FFFDF8] text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
            <div className="text-[10px] font-mono-data font-black uppercase tracking-widest">Vector Engine</div>
            <div className="text-xs font-mono-data font-black truncate">In-Memory HNSW + BM25</div>
            <div className="text-[10px] font-bold text-black/70">Sub-5ms Hybrid Retrieval</div>
          </div>
        </div>
      )}

      {/* Explorer Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="memphis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono-data flex items-center">
              <Database className="w-3.5 h-3.5 mr-1.5 text-[#FFE500]" /> Corpus ({filteredDocs.length})
            </h3>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-black border border-black rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono-data"
            >
              <option value="all">All</option>
              <option value="en">English (EN)</option>
              <option value="hi">Hindi (HI)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search passages..."
              className="w-full bg-black border-2 border-black rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2A55]"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.doc_id === doc.doc_id;
              return (
                <div
                  key={doc.doc_id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-xl border-2 border-black cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-[#FF2A55] text-white shadow-[3px_3px_0px_#000]'
                      : 'bg-black/40 text-slate-200 hover:bg-black/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate max-w-[180px] font-display">{doc.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-data font-bold uppercase bg-black text-[#FFE500]">
                      {doc.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{doc.content}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Detailed View */}
        <div className="memphis-card p-6 md:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div>
                  <h2 className="text-sm font-black text-white font-display uppercase tracking-wide">{selectedDoc.title}</h2>
                  <div className="flex items-center space-x-3 text-xs font-mono-data text-slate-400 mt-1">
                    <span>Doc ID: {selectedDoc.doc_id}</span>
                    <span>•</span>
                    <span className="uppercase text-[#FFE500] font-bold">Lang: {selectedDoc.language}</span>
                    <span>•</span>
                    <span>Domain: {selectedDoc.metadata?.domain || 'General'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/80 p-4 rounded-xl border-2 border-black max-h-[400px] overflow-y-auto custom-scrollbar">
                <pre className="text-xs text-slate-200 font-mono-data whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-xs font-mono-data text-slate-500">
              Select a passage from the left to inspect raw MSMARCO-XI tokens
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
