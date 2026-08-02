# Original User Request

## Initial Request — 2026-07-31T17:04:36Z

Build KrishiSahayak, an AI-powered government scheme assistant for Indian farmers. This is a production-ready MVP web application using React frontend, Node.js/Express backend, and MongoDB database. The app helps farmers discover government agricultural schemes, check eligibility based on their profile, get AI-powered guidance via chat, upload documents for OCR and AI analysis, generate document checklists, and use voice features — all through a farmer-friendly, mobile-first interface.

Working directory: D:\KrishiSahayak
Integrity mode: development

## Requirements

### R1. Web Application Frontend (React)

Build a complete React single-page application with a green (#2E7D32) / white / amber (#F9A825) Material 3-inspired design system. The app must include these screens, all fully functional and polished:

- Landing page with value proposition, feature overview, and CTA
- Login with phone number + OTP entry and Google sign-in button
- Registration form collecting farmer profile (name, phone, state, district, crop types, land size in acres, income bracket, category SC/ST/OBC/General, gender, age, farmer type smallholder/marginal/medium/large)
- Dashboard showing personalized scheme recommendations, eligibility summary, recent notifications, and quick actions
- Scheme browser with search bar, filters (category, state, deadline status), sorting (newest, deadline, relevance), and pagination
- Scheme detail page showing full scheme info — name, description, benefits, eligibility criteria, required documents, deadline, official application link (with external link warning dialog), category, supported states/districts
- Eligibility checker — form-based input that matches farmer profile against scheme rules, showing eligible/partially eligible/not eligible with reasons, missing documents, and recommendation score
- AI chat — conversational interface for scheme questions, with message history, typing indicator, suggested follow-up prompts
- PDF/image explainer — upload area for PDFs/images, showing OCR extracted text, AI-generated summary with highlighted benefits/eligibility/documents/deadlines
- Document checklist — auto-generated from scheme requirements, showing required/completed/pending documents with progress bar
- Voice assistant — microphone button for speech-to-text queries, text-to-speech for reading responses aloud
- Notifications — list of scheme alerts, deadline reminders, eligibility updates
- Profile — view/edit farmer profile
- Settings — language preference, notification preferences, account deletion
- Bookmarks — saved schemes list
- Search — full-text search across schemes

Design rules: mobile-first responsive (360px to 1440px), large readable typography (minimum 16px body), rounded cards (12px border-radius), strong spacing (16px/24px grid), accessible contrast (WCAG AA), bottom navigation on mobile / sidebar on desktop, skeleton loading states, empty states, error states. All original code — no UI library like MUI or Ant Design.

### R2. Backend API (Node.js + Express)

Build a complete REST API server with this structure:
```
backend/
  src/
    controllers/    # Route handlers
    services/       # Business logic
    models/         # Mongoose schemas
    routes/         # Express routers
    middleware/     # Auth, validation, error handling
    utils/          # Helpers, constants
    config/         # DB connection, env config
  .env.example
  package.json
  server.js
```

API endpoints:
- POST /api/auth/send-otp — send OTP to phone (dev bypass: always succeeds)
- POST /api/auth/verify-otp — verify OTP and return JWT (dev bypass: accept '123456')
- POST /api/auth/google — Google OAuth token exchange
- POST /api/auth/logout — invalidate session
- DELETE /api/auth/account — delete account and all data
- GET/PUT /api/profile — get/update farmer profile
- GET /api/schemes — list schemes with search, filter, sort, pagination
- GET /api/schemes/:id — get scheme details
- POST /api/eligibility/check — check eligibility for a scheme given farmer profile
- GET /api/eligibility/recommendations — get recommended schemes for current user
- POST /api/chat — send message to AI chat, receive response
- GET /api/chat/history — get chat history
- POST /api/documents/upload — upload PDF/image, run OCR, return extracted text + AI summary
- GET /api/documents/:id — get document with OCR results and summary
- GET /api/checklists/:schemeId — get/generate document checklist for a scheme
- PUT /api/checklists/:schemeId — update checklist item status
- GET/POST/DELETE /api/bookmarks — manage bookmarked schemes
- GET /api/notifications — get user notifications
- PUT /api/notifications/:id/read — mark notification as read

Use: JWT authentication middleware, request validation (express-validator or Joi), centralized error handling, request logging (morgan), CORS configuration, rate limiting, environment variables for all secrets/config.

### R3. Database (MongoDB) and Seed Data

Design Mongoose schemas for: User, FarmerProfile, Scheme (with embedded eligibility rules and required documents), ChatMessage, Document (with OCR results and AI summary), Checklist, Bookmark, Notification.

Critical: Seed the database with real Indian government agricultural schemes. Include at minimum these 10 schemes with accurate data:
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

Each scheme record must include: name, detailed description (2-3 paragraphs), benefits list, eligibility criteria (structured rules for the engine), required documents list, application deadline or "ongoing", official government application URL, category, supported states, last updated timestamp.

Create a seed script (npm run seed) that populates the database.

### R4. AI & Document Intelligence Features

AI Chat (Google Gemini API):
- Use @google/generative-ai npm package
- Implement RAG: when a user asks a question, search relevant schemes from MongoDB, inject as context into the Gemini prompt
- System prompt instructs the AI to answer in simple language, recommend relevant schemes, explain government jargon, and never invent facts
- Store conversation history in MongoDB, send recent history as context
- Support follow-up questions within a conversation

Document Analysis:
- Use tesseract.js for OCR on uploaded images
- Use pdf-parse for PDF text extraction
- Send extracted text to Gemini API for summarization with structured output: benefits, eligibility criteria, required documents, deadlines
- Store results in MongoDB linked to the document record

Voice Features:
- Use Web Speech API (SpeechRecognition for speech-to-text, SpeechSynthesis for text-to-speech) in the frontend
- Microphone button on chat and search interfaces
- Read-aloud button on scheme details and AI responses

Document Checklist:
- Auto-generate from scheme's required documents list
- Track completion status per user per scheme
- Calculate and display progress percentage

### R5. Authentication & Security

- Phone OTP flow: In development mode, OTP sending always succeeds and the code '123456' is always accepted. The architecture must be ready to swap in a real SMS provider (Twilio/MSG91) by implementing the SMS send in a dedicated service module
- Google OAuth: Use google-auth-library to verify Google ID tokens
- JWT tokens: Issue on successful auth, store in httpOnly cookies or Authorization header
- Auth middleware: Protect all routes except auth endpoints
- Profile persistence: Create/update farmer profile linked to authenticated user
- Account deletion: Remove all user data (profile, chats, documents, bookmarks, notifications)
- Environment variables: All secrets (JWT_SECRET, GEMINI_API_KEY, GOOGLE_CLIENT_ID, MONGODB_URI) in .env, documented in .env.example

## Acceptance Criteria

### Frontend
- [ ] Application starts with npm run dev and renders the landing page without console errors
- [ ] All 16+ screens are implemented and navigable (no placeholder/stub screens)
- [ ] Mobile layout (360px) and desktop layout (1440px) both render correctly
- [ ] Scheme list search returns filtered results, filters narrow the list, sort reorders it
- [ ] Scheme detail page displays all fields and has a working "Apply on Official Website" button with an external link warning dialog
- [ ] Eligibility checker form accepts farmer details and displays eligibility result with reasons

### Backend
- [ ] Server starts with npm start or npm run dev without errors
- [ ] POST /api/auth/send-otp + POST /api/auth/verify-otp with code '123456' returns a valid JWT
- [ ] GET /api/schemes returns paginated scheme data with search/filter support
- [ ] POST /api/eligibility/check returns structured eligibility result (eligible/partial/not with reasons)
- [ ] POST /api/chat returns an AI-generated response using Gemini API with scheme context
- [ ] POST /api/documents/upload accepts a file and returns OCR text + AI summary
- [ ] All protected routes return 401 without valid JWT

### Integration
- [ ] End-to-end flow works: register → login → browse schemes → check eligibility → chat with AI → bookmark scheme → view notifications
- [ ] File upload from frontend reaches backend, processes, and returns results displayed in UI
- [ ] Chat messages persist across page refreshes (loaded from backend)
- [ ] Bookmarks persist across sessions

### Build & Run
- [ ] npm install succeeds in both /frontend and /backend directories
- [ ] npm run seed populates the database with 10 real Indian agricultural schemes
- [ ] Both servers start without errors and the full application is usable
- [ ] .env.example files document all required environment variables
