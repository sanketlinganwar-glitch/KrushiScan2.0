import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TankMixCalculator } from '../components/agri/TankMixCalculator';

export const TankMix: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A2540] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'mr' ? 'मुख्यपृष्ठावर परत जा' : language === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            विदर्भ विशेष (Vidarbha Edition)
          </span>
        </div>
      </div>

      {/* Main Interactive Tool */}
      <TankMixCalculator />
    </div>
  );
};
