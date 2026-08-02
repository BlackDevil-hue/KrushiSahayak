import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech as NativeTextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Speech Service for KrishiSahayak
 * Supports both Capacitor native plugins (Android APK) and Web Speech API (Browser).
 */

const LANG_MAP = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  en: 'en-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
};

function normalizeLang(lang) {
  if (!lang) return 'hi-IN';
  if (LANG_MAP[lang]) return LANG_MAP[lang];
  if (lang.length === 2) return `${lang.toLowerCase()}-IN`;
  return lang;
}

export function isNative() {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

export function isSTTSupported() {
  if (isNative()) return true;
  try {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  } catch (e) {
    return false;
  }
}

export function isTTSSupported() {
  if (isNative()) return true;
  try {
    return typeof window !== 'undefined' && Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
  } catch (e) {
    return false;
  }
}

export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links
    .replace(/[*#_~`>]/g, '') // remove markdown symbols
    .replace(/^[-\s]+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates Speech-to-Text listener (Native Capacitor or Web Speech API)
 */
export function createSTTListener({
  onResult,
  onError,
  onEnd,
  lang = 'hi-IN',
}) {
  const targetLang = normalizeLang(lang);
  let listening = false;

  if (isNative()) {
    return {
      start: async () => {
        try {
          const hasPermission = await NativeSpeechRecognition.hasPermission();
          if (!hasPermission.permission) {
            await NativeSpeechRecognition.requestPermission();
          }

          listening = true;
          NativeSpeechRecognition.removeAllListeners();

          NativeSpeechRecognition.addListener('partialResults', (data) => {
            if (data?.matches?.length > 0 && onResult) {
              onResult(data.matches[0]);
            }
          });

          await NativeSpeechRecognition.start({
            language: targetLang,
            maxResults: 1,
            prompt: 'Say your question clearly',
            partialResults: true,
            popup: false,
          });
        } catch (err) {
          listening = false;
          console.warn('Native STT error:', err);
          if (onError) onError(err);
        }
      },
      stop: async () => {
        try {
          listening = false;
          await NativeSpeechRecognition.stop();
          if (onEnd) onEnd();
        } catch (err) {
          console.warn('Native STT stop error:', err);
        }
      },
      abort: async () => {
        try {
          listening = false;
          await NativeSpeechRecognition.stop();
          if (onEnd) onEnd();
        } catch (err) {}
      },
      isListening: () => listening,
    };
  }

  // Fallback: Web Speech API for Browser
  if (!isSTTSupported()) {
    return {
      start: () => {
        if (onError) onError(new Error('Speech recognition is not supported in this browser.'));
      },
      stop: () => {},
      abort: () => {},
      isListening: () => false,
    };
  }

  let recognition = null;
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = targetLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => { listening = true; };
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult && transcript) onResult(transcript);
    };
    recognition.onerror = (event) => {
      listening = false;
      if (onError) onError(event.error || new Error('Speech recognition error'));
    };
    recognition.onend = () => {
      listening = false;
      if (onEnd) onEnd();
    };
  } catch (err) {
    return {
      start: () => { if (onError) onError(err); },
      stop: () => {},
      abort: () => {},
      isListening: () => false,
    };
  }

  return {
    start: () => {
      try {
        if (recognition && !listening) recognition.start();
      } catch (err) {
        if (onError) onError(err);
      }
    },
    stop: () => {
      try {
        if (recognition && listening) recognition.stop();
      } catch (err) {}
    },
    abort: () => {
      try {
        if (recognition) recognition.abort();
      } catch (err) {}
    },
    isListening: () => listening,
  };
}

/**
 * Text-to-Speech (Native Capacitor or Web Speech API)
 */
export async function speakText(rawText, options = {}) {
  const text = cleanTextForSpeech(rawText);
  if (!text) return false;

  const targetLang = normalizeLang(options.lang || 'hi-IN');

  if (isNative()) {
    try {
      if (options.onStart) options.onStart();
      await NativeTextToSpeech.speak({
        text,
        lang: targetLang,
        rate: options.rate ?? 1.0,
        pitch: options.pitch ?? 1.0,
        volume: options.volume ?? 1.0,
        category: 'ambient',
      });
      if (options.onEnd) options.onEnd();
      return true;
    } catch (err) {
      console.warn('Native TTS error:', err);
      if (options.onError) options.onError(err);
      return false;
    }
  }

  // Fallback: Web Speech API for Browser
  if (!isTTSSupported()) {
    if (options.onError) options.onError(new Error('TTS not supported'));
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 0.95;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeech() {
  if (isNative()) {
    try {
      NativeTextToSpeech.stop();
    } catch (e) {}
  } else if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  if (isNative()) return false;
  return isTTSSupported() && window.speechSynthesis.speaking;
}

const speechService = {
  isSTTSupported,
  isTTSSupported,
  createSTTListener,
  speakText,
  stopSpeech,
  isSpeaking,
};

export default speechService;
