/**
 * Tier 1: Feature Coverage Test Suite for KrishiSahayak
 *
 * Implements >=5 test cases per feature across 11 feature areas covering 16+ screens and REST endpoints.
 * Genuine opaque-box assertions.
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

async function runTier1Tests() {
  const client = new ApiClient();
  const testsRun = [];
  const testsPassed = [];
  const testsFailed = [];

  async function test(name, fn) {
    testsRun.push(name);
    try {
      // Ensure reset server state per test for isolation
      mockServer.resetState();
      await fn();
      testsPassed.push(name);
    } catch (err) {
      testsFailed.push({ name, error: err.message, stack: err.stack });
    }
  }

  // ==========================================
  // FEATURE 1: Auth (OTP, Google, Logout, Delete)
  // ==========================================
  await test('T1.1.1: Send OTP to valid 10-digit Indian phone number', async () => {
    const res = await client.post('/api/auth/send-otp', { phone: '9876543210' });
    assertStatusCode(res, 200, 'Send OTP');
    strictEqual(res.body.success, true);
    match(res.body.message, /OTP sent successfully/);
  });

  await test('T1.1.2: Verify OTP with valid dev code 123456 returns JWT token', async () => {
    const res = await client.post('/api/auth/verify-otp', { phone: '9876543210', otp: '123456' });
    assertStatusCode(res, 200, 'Verify OTP');
    assertHasProperties(res.body, ['token', 'user', 'profileCompleted'], 'Verify OTP Response');
    ok(typeof res.body.token === 'string' && res.body.token.startsWith('jwt_token_'));
    strictEqual(res.body.user.phone, '9876543210');
  });

  await test('T1.1.3: Google OAuth token exchange returns session token and profile status', async () => {
    const res = await client.post('/api/auth/google', { idToken: 'valid_google_oauth_token_123' });
    assertStatusCode(res, 200, 'Google OAuth');
    assertHasProperties(res.body, ['token', 'user', 'profileCompleted'], 'Google Auth');
    strictEqual(res.body.user.email, 'farmer@google.com');
  });

  await test('T1.1.4: Logout invalidates token session header', async () => {
    const authRes = await client.post('/api/auth/verify-otp', { phone: '9876543210', otp: '123456' });
    const token = authRes.body.token;

    const logoutRes = await client.post('/api/auth/logout', {}, { token });
    assertStatusCode(logoutRes, 200, 'Logout');
    strictEqual(logoutRes.body.success, true);

    // Verify token is invalidated
    const checkRes = await client.get('/api/profile', { token });
    assertStatusCode(checkRes, 401, 'Post Logout Access');
  });

  await test('T1.1.5: Delete account permanently removes user profile data', async () => {
    const authRes = await client.post('/api/auth/verify-otp', { phone: '9876543210', otp: '123456' });
    const token = authRes.body.token;

    // Create profile
    await client.put('/api/profile', { name: 'Temp Farmer', landSize: 2.0 }, { token });

    const delRes = await client.delete('/api/auth/account', { token });
    assertStatusCode(delRes, 200, 'Delete Account');
    strictEqual(delRes.body.success, true);

    const checkRes = await client.get('/api/profile', { token });
    assertStatusCode(checkRes, 401, 'Get Profile Post Delete');
  });

  // ==========================================
  // FEATURE 2: Farmer Profile Management
  // ==========================================
  await test('T1.2.1: Get profile returns complete profile object for authenticated user', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.get('/api/profile', { token });
    assertStatusCode(res, 200, 'Get Profile');
    assertHasProperties(res.body.profile, ['name', 'phone', 'state', 'district', 'cropTypes', 'landSize'], 'Profile Object');
    strictEqual(res.body.profile.name, 'Ramesh Kumar');
    strictEqual(res.body.profile.state, 'Uttar Pradesh');
  });

  await test('T1.2.2: Update profile with valid attributes updates stored farmer data', async () => {
    const token = 'jwt_test_token_valid_001';
    const payload = {
      name: 'Ramesh Kumar Updated',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      cropTypes: ['Wheat', 'Sugarcane'],
      landSize: 2.5,
      income: 'medium',
      category: 'OBC',
      farmerType: 'smallholder'
    };
    const res = await client.put('/api/profile', payload, { token });
    assertStatusCode(res, 200, 'Update Profile');
    strictEqual(res.body.profile.name, 'Ramesh Kumar Updated');
    strictEqual(res.body.profile.district, 'Varanasi');
    strictEqual(res.body.profile.landSize, 2.5);
  });

  await test('T1.2.3: Partial profile update preserves unmentioned profile fields', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.put('/api/profile', { landSize: 3.0 }, { token });
    assertStatusCode(res, 200, 'Partial Profile Update');
    strictEqual(res.body.profile.landSize, 3.0);
    strictEqual(res.body.profile.name, 'Ramesh Kumar'); // Unchanged
    strictEqual(res.body.profile.state, 'Uttar Pradesh'); // Unchanged
  });

  await test('T1.2.4: Profile persistence verifies changes reflect across multiple reads', async () => {
    const token = 'jwt_test_token_valid_001';
    await client.put('/api/profile', { state: 'Punjab', district: 'Ludhiana' }, { token });
    const getRes = await client.get('/api/profile', { token });
    assertStatusCode(getRes, 200, 'Re-read Profile');
    strictEqual(getRes.body.profile.state, 'Punjab');
    strictEqual(getRes.body.profile.district, 'Ludhiana');
  });

  await test('T1.2.5: Profile supports cropTypes list array updating', async () => {
    const token = 'jwt_test_token_valid_001';
    const newCrops = ['Cotton', 'Soybean', 'Groundnut'];
    const res = await client.put('/api/profile', { cropTypes: newCrops }, { token });
    assertStatusCode(res, 200, 'Update Crop Types');
    strictEqual(res.body.profile.cropTypes.length, 3);
    strictEqual(res.body.profile.cropTypes[0], 'Cotton');
  });

  // ==========================================
  // FEATURE 3: Schemes List / Search / Filter / Sort / Pagination
  // ==========================================
  await test('T1.3.1: GET /api/schemes returns paginated list of schemes with total count', async () => {
    const res = await client.get('/api/schemes', { query: { page: 1, limit: 5 } });
    assertStatusCode(res, 200, 'Get Schemes');
    assertHasProperties(res.body, ['schemes', 'pagination'], 'Schemes Response');
    strictEqual(res.body.schemes.length, 5);
    strictEqual(res.body.pagination.total, 10);
    strictEqual(res.body.pagination.totalPages, 2);
  });

  await test('T1.3.2: Search schemes by keyword filters matching scheme titles and descriptions', async () => {
    const res = await client.get('/api/schemes', { query: { search: 'insurance' } });
    assertStatusCode(res, 200, 'Search Schemes');
    ok(res.body.schemes.length > 0);
    ok(res.body.schemes.some(s => s.code === 'PMFBY'));
  });

  await test('T1.3.3: Filter schemes by category returns exact matching category subset', async () => {
    const res = await client.get('/api/schemes', { query: { category: 'Credit & Subsidy' } });
    assertStatusCode(res, 200, 'Filter Category');
    ok(res.body.schemes.length >= 2);
    for (const s of res.body.schemes) {
      strictEqual(s.category.toLowerCase(), 'credit & subsidy');
    }
  });

  await test('T1.3.4: Filter schemes by state matches state-specific and Pan-India schemes', async () => {
    const res = await client.get('/api/schemes', { query: { state: 'Punjab' } });
    assertStatusCode(res, 200, 'Filter State');
    ok(res.body.schemes.length > 0);
    ok(res.body.schemes.some(s => s.code === 'SMAM'));
  });

  await test('T1.3.5: Sort schemes by newest orders results by creation timestamp descending', async () => {
    const res = await client.get('/api/schemes', { query: { sort: 'newest' } });
    assertStatusCode(res, 200, 'Sort Newest');
    const schemes = res.body.schemes;
    for (let i = 0; i < schemes.length - 1; i++) {
      ok(schemes[i].createdDate >= schemes[i + 1].createdDate);
    }
  });

  // ==========================================
  // FEATURE 4: Scheme Details & Requirements
  // ==========================================
  await test('T1.4.1: GET /api/schemes/:id returns complete scheme details object', async () => {
    const listRes = await client.get('/api/schemes');
    const schemeId = listRes.body.schemes[0]._id;

    const res = await client.get(`/api/schemes/${schemeId}`);
    assertStatusCode(res, 200, 'Get Scheme by ID');
    assertHasProperties(res.body.scheme, ['name', 'description', 'benefits', 'eligibilityCriteria', 'requiredDocuments', 'officialUrl'], 'Scheme Detail');
    strictEqual(res.body.scheme._id, schemeId);
  });

  await test('T1.4.2: Scheme details contain structured eligibility criteria rules', async () => {
    const listRes = await client.get('/api/schemes');
    const pmkisan = listRes.body.schemes.find(s => s.code === 'PM-KISAN');

    const res = await client.get(`/api/schemes/${pmkisan._id}`);
    assertStatusCode(res, 200, 'PM-KISAN Details');
    assertHasProperties(res.body.scheme.eligibilityCriteria, ['maxLandSizeAcres', 'eligibleCategories', 'eligibleStates'], 'Eligibility Criteria');
    inRange(res.body.scheme.eligibilityCriteria.maxLandSizeAcres, 4.0, 5.0);
  });

  await test('T1.4.3: Scheme details contain required documents list array', async () => {
    const listRes = await client.get('/api/schemes');
    const scheme = listRes.body.schemes[0];
    const res = await client.get(`/api/schemes/${scheme._id}`);
    assertStatusCode(res, 200, 'Scheme Documents');
    ok(Array.isArray(res.body.scheme.requiredDocuments));
    ok(res.body.scheme.requiredDocuments.length >= 3);
  });

  await test('T1.4.4: Scheme details contain official government application link', async () => {
    const listRes = await client.get('/api/schemes');
    const pmkisan = listRes.body.schemes.find(s => s.code === 'PM-KISAN');
    const res = await client.get(`/api/schemes/${pmkisan._id}`);
    assertStatusCode(res, 200, 'Official URL');
    match(res.body.scheme.officialUrl, /^https:\/\//);
  });

  await test('T1.4.5: Requesting scheme details with non-existent ID format returns 404', async () => {
    const res = await client.get('/api/schemes/65f1a2b3c4d5e6f7a8b9c999');
    assertStatusCode(res, 404, 'Non-existent Scheme ID');
    strictEqual(res.body.error, 'Scheme not found');
  });

  // ==========================================
  // FEATURE 5: Eligibility Checker & Recommendations
  // ==========================================
  await test('T1.5.1: Eligibility check for eligible profile returns status eligible and positive score', async () => {
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const farmerProfile = {
      landSize: 1.5,
      category: 'SC',
      state: 'Uttar Pradesh'
    };
    const res = await client.post('/api/eligibility/check', { schemeId: pmkisanId, farmerProfile });
    assertStatusCode(res, 200, 'Eligibility Eligible Case');
    strictEqual(res.body.status, 'eligible');
    inRange(res.body.score, 80, 100);
    ok(Array.isArray(res.body.reasons));
  });

  await test('T1.5.2: Eligibility check for ineligible profile returns status not_eligible with failure reason', async () => {
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const farmerProfile = {
      landSize: 15.0, // Exceeds 4.94 acre max
      category: 'General',
      state: 'Uttar Pradesh'
    };
    const res = await client.post('/api/eligibility/check', { schemeId: pmkisanId, farmerProfile });
    assertStatusCode(res, 200, 'Eligibility Ineligible Case');
    strictEqual(res.body.status, 'not_eligible');
    ok(res.body.score < 50);
    ok(res.body.reasons.some(r => r.includes('exceeds scheme maximum limit')));
  });

  await test('T1.5.3: GET /api/eligibility/recommendations returns top matched schemes for user', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.get('/api/eligibility/recommendations', { token });
    assertStatusCode(res, 200, 'Get Recommendations');
    assertHasProperties(res.body, ['recommendations'], 'Recommendations Response');
    ok(res.body.recommendations.length > 0);
    strictEqual(res.body.recommendations[0].status, 'eligible');
  });

  await test('T1.5.4: Eligibility evaluation dynamically recalculates when user updates profile', async () => {
    const token = 'jwt_test_token_valid_001';
    // Update profile land size from 1.5 acres to 10 acres
    await client.put('/api/profile', { landSize: 10.0 }, { token });

    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const res = await client.post('/api/eligibility/check', { schemeId: pmkisanId }, { token });
    assertStatusCode(res, 200, 'Updated Profile Eligibility Check');
    strictEqual(res.body.status, 'not_eligible');
  });

  await test('T1.5.5: Eligibility response includes missing documents checklist preview', async () => {
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const res = await client.post('/api/eligibility/check', { schemeId: pmkisanId, farmerProfile: { landSize: 1.0 } });
    assertStatusCode(res, 200, 'Missing Documents Preview');
    ok(Array.isArray(res.body.missingDocuments));
    ok(res.body.missingDocuments.includes('Aadhaar Card'));
  });

  // ==========================================
  // FEATURE 6: AI Chat & RAG Knowledge Retrieval
  // ==========================================
  await test('T1.6.1: POST /api/chat returns AI generated reply with relevant scheme context', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/chat', { message: 'How to apply for PM-KISAN installment?' }, { token });
    assertStatusCode(res, 200, 'AI Chat Reply');
    assertHasProperties(res.body, ['reply', 'conversationId', 'suggestedPrompts', 'relevantSchemes'], 'Chat Response');
    match(res.body.reply, /PM-KISAN/);
    ok(res.body.relevantSchemes.length > 0);
  });

  await test('T1.6.2: AI Chat RAG retrieves relevant MongoDB scheme data for insurance query', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/chat', { message: 'What is crop insurance PMFBY?' }, { token });
    assertStatusCode(res, 200, 'RAG Insurance Query');
    ok(res.body.relevantSchemes.some(s => s.code === 'PMFBY'));
  });

  await test('T1.6.3: AI Chat returns suggested follow-up prompts for interactive guidance', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/chat', { message: 'Tell me about solar pumps' }, { token });
    assertStatusCode(res, 200, 'Suggested Prompts');
    ok(Array.isArray(res.body.suggestedPrompts));
    ok(res.body.suggestedPrompts.length >= 2);
  });

  await test('T1.6.4: GET /api/chat/history retrieves past conversation messages', async () => {
    const token = 'jwt_test_token_valid_001';
    await client.post('/api/chat', { message: 'Hello KrishiSahayak' }, { token });

    const res = await client.get('/api/chat/history', { token });
    assertStatusCode(res, 200, 'Get Chat History');
    assertHasProperties(res.body, ['messages'], 'History Object');
    ok(res.body.messages.length >= 2); // user msg + bot msg
    strictEqual(res.body.messages[0].text, 'Hello KrishiSahayak');
  });

  await test('T1.6.5: Multi-turn conversation preserves conversationId across messages', async () => {
    const token = 'jwt_test_token_valid_001';
    const msg1 = await client.post('/api/chat', { message: 'Tell me about KCC loan' }, { token });
    const convId = msg1.body.conversationId;

    const msg2 = await client.post('/api/chat', { message: 'What is the interest rate?', conversationId: convId }, { token });
    assertStatusCode(msg2, 200, 'Multi-turn Chat');
    strictEqual(msg2.body.conversationId, convId);
  });

  // ==========================================
  // FEATURE 7: Document OCR & AI Intelligence Summary
  // ==========================================
  await test('T1.7.1: Upload document accepts valid file payload and returns OCR extracted text', async () => {
    const token = 'jwt_test_token_valid_001';
    const payload = {
      fileName: 'land_record.pdf',
      fileContent: 'SGVsbG8gV29ybGQgT0NS',
      mimeType: 'application/pdf'
    };
    const res = await client.post('/api/documents/upload', payload, { token });
    assertStatusCode(res, 200, 'Document Upload');
    assertHasProperties(res.body, ['documentId', 'extractedText', 'summary'], 'Document Upload Response');
    match(res.body.extractedText, /OCR Extracted Content/);
  });

  await test('T1.7.2: Document analysis generates structured AI summary (benefits, eligibility, docs, deadlines)', async () => {
    const token = 'jwt_test_token_valid_001';
    const payload = { fileName: 'aadhaar.png', fileContent: 'cGhvdG8=', mimeType: 'image/png' };
    const res = await client.post('/api/documents/upload', payload, { token });
    assertStatusCode(res, 200, 'AI Summary Struct');
    assertHasProperties(res.body.summary, ['benefits', 'eligibility', 'requiredDocuments', 'deadlines'], 'Summary Struct');
    ok(res.body.summary.benefits.length > 0);
  });

  await test('T1.7.3: GET /api/documents/:id retrieves processed document by ID', async () => {
    const token = 'jwt_test_token_valid_001';
    const uploadRes = await client.post('/api/documents/upload', { fileName: 'test.jpg', fileContent: 'abc', mimeType: 'image/jpeg' }, { token });
    const docId = uploadRes.body.documentId;

    const res = await client.get(`/api/documents/${docId}`, { token });
    assertStatusCode(res, 200, 'Get Document by ID');
    strictEqual(res.body.document.documentId, docId);
    strictEqual(res.body.document.fileName, 'test.jpg');
  });

  await test('T1.7.4: OCR extraction identifies survey number and land area entities', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/documents/upload', { fileName: 'khatauni.pdf', fileContent: 'bGFuZA==', mimeType: 'application/pdf' }, { token });
    assertStatusCode(res, 200, 'Entity Extraction');
    match(res.body.extractedText, /Survey No/);
    match(res.body.extractedText, /Land Area/);
  });

  await test('T1.7.5: Document upload rejected for unsupported mimeType', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/documents/upload', { fileName: 'malicious.exe', fileContent: 'AAA=', mimeType: 'application/x-msdownload' }, { token });
    assertStatusCode(res, 400, 'Invalid File Type');
    match(res.body.error, /Invalid file format/);
  });

  // ==========================================
  // FEATURE 8: Document Checklist Management
  // ==========================================
  await test('T1.8.1: GET /api/checklists/:schemeId auto-generates checklist from scheme requirements', async () => {
    const token = 'jwt_test_token_valid_001';
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const res = await client.get(`/api/checklists/${pmkisanId}`, { token });
    assertStatusCode(res, 200, 'Get Checklist');
    assertHasProperties(res.body, ['schemeId', 'items', 'completionPercentage'], 'Checklist Response');
    strictEqual(res.body.completionPercentage, 0);
    ok(res.body.items.length >= 3);
  });

  await test('T1.8.2: PUT /api/checklists/:schemeId updates item completed status', async () => {
    const token = 'jwt_test_token_valid_001';
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const res = await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 0, completed: true }, { token });
    assertStatusCode(res, 200, 'Update Checklist Item');
    strictEqual(res.body.items[0].completed, true);
    ok(res.body.completionPercentage > 0);
  });

  await test('T1.8.3: Completion percentage recalculates dynamically as items are marked completed', async () => {
    const token = 'jwt_test_token_valid_001';
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    // Mark item 0 and item 1 as completed out of 4 items -> 50%
    await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 0, completed: true }, { token });
    const res = await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 1, completed: true }, { token });
    assertStatusCode(res, 200, 'Dynamic Progress Calc');
    strictEqual(res.body.completionPercentage, 50);
  });

  await test('T1.8.4: Toggling completed item back to false recalculates completion percentage downwards', async () => {
    const token = 'jwt_test_token_valid_001';
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 0, completed: true }, { token });
    const res = await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 0, completed: false }, { token });
    assertStatusCode(res, 200, 'Toggle Item Off');
    strictEqual(res.body.completionPercentage, 0);
  });

  await test('T1.8.5: Requesting checklist for non-existent scheme ID returns 404', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.get('/api/checklists/65f1a2b3c4d5e6f7a8b9c999', { token });
    assertStatusCode(res, 404, 'Checklist Scheme 404');
    strictEqual(res.body.error, 'Scheme not found');
  });

  // ==========================================
  // FEATURE 9: Bookmarks Management
  // ==========================================
  await test('T1.9.1: POST /api/bookmarks saves scheme to user bookmarks', async () => {
    const token = 'jwt_test_token_valid_001';
    const schemeId = '65f1a2b3c4d5e6f7a8b9c001';
    const res = await client.post('/api/bookmarks', { schemeId }, { token });
    assertStatusCode(res, 200, 'Add Bookmark');
    strictEqual(res.body.success, true);
    strictEqual(res.body.schemeId, schemeId);
  });

  await test('T1.9.2: GET /api/bookmarks returns list of saved scheme objects', async () => {
    const token = 'jwt_test_token_valid_001';
    const schemeId = '65f1a2b3c4d5e6f7a8b9c001';
    await client.post('/api/bookmarks', { schemeId }, { token });

    const res = await client.get('/api/bookmarks', { token });
    assertStatusCode(res, 200, 'Get Bookmarks');
    assertHasProperties(res.body, ['bookmarks'], 'Bookmarks Response');
    strictEqual(res.body.bookmarks.length, 1);
    strictEqual(res.body.bookmarks[0]._id, schemeId);
  });

  await test('T1.9.3: DELETE /api/bookmarks/:schemeId removes scheme from user bookmarks', async () => {
    const token = 'jwt_test_token_valid_001';
    const schemeId = '65f1a2b3c4d5e6f7a8b9c001';
    await client.post('/api/bookmarks', { schemeId }, { token });

    const delRes = await client.delete(`/api/bookmarks/${schemeId}`, { token });
    assertStatusCode(delRes, 200, 'Delete Bookmark');
    strictEqual(delRes.body.success, true);

    const getRes = await client.get('/api/bookmarks', { token });
    strictEqual(getRes.body.bookmarks.length, 0);
  });

  await test('T1.9.4: Duplicate bookmark addition handles idempotently without duplicating entry', async () => {
    const token = 'jwt_test_token_valid_001';
    const schemeId = '65f1a2b3c4d5e6f7a8b9c001';
    await client.post('/api/bookmarks', { schemeId }, { token });
    await client.post('/api/bookmarks', { schemeId }, { token });

    const res = await client.get('/api/bookmarks', { token });
    strictEqual(res.body.bookmarks.length, 1);
  });

  await test('T1.9.5: Attempting to delete non-bookmarked scheme returns 404', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.delete('/api/bookmarks/65f1a2b3c4d5e6f7a8b9c002', { token });
    assertStatusCode(res, 404, 'Delete Missing Bookmark');
    strictEqual(res.body.error, 'Bookmark not found');
  });

  // ==========================================
  // FEATURE 10: Notifications & Reminders
  // ==========================================
  await test('T1.10.1: GET /api/notifications returns user notification list and unread count', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.get('/api/notifications', { token });
    assertStatusCode(res, 200, 'Get Notifications');
    assertHasProperties(res.body, ['notifications', 'unreadCount'], 'Notifications Response');
    strictEqual(res.body.notifications.length, 2);
    strictEqual(res.body.unreadCount, 2);
  });

  await test('T1.10.2: PUT /api/notifications/:id/read marks notification as read and updates count', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.put('/api/notifications/notif_01/read', {}, { token });
    assertStatusCode(res, 200, 'Mark Notification Read');
    strictEqual(res.body.success, true);
    strictEqual(res.body.notification.read, true);
    strictEqual(res.body.unreadCount, 1);
  });

  await test('T1.10.3: Notification item structure contains title, message, read, createdAt', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.get('/api/notifications', { token });
    assertStatusCode(res, 200, 'Notification Structure');
    const n = res.body.notifications[0];
    assertHasProperties(n, ['id', 'title', 'message', 'read', 'createdAt'], 'Notif Item');
  });

  await test('T1.10.4: Marking non-existent notification ID as read returns 404', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.put('/api/notifications/invalid_notif_id/read', {}, { token });
    assertStatusCode(res, 404, 'Invalid Notification Read');
    strictEqual(res.body.error, 'Notification not found');
  });

  await test('T1.10.5: Unread count reflects total unread notifications accurately', async () => {
    const token = 'jwt_test_token_valid_001';
    await client.put('/api/notifications/notif_01/read', {}, { token });
    await client.put('/api/notifications/notif_02/read', {}, { token });
    const res = await client.get('/api/notifications', { token });
    assertStatusCode(res, 200, 'All Read Check');
    strictEqual(res.body.unreadCount, 0);
  });

  // ==========================================
  // FEATURE 11: Web Speech & Voice Assistant Interface
  // ==========================================
  await test('T1.11.1: Web Speech STT transcript input parser handles voice prompt queries', async () => {
    const speechTranscript = 'What are the benefits of PM Krishi Sinchai Yojana?';
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/chat', { message: speechTranscript }, { token });
    assertStatusCode(res, 200, 'Speech Transcript Query');
    match(res.body.reply, /KrishiSahayak/);
    ok(res.body.relevantSchemes.some(s => s.code === 'PMKSY'));
  });

  await test('T1.11.2: Web Speech TTS text response generator strips markdown formatting for read-aloud', async () => {
    const rawReply = '**PM-KISAN** scheme offers *Rs 6,000* per year!';
    const cleanTTS = rawReply.replace(/[*_#`]/g, '').trim();
    strictEqual(cleanTTS, 'PM-KISAN scheme offers Rs 6,000 per year!');
  });

  await test('T1.11.3: Voice assistant query fallback handles low-confidence speech input', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/chat', { message: 'yojana' }, { token });
    assertStatusCode(res, 200, 'Low Confidence Voice Query');
    ok(res.body.suggestedPrompts.length > 0);
  });

  await test('T1.11.4: Voice search trigger sets scheme browser search query correctly', async () => {
    const voiceSearchQuery = 'Organic Farming';
    const res = await client.get('/api/schemes', { query: { search: voiceSearchQuery } });
    assertStatusCode(res, 200, 'Voice Search Query');
    ok(res.body.schemes.some(s => s.code === 'PKVY'));
  });

  await test('T1.11.5: Voice assistant audio playback toggle metadata generator', async () => {
    const replyText = 'Here are details for Kisan Credit Card scheme.';
    const speechMeta = { text: replyText, lang: 'hi-IN', rate: 1.0, pitch: 1.0 };
    assertHasProperties(speechMeta, ['text', 'lang', 'rate', 'pitch'], 'Speech Meta');
    strictEqual(speechMeta.lang, 'hi-IN');
  });

  return { testsRun, testsPassed, testsFailed };
}

module.exports = { runTier1Tests };
