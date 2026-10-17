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
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { analyzeCropImage, isGeminiConfigured } from '../lib/gemini';
import { ScanResult, SeverityLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { speakText, stopSpeaking } from '../lib/speech';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';
import confetti from 'canvas-confetti';

export const Scan: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Workflow states
  const [selectedCrop, setSelectedCrop] = useState<string>('auto');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [addedToRecovery, setAddedToRecovery] = useState<boolean>(false);

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

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('कॅमेरा सुरू करता आला नाही. कृपया खालील "गॅलरीतून फोटो निवडा" किंवा नमुना फोटो वापरा.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageSrc(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setImageSrc(null);
    setResult(null);
    setAddedToRecovery(false);
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const cropHint = selectedCrop === 'auto' ? undefined : selectedCrop;
      const diagnosis = await analyzeCropImage(imageSrc, cropHint);
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
    } catch (err) {
      console.error('Scan error:', err);
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
          <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#0A2540]" />
            <span>{t('scannerHeading')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
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
        <Card variant="white" padding="sm" className="bg-white border-[#D5DEE8] shadow-sm">
          <label className="block text-xs font-bold text-[#0A2540] mb-2">
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
                    ? 'bg-[#0A2540] text-white border-2 border-[#0A2540] shadow-sm'
                    : 'bg-[#EEF3F8] text-[#5B6B7D] border border-[#D5DEE8] hover:bg-white hover:text-[#0A2540]'
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Camera / Upload Workflow Area */}
      {!result && (
        <Card variant="white" padding="none" className="overflow-hidden border border-[#D5DEE8] shadow-sm">
          {/* Main Visual Frame */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-[#0B1626] flex items-center justify-center overflow-hidden">
            {/* Live Camera Feed */}
            {isCameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Captured or Uploaded Image Preview */}
            {!isCameraActive && imageSrc && (
              <img
                src={imageSrc}
                alt="Crop preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Empty Camera Placeholder */}
            {!isCameraActive && !imageSrc && (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#13243A] border-2 border-[#FF9933] flex items-center justify-center text-[#FF9933] mb-4 shadow-md">
                  <Camera className="w-10 h-10 animate-pulse" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  पिकाच्या पानाचा स्पष्ट फोटो काढा
                </h4>
                <p className="text-xs sm:text-sm text-[#EAF0F7]/80 max-w-sm mt-1">
                  चांगल्या सूर्यप्रकाशात रोगट भाग मध्यभागी ठेवून कॅमेऱ्याने फोटो घ्या
                </p>

                {cameraError && (
                  <div className="mt-4 p-2.5 rounded-xl bg-[#C0392B]/20 border border-[#C0392B]/60 text-white text-xs max-w-md">
                    {cameraError}
                  </div>
                )}
              </div>
            )}

            {/* Animated Laser Scanline during Analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0B1626]/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                <div className="animate-scan" />
                <div className="w-16 h-16 rounded-2xl bg-[#13243A] border-2 border-[#FF9933] flex items-center justify-center text-[#FF9933] shadow-lg mb-3">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <p className="text-base font-bold text-white tracking-wide">
                  {t('analyzingInProgress')}
                </p>
                <p className="text-xs text-[#4CC46A] mt-1 font-semibold">
                  AI व्हिजन मॉडेल कीड व रोग तपासत आहे...
                </p>
              </div>
            )}

            {/* Scanner Viewfinder Overlay */}
            {(isCameraActive || imageSrc) && !isAnalyzing && (
              <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/40 rounded-3xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-[#FF9933] rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-[#FF9933] rounded-tr-lg" />
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-[#FF9933] rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-[#FF9933] rounded-br-lg" />
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar Below Preview */}
          <div className="p-4 sm:p-5 bg-[#EEF3F8] border-t border-[#D5DEE8] flex flex-wrap items-center justify-between gap-3">
            {/* Left Options */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              {!imageSrc && !isCameraActive && (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={startCamera}
                    leftIcon={<Camera className="w-4 h-4" />}
                  >
                    {t('takePhoto')}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    className="bg-white text-[#0A2540] border-[#D5DEE8] hover:bg-slate-50"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4 text-[#3B6EA5]" />}
                  >
                    {t('uploadGallery')}
                  </Button>
                </>
              )}

              {isCameraActive && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={capturePhoto}
                  leftIcon={<Camera className="w-5 h-5" />}
                  className="bg-[#0A2540] text-white text-base font-bold shadow-md"
                >
                  फोटो टिपला (Capture)
                </Button>
              )}

              {imageSrc && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-[#0A2540] border-[#D5DEE8]"
                    onClick={handleReset}
                    leftIcon={<RotateCw className="w-4 h-4" />}
                  >
                    {t('retakePhoto')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#C0392B] hover:bg-red-50"
                    onClick={handleReset}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    काढून टाका
                  </Button>
                </div>
              )}
            </div>

            {/* Right Action: Analyze Button */}
            {imageSrc && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                leftIcon={<Sparkles className="w-5 h-5 text-amber-300" />}
                className="px-7 py-3 text-base font-extrabold shadow-md bg-[#0A2540] hover:bg-[#081d32]"
              >
                {t('analyzePhoto')}
              </Button>
            )}
          </div>
        </Card>
      )}



      {/* Step 6: Full Diagnosis Result View */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Diagnosis Summary Card (High-Contrast White Card) */}
          <Card variant="white" className="p-6 border-[#D5DEE8] shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo with Severity & Confidence Overlays */}
              <div className="w-full md:w-56 shrink-0 rounded-2xl overflow-hidden bg-[#0B1626] border border-[#D5DEE8] shadow-sm relative">
                <img
                  src={result.imageUrl}
                  alt={result.diseaseName}
                  className="w-full aspect-[4/3] md:aspect-square object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
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
                <div className="absolute bottom-2.5 right-2.5 bg-[#138808] px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{result.confidence}% उच्च अचूकता</span>
                </div>
              </div>

              {/* Disease Details & Voice Reader */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EEF3F8] text-[#0A2540] font-bold text-xs border border-[#D5DEE8]">
                      {result.cropName} ({result.cropVariety || 'Standard'})
                    </span>
                  </div>

                  {/* Audio Reader Button */}
                  <Button
                    variant={isSpeaking ? 'danger' : 'outline'}
                    size="sm"
                    className="bg-white text-[#0A2540] border-[#D5DEE8] hover:bg-[#EEF3F8] shadow-xs"
                    onClick={handleListenDiagnosis}
                    leftIcon={isSpeaking ? <VolumeX className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4 text-[#138808]" />}
                  >
                    {isSpeaking ? 'आवाज थांबवा' : t('listenDiagnosis')}
                  </Button>
                </div>

                {/* Local & Scientific Name */}
                <div>
                  <h3 className="text-2xl font-black text-[#0A2540] tracking-tight">
                    {result.localDiseaseName?.[language] || result.diseaseName}
                  </h3>
                  <p className="text-xs font-semibold text-[#5B6B7D] italic mt-0.5">
                    {result.diseaseName}
                  </p>
                </div>

                {/* Explanation */}
                <p className="text-sm text-[#0A2540] leading-relaxed font-medium">
                  {result.diagnosisExplanation}
                </p>

                {/* Symptoms Checklist */}
                <div className="pt-2">
                  <h5 className="text-xs font-bold text-[#0A2540] uppercase tracking-wide mb-1.5">
                    {t('symptomsObserved')}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {result.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#5B6B7D] font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#138808] shrink-0 mt-0.5" />
                        <span className="text-[#0A2540]">{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Treatment Recommendations (Cultural, Biological, Chemical) */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#0A2540] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#138808]" />
              <span>{t('recommendedTreatmentsHeading')}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Cultural */}
              <Card variant="white" className="p-4 border-[#D5DEE8]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#D5DEE8]">
                  <div className="w-7 h-7 rounded-lg bg-[#138808] text-white flex items-center justify-center font-bold text-xs">
                    १
                  </div>
                  <h5 className="font-bold text-sm text-[#0A2540]">
                    {t('culturalTreatment')}
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5B6B7D] font-medium">
                  {result.recommendedTreatments.cultural.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#138808] font-bold">•</span>
                      <span className="text-[#0A2540]">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* 2. Biological */}
              <Card variant="white" className="p-4 border-[#D5DEE8]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#D5DEE8]">
                  <div className="w-7 h-7 rounded-lg bg-[#3B6EA5] text-white flex items-center justify-center font-bold text-xs">
                    २
                  </div>
                  <h5 className="font-bold text-sm text-[#0A2540]">
                    {t('biologicalTreatment')}
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5B6B7D] font-medium">
                  {result.recommendedTreatments.biological.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#3B6EA5] font-bold">•</span>
                      <span className="text-[#0A2540]">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* 3. Chemical */}
              <Card variant="white" className="p-4 border-[#D5DEE8]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#D5DEE8]">
                  <div className="w-7 h-7 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-bold text-xs">
                    ३
                  </div>
                  <h5 className="font-bold text-sm text-[#0A2540]">
                    {t('chemicalTreatment')}
                  </h5>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5B6B7D] font-medium">
                  {result.recommendedTreatments.chemical.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#0A2540] font-bold">•</span>
                      <span className="text-[#0A2540]">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Caution Banner */}
            <div className="p-3.5 rounded-2xl bg-[#C0392B]/10 border border-[#C0392B]/30 text-xs text-[#C0392B] flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-[#C0392B] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">
                {result.recommendedTreatments.caution || t('chemicalCaution')}
              </p>
            </div>

            {/* Legal Agricultural Advisory Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#5B6B7D] leading-relaxed">
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
