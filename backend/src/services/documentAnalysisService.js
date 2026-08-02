/**
 * documentAnalysisService.js
 * AI Document Analysis Service for KrishiSahayak.
 * Uses Gemini API (or fallback parser) to analyze extracted OCR text and output a structured JSON summary.
 */

const geminiService = require('./geminiService');

/**
 * Analyzes extracted document text using Gemini API or fallback rules to produce a structured JSON summary.
 * @param {string} extractedText - Text obtained from OCR.
 * @returns {Promise<object>} { benefits: [], eligibility: [], requiredDocuments: [], deadlines: [] }
 */
async function analyzeDocument(extractedText) {
  const text = (extractedText || '').trim();

  if (!text) {
    return {
      benefits: ['No specific benefits detected in empty document.'],
      eligibility: ['Standard farmer identification required.'],
      requiredDocuments: ['Aadhaar Card', 'Land Record'],
      deadlines: ['No immediate deadline specified.'],
    };
  }

  const prompt = `You are an expert Indian agricultural scheme document analyst.
Analyze the following extracted document OCR text and return ONLY a raw valid JSON object with EXACTLY these four string array fields:
- "benefits": list of financial or support benefits mentioned in the text
- "eligibility": list of eligibility criteria, land size, age, or income limits mentioned
- "requiredDocuments": list of required documents, ID proofs, or certificates mentioned
- "deadlines": list of deadlines, valid dates, or application timelines mentioned

Document OCR Text:
"${text}"

Return strictly valid JSON without any markdown code blocks or extra conversational commentary.`;

  try {
    const aiResponse = await geminiService.generateContent(prompt, {
      model: 'gemini-1.5-flash',
    });

    const parsedJson = parseAiJsonResponse(aiResponse);
    if (parsedJson) {
      return sanitizeSummaryObject(parsedJson);
    }
  } catch (error) {
    console.warn('[documentAnalysisService] AI analysis failed, switching to rule-based parser fallback:', error.message);
  }

  return ruleBasedSummaryExtraction(text);
}

/**
 * Parses JSON response from AI output, stripping code blocks if present.
 * @param {string} rawResponse - Text response from LLM.
 * @returns {object|null} Parsed object or null.
 */
function parseAiJsonResponse(rawResponse) {
  try {
    if (!rawResponse) return null;

    let cleanText = rawResponse.trim();
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const obj = JSON.parse(cleanText);
    return obj;
  } catch (e) {
    return null;
  }
}

/**
 * Sanitizes and formats parsed JSON into expected schema array structure.
 * @param {object} obj - Object parsed from JSON.
 * @returns {object} { benefits, eligibility, requiredDocuments, deadlines }
 */
function sanitizeSummaryObject(obj) {
  const ensureStringArray = (val, fallbackItem) => {
    if (Array.isArray(val)) {
      const filtered = val.map((v) => String(v).trim()).filter(Boolean);
      if (filtered.length > 0) return filtered;
    } else if (typeof val === 'string' && val.trim().length > 0) {
      return [val.trim()];
    }
    return [fallbackItem];
  };

  return {
    benefits: ensureStringArray(obj.benefits || obj.Benefits, 'Financial support for eligible agricultural activities.'),
    eligibility: ensureStringArray(obj.eligibility || obj.Eligibility, 'Landholding small or marginal farmers.'),
    requiredDocuments: ensureStringArray(obj.requiredDocuments || obj.documents, 'Aadhaar Card, Land Records, Bank Passbook.'),
    deadlines: ensureStringArray(obj.deadlines || obj.Deadlines, 'As per government scheme calendar.'),
  };
}

/**
 * Intelligent rule-based fallback parser for offline/test mode.
 * @param {string} text - OCR text string.
 * @returns {object} Structured summary object.
 */
function ruleBasedSummaryExtraction(text) {
  const lines = text.split(/\r?\n|\./).map((l) => l.trim()).filter((l) => l.length > 0);

  const benefits = [];
  const eligibility = [];
  const requiredDocuments = [];
  const deadlines = [];

  const lowerText = text.toLowerCase();

  lines.forEach((line) => {
    const l = line.toLowerCase();

    if (l.includes('benefit') || l.includes('rs.') || l.includes('₹') || l.includes('subsidy') || l.includes('financial') || l.includes('amount')) {
      benefits.push(line);
    }
    if (l.includes('eligible') || l.includes('acre') || l.includes('land') || l.includes('farmer') || l.includes('category') || l.includes('age') || l.includes('income')) {
      eligibility.push(line);
    }
    if (l.includes('aadhaar') || l.includes('document') || l.includes('passbook') || l.includes('record') || l.includes('certificate') || l.includes('proof') || l.includes('photo')) {
      requiredDocuments.push(line);
    }
    if (l.includes('date') || l.includes('deadline') || l.includes('last') || l.includes('validity') || l.includes('by')) {
      deadlines.push(line);
    }
  });

  // Provide sensible defaults if heuristic found no matching lines
  if (benefits.length === 0) {
    if (lowerText.includes('kisan')) {
      benefits.push('Financial assistance of ₹6,000 per year in 3 installments.');
    } else {
      benefits.push('Agricultural subsidy and financial credit support.');
    }
  }

  if (eligibility.length === 0) {
    eligibility.push('Small and marginal landholding farmers with valid land records.');
  }

  if (requiredDocuments.length === 0) {
    requiredDocuments.push('Aadhaar Card', 'Land Records (7/12 Extract)', 'Bank Account Passbook');
  }

  if (deadlines.length === 0) {
    deadlines.push('Open enrollment for current financial year.');
  }

  return {
    benefits,
    eligibility,
    requiredDocuments,
    deadlines,
  };
}

module.exports = {
  analyzeDocument,
  parseAiJsonResponse,
  sanitizeSummaryObject,
  ruleBasedSummaryExtraction,
};
