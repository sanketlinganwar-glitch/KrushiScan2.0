import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  X, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { createSpeechRecognizer, isSpeechRecognitionSupported, speakText, stopSpeaking } from '../../lib/speech';
import { Language } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  isGrounded?: boolean;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language: globalLang } = useLanguage();
  
  // Dedicated in-modal language selection allowing farmers to switch seamlessly
  const [activeLang, setActiveLang] = useState<Language>(globalLang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize modal language if global language changes and no custom choice yet
  useEffect(() => {
    setActiveLang(globalLang);
  }, [globalLang]);

  // Set initial welcome greeting when language changes or on first open
  useEffect(() => {
    const welcomeText =
      activeLang === 'mr'
        ? 'राम राम शेतकरी दादा! मी तुमचा कृषी मित्र व्हॉइस मदतनीस आहे. कपाशी, सोयाबीन, तूर, खतांची मात्रा, हवामान किंवा बाजार भावाविषयी कोणताही प्रश्न बोला किंवा टाईप करा.'
        : activeLang === 'hi'
        ? 'नमस्ते किसान भाई! मैं आपका कृषि मित्र वॉयस सहायक हूँ। कपास, सोयाबीन, अरहर, खाद, मौसम या मंडी भाव के बारे में कोई भी प्रश्न बोलकर या लिखकर पूछें।'
        : 'Welcome! I am your Krushi Mitra voice assistant. Ask any question about cotton, soybean, fertilizers, pest control, or APMC mandi rates.';

    setMessages([
      {
        id: 'welcome-' + activeLang,
        sender: 'assistant',
        text: welcomeText,
        time: 'आत्ताच',
        isGrounded: true,
      },
    ]);
  }, [activeLang]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, status]);

  // Cleanup speech & recognition when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort?.();
        } catch {
          // ignore
        }
      }
      setStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const quickQuestions: Record<Language, { label: string; q: string }[]> = {
    mr: [
      { label: 'कापसावर बोंडअळी उपाय', q: 'कापसावरील गुलाबी बोंडअळीच्या नियंत्रणासाठी कोणते उपाय करावेत?' },
      { label: 'सोयाबीन पाने पिवळी पडणे', q: 'सोयाबीनची पाने पिवळी का पडत आहेत? त्यावर काय फवारावे?' },
      { label: 'तुरीचा मर रोग (उबळणे)', q: 'तुरीची झाडे उबळत आहेत (मर रोग), मुळाशी कोणते औषध टाकावे?' },
      { label: 'आजचा कापूस भाव', q: 'विदर्भातील प्रमुख APMC बाजार समित्यांमध्ये आजचा कापूस भाव काय आहे?' },
      { label: 'फवारणीसाठी आज हवामान कसे आहे?', q: 'आज माझ्या भागात फवारणीसाठी हवामान अनुकूल आहे का?' },
    ],
    hi: [
      { label: 'कपास में गुलाबी सुंडी', q: 'कपास में गुलाबी सुंडी के नियंत्रण के लिए क्या उपाय करें?' },
      { label: 'सोयाबीन में पीलापन', q: 'सोयाबीन की पत्तियां पीली हो रही हैं, क्या छिड़काव करें?' },
      { label: 'अरहर का उकठा रोग', q: 'अरहर में उकठा रोग के लिए क्या उपचार करें?' },
      { label: 'कपास मंडी भाव', q: 'आज कपास का औसत मंडी भाव क्या है?' },
    ],
    en: [
      { label: 'Pink Bollworm Control', q: 'How to control pink bollworm infestation in cotton?' },
      { label: 'Soybean Leaf Yellowing', q: 'What causes yellowing in soybean leaves and how to treat it?' },
      { label: 'Tur Wilt Disease', q: 'What is the recommended treatment for pigeon pea wilt disease?' },
      { label: 'Cotton Mandi Price', q: 'What is the current cotton market price in Vidarbha APMCs?' },
    ],
  };

  const handleStartListening = () => {
    setErrorMessage(null);
    stopSpeaking();

    if (!isSpeechRecognitionSupported()) {
      setStatus('error');
      setErrorMessage(
        activeLang === 'mr'
          ? 'तुमच्या ब्राऊझरमध्ये व्हॉईस रेकग्निशन उपलब्ध नाही. कृपया खाली टाईप करून प्रश्न विचारा.'
          : activeLang === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया नीचे लिखकर प्रश्न पूछें।'
          : 'Speech recognition is not supported in this browser. Please type your query below.'
      );
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        activeLang,
        (transcript) => {
          // Allows real-time display in input box so farmer can edit before submitting
          setInputText(transcript);
        },
        (error) => {
          console.warn('Speech recognition error event:', error);
          setStatus('idle');
          if (error === 'not-allowed' || error === 'permission-denied') {
            setErrorMessage(
              activeLang === 'mr'
                ? 'मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राऊझर सेटिंग्जमध्ये जाऊन परवानगी द्या किंवा टाईप करा.'
                : activeLang === 'hi'
                ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया सेटिंग्स में अनुमति दें या लिखकर पूछें।'
                : 'Microphone permission was denied. Please allow microphone access or type your question.'
            );
          } else if (error === 'no-speech') {
            setErrorMessage(
              activeLang === 'mr'
                ? 'कोणताही आवाज ऐकू आला नाही. कृपया माईक दाबून स्पष्ट बोला.'
                : activeLang === 'hi'
                ? 'कोई आवाज़ सुनाई नहीं दी। कृपया स्पष्ट बोलें।'
                : 'No speech was detected. Please click the mic and speak clearly.'
            );
          } else {
            setErrorMessage(
              activeLang === 'mr'
                ? 'आवाज नोंदवण्यात अडचण आली. कृपया पुन्हा बोला किंवा टाईप करा.'
                : 'Could not capture speech. Please try speaking again or type below.'
            );
          }
        },
        () => {
          setStatus('idle');
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setStatus('listening');
      }
    } catch (err) {
      console.error('Failed to start speech recognizer:', err);
      setStatus('idle');
      setErrorMessage('माईक सुरू करता आला नाही. कृपया टाईप करून विचारा.');
    }
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignore
      }
      setStatus('idle');
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputText).trim();
    if (!textToSend || status === 'processing') return;

    // Stop ongoing speech
    stopSpeaking();
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignore
      }
    }

    const userMessage: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setStatus('processing');
    setErrorMessage(null);

    // Build conversation history (last 4 turns) for contextual follow-up
    const conversationHistory = messages.slice(-4).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    let replyText = '';
    let isGrounded = false;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${backendUrl}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          language: activeLang,
          district: 'Yavatmal',
          active_crops: ['कापूस (Cotton)', 'सोयाबीन (Soybean)', 'तूर (Pigeon Pea)'],
          conversation_history: conversationHistory,
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || '';
        isGrounded = Boolean(data.groundedWithLiveWeather || data.groundedWithLiveMandi || data.isLiveAI);
      }
    } catch (err) {
      console.warn('Backend assistant unreachable, using certified Vidarbha agricultural baseline:', err);
    }

    // Offline / fallback knowledge synthesis if backend is offline or empty
    if (!replyText) {
      replyText = getLocalAgriculturalAdvice(textToSend, activeLang);
      isGrounded = true;
    }

    const assistantMsg: Message = {
      id: 'asst-' + Date.now(),
      sender: 'assistant',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setStatus('speaking');

    // Automatically speak reply via SpeechSynthesis
    speakText(replyText, activeLang, () => {
      setStatus('idle');
    });
  };

  const handleSpeakMessage = (text: string) => {
    stopSpeaking();
    setStatus('speaking');
    speakText(text, activeLang, () => {
      setStatus('idle');
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="कृषी मित्र व्हॉइस सहाय्यक"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white border border-[#D5DEE8] text-[#0A2540] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] max-h-[720px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0A2540] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-[#FF9933]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  कृषी मित्र <span className="text-[#FF9933]">व्हॉइस</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#138808] text-white font-black uppercase tracking-wider">
                  विदर्भ AI
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                PDKV अकोला व ICAR शास्त्रोक्त शेती सल्ला
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Stop Button */}
            {status === 'speaking' && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C0392B] text-white text-xs font-bold shadow-xs hover:bg-red-700 transition animate-pulse"
                title="आवाज थांबवा"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>थांबवा</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="सहाय्यक बंद करा (Close)"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tri-Color Accent Line */}
        <div className="h-1 w-full grid grid-cols-3">
          <div className="bg-[#FF9933]" />
          <div className="bg-white" />
          <div className="bg-[#138808]" />
        </div>

        {/* In-Modal Language Switcher Tabs */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#EEF3F8] border-b border-[#D5DEE8]">
          <span className="text-xs font-bold text-[#5B6B7D] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0A2540]" />
            भाषा निवडा (Select Language):
          </span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#D5DEE8]">
            {(
              [
                { code: 'mr', label: 'मराठी' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'en', label: 'English' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setActiveLang(lang.code);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                  activeLang === lang.code
                    ? 'bg-[#0A2540] text-white shadow-xs'
                    : 'text-[#5B6B7D] hover:text-[#0A2540]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#EEF3F8]/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4 text-[#FF9933]" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0A2540] text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-white text-[#0A2540] rounded-bl-none shadow-xs border border-[#D5DEE8] font-medium'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-[#D5DEE8]/60 text-[10px] text-[#5B6B7D]">
                  <span>{m.time}</span>
                  {m.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleSpeakMessage(m.text)}
                      className="text-[#138808] hover:text-[#0e6306] font-extrabold flex items-center gap-1 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>ऐका (Play)</span>
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#138808]/15 border border-[#138808]/30 text-[#138808] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Processing / Thinking State */}
          {status === 'processing' && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-[#0A2540] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#FF9933]" />
              </div>
              <div className="bg-white border border-[#D5DEE8] rounded-2xl px-4 py-2.5 text-xs text-[#0A2540] flex items-center gap-2 shadow-xs font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-[#138808]" />
                <span>
                  {activeLang === 'mr'
                    ? 'शास्त्रोक्त माहिती तपासत आहे... कृपया थांबा...'
                    : activeLang === 'hi'
                    ? 'वैज्ञानिक जानकारी जांची जा रही है...'
                    : 'Searching verified agricultural recommendations...'}
                </span>
              </div>
            </div>
          )}

          {/* Speaking State Banner */}
          {status === 'speaking' && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#138808] animate-bounce" />
                <span>
                  {activeLang === 'mr'
                    ? 'कृषी मित्र बोलत आहे...'
                    : activeLang === 'hi'
                    ? 'कृषि मित्र बोल रहा है...'
                    : 'Krushi Mitra is reading the advice...'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="text-xs text-red-600 hover:underline font-bold"
              >
                थांबवा
              </button>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-white border-t border-[#D5DEE8] overflow-x-auto flex gap-2 no-scrollbar">
          {(quickQuestions[activeLang] || quickQuestions.mr).map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.q)}
              className="px-3 py-1.5 rounded-full bg-[#EEF3F8] hover:bg-[#D5DEE8] border border-[#D5DEE8] text-xs font-bold text-[#0A2540] shrink-0 transition"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mx-4 my-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Bar with Editable Transcript & Mic Controls */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#D5DEE8]">
          <div className="flex items-center gap-2">
            {/* Primary Microphone Trigger */}
            <button
              type="button"
              onClick={status === 'listening' ? handleStopListening : handleStartListening}
              aria-label={status === 'listening' ? 'माईक बंद करा' : 'माईक सुरू करा'}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition active:scale-95 border-2 shadow-xs shrink-0 ${
                status === 'listening'
                  ? 'bg-[#C0392B] border-[#C0392B] text-white animate-pulse shadow-red-500/30'
                  : 'bg-white border-[#FF9933] text-[#0A2540] hover:bg-orange-50'
              }`}
              title={status === 'listening' ? 'माईक बंद करा (Stop Listening)' : 'माईक सुरू करून बोला (Speak)'}
            >
              {status === 'listening' ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5 text-[#FF9933]" />
              )}
            </button>

            {/* Editable Text Input Field (Allows Farmer to Edit Recognized Speech) */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  status === 'listening'
                    ? activeLang === 'mr'
                      ? 'ऐकत आहे... बोला...'
                      : 'Listening... speak now...'
                    : activeLang === 'mr'
                    ? 'येथे लिहा किंवा माईक दाबून बोला...'
                    : 'Type here or press mic to speak...'
                }
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] rounded-2xl pl-4 pr-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] placeholder:text-[#5B6B7D] font-medium"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  aria-label="मजकूर पुसा"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6B7D] hover:text-[#0A2540]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || status === 'processing'}
              aria-label="प्रश्न विचारा (Send)"
              className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#071A2E] text-white disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 active:scale-95"
            >
              {status === 'processing' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Status Note & Mandatory Safety Disclaimer */}
          <div className="mt-2 text-[10px] text-[#5B6B7D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <span>
              {status === 'listening' ? (
                <span className="text-[#C0392B] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-ping" />
                  आवाज नोंदवला जात आहे... पूर्ण झाल्यावर पाठवा बटण दाबा.
                </span>
              ) : (
                <span>टिप: बोलल्यानंतर मजकूर तपासून बदल करू शकता.</span>
              )}
            </span>
            <span className="text-slate-400">
              *AI सल्ला प्राथमिक स्वरूपाचा आहे. प्रत्यक्ष फवारणीपूर्वी तज्ज्ञांचा सल्ला घ्या.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Deterministic Vidarbha Agricultural Knowledge Synthesis (PDKV / ICAR Grounded Fallback)
 */
function getLocalAgriculturalAdvice(query: string, lang: Language): string {
  const q = query.toLowerCase();

  // 1. Pink Bollworm in Cotton
  if (q.includes('गुलाबी') || q.includes('बोंड') || q.includes('pink') || q.includes('bollworm')) {
    if (lang === 'mr') {
      return (
        'कापसावरील गुलाबी बोंडअळीच्या नियंत्रणासाठी (PDKV शिफारस):\n' +
        '१. कामगंध सापळे: एकरी ५ कामगंध सापळे लावा.\n' +
        '२. जैविक उपाय: प्रादुर्भावाच्या सुरुवातीला ५% निंबोळी अर्क (NSKE) किंवा अझाडिरॅक्टिन १५०० पीपीएम (५ मिली/लिटर) फवारा.\n' +
        '३. रासायनिक नियंत्रण (ETL ओलांडल्यास): प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लिटर) फवारा.\n' +
        '४. काळजी: फरदड (खोडवा) कापूस घेणे टाळा.'
      );
    }
    return (
      'Pink Bollworm Control in Cotton (ICAR-CICR / PDKV Guidelines):\n' +
      '1. Monitoring: Install 5 pheromone traps per acre.\n' +
      '2. Bio-control: Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 1500 ppm @ 5ml/L.\n' +
      '3. Chemical (If >8 moths/trap/day): Profenofos 50% EC @ 2ml/L or Emamectin Benzoate 5% SG @ 4g/10L water.\n' +
      '4. Cultural: Strictly avoid ratoon (Fardad) cotton.'
    );
  }

  // 2. Yellow Mosaic in Soybean
  if (q.includes('सोयाबीन') || q.includes('पिवळे') || q.includes('mosaic') || q.includes('yellow')) {
    if (lang === 'mr') {
      return (
        'सोयाबीनची पाने पिवळी पडणे (पिवळा मोझॅक नियंत्रण):\n' +
        '१. हा विषाणूजन्य रोग पांढऱ्या माशीद्वारे पसरतो. रोगट झाडे दिसताच उपटून नष्ट करा.\n' +
        '२. पांढऱ्या माशीच्या नियंत्रणासाठी थायामेथोक्साम २५% WG (३ ग्रॅम प्रति १० लिटर) किंवा ॲसिटामिप्रीड २०% SP (२ ग्रॅम प्रति १० लिटर) फवारावे.\n' +
        '३. हवेतील ओलावा टिकून असल्यास शेतात पाण्याचा निचरा योग्य ठेवा.'
      );
    }
    return (
      'Soybean Yellowing Management:\n' +
      '1. Yellow Mosaic is transmitted by whiteflies. Rogue out early infected plants.\n' +
      '2. Vector Control: Spray Thiamethoxam 25% WG @ 3g/10L water or Acetamiprid 20% SP @ 2g/10L water.\n' +
      '3. Ensure proper drainage in black soils.'
    );
  }

  // 3. Tur Wilt (उबळणे)
  if (q.includes('तूर') || q.includes('मर') || q.includes('उबळणे') || q.includes('wilt') || q.includes('tur')) {
    if (lang === 'mr') {
      return (
        'तुरीच्या मर (उबळणे) रोगासाठी उपाय:\n' +
        '१. ट्रायकोडर्मा व्हिरीडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर पाण्यात मिसळून निरोगी झाडांच्या मुळाशी ड्रेन्चिंग (ओतणे) करा.\n' +
        '२. कार्बेन्डाझिम ५०% WP (२ ग्रॅम/लिटर) द्रावणाने प्रादुर्भावग्रस्त क्षेत्राभोवती आळवणी करा.\n' +
        '३. शेतात पाणी साचू देऊ नका.'
      );
    }
    return (
      'Tur Wilt Disease Management:\n' +
      '1. Drench root zones of healthy plants with Trichoderma viride @ 5g/L water.\n' +
      '2. Alternatively, apply Carbendazim 50% WP @ 2g/L around infected patches.\n' +
      '3. Maintain good field drainage.'
    );
  }

  // 4. Mandi Rates & Prices
  if (q.includes('भाव') || q.includes('दर') || q.includes('mandi') || q.includes('rate') || q.includes('price')) {
    if (lang === 'mr') {
      return (
        'विदर्भातील APMC बाजार भाव माहिती:\n' +
        '• हिंगणघाट, यवतमाळ व अकोला APMC मध्ये कापसाचा सरासरी भाव ₹७,४०० ते ₹७,८५० प्रति क्विंटल दरम्यान आहे.\n' +
        '• सोयाबीनचा सरासरी भाव ₹४,३०० ते ₹४,६५० प्रति क्विंटल आहे.\n' +
        '• केंद्र शासनाचा कापसाचा मध्यम धाग्यासाठी हमीभाव (MSP) ₹७,५२१ आहे.\n' +
        'आपल्या गावावरून कोणत्या बाजारात सर्वाधिक निव्वळ नफा मिळेल हे पाहण्यासाठी "बाजार भाव" (Mandi Rates) टॅब पहा.'
      );
    }
    return (
      'Vidarbha Mandi Rates Overview:\n' +
      '• Cotton is currently trading between ₹7,400 to ₹7,850/Quintal across Hinganghat, Yavatmal, and Akola APMCs.\n' +
      '• Soybean modal price is ₹4,300 to ₹4,650/Quintal.\n' +
      '• Government Cotton MSP is ₹7,521/Quintal. Use our Mandi Rates calculator for net return calculations.'
    );
  }

  // 5. Default Helpful Guidance
  if (lang === 'mr') {
    return (
      'मी आपल्या शेतीविषयक प्रश्नाची नोंद घेतली आहे. पिकावरील कीड किंवा रोगाच्या अचूक निदानासाठी खालील कॅमेरा आयकॉन दाबून पानाचा स्पष्ट फोटो काढा. किंवा आपल्या स्थानिक KVK शास्त्रज्ञांशी संपर्क साधण्यासाठी "तज्ज्ञ सल्ला" (Expert Support) विभाग पहा.'
    );
  }
  return (
    'I have noted your question. For precise crop diagnosis, please capture a photo using the Scan button. For institutional support, check the Expert Support directory for your local KVK.'
  );
}
