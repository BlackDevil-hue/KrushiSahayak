import { useState, useEffect } from 'react';
import api from '../services/api';

const REAL_SCHEMES_FALLBACK = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Financial Support',
    description: 'Direct income support of ₹6,000 per year provided in 3 equal installments of ₹2,000 to eligible landholding farmer families across India through Direct Benefit Transfer (DBT).',
    benefits: [
      '₹6,000 annually in 3 installments of ₹2,000.',
      'Direct Benefit Transfer (DBT) into Aadhaar-seeded bank accounts.',
      'Input purchase support prior to Kharif and Rabi sowing seasons.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Land Revenue Record (Khatauni / Pattadar)', 'Bank Passbook', 'e-KYC Mobile Number'],
    applicationUrl: 'https://pmkisan.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    title: 'Kisan Credit Card (KCC) Scheme',
    category: 'Credit & Loan',
    description: 'Concessional revolving short-term credit facility up to ₹3 Lakh (extended up to ₹5 Lakh) at an effective interest rate of 4% per annum upon prompt repayment.',
    benefits: [
      'Credit limit up to ₹3L–₹5L at effective 4% interest rate.',
      'Collateral-free loans up to ₹1.60 Lakh.',
      'Integrated coverage for crop cultivation, animal husbandry, and fisheries.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Pattadar Passbook / Land Proof', 'Aadhaar Card', 'PAN Card', 'Bank Passbook', 'Passport Photo'],
    applicationUrl: 'https://agricoop.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Crop Insurance',
    description: 'Comprehensive risk insurance covering yield losses due to non-preventable natural risks, drought, floods, and pests with capped premiums (2% Kharif, 1.5% Rabi).',
    benefits: [
      'Full financial cover for pre-sowing to post-harvest crop loss.',
      'Capped farmer premium (1.5% Rabi, 2% Kharif, 5% Commercial).',
      'Satellite & drone imagery based fast claim settlements.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Sowing Certificate', 'Land Possession / Lease Agreement', 'Bank Account Passbook'],
    applicationUrl: 'https://pmfby.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'smam',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    category: 'Machinery & Mechanization',
    description: 'Capital subsidies ranging from 50% to 80% on approved farm machinery (tractors, tillers, rotavators, seed drills, drones) and Custom Hiring Centres (CHCs).',
    benefits: [
      '50% to 80% subsidy on farm implements and agricultural drones.',
      '40% to 80% financial assistance for Custom Hiring Centres.',
      'Enhanced subsidy caps for small, marginal, SC/ST, and women farmers.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Land Record (Khatauni / 7-12)', 'Bank Account Passbook', 'Equipment Quotation', 'Caste Certificate'],
    applicationUrl: 'https://agrimachinery.nic.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'aif',
    name: 'Agriculture Infrastructure Fund (AIF)',
    title: 'Agriculture Infrastructure Fund (AIF)',
    category: 'Infrastructure & Financing',
    description: '3% per annum interest subvention on institutional loans up to ₹2 Crore for up to 7 years, paired with CGTMSE credit guarantee coverage for post-harvest infrastructure.',
    benefits: [
      '3% interest subvention on loans up to ₹2 Crore for 7 years.',
      'Credit guarantee coverage under CGTMSE without fee costs.',
      'Funding for cold storage, warehouses, primary processing, and solar assets.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Detailed Project Report (DPR)', 'Bank Loan Application', 'Aadhaar / PAN Card', 'Land Ownership / Lease', 'Audited Financials'],
    applicationUrl: 'https://agriinfra.dac.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'namo-drone-didi',
    name: 'Namo Drone Didi Scheme',
    title: 'Namo Drone Didi Scheme',
    category: 'Technology & Women Empowerment',
    description: 'Capital subsidy covering 80% of the cost of agricultural drones and operational packages (up to ₹8 Lakh) provided to Women Self-Help Groups (SHGs) under DAY-NRLM.',
    benefits: [
      '80% capital subsidy (up to ₹8 Lakh) for agricultural drones.',
      'Free drone pilot training and technical certification for SHG women.',
      'Generates estimated ₹1 Lakh additional annual income per SHG via spraying services.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['DAY-NRLM SHG Registration Certificate', 'Aadhaar Cards of SHG Drone Pilots', 'SHG Bank Account Passbook', 'SHG Executive Resolution'],
    applicationUrl: 'https://daynrlm.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    title: 'PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    category: 'Irrigation & Water Efficiency',
    description: 'Financial subsidies for micro-irrigation systems (drip and sprinkler) ranging from 55% for small/marginal farmers to 45% for general category farmers.',
    benefits: [
      '55% micro-irrigation subsidy for small/marginal farmers (45% general).',
      'Water storage and farm pond construction support.',
      'Boosts crop yield by up to 40% while preserving groundwater.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Land Record (Khatauni / 7-12)', 'Bank Account Passbook', 'Assured Water Source Proof'],
    applicationUrl: 'https://pmksy.gov.in',
    minLandSizeAcres: 0.2,
    maxLandSizeAcres: null,
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Solar Energy & Irrigation)',
    title: 'PM-KUSUM (Solar Energy & Irrigation)',
    category: 'Solar Energy & Irrigation',
    description: '30% Central Financial Assistance + 30% State Subsidy for standalone off-grid solar pumps and grid-connected pump solarization, plus fallow land solar leasing.',
    benefits: [
      '60% to 90% total subsidy for standalone solar pumps.',
      'Lease fallow land to DISCOMs for up to 2 MW solar plants.',
      'Provides daytime solar irrigation power and cuts diesel expenses.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Land Record (7/12 / Khatauni)', 'Bank Passbook', 'Electricity Bill (for grid solarization)'],
    applicationUrl: 'https://pmkusum.mnre.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'pkvy',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    category: 'Organic Farming',
    description: 'Financial assistance of ₹50,000 per hectare over a 3-year cycle for organic inputs, PGS-India certification, packaging, branding, and organic market linkages.',
    benefits: [
      '₹50,000/ha assistance over 3 years (₹31,000 directly for organic inputs).',
      'Free Participatory Guarantee System (PGS-India) organic certification.',
      'Branding, packaging, and direct organic market linkage support.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Land Ownership / Lease Papers', 'Bank Passbook', 'Cluster Membership / FPO Endorsement'],
    applicationUrl: 'https://pgsindia-ncof.gov.in',
    minLandSizeAcres: 0.5,
    maxLandSizeAcres: null,
  },
  {
    id: 'rythu-bharosa',
    name: 'Telangana Rythu Bharosa Scheme',
    title: 'Telangana Rythu Bharosa Scheme',
    category: 'State Financial Support',
    description: 'Direct investment support of ₹6,000 per acre per cropping season (₹12,000/acre/year) transferred directly into accounts via DBT for Telangana farmers.',
    benefits: [
      '₹6,000 per acre per season (₹12,000/acre annually via DBT).',
      'Covers landowning farmers, RoFR title holders, and verified tenant farmers.',
      'Seasonal financial support for Kharif and Rabi input purchases.'
    ],
    supportedStates: ['Telangana'],
    requiredDocuments: ['Pattadar Passbook / Land Title Certificate', 'Aadhaar Card', 'Bank Passbook', 'Telangana Domicile Certificate'],
    applicationUrl: 'https://rythubharosa.telangana.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'mskvy-2',
    name: 'Maharashtra MSKVY 2.0 (Solar Agriculture Feeder)',
    title: 'Maharashtra MSKVY 2.0 (Solar Agriculture Feeder)',
    category: 'Solar Power & Irrigation',
    description: 'Feeder-level solarization delivering 8-hour daytime irrigation power to farmers, plus land leasing income up to ₹1.25 Lakh/ha/yr for solar plant sites.',
    benefits: [
      'Reliable 8-hour daytime electricity for agricultural pumps.',
      'Up to ₹1.25 Lakh per hectare annual lease income for landowners.',
      '90%–95% combined central/state subsidy on individual solar pumps.'
    ],
    supportedStates: ['Maharashtra'],
    requiredDocuments: ['7/12 Land Record Extract', 'Aadhaar Card', 'Caste Certificate (if applicable)', 'Bank Passbook', 'Water Source NOC'],
    applicationUrl: 'https://portal.mahadiscom.in/solar-mskvy/',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    title: 'Soil Health Card Scheme',
    category: 'Soil & Nutrient Management',
    description: 'Free 12-parameter soil test report issued every 3 years providing crop-specific organic & chemical fertilizer dosage recommendations.',
    benefits: [
      'Free 12-parameter soil fertility analysis report every 3 years.',
      'Crop-wise precise fertilizer dosage recommendations.',
      'Saves ₹1,000–₹3,000 per acre by preventing excessive chemical fertilizer use.'
    ],
    supportedStates: ['All India'],
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Proof', 'Mobile Number'],
    applicationUrl: 'https://soilhealth.dac.gov.in',
    minLandSizeAcres: 0,
    maxLandSizeAcres: null,
  }
];

