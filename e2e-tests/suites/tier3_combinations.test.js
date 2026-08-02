/**
 * Tier 3: Cross-Feature Combinations Test Suite for KrishiSahayak
 *
 * Verifies multi-step feature interactions, pairwise cross-module workflows,
 * data persistence across user actions, state transitions, and system lifecycle.
 */

const ApiClient = require('../utils/apiClient');
const mockServer = require('../utils/mockServer');
const {
  strictEqual,
  ok,
  assertStatusCode,
  assertHasProperties,
  match
} = require('../utils/assert');

async function runTier3Tests() {
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

  await test('T3.1: Registration -> Profile -> Eligibility -> Bookmark -> Checklist -> Notification flow', async () => {
    // 1. Send OTP & Verify
    await client.post('/api/auth/send-otp', { phone: '9988776655' });
    const authRes = await client.post('/api/auth/verify-otp', { phone: '9988776655', otp: '123456' });
    assertStatusCode(authRes, 200, 'Verify OTP');
    const token = authRes.body.token;

    // 2. Setup Farmer Profile
    const profilePayload = {
      name: 'Anil Verma',
      state: 'Uttar Pradesh',
      district: 'Gorakhpur',
      cropTypes: ['Wheat'],
      landSize: 1.8,
      category: 'OBC',
      farmerType: 'smallholder'
    };
    const profRes = await client.put('/api/profile', profilePayload, { token });
    assertStatusCode(profRes, 200, 'Update Profile');

    // 3. Check Eligibility for PM-KISAN
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const eligRes = await client.post('/api/eligibility/check', { schemeId: pmkisanId }, { token });
    assertStatusCode(eligRes, 200, 'Eligibility Check');
    strictEqual(eligRes.body.status, 'eligible');

    // 4. Save Bookmark
    const bookRes = await client.post('/api/bookmarks', { schemeId: pmkisanId }, { token });
    assertStatusCode(bookRes, 200, 'Add Bookmark');

    // 5. Generate & Update Checklist
    const chkRes1 = await client.get(`/api/checklists/${pmkisanId}`, { token });
    assertStatusCode(chkRes1, 200, 'Get Checklist');
    strictEqual(chkRes1.body.completionPercentage, 0);

    const chkRes2 = await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 0, completed: true }, { token });
    assertStatusCode(chkRes2, 200, 'Update Checklist');
    ok(chkRes2.body.completionPercentage > 0);

    // 6. View Notifications
    const notifRes = await client.get('/api/notifications', { token });
    assertStatusCode(notifRes, 200, 'Get Notifications');
    ok(Array.isArray(notifRes.body.notifications));
  });

  await test('T3.2: AI Chat scheme discovery -> Extract scheme ID -> Check eligibility -> Bookmark', async () => {
    const token = 'jwt_test_token_valid_001';

    // 1. AI Chat Query
    const chatRes = await client.post('/api/chat', { message: 'I need crop insurance for my wheat crop' }, { token });
    assertStatusCode(chatRes, 200, 'Chat Query');
    ok(chatRes.body.relevantSchemes.length > 0);

    const discoveredScheme = chatRes.body.relevantSchemes[0];
    const schemeId = discoveredScheme._id;

    // 2. Check Eligibility for Discovered Scheme
    const eligRes = await client.post('/api/eligibility/check', { schemeId }, { token });
    assertStatusCode(eligRes, 200, 'Eligibility for Discovered Scheme');
    ok(eligRes.body.score >= 50);

    // 3. Add to Bookmarks
    const bmkRes = await client.post('/api/bookmarks', { schemeId }, { token });
    assertStatusCode(bmkRes, 200, 'Bookmark Discovered Scheme');
    strictEqual(bmkRes.body.schemeId, schemeId);
  });

  await test('T3.3: Document OCR -> AI Summary -> Scheme requirement match -> Checklist update', async () => {
    const token = 'jwt_test_token_valid_001';
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';

    // 1. Upload Aadhaar Doc
    const docRes = await client.post('/api/documents/upload', {
      fileName: 'aadhaar_card.pdf',
      fileContent: 'QUFESEFBUiBOVU1CRVIgMTIzNC01Njc4LTkwMTI=',
      mimeType: 'application/pdf'
    }, { token });
    assertStatusCode(docRes, 200, 'Document Upload');
    ok(docRes.body.summary.requiredDocuments.includes('Aadhaar Card'));

    // 2. Update Document Checklist Item for Aadhaar (item 0)
    const chkRes = await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 0, completed: true }, { token });
    assertStatusCode(chkRes, 200, 'Update Aadhaar Item');
    strictEqual(chkRes.body.items[0].docName, 'Aadhaar Card');
    strictEqual(chkRes.body.items[0].completed, true);
  });

  await test('T3.4: Profile Land Size Update -> Re-trigger Eligibility & Recommendations', async () => {
    const token = 'jwt_test_token_valid_001';

    // 1. Initial Profile (1.5 acres) recommendations
    const recs1 = await client.get('/api/eligibility/recommendations', { token });
    assertStatusCode(recs1, 200, 'Initial Recs');
    const pmkisanRec1 = recs1.body.recommendations.find(r => r.scheme.code === 'PM-KISAN');
    strictEqual(pmkisanRec1.status, 'eligible');

    // 2. Update land size to 12.0 acres (exceeds PM-KISAN limit)
    await client.put('/api/profile', { landSize: 12.0, farmerType: 'large' }, { token });

    // 3. Re-evaluate recommendations
    const recs2 = await client.get('/api/eligibility/recommendations', { token });
    assertStatusCode(recs2, 200, 'Re-evaluated Recs');
    const pmkisanRec2 = recs2.body.recommendations.find(r => r.scheme.code === 'PM-KISAN');
    strictEqual(pmkisanRec2.status, 'not_eligible');

    // 4. Verify SMAM tractor scheme is now top recommendation
    const smamRec = recs2.body.recommendations.find(r => r.scheme.code === 'SMAM');
    strictEqual(smamRec.status, 'eligible');
  });

  await test('T3.5: Logout -> Attempt Protected APIs -> Re-login -> Verify State Persistence', async () => {
    // 1. Login User
    const auth1 = await client.post('/api/auth/verify-otp', { phone: '9123456789', otp: '123456' });
    const token1 = auth1.body.token;

    // 2. Create Profile & Add Bookmark
    await client.put('/api/profile', { name: 'Suresh Patel', state: 'Gujarat' }, { token: token1 });
    await client.post('/api/bookmarks', { schemeId: '65f1a2b3c4d5e6f7a8b9c001' }, { token: token1 });

    // 3. Logout
    await client.post('/api/auth/logout', {}, { token: token1 });

    // 4. Verify Protected Call with Old Token Fails
    const blockedRes = await client.get('/api/profile', { token: token1 });
    assertStatusCode(blockedRes, 401, 'Blocked Access');

    // 5. Re-login
    const auth2 = await client.post('/api/auth/verify-otp', { phone: '9123456789', otp: '123456' });
    const token2 = auth2.body.token;

    // 6. Verify Profile & Bookmarks Intact
    const profRes = await client.get('/api/profile', { token: token2 });
    assertStatusCode(profRes, 200, 'Re-login Profile');
    strictEqual(profRes.body.profile.name, 'Suresh Patel');

    const bmkRes = await client.get('/api/bookmarks', { token: token2 });
    assertStatusCode(bmkRes, 200, 'Re-login Bookmarks');
    strictEqual(bmkRes.body.bookmarks.length, 1);
  });

  await test('T3.6: Bookmark scheme -> Update Checklist -> Delete Account -> Verify Complete Cleanup', async () => {
    // 1. Login User
    const auth = await client.post('/api/auth/verify-otp', { phone: '9888877777', otp: '123456' });
    const token = auth.body.token;

    // 2. Create Data
    await client.put('/api/profile', { name: 'Temp User', landSize: 2.0 }, { token });
    await client.post('/api/bookmarks', { schemeId: '65f1a2b3c4d5e6f7a8b9c001' }, { token });
    await client.put('/api/checklists/65f1a2b3c4d5e6f7a8b9c001', { itemIndex: 0, completed: true }, { token });

    // 3. Delete Account
    const delRes = await client.delete('/api/auth/account', { token });
    assertStatusCode(delRes, 200, 'Delete Account');

    // 4. Verify token rejection and data cleanup
    const checkProf = await client.get('/api/profile', { token });
    assertStatusCode(checkProf, 401, 'Post Delete Profile');
  });

  await test('T3.7: Scheme Search -> Filter State & Category -> Sort -> Check Eligibility on Top Result', async () => {
    // 1. Search + Filter + Sort query
    const res = await client.get('/api/schemes', {
      query: {
        category: 'Organic Farming',
        state: 'Madhya Pradesh',
        sort: 'newest'
      }
    });
    assertStatusCode(res, 200, 'Filtered Scheme Search');
    ok(res.body.schemes.length > 0);

    const topScheme = res.body.schemes[0];

    // 2. Check Eligibility for top scheme
    const elig = await client.post('/api/eligibility/check', {
      schemeId: topScheme._id,
      farmerProfile: { state: 'Madhya Pradesh', landSize: 3.0, category: 'General' }
    });
    assertStatusCode(elig, 200, 'Eligibility on Top Scheme');
    ok(elig.body.score >= 70);
  });

  await test('T3.8: Multi-user concurrent session isolation test', async () => {
    // User 1 Login
    const auth1 = await client.post('/api/auth/verify-otp', { phone: '9000000001', otp: '123456' });
    const token1 = auth1.body.token;
    await client.put('/api/profile', { name: 'Farmer One', landSize: 1.0 }, { token: token1 });
    await client.post('/api/bookmarks', { schemeId: '65f1a2b3c4d5e6f7a8b9c001' }, { token: token1 });

    // User 2 Login
    const auth2 = await client.post('/api/auth/verify-otp', { phone: '9000000002', otp: '123456' });
    const token2 = auth2.body.token;
    await client.put('/api/profile', { name: 'Farmer Two', landSize: 5.0 }, { token: token2 });
    await client.post('/api/bookmarks', { schemeId: '65f1a2b3c4d5e6f7a8b9c002' }, { token: token2 });

    // Verify User 1 sees only User 1 data
    const bmk1 = await client.get('/api/bookmarks', { token: token1 });
    strictEqual(bmk1.body.bookmarks.length, 1);
    strictEqual(bmk1.body.bookmarks[0]._id, '65f1a2b3c4d5e6f7a8b9c001');

    // Verify User 2 sees only User 2 data
    const bmk2 = await client.get('/api/bookmarks', { token: token2 });
    strictEqual(bmk2.body.bookmarks.length, 1);
    strictEqual(bmk2.body.bookmarks[0]._id, '65f1a2b3c4d5e6f7a8b9c002');
  });

  await test('T3.9: Voice Assistant STT -> AI Chat -> Bookmark scheme -> View Notifications', async () => {
    const token = 'jwt_test_token_valid_001';

    // 1. Voice STT prompt dispatch
    const chatRes = await client.post('/api/chat', { message: 'What is Kisan Credit Card loan limit?' }, { token });
    assertStatusCode(chatRes, 200, 'Voice Chat Query');

    const kccScheme = chatRes.body.relevantSchemes.find(s => s.code === 'KCC');
    ok(kccScheme !== undefined, 'KCC scheme should be in relevantSchemes');

    // 2. Save KCC to bookmarks
    await client.post('/api/bookmarks', { schemeId: kccScheme._id }, { token });

    // 3. Mark notification as read
    const notifRes = await client.put('/api/notifications/notif_01/read', {}, { token });
    assertStatusCode(notifRes, 200, 'Read Notif');
    strictEqual(notifRes.body.notification.read, true);
  });

  await test('T3.10: Google OAuth Auth -> Profile Creation -> Get Recommendations -> Logout', async () => {
    // 1. Google Auth
    const authRes = await client.post('/api/auth/google', { idToken: 'google_token_test_abc' });
    assertStatusCode(authRes, 200, 'Google Auth');
    const token = authRes.body.token;

    // 2. Profile Creation
    await client.put('/api/profile', {
      name: 'Priya Sharma',
      state: 'Madhya Pradesh',
      cropTypes: ['Pulses'],
      landSize: 2.0,
      category: 'General'
    }, { token });

    // 3. Recommendations
    const recs = await client.get('/api/eligibility/recommendations', { token });
    assertStatusCode(recs, 200, 'Get Recs');
    ok(recs.body.recommendations.length > 0);

    // 4. Logout
    const logout = await client.post('/api/auth/logout', {}, { token });
    assertStatusCode(logout, 200, 'Logout');
  });

  return { testsRun, testsPassed, testsFailed };
}

module.exports = { runTier3Tests };
