/**
 * Tier 4: Real-World Application Scenarios Test Suite for KrishiSahayak
 *
 * Implements end-to-end user journeys for diverse Indian farmer personas:
 * 1. Smallholder Farmer Ramesh (Uttar Pradesh)
 * 2. Marginal Farmer Sunita (Maharashtra)
 * 3. Large Tech-Savvy Farmer Vikram (Punjab)
 * 4. Organic Farmer Specialist Priya (Madhya Pradesh)
 */

const ApiClient = require('../utils/apiClient');
const mockServer = require('../utils/mockServer');
const {
  strictEqual,
  ok,
  assertStatusCode,
  assertHasProperties,
  inRange,
  match
} = require('../utils/assert');

async function runTier4Tests() {
  const client = new ApiClient();
  const testsRun = [];
  const testsPassed = [];
  const testsFailed = [];

  async function test(name, fn) {
    testsRun.push(name);
    try {
      mockServer.resetState();
      await fn();
      testsPassed.push(name);
    } catch (err) {
      testsFailed.push({ name, error: err.message, stack: err.stack });
    }
  }

  // ==========================================
  // JOURNEY 1: Smallholder Farmer Ramesh (UP)
  // ==========================================
  await test('T4.1: Journey 1 - Smallholder Farmer Ramesh (1.5 acres UP) discovering & applying for PM-KISAN', async () => {
    // 1. Phone OTP Authentication
    const sendOtpRes = await client.post('/api/auth/send-otp', { phone: '9876543210' });
    assertStatusCode(sendOtpRes, 200, 'Ramesh Send OTP');

    const verifyRes = await client.post('/api/auth/verify-otp', { phone: '9876543210', otp: '123456' });
    assertStatusCode(verifyRes, 200, 'Ramesh Verify OTP');
    const token = verifyRes.body.token;

    // 2. Profile Setup
    const rameshProfile = {
      name: 'Ramesh Kumar',
      phone: '9876543210',
      state: 'Uttar Pradesh',
      district: 'Gorakhpur',
      cropTypes: ['Wheat', 'Rice'],
      landSize: 1.5,
      income: 'low',
      category: 'SC',
      gender: 'Male',
      age: 42,
      farmerType: 'smallholder'
    };
    const profRes = await client.put('/api/profile', rameshProfile, { token });
    assertStatusCode(profRes, 200, 'Ramesh Profile Setup');
    strictEqual(profRes.body.profile.name, 'Ramesh Kumar');

    // 3. Scheme Browser - State Filter "Uttar Pradesh"
    const schemesRes = await client.get('/api/schemes', { query: { state: 'Uttar Pradesh' } });
    assertStatusCode(schemesRes, 200, 'Ramesh Browse Schemes');
    const pmkisan = schemesRes.body.schemes.find(s => s.code === 'PM-KISAN');
    ok(pmkisan !== undefined, 'PM-KISAN should be found in state schemes');

    // 4. Eligibility Check
    const eligRes = await client.post('/api/eligibility/check', { schemeId: pmkisan._id }, { token });
    assertStatusCode(eligRes, 200, 'Ramesh PM-KISAN Eligibility');
    strictEqual(eligRes.body.status, 'eligible');
    inRange(eligRes.body.score, 85, 100);

    // 5. AI Chat RAG Query
    const chatRes = await client.post('/api/chat', { message: 'When will I receive the next PM-KISAN installment of 2000 rupees?' }, { token });
    assertStatusCode(chatRes, 200, 'Ramesh AI Chat Query');
    match(chatRes.body.reply, /PM-KISAN/);
    ok(chatRes.body.relevantSchemes.some(s => s.code === 'PM-KISAN'));

    // 6. Land Khatauni Document Upload & OCR
    const docRes = await client.post('/api/documents/upload', {
      fileName: 'ramesh_khatauni_land_record.pdf',
      fileContent: 'S0hBVEFVTkkgTEFORCBSRUNPUkQgR09SQUtIUFVSIDEuNSBBQ1JFUw==',
      mimeType: 'application/pdf'
    }, { token });
    assertStatusCode(docRes, 200, 'Ramesh OCR Upload');
    assertHasProperties(docRes.body.summary, ['benefits', 'eligibility'], 'Summary');

    // 7. Auto-Generate Checklist & Complete Items
    const chkRes1 = await client.get(`/api/checklists/${pmkisan._id}`, { token });
    assertStatusCode(chkRes1, 200, 'Ramesh Get Checklist');
    strictEqual(chkRes1.body.completionPercentage, 0);

    // Mark Aadhaar Card (item 0) and Land Records (item 1) completed
    await client.put(`/api/checklists/${pmkisan._id}`, { itemIndex: 0, completed: true }, { token });
    const chkRes2 = await client.put(`/api/checklists/${pmkisan._id}`, { itemIndex: 1, completed: true }, { token });
    assertStatusCode(chkRes2, 200, 'Ramesh Update Checklist');
    strictEqual(chkRes2.body.completionPercentage, 50);

    // 8. Save PM-KISAN Bookmark
    const bmkRes = await client.post('/api/bookmarks', { schemeId: pmkisan._id }, { token });
    assertStatusCode(bmkRes, 200, 'Ramesh Save Bookmark');
    strictEqual(bmkRes.body.schemeId, pmkisan._id);

    // 9. Check Notifications
    const notifRes = await client.get('/api/notifications', { token });
    assertStatusCode(notifRes, 200, 'Ramesh Notifications');
    ok(notifRes.body.notifications.length > 0);
  });

  // ==========================================
  // JOURNEY 2: Marginal Farmer Sunita (Maharashtra)
  // ==========================================
  await test('T4.2: Journey 2 - Marginal Farmer Sunita (0.8 acres Maharashtra) crop insurance & voice assistant', async () => {
    // 1. Google OAuth Authentication
    const authRes = await client.post('/api/auth/google', { idToken: 'google_token_sunita_987' });
    assertStatusCode(authRes, 200, 'Sunita Google Auth');
    const token = authRes.body.token;

    // 2. Profile Registration
    const sunitaProfile = {
      name: 'Sunita Patil',
      state: 'Maharashtra',
      district: 'Yavatmal',
      cropTypes: ['Cotton', 'Soybean'],
      landSize: 0.8,
      income: 'low',
      category: 'OBC',
      farmerType: 'marginal'
    };
    const profRes = await client.put('/api/profile', sunitaProfile, { token });
    assertStatusCode(profRes, 200, 'Sunita Profile Setup');
    strictEqual(profRes.body.profile.farmerType, 'marginal');

    // 3. Browse Crop Insurance Schemes
    const schemesRes = await client.get('/api/schemes', { query: { category: 'Crop Insurance' } });
    assertStatusCode(schemesRes, 200, 'Sunita Browse Insurance');
    const pmfby = schemesRes.body.schemes.find(s => s.code === 'PMFBY');
    ok(pmfby !== undefined);

    // 4. Eligibility Check
    const eligRes = await client.post('/api/eligibility/check', { schemeId: pmfby._id }, { token });
    assertStatusCode(eligRes, 200, 'Sunita PMFBY Eligibility');
    strictEqual(eligRes.body.status, 'eligible');

    // 5. Upload Crop Damage Photo Evidence & Run OCR
    const docRes = await client.post('/api/documents/upload', {
      fileName: 'cotton_crop_damage.png',
      fileContent: 'Q1JPUCBEQU1BR0UgUEhPVE8gRVZJREVOQ0U=',
      mimeType: 'image/png'
    }, { token });
    assertStatusCode(docRes, 200, 'Sunita Crop Photo OCR');
    match(docRes.body.extractedText, /OCR Extracted Content/);

    // 6. Voice Assistant Query Simulation
    const voicePrompt = 'How to claim crop insurance for cotton crop damage in Maharashtra?';
    const chatRes = await client.post('/api/chat', { message: voicePrompt }, { token });
    assertStatusCode(chatRes, 200, 'Sunita Voice Query');
    ok(chatRes.body.relevantSchemes.some(s => s.code === 'PMFBY'));

    // 7. Save PMFBY Bookmark & Checklist
    await client.post('/api/bookmarks', { schemeId: pmfby._id }, { token });
    const chkRes = await client.get(`/api/checklists/${pmfby._id}`, { token });
    assertStatusCode(chkRes, 200, 'Sunita Checklist');
    ok(chkRes.body.items.length >= 3);
  });

  // ==========================================
  // JOURNEY 3: Large Tech-Savvy Farmer Vikram (Punjab)
  // ==========================================
  await test('T4.3: Journey 3 - Large Farmer Vikram (12 acres Punjab) SMAM tractor subsidy & AIF infrastructure', async () => {
    // 1. Phone OTP Authentication
    const verifyRes = await client.post('/api/auth/verify-otp', { phone: '9812345678', otp: '123456' });
    const token = verifyRes.body.token;

    // 2. Profile Setup
    const vikramProfile = {
      name: 'Vikram Singh',
      phone: '9812345678',
      state: 'Punjab',
      district: 'Ludhiana',
      cropTypes: ['Wheat', 'Rice'],
      landSize: 12.0,
      income: 'high',
      category: 'General',
      farmerType: 'large'
    };
    await client.put('/api/profile', vikramProfile, { token });

    // 3. Browse Mechanization & Infrastructure Schemes
    const schemesRes = await client.get('/api/schemes', { query: { state: 'Punjab' } });
    const smam = schemesRes.body.schemes.find(s => s.code === 'SMAM');
    const pmkisan = schemesRes.body.schemes.find(s => s.code === 'PM-KISAN');

    // 4. Check PM-KISAN Eligibility (Ineligible due to land size > 4.94 acres)
    const pmkisanElig = await client.post('/api/eligibility/check', { schemeId: pmkisan._id }, { token });
    strictEqual(pmkisanElig.body.status, 'not_eligible');

    // 5. Check SMAM Eligibility (Eligible for machinery subsidy)
    const smamElig = await client.post('/api/eligibility/check', { schemeId: smam._id }, { token });
    strictEqual(smamElig.body.status, 'eligible');

    // 6. AI Chat RAG Query for Combine Harvester Subsidy
    const chatRes = await client.post('/api/chat', { message: 'What is the SMAM tractor and machinery subsidy in Punjab?' }, { token });
    assertStatusCode(chatRes, 200, 'Vikram Machinery Chat');
    ok(chatRes.body.relevantSchemes.some(s => s.code === 'SMAM'));

    // 7. Save SMAM to Bookmarks
    await client.post('/api/bookmarks', { schemeId: smam._id }, { token });

    // 8. Recommendations check confirms SMAM is eligible
    const recs = await client.get('/api/eligibility/recommendations', { token });
    const smamRec = recs.body.recommendations.find(r => r.scheme.code === 'SMAM');
    strictEqual(smamRec.status, 'eligible');
  });

  // ==========================================
  // JOURNEY 4: Organic Farmer Specialist Priya (MP)
  // ==========================================
  await test('T4.4: Journey 4 - Organic Farmer Priya (3 acres MP) PKVY organic certification & Soil Health Card', async () => {
    // 1. Phone OTP Auth
    const verifyRes = await client.post('/api/auth/verify-otp', { phone: '9777666555', otp: '123456' });
    const token = verifyRes.body.token;

    // 2. Profile Setup
    const priyaProfile = {
      name: 'Priya Sharma',
      phone: '9777666555',
      state: 'Madhya Pradesh',
      district: 'Indore',
      cropTypes: ['Pulses', 'Spices'],
      landSize: 3.0,
      income: 'medium',
      category: 'General',
      farmerType: 'smallholder'
    };
    await client.put('/api/profile', priyaProfile, { token });

    // 3. Search Schemes for Organic Farming
    const searchRes = await client.get('/api/schemes', { query: { category: 'Organic Farming' } });
    const pkvy = searchRes.body.schemes.find(s => s.code === 'PKVY');
    ok(pkvy !== undefined, 'PKVY scheme should be present');

    // 4. Check Eligibility for PKVY
    const pkvyElig = await client.post('/api/eligibility/check', { schemeId: pkvy._id }, { token });
    strictEqual(pkvyElig.body.status, 'eligible');

    // 5. Upload Soil Health Card PDF Report
    const docRes = await client.post('/api/documents/upload', {
      fileName: 'soil_health_card_priya.pdf',
      fileContent: 'U09JTCBIRUFMVEggQ0FSRCBSRVBPUlQgT1JHQU5JQyBDQVJCT04gMC43NQ==',
      mimeType: 'application/pdf'
    }, { token });
    assertStatusCode(docRes, 200, 'Priya Soil Doc OCR');
    match(docRes.body.extractedText, /Khatauni/);

    // 6. Complete PKVY Document Checklist Items (100% completion)
    const chkRes1 = await client.get(`/api/checklists/${pkvy._id}`, { token });
    const totalItems = chkRes1.body.items.length;

    for (let i = 0; i < totalItems; i++) {
      await client.put(`/api/checklists/${pkvy._id}`, { itemIndex: i, completed: true }, { token });
    }

    const finalChk = await client.get(`/api/checklists/${pkvy._id}`, { token });
    strictEqual(finalChk.body.completionPercentage, 100);

    // 7. Save PKVY to Bookmarks
    await client.post('/api/bookmarks', { schemeId: pkvy._id }, { token });
    const bmkList = await client.get('/api/bookmarks', { token });
    strictEqual(bmkList.body.bookmarks[0]._id, pkvy._id);
  });

  return { testsRun, testsPassed, testsFailed };
}

module.exports = { runTier4Tests };
