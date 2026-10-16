import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Calendar, 
  Camera, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ScanResult, SeverityLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Modal } from '../components/ui/Modal';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';
import { speakText, stopSpeaking } from '../lib/speech';

export const ScanHistory: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const directScanId = searchParams.get('scanId');

  const [scans, setScans] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // If URL has ?scanId=..., auto open that scan
  useEffect(() => {
    if (directScanId && scans.length > 0) {
      const match = scans.find((s) => s.id === directScanId);
      if (match) setSelectedScan(match);
    }
  }, [directScanId, scans]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleDelete = () => {
    if (!deleteId) return;
    const remaining = scans.filter((s) => s.id !== deleteId);
    setScans(remaining);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SCANS, JSON.stringify(remaining));
    if (selectedScan?.id === deleteId) setSelectedScan(null);
    setDeleteId(null);
  };

  const filteredScans = scans.filter((s) => {
    const matchesSearch =
      s.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.localDiseaseName?.[language] || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop =
      cropFilter === 'all' ||
      s.cropName.toLowerCase().includes(cropFilter.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || s.severity === severityFilter;

    return matchesSearch && matchesCrop && matchesSeverity;
  });

  const handleSpeak = (scan: ScanResult) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const text = `${scan.cropName} वरील रोग निदान: ${scan.localDiseaseName?.[language] || scan.diseaseName}. तीव्रता: ${scan.severity}. ${scan.diagnosisExplanation}`;
    setIsSpeaking(true);
    speakText(text, language, () => setIsSpeaking(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
            <History className="w-6 h-6 text-[#0A2540]" />
            <span>{t('navHistory')} (Crop Scan History)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
            तुमच्या शेतातील पिकांचे मागील सर्व रोग निदान, फोटो व उपाय
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/scan')}
          leftIcon={<Camera className="w-4 h-4" />}
          className="shadow-sm"
        >
          {t('scanButtonLabel')}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="white" padding="sm" className="bg-white border-[#D5DEE8] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#5B6B7D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="पीक किंवा रोगाचे नाव शोधा..."
              className="w-full bg-white border border-[#D5DEE8] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#0A2540] placeholder:text-[#5B6B7D] focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
            />
          </div>

          {/* Crop Filter */}
          <div className="sm:col-span-4">
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full bg-white border border-[#D5DEE8] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
            >
              <option value="all">सर्व पिके (All Crops)</option>
              <option value="कापूस">कापूस (Cotton)</option>
              <option value="सोयाबीन">सोयाबीन (Soybean)</option>
              <option value="तूर">तूर (Pigeonpea)</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="sm:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-white border border-[#D5DEE8] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
            >
              <option value="all">सर्व तीव्रता (All)</option>
              <option value="Critical">गंभीर (Critical)</option>
              <option value="High">जास्त (High)</option>
              <option value="Moderate">मध्यम (Moderate)</option>
              <option value="Low">कमी (Low)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Scans List / Cards */}
      {filteredScans.length === 0 ? (
        <Card variant="white" className="p-10 text-center border-[#D5DEE8]">
          <div className="w-16 h-16 rounded-full bg-[#EEF3F8] text-[#5B6B7D] flex items-center justify-center mx-auto mb-3">
            <Camera className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-[#0A2540]">
            कोणतेही स्कॅन सापडले नाही
          </h4>
          <p className="text-xs text-[#5B6B7D] max-w-sm mx-auto mt-1">
            शोध निकष बदला किंवा तुमच्या पिकाचा नवीन फोटो काढून तपासणी करा.
          </p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/scan')}>
              आताच पीक स्कॅन करा
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScans.map((scan) => (
            <Card
              key={scan.id}
              variant="white"
              padding="none"
              className="overflow-hidden border border-[#D5DEE8] flex flex-col justify-between group hover:shadow-lg transition"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/10] bg-[#0A2540] overflow-hidden">
                  <img
                    src={scan.imageUrl}
                    alt={scan.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge
                      variant={
                        scan.severity === 'Critical' || scan.severity === 'High'
                          ? 'danger'
                          : scan.severity === 'Moderate'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                      dot
                    >
                      {scan.severity}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-[#0A2540]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold">
                    <span className="text-[#138808] font-black">{scan.confidence}%</span> AI विश्वास
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5B6B7D]">
                    <span className="font-semibold text-[#0A2540] bg-[#EEF3F8] border border-[#D5DEE8] px-2 py-0.5 rounded">
                      {scan.cropName}
                    </span>
                    <span>{scan.scannedAt}</span>
                  </div>

                  <h4 className="font-extrabold text-base text-[#0A2540] leading-tight line-clamp-1">
                    {scan.localDiseaseName?.[language] || scan.diseaseName}
                  </h4>

                  <p className="text-xs text-[#5B6B7D] line-clamp-2 leading-relaxed">
                    {scan.diagnosisExplanation}
                  </p>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="p-4 pt-2 border-t border-[#D5DEE8] flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#0A2540] border-[#D5DEE8] hover:bg-[#EEF3F8] text-xs"
                  onClick={() => setSelectedScan(scan)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  उपाय पहा
                </Button>

                <button
                  onClick={() => setDeleteId(scan.id)}
                  className="p-2 text-[#5B6B7D] hover:text-[#C0392B] rounded-lg hover:bg-red-50 transition"
                  title="हटवा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Scan Result Modal */}
      {selectedScan && (
        <Modal
          isOpen={Boolean(selectedScan)}
          onClose={() => {
            stopSpeaking();
            setIsSpeaking(false);
            setSelectedScan(null);
          }}
          title={selectedScan.cropName}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-48 aspect-square rounded-2xl overflow-hidden bg-[#EEF3F8] border border-[#D5DEE8] shrink-0">
                <img
                  src={selectedScan.imageUrl}
                  alt={selectedScan.diseaseName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      selectedScan.severity === 'Critical' || selectedScan.severity === 'High'
                        ? 'danger'
                        : selectedScan.severity === 'Moderate'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    तीव्रता: {selectedScan.severity}
                  </Badge>
                  <Button
                    variant={isSpeaking ? 'danger' : 'outline'}
                    size="sm"
                    className="text-xs bg-white text-[#0A2540] border-[#D5DEE8]"
                    onClick={() => handleSpeak(selectedScan)}
                    leftIcon={isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#138808]" />}
                  >
                    {isSpeaking ? 'थांबवा' : 'ऐका'}
                  </Button>
                </div>

                <h3 className="font-extrabold text-xl text-[#0A2540]">
                  {selectedScan.localDiseaseName?.[language] || selectedScan.diseaseName}
                </h3>
                <p className="text-xs text-[#5B6B7D] font-semibold italic">
                  {selectedScan.diseaseName}
                </p>

                <p className="text-xs text-[#0A2540] leading-relaxed font-medium">
                  {selectedScan.diagnosisExplanation}
                </p>
              </div>
            </div>

            {/* Treatments */}
            <div className="pt-2 border-t border-[#D5DEE8]">
              <h5 className="font-bold text-sm text-[#138808] mb-2">
                शिफारस केलेले उपाय:
              </h5>
              <div className="space-y-2 text-xs text-[#0A2540]">
                <div className="bg-[#EEF3F8] p-2.5 rounded-xl border border-[#D5DEE8]">
                  <strong className="text-[#0A2540] font-bold block mb-0.5">रासायनिक फवारणी:</strong>
                  {selectedScan.recommendedTreatments.chemical.join(', ')}
                </div>
                <div className="bg-[#EEF3F8] p-2.5 rounded-xl border border-[#D5DEE8]">
                  <strong className="text-[#0A2540] font-bold block mb-0.5">जैविक व मशागत:</strong>
                  {selectedScan.recommendedTreatments.biological.concat(selectedScan.recommendedTreatments.cultural).join(', ')}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setSelectedScan(null);
                }}
              >
                बंद करा
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="हा स्कॅन इतिहास हटवायचा आहे का?"
        message="हा रेकॉर्ड तुमच्या स्कॅन इतिहासातून हटवला जाईल."
        confirmText="होय, हटवा"
      />
    </div>
  );
};
