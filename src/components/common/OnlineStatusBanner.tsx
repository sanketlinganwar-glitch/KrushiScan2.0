import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, Wifi, RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscribeToOnlineStatus } from '../../lib/pwa';
import { getQueuedScans, updateQueuedScanStatus, QueuedScanItem } from '../../lib/offlineKnowledge';
import { analyzeCropImage } from '../../lib/gemini';
import { LOCAL_STORAGE_KEYS } from '../../lib/supabase';
import { ScanResult } from '../../types';

export const OnlineStatusBanner: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [queuedItems, setQueuedItems] = useState<QueuedScanItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessCount, setSyncSuccessCount] = useState<number>(0);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  const loadQueue = async () => {
    try {
      const items = await getQueuedScans();
      const pending = items.filter((i) => i.status === 'queued' || i.status === 'failed');
      setQueuedItems(pending);
    } catch {
      setQueuedItems([]);
    }
  };

  useEffect(() => {
    loadQueue();

    const unsubscribe = subscribeToOnlineStatus((online) => {
      setIsOnline(online);
      if (online) {
        setShowRestoredNotice(true);
        loadQueue();
      } else {
        setShowRestoredNotice(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Explicit sync triggered only by farmer click (Zero silent uploads)
  const handleSyncAll = async () => {
    if (isSyncing || queuedItems.length === 0) return;
    setIsSyncing(true);
    let successCount = 0;

    for (const item of queuedItems) {
      try {
        await updateQueuedScanStatus(item.id, 'syncing');
        const diagnosis = await analyzeCropImage(
          item.topImageDataUrl,
          item.cropHint,
          item.undersideImageDataUrl
        );

        // Save into user's scan history
        const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
        let historyList: ScanResult[] = [];
        if (saved) {
          try {
            historyList = JSON.parse(saved);
          } catch {
            historyList = [];
          }
        }
        localStorage.setItem(LOCAL_STORAGE_KEYS.SCANS, JSON.stringify([diagnosis, ...historyList]));

        await updateQueuedScanStatus(item.id, 'completed', undefined, diagnosis);
        successCount++;
      } catch (err: any) {
        console.warn(`Failed to sync queued scan ${item.id}:`, err);
        await updateQueuedScanStatus(item.id, 'failed', err?.message || 'Network upload timeout');
      }
    }

    setIsSyncing(false);
    setSyncSuccessCount(successCount);
    loadQueue();
  };

  // If online and no queued items or notices, render nothing
  if (isOnline && queuedItems.length === 0 && !showRestoredNotice) {
    return null;
  }

  // 1. Offline Mode Banner
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-amber-600/30 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2 max-w-2xl">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-900 animate-pulse" />
          <span>
            {language === 'mr'
              ? 'ऑफलाइन मोड: इंटरनेट उपलब्ध नाही. तुम्ही ऑफलाइन माहिती पाहू शकता व स्कॅन नंतरच्या विश्लेषणासाठी रांगेत सेव्ह करू शकता.'
              : language === 'hi'
              ? 'ऑफलाइन मोड: इंटरनेट अनुपलब्ध है। आप ऑफ़लाइन जानकारी देख सकते हैं व स्कैन बाद के लिए सुरक्षित कर सकते हैं।'
              : 'Offline Mode: No active internet. Offline knowledge base is active, and scans can be queued safely.'}
          </span>
        </div>
        {queuedItems.length > 0 && (
          <span className="bg-amber-600/30 text-amber-950 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">
            {queuedItems.length} {language === 'mr' ? 'रांगेत' : 'queued'}
          </span>
        )}
      </div>
    );
  }

  // 2. Online Restored with Pending Scans Prompt Banner
  if (isOnline && queuedItems.length > 0) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-700 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>
            {language === 'mr'
              ? `इंटरनेट पूर्ववत झाले आहे! तुमच्याकडे ${queuedItems.length} प्रलंबित स्कॅन रांगेत आहेत.`
              : language === 'hi'
              ? `इंटरनेट चालू हो गया है! आपके पास ${queuedItems.length} लंबित स्कैन कतार में हैं।`
              : `Internet restored! You have ${queuedItems.length} pending scans in the offline queue.`}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-3 py-1 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? language === 'mr'
                  ? 'विश्लेषण सुरू आहे...'
                  : 'Syncing...'
                : language === 'mr'
                ? 'आता विश्लेषण करा (Sync)'
                : 'Sync Now'}
            </span>
          </button>

          <button
            onClick={() => navigate('/history?tab=queue')}
            className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-1"
          >
            <span>{language === 'mr' ? 'रांग पहा' : 'View Queue'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Sync success toast banner
  if (syncSuccessCount > 0) {
    return (
      <div className="bg-emerald-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>
            {language === 'mr'
              ? `${syncSuccessCount} ऑफलाइन स्कॅन यशस्वीरीत्या विश्लेषित करून इतिहासामध्ये जोडले गेले!`
              : `${syncSuccessCount} queued scans processed and saved to history!`}
          </span>
        </div>
        <button
          onClick={() => setSyncSuccessCount(0)}
          className="text-white hover:text-emerald-200 text-xs underline"
        >
          बंद करा (Close)
        </button>
      </div>
    );
  }

  return null;
};
export default OnlineStatusBanner;
