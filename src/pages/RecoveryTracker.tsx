import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Camera, 
  ArrowRight, 
  Plus, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { RecoveryLog, SeverityLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';

const INITIAL_RECOVERY_LOGS: RecoveryLog[] = [
  {
    id: 'rec-1',
    scanId: 'sample-scan-1',
    cropId: 'crop-cotton-1',
    cropName: 'कापूस - विहीर लगत (Cotton)',
    originalDisease: 'गुलाबी बोंडअळी (Pink Bollworm)',
    initialSeverity: 'High',
    currentStatus: 'improving',
    treatmentApplied: 'प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) + एकरी ५ कामगंध सापळे',
    startDate: '१० ऑक्टोबर २०२४',
    lastUpdated: '१४ ऑक्टोबर २०२४',
    initialImageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
    latestImageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
    observations: [
      '१० ऑक्टोबर: ५ एकरावर फवारणी पूर्ण केली.',
      '१२ ऑक्टोबर: कामगंध सापळ्यात २ पतंग सापडले (संख्या घटली).',
      '१४ ऑक्टोबर: नवीन पात्या निरोगी दिसत आहेत.',
    ],
    timeline: [
      {
        date: '१० ऑक्टोबर २०२४',
        note: 'रोग निदान झाले व पहिली फवारणी केली.',
        status: 'उपचार सुरू',
        photoUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&auto=format&fit=crop&q=80',
      },
      {
        date: '१२ ऑक्टोबर २०२४',
        note: 'कामगंध सापळे लावले. निरीक्षण सुरू केले.',
        status: 'निरीक्षण',
      },
      {
        date: '१४ ऑक्टोबर २०२४',
        note: 'नवीन फुलोरा चांगला येत आहे. किडीचा प्रादुर्भाव कमी झाला.',
        status: 'सुधारणा दिसून येत आहे',
        photoUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'rec-2',
    scanId: 'sample-scan-2',
    cropId: 'crop-soybean-1',
    cropName: 'सोयाबीन - रस्त्यालगत (Soybean)',
    originalDisease: 'पिवळा मोझॅक (Yellow Mosaic)',
    initialSeverity: 'Moderate',
    currentStatus: 'recovered',
    treatmentApplied: 'रोगट झाडे नष्ट केली + थायामेथोक्साम २५% WG फवारणी',
    startDate: '१ ऑक्टोबर २०२४',
    lastUpdated: '१२ ऑक्टोबर २०२४',
    initialImageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&auto=format&fit=crop&q=80',
    latestImageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
    observations: [
      '१ ऑक्टोबर: रोगट झाडे उपटून काढली.',
      '५ ऑक्टोबर: पांढरी माशी पूर्ण नियंत्रणात आली.',
      '१२ ऑक्टोबर: शेंगा भरण्याची स्थिती उत्तम, पीक पूर्ववत झाले.',
    ],
    timeline: [
      {
        date: '१ ऑक्टोबर २०२४',
        note: 'पिवळा मोझॅक ओळखला, पांढऱ्या माशीवर फवारणी.',
        status: 'उपचार सुरू',
      },
      {
        date: '१२ ऑक्टोबर २०२४',
        note: 'पीक निरोगी स्थितीत परत आले. सुधारणा पूर्ण.',
        status: 'पूर्ण सुधारणा (Recovered)',
      },
    ],
  },
];

export const RecoveryTracker: React.FC = () => {
  const { t, language } = useLanguage();

  const [logs, setLogs] = useState<RecoveryLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.RECOVERY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_RECOVERY_LOGS;
  });

  const [selectedLog, setSelectedLog] = useState<RecoveryLog>(logs[0]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState<RecoveryLog['currentStatus']>('improving');
  const [followupImage, setFollowupImage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.RECOVERY, JSON.stringify(logs));
  }, [logs]);

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote) return;

    const updatedTimelineItem = {
      date: new Date().toLocaleDateString('mr-IN'),
      note: newNote,
      status: newStatus === 'recovered' ? 'पूर्ण सुधारणा' : newStatus === 'improving' ? 'सुधारणा सुरू' : 'स्थिर स्थिती',
      photoUrl: followupImage || undefined,
    };

    const updatedLog: RecoveryLog = {
      ...selectedLog,
      currentStatus: newStatus,
      lastUpdated: new Date().toLocaleDateString('mr-IN'),
      latestImageUrl: followupImage || selectedLog.latestImageUrl,
      observations: [...selectedLog.observations, `${new Date().toLocaleDateString('mr-IN')}: ${newNote}`],
      timeline: [...selectedLog.timeline, updatedTimelineItem],
    };

    const newLogs = logs.map((l) => (l.id === selectedLog.id ? updatedLog : l));
    setLogs(newLogs);
    setSelectedLog(updatedLog);

    setNewNote('');
    setFollowupImage(null);
    setIsUploadModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFollowupImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#0A2540]" />
          <span>{t('navRecovery')} (Crop Recovery Tracker)</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
          फवारणी व उपचारानंतर पिकात झालेला प्रत्यक्ष फरक, निरीक्षणे व आधी/नंतरचा फोटो तपासा
        </p>
      </div>

      {/* Main Grid: Left List + Right Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tracked Crops List */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-sm font-bold text-[#0A2540] uppercase tracking-wide px-1">
            उपचार चालू असलेली पिके ({logs.length})
          </h4>

          {logs.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <Card
                key={log.id}
                variant="white"
                padding="md"
                interactive
                onClick={() => setSelectedLog(log)}
                className={`border-2 transition ${
                  isSelected ? 'border-[#0A2540] shadow-md ring-2 ring-[#0A2540]/20' : 'border-[#D5DEE8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Badge
                      variant={
                        log.currentStatus === 'recovered'
                          ? 'success'
                          : log.currentStatus === 'improving'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                      dot
                    >
                      {log.currentStatus === 'recovered'
                        ? 'पूर्ण सुधारणा (Recovered)'
                        : log.currentStatus === 'improving'
                        ? 'सुधारणा होत आहे (Improving)'
                        : 'स्थिर स्थिती (Monitoring)'}
                    </Badge>
                    <h4 className="font-bold text-base text-[#0A2540]">
                      {log.cropName}
                    </h4>
                    <p className="text-xs font-semibold text-[#C0392B]">
                      मूळ रोग: {log.originalDisease}
                    </p>
                  </div>

                  <span className="text-[11px] text-[#5B6B7D] shrink-0">
                    {log.lastUpdated}
                  </span>
                </div>

                <p className="text-xs text-[#5B6B7D] line-clamp-1 mt-2 font-medium">
                  उपचार: {log.treatmentApplied}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Selected Recovery Detail with Before/After Comparison */}
        {selectedLog && (
          <div className="lg:col-span-7 space-y-5">
            {/* Top Card: Before vs After Photo Comparison */}
            <Card variant="white" className="p-5 border-[#D5DEE8]">
              <div className="flex items-center justify-between pb-3 border-b border-[#D5DEE8] mb-4">
                <div>
                  <h3 className="font-black text-lg text-[#0A2540]">
                    {selectedLog.cropName}
                  </h3>
                  <p className="text-xs text-[#5B6B7D]">
                    सुरुवात: {selectedLog.startDate} • ताजी नोंद: {selectedLog.lastUpdated}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  नवीन फोटो / प्रगती नोंदवा
                </Button>
              </div>

              {/* Before vs After Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0A2540]">
                    <span>पूर्वीची स्थिती (Before)</span>
                    <span className="text-[#C0392B] font-semibold">{selectedLog.initialSeverity}</span>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0B1626] border border-[#D5DEE8] shadow-sm relative">
                    <img
                      src={selectedLog.initialImageUrl}
                      alt="Before treatment"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#0B1626]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      {selectedLog.startDate}
                    </div>
                  </div>
                </div>

                {/* After Photo */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0A2540]">
                    <span>सध्याची स्थिती (After / Current)</span>
                    <span className="text-[#138808] font-semibold">
                      {selectedLog.currentStatus === 'recovered' ? 'निरोगी' : 'सुधारणा'}
                    </span>
                  </div>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0B1626] border border-[#D5DEE8] shadow-sm relative flex items-center justify-center">
                    {selectedLog.latestImageUrl ? (
                      <>
                        <img
                          src={selectedLog.latestImageUrl}
                          alt="After treatment"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-[#138808]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                          {selectedLog.lastUpdated}
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-[#5B6B7D] mx-auto mb-1" />
                        <p className="text-xs text-[#5B6B7D]">नवीन फोटो अपलोड करा</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Treatment Applied Box */}
              <div className="mt-4 p-3 rounded-xl bg-[#EEF3F8] border border-[#D5DEE8] text-xs">
                <span className="font-bold text-[#0A2540] block mb-0.5">
                  केलेला उपचार / फवारणी:
                </span>
                <span className="text-[#0A2540] font-medium">
                  {selectedLog.treatmentApplied}
                </span>
              </div>
            </Card>

            {/* Recovery Timeline */}
            <Card variant="white" className="p-5 border-[#D5DEE8]">
              <h4 className="font-bold text-sm text-[#0A2540] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#138808]" />
                <span>सुधारणा कालक्रम (Timeline & Farmer Notes)</span>
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5DEE8]">
                {selectedLog.timeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Bullet */}
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#138808] ring-4 ring-[#138808]/20" />

                    <div className="bg-[#EEF3F8] border border-[#D5DEE8] rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#0A2540]">{item.status}</span>
                        <span className="text-[11px] text-[#5B6B7D]">{item.date}</span>
                      </div>
                      <p className="text-xs text-[#0A2540] leading-relaxed font-medium">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Add Followup Observation & Photo Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="पिकाची नवीन प्रगती नोंदवा"
        maxWidth="md"
      >
        <form onSubmit={handleAddFollowup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              सध्याची आरोग्य प्रगती
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="improving">सुधारणा होत आहे (Improving)</option>
              <option value="recovered">पूर्णपणे बरे झाले (Fully Recovered)</option>
              <option value="stable">स्थिती स्थिर आहे (Stable / Monitoring)</option>
              <option value="deteriorating">रोग वाढला आहे (Deteriorating - Re-spray needed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              तुमचे निरीक्षण / शेतातील फरक
            </label>
            <textarea
              required
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="उदा. फवारणीनंतर किडींची संख्या कमी झाली आहे, नवीन फुटवे निरोगी आले आहेत..."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              नवीन फोटो अपलोड करा (Follow-up Photo)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-agri-primary file:text-white hover:file:bg-agri-dark"
            />
          </div>

          {followupImage && (
            <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
              <img src={followupImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button type="submit" variant="primary">
              नोंद जतन करा
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
