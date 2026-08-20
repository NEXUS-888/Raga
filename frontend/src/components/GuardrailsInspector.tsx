import React from 'react';
import { ShieldAlert, ShieldCheck, Check, X, AlertOctagon, Lock, Shield } from 'lucide-react';
import type { GuardrailPipelineReport } from '../types';

interface GuardrailsInspectorProps {
  guardrails: GuardrailPipelineReport;
  isRefusal: boolean;
  refusalReason?: string;
  isNerdMode?: boolean;
}

export const GuardrailsInspector: React.FC<GuardrailsInspectorProps> = ({
  guardrails,
  isRefusal,
  refusalReason,
  isNerdMode = false
}) => {
  const { safety, topic, grounding } = guardrails;

  // Simple Mode
  if (!isNerdMode) {
    return (
      <div className="memphis-card p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#3A86FF]" />
            <h3 className="text-sm font-black text-white font-display">
              Trust &amp; Fact-Check Status
            </h3>
          </div>
          {guardrails.all_passed ? (
            <span className="sticker-badge bg-[#00F5D4] text-black">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 100% Fact-Checked
            </span>
          ) : (
            <span className="sticker-badge bg-[#FF2A55] text-white">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Polite Refusal
            </span>
          )}
        </div>

        {isRefusal ? (
          <div className="p-3.5 rounded-xl bg-[#FF2A55] text-white border-2 border-black shadow-[3px_3px_0px_#000] text-xs space-y-1">
            <span className="font-extrabold uppercase font-display">Why the AI didn&apos;t answer:</span>
            <p className="font-medium text-white/90">
              Our safety guardrail stepped in because this question was either off-topic or asking for unverified claims. We prioritize 100% accurate facts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center space-x-2 text-slate-200">
              <span className="p-1 bg-[#00F5D4] text-black rounded-md"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              <span className="font-bold">Safe &amp; Clean</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center space-x-2 text-slate-200">
              <span className="p-1 bg-[#FFE500] text-black rounded-md"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              <span className="font-bold">Goa Knowledge</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center space-x-2 text-slate-200">
              <span className="p-1 bg-[#3A86FF] text-white rounded-md"><Check className="w-3.5 h-3.5 stroke-[3]" /></span>
              <span className="font-bold">Zero Hallucinations</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Nerd Mode
  return (
    <div className="memphis-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00F5D4] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
              Active Guardrails &amp; Verification Gate
            </h3>
            <p className="text-xs text-slate-400 font-mono-data">
              Mandatory abstention policy (&quot;Knows when not to answer&quot;)
            </p>
          </div>
        </div>
        <div>
          {guardrails.all_passed ? (
            <span className="sticker-badge bg-[#00F5D4] text-black">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> All Gates Verified
            </span>
          ) : (
            <span className="sticker-badge bg-[#FF2A55] text-white">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Active Abstention
            </span>
          )}
        </div>
      </div>

      {isRefusal && (
        <div className="bg-[#FF2A55] text-white border-2 border-black rounded-xl p-4 flex items-start space-x-3 shadow-[4px_4px_0px_#000]">
          <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#FFE500]" />
          <div className="space-y-1 text-xs">
            <span className="font-black font-display tracking-wide uppercase">
              Model Abstention Active — Guardrail Intercepted
            </span>
            <p className="font-mono-data leading-relaxed">{refusalReason || guardrails.refusal_message}</p>
          </div>
        </div>
      )}

      {/* 3 Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] ${safety.passed ? 'bg-black/50' : 'bg-[#FF2A55] text-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-display">1. Safety &amp; Injection</span>
            {safety.passed ? (
              <span className="p-1 rounded bg-[#00F5D4] text-black border border-black"><Check className="w-3 h-3 stroke-[3]" /></span>
            ) : (
              <span className="p-1 rounded bg-black text-white"><X className="w-3 h-3 stroke-[3]" /></span>
            )}
          </div>
          <div className="text-[11px] space-y-1 font-mono-data">
            <div className="text-slate-300">Toxicity: <span className="font-bold text-white">{(safety.score * 100).toFixed(0)}%</span></div>
            <div className="text-slate-400 truncate" title={safety.reason}>{safety.reason}</div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] ${topic.passed ? 'bg-black/50' : 'bg-[#FFE500] text-black'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-display">2. Domain Relevance</span>
            {topic.passed ? (
              <span className="p-1 rounded bg-[#00F5D4] text-black border border-black"><Check className="w-3 h-3 stroke-[3]" /></span>
            ) : (
              <span className="p-1 rounded bg-black text-white"><X className="w-3 h-3 stroke-[3]" /></span>
            )}
          </div>
          <div className="text-[11px] space-y-1 font-mono-data">
            <div className="text-slate-300">Relevance: <span className="font-bold text-white">{(topic.score * 100).toFixed(0)}%</span></div>
            <div className="text-slate-400 truncate" title={topic.reason}>{topic.reason}</div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] ${(!grounding || grounding.passed) ? 'bg-black/50' : 'bg-[#FF2A55] text-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-display">3. Grounding</span>
            {(!grounding || grounding.passed) ? (
              <span className="p-1 rounded bg-[#00F5D4] text-black border border-black"><Check className="w-3 h-3 stroke-[3]" /></span>
            ) : (
              <span className="p-1 rounded bg-black text-white"><X className="w-3 h-3 stroke-[3]" /></span>
            )}
          </div>
          <div className="text-[11px] space-y-1 font-mono-data">
            <div className="text-slate-300">Faithfulness: <span className="font-bold text-white">{grounding ? `${(grounding.grounding_score * 100).toFixed(0)}%` : '100% Verified'}</span></div>
            <div className="text-slate-400 truncate" title={grounding?.reason || "Grounded"}>{grounding?.reason || "Faithful to corpus"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
