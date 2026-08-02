/**
 * eligibilityEngine.js
 * Rule-based evaluation engine for matching farmer profiles with government agricultural schemes.
 */

/**
 * Helper to parse income bracket string to numeric value (in INR / annum).
 * e.g., "< 1 Lakh" -> 100000, "1 - 2.5 Lakh" -> 250000, "2.5 - 5 Lakh" -> 500000, "> 5 Lakh" -> 1000000
 * @param {string|number} income
 * @returns {number|null}
 */
function parseIncome(income) {
  if (typeof income === 'number') return income;
  if (!income || typeof income !== 'string') return null;

  const str = income.toLowerCase().trim();
  if (str.includes('< 1') || str.includes('below 1') || str.includes('<1')) return 100000;
  if (str.includes('1 - 2.5') || str.includes('1-2.5')) return 250000;
  if (str.includes('2.5 - 5') || str.includes('2.5-5')) return 500000;
  if (str.includes('> 5') || str.includes('above 5') || str.includes('>5')) return 1000000;

  // Extract digits if available
  const match = str.match(/\d+(\.\d+)?/);
  if (match) {
    let val = parseFloat(match[0]);
    if (str.includes('lakh')) val *= 100000;
    if (str.includes('crore')) val *= 10000000;
    return val;
  }

  return null;
}

/**
 * Evaluates farmer profile against scheme eligibility rules.
 * Checks 7 key criteria: land size, crop types, income, category, gender, age, farmer type (plus supported states).
 *
 * @param {Object} farmerProfile
 * @param {Object} scheme
 * @returns {{ status: 'eligible'|'partially_eligible'|'not_eligible', score: number, reasons: Array<string>, missingDocuments: Array<string> }}
 */
