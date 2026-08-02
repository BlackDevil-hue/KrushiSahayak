/**
 * geminiService.js
 * Interface to Google Generative AI (@google/generative-ai) with dev/test fallback support.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * System instruction for the KrishiSahayak Agricultural AI Assistant.
 */
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

/**
 * Generate AI text response using Google Generative AI SDK, falling back gracefully when key is missing or call fails.
 * @param {string} prompt - Prompt compiled by RAG service or document analyzer.
 * @param {object} options - Optional config { model, systemInstruction, language }
 * @returns {Promise<string>} Generated text content.
 */
async function generateContent(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Append language instruction if specified
  const langCode = options.language || 'hi';
  const langName = LANGUAGE_NAMES[langCode] || langCode;

  // Use fallback if API key is missing or dummy
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY' || process.env.NODE_ENV === 'test_mock') {
    return generateFallbackResponse(prompt);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [options.model, 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'].filter(Boolean);
    let text = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        let systemInstruction = options.systemInstruction || SYSTEM_INSTRUCTION;
        if (langName && !systemInstruction.includes(langName)) {
          systemInstruction += `\n6. Respond in ${langName}, using simple, clear, and empathetic vocabulary suitable for an Indian farmer with limited literacy.`;
        }

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resText = response.text();
        if (resText && resText.trim().length > 0) {
          text = resText.trim();
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (text && text.trim().length > 0) {
      return text.trim();
    }

    return generateFallbackResponse(prompt);
  } catch (error) {
    console.warn('[geminiService] Gemini API call failed, using dev/test fallback response:', error.message);
    return generateFallbackResponse(prompt);
  }
}

/**
 * Deterministic, intelligent fallback response for offline / dev / test environments.
 * @param {string} prompt - Prompt text.
 * @returns {string} Fallback assistant response.
 */
function generateFallbackResponse(prompt) {
  const lower = (prompt || '').toLowerCase();

  if (lower.includes('pm-kisan') || lower.includes('pm kisan') || lower.includes('samman nidhi')) {
    return `Namaste! Under PM-Kisan Samman Nidhi, eligible landholding farmer families receive financial support of ₹6,000 per year in three equal installments of ₹2,000. Required documents include Aadhaar card, land ownership documents (7/12 extract / Khatauni), and bank account passbook linked with Aadhaar. Applications can be submitted at pmkisan.gov.in or your local Common Service Centre (CSC).`;
  }

  if (lower.includes('kcc') || lower.includes('kisan credit card') || lower.includes('credit') || lower.includes('loan')) {
    return `Namaste! The Kisan Credit Card (KCC) scheme provides farmers with timely access to short-term credit for crop cultivation and post-harvest expenses at subsidized interest rates. Key required documents are identity proof, address proof, land record documents, and bank passbook. Contact your local bank branch to apply.`;
  }

  if (lower.includes('document') || lower.includes('aadhaar') || lower.includes('upload') || lower.includes('proof')) {
    return `To apply for agricultural schemes, please ensure you have the following valid documents ready: 1. Aadhaar Card, 2. Land Ownership Record (7/12, RoR, or Khatauni), 3. Active Bank Account Passbook, 4. Passport size photographs. Ensure your name matches across all records.`;
  }

  return `Namaste! I am KrishiSahayak, your agricultural assistant. I can help you search for government schemes, understand eligibility criteria, and prepare required documents for your applications. Please feel free to ask any question about farming schemes or subsidies!`;
}

module.exports = {
  generateContent,
  SYSTEM_INSTRUCTION,
  generateFallbackResponse,
};
