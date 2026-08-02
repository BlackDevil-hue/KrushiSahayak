## 2026-07-31T22:35:26+05:30

<USER_REQUEST>
You are the Backend & Database Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\worker_backend_m2.
Create your working directory D:\KrishiSahayak\.agents\worker_backend_m2 and initialize progress.md.

Task Objective:
Initialize the Node.js/Express backend, Mongoose database schemas, and populate MongoDB with 10 real Indian agricultural schemes via a seed script.

Instructions:
1. Create directory D:\KrishiSahayak\backend.
2. Initialize package.json with dependencies: `express`, `mongoose`, `dotenv`, `cors`, `morgan`, `jsonwebtoken`, `express-validator`, `@google/generative-ai`, `tesseract.js`, `pdf-parse`, `multer`, `google-auth-library`, `express-rate-limit`.
3. Create D:\KrishiSahayak\backend\src\config\db.js supporting MongoDB connection string via Mongoose, with graceful error handling and environment fallback.
4. Define Mongoose schemas in D:\KrishiSahayak\backend\src\models\:
   - User.js (phone, Google ID, email, role, timestamps)
   - FarmerProfile.js (user ref, name, phone, state, district, cropTypes array, landSizeAcres, incomeBracket, category SC/ST/OBC/General, gender, age, farmerType smallholder/marginal/medium/large)
   - Scheme.js (name, description [2-3 paragraphs], benefits array, eligibilityRules object/array, requiredDocuments array, deadline, applicationUrl, category, supportedStates array, lastUpdated)
   - ChatMessage.js (userId, conversationId, role, content, relevantSchemes, timestamp)
   - Document.js (userId, fileName, fileType, fileUrl, extractedText, summary object: benefits, eligibility, requiredDocuments, deadlines)
   - Checklist.js (userId, schemeId, items array: documentName, completed)
   - Bookmark.js (userId, schemeId, createdAt)
   - Notification.js (userId, title, message, type, read, createdAt)
5. Create seed script `D:\KrishiSahayak\backend\scripts\seedSchemes.js` and add `npm run seed` script to package.json.
   Seed 10 real Indian agricultural schemes with accurate descriptions, eligibility rules, and required documents:
   1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
   2. PM Fasal Bima Yojana (Crop Insurance)
   3. Kisan Credit Card (KCC)
   4. PM Krishi Sinchai Yojana (Irrigation)
   5. Soil Health Card Scheme
   6. Paramparagat Krishi Vikas Yojana (Organic Farming)
   7. National Mission on Sustainable Agriculture
   8. Rashtriya Krishi Vikas Yojana
   9. Sub-Mission on Agricultural Mechanization
   10. Agriculture Infrastructure Fund
6. Create `D:\KrishiSahayak\backend\.env.example` with PORT, MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, GOOGLE_CLIENT_ID.
7. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All schemas and seed data must be authentic and fully populated.
8. Test model loading / seed script syntax, document results in handoff.md inside D:\KrishiSahayak\.agents\worker_backend_m2. Send a message to parent when done.
</USER_REQUEST>
