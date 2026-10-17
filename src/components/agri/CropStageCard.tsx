import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, AlertCircle, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Crop } from '../../types';
import { calculateCropStage } from '../../lib/cropStages';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface CropStageCardProps {
  crop: Crop;
  compact?: boolean;
}

export const CropStageCard: React.FC<CropStageCardProps> = ({ crop, compact = false }) => {
  const { language } = useLanguage();
  const stage = calculateCropStage(crop);

  return (
    <Card className="p-4 border-[#D5DEE8] hover:border-emerald-500/50 transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Sprout className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#0A2540]">
              {crop.localName?.[language] || crop.name}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {crop.plotName} • {crop.areaAcres} एकर
            </span>
          </div>
        </div>

        <Badge variant="success" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
          {stage.seasonBadge[language]}
        </Badge>
      </div>

      {/* Stage Progress Bar */}
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-emerald-800 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            {stage.stageName[language]}
          </span>
          <span className="text-slate-500 text-[11px] font-medium">
            दिवस {stage.daysAfterSowing} / {stage.totalSeasonDays} ({stage.progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${stage.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Urgent Warning if any */}
      {stage.urgentAlert && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-semibold leading-tight">
            {stage.urgentAlert[language]}
          </p>
        </div>
      )}

      {/* Active Stage Advisory */}
      {!compact && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
          <p className="font-medium text-slate-800 leading-snug">
            <strong>{language === 'mr' ? 'हंगाम सल्ला:' : language === 'hi' ? 'सलाह:' : 'Advisory:'}</strong>{' '}
            {stage.activeAdvisory[language]}
          </p>
          <p className="text-emerald-700 font-semibold pt-1">
            👉 {stage.recommendedAction[language]}
          </p>
        </div>
      )}

      {/* Action link */}
      {stage.actionLink && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
          <Link 
            to={stage.actionLink}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 transition-colors"
          >
            <span>{language === 'mr' ? 'शिफारस केलेले उपाय पहा' : language === 'hi' ? 'सुझाव देखें' : 'View Action'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </Card>
  );
};
