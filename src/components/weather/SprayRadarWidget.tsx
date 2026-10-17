import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CloudRain, 
  Wind, 
  Clock, 
  ChevronRight, 
  Info, 
  Droplet,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SprayWindowAdvisory } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface SprayRadarWidgetProps {
  sprayWindow?: SprayWindowAdvisory;
  district?: string;
}

export const SprayRadarWidget: React.FC<SprayRadarWidgetProps> = ({ 
  sprayWindow, 
  district = 'यवतमाळ (Yavatmal)' 
}) => {
  const { language } = useLanguage();
  const [showHourly, setShowHourly] = useState(false);

  if (!sprayWindow) return null;

  const { currentStatus, headline, recommendation, washOffRiskPercentage, bestSpraySlot, hourlyRadar } = sprayWindow;

  // Status visual variants
  const statusStyles = {
    safe: {
      bg: 'bg-gradient-to-r from-emerald-900 to-teal-900 text-white border-emerald-700/60',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: { mr: 'फवारणीसाठी अनुकूल', hi: 'छिड़काव के लिए सुरक्षित', en: 'Safe to Spray' },
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      meterColor: 'bg-emerald-400',
    },
    caution: {
      bg: 'bg-gradient-to-r from-amber-950 to-orange-950 text-white border-amber-700/60',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeText: { mr: 'मध्यम धोका (स्टिकर वापरा)', hi: 'मध्यम जोखिम (स्टीकर जरूरी)', en: 'Caution: Use Sticker' },
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      meterColor: 'bg-amber-400',
    },
    danger: {
      bg: 'bg-gradient-to-r from-rose-950 to-red-950 text-white border-rose-700/60',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      badgeText: { mr: 'फवारणी करू नका (पाऊस/वारा)', hi: 'छिड़काव न करें (बारिश/हवा)', en: 'Do Not Spray' },
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      meterColor: 'bg-rose-500',
    },
  }[currentStatus];

  const CurrentIcon = statusStyles.icon;

  return (
    <Card className={`relative overflow-hidden border shadow-md transition-all duration-300 ${statusStyles.bg}`}>
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-5 relative z-10">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-white flex items-center justify-center">
              <Droplet className="w-4 h-4 text-emerald-300" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-200">
                  {language === 'mr' ? 'सुरक्षा फवारणी रडार' : language === 'hi' ? 'सुरक्षा स्प्रे रडार' : 'Suraksha Spray Radar'}
                </h3>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                  AI + Open-Meteo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {district} • {language === 'mr' ? '२४ तास हवामान विश्लेषण' : language === 'hi' ? '24 घंटे मौसम विश्लेषण' : '24-hr spray feasibility'}
              </p>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles.badgeBg}`}>
            <CurrentIcon className={`w-3.5 h-3.5 ${statusStyles.iconColor}`} />
            <span>{statusStyles.badgeText[language]}</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-2">
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {headline[language]}
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {recommendation[language]}
            </p>

            {/* Best Window Pill */}
            <div className="inline-flex items-center gap-2 pt-1 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                <strong>{language === 'mr' ? 'उत्कृष्ट वेळ:' : language === 'hi' ? 'सर्वोत्तम समय:' : 'Best Slot:'}</strong>{' '}
                <span className="text-white font-medium">{bestSpraySlot}</span>
              </span>
            </div>
          </div>

          {/* Wash-Off Risk Gauge */}
          <div className="md:col-span-4 bg-black/25 rounded-xl p-3 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {language === 'mr' ? 'पावसाने वाहून जाण्याचा धोका:' : language === 'hi' ? 'बारिश से दवा बहने का जोखिम:' : 'Wash-Off Risk:'}
              </span>
              <span className="font-bold text-white">{washOffRiskPercentage}%</span>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${statusStyles.meterColor}`}
                style={{ width: `${washOffRiskPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{language === 'mr' ? 'कमी (सुरक्षित)' : 'Low'}</span>
              <span>{language === 'mr' ? 'मध्यम' : 'Med'}</span>
              <span>{language === 'mr' ? 'गंभीर' : 'High'}</span>
            </div>
          </div>
        </div>

        {/* Toggle Hourly Radar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setShowHourly(!showHourly)}
            className="text-xs text-emerald-300 hover:text-emerald-200 font-medium flex items-center gap-1 transition-colors"
          >
            <span>
              {showHourly
                ? (language === 'mr' ? 'तासानुसार माहिती लपवा' : language === 'hi' ? 'घंटेवार रडार छिपाएं' : 'Hide Hourly Radar')
                : (language === 'mr' ? 'पुढील १२ तासांचे तासानुसार रडार पहा' : language === 'hi' ? 'अगले 12 घंटों का रडार देखें' : 'View Next 12-Hour Spray Forecast')}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showHourly ? 'rotate-90' : ''}`} />
          </button>

          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            {language === 'mr' ? 'PDKV अकोला मार्गदर्शक तत्त्वे' : 'Dr. PDKV Akola Norms'}
          </span>
        </div>

        {/* Hourly Horizontal Timeline */}
        {showHourly && (
          <div className="mt-3 pt-3 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs text-slate-300 mb-2 font-medium">
              {language === 'mr' 
                ? 'विदर्भ शेतकरी फवारणी टाइमलाइन (वारा आणि पावसाचा अंदाज):' 
                : 'Hour-by-Hour Spray Feasibility Radar (Wind & Rain Probability):'}
            </p>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
              {hourlyRadar.map((hour, idx) => {
                const hourColor = hour.status === 'safe'
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : hour.status === 'caution'
                  ? 'border-amber-500/40 bg-amber-950/40 text-amber-200'
                  : 'border-rose-500/40 bg-rose-950/40 text-rose-200';

                return (
                  <div 
                    key={idx}
                    className={`shrink-0 w-28 p-2.5 rounded-lg border text-center space-y-1 ${hourColor} backdrop-blur-xs`}
                  >
                    <div className="text-xs font-bold text-white">{hour.timeStr}</div>
                    <div className="text-sm font-semibold">{hour.temp}°C</div>

                    <div className="flex items-center justify-center gap-1 text-[11px]">
                      <CloudRain className="w-3 h-3 shrink-0" />
                      <span>{hour.rainProb}%</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-[11px]">
                      <Wind className="w-3 h-3 shrink-0" />
                      <span>{hour.windSpeed} km/h</span>
                    </div>

                    <div className="mt-1 pt-1 border-t border-white/10 text-[10px] font-medium leading-tight line-clamp-2">
                      {hour.reason[language]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
