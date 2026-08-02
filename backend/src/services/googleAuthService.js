/**
 * googleAuthService.js
 * Google ID token verification via google-auth-library OAuth2Client
 * with mock token bypass for local/test environments.
 */

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'krishisahayak-google-client-id');

/**
 * Verifies a Google ID token or bypasses for test/mock tokens.
 * @param {string} idToken
 * @returns {Promise<{ googleId: string, email: string, name?: string, picture?: string }>}
 */
async function verifyGoogleToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Google ID token is required and must be a string.');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload returned from Google verification.');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('[GoogleAuthService] Verification error:', error.message);
    throw new Error(`Google token verification failed: ${error.message}`);
  }
}

module.exports = {
  verifyGoogleToken,
};
