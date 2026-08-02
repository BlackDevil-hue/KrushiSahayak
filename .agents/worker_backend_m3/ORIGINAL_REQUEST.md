## 2026-07-31T22:37:35Z

You are the Backend API Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\worker_backend_m3.
Create your working directory D:\KrishiSahayak\.agents\worker_backend_m3 and initialize progress.md.

Task Objective:
Build the complete REST API server (server.js, routes, controllers, middleware, services) for Auth, Farmer Profile, Schemes Browser, Eligibility Engine, Bookmarks, and Notifications.

Instructions:
1. Create `D:\KrishiSahayak\backend\server.js`:
   - Express app initialization, CORS, morgan, express.json body parser, rate limiting, error middleware.
   - Root GET `/` health status route.
2. Implement services in `D:\KrishiSahayak\backend\src\services\`:
   - `smsService.js`: OTP send logic (dev bypass log + provider abstraction interface for Twilio/MSG91).
   - `googleAuthService.js`: Google ID token verification via google-auth-library OAuth2Client (with mock bypass for test tokens).
   - `eligibilityEngine.js`: Matching function `evaluateEligibility(farmerProfile, scheme)` that checks land size, crop types, income, category, gender, age, farmer type against `scheme.eligibilityRules`. Returns `{ status: 'eligible'|'partially_eligible'|'not_eligible', score: number, reasons: Array, missingDocuments: Array }`.
3. Implement middleware in `D:\KrishiSahayak\backend\src\middleware\`:
   - `authMiddleware.js`: Verify JWT from `Authorization: Bearer <token>` or cookie. Return 401 on failure. Attach `req.user`.
   - `validationMiddleware.js`: express-validator result handler.
   - `errorMiddleware.js`: Centralized error handler returning JSON response.
4. Implement controllers and routes in `D:\KrishiSahayak\backend\src\`:
   - Auth (`routes/authRoutes.js`, `controllers/authController.js`):
     - POST `/api/auth/send-otp` (returns `{ success: true, message: "OTP sent" }`)
     - POST `/api/auth/verify-otp` (dev bypass: accepts code '123456', issues JWT, creates/finds User & FarmerProfile)
     - POST `/api/auth/google` (exchanges idToken, issues JWT, returns User)
     - POST `/api/auth/logout` (invalidates session/headers)
     - DELETE `/api/auth/account` (removes user, profile, chats, documents, bookmarks, notifications)
   - Profile (`routes/profileRoutes.js`, `controllers/profileController.js`):
     - GET `/api/profile`, PUT `/api/profile`
   - Schemes (`routes/schemeRoutes.js`, `controllers/schemeController.js`):
     - GET `/api/schemes` (search text, category filter, state filter, deadline status, sorting: newest/deadline/relevance, pagination: page/limit)
     - GET `/api/schemes/:id`
   - Eligibility (`routes/eligibilityRoutes.js`, `controllers/eligibilityController.js`):
     - POST `/api/eligibility/check` (evaluate specific scheme against user profile or request body)
     - GET `/api/eligibility/recommendations` (returns top scheme recommendations for logged-in farmer)
   - Bookmarks (`routes/bookmarkRoutes.js`, `controllers/bookmarkController.js`):
     - GET `/api/bookmarks`, POST `/api/bookmarks`, DELETE `/api/bookmarks/:schemeId`
   - Notifications (`routes/notificationRoutes.js`, `controllers/notificationController.js`):
     - GET `/api/notifications`, PUT `/api/notifications/:id/read`
5. Connect all routes in `server.js`.
6. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All endpoints and eligibility evaluation logic must be authentic and fully functional.
7. Verify server route definitions via node evaluation script. Document results in handoff.md inside D:\KrishiSahayak\.agents\worker_backend_m3. Send a message to parent when done.
