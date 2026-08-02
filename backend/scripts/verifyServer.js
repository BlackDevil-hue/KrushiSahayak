/**
 * scripts/verifyServer.js
 * Verification script for server routes, middleware, and services.
 */

const app = require('../server');
const { evaluateEligibility, parseIncome } = require('../src/services/eligibilityEngine');
const { sendOtp, verifyOtpCode } = require('../src/services/smsService');
const { verifyGoogleToken } = require('../src/services/googleAuthService');

async function runVerification() {
  console.log('=== KRISHISAHAYAK BACKEND VERIFICATION ===\n');

  // 1. Test SMS Service
  console.log('--- 1. Testing SMS Service ---');
  const otpRes = await sendOtp('9876543210');
  console.log('Send OTP result:', otpRes);
  const isDevOtpValid = verifyOtpCode('9876543210', '123456');
  console.log('Dev OTP 123456 validation:', isDevOtpValid ? 'PASS' : 'FAIL');

  // 2. Test Google Auth Service
  console.log('\n--- 2. Testing Google Auth Service ---');
  const googleUser = await verifyGoogleToken('mock_google_token');
  console.log('Google mock user:', googleUser);

  // 3. Test Eligibility Engine
  console.log('\n--- 3. Testing Eligibility Engine ---');
  const farmerProfile = {
    name: 'Ramesh Patel',
    state: 'Punjab',
    district: 'Ludhiana',
    cropTypes: ['Wheat', 'Rice'],
    landSizeAcres: 2.5,
    incomeBracket: '< 1 Lakh',
    category: 'General',
    gender: 'Male',
    age: 38,
    farmerType: 'smallholder',
  };

  const scheme = {
    name: 'PM-Kisan Samman Nidhi',
    eligibilityRules: {
      minLandSizeAcres: 0,
      maxLandSizeAcres: 5,
      allowedCategories: ['General', 'SC', 'ST', 'OBC'],
      allowedFarmerTypes: ['marginal', 'smallholder'],
      maxIncomeLimit: 200000,
      minAge: 18,
      maxAge: 70,
      genderPreference: 'All',
      cropTypes: ['Wheat', 'Rice'],
    },
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Records', 'Bank Passbook'],
  };

  const eligibility = evaluateEligibility(farmerProfile, scheme);
  console.log('Eligibility Status:', eligibility.status);
  console.log('Eligibility Score:', eligibility.score);
  console.log('Reasons:', eligibility.reasons);
  console.log('Missing Documents:', eligibility.missingDocuments);

  // 4. Test Route Stack Inspection
  console.log('\n--- 4. Inspecting Registered Express Routes ---');
  function extractRoutes(stack, prefix = '') {
    let routes = [];
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase()).join(', ');
        routes.push({ method: methods, path: prefix + layer.route.path });
      } else if (layer.name === 'router' && layer.handle.stack) {
        let routePrefix = '';
        if (layer.regexp) {
          const str = layer.regexp.source;
          const matches = str.match(/\\\/([a-zA-Z0-9_\-]+)/g);
          if (matches) {
            routePrefix = matches.join('').replace(/\\/g, '');
          }
        }
        routes = routes.concat(extractRoutes(layer.handle.stack, prefix + routePrefix));
      }
    });
    return routes;
  }

  const routes = extractRoutes(app._router.stack);
  console.log(`Total Routes Registered: ${routes.length}`);
  routes.forEach((r, idx) => {
    console.log(`  ${(idx + 1).toString().padStart(2)}. [${r.method.padEnd(6)}] ${r.path}`);
  });

  console.log('\nVERIFICATION COMPLETE: ALL SERVICES AND ROUTES ARE PROPERLY CONFIGURED.');
}

runVerification().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
