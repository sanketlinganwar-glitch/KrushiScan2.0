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
  ArrowLeft,
  WifiOff,
  RefreshCw,
  Sparkles,
  Layers
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
import {
  getQueuedScans,
  deleteQueuedScan,
  updateQueuedScanStatus,
  QueuedScanItem
} from '../lib/offlineKnowledge';
import { analyzeCropImage } from '../lib/gemini';

export const ScanHistory: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const directScanId = searchParams.get('scanId');
  const initialTab = searchParams.get('tab') === 'queue' ? 'queued' : 'completed';

  const [activeTab, setActiveTab] = useState<'completed' | 'queued'>(initialTab);
  const [queuedScans, setQueuedScans] = useState<QueuedScanItem[]>([]);
  const [syncingQueueId, setSyncingQueueId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [deleteQueueId, setDeleteQueueId] = useState<string | null>(null);

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

  const loadQueue = async () => {
    try {
      const items = await getQueuedScans();
      setQueuedScans(items);
    } catch {
      setQueuedScans([]);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

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

  const handleSyncSingleQueued = async (item: QueuedScanItem) => {
    setSyncingQueueId(item.id);
    try {
      await updateQueuedScanStatus(item.id, 'syncing');
      const diagnosis = await analyzeCropImage(
        item.topImageDataUrl,
        item.cropHint,
        item.undersideImageDataUrl
      );
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
      let historyList: ScanResult[] = [];
      if (saved) {
        try {
          historyList = JSON.parse(saved);
        } catch {
          historyList = [];
        }
      }
      const updated = [diagnosis, ...historyList];
      setScans(updated);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SCANS, JSON.stringify(updated));
      await updateQueuedScanStatus(item.id, 'completed', undefined, diagnosis);
      await loadQueue();
    } catch (err: any) {
      console.warn('Failed to sync single queued scan:', err);
      await updateQueuedScanStatus(item.id, 'failed', err?.message || 'Sync failed');
      await loadQueue();
    } finally {
      setSyncingQueueId(null);
    }
  };

  const handleSyncAllQueued = async () => {
    if (isSyncingAll || queuedScans.length === 0) return;
    setIsSyncingAll(true);
    for (const item of queuedScans) {
      if (item.status === 'completed') continue;
      try {
        await updateQueuedScanStatus(item.id, 'syncing');
        const diagnosis = await analyzeCropImage(
          item.topImageDataUrl,
          item.cropHint,
          item.undersideImageDataUrl
        );
        const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
        let historyList: ScanResult[] = [];
        if (saved) {
          try {
            historyList = JSON.parse(saved);
          } catch {
            historyList = [];
          }
        }
        const updated = [diagnosis, ...historyList];
        setScans(updated);
        localStorage.setItem(LOCAL_STORAGE_KEYS.SCANS, JSON.stringify(updated));
        await updateQueuedScanStatus(item.id, 'completed', undefined, diagnosis);
      } catch (err: any) {
        await updateQueuedScanStatus(item.id, 'failed', err?.message || 'Sync failed');
      }
    }
    setIsSyncingAll(false);
    await loadQueue();
  };

  const handleDeleteQueuedItem = async (id: string) => {
    await deleteQueuedScan(id);
    await loadQueue();
    setDeleteQueueId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#152D24] flex items-center gap-2">
            <History className="w-6 h-6 text-[#2F9E59]" />
            <span>{t('navHistory')} (Crop Scan History)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5">
            तुमच्या शेतातील पिकांचे मागील सर्व रोग निदान, फोटो व उपाय
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/scan')}
          leftIcon={<Camera className="w-4 h-4" />}
          className="shadow-xs"
        >
          {t('scanButtonLabel')}
        </Button>
      </div>

      {/* Tabs: Completed Scans vs Queued Scans */}
      <div className="flex items-center gap-2 border-b border-[#DDE8DC] pb-1">
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-[#0B5137] text-white shadow-xs'
              : 'text-[#5F7065] hover:bg-[#E6F2E5]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{language === 'mr' ? 'पूर्ण झालेले स्कॅन' : 'Completed Scans'} ({scans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('queued')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'queued'
              ? 'bg-[#0B5137] text-white shadow-xs'
              : 'text-[#5F7065] hover:bg-[#E6F2E5]'
          }`}
        >
          <WifiOff className="w-4 h-4 text-amber-500" />
          <span>{language === 'mr' ? 'प्रलंबित ऑफलाइन रांग' : 'Offline Scan Queue'}</span>
          {queuedScans.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-amber-950">
              {queuedScans.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 2: Offline Queued Scans View */}
      {activeTab === 'queued' && (
        <div className="space-y-4">
          <Card variant="white" className="p-4 border-[#DDE8DC] bg-amber-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-950">
                    {language === 'mr'
                      ? 'ऑफलाइन स्कॅन रांग (Offline Queue)'
                      : 'Offline Scan Queue'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-900 mt-0.5 leading-relaxed">
                    {language === 'mr'
                      ? 'हे फोटो तुम्ही इंटरनेट नसताना सेव्ह केलेले आहेत. नेटवर्क परत आल्यावर "सिंक करा" बटनावर क्लिक करून तुम्ही क्लाउड AI द्वारे सखोल निदान मिळवू शकता. तुमच्या स्पष्ट मान्यतेशिवाय कोणताही फोटो पाठवला जात नाही.'
                      : 'These photos were saved while offline. When connectivity is restored, click "Sync Now" to process through Gemini AI. Zero silent uploads.'}
                  </p>
                </div>
              </div>

              {queuedScans.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSyncAllQueued}
                  disabled={isSyncingAll}
                  isLoading={isSyncingAll}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="bg-[#0B5137] hover:bg-[#073D2A] text-white shrink-0 text-xs font-bold"
                >
                  {language === 'mr' ? 'सर्व सिंक करा' : 'Sync All'}
                </Button>
              )}
            </div>
          </Card>

          {queuedScans.length === 0 ? (
            <Card variant="white" className="p-10 text-center border-[#DDE8DC]">
              <div className="w-14 h-14 rounded-full bg-[#E6F2E5] text-[#5F7065] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-[#21864A]" />
              </div>
              <h4 className="text-base font-bold text-[#152D24]">
                {language === 'mr' ? 'रांगेत कोणतेही प्रलंबित स्कॅन नाहीत' : 'No Pending Scans in Queue'}
              </h4>
              <p className="text-xs text-[#5F7065] mt-1">
                {language === 'mr'
                  ? 'सर्व ऑफलाइन स्कॅन विश्लेषित झाले आहेत किंवा रांग रिकामी आहे.'
                  : 'All queued items have been processed or the queue is currently empty.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queuedScans.map((item) => (
                <Card
                  key={item.id}
                  variant="white"
                  padding="none"
                  className="overflow-hidden border border-[#DDE8DC] flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-black/80">
                      <img
                        src={item.topImageDataUrl}
                        alt="Queued crop scan"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        {item.status === 'syncing' ? (
                          <Badge variant="warning">
                            <RefreshCw className="w-3 h-3 animate-spin mr-1 inline" />
                            {language === 'mr' ? 'सिंक सुरू...' : 'Syncing...'}
                          </Badge>
                        ) : item.status === 'failed' ? (
                          <Badge variant="danger">
                            <AlertTriangle className="w-3 h-3 mr-1 inline" />
                            {language === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Retry'}
                          </Badge>
                        ) : (
                          <Badge variant="neutral">
                            <WifiOff className="w-3 h-3 mr-1 inline" />
                            {language === 'mr' ? 'रांगेत (Queued)' : 'Queued'}
                          </Badge>
                        )}
                      </div>

                      {item.undersideImageDataUrl && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#2F9E59]" />
                          <span>दुहेरी कोन</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#152D24]">
                          {item.cropHint || 'कापूस / सामान्य पीक'}
                        </span>
                        <span className="text-[10px] text-[#5F7065]">
                          {item.createdAt.slice(0, 10)}
                        </span>
                      </div>

                      {item.errorReason && (
                        <p className="text-[11px] text-[#C83E3E] bg-rose-50 p-2 rounded-lg border border-rose-200">
                          {item.errorReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#F6F8F0] border-t border-[#DDE8DC] flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#C83E3E] hover:bg-red-50"
                      onClick={() => setDeleteQueueId(item.id)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      हटवा
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSyncSingleQueued(item)}
                      disabled={syncingQueueId === item.id || isSyncingAll}
                      isLoading={syncingQueueId === item.id}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                      className="text-xs font-bold bg-[#0B5137] hover:bg-[#073D2A]"
                    >
                      {language === 'mr' ? 'विश्लेषण करा (Sync)' : 'Sync Now'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Completed Scans View */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <Card variant="white" padding="sm" className="bg-white border-[#DDE8DC] shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Search Input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-[#5F7065] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="पीक किंवा रोगाचे नाव शोधा..."
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#152D24] placeholder:text-[#5F7065] focus:outline-hidden focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                />
              </div>

              {/* Crop Filter */}
              <div className="sm:col-span-4">
                <select
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#152D24] focus:outline-hidden focus:ring-2 focus:ring-[#0B5137] shadow-2xs cursor-pointer"
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
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#152D24] focus:outline-hidden focus:ring-2 focus:ring-[#0B5137] shadow-2xs cursor-pointer"
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
        <Card variant="white" className="p-10 text-center border-[#DDE8DC]">
          <div className="w-16 h-16 rounded-full bg-[#E6F2E5] text-[#5F7065] flex items-center justify-center mx-auto mb-3">
            <Camera className="w-8 h-8 text-[#2F9E59]" />
          </div>
          <h4 className="text-base font-bold text-[#152D24]">
            कोणतेही स्कॅन सापडले नाही
          </h4>
          <p className="text-xs text-[#5F7065] max-w-sm mx-auto mt-1">
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
              className="overflow-hidden border border-[#DDE8DC] flex flex-col justify-between group hover:shadow-md transition"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/10] bg-[#152D24] overflow-hidden">
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
                  <div className="absolute bottom-2.5 right-2.5 bg-[#0B5137]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold">
                    <span className="text-[#21864A] font-black">{scan.confidence}%</span> AI विश्वास
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F7065]">
                    <span className="font-semibold text-[#152D24] bg-[#E6F2E5] border border-[#DDE8DC] px-2 py-0.5 rounded">
                      {scan.cropName}
                    </span>
                    <span>{scan.scannedAt}</span>
                  </div>

                  <h4 className="font-extrabold text-base text-[#152D24] leading-tight line-clamp-1">
                    {scan.localDiseaseName?.[language] || scan.diseaseName}
                  </h4>

                  <p className="text-xs text-[#5F7065] line-clamp-2 leading-relaxed">
                    {scan.diagnosisExplanation}
                  </p>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="p-4 pt-2 border-t border-[#DDE8DC] flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5] text-xs"
                  onClick={() => setSelectedScan(scan)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  उपाय पहा
                </Button>

                <button
                  onClick={() => setDeleteId(scan.id)}
                  className="p-2 text-[#5F7065] hover:text-[#C83E3E] rounded-lg hover:bg-red-50 transition"
                  title="हटवा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
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
              <div className="w-full sm:w-48 aspect-square rounded-2xl overflow-hidden bg-[#E6F2E5] border border-[#DDE8DC] shrink-0">
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
                    className="text-xs bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                    onClick={() => handleSpeak(selectedScan)}
                    leftIcon={isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#2F9E59]" />}
                  >
                    {isSpeaking ? 'थांबवा' : 'ऐका'}
                  </Button>
                </div>

                <h3 className="font-extrabold text-xl text-[#152D24]">
                  {selectedScan.localDiseaseName?.[language] || selectedScan.diseaseName}
                </h3>
                <p className="text-xs text-[#5F7065] font-semibold italic">
                  {selectedScan.diseaseName}
                </p>

                <p className="text-xs text-[#152D24] leading-relaxed font-medium">
                  {selectedScan.diagnosisExplanation}
                </p>
              </div>
            </div>

            {/* Treatments */}
            <div className="pt-2 border-t border-[#DDE8DC]">
              <h5 className="font-bold text-sm text-[#0B5137] mb-2">
                शिफारस केलेले उपाय:
              </h5>
              <div className="space-y-2 text-xs text-[#152D24]">
                <div className="bg-[#F6F8F0] p-2.5 rounded-xl border border-[#DDE8DC]">
                  <strong className="text-[#152D24] font-bold block mb-0.5">रासायनिक फवारणी:</strong>
                  {selectedScan.recommendedTreatments.chemical.join(', ')}
                </div>
                <div className="bg-[#F6F8F0] p-2.5 rounded-xl border border-[#DDE8DC]">
                  <strong className="text-[#152D24] font-bold block mb-0.5">जैविक व मशागत:</strong>
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

      {/* Delete Confirmation for Queued Scan Item */}
      <ConfirmationDialog
        isOpen={Boolean(deleteQueueId)}
        onClose={() => setDeleteQueueId(null)}
        onConfirm={() => deleteQueueId && handleDeleteQueuedItem(deleteQueueId)}
        title="हा ऑफलाइन स्कॅन रांगेतून हटवायचा आहे का?"
        message="स्थानिकरित्या साठवलेला फोटो व विनंती कायमस्वरूपी नष्ट केली जाईल."
        confirmText="होय, हटवा"
      />
    </div>
  );
};
