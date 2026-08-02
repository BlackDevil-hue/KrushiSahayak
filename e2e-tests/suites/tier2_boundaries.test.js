/**
 * Tier 2: Boundary & Corner Cases Test Suite for KrishiSahayak
 *
 * Validates system resilience against malformed inputs, out-of-bounds parameters,
 * security injection attempts, unauthorized access, and edge conditions.
 */

const ApiClient = require('../utils/apiClient');
const mockServer = require('../utils/mockServer');
const {
  strictEqual,
  ok,
  assertStatusCode,
  match
} = require('../utils/assert');

async function runTier2Tests() {
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

  await test('T2.1: Send OTP with invalid phone format returns 400 Bad Request', async () => {
    const invalidPhones = ['123', 'abcdefghij', '+12345678901234', '9876543210123'];
    for (const phone of invalidPhones) {
      const res = await client.post('/api/auth/send-otp', { phone });
      assertStatusCode(res, 400, `Invalid Phone (${phone})`);
      match(res.body.error, /Invalid/);
    }
  });

  await test('T2.2: Verify OTP with incorrect 6-digit code returns 401 Unauthorized', async () => {
    const res = await client.post('/api/auth/verify-otp', { phone: '9876543210', otp: '999999' });
    assertStatusCode(res, 401, 'Invalid OTP Code');
    strictEqual(res.body.error, 'Invalid OTP code');
  });

  await test('T2.3: Verify OTP with missing parameters returns 400 Bad Request', async () => {
    const res1 = await client.post('/api/auth/verify-otp', { phone: '9876543210' });
    assertStatusCode(res1, 400, 'Missing OTP');

    const res2 = await client.post('/api/auth/verify-otp', { otp: '123456' });
    assertStatusCode(res2, 400, 'Missing Phone');
  });

  await test('T2.4: Update profile with negative land size returns 400 validation error', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.put('/api/profile', { landSize: -5.5 }, { token });
    assertStatusCode(res, 400, 'Negative Land Size');
    match(res.body.error, /non-negative number/);
  });

  await test('T2.5: Update profile with non-numeric land size returns 400 validation error', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.put('/api/profile', { landSize: 'ten acres' }, { token });
    assertStatusCode(res, 400, 'Non-numeric Land Size');
  });

  await test('T2.6: Profile update with extremely large string exceeds maximum length limit', async () => {
    const token = 'jwt_test_token_valid_001';
    const hugeName = 'A'.repeat(1000);
    const res = await client.put('/api/profile', { name: hugeName }, { token });
    assertStatusCode(res, 400, 'Max String Length');
    match(res.body.error, /maximum allowed character length/);
  });

  await test('T2.7: Get scheme by malformed ID string returns 400 Bad Request', async () => {
    const res = await client.get('/api/schemes/invalid-scheme-id-123!');
    assertStatusCode(res, 400, 'Malformed Scheme ID');
    match(res.body.error, /Invalid scheme ID format/);
  });

  await test('T2.8: Get scheme by non-existent hex ObjectId returns 404 Not Found', async () => {
    const res = await client.get('/api/schemes/000000000000000000000000');
    assertStatusCode(res, 404, 'Non-existent Hex ID');
    strictEqual(res.body.error, 'Scheme not found');
  });

  await test('T2.9: Upload document with unsupported mime type returns 400 Bad Request', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/documents/upload', {
      fileName: 'script.sh',
      fileContent: 'ZWNobyAiSGVsbG8i',
      mimeType: 'text/x-shellscript'
    }, { token });
    assertStatusCode(res, 400, 'Unsupported Mime Type');
    match(res.body.error, /Invalid file format/);
  });

  await test('T2.10: Upload 0-byte empty document returns 400 Bad Request', async () => {
    const token = 'jwt_test_token_valid_001';
    const res = await client.post('/api/documents/upload', {
      fileName: 'empty.pdf',
      fileContent: '',
      mimeType: 'application/pdf'
    }, { token });
    assertStatusCode(res, 400, 'Empty Document Upload');
    match(res.body.error, /Empty file/);
  });

  await test('T2.11: Access protected routes without Authorization header returns 401 Unauthorized', async () => {
    const routes = [
      { method: 'GET', path: '/api/profile' },
      { method: 'GET', path: '/api/bookmarks' },
      { method: 'GET', path: '/api/notifications' },
      { method: 'POST', path: '/api/chat', body: { message: 'hello' } },
      { method: 'POST', path: '/api/documents/upload', body: { fileName: 'a.pdf', fileContent: 'a' } }
    ];

    for (const r of routes) {
      const res = await client.request(r.method, r.path, { body: r.body, token: null });
      assertStatusCode(res, 401, `No Token ${r.method} ${r.path}`);
      match(res.body.error, /Unauthorized/);
    }
  });

  await test('T2.12: Access protected routes with invalid/corrupted token returns 401 Unauthorized', async () => {
    const res = await client.get('/api/profile', { token: 'corrupted_jwt_token_xyz_999' });
    assertStatusCode(res, 401, 'Corrupted Token');
  });

  await test('T2.13: Scheme list query with negative page or zero limit returns 400 Bad Request', async () => {
    const res1 = await client.get('/api/schemes', { query: { page: -1, limit: 10 } });
    assertStatusCode(res1, 400, 'Negative Page');

    const res2 = await client.get('/api/schemes', { query: { page: 1, limit: 0 } });
    assertStatusCode(res2, 400, 'Zero Limit');
  });

  await test('T2.14: Scheme search query with SQL/NoSQL injection payload executes safely', async () => {
    const injectionQueries = [
      '{$gt: ""}',
      "'; DROP TABLE schemes; --",
      '<script>alert("xss")</script>',
      'ADMIN" OR "1"="1'
    ];

    for (const search of injectionQueries) {
      const res = await client.get('/api/schemes', { query: { search } });
      assertStatusCode(res, 200, `Injection Search (${search})`);
      ok(Array.isArray(res.body.schemes)); // Safely handled as literal search
    }
  });

  await test('T2.15: Post chat message with empty or whitespace string returns 400 Bad Request', async () => {
    const token = 'jwt_test_token_valid_001';
    const res1 = await client.post('/api/chat', { message: '' }, { token });
    assertStatusCode(res1, 400, 'Empty Chat Msg');

    const res2 = await client.post('/api/chat', { message: '    \n  \t  ' }, { token });
    assertStatusCode(res2, 400, 'Whitespace Chat Msg');
  });

  await test('T2.16: Checklist update with out-of-bounds itemIndex returns 400 Bad Request', async () => {
    const token = 'jwt_test_token_valid_001';
    const pmkisanId = '65f1a2b3c4d5e6f7a8b9c001';
    const res = await client.put(`/api/checklists/${pmkisanId}`, { itemIndex: 99, completed: true }, { token });
    assertStatusCode(res, 400, 'Out of bounds item index');
    match(res.body.error, /Invalid itemIndex/);
  });

  await test('T2.17: Google OAuth with empty ID token returns 400 Bad Request', async () => {
    const res = await client.post('/api/auth/google', { idToken: '' });
    assertStatusCode(res, 400, 'Empty Google Token');
  });

  await test('T2.18: Deleting account twice returns 401 on second attempt due to invalidated token', async () => {
    const authRes = await client.post('/api/auth/verify-otp', { phone: '9876543210', otp: '123456' });
    const token = authRes.body.token;

    const del1 = await client.delete('/api/auth/account', { token });
    assertStatusCode(del1, 200, 'Delete 1');

    const del2 = await client.delete('/api/auth/account', { token });
    assertStatusCode(del2, 401, 'Delete 2');
  });

  return { testsRun, testsPassed, testsFailed };
}

module.exports = { runTier2Tests };
