# KrishiSahayak Project Context

## Project Overview
KrishiSahayak is an AI-powered government scheme assistant web application for Indian farmers built using:
- **Frontend**: React (SPA), mobile-first responsive design, green (#2E7D32) / white / amber (#F9A825) Material 3 styling (custom components, no third-party UI framework like MUI/Antd), Web Speech API for voice interactions.
- **Backend**: Node.js + Express REST API server, JWT authentication, express-validator/Joi, rate-limiting, CORS, error handling.
- **Database**: MongoDB with Mongoose ODM.
- **AI & Document Intelligence**: Google Gemini API (@google/generative-ai) with RAG scheme context injection, tesseract.js for image OCR, pdf-parse for PDF parsing, AI document summary.

## Core Features & Requirements
1. **Frontend Screens (16+)**:
   - Landing page, Login (phone+OTP, Google sign-in), Registration (farmer profile details)
   - Dashboard (personalized recommendations, eligibility summary, notifications, quick actions)
   - Scheme Browser (search, category/state/deadline filters, sorting, pagination)
   - Scheme Detail (full scheme info, required docs, external link warning dialog for official URL)
   - Eligibility Checker (form input matched against scheme rules, eligible/partial/not status with reasons)
   - AI Chat (Gemini AI RAG chat, suggested prompts, history, Web Speech STT/TTS buttons)
   - PDF/Image Explainer (file drop zone, OCR text view, AI summary with highlighted sections)
   - Document Checklist (auto-generated from scheme required docs, progress tracking)
   - Voice Assistant (microphone button for STT search/chat, TTS read-aloud buttons)
   - Notifications, Profile (view/edit), Settings (language, notifications, delete account), Bookmarks, Search.

2. **Backend REST API**:
   - `/api/auth` (send-otp, verify-otp, google, logout, account deletion)
   - `/api/profile` (GET/PUT)
   - `/api/schemes` (GET list with search/filter/sort/pagination, GET :id)
   - `/api/eligibility` (check eligibility, get recommendations)
   - `/api/chat` (POST message with Gemini RAG, GET history)
   - `/api/documents` (upload file with OCR & AI summary, GET :id)
   - `/api/checklists` (GET/PUT per scheme)
   - `/api/bookmarks` (GET/POST/DELETE)
   - `/api/notifications` (GET, PUT :id/read)

3. **Database & Seed Data**:
   - Schemas: User, FarmerProfile, Scheme, ChatMessage, Document, Checklist, Bookmark, Notification.
   - Seed script (`npm run seed`) populating 10 real schemes: PM-KISAN, PM Fasal Bima, KCC, PMKSY, Soil Health Card, PKVY, NMSA, RKVY, SMAM, AIF.

4. **Auth & Security**:
   - Dev OTP bypass: '123456' accepted, send-otp succeeds. SMS service abstraction module ready for Twilio/MSG91.
   - Google ID token verification via google-auth-library.
   - JWT token auth middleware on protected routes.
   - Environment variable management (.env / .env.example).