export function useSchemes() {
  const [schemes, setSchemes] = useState(REAL_SCHEMES_FALLBACK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.schemes.getAll().then(res => {
      if (res && res.data && res.data.length > 0) {
        setSchemes(res.data.map(s => ({ ...s, id: s._id || s.id, title: s.name || s.title })));
      }
    }).catch(err => {
      console.warn('Backend server offline, using real scheme fallback dataset:', err);
    });
  }, []);

  return { schemes, loading };
}

export function getBookmarkedSchemeIds() {
  try {
    return JSON.parse(localStorage.getItem('krishi_bookmarks') || '[]');
  } catch(e) { return []; }
}

export function toggleBookmarkSchemeId(id) {
  let marks = getBookmarkedSchemeIds();
  if (marks.includes(id)) {
    marks = marks.filter(i => i !== id);
  } else {
    marks.push(id);
  }
  localStorage.setItem('krishi_bookmarks', JSON.stringify(marks));
  return marks;
}

export function evaluateEligibility(profile, scheme) {
  if (!scheme) {
    return {
      isEligible: false,
      status: 'Not Eligible',
      score: 0,
      missingDocs: ['Scheme selection missing'],
      reasons: [{ rule: 'Scheme Selected', passed: false, message: 'Please select a valid scheme from the dropdown.' }],
    };
  }

  let score = 100;
  const reasons = [];
  const missingDocs = [];

  // Rule 1: State Match
  if (
    scheme.supportedStates &&
    !scheme.supportedStates.includes('All India') &&
    profile.state &&
    !scheme.supportedStates.includes(profile.state)
  ) {
    score -= 40;
    reasons.push({ rule: 'State Availability', passed: false, message: `This scheme is not available in ${profile.state}.` });
    missingDocs.push('State Residency Requirement');
  } else {
    reasons.push({ rule: 'State Availability', passed: true, message: 'Your state is supported for this scheme.' });
  }

  // Rule 2: Landholding Limit
  const landNum = parseFloat(profile.landSize) || 0;
  if (scheme.minLandSizeAcres !== undefined && scheme.minLandSizeAcres !== null && landNum < scheme.minLandSizeAcres) {
    score -= 30;
    reasons.push({ rule: 'Minimum Land Size', passed: false, message: `Requires at least ${scheme.minLandSizeAcres} acres (You entered ${landNum} acres).` });
  } else {
    reasons.push({ rule: 'Land Eligibility', passed: true, message: 'Your landholding meets scheme guidelines.' });
  }

  // Rule 3: District Verification
  if (profile.district && scheme.supportedDistricts && scheme.supportedDistricts.length > 0) {
    const isDistrictSupported = scheme.supportedDistricts.some(d => d.toLowerCase() === profile.district.toLowerCase() || d.toLowerCase() === 'all');
    if (!isDistrictSupported) {
      score -= 20;
      reasons.push({ rule: 'District Target', passed: false, message: `District '${profile.district}' is outside targeted districts.` });
    } else {
      reasons.push({ rule: 'District Target', passed: true, message: `District '${profile.district}' is verified for local benefits.` });
    }
  } else if (profile.district) {
    reasons.push({ rule: 'District Target', passed: true, message: `District '${profile.district}' verified for scheme.` });
  }

  // Rule 4: Aadhaar & Bank Linking
  if (!profile.aadhaarLinked) {
    score -= 15;
    reasons.push({ rule: 'Aadhaar Linkage', passed: false, message: 'Aadhaar must be linked with mobile number.' });
    missingDocs.push('Aadhaar Verification');
  } else {
    reasons.push({ rule: 'Aadhaar Linkage', passed: true, message: 'Aadhaar linkage verified.' });
  }

  if (!profile.bankLinked) {
    score -= 15;
    reasons.push({ rule: 'Bank DBT Linkage', passed: false, message: 'Bank account must be Aadhaar seeded for Direct Benefit Transfer.' });
    missingDocs.push('DBT Enabled Bank Account');
  } else {
    reasons.push({ rule: 'Bank DBT Linkage', passed: true, message: 'Bank DBT status active.' });
  }

  const finalScore = Math.max(0, score);
  const status = finalScore >= 80 ? 'Eligible' : finalScore >= 50 ? 'Partially Eligible' : 'Not Eligible';

  return {
    isEligible: finalScore >= 50,
    status,
    score: finalScore,
    reasons,
    missingDocs,
  };
}
