## 2026-07-31T17:09:56Z
<USER_REQUEST>
You are the AI & Intelligence Service Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\worker_backend_m4.
Create your working directory D:\KrishiSahayak\.agents\worker_backend_m4 and initialize progress.md.

Task Objective:
Implement Gemini AI RAG Chat service, Document OCR & AI Analysis service (tesseract.js & pdf-parse), and Document Checklist backend APIs in Node.js/Express.

Instructions:
1. Implement Gemini AI RAG Chat Service in `D:\KrishiSahayak\backend\src\services\`:
   - `geminiService.js`: Interface to `@google/generative-ai` (`GoogleGenerativeAI`). Formats prompt with agricultural assistant system instructions (simple language, explain jargon, cite schemes, never invent facts). Include dev/test fallback when GEMINI_API_KEY is unset.
   - `ragService.js`: Query schemes from MongoDB matching user message, build scheme context block, retrieve recent conversation history from `ChatMessage` model, compile final RAG prompt for Gemini API.
2. Implement Document OCR & AI Analysis Service in `D:\KrishiSahayak\backend\src\services\`:
   - `ocrService.js`: `tesseract.js` for images (PNG, JPG) and `pdf-parse` for PDF files.
   - `documentAnalysisService.js`: Pass extracted OCR text to Gemini API to generate structured JSON summary (`benefits`, `eligibility`, `requiredDocuments`, `deadlines`).
3. Implement Controllers and Routes:
   - Chat (`routes/chatRoutes.js`, `controllers/chatController.js`):
     - `POST /api/chat`: Accepts `{ message, conversationId }`, executes RAG workflow, saves `ChatMessage` records, returns `{ reply, conversationId, suggestedPrompts, relevantSchemes }`.
     - `GET /api/chat/history`: Returns conversation history for user.
   - Documents (`routes/documentRoutes.js`, `controllers/documentController.js`):
     - `POST /api/documents/upload`: Uses multer middleware for PDF/image upload, extracts OCR text, generates AI summary, saves `Document` model, returns document with OCR text & summary.
     - `GET /api/documents/:id`: Returns document by ID.
   - Checklists (`routes/checklistRoutes.js`, `controllers/checklistController.js`):
     - `GET /api/checklists/:schemeId`: Auto-generates checklist from scheme's `requiredDocuments`, returns items array & completion percentage.
     - `PUT /api/checklists/:schemeId`: Updates item completed status (`{ itemIndex, completed }`), recalculates percentage, returns updated checklist.
4. Update `D:\KrishiSahayak\backend\server.js` to register `/api/chat`, `/api/documents`, and `/api/checklists` routes.
5. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All RAG, OCR, document summarization, and checklist endpoints must be authentic and fully functional.
6. Verify services and routes via node evaluation script `D:\KrishiSahayak\backend\scripts\verifyM4.js`. Document results in handoff.md inside D:\KrishiSahayak\.agents\worker_backend_m4. Send a message to parent when done.
</USER_REQUEST>
