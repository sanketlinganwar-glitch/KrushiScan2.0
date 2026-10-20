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
    <Card className="p-4 border-[#DDE8DC] hover:border-[#2F9E59]/50 transition-all duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#DDE8DC]/60">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#E6F2E5] text-[#2F9E59]">
            <Sprout className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#152D24]">
              {crop.localName?.[language] || crop.name}
            </h4>
            <span className="text-[11px] text-[#5F7065] font-medium">
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
          <span className="font-semibold text-[#0B5137] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#2F9E59]" />
            {stage.stageName[language]}
          </span>
          <span className="text-[#5F7065] text-[11px] font-medium">
            दिवस {stage.daysAfterSowing} / {stage.totalSeasonDays} ({stage.progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-[#F6F8F0] rounded-full h-2 overflow-hidden border border-[#DDE8DC]">
          <div 
            className="h-full bg-gradient-to-r from-[#2F9E59] to-[#0B5137] rounded-full transition-all duration-500"
            style={{ width: `${stage.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Urgent Warning if any */}
      {stage.urgentAlert && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-[#E9A23B]/30 text-xs text-amber-950 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#E9A23B] shrink-0 mt-0.5" />
          <p className="font-semibold leading-tight">
            {stage.urgentAlert[language]}
          </p>
        </div>
      )}

      {/* Active Stage Advisory */}
      {!compact && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] text-xs text-[#5F7065] space-y-1">
          <p className="font-medium text-[#152D24] leading-snug">
            <strong>{language === 'mr' ? 'हंगाम सल्ला:' : language === 'hi' ? 'सलाह:' : 'Advisory:'}</strong>{' '}
            {stage.activeAdvisory[language]}
          </p>
          <p className="text-[#21864A] font-semibold pt-1">
            👉 {stage.recommendedAction[language]}
          </p>
        </div>
      )}

      {/* Action link */}
      {stage.actionLink && (
        <div className="mt-3 pt-2 border-t border-[#DDE8DC]/60 flex justify-end">
          <Link 
            to={stage.actionLink}
            className="text-xs text-[#0B5137] hover:text-[#2F9E59] font-bold flex items-center gap-1 transition-colors"
          >
            <span>{language === 'mr' ? 'शिफारस केलेले उपाय पहा' : language === 'hi' ? 'सुझाव देखें' : 'View Action'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </Card>
  );
};
