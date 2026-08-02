/**
 * smsService.js
 * Provider abstraction interface for Twilio, MSG91, and Dev Bypass.
 */

const otpStore = new Map();

/**
 * Abstract Base SMS Provider Class
 */
class SMSProvider {
  async sendSMS(phone, message) {
    throw new Error('sendSMS method must be implemented by SMSProvider subclass.');
  }
}

/**
 * Twilio SMS Provider
 */
class TwilioProvider extends SMSProvider {
  constructor(accountSid, authToken, fromNumber) {
    super();
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendSMS(phone, message) {
    console.log(`[SMSProvider: Twilio] Dispatching SMS to ${phone}: ${message}`);
    // Twilio SDK integration placeholder for production environment
    return { success: true, provider: 'Twilio', phone };
  }
}

/**
 * MSG91 SMS Provider
 */
class MSG91Provider extends SMSProvider {
  constructor(authKey, senderId) {
    super();
    this.authKey = authKey;
    this.senderId = senderId;
  }

  async sendSMS(phone, message) {
    console.log(`[SMSProvider: MSG91] Dispatching SMS to ${phone}: ${message}`);
    // MSG91 HTTP API integration placeholder
    return { success: true, provider: 'MSG91', phone };
  }
}

/**
 * Dev Bypass Provider (Console Logging for local development)
 */
class DevBypassProvider extends SMSProvider {
  async sendSMS(phone, message) {
    console.log(`[SMSProvider: DevBypass] Simulated SMS sent to ${phone}: "${message}"`);
    return { success: true, provider: 'DevBypass', phone };
  }
}

/**
 * Factory function to retrieve the configured SMS provider based on environment variables
 */
function getSmsProvider() {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return new TwilioProvider(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_PHONE_NUMBER
    );
  }
  if (process.env.MSG91_AUTH_KEY) {
    return new MSG91Provider(process.env.MSG91_AUTH_KEY, process.env.MSG91_SENDER_ID);
  }
  return new DevBypassProvider();
}

/**
 * Sends OTP to the specified phone number.
 * @param {string} phone
 * @param {string} [customCode]
 * @returns {Promise<{ success: boolean, message: string, devCode?: string }>}
 */
async function sendOtp(phone, customCode) {
  const code = customCode || (process.env.NODE_ENV === 'production' 
    ? Math.floor(100000 + Math.random() * 900000).toString() 
    : '123456');
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL
  otpStore.set(phone, { code, expiresAt });

  const message = `Your KrishiSahayak OTP is: ${code}. Valid for 10 minutes.`;
  const provider = getSmsProvider();
  await provider.sendSMS(phone, message);

  return {
    success: true,
    message: 'OTP sent successfully',
    devCode: process.env.NODE_ENV === 'production' ? undefined : code,
  };
}

/**
 * Verifies OTP code for a phone number.
 * @param {string} phone
 * @param {string} code
 * @returns {boolean}
 */
function verifyOtpCode(phone, code) {
  if (process.env.NODE_ENV !== 'production' && code === '123456') return true;

  const record = otpStore.get(phone);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  if (record.code === code) {
    otpStore.delete(phone);
    return true;
  }

  return false;
}

module.exports = {
  sendOtp,
  verifyOtpCode,
  getSmsProvider,
  otpStore,
};
