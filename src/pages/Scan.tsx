import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  Trash2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  PlusCircle, 
  ArrowLeft,
  RefreshCw,
  Info,
  Crosshair,
  Target,
  Layers,
  WifiOff
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { analyzeCropImage, isGeminiConfigured } from '../lib/gemini';
import { enqueueOfflineScan } from '../lib/offlineKnowledge';
import { ScanResult, SeverityLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { speakText, stopSpeaking } from '../lib/speech';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';
import { 
  compressCropImage, 
  validateImageFile, 
  validateImageContent,
  getLocalizedBlankImageError,
  formatBytes, 
  CompressionResult 
} from '../lib/imageCompression';
import confetti from 'canvas-confetti';

export const Scan: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Workflow states
  const [selectedCrop, setSelectedCrop] = useState<string>('auto');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [undersideImageSrc, setUndersideImageSrc] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<'top' | 'underside'>('top');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [addedToRecovery, setAddedToRecovery] = useState<boolean>(false);
  const [showSymptomBoxes, setShowSymptomBoxes] = useState<boolean>(true);
  const [selectedSymptomBox, setSelectedSymptomBox] = useState<string | null>(null);

  // Client-side smart image compression states
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [undersideCompressionStats, setUndersideCompressionStats] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSavingOffline, setIsSavingOffline] = useState<boolean>(false);
  const [offlineSaveNotice, setOfflineSaveNotice] = useState<string | null>(null);
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream when leaving
  useEffect(() => {
    return () => {
      stopCamera();
      stopSpeaking();
    };
  }, []);

  // Connect stream to video element whenever camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Camera video play interrupted:', err);
      });
    }
  }, [isCameraActive]);

  const startCamera = async (slot: 'top' | 'underside' = 'top') => {
    setActiveSlot(slot);
    setCameraError(null);
    setUploadError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser environment');
      }

      // Try preferred rear environment camera, fallback to default video device
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('Ideal environment camera constraint failed, falling back to default camera:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      // If video element is already mounted, attach immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Initial video play warning:', playErr);
        });
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      let message = 'कॅमेरा सुरू करता आला नाही. कृपया खालील "गॅलरीतून फोटो निवडा" किंवा नमुना फोटो वापरा.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        message = 'कॅमेरा परवानगी नाकारली गेली आहे. कृपया ब्राउझर सेटिंग्जमध्ये जाऊन KrushiScan साठी कॅमेरा सुरू करण्याची परवानगी द्या.';
      } else if (!window.isSecureContext) {
        message = 'कॅमेऱ्यासाठी सुरक्षित HTTPS कनेक्शन आवश्यक आहे. कृपया HTTPS वर वेबसाइट उघडा.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        message = 'या डिव्हाइसवर कोणताही सक्रिय कॅमेरा आढळला नाही. कृपया गॅलरीतून फोटो निवडा.';
      }
      setCameraError(message);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    // Validate video element readiness before drawing
    if (
      videoRef.current.readyState < 2 ||
      videoRef.current.videoWidth === 0 ||
      videoRef.current.videoHeight === 0
    ) {
      setCameraError(
        language === 'en'
          ? 'Photo capture failed. Please allow camera access and try again.'
          : language === 'hi'
          ? 'फोटो कैप्चर विफल रहा। कृपया कैमरा एक्सेस की अनुमति दें और पुनः प्रयास करें।'
          : 'फोटो काढणे अयशस्वी झाले. कृपया कॅमेरा परवानगी तपासा आणि पुन्हा प्रयत्न करा.'
      );
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError(
        language === 'en'
          ? 'Could not initialize camera canvas context.'
          : 'कॅनव्हास सुरू करता आला नाही. कृपया पुन्हा प्रयत्न करा.'
      );
      return;
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.90);

    // Validate captured content BEFORE accepting it
    const validation = await validateImageContent(rawDataUrl, language as 'mr' | 'hi' | 'en');
    if (!validation.valid) {
      setCameraError(validation.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
      stopCamera();
      return;
    }

    stopCamera();

    // Optimize camera capture to guarantee max 1280px standard diagnostic format
    setIsCompressing(true);
    try {
      const compressed = await compressCropImage(rawDataUrl, {
        maxDimension: 1280,
        quality: 0.82,
      });

      // Verify compressed output is not blank
      const compValidation = await validateImageContent(compressed.dataUrl, language as 'mr' | 'hi' | 'en');
      if (!compValidation.valid) {
        setUploadError(compValidation.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
        return;
      }

      if (activeSlot === 'top') {
        setImageSrc(compressed.dataUrl);
        setCompressionStats(compressed);
      } else {
        setUndersideImageSrc(compressed.dataUrl);
        setUndersideCompressionStats(compressed);
      }
    } catch (err) {
      console.warn('Camera photo compression fallback:', err);
      if (activeSlot === 'top') {
        setImageSrc(rawDataUrl);
      } else {
        setUndersideImageSrc(rawDataUrl);
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const triggerFileInput = (slot: 'top' | 'underside') => {
    setActiveSlot(slot);
    setUploadError(null);
    setCameraError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setCameraError(null);

    // 1. Validate MIME type and file integrity
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'असमर्थित फोटो प्रकार.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate pixel content (not blank, black, white, transparent, uniform)
    const contentCheck = await validateImageContent(file, language as 'mr' | 'hi' | 'en');
    if (!contentCheck.valid) {
      setUploadError(contentCheck.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressCropImage(file, {
        maxDimension: 1280,
        quality: 0.82,
      });

      // Verify compressed output is also valid
      const compValidation = await validateImageContent(compressed.dataUrl, language as 'mr' | 'hi' | 'en');
      if (!compValidation.valid) {
        setUploadError(compValidation.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
        return;
      }

      if (activeSlot === 'top') {
        setImageSrc(compressed.dataUrl);
        setCompressionStats(compressed);
      } else {
        setUndersideImageSrc(compressed.dataUrl);
        setUndersideCompressionStats(compressed);
      }
      stopCamera();
    } catch (err: any) {
      console.warn('Client-side compression fallback:', err);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const raw = event.target?.result as string;
        const rawCheck = await validateImageContent(raw, language as 'mr' | 'hi' | 'en');
        if (!rawCheck.valid) {
          setUploadError(rawCheck.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
          return;
        }
        if (activeSlot === 'top') {
          setImageSrc(raw);
        } else {
          setUndersideImageSrc(raw);
        }
        stopCamera();
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveSlot = (slot: 'top' | 'underside') => {
    if (slot === 'top') {
      setImageSrc(null);
      setCompressionStats(null);
    } else {
      setUndersideImageSrc(null);
      setUndersideCompressionStats(null);
    }
  };

  const handleReset = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setImageSrc(null);
    setUndersideImageSrc(null);
    setResult(null);
    setAddedToRecovery(false);
    setCompressionStats(null);
    setUndersideCompressionStats(null);
    setUploadError(null);
    setOfflineSaveNotice(null);
    setActiveSlot('top');
  };

  const handleQueueOffline = async () => {
    if (!imageSrc) return;
    setIsSavingOffline(true);
    setOfflineSaveNotice(null);
    setUploadError(null);
    try {
      await enqueueOfflineScan({
        cropHint: selectedCrop === 'auto' ? 'कापूस / सामान्य पीक' : selectedCrop,
        topImageDataUrl: imageSrc,
        undersideImageDataUrl: undersideImageSrc || undefined,
      });
      setOfflineSaveNotice(
        language === 'mr'
          ? 'हा स्कॅन ऑफलाइन रांगेत सेव्ह झाला आहे! इंटरनेट सुरू झाल्यावर तुम्ही तो स्कॅन इतिहासामधून एका क्लिकवर सिंक करू शकता.'
          : language === 'hi'
          ? 'यह स्कैन ऑफ़लाइन कतार में सुरक्षित हो गया है! इंटरनेट आने पर आप इसे इतिहास से सिंक कर सकते हैं।'
          : 'Scan queued safely in offline storage! It will be ready to sync as soon as you have internet.'
      );
    } catch (err: any) {
      setUploadError(err?.message || 'ऑफलाइन सेव्ह करताना त्रुटी आली.');
    } finally {
      setIsSavingOffline(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setUploadError(null);
    setCameraError(null);

    // Safeguard: Pre-flight content check before dispatching to backend
    const topCheck = await validateImageContent(imageSrc, language as 'mr' | 'hi' | 'en');
    if (!topCheck.valid) {
      setUploadError(topCheck.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
      return;
    }

    if (undersideImageSrc) {
      const underCheck = await validateImageContent(undersideImageSrc, language as 'mr' | 'hi' | 'en');
      if (!underCheck.valid) {
        setUploadError(underCheck.error || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
        return;
      }
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const cropHint = selectedCrop === 'auto' ? undefined : selectedCrop;
      const diagnosis = await analyzeCropImage(
        imageSrc, 
        cropHint, 
        undersideImageSrc || undefined
      );
      setResult(diagnosis);

      // Persist in local storage scan history
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
      let historyList: ScanResult[] = [];
      if (saved) {
        try {
          historyList = JSON.parse(saved);
        } catch {
          historyList = [];
        }
      }
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SCANS,
        JSON.stringify([diagnosis, ...historyList])
      );

      // Trigger celebration confetti for farmer engagement
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setUploadError(err?.message || getLocalizedBlankImageError(language as 'mr' | 'hi' | 'en'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleListenDiagnosis = () => {
    if (!result) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const lang = language;
    const diseaseName = result.localDiseaseName?.[lang] || result.diseaseName;
    const symptoms = result.symptoms.slice(0, 2).join(', ');
    const chemical = result.recommendedTreatments.chemical[0] || '';

    const textToRead = `${result.cropName} वरील रोग निदान: ${diseaseName}. तीव्रता: ${result.severity}. लक्षणे: ${symptoms}. शिफारस केलेला उपाय: ${chemical}.`;

    setIsSpeaking(true);
    speakText(textToRead, lang, () => {
      setIsSpeaking(false);
    });
  };

  const handleAddToRecoveryTracker = () => {
    if (!result) return;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.RECOVERY);
    let recoveryList: any[] = [];
    if (saved) {
      try {
        recoveryList = JSON.parse(saved);
      } catch {
        recoveryList = [];
      }
    }

    const newRecoveryItem = {
      id: 'rec-' + Date.now(),
      scanId: result.id,
      cropId: 'crop-cotton-1',
      cropName: result.cropName,
      originalDisease: result.localDiseaseName?.[language] || result.diseaseName,
      initialSeverity: result.severity,
      currentStatus: 'improving',
      treatmentApplied: result.recommendedTreatments.chemical[0] || 'निंबोळी अर्क फवारणी',
      startDate: new Date().toLocaleDateString('mr-IN'),
      lastUpdated: new Date().toLocaleDateString('mr-IN'),
      initialImageUrl: result.imageUrl,
      observations: ['पहिला उपचार सुरू केला.'],
      timeline: [
        {
          date: new Date().toLocaleDateString('mr-IN'),
          note: 'AI स्कॅननंतर्गत रोग ओळखला व पहिली फवारणी नोंदवली.',
          status: 'उपचार सुरू',
          photoUrl: result.imageUrl,
        },
      ],
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.RECOVERY, JSON.stringify([newRecoveryItem, ...recoveryList]));
    setAddedToRecovery(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#152D24] flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#0B5137]" />
            <span>{t('scannerHeading')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5">
            कापूस, सोयाबीन किंवा तुरीच्या पानाचा फोटो काढून रोग, किडी व अचूक उपाय जाणून घ्या
          </p>
        </div>

        {result && (
          <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCw className="w-4 h-4" />}>
            नवीन स्कॅन करा
          </Button>
        )}
      </div>

      {/* Step 3: Crop Selection Prompt (Before or after photo) */}
      {!result && (
        <Card variant="white" padding="sm" className="bg-white border-[#DDE8DC] shadow-sm">
          <label className="block text-xs font-bold text-[#152D24] mb-2">
            {t('selectCropPrompt')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'auto', label: t('autoDetect') },
              { id: 'कापूस (Cotton)', label: 'कापूस (Cotton)' },
              { id: 'सोयाबीन (Soybean)', label: 'सोयाबीन (Soybean)' },
              { id: 'तूर (Pigeonpea)', label: 'तूर (Pigeonpea)' },
            ].map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCrop(crop.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition ${
                  selectedCrop === crop.id
                    ? 'bg-[#0B5137] text-white border-2 border-[#0B5137] shadow-sm'
                    : 'bg-[#F6F8F0] text-[#5F7065] border border-[#DDE8DC] hover:bg-white hover:text-[#152D24]'
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Camera / Multi-Angle Scanner Workflow Area */}
      {!result && (
        <Card variant="white" padding="none" className="overflow-hidden border border-[#DDE8DC] shadow-sm">
          {/* Active Camera Viewfinder Overlay (if camera is active) */}
          {isCameraActive ? (
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-[#073D2A] flex items-center justify-center overflow-hidden">
              <video
                ref={(node) => {
                  (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
                  if (node && streamRef.current && node.srcObject !== streamRef.current) {
                    node.srcObject = streamRef.current;
                    node.play().catch((err) => console.warn('Video auto-play interrupted:', err));
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Guide */}
              <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/40 rounded-3xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-[#2F9E59] rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-[#2F9E59] rounded-tr-lg" />
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-[#2F9E59] rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-[#2F9E59] rounded-br-lg" />
                </div>
              </div>

              {/* Slot Indicator Tag */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B5137]/90 text-white text-xs font-bold border border-white/20 shadow-md">
                <Camera className="w-3.5 h-3.5 text-[#2F9E59]" />
                <span>
                  {activeSlot === 'top'
                    ? '📸 पानाचा वरचा भाग (Top Surface) टिपत आहात'
                    : '📸 पानाची खालची बाजू (Underside Leaf) टिपत आहात'}
                </span>
              </div>

              {/* Compressing Indicator */}
              {isCompressing && (
                <div className="absolute inset-0 bg-[#073D2A]/85 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <div className="w-12 h-12 rounded-xl bg-[#0B5137] border border-[#2F9E59]/50 flex items-center justify-center text-[#2F9E59] mb-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-white">फोटो ऑप्टिमाइझ केला जात आहे...</p>
                  <p className="text-xs text-slate-300">ग्रामीण नेटवर्कसाठी जलद आकार कमी करत आहोत</p>
                </div>
              )}

              {/* In-Camera Action Controls */}
              <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/60 text-white border-white/30 hover:bg-black/80"
                  onClick={stopCamera}
                >
                  रद्द करा (Cancel)
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={capturePhoto}
                  leftIcon={<Camera className="w-5 h-5" />}
                  className="bg-[#0B5137] hover:bg-[#073D2A] text-white text-base font-bold shadow-xl border-2 border-[#2F9E59]/40"
                >
                  फोटो टिपला (Capture)
                </Button>

                <button
                  type="button"
                  onClick={() => setActiveSlot(activeSlot === 'top' ? 'underside' : 'top')}
                  className="px-3 py-2 rounded-xl bg-black/60 text-white text-xs font-semibold hover:bg-black/80 border border-white/20 transition"
                >
                  {activeSlot === 'top' ? 'खालच्या बाजूसाठी स्विच' : 'वरच्या भागासाठी स्विच'}
                </button>
              </div>
            </div>
          ) : (
            /* Multi-Angle Dual Photo Slots Dashboard */
            <div className="p-4 sm:p-6 space-y-5">
              {/* Header with Title and Mode */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#DDE8DC]">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2F9E59]" />
                  <h3 className="font-extrabold text-[#152D24] text-base">
                    मल्टी-अँगल क्रॉप स्कॅनर (Multi-Angle Leaf Scanner)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] border border-[#2F9E59]/30 text-[11px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2F9E59]" />
                  दुहेरी कोन समर्थित (Dual-Angle AI)
                </span>
              </div>

              <p className="text-xs text-[#5F7065]">
                पानाचा वरचा भाग (अनिवार्य) आणि खालची बाजू (पर्यायी) स्कॅन करून पांढरी माशी, तुडतुडे, अंडी व तांबेऱ्याच्या पुरळचे अचूक निदान मिळवा.
              </p>

              {/* Dual Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slot 1: Top Surface (Required) */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${
                  imageSrc 
                    ? 'border-[#2F9E59]/50 bg-[#E6F2E5]/20 shadow-xs' 
                    : 'border-[#DDE8DC] bg-[#F6F8F0]/60 hover:border-[#2F9E59]/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-[#152D24] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#0B5137] text-white flex items-center justify-center text-[10px]">१</span>
                      <span>पानाचा वरचा पृष्ठभाग (Top Surface)</span>
                    </span>
                    <Badge variant={imageSrc ? 'success' : 'info'} size="sm">
                      {imageSrc ? 'सज्ज (Ready)' : 'मुख्य फोटो / Required'}
                    </Badge>
                  </div>

                  {imageSrc ? (
                    <div className="space-y-3">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/90 border border-[#DDE8DC]">
                        <img
                          src={imageSrc}
                          alt="Top leaf surface"
                          className="w-full h-full object-contain"
                        />
                        {compressionStats && (
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0B5137]/90 text-white text-[10px] font-bold backdrop-blur-xs border border-white/20">
                            <Sparkles className="w-3 h-3 text-[#2F9E59]" />
                            <span>
                              {formatBytes(compressionStats.originalSizeBytes)} ➔ {formatBytes(compressionStats.compressedSizeBytes)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                          onClick={() => startCamera('top')}
                          leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                        >
                          पुन्हा काढा
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#C83E3E] hover:bg-red-50"
                          onClick={() => handleRemoveSlot('top')}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          काढून टाका
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#DDE8DC] rounded-xl bg-white min-h-[220px]">
                      <div className="w-12 h-12 rounded-full bg-[#E6F2E5] flex items-center justify-center text-[#0B5137] mb-2 shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-[#152D24] mb-1">
                        पानावरील करपा, डाग व रंगबदल
                      </p>
                      <p className="text-[11px] text-[#5F7065] mb-4 max-w-xs">
                        चांगल्या प्रकाशात वरून स्पष्ट फोटो घ्या
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => startCamera('top')}
                          leftIcon={<Camera className="w-3.5 h-3.5" />}
                        >
                          {t('takePhoto')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                          onClick={() => triggerFileInput('top')}
                          leftIcon={<Upload className="w-3.5 h-3.5 text-[#2F9E59]" />}
                        >
                          {t('uploadGallery')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slot 2: Underside (Optional) */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${
                  undersideImageSrc 
                    ? 'border-[#2F9E59]/50 bg-[#E6F2E5]/20 shadow-xs' 
                    : 'border-[#DDE8DC] bg-[#F6F8F0]/60 hover:border-[#2F9E59]/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-[#152D24] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#2F9E59] text-white flex items-center justify-center text-[10px]">२</span>
                      <span>पानाची खालची बाजू (Leaf Underside)</span>
                    </span>
                    <Badge variant={undersideImageSrc ? 'success' : 'warning'} size="sm">
                      {undersideImageSrc ? 'सज्ज (Ready)' : 'पर्यायी / Recommended'}
                    </Badge>
                  </div>

                  {undersideImageSrc ? (
                    <div className="space-y-3">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/90 border border-[#DDE8DC]">
                        <img
                          src={undersideImageSrc}
                          alt="Leaf underside surface"
                          className="w-full h-full object-contain"
                        />
                        {undersideCompressionStats && (
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0B5137]/90 text-white text-[10px] font-bold backdrop-blur-xs border border-white/20">
                            <Sparkles className="w-3 h-3 text-[#2F9E59]" />
                            <span>
                              {formatBytes(undersideCompressionStats.originalSizeBytes)} ➔ {formatBytes(undersideCompressionStats.compressedSizeBytes)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                          onClick={() => startCamera('underside')}
                          leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                        >
                          पुन्हा काढा
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#C83E3E] hover:bg-red-50"
                          onClick={() => handleRemoveSlot('underside')}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          काढून टाका
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#DDE8DC] rounded-xl bg-white min-h-[220px]">
                      <div className="w-12 h-12 rounded-full bg-[#E6F2E5] flex items-center justify-center text-[#2F9E59] mb-2 shadow-2xs">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-[#152D24] mb-1">
                        पांढरी माशी, तुडतुडे व बुरशी पुरळ
                      </p>
                      <p className="text-[11px] text-[#5F7065] mb-4 max-w-xs">
                        पान उलटे करून खालच्या पृष्ठभागाचा फोटो जोडा
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                          onClick={() => startCamera('underside')}
                          leftIcon={<Camera className="w-3.5 h-3.5" />}
                        >
                          {t('takePhoto')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                          onClick={() => triggerFileInput('underside')}
                          leftIcon={<Upload className="w-3.5 h-3.5 text-[#2F9E59]" />}
                        >
                          {t('uploadGallery')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error messages if any */}
              {cameraError && (
                <div className="p-3 rounded-xl bg-[#C83E3E]/10 border border-[#C83E3E]/30 text-[#C83E3E] text-xs">
                  {cameraError}
                </div>
              )}
              {uploadError && (
                <div className="p-3 rounded-xl bg-[#C83E3E]/10 border border-[#C83E3E]/30 text-[#C83E3E] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C83E3E] shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Hidden file input for uploads */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Bottom Summary & Trigger Bar */}
              <div className="pt-3 border-t border-[#DDE8DC] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-medium">
                  {imageSrc && undersideImageSrc ? (
                    <span className="text-[#0B5137] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#2F9E59]" />
                      🌿 दुहेरी कोन सज्ज: वरचा व खालचा पृष्ठभाग दोन्ही AI विश्लेषणासाठी तयार आहेत (कमाल अचूकता)
                    </span>
                  ) : imageSrc ? (
                    <span className="text-[#152D24] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2F9E59]" />
                      🍃 एकल कोन सज्ज: वरचा फोटो तयार. (पर्यायी: रसशोषक किडींसाठी खालचा फोटो जोडू शकता)
                    </span>
                  ) : (
                    <span className="text-[#5F7065] flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#5F7065]" />
                      कृपया किमान पानाच्या वरच्या भागाचा फोटो जोडून निदान सुरू करा.
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(imageSrc || undersideImageSrc) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#C83E3E] hover:bg-red-50"
                      onClick={handleReset}
                    >
                      सर्व साफ करा
                    </Button>
                  )}

                  {/* Offline Queue button */}
                  {imageSrc && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleQueueOffline}
                      disabled={isSavingOffline || isAnalyzing}
                      isLoading={isSavingOffline}
                      leftIcon={<WifiOff className="w-4 h-4 text-[#E9A23B]" />}
                      className="px-4 py-2.5 text-xs sm:text-sm font-bold border-[#DDE8DC] text-[#152D24] hover:bg-[#E6F2E5]"
                    >
                      {language === 'mr' ? 'ऑफलाइन रांगेत सेव्ह करा' : 'Queue Offline'}
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={!imageSrc || isCompressing || isAnalyzing}
                    isLoading={isAnalyzing}
                    leftIcon={<Sparkles className="w-5 h-5 text-amber-300" />}
                    className="px-6 py-2.5 text-sm font-extrabold shadow-md bg-[#0B5137] hover:bg-[#073D2A] disabled:opacity-50"
                  >
                    {undersideImageSrc ? 'दोन्ही कोनांचे निदान करा (Dual Angle)' : t('analyzePhoto')}
                  </Button>
                </div>
              </div>

              {/* Offline Saved Success Alert */}
              {offlineSaveNotice && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#21864A] shrink-0" />
                    <span>{offlineSaveNotice}</span>
                  </div>
                  <button
                    onClick={() => navigate('/history?tab=queue')}
                    className="font-bold text-[#0B5137] underline hover:text-[#2F9E59] shrink-0"
                  >
                    {language === 'mr' ? 'रांग पहा (View Queue) →' : 'View Queue →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}



      {/* Step 6: Full Diagnosis Result View */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Diagnosis Summary Card (High-Contrast White Card) */}
          <Card variant="white" className="p-6 border-[#DDE8DC] shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo with Severity & Confidence Overlays + Interactive Symptom Boxes */}
              <div className="w-full md:w-64 shrink-0 space-y-2">
                <div className="rounded-2xl overflow-hidden bg-[#073D2A] border border-[#DDE8DC] shadow-sm relative aspect-[4/3] md:aspect-square">
                  <img
                    src={result.imageUrl}
                    alt={result.diseaseName}
                    className="w-full h-full object-cover"
                  />

                  {/* Symptom Bounding Boxes and Pinpoints */}
                  {showSymptomBoxes && result.symptomBoxes?.map((box) => (
                    <div
                      key={box.id}
                      onClick={() => setSelectedSymptomBox(selectedSymptomBox === box.id ? null : box.id)}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: box.width ? `${box.width}%` : '24%',
                        height: box.height ? `${box.height}%` : '24%',
                      }}
                      className={`absolute border-2 rounded-xl cursor-pointer transition-all duration-200 z-10 ${
                        selectedSymptomBox === box.id
                          ? 'border-[#E9A23B] bg-[#E9A23B]/25 ring-4 ring-[#E9A23B]/40 shadow-lg'
                          : 'border-[#C83E3E] bg-[#C83E3E]/20 hover:bg-[#C83E3E]/35 hover:scale-105'
                      }`}
                      title={box.label}
                    >
                      <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#C83E3E] border-2 border-white text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <span className="absolute -bottom-5 left-0 whitespace-nowrap bg-black/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-white/20">
                        {box.label}
                      </span>
                    </div>
                  ))}

                  <div className="absolute top-2.5 left-2.5 z-20">
                    <Badge
                      variant={
                        result.severity === 'Critical' || result.severity === 'High'
                          ? 'danger'
                          : result.severity === 'Moderate'
                          ? 'warning'
                          : 'success'
                      }
                      size="md"
                      dot
                    >
                      {t('severityLabel')} {result.severity}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-[#21864A] px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1 z-20">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>{result.confidence}% उच्च अचूकता</span>
                  </div>
                </div>

                {/* Symptom Boxes Toggle Button */}
                {result.symptomBoxes && result.symptomBoxes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSymptomBoxes(!showSymptomBoxes)}
                    className="w-full py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors bg-[#F6F8F0] text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#2F9E59]" />
                    <span>
                      {showSymptomBoxes
                        ? (language === 'mr' ? 'लक्षणे लपवा (Hide Pins)' : 'Hide Symptom Pins')
                        : (language === 'mr' ? 'रोगट भाग चिन्हांकित करा (Highlight Pins)' : 'Show Symptom Pins')}
                    </span>
                  </button>
                )}

                {/* Underside Leaf Inspection Thumbnail / Card */}
                {result.undersideImageUrl && (
                  <div className="p-3 rounded-2xl bg-white border border-[#DDE8DC] shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#152D24]">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#2F9E59]" />
                        <span>पानाची खालची बाजू (Underside)</span>
                      </span>
                      <span className="text-[10px] bg-[#E6F2E5] text-[#0B5137] px-1.5 py-0.5 rounded font-semibold border border-[#2F9E59]/30">तपासली</span>
                    </div>
                    <div className="rounded-xl overflow-hidden aspect-[4/3] bg-black/90 border border-[#DDE8DC]">
                      <img
                        src={result.undersideImageUrl}
                        alt="Leaf Underside"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-[#5F7065] font-medium leading-tight">
                      पानाच्या पाठीमागील रसशोषक किडींचे थवे व बुरशीजन्य पुरळ तपासणीसाठी दोन्ही कोनांचे विश्लेषण.
                    </p>
                  </div>
                )}
              </div>

              {/* Disease Details & Voice Reader */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#E6F2E5] text-[#0B5137] font-bold text-xs border border-[#2F9E59]/30">
                      {result.cropName} ({result.cropVariety || 'Standard'})
                    </span>
                    {result.undersideImageUrl ? (
                      <span className="px-2.5 py-1 rounded-lg bg-[#E6F2E5] text-[#0B5137] font-bold text-xs border border-[#2F9E59]/30 flex items-center gap-1 shadow-2xs">
                        <Layers className="w-3.5 h-3.5 text-[#2F9E59]" />
                        दुहेरी कोन स्कॅन (Top + Underside)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-[#F6F8F0] text-[#5F7065] font-medium text-xs border border-[#DDE8DC] flex items-center gap-1 shadow-2xs">
                        <Layers className="w-3.5 h-3.5 text-[#5F7065]" />
                        एकल कोन स्कॅन (Single Angle)
                      </span>
                    )}
                  </div>

                  {/* Audio Reader Button */}
                  <Button
                    variant={isSpeaking ? 'danger' : 'outline'}
                    size="sm"
                    className="bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5] shadow-xs"
                    onClick={handleListenDiagnosis}
                    leftIcon={isSpeaking ? <VolumeX className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4 text-[#2F9E59]" />}
                  >
                    {isSpeaking ? 'आवाज थांबवा' : t('listenDiagnosis')}
                  </Button>
                </div>

                {/* Local & Scientific Name */}
                <div>
                  <h3 className="text-2xl font-black text-[#152D24] tracking-tight">
                    {result.localDiseaseName?.[language] || result.diseaseName}
                  </h3>
                  <p className="text-xs font-semibold text-[#5F7065] italic mt-0.5">
                    {result.diseaseName}
                  </p>
                </div>

                {/* Explanation */}
                <p className="text-sm text-[#152D24] leading-relaxed font-medium">
                  {result.diagnosisExplanation}
                </p>

                {/* Diagnostic Certainty & Scope Card */}
                {result.uncertaintyInfo && (
                  <div className="p-3.5 rounded-xl bg-[#E6F2E5] border border-[#2F9E59]/30 text-xs text-[#152D24] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#0B5137]">
                      <Info className="w-4 h-4 text-[#2F9E59] shrink-0" />
                      <span>तपासणी व्याप्ती व शास्त्रीय खात्री (Diagnostic Scope & Certainty)</span>
                    </div>
                    <p className="text-[#152D24] font-medium leading-relaxed">
                      {result.uncertaintyInfo}
                    </p>
                    <p className="text-[11px] text-[#5F7065] font-normal">
                      टीप: कोणत्याही रासायनिक फवारणीपूर्वी शेतात किडीची प्रत्यक्ष आर्थिक नुकसान पातळी (ETL) तपासावी. शंका असल्यास खालील 'तज्ज्ञांचा सल्ला घ्या' पर्यायाचा वापर करा.
                    </p>
                  </div>
                )}

                {/* Interactive Selected Symptom Inspector Card */}
                {selectedSymptomBox && (() => {
                  const activeBox = result.symptomBoxes?.find(b => b.id === selectedSymptomBox);
                  if (!activeBox) return null;
                  return (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1 animate-in fade-in duration-200 shadow-2xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-amber-900 text-sm">
                          <Target className="w-4 h-4 text-[#C83E3E] shrink-0" />
                          <span>{activeBox.label}</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedSymptomBox(null)}
                          className="text-amber-800 hover:text-amber-950 text-[11px] underline"
                        >
                          बंद करा (Close)
                        </button>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed pt-0.5">
                        {activeBox.description}
                      </p>
                    </div>
                  );
                })()}

                {/* Symptoms Checklist */}
                <div className="pt-2">
                  <h5 className="text-xs font-bold text-[#152D24] uppercase tracking-wide mb-1.5">
                    {t('symptomsObserved')}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {result.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#5F7065] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#2F9E59] shrink-0 mt-0.5" />
                        <span className="text-[#152D24]">{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Treatment Recommendations (Cultural, Biological, Chemical) */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#152D24] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F9E59]" />
              <span>{t('recommendedTreatmentsHeading')}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Cultural */}
              <Card variant="white" className="p-4 border-[#DDE8DC]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#DDE8DC]">
                  <div className="w-7 h-7 rounded-lg bg-[#2F9E59] text-white flex items-center justify-center font-bold text-xs">
                    १
                  </div>
                  <h5 className="font-bold text-sm text-[#152D24]">
                    {t('culturalTreatment')}
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5F7065] font-medium">
                  {result.recommendedTreatments.cultural.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#2F9E59] font-bold">•</span>
                      <span className="text-[#152D24]">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* 2. Biological */}
              <Card variant="white" className="p-4 border-[#DDE8DC]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#DDE8DC]">
                  <div className="w-7 h-7 rounded-lg bg-[#0B5137] text-white flex items-center justify-center font-bold text-xs">
                    २
                  </div>
                  <h5 className="font-bold text-sm text-[#152D24]">
                    {t('biologicalTreatment')}
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5F7065] font-medium">
                  {result.recommendedTreatments.biological.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#0B5137] font-bold">•</span>
                      <span className="text-[#152D24]">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* 3. Chemical */}
              <Card variant="white" className="p-4 border-[#DDE8DC]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#DDE8DC]">
                  <div className="w-7 h-7 rounded-lg bg-[#073D2A] text-white flex items-center justify-center font-bold text-xs">
                    ३
                  </div>
                  <h5 className="font-bold text-sm text-[#152D24]">
                    {t('chemicalTreatment')}
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5F7065] font-medium">
                  {result.recommendedTreatments.chemical.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#0B5137] font-bold">•</span>
                      <span className="text-[#152D24]">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Caution Banner */}
            <div className="p-3.5 rounded-2xl bg-[#C83E3E]/10 border border-[#C83E3E]/30 text-xs text-[#C83E3E] flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-[#C83E3E] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">
                {result.recommendedTreatments.caution || t('chemicalCaution')}
              </p>
            </div>

            {/* Legal Agricultural Advisory Disclaimer */}
            <div className="p-3 rounded-xl bg-[#E6F2E5]/50 border border-[#DDE8DC] text-[11px] text-[#5F7065] leading-relaxed">
              <strong>कायदेशीर कृषी सल्ला सूचना (Advisory Disclaimer):</strong> वरील रोग निदान व शिफारशी ही ICAR / डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) मार्गदर्शक तत्त्वांवर आधारित निर्णय साहाय्यक प्रणाली आहे. प्रत्यक्ष परिणाम स्थानिक हवामान व जमिनीनुसार बदलू शकतात. फवारणीपूर्वी पॅकेटवरील सूचना तपासाव्यात.
            </div>
          </div>

          {/* Action Buttons: Add to Recovery, Ask Expert */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              दुसरे पीक स्कॅन करा
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={addedToRecovery ? 'secondary' : 'primary'}
                onClick={handleAddToRecoveryTracker}
                disabled={addedToRecovery}
                leftIcon={addedToRecovery ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              >
                {addedToRecovery ? 'सुधारणा ट्रॅकरमध्ये जोडले!' : t('addToRecovery')}
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate('/expert')}
                leftIcon={<HelpCircle className="w-4 h-4" />}
              >
                {t('askExpertAboutThis')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
