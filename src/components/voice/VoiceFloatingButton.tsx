import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface VoiceFloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const VoiceFloatingButton: React.FC<VoiceFloatingButtonProps> = ({ onClick, isOpen }) => {
  const { language } = useLanguage();

  if (isOpen) return null;

  const tooltipText =
    language === 'mr'
      ? 'कृषी मित्र व्हॉइस (बोलून विचारा)'
      : language === 'hi'
      ? 'कृषि मित्र वॉयस (बोलकर पूछें)'
      : 'Krushi Mitra Voice (Speak to AI)';

  const badgeText =
    language === 'mr'
      ? 'कृषी मित्र'
      : language === 'hi'
      ? 'कृषि मित्र'
      : 'Voice AI';

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 group animate-in fade-in duration-300">
      {/* Tooltip on hover/focus */}
      <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0B5137] text-white text-xs font-bold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2F9E59]" />
          {tooltipText}
        </span>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label={tooltipText}
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0B5137] hover:bg-[#073D2A] text-white shadow-xl shadow-[#0B5137]/30 border-2 border-[#2F9E59] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#2F9E59]/50"
      >
        {/* Pulsing glow ring in Leaf Green */}
        <span className="absolute -inset-1 rounded-full bg-[#2F9E59]/30 animate-ping pointer-events-none" />

        {/* Mic Icon */}
        <div className="relative flex items-center justify-center">
          <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform group-hover:scale-110" />
        </div>

        {/* Mini badge on button */}
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-[#2F9E59] text-[9px] font-black text-white uppercase tracking-wider border border-white shadow-xs">
          {badgeText}
        </span>
      </button>
    </div>
  );
};
