import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, X, Bot, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { createSpeechRecognizer, isSpeechRecognitionSupported, speakText, stopSpeaking } from '../../lib/speech';
import { Language } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: language === 'mr'
        ? 'राम राम शेतकरी दादा! मी तुमचा कृषीस्कॅन AI मदतनीस आहे. कापूस, सोयाबीन, खते किंवा बाजार भावाविषयी कोणताही प्रश्न मराठीत बोला किंवा विचारा.'
        : language === 'hi'
        ? 'नमस्ते किसान भाई! मैं आपका KrushiScan AI सहायक हूँ। कपास, सोयाबीन, रोग या मंडी भाव के बारे में कोई भी सवाल बोलकर पूछें।'
        : 'Welcome! I am your KrushiScan AI farming assistant. Ask any question regarding crop pests, fertilizers, or mandi rates.',
      time: 'आत्ताच',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognizerRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setIsSpeaking(false);
      if (recognizerRef.current) {
        recognizerRef.current.abort?.();
        setIsListening(false);
      }
    }
  }, [isOpen]);

  const quickQuestions = [
    {
      label: language === 'mr' ? 'कापसावर गुलाबी बोंडअळी' : language === 'hi' ? 'कपास में गुलाबी सुंडी' : 'Pink bollworm in cotton',
      q: language === 'mr' ? 'माझ्या कापसाच्या शेतात गुलाबी बोंडअळी आली आहे, काय उपाय करू?' : 'कपास में गुलाबी सुंडी नियंत्रण के उपाय बताएं?',
    },
    {
      label: language === 'mr' ? 'सोयाबीन पिवळे पडणे' : language === 'hi' ? 'सोयाबीन पीला पड़ना' : 'Yellowing in soybean',
      q: language === 'mr' ? 'सोयाबीनची पाने पिवळी पडत आहेत, काय करावे?' : 'सोयाबीन की पत्तियां पीली हो रही हैं, क्या करें?',
    },
    {
      label: language === 'mr' ? 'तुरीचा मर रोग (उबळणे)' : language === 'hi' ? 'तुअर उकठा रोग' : 'Tur wilt disease',
      q: language === 'mr' ? 'तुरीची झाडे उबळत आहेत (मर रोग), मुळाशी काय टाकावे?' : 'तुअर में उकठा रोग का इलाज क्या है?',
    },
    {
      label: language === 'mr' ? 'कापूस बाजार भाव' : language === 'hi' ? 'कपास मंडी भाव' : 'Cotton mandi price',
      q: language === 'mr' ? 'विदर्भात कापसाचा आजचा बाजार भाव किती आहे?' : 'कपास का आज का मंडी भाव क्या है?',
    },
  ];

  const handleStartListening = () => {
    setSpeechError(null);
    if (!isSpeechRecognitionSupported()) {
      setSpeechError('तुमच्या ब्राऊझरमध्ये व्हॉईस रेकग्निशन उपलब्ध नाही. खाली लिहून प्रश्न विचारा.');
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        language,
        (transcript) => {
          setInputText(transcript);
        },
        (error) => {
          console.warn('Voice error:', error);
          setIsListening(false);
          setSpeechError('आवाज ऐकण्यात अडचण आली. कृपया पुन्हा बोला किंवा टाईप करा.');
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Call FastAPI backend AI assistant endpoint (grounded with real weather & mandi rates)
    (async () => {
      let replyText = '';
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
        const res = await fetch(`${backendUrl}/api/ai/assistant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language,
            district: 'Yavatmal',
            active_crops: ['कापूस (Cotton)', 'सोयाबीन (Soybean)', 'तूर (Pigeonpea)'],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyText = data.reply || '';
        }
      } catch (err) {
        console.warn('Backend voice assistant endpoint unreachable, using client knowledge engine:', err);
      }

      if (!replyText) {
        replyText = generateAssistantAnswer(text, language);
      }

      const assistantMsg: Message = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Speak answer automatically
      handleSpeak(replyText);
    })();
  };

  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    speakText(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeak = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-[#D5DEE8] text-[#0A2540] rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[700px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#EEF3F8]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6 text-[#FF9933]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0A2540] flex items-center gap-1.5">
                KrushiScan Voice AI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#138808]/15 text-[#138808] border border-[#138808]/30 font-bold">
                  विदर्भ शेती तज्ज्ञ
                </span>
              </h3>
              <p className="text-xs text-[#5B6B7D] font-medium">
                मराठी, हिंदी किंवा इंग्रजीत बोला
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={handleStopSpeak}
                className="p-2 rounded-full bg-red-50 text-[#C0392B] border border-red-200 hover:bg-red-100 transition"
                title="आवाज थांबवा"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#5B6B7D] hover:text-[#0A2540] hover:bg-[#EEF3F8] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Signature Tri-Color Detail Stripe */}
        <div className="h-1 w-full grid grid-cols-3">
          <div className="bg-[#FF9933]" />
          <div className="bg-white" />
          <div className="bg-[#138808]" />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#EEF3F8]/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#138808]/15 border border-[#138808]/30 flex items-center justify-center text-[#138808] shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0A2540] text-white rounded-br-none shadow-xs font-semibold'
                    : 'bg-white text-[#0A2540] rounded-bl-none shadow-xs border border-[#D5DEE8] font-medium'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-[#D5DEE8]/50 text-[10px] text-[#5B6B7D]">
                  <span>{m.time}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => handleSpeak(m.text)}
                      className="text-[#138808] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Volume2 className="w-3 h-3" />
                      ऐका
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#EEF3F8] border border-[#D5DEE8] flex items-center justify-center text-[#0A2540] shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-[#D5DEE8] bg-white overflow-x-auto flex gap-2 no-scrollbar">
          {quickQuestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.q)}
              className="px-3 py-1 rounded-full bg-[#EEF3F8] hover:bg-[#D5DEE8]/60 border border-[#D5DEE8] text-xs font-semibold text-[#0A2540] shrink-0 transition"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar with Mic & Send */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#D5DEE8]">
          {speechError && (
            <p className="text-xs text-[#C0392B] mb-2 px-1 font-medium">{speechError}</p>
          )}

          <div className="flex items-center gap-2">
            {/* Mic Button with Pulse */}
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition active:scale-95 border-2 ${
                isListening
                  ? 'bg-[#C0392B] border-[#C0392B] text-white animate-pulse shadow-md shadow-red-600/30'
                  : 'bg-white border-[#FF9933] text-[#0A2540] hover:bg-[#EEF3F8]'
              }`}
              title={isListening ? 'माईक बंद करा' : 'माईक सुरू करून बोला'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#0A2540]" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'ऐकत आहे... बोला...' : 'येथे लिहा किंवा माईक दाबून बोला...'}
              className="flex-1 bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] placeholder:text-[#5B6B7D] font-medium"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#0A2540]/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateAssistantAnswer(query: string, lang: Language): string {
  const q = query.toLowerCase();

  if (q.includes('गुलाबी') || q.includes('बोंड') || q.includes('pink') || q.includes('bollworm')) {
    if (lang === 'mr') {
      return 'कापसावरील गुलाबी बोंडअळीच्या नियंत्रणासाठी: १) शेतात एकरी ५ कामगंध सापळे लावा. २) सुरुवातीला निंबोळी तेल १५०० पीपीएम (५ मिली/लिटर) फवारा. ३) प्रादुर्भाव जास्त असल्यास प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) किंवा इमामेक्टिन बेन्झोएट (४ ग्रॅम/१० लिटर) फवारावे. फरदड कापूस घेणे टाळा.';
    }
    return 'For pink bollworm in cotton: 1) Install 5 pheromone traps per acre. 2) Spray 5% Neem seed kernel extract or Azadirachtin 1500 ppm. 3) If ETL crossed (8 moths/trap/day), spray Profenofos 50% EC @ 2ml/L or Emamectin Benzoate 5% SG @ 4g/10L. Avoid ratoon cotton.';
  }

  if (q.includes('सोयाबीन') || q.includes('पिवळे') || q.includes('yellow') || q.includes('mosaic')) {
    if (lang === 'mr') {
      return 'सोयाबीनमध्ये पाने पिवळी पडणे हे मुख्यत्वे पिवळा मोझॅक विषाणू किंवा पांढऱ्या माशीमुळे होते. विषाणूचा प्रसार पांढऱ्या माशीद्वारे होतो. यासाठी थायामेथोक्साम २५% WG (३ ग्रॅम प्रति १० लिटर) फवारावे. सुरुवातीची रोगट झाडे उपटून नष्ट करा.';
    }
    return 'Yellowing in soybean is commonly caused by Yellow Mosaic Virus transmitted by whiteflies. Control the whitefly vector using Thiamethoxam 25% WG @ 3g/10L water. Rogue out infected plants in the early stages.';
  }

  if (q.includes('तूर') || q.includes('मर') || q.includes('उबळणे') || q.includes('wilt') || q.includes('tur')) {
    if (lang === 'mr') {
      return 'तुरीच्या मर (उबळणे) रोगासाठी ट्रायकोडर्मा व्हिरीडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर पाण्यात मिसळून झाडांच्या मुळाशी ओतावे (ड्रेन्चिंग). प्रादुर्भावग्रस्त झाडे उपटून टाका व आजूबाजूच्या निरोगी झाडांना कार्बेन्डाझिम (२ ग्रॅम/लिटर) ने संरक्षण द्या.';
    }
    return 'For Tur wilt disease (Fusarium udum), drench roots of surrounding healthy plants with Trichoderma viride @ 5g/L or Carbendazim 50% WP @ 2g/L. Ensure good soil drainage.';
  }

  if (q.includes('भाव') || q.includes('दर') || q.includes('mandi') || q.includes('rate') || q.includes('price')) {
    if (lang === 'mr') {
      return 'आज विदर्भात हिंगणघाट बाजारात लांब धाग्याच्या कापसाला ₹७,७८० ते ₹७,९२० प्रति क्विंटल दर मिळत आहे. यवतमाळ APMC मध्ये मध्यम धाग्याला ₹७,५२० भाव आहे. कापसाचा शासकीय हमीभाव (MSP) ₹७,५२१ आहे. आपला वाहतूक खर्च मोजण्यासाठी "बाजार भाव" पृष्ठावरील कॅल्क्युलेटर वापरा.';
    }
    return 'Today cotton in Hinganghat APMC is trading between ₹7,780 to ₹7,920/Quintal. Yavatmal APMC is at ₹7,520/Quintal. Government MSP is ₹7,521. Check our Mandi Calculator to compute net return after transport costs.';
  }

  // Default helpful agri response
  if (lang === 'mr') {
    return 'मी आपल्या शेतीविषयक प्रश्नाची नोंद घेतली आहे. पिकावरील किडी किंवा रोगाच्या अचूक निदानासाठी मुख्यपृष्ठावरील "पीक तपासा" (Scan) बटण दाबून पानाचा स्पष्ट फोटो काढा. आपण कृषी विद्यापीठाच्या शास्त्रज्ञांनाही थेट प्रश्न विचारू शकता.';
  }
  return 'Thank you for your question. For precise crop diagnosis, please use the "Scan Your Crop" button on the dashboard to take a clear photograph of the affected leaf. You can also consult our agricultural university experts.';
}
