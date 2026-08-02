/**
 * geminiService.js
 * Interface to Google Generative AI using Gemini 3.6 Flash / 3.5 Flash Lite
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `You are KrishiSahayak, an empathetic and knowledgeable AI assistant dedicated to helping Indian farmers understand government agricultural schemes, subsidies, loan processes, and crop management.
Follow these core guidelines in all responses:
1. Use simple, clear, and empathetic language suitable for farmers.
2. Explain complex agricultural terms, acronyms, and official jargon clearly.
3. Always cite relevant government schemes, official portals, or departments accurately when applicable.
4. Strictly base your information on verified facts. Never invent rules, deadlines, or scheme details.
5. Provide step-by-step actionable advice whenever answering how-to or application process questions.`;

const LANGUAGE_NAMES = {
  mr: 'Marathi (मराठी)',
  hi: 'Hindi (हिंदी)',
  en: 'English',
  gu: 'Gujarati (ગુજરાતી)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  kn: 'Kannada (ಕನ್ನಡ)',
};

// Direct REST API fallback
async function callGeminiREST(apiKey, prompt) {
  const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
  ];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nUser: ${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (e) {
      // try next model
    }
  }
  return null;
}

/**
 * Generate AI text response using Google Generative AI SDK or direct REST.
 */
async function generateContent(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  const langCode = options.language || 'hi';
  const langName = LANGUAGE_NAMES[langCode] || langCode;

  if (!apiKey || apiKey.trim() === '') {
    return generateFallbackResponse(prompt);
  }

  let systemInstruction = options.systemInstruction || SYSTEM_INSTRUCTION;
  if (langName && !systemInstruction.includes(langName)) {
    systemInstruction += `\n6. Respond in ${langName}, using simple vocabulary suitable for an Indian farmer.`;
  }

  // Candidate models matching current Google Gemini API availability
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
  ];

  // Try SDK approach first
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim().length > 0) {
          console.log(`[geminiService] Success with Gemini model: ${modelName}`);
          return text.trim();
        }
      } catch (err) {
        console.warn(`[geminiService] Model ${modelName} notice: ${err.message}`);
      }
    }
  } catch (sdkError) {
    console.warn('[geminiService] SDK init notice:', sdkError.message);
  }

  // Fallback to direct REST API
  try {
    const restResult = await callGeminiREST(apiKey, prompt);
    if (restResult) {
      console.log('[geminiService] Success via REST API fallback');
      return restResult;
    }
  } catch (restError) {
    console.warn('[geminiService] REST API fallback notice:', restError.message);
  }

  console.warn('[geminiService] Using intelligent agricultural fallback');
  return generateFallbackResponse(prompt);
}

/**
 * Fallback response for offline/fallback scenarios
 */
function generateFallbackResponse(prompt) {
  const lower = (prompt || '').toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('helo')) {
    return `Namaste! I am KrishiSahayak, your AI agricultural assistant. I can help you with:\n• Government farming schemes (PM-KISAN, PMFBY, KCC)\n• Crop subsidies and grants\n• Loan application guidance\n• Document requirements\n\nHow can I help you today?`;
  }

  if (lower.includes('pm-kisan') || lower.includes('pm kisan') || lower.includes('samman nidhi')) {
    return `PM-KISAN Samman Nidhi:\n• Financial support: ₹6,000/year in 3 installments of ₹2,000\n• Eligibility: All landholding farmer families\n• Documents: Aadhaar card, land record (7/12), bank passbook\n• Apply at: pmkisan.gov.in or nearest CSC center`;
  }

  if (lower.includes('kcc') || lower.includes('kisan credit') || lower.includes('loan')) {
    return `Kisan Credit Card (KCC):\n• Collateral-free crop credit up to ₹1.60 Lakh\n• Subsidized interest rate: 4-7% per annum\n• Documents: Identity proof, address proof, land records, bank passbook\n• Apply at your nearest bank branch or cooperative society`;
  }

  if (lower.includes('pmfby') || lower.includes('fasal bima') || lower.includes('insurance')) {
    return `PMFBY - Pradhan Mantri Fasal Bima Yojana:\n• Crop insurance against natural calamities\n• Premium: 1.5% for Rabi, 2% for Kharif crops\n• Documents: Land record, bank account, Aadhaar\n• Enroll through your bank or CSC center before sowing season`;
  }

  if (lower.includes('solar') || lower.includes('kusum') || lower.includes('pump')) {
    return `PM-KUSUM Scheme:\n• Solar pump subsidy: Up to 60% government grant\n• Remaining 30% as soft bank loan\n• Farmer pays only 10%\n• Apply through your state agriculture department`;
  }

  return `Namaste! I am KrishiSahayak AI assistant. Please ask me about:\n• PM-KISAN income support\n• Kisan Credit Card (KCC) loans\n• PMFBY crop insurance\n• PM-KUSUM solar pumps\n• Any other agricultural scheme or subsidy`;
}

module.exports = {
  generateContent,
  SYSTEM_INSTRUCTION,
  generateFallbackResponse,
};
