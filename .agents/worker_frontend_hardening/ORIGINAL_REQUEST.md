## 2026-07-31T17:16:00Z
You are the Frontend Hardening Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\worker_frontend_hardening.
Create your working directory D:\KrishiSahayak\.agents\worker_frontend_hardening and initialize progress.md.

Task Objective:
Apply the 3 resilience & hardening fixes reported by the Frontend Challenger in D:\KrishiSahayak\frontend\src\:

Instructions:
1. In `D:\KrishiSahayak\frontend\src\context\AuthContext.jsx`:
   - Wrap `localStorage.getItem('krishi_user')` and `localStorage.getItem('krishi_profile')` `JSON.parse` calls in `try...catch` blocks to prevent white-screen crashes if local storage contains invalid/corrupt JSON.
2. In `D:\KrishiSahayak\frontend\src\services\schemeData.js`:
   - In `getBookmarkedSchemeIds()`: ensure returned bookmarks is validated with `Array.isArray()` before calling `includes()`, falling back to `[]` if invalid/corrupt.
   - In `evaluateEligibility(farmerProfile, scheme)`: ensure land size input is clamped/validated (`Math.max(0, parseFloat(farmerProfile.landSizeAcres || 0))`) to prevent negative land sizes from passing eligibility rules with positive messages.
3. In `D:\KrishiSahayak\frontend\src\services\speechService.js`:
   - Safely wrap SpeechRecognition instantiation in `try...catch` to prevent throws in restricted environments.
4. Execute `npm run build` in `D:\KrishiSahayak\frontend` to confirm clean build with 0 errors.
5. Document changes in handoff.md inside D:\KrishiSahayak\.agents\worker_frontend_hardening. Send a message to parent when done.