function evaluateEligibility(farmerProfile = {}, scheme = {}) {
  const rules = scheme.eligibilityRules || {};
  const requiredDocs = scheme.requiredDocuments || [];
  const reasons = [];
  let score = 0;
  const maxPossibleScore = 100;
  let hasCriticalMismatch = false;

  // Normalize farmer profile fields
  const landSize = farmerProfile.landSizeAcres !== undefined ? Number(farmerProfile.landSizeAcres) : null;
  const category = farmerProfile.category || null;
  const farmerType = farmerProfile.farmerType || null;
  const gender = farmerProfile.gender || null;
  const age = farmerProfile.age !== undefined ? Number(farmerProfile.age) : null;
  const farmerCrops = Array.isArray(farmerProfile.cropTypes)
    ? farmerProfile.cropTypes.map((c) => c.toLowerCase().trim())
    : [];
  const state = farmerProfile.state ? farmerProfile.state.trim() : null;
  const farmerIncome = parseIncome(farmerProfile.incomeBracket);

  // 1. Land Size Check (Weight: 20 pts)
  const minLand = rules.minLandSizeAcres !== undefined && rules.minLandSizeAcres !== null ? Number(rules.minLandSizeAcres) : 0;
  const maxLand = rules.maxLandSizeAcres !== undefined && rules.maxLandSizeAcres !== null ? Number(rules.maxLandSizeAcres) : null;

  if (landSize !== null) {
    if (landSize < minLand) {
      hasCriticalMismatch = true;
      reasons.push(`Land size (${landSize} acres) is less than required minimum of ${minLand} acres.`);
    } else if (maxLand !== null && landSize > maxLand) {
      hasCriticalMismatch = true;
      reasons.push(`Land size (${landSize} acres) exceeds maximum allowed limit of ${maxLand} acres.`);
    } else {
      score += 20;
      reasons.push(`Land size (${landSize} acres) meets requirements (${minLand}${maxLand ? ` - ${maxLand}` : '+'} acres).`);
    }
  } else {
    // Neutral if missing land size
    score += 10;
    reasons.push('Land size not specified in farmer profile.');
  }

  // 2. Allowed Categories Check (Weight: 15 pts)
  const allowedCategories = Array.isArray(rules.allowedCategories) ? rules.allowedCategories : [];
  if (allowedCategories.length > 0) {
    if (category && allowedCategories.includes(category)) {
      score += 15;
      reasons.push(`Category '${category}' is eligible for this scheme.`);
    } else if (category) {
      hasCriticalMismatch = true;
      reasons.push(`Category '${category}' is not included in eligible categories [${allowedCategories.join(', ')}].`);
    } else {
      score += 5;
      reasons.push('Social category not specified in profile.');
    }
  } else {
    score += 15;
    reasons.push('All social categories are eligible for this scheme.');
  }

  // 3. Farmer Type Check (Weight: 15 pts)
  const allowedFarmerTypes = Array.isArray(rules.allowedFarmerTypes) ? rules.allowedFarmerTypes : [];
  if (allowedFarmerTypes.length > 0) {
    if (farmerType && allowedFarmerTypes.includes(farmerType)) {
      score += 15;
      reasons.push(`Farmer type '${farmerType}' is eligible.`);
    } else if (farmerType) {
      hasCriticalMismatch = true;
      reasons.push(`Farmer type '${farmerType}' is not in allowed farmer types [${allowedFarmerTypes.join(', ')}].`);
    } else {
      score += 5;
      reasons.push('Farmer type not specified in profile.');
    }
  } else {
    score += 15;
    reasons.push('All farmer types (marginal, smallholder, medium, large) are eligible.');
  }

  // 4. Crop Types Check (Weight: 15 pts)
  const allowedCrops = Array.isArray(rules.cropTypes) ? rules.cropTypes.map((c) => c.toLowerCase().trim()) : [];
  if (allowedCrops.length > 0 && !allowedCrops.includes('all') && !allowedCrops.includes('any')) {
    const matchingCrops = farmerCrops.filter((crop) => allowedCrops.some((ac) => ac === crop || crop.includes(ac) || ac.includes(crop)));
    if (matchingCrops.length > 0) {
      score += 15;
      reasons.push(`Target crops match: [${matchingCrops.join(', ')}].`);
    } else if (farmerCrops.length > 0) {
      score += 5; // Partial match score if farmer grows crops but not specific scheme crops
      reasons.push(`Crops grown [${farmerProfile.cropTypes.join(', ')}] do not directly match scheme target crops [${rules.cropTypes.join(', ')}].`);
    } else {
      score += 5;
      reasons.push('No crop types specified in farmer profile.');
    }
  } else {
    score += 15;
    reasons.push('Scheme applies to all crop types.');
  }

  // 5. Max Income Limit Check (Weight: 15 pts)
  const maxIncome = rules.maxIncomeLimit !== undefined && rules.maxIncomeLimit !== null ? Number(rules.maxIncomeLimit) : null;
  if (maxIncome !== null) {
    if (farmerIncome !== null) {
      if (farmerIncome <= maxIncome) {
        score += 15;
        reasons.push(`Income bracket meets maximum limit criteria (₹${maxIncome.toLocaleString('en-IN')}).`);
      } else {
        hasCriticalMismatch = true;
        reasons.push(`Income level exceeds scheme maximum limit of ₹${maxIncome.toLocaleString('en-IN')}.`);
      }
    } else {
      score += 10;
      reasons.push('Income limit criteria applicable, but income not specified in profile.');
    }
  } else {
    score += 15;
    reasons.push('No income ceiling restriction for this scheme.');
  }

  // 6. Gender Preference Check (Weight: 10 pts)
  const genderPref = rules.genderPreference || 'All';
  if (genderPref !== 'All' && genderPref !== '') {
    if (gender && gender.toLowerCase() === genderPref.toLowerCase()) {
      score += 10;
      reasons.push(`Gender '${gender}' matches scheme preference ('${genderPref}').`);
    } else if (gender) {
      score += 2;
      reasons.push(`Scheme prioritizes '${genderPref}' applicants (your profile: '${gender}').`);
    } else {
      score += 5;
      reasons.push('Gender not specified in profile.');
    }
  } else {
    score += 10;
    reasons.push('Scheme is open to all genders.');
  }

  // 7. Age Limits Check (Weight: 10 pts)
  const minAge = rules.minAge !== undefined && rules.minAge !== null ? Number(rules.minAge) : 18;
  const maxAge = rules.maxAge !== undefined && rules.maxAge !== null ? Number(rules.maxAge) : null;

  if (age !== null) {
    if (age < minAge) {
      hasCriticalMismatch = true;
      reasons.push(`Age (${age} years) is below minimum required age of ${minAge}.`);
    } else if (maxAge !== null && age > maxAge) {
      hasCriticalMismatch = true;
      reasons.push(`Age (${age} years) exceeds maximum allowed age of ${maxAge}.`);
    } else {
      score += 10;
      reasons.push(`Age (${age} years) falls within required age range (${minAge}${maxAge ? ` - ${maxAge}` : '+'}).`);
    }
  } else {
    score += 5;
    reasons.push('Age not specified in farmer profile.');
  }

  // 8. State Scope Check (Informational / Penalty if applicable)
  const supportedStates = Array.isArray(scheme.supportedStates) ? scheme.supportedStates : [];
  if (state && supportedStates.length > 0) {
    const isPanIndia = supportedStates.some((s) => s.toLowerCase() === 'all' || s.toLowerCase() === 'pan-india' || s.toLowerCase() === 'all india');
    const isStateSupported = supportedStates.some((s) => s.toLowerCase() === state.toLowerCase());

    if (!isPanIndia && !isStateSupported) {
      reasons.push(`State '${state}' is not listed in supported states [${supportedStates.join(', ')}].`);
      // Apply a penalty for state mismatch
      score = Math.max(0, score - 20);
    } else {
      reasons.push(`Scheme is active in state '${state}'.`);
    }
  }

  // 9. District Scope Check (Feature 6 requirement)
  const district = farmerProfile.district ? farmerProfile.district.trim() : null;
  const supportedDistricts = Array.isArray(rules.supportedDistricts || scheme.supportedDistricts) 
    ? (rules.supportedDistricts || scheme.supportedDistricts) 
    : [];

  if (district) {
    if (supportedDistricts.length > 0) {
      const isPanDistrict = supportedDistricts.some((d) => d.toLowerCase() === 'all' || d.toLowerCase() === 'pan-district' || d.toLowerCase() === 'all districts');
      const isDistrictSupported = supportedDistricts.some((d) => d.toLowerCase() === district.toLowerCase());

      if (isPanDistrict || isDistrictSupported) {
        score += 10;
        reasons.push(`District '${district}' is eligible for local district benefits.`);
      } else {
        reasons.push(`District '${district}' is outside targeted districts [${supportedDistricts.join(', ')}].`);
      }
    } else {
      score += 10;
      reasons.push(`District '${district}' verified (scheme applies across all districts).`);
    }
  } else {
    reasons.push('District not specified in profile.');
  }

  // Determine overall status based on score & critical mismatches
  let status = 'not_eligible';

  if (!hasCriticalMismatch && score >= 70) {
    status = 'eligible';
  } else if (score >= 40) {
    status = 'partially_eligible';
  } else {
    status = 'not_eligible';
  }

  return {
    status,
    score: Math.min(100, Math.round(score)),
    reasons,
    missingDocuments: Array.isArray(requiredDocs) ? requiredDocs : [],
  };
}

module.exports = {
  evaluateEligibility,
  parseIncome,
};
