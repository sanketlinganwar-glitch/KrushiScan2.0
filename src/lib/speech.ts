import { Language } from '../types';

// Speech to Text (Voice Recognition)
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createSpeechRecognizer(
  language: Language,
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition not supported in this browser');
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  const langCodeMap: Record<Language, string> = {
    mr: 'mr-IN',
    hi: 'hi-IN',
    en: 'en-IN',
  };

  recognition.lang = langCodeMap[language] || 'mr-IN';
  recognition.continuous = false;
  recognition.interimResults = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

// Text to Speech (Audio playback for farmers)
export function speakText(text: string, language: Language, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip excessive markdown or asterisks for clean natural reading
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);

  const langCodeMap: Record<Language, string> = {
    mr: 'mr-IN',
    hi: 'hi-IN',
    en: 'en-IN',
  };

  utterance.lang = langCodeMap[language] || 'mr-IN';
  utterance.rate = 0.95; // Slightly slower for better comprehension by rural farmers
  utterance.pitch = 1.0;

  // Attempt to select an Indian locale voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => 
    v.lang.startsWith(langCodeMap[language]) || 
    (language === 'mr' && (v.lang.includes('mr') || v.lang.includes('hi')))
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
