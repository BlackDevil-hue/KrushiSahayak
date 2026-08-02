/**
 * In-Memory Mock API Server & Business Logic Simulator for KrishiSahayak
 *
 * Implements exact REST contracts and logic per PROJECT.md & ORIGINAL_REQUEST.md.
 * Used for standalone offline execution or when no external server process is active.
 */

const crypto = require('crypto');

// Initial seed schemes (10 real Indian agricultural schemes)
const SEED_SCHEMES = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c001',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    code: 'PM-KISAN',
    category: 'Financial Support',
    description: 'Income support scheme for farmer families across India to supplement financial needs for procuring agricultural inputs. Provides Rs. 6,000 per year in three equal installments directly into bank accounts.',
    benefits: ['Financial assistance of Rs. 6,000 per year', 'Direct benefit transfer in 3 equal installments of Rs. 2,000', '100% central government funded'],
    eligibilityCriteria: {
      maxLandSizeAcres: 4.94, // 2 hectares
      minLandSizeAcres: 0,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India'],
      excludedFarmerTypes: []
    },
    requiredDocuments: ['Aadhaar Card', 'Land Holding Documents (Khatauni)', 'Bank Account Details', 'Mobile Number'],
    deadline: 'Ongoing',
    officialUrl: 'https://pmkisan.gov.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c002',
    name: 'PM Fasal Bima Yojana (PMFBY)',
    code: 'PMFBY',
    category: 'Crop Insurance',
    description: 'Comprehensive crop insurance scheme protecting farmers against crop yield losses due to non-preventable natural risks like drought, flood, pests, and diseases.',
    benefits: ['Low premium rate (1.5% for Rabi, 2% for Kharif, 5% for commercial crops)', 'Comprehensive coverage from pre-sowing to post-harvest', 'Full sum insured payout without cap'],
    eligibilityCriteria: {
      maxLandSizeAcres: 100,
      minLandSizeAcres: 0,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India'],
      eligibleCrops: ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Pulses', 'Commercial']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Record Certificate / Sowing Certificate', 'Bank Passbook Copy', 'Crop Damage Photo Evidence'],
    deadline: '2026-12-31',
    officialUrl: 'https://pmfby.gov.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-16T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c003',
    name: 'Kisan Credit Card (KCC)',
    code: 'KCC',
    category: 'Credit & Subsidy',
    description: 'Provides adequate and timely credit support from banking system under a single window to farmers for their cultivation, post-harvest expenses, and farm asset maintenance.',
    benefits: ['Credit line up to Rs. 3 Lakhs at subsidized interest rate of 4%', 'Interest subvention of 2% and prompt repayment incentive of 3%', 'No collateral required for loans up to Rs. 1.6 Lakhs'],
    eligibilityCriteria: {
      maxLandSizeAcres: 50,
      minLandSizeAcres: 0.1,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India'],
      eligibleFarmerTypes: ['smallholder', 'marginal', 'medium', 'large']
    },
    requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Land Ownership / Tenancy Record', 'Passport Size Photograph'],
    deadline: 'Ongoing',
    officialUrl: 'https://myscheme.gov.in/schemes/kcc',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-17T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c004',
    name: 'PM Krishi Sinchai Yojana (PMKSY)',
    code: 'PMKSY',
    category: 'Irrigation',
    description: 'National mission to expand cultivable area under assured irrigation, improve on-farm water use efficiency through micro-irrigation (Drip & Sprinkler), and adopt sustainable water conservation practices.',
    benefits: ['Financial subsidy up to 55% for small/marginal farmers on micro-irrigation systems', 'Subsidized installation of solar water pumps', 'Improved crop yield with 40% water savings'],
    eligibilityCriteria: {
      maxLandSizeAcres: 25,
      minLandSizeAcres: 0.5,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India'],
      eligibleFarmerTypes: ['smallholder', 'marginal', 'medium']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Records', 'Electricity Bill / Water Source Proof', 'Bank Account Details'],
    deadline: '2026-10-31',
    officialUrl: 'https://pmksy.gov.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-18T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c005',
    name: 'Soil Health Card Scheme',
    code: 'SHC',
    category: 'Agricultural Inputs',
    description: 'Assists state governments to issue Soil Health Cards to all farmers in the country. The cards provide information to farmers on nutrient status of their soil along with recommendation on appropriate dosage of nutrients.',
    benefits: ['Free soil testing every 2 years', 'Customized fertilizer recommendation for higher yield', 'Soil health diagnosis report'],
    eligibilityCriteria: {
      maxLandSizeAcres: 100,
      minLandSizeAcres: 0,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Khatauni / Survey Number', 'Mobile Number'],
    deadline: 'Ongoing',
    officialUrl: 'https://soilhealth.dac.gov.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-19T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c006',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    code: 'PKVY',
    category: 'Organic Farming',
    description: 'Promotes organic farming among farmers through cluster approach and PGS (Participatory Guarantee System) certification. Provides financial assistance for organic inputs, packaging, and marketing.',
    benefits: ['Financial assistance of Rs. 50,000 per hectare over 3 years', 'Free PGS-India organic certification', 'Support for organic branding and marketing'],
    eligibilityCriteria: {
      maxLandSizeAcres: 10,
      minLandSizeAcres: 0.5,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India', 'Madhya Pradesh', 'Uttarakhand', 'Sikkim', 'Maharashtra'],
      organicClusterRequired: true
    },
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Record', 'Organic Farmer Cluster Registration Form', 'Bank Details'],
    deadline: '2026-11-15',
    officialUrl: 'https://pgsindia-ncof.gov.in/pkvy',
    supportedStates: ['Pan-India', 'Madhya Pradesh', 'Uttarakhand', 'Sikkim', 'Maharashtra'],
    createdDate: '2024-01-20T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c007',
    name: 'National Mission on Sustainable Agriculture (NMSA)',
    code: 'NMSA',
    category: 'Sustainable Farming',
    description: 'Aims to make agriculture more productive, sustainable, remunerative and climate resilient by promoting location specific integrated farming systems and rainfed technologies.',
    benefits: ['Subsidy for rainfed area development and integrated farming', 'Financial assistance for agroforestry and soil conservation', 'Climate resilience training'],
    eligibilityCriteria: {
      maxLandSizeAcres: 20,
      minLandSizeAcres: 0.5,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account Passbook'],
    deadline: 'Ongoing',
    officialUrl: 'https://nmsa.dac.gov.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-21T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c008',
    name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    code: 'RKVY',
    category: 'Infrastructure & Agri-preneurship',
    description: 'Incentivizes states to increase public investment in agriculture and allied sectors. Provides funding for agri-startups, farm infrastructure, and local state agricultural development plans.',
    benefits: ['Grant support up to Rs. 25 Lakhs for agri-startups', 'Infrastructure development for farm produce processing', 'State-specific agricultural project funding'],
    eligibilityCriteria: {
      maxLandSizeAcres: 100,
      minLandSizeAcres: 0,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India']
    },
    requiredDocuments: ['Aadhaar Card', 'Project Proposal / DPR', 'Bank Passbook', 'Land Documents (if infrastructure project)'],
    deadline: '2026-09-30',
    officialUrl: 'https://rkvy.nic.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-22T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c009',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    code: 'SMAM',
    category: 'Equipment & Machinery',
    description: 'Promotes farm mechanization among small and marginal farmers by establishing Custom Hiring Centres (CHCs) and offering capital subsidies on agricultural equipment (tractors, tillers, harvesters).',
    benefits: ['Subsidy of 40% to 50% on individual machinery purchase', 'Subsidy of 80% for setting up Custom Hiring Centres (CHCs)', 'Access to modern farm machinery'],
    eligibilityCriteria: {
      maxLandSizeAcres: 50,
      minLandSizeAcres: 1.0,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Record', 'Bank Passbook', 'Quotation of Machinery from Authorized Dealer'],
    deadline: '2026-08-31',
    officialUrl: 'https://agrimachinery.nic.in',
    supportedStates: ['Pan-India', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
    createdDate: '2024-01-23T00:00:00.000Z'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c010',
    name: 'Agriculture Infrastructure Fund (AIF)',
    code: 'AIF',
    category: 'Credit & Subsidy',
    description: 'Medium to long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.',
    benefits: ['3% interest subvention per annum up to Rs. 2 Crores loan', 'Credit guarantee coverage under CGTMSE for loans up to Rs. 2 Crores', 'Loan repayment tenure up to 7 years'],
    eligibilityCriteria: {
      maxLandSizeAcres: 100,
      minLandSizeAcres: 0,
      eligibleCategories: ['General', 'OBC', 'SC', 'ST'],
      eligibleStates: ['Pan-India']
    },
    requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Detailed Project Report (DPR)', 'Bank Account Statement', 'Land Record / Lease Deed'],
    deadline: '2026-12-31',
    officialUrl: 'https://agriinfra.dac.gov.in',
    supportedStates: ['Pan-India'],
    createdDate: '2024-01-24T00:00:00.000Z'
  }
];

class MockServer {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.users = new Map(); // token -> user
    this.profiles = new Map(); // userId -> profile
    this.schemes = [...SEED_SCHEMES];
    this.chatHistory = new Map(); // userId -> array of messages
    this.documents = new Map(); // documentId -> doc object
    this.checklists = new Map(); // userId_schemeId -> checklist object
    this.bookmarks = new Map(); // userId -> Set of schemeIds
    this.notifications = new Map(); // userId -> array of notifications

    // Create a default seed user
    const defaultUserId = 'user_seed_001';
    const defaultToken = 'jwt_test_token_valid_001';
    this.users.set(defaultToken, { _id: defaultUserId, phone: '9876543210', role: 'farmer' });
    this.profiles.set(defaultUserId, {
      userId: defaultUserId,
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
    });
    this.bookmarks.set(defaultUserId, new Set());
    this.notifications.set(defaultUserId, [
      { id: 'notif_01', title: 'Welcome to KrishiSahayak', message: 'Explore government schemes tailored to your profile.', read: false, createdAt: new Date().toISOString() },
      { id: 'notif_02', title: 'PM-KISAN Deadline Reminder', message: 'Complete your eKYC before the next installment cutoff.', read: false, createdAt: new Date().toISOString() }
    ]);
  }

  // --- Dispatcher Router ---
  async handleRequest(method, path, body = {}, headers = {}, query = {}) {
    const authHeader = headers['authorization'] || headers['Authorization'];
    let user = null;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      user = this.users.get(token);
    }

    const cleanPath = path.split('?')[0];

    // Auth Routes
    if (cleanPath === '/api/auth/send-otp' && method === 'POST') {
      return this.sendOtp(body);
    }
    if (cleanPath === '/api/auth/verify-otp' && method === 'POST') {
      return this.verifyOtp(body);
    }
    if (cleanPath === '/api/auth/google' && method === 'POST') {
      return this.googleAuth(body);
    }
    if (cleanPath === '/api/auth/logout' && method === 'POST') {
      return this.requireAuth(user, () => this.logout(token));
    }
    if (cleanPath === '/api/auth/account' && method === 'DELETE') {
      return this.requireAuth(user, () => this.deleteAccount(user._id, token));
    }

    // Profile Routes
    if (cleanPath === '/api/profile' && method === 'GET') {
      return this.requireAuth(user, () => this.getProfile(user._id));
    }
    if (cleanPath === '/api/profile' && method === 'PUT') {
      return this.requireAuth(user, () => this.updateProfile(user._id, body));
    }

    // Scheme Routes
    if (cleanPath === '/api/schemes' && method === 'GET') {
      return this.getSchemes(query);
    }
    if (cleanPath.startsWith('/api/schemes/') && method === 'GET') {
      const schemeId = cleanPath.split('/api/schemes/')[1];
      return this.getSchemeById(schemeId);
    }

    // Eligibility Routes
    if (cleanPath === '/api/eligibility/check' && method === 'POST') {
      return this.checkEligibility(body, user);
    }
    if (cleanPath === '/api/eligibility/recommendations' && method === 'GET') {
      return this.requireAuth(user, () => this.getRecommendations(user._id));
    }

    // Chat Routes
    if (cleanPath === '/api/chat' && method === 'POST') {
      return this.requireAuth(user, () => this.sendChatMessage(user._id, body));
    }
    if (cleanPath === '/api/chat/history' && method === 'GET') {
      return this.requireAuth(user, () => this.getChatHistory(user._id));
    }

    // Document Routes
    if (cleanPath === '/api/documents/upload' && method === 'POST') {
      return this.requireAuth(user, () => this.uploadDocument(user._id, body));
    }
    if (cleanPath.startsWith('/api/documents/') && method === 'GET') {
      const docId = cleanPath.split('/api/documents/')[1];
      return this.requireAuth(user, () => this.getDocumentById(docId));
    }

    // Checklist Routes
    if (cleanPath.startsWith('/api/checklists/') && method === 'GET') {
      const schemeId = cleanPath.split('/api/checklists/')[1];
      return this.requireAuth(user, () => this.getChecklist(user._id, schemeId));
    }
    if (cleanPath.startsWith('/api/checklists/') && method === 'PUT') {
      const schemeId = cleanPath.split('/api/checklists/')[1];
      return this.requireAuth(user, () => this.updateChecklist(user._id, schemeId, body));
    }

    // Bookmark Routes
    if (cleanPath === '/api/bookmarks' && method === 'GET') {
      return this.requireAuth(user, () => this.getBookmarks(user._id));
    }
    if (cleanPath === '/api/bookmarks' && method === 'POST') {
      return this.requireAuth(user, () => this.addBookmark(user._id, body));
    }
    if (cleanPath.startsWith('/api/bookmarks/') && method === 'DELETE') {
      const schemeId = cleanPath.split('/api/bookmarks/')[1];
      return this.requireAuth(user, () => this.deleteBookmark(user._id, schemeId));
    }

    // Notification Routes
    if (cleanPath === '/api/notifications' && method === 'GET') {
      return this.requireAuth(user, () => this.getNotifications(user._id));
    }
    if (cleanPath.startsWith('/api/notifications/') && cleanPath.endsWith('/read') && method === 'PUT') {
      const parts = cleanPath.split('/');
      const notifId = parts[3];
      return this.requireAuth(user, () => this.markNotificationRead(user._id, notifId));
    }

    return { status: 404, body: { error: 'Endpoint not found' } };
  }

  requireAuth(user, fn) {
    if (!user) {
      return { status: 401, body: { error: 'Unauthorized: Invalid or missing token' } };
    }
    return fn();
  }

  // --- Auth Handlers ---
  sendOtp(body) {
    const { phone } = body;
    if (!phone || typeof phone !== 'string') {
      return { status: 400, body: { error: 'Phone number is required' } };
    }
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return { status: 400, body: { error: 'Invalid 10-digit Indian phone number format' } };
    }
    return { status: 200, body: { success: true, message: `OTP sent successfully to ${cleanPhone}` } };
  }

  verifyOtp(body) {
    const { phone, otp } = body;
    if (!phone || !otp) {
      return { status: 400, body: { error: 'Phone and OTP are required' } };
    }
    if (!/^\d{10}$/.test(phone)) {
      return { status: 400, body: { error: 'Invalid phone number format' } };
    }
    if (otp !== '123456') {
      return { status: 401, body: { error: 'Invalid OTP code' } };
    }
    const userId = 'usr_' + crypto.createHash('md5').update(phone).digest('hex').substring(0, 12);
    const token = 'jwt_token_' + crypto.randomBytes(16).toString('hex');
    
    const userObj = { _id: userId, phone, role: 'farmer' };
    this.users.set(token, userObj);
    const profileExists = this.profiles.has(userId);

    return {
      status: 200,
      body: {
        token,
        user: userObj,
        profileCompleted: profileExists
      }
    };
  }

  googleAuth(body) {
    const { idToken } = body;
    if (!idToken || typeof idToken !== 'string' || idToken.trim().length === 0) {
      return { status: 400, body: { error: 'Google ID token is required' } };
    }
    if (idToken === 'invalid_google_token') {
      return { status: 401, body: { error: 'Invalid Google token' } };
    }
    const userId = 'usr_g_' + crypto.createHash('md5').update(idToken).digest('hex').substring(0, 10);
    const token = 'jwt_token_' + crypto.randomBytes(16).toString('hex');
    const userObj = { _id: userId, email: 'farmer@google.com', role: 'farmer' };
    
    this.users.set(token, userObj);
    return {
      status: 200,
      body: {
        token,
        user: userObj,
        profileCompleted: this.profiles.has(userId)
      }
    };
  }

  logout(token) {
    this.users.delete(token);
    return { status: 200, body: { success: true, message: 'Logged out successfully' } };
  }

  deleteAccount(userId, token) {
    this.users.delete(token);
    this.profiles.delete(userId);
    this.chatHistory.delete(userId);
    this.bookmarks.delete(userId);
    this.notifications.delete(userId);
    return { status: 200, body: { success: true, message: 'Account and associated data deleted permanently' } };
  }

  // --- Profile Handlers ---
  getProfile(userId) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { status: 404, body: { error: 'Profile not found' } };
    }
    return { status: 200, body: { profile } };
  }

  updateProfile(userId, body) {
    if (body.landSize !== undefined) {
      if (typeof body.landSize !== 'number' || isNaN(body.landSize) || body.landSize < 0) {
        return { status: 400, body: { error: 'Land size must be a non-negative number in acres' } };
      }
    }
    if (body.name && body.name.length > 500) {
      return { status: 400, body: { error: 'Name field exceeds maximum allowed character length' } };
    }

    const existing = this.profiles.get(userId) || { userId };
    const updated = {
      ...existing,
      ...body,
      userId,
      updatedAt: new Date().toISOString()
    };
    this.profiles.set(userId, updated);
    return { status: 200, body: { profile: updated } };
  }

  // --- Scheme Handlers ---
  getSchemes(query = {}) {
    let result = [...this.schemes];

    if (query.search) {
      const q = String(query.search).toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    if (query.category) {
      const cat = String(query.category).toLowerCase();
      result = result.filter(s => s.category.toLowerCase() === cat);
    }

    if (query.state) {
      const st = String(query.state).toLowerCase();
      result = result.filter(s => 
        s.supportedStates.map(x => x.toLowerCase()).includes('pan-india') ||
        s.supportedStates.map(x => x.toLowerCase()).includes(st)
      );
    }

    // Sort
    if (query.sort === 'deadline') {
      result.sort((a, b) => (a.deadline || 'Z').localeCompare(b.deadline || 'Z'));
    } else if (query.sort === 'newest') {
      result.sort((a, b) => b.createdDate.localeCompare(a.createdDate));
    }

    // Pagination
    const page = query.page !== undefined ? parseInt(query.page, 10) : 1;
    const limit = query.limit !== undefined ? parseInt(query.limit, 10) : 10;
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return { status: 400, body: { error: 'Invalid page or limit pagination parameters' } };
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      status: 200,
      body: {
        schemes: paginated,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }

  getSchemeById(id) {
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return { status: 400, body: { error: 'Invalid scheme ID format. Expected 24-character hexadecimal ObjectId' } };
    }
    const scheme = this.schemes.find(s => s._id === id);
    if (!scheme) {
      return { status: 404, body: { error: 'Scheme not found' } };
    }
    return { status: 200, body: { scheme } };
  }

  // --- Eligibility Handlers ---
  checkEligibility(body, user) {
    const { schemeId, farmerProfile } = body;
    if (!schemeId) {
      return { status: 400, body: { error: 'schemeId is required' } };
    }
    const scheme = this.schemes.find(s => s._id === schemeId);
    if (!scheme) {
      return { status: 404, body: { error: 'Scheme not found' } };
    }

    let profile = farmerProfile;
    if (!profile && user) {
      profile = this.profiles.get(user._id);
    }
    if (!profile) {
      return { status: 400, body: { error: 'Farmer profile details are required for eligibility check' } };
    }

    const rules = scheme.eligibilityCriteria;
    const reasons = [];
    let score = 100;
    let status = 'eligible';

    // Land size check
    if (profile.landSize !== undefined) {
      if (rules.maxLandSizeAcres && profile.landSize > rules.maxLandSizeAcres) {
        status = 'not_eligible';
        score -= 60;
        reasons.push(`Land size of ${profile.landSize} acres exceeds scheme maximum limit of ${rules.maxLandSizeAcres} acres.`);
      } else if (rules.minLandSizeAcres && profile.landSize < rules.minLandSizeAcres) {
        status = 'not_eligible';
        score -= 50;
        reasons.push(`Land size of ${profile.landSize} acres is below scheme minimum limit of ${rules.minLandSizeAcres} acres.`);
      } else {
        reasons.push(`Land size of ${profile.landSize} acres is within eligible threshold.`);
      }
    }

    // Category check
    if (profile.category && rules.eligibleCategories) {
      if (rules.eligibleCategories.includes('Pan-India') || rules.eligibleCategories.includes(profile.category)) {
        reasons.push(`Category '${profile.category}' is eligible.`);
      }
    }

    // State check
    if (profile.state && rules.eligibleStates) {
      if (rules.eligibleStates.includes('Pan-India') || rules.eligibleStates.map(s => s.toLowerCase()).includes(profile.state.toLowerCase())) {
        reasons.push(`State '${profile.state}' is supported.`);
      } else {
        status = status === 'eligible' ? 'partially_eligible' : status;
        score -= 30;
        reasons.push(`Scheme is not active in state '${profile.state}'.`);
      }
    }

    if (score < 50) {
      status = 'not_eligible';
    } else if (score < 90 && status === 'eligible') {
      status = 'partially_eligible';
    }

    return {
      status: 200,
      body: {
        status,
        score: Math.max(0, score),
        reasons,
        missingDocuments: scheme.requiredDocuments || []
      }
    };
  }

  getRecommendations(userId) {
    const profile = this.profiles.get(userId);
    if (!profile) {
      return { status: 200, body: { recommendations: [] } };
    }

    const recs = this.schemes.map(scheme => {
      const evalRes = this.checkEligibility({ schemeId: scheme._id, farmerProfile: profile }, { _id: userId }).body;
      return {
        scheme,
        status: evalRes.status,
        score: evalRes.score,
        reasons: evalRes.reasons
      };
    }).sort((a, b) => b.score - a.score);

    return { status: 200, body: { recommendations: recs } };
  }

  // --- Chat Handlers ---
  sendChatMessage(userId, body) {
    const { message, conversationId } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return { status: 400, body: { error: 'Message text is required and cannot be empty' } };
    }

    const convId = conversationId || 'conv_' + Date.now();
    const history = this.chatHistory.get(userId) || [];

    const q = message.toLowerCase();
    const matchedSchemes = this.schemes.filter(s => {
      const code = s.code.toLowerCase();
      const cat = s.category.toLowerCase();
      return q.includes(code) ||
             q.includes(cat) ||
             (code === 'pm-kisan' && (q.includes('kisan') || q.includes('2000') || q.includes('samman'))) ||
             (code === 'pmfby' && (q.includes('insurance') || q.includes('fasal') || q.includes('crop'))) ||
             (code === 'kcc' && (q.includes('credit') || q.includes('kcc') || q.includes('card') || q.includes('loan'))) ||
             (code === 'smam' && (q.includes('mechanization') || q.includes('tractor') || q.includes('machinery') || q.includes('smam'))) ||
             (code === 'pmksy' && (q.includes('irrigation') || q.includes('water') || q.includes('pump') || q.includes('sinchai'))) ||
             (code === 'pkvy' && (q.includes('organic') || q.includes('pkvy')));
    });

    let reply = `Based on government scheme data, KrishiSahayak assistance for "${message}": `;
    if (matchedSchemes.length > 0) {
      reply += `We found ${matchedSchemes.length} matching scheme(s) including ${matchedSchemes[0].name}. ${matchedSchemes[0].benefits[0]}.`;
    } else {
      reply += `You can explore top central schemes like PM-KISAN (direct benefit transfer) or PM Fasal Bima Yojana (crop insurance) on our platform.`;
    }

    const userMsg = { sender: 'user', text: message, timestamp: new Date().toISOString() };
    const botMsg = { sender: 'bot', text: reply, timestamp: new Date().toISOString(), relevantSchemes: matchedSchemes };

    history.push(userMsg, botMsg);
    this.chatHistory.set(userId, history);

    return {
      status: 200,
      body: {
        reply,
        conversationId: convId,
        suggestedPrompts: [
          'Am I eligible for PM-KISAN?',
          'What documents are needed for crop insurance?',
          'How to apply for solar pump subsidy?'
        ],
        relevantSchemes: matchedSchemes
      }
    };
  }

  getChatHistory(userId) {
    const messages = this.chatHistory.get(userId) || [];
    return { status: 200, body: { messages } };
  }

  // --- Document Handlers ---
  uploadDocument(userId, body) {
    const { fileName, fileContent, mimeType } = body;
    if (fileName === undefined || fileContent === undefined || fileContent === null) {
      return { status: 400, body: { error: 'fileName and fileContent payload are required' } };
    }
    const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (mimeType && !allowedMime.includes(mimeType)) {
      return { status: 400, body: { error: 'Invalid file format. Supported types: PNG, JPEG, PDF' } };
    }
    if (typeof fileContent === 'string' && fileContent.length === 0) {
      return { status: 400, body: { error: 'Empty file provided' } };
    }

    const docId = 'doc_' + crypto.randomBytes(8).toString('hex');
    const extractedText = `OCR Extracted Content from ${fileName}: Government Farmer Identity Record / Land Khatauni details. Owner: Farmer User. Survey No: 402/1. Land Area: 1.5 Acres.`;

    const summary = {
      benefits: ['Eligible for PM-KISAN installment transfer', 'Valid land ownership proof for KCC loan up to Rs. 1.6 Lakhs'],
      eligibility: ['Land area certified under 2 hectares', 'Clear land title without encumbrance'],
      requiredDocuments: ['Aadhaar Card', 'Bank Passbook'],
      deadlines: ['2026-12-31']
    };

    const docObj = { documentId: docId, userId, fileName, extractedText, summary, uploadedAt: new Date().toISOString() };
    this.documents.set(docId, docObj);

    return {
      status: 200,
      body: {
        documentId: docId,
        extractedText,
        summary
      }
    };
  }

  getDocumentById(docId) {
    const doc = this.documents.get(docId);
    if (!doc) {
      return { status: 404, body: { error: 'Document not found' } };
    }
    return { status: 200, body: { document: doc } };
  }

  // --- Checklist Handlers ---
  getChecklist(userId, schemeId) {
    const key = `${userId}_${schemeId}`;
    const scheme = this.schemes.find(s => s._id === schemeId);
    if (!scheme) {
      return { status: 404, body: { error: 'Scheme not found' } };
    }

    let checklist = this.checklists.get(key);
    if (!checklist) {
      const items = scheme.requiredDocuments.map(docName => ({
        docName,
        completed: false
      }));
      checklist = { schemeId, items, completionPercentage: 0 };
      this.checklists.set(key, checklist);
    }
    return { status: 200, body: checklist };
  }

  updateChecklist(userId, schemeId, body) {
    const { itemIndex, completed } = body;
    const scheme = this.schemes.find(s => s._id === schemeId);
    if (!scheme) {
      return { status: 404, body: { error: 'Scheme not found' } };
    }

    const key = `${userId}_${schemeId}`;
    let checklist = this.checklists.get(key);
    if (!checklist) {
      const items = scheme.requiredDocuments.map(docName => ({ docName, completed: false }));
      checklist = { schemeId, items, completionPercentage: 0 };
    }

    if (itemIndex === undefined || itemIndex < 0 || itemIndex >= checklist.items.length) {
      return { status: 400, body: { error: `Invalid itemIndex ${itemIndex}. Must be between 0 and ${checklist.items.length - 1}` } };
    }

    checklist.items[itemIndex].completed = Boolean(completed);
    const completedCount = checklist.items.filter(i => i.completed).length;
    checklist.completionPercentage = Math.round((completedCount / checklist.items.length) * 100);

    this.checklists.set(key, checklist);
    return { status: 200, body: checklist };
  }

  // --- Bookmark Handlers ---
  getBookmarks(userId) {
    const set = this.bookmarks.get(userId) || new Set();
    const bookmarkedSchemes = this.schemes.filter(s => set.has(s._id));
    return { status: 200, body: { bookmarks: bookmarkedSchemes } };
  }

  addBookmark(userId, body) {
    const { schemeId } = body;
    if (!schemeId) {
      return { status: 400, body: { error: 'schemeId is required' } };
    }
    const scheme = this.schemes.find(s => s._id === schemeId);
    if (!scheme) {
      return { status: 404, body: { error: 'Scheme not found' } };
    }

    let set = this.bookmarks.get(userId);
    if (!set) {
      set = new Set();
      this.bookmarks.set(userId, set);
    }
    set.add(schemeId);

    return { status: 200, body: { success: true, message: 'Scheme bookmarked successfully', schemeId } };
  }

  deleteBookmark(userId, schemeId) {
    const set = this.bookmarks.get(userId);
    if (!set || !set.has(schemeId)) {
      return { status: 404, body: { error: 'Bookmark not found' } };
    }
    set.delete(schemeId);
    return { status: 200, body: { success: true, message: 'Bookmark removed successfully' } };
  }

  // --- Notification Handlers ---
  getNotifications(userId) {
    let notifs = this.notifications.get(userId);
    if (!notifs) {
      notifs = [
        { id: 'notif_01_' + userId, title: 'Welcome to KrishiSahayak', message: 'Explore government schemes tailored to your profile.', read: false, createdAt: new Date().toISOString() },
        { id: 'notif_02_' + userId, title: 'Scheme Application Alert', message: 'Keep your document checklist up to date for ongoing application deadlines.', read: false, createdAt: new Date().toISOString() }
      ];
      this.notifications.set(userId, notifs);
    }
    const unreadCount = notifs.filter(n => !n.read).length;
    return { status: 200, body: { notifications: notifs, unreadCount } };
  }

  markNotificationRead(userId, notifId) {
    let notifs = this.notifications.get(userId);
    if (!notifs) {
      this.getNotifications(userId);
      notifs = this.notifications.get(userId);
    }
    const notif = notifs.find(n => n.id === notifId);
    if (!notif) {
      return { status: 404, body: { error: 'Notification not found' } };
    }
    notif.read = true;
    const unreadCount = notifs.filter(n => !n.read).length;
    return { status: 200, body: { success: true, notification: notif, unreadCount } };
  }
}

module.exports = new MockServer();
