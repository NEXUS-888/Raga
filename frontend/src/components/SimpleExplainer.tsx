import React from 'react';
import { Mic, Zap, ShieldCheck, Database, HelpCircle, ArrowRight } from 'lucide-react';

interface SimpleExplainerProps {
  onTrySample: (text: string) => void;
}

export const SimpleExplainer: React.FC<SimpleExplainerProps> = ({ onTrySample }) => {
  const steps = [
    {
      step: "01",
      title: "Speak or Drag Mic",
      badge: "Voice & Real-Time",
      color: "bg-[#FFE500] text-black",
      desc: "Pull down the retro studio mic in the top right to talk in English or Hindi. What you say is recognized live on screen.",
      icon: Mic,
    },
    {
      step: "02",
      title: "Verified Fact Search",
      badge: "Zero Guesswork",
      color: "bg-[#00F5D4] text-black",
      desc: "Our neural index searches genuine facts about Goa, Indian heritage, culture, and science instantly.",
      icon: Database,
    },
    {
      step: "03",
      title: "Sub-200ms Answer",
      badge: "Faster Than a Blink",
      color: "bg-[#FF2A55] text-white",
      desc: "Answers return in under 0.15s (faster than human eye blink at 0.3s) powered by Groq & HNSW.",
      icon: Zap,
    },
    {
      step: "04",
      title: "Strict Safety & Truth",
      badge: "No Hallucinations",
      color: "bg-[#3A86FF] text-white",
      desc: "If a question is outside Goa records or unsafe, our AI politely refuses rather than giving false information.",
      icon: ShieldCheck,
    },
  ];

  const quickSamples = [
    { label: "🌴 Goa Capital & Culture", query: "What is the capital of Goa and official language?" },
    { label: "🇮🇳 गोवा की आधिकारिक भाषा (Hindi)", query: "गोवा की राजधानी क्या है और आधिकारिक भाषा कौन सी है?" },
    { label: "⚡ Sub-10ms Vector Search", query: "How does HNSW indexing enable sub-10ms vector search?" },
    { label: "🛡️ Off-Topic Rejection Test", query: "What is the secret recipe for baking a chocolate cake?" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner in Memphis Graphic Style */}
      <div className="memphis-card-cream p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="sticker-badge bg-[#FF2A55] text-white">#RAGInGoa</span>
              <span className="sticker-badge bg-[#FFE500] text-black">Voice-Enabled AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display tracking-tight">
              Instant Goa Voice Assistant
            </h2>
          </div>
          <div className="px-4 py-2 bg-[#FFE500] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] font-mono-data text-xs font-bold text-black flex items-center space-x-1.5">
            <Zap className="w-4 h-4 fill-current text-black" />
            <span>&lt; 200ms Latency Target</span>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-800 leading-relaxed max-w-3xl">
          An ultra-fast voice search system that grounds all answers in verified facts with strict refusal guardrails. Pull the hanging mic in the top right to start speaking!
        </p>

        {/* 4 Graphic Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono-data font-black border border-black ${st.color}`}>
                    {st.step} • {st.badge}
                  </span>
                  <div className="p-1.5 rounded-lg bg-black text-white">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-display">{st.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompts Shelf */}
      <div className="memphis-card p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FFE500] uppercase tracking-wider font-display">
          <HelpCircle className="w-4 h-4" />
          <span>Click to Test Any Question Instantly:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {quickSamples.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => onTrySample(sample.query)}
              className="btn-memphis-dark p-3 text-left rounded-xl flex items-center justify-between text-xs transition-all group"
            >
              <span className="font-bold text-slate-100 group-hover:text-white truncate">{sample.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF2A55] group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
