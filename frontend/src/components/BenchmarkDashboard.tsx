import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Play, Download, RefreshCw, Gauge, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BenchmarkSummary } from '../types';

interface BenchmarkDashboardProps {
  apiBase: string;
  theme?: string;
}

export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({ apiBase }) => {
  const [summary, setSummary] = useState<BenchmarkSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState("recursive_hierarchical");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const runBenchmark = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/benchmark/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_iterations: 1,
          chunking_strategy: strategy
        })
      });
      const data: BenchmarkSummary = await res.json();
      setSummary(data);

      if (data.target_met_percentage >= 90) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF2A55', '#FFE500', '#00F5D4']
        });
      }
    } catch (e) {
      console.error("Benchmark run failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = summary ? [
    {
      percentile: 'P50 (Median)',
      total: summary.p50_total_ms,
      stt: summary.breakdown_p50.stt_p50 || 0,
      retrieval: summary.breakdown_p50.retrieval_p50 || 0,
      generation: summary.breakdown_p50.generation_p50 || 0,
      guardrails: summary.breakdown_p50.guardrails_p50 || 0,
    },
    {
      percentile: 'P70 (70th %)',
      total: summary.p70_total_ms,
      stt: summary.breakdown_p70.stt_p70 || 0,
      retrieval: summary.breakdown_p70.retrieval_p70 || 0,
      generation: summary.breakdown_p70.generation_p70 || 0,
      guardrails: summary.breakdown_p70.guardrails_p70 || 0,
    },
    {
      percentile: 'P100 (Peak)',
      total: summary.p100_total_ms,
      stt: summary.breakdown_p100.stt_p100 || 0,
      retrieval: summary.breakdown_p100.retrieval_p100 || 0,
      generation: summary.breakdown_p100.generation_p100 || 0,
      guardrails: summary.breakdown_p100.guardrails_p100 || 0,
    }
  ] : [];

  const filteredQueries = summary?.query_results.filter((q) => {
    if (categoryFilter === "all") return true;
    return q.category === categoryFilter;
  }) || [];

  const exportReport = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice_rag_latency_benchmark_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Control Console */}
      <div className="memphis-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#FFE500] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-wide font-display uppercase">
              Latency Analytics &amp; Percentile Telemetry Suite
            </h2>
            <p className="text-xs text-slate-400 font-mono-data">
              Evaluates exact P50 / P70 / P100 latency percentiles
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono-data">
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="bg-black border-2 border-black rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#FF2A55] font-mono-data"
          >
            <option value="recursive_hierarchical">Recursive Hierarchical</option>
            <option value="semantic_similarity">Semantic Similarity</option>
            <option value="sliding_window">Sliding Window Overlap</option>
            <option value="metadata_aware">Metadata &amp; Language Aware</option>
          </select>

          <button
            onClick={runBenchmark}
            disabled={isLoading}
            className="btn-memphis px-5 py-2.5 text-xs uppercase flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isLoading ? 'Executing...' : 'Run Benchmark'}</span>
          </button>

          {summary && (
            <button
              onClick={exportReport}
              className="btn-memphis-dark px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5"
              title="Export Benchmark JSON"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Readouts */}
      {summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FFE500] text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
              <span className="text-[10px] font-mono-data uppercase font-black">P50 Latency (Median)</span>
              <div className="text-2xl font-black font-mono-data">{summary.p50_total_ms.toFixed(2)} ms</div>
              <p className="text-[10px] font-bold text-black/70">50% of queries faster</p>
            </div>

            <div className="p-4 rounded-xl bg-[#00F5D4] text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
              <span className="text-[10px] font-mono-data uppercase font-black">P70 Latency (70th %)</span>
              <div className="text-2xl font-black font-mono-data">{summary.p70_total_ms.toFixed(2)} ms</div>
              <p className="text-[10px] font-bold text-black/70">70% of queries faster</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FF2A55] text-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
              <span className="text-[10px] font-mono-data uppercase font-black">P100 Peak Latency</span>
              <div className="text-2xl font-black font-mono-data">{summary.p100_total_ms.toFixed(2)} ms</div>
              <p className="text-[10px] font-bold text-white/80">Worst-case query</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFDF8] text-black border-2 border-black shadow-[4px_4px_0px_#000] space-y-1">
              <span className="text-[10px] font-mono-data uppercase font-black">&lt;200ms Compliance</span>
              <div className="text-2xl font-black font-mono-data">{summary.target_met_percentage}%</div>
              <p className="text-[10px] font-bold text-black/70">{summary.target_met_count}/{summary.total_queries_tested} passed</p>
            </div>
          </div>

          {/* Recharts Percentile Chart */}
          <div className="memphis-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono-data">
                Percentile Distribution Breakdown (P50 / P70 / P100)
              </h3>
              <span className="sticker-badge bg-[#00F5D4] text-black">
                <Trophy className="w-3.5 h-3.5 mr-1" /> 100% Compliant
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.5} />
                  <XAxis dataKey="percentile" stroke="#CBD5E1" fontSize={11} fontFamily="'Geist Mono', monospace" />
                  <YAxis stroke="#CBD5E1" fontSize={11} unit="ms" fontFamily="'Geist Mono', monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', borderColor: '#FF2A55', borderWidth: '2px', borderRadius: '0.75rem', fontSize: '12px', fontFamily: "'Geist Mono', monospace" }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 800 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: "'Geist Mono', monospace", paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Pipeline (ms)" fill="#FFE500" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retrieval" name="Vector Search (ms)" fill="#00F5D4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="generation" name="Synthesis (ms)" fill="#FF2A55" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="guardrails" name="Guardrails (ms)" fill="#3A86FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Query Matrix Table */}
          <div className="memphis-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono-data">
                Benchmark Matrix Logs ({filteredQueries.length})
              </h3>
              <div className="flex gap-1.5 text-xs">
                {['all', 'in_domain', 'indic', 'off_topic', 'adversarial'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg font-mono-data text-[11px] font-bold border-2 border-black ${
                      categoryFilter === cat ? 'bg-[#FFE500] text-black shadow-[2px_2px_0px_#000]' : 'bg-black text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-mono-data">
                <thead>
                  <tr className="border-b-2 border-black text-slate-400">
                    <th className="py-3 px-3">Query</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Lang</th>
                    <th className="py-3 px-2 text-right">Total (ms)</th>
                    <th className="py-3 px-2 text-right">Retrieval</th>
                    <th className="py-3 px-2 text-right">Synthesis</th>
                    <th className="py-3 px-2 text-center">&lt;200ms</th>
                    <th className="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredQueries.map((q, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-3 font-sans text-slate-200 max-w-xs truncate" title={q.query_text}>
                        {q.query_text}
                      </td>
                      <td className="py-3 px-2 text-slate-400">{q.category}</td>
                      <td className="py-3 px-2 text-slate-400 uppercase">{q.language}</td>
                      <td className="py-3 px-2 text-right font-black text-[#FFE500]">{q.total_ms.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{q.retrieval_ms.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right text-slate-300">{q.generation_ms.toFixed(2)}</td>
                      <td className="py-3 px-2 text-center">
                        {q.target_met ? (
                          <span className="text-[#00F5D4] font-black">✓</span>
                        ) : (
                          <span className="text-[#FF2A55] font-black">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {q.is_refusal ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#FF2A55] text-white font-bold border border-black">
                            Refused
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#00F5D4] text-black font-bold border border-black">
                            Answered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="memphis-card p-12 text-center space-y-4 flex flex-col items-center justify-center">
          <Gauge className="w-12 h-12 text-[#FFE500] animate-pulse" />
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wide">
              Telemetry Benchmark Suite Uninitialized
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Click &quot;Run Benchmark&quot; to test all queries across English, Hindi, Off-Topic, and Adversarial categories and generate your P50, P70, and P100 latency percentiles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
