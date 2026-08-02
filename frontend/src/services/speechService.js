/**
 * Web Speech API Service for KrishiSahayak
 * Provides Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities.
 */

// Check if Speech-to-Text (STT) is supported in the browser
export function isSTTSupported() {
  try {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  } catch (e) {
    return false;
  }
}

// Check if Text-to-Speech (TTS) is supported in the browser
export function isTTSSupported() {
  try {
    return typeof window !== 'undefined' && Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
  } catch (e) {
    return false;
  }
}

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

/**
 * Creates a Speech-to-Text (STT) Recognition controller.
 * @param {Object} options Configuration options
 * @param {Function} options.onResult Callback function receiving transcript string
 * @param {Function} [options.onError] Callback function on error
 * @param {Function} [options.onEnd] Callback function when recognition ends
 * @param {string} [options.lang='hi-IN'] Language code
 * @param {boolean} [options.continuous=false] Whether to listen continuously
 * @param {boolean} [options.interimResults=true] Whether to yield interim results
 */
export function createSTTListener({
  onResult,
  onError,
  onEnd,
  lang = 'hi-IN',
  continuous = false,
  interimResults = true,
}) {
  const targetLang = normalizeLang(lang);
  if (!isSTTSupported()) {
    console.warn('Web Speech STT is not supported in this browser environment.');
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
  let listening = false;

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.lang = targetLang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult && transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      listening = false;
      if (onError) {
        onError(event.error || new Error('Speech recognition error occurred'));
      }
    };

    recognition.onend = () => {
      listening = false;
      if (onEnd) {
        onEnd();
      }
    };
  } catch (err) {
    console.warn('Failed to instantiate SpeechRecognition in restricted environment:', err);
    return {
      start: () => {
        if (onError) onError(err);
      },
      stop: () => {},
      abort: () => {},
      isListening: () => false,
    };
  }

  return {
    start: () => {
      try {
        if (recognition && !listening) {
          recognition.start();
        }
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        if (onError) onError(err);
      }
    },
    stop: () => {
      try {
        if (recognition && listening) {
          recognition.stop();
        }
      } catch (err) {
        console.error('Failed to stop speech recognition:', err);
      }
    },
    abort: () => {
      try {
        if (recognition) {
          recognition.abort();
        }
      } catch (err) {
        console.error('Failed to abort speech recognition:', err);
      }
    },
    isListening: () => listening,
  };
}

/**
 * Clean markdown symbols for natural TTS speech
 */
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links
    .replace(/[*#_~`>]/g, '') // remove markdown symbols (*, #, _, ~, `, >)
    .replace(/^[-\s]+/gm, '') // remove leading dashes/bullets
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

/**
 * Request audio recording permission for Web Speech API
 */
export async function requestMicrophonePermission() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // stop tracks immediately after permission check
      stream.getTracks().forEach((track) => track.stop());
      return true;
    }
  } catch (e) {
    console.warn('Microphone permission check warning:', e);
  }
  return false;
}

/**
 * Text-to-Speech (TTS) Speak function.
 * @param {string} rawText Text to read aloud
 * @param {Object} options TTS options
 */
export function speakText(rawText, options = {}) {
  if (!isTTSSupported() || !rawText) {
    if (options.onError) options.onError(new Error('TTS not supported or empty text.'));
    return false;
  }

  // Clean markdown out of text for smooth natural speech
  const text = cleanTextForSpeech(rawText);
  if (!text) return false;

  // Cancel existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = normalizeLang(options.lang || 'hi-IN');
  utterance.lang = lang;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 0.95;
  utterance.volume = options.volume ?? 1.0;

  const setVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchingVoice = voices.find(
        (v) => v.lang === lang || v.lang.startsWith(lang.split('-')[0])
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = (e) => options.onError(e);

    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    setVoiceAndSpeak();
  } else {
    // Wait for voices to load in browsers/viewports
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      setVoiceAndSpeak();
    };
    // Fallback attempt if onvoiceschanged doesn't trigger
    setTimeout(setVoiceAndSpeak, 100);
  }

  return true;
}

/**
 * Stops any ongoing Text-to-Speech.
 */
export function stopSpeech() {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if SpeechSynthesis is currently speaking.
 */
export function isSpeaking() {
  return isTTSSupported() && window.speechSynthesis.speaking;
}

/**
 * Get available voices from speech synthesis.
 */
export function getAvailableVoices() {
  if (!isTTSSupported()) return [];
  return window.speechSynthesis.getVoices();
}

const speechService = {
  isSTTSupported,
  isTTSSupported,
  createSTTListener,
  speakText,
  stopSpeech,
  isSpeaking,
  getAvailableVoices,
};

export default speechService;
