import React from 'react';
import { X, Check, Globe, Sparkles } from 'lucide-react';

export interface LanguageOption {
  code: string;
  nativeName: string;
  englishName: string;
  status: 'validated' | 'experimental';
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Validated Corpus Languages
  { code: 'auto', nativeName: 'Auto', englishName: 'Auto detect', status: 'validated', speechCode: 'en-IN' },
  { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi', status: 'validated', speechCode: 'hi-IN' },
  { code: 'hinglish', nativeName: 'Hinglish', englishName: 'Hinglish', status: 'validated', speechCode: 'hi-IN' },
  { code: 'en', nativeName: 'English', englishName: 'English', status: 'validated', speechCode: 'en-IN' },
  { code: 'kok', nativeName: 'कोंकणी', englishName: 'Konkani', status: 'validated', speechCode: 'kok-IN' },
  
  // Accepted by API (Experimental)
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', status: 'experimental', speechCode: 'mr-IN' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', status: 'experimental', speechCode: 'bn-IN' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', status: 'experimental', speechCode: 'ta-IN' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', status: 'experimental', speechCode: 'te-IN' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', status: 'experimental', speechCode: 'gu-IN' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', status: 'experimental', speechCode: 'kn-IN' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', status: 'experimental', speechCode: 'ml-IN' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', status: 'experimental', speechCode: 'pa-IN' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', status: 'experimental', speechCode: 'or-IN' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', status: 'experimental', speechCode: 'as-IN' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', status: 'experimental', speechCode: 'ne-NP' },
];

interface LanguagePickerModalProps {
  isOpen: boolean;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  isOpen,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}) => {
  if (!isOpen) return null;

  const validatedList = SUPPORTED_LANGUAGES.filter(l => l.status === 'validated');
  const experimentalList = SUPPORTED_LANGUAGES.filter(l => l.status === 'experimental');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-md bg-[#0F1123] border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#151833]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#FF2A55] text-white rounded-xl shadow-md">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display tracking-wide uppercase">
                Spoken Language Hint
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Select language or keep on Auto detect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Language List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Section 1: Validated Corpus Languages */}
          <div>
            <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider mb-2 px-1 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Validated Corpus Languages</span>
            </div>
            <div className="space-y-1.5">
              {validatedList.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-500 shadow-md text-white'
                        : 'bg-[#181B38]/60 border-slate-800 text-slate-300 hover:bg-[#1E2248] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold">{lang.nativeName}</span>
                      <span className="text-xs text-slate-400">({lang.englishName})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                        Validated
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Accepted by API (Experimental) */}
          <div>
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-2 px-1">
              Accepted by API (Not Benchmarked)
            </div>
            <div className="space-y-1.5">
              {experimentalList.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-500 shadow-md text-white'
                        : 'bg-[#14162E]/50 border-slate-850 text-slate-300 hover:bg-[#1A1D3D] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold">{lang.nativeName}</span>
                      <span className="text-[11px] text-slate-400">({lang.englishName})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-800/80 border border-slate-700 text-slate-400">
                        Experimental
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#111326] border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            Powered by Sarvam AI Saaras Indic STT &amp; Web Speech API
          </p>
        </div>
      </div>
    </div>
  );
};
