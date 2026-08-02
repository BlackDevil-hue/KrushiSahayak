## 2026-07-31T22:40:16Z
You are the Frontend Feature & Voice Integration Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\worker_frontend_m6.
Create your working directory D:\KrishiSahayak\.agents\worker_frontend_m6 and initialize progress.md.

Task Objective:
Implement Web Speech API voice services (STT & TTS) and all remaining React feature screens (Scheme Browser, Scheme Detail with External Link Warning, Eligibility Checker, AI Chat with Voice, PDF/Image OCR Explainer, Document Checklist with Progress, Bookmarks, Notifications, Settings, Profile, Search).

Instructions:
1. Build Web Speech API service in `D:\KrishiSahayak\frontend\src\services\speechService.js`:
   - Speech-to-text (STT) via window.SpeechRecognition / webkitSpeechRecognition for voice search and chat inputs.
   - Text-to-speech (TTS) via window.speechSynthesis for read-aloud functionality on scheme details and AI responses.
2. Build feature pages in `D:\KrishiSahayak\frontend\src\pages\`:
   - `SchemeBrowserPage.jsx`: Search bar with debounce, category filter, state filter, deadline status filter, sorting options, pagination, scheme card grid with bookmark toggle.
   - `SchemeDetailPage.jsx`: Full scheme information view (description, benefits, eligibility rules, required docs, deadline, category, states), "Apply on Official Website" button triggering `ExternalLinkModal` warning dialog, bookmark button, generate checklist button.
   - `EligibilityPage.jsx`: Interactive eligibility checker form, rule evaluation engine connector, status badge (`Eligible`, `Partially Eligible`, `Not Eligible`), recommendation score (0-100), eligibility reasons breakdown, missing documents list.
   - `ChatPage.jsx`: AI Chat interface with conversation history, suggested prompt chips, typing indicator, Web Speech STT microphone voice button, TTS read-aloud button per AI message, scheme context references.
   - `DocumentExplainerPage.jsx`: PDF/Image file upload dropzone, OCR extracted text view, AI summary with highlighted benefits/eligibility/documents/deadlines.
   - `ChecklistPage.jsx`: Auto-generated document checklist from scheme requirements, interactive completion checkboxes, progress percentage bar.
   - `BookmarksPage.jsx`: Saved schemes list, quick unsave button, view details button.
   - `NotificationsPage.jsx`: Alerts list, deadline reminders, mark-as-read buttons.
   - `ProfilePage.jsx`: View and edit farmer profile synced with API.
   - `SettingsPage.jsx`: Language selection, notification toggles, account deletion confirmation modal.
   - `SearchPage.jsx`: Full-text search across schemes, documents, and chat history.
3. Update `D:\KrishiSahayak\frontend\src\App.jsx` with routes for all pages.
4. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All screens and voice features must be authentic custom React components.
5. Execute `npm run build` in `D:\KrishiSahayak\frontend` to verify 0 syntax/bundling errors. Document results in handoff.md inside D:\KrishiSahayak\.agents\worker_frontend_m6. Send a message to parent when done.
