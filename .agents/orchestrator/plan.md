# KrishiSahayak Detailed Execution Plan

## Objectives
Build a production-ready MVP of KrishiSahayak, an AI-powered government scheme assistant web application for Indian farmers, meeting all requirements R1 through R5 and satisfying all acceptance criteria in `ORIGINAL_REQUEST.md`.

## Execution Topology
Dual Track Orchestration:
1. **E2E Testing Track**: Dedicated testing subagent creates opaque-box E2E testing framework, test cases for Tiers 1-4 based directly on user requirements, and publishes `TEST_READY.md`.
2. **Implementation Track**:
   - Milestone 2: Backend setup, Mongoose schemas, DB connection & 10 real Indian scheme seed script.
   - Milestone 3: Auth (OTP bypass, Google OAuth, JWT) + Core REST APIs (Profile, Schemes, Eligibility Engine, Bookmarks, Notifications).
   - Milestone 4: Gemini AI RAG Chat service, tesseract.js/pdf-parse OCR + AI Document summary service, Document Checklist service.
   - Milestone 5: React SPA setup, Material 3 design system (Green #2E7D32, Amber #F9A825), mobile/desktop navigation, Auth & Profile screens.
   - Milestone 6: React Feature Screens (Dashboard, Schemes Browser/Detail, Eligibility Checker, AI Chat, OCR Explainer, Checklist, Bookmarks, Settings) & Web Speech API integration.
   - Milestone 7: Full Dual Track E2E Verification, Tier 5 Adversarial Coverage Hardening, and Forensic Audit Verification.

## Subagent Dispatch Plan
1. **E2E Testing Subagent**: Create `e2e-tests/` directory with test runner and comprehensive test suites covering all acceptance criteria and edge cases.
2. **Backend & Seed Data Worker**: Setup `/backend` package.json, server.js, Mongoose schemas, DB connection, and `scripts/seedSchemes.js` with 10 real schemes (PM-KISAN, PM Fasal Bima Yojana, Kisan Credit Card, PM Krishi Sinchai Yojana, Soil Health Card Scheme, Paramparagat Krishi Vikas Yojana, National Mission on Sustainable Agriculture, Rashtriya Krishi Vikas Yojana, Sub-Mission on Agricultural Mechanization, Agriculture Infrastructure Fund).
3. **Auth & Core API Worker**: Implement Express routes, controllers, services, middleware for Auth, Profile, Schemes, Eligibility Engine, Bookmarks, Notifications.
4. **AI & Intelligence Service Worker**: Implement Gemini AI chat service with RAG, document upload OCR (`tesseract.js` + `pdf-parse`) and AI summary, Checklist backend APIs.
5. **React Design & Auth UI Worker**: Setup `/frontend`, custom Material 3 styling (green/white/amber, no external UI library), responsive layout, landing page, login with OTP/Google, registration form.
6. **React Feature Screens & Speech Worker**: Implement all remaining screens (Dashboard, Schemes, Detail, Eligibility, Chat, Explainer, Checklist, Bookmarks, Profile, Settings) and Web Speech API (STT & TTS).
7. **Reviewer / Challenger / Auditor Subagents**: Verify build, correctness, security, integrity, and test pass rates.
