# Project: KrishiSahayak

## Architecture & System Design
- **Architecture**: Client-Server SPA Architecture
- **Frontend**: React (Vite/CRA) in `/frontend` with custom Material 3 design system (Green #2E7D32, Amber #F9A825, White #FFFFFF, Dark Text #1C1B1F). No external UI component library.
- **Backend**: Express REST API in `/backend` with modular structure (`controllers`, `services`, `models`, `routes`, `middleware`, `utils`, `config`).
- **Database**: MongoDB instance (local or MongoDB Atlas connection string in Mongoose).
- **AI/OCR Integrations**: @google/generative-ai, tesseract.js, pdf-parse.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | E2E Testing Track | Comprehensive opaque-box E2E test runner & test cases (Tiers 1-4). Publishes TEST_READY.md | None | DONE |
| M2 | Backend Infra & Seed Data | Project setup, Express server, Mongoose models, DB connection, seed script with 10 real schemes | None | DONE |
| M3 | Auth & Core REST APIs | OTP/Google auth, profile management, schemes API, eligibility engine, bookmarks & notifications | M2 | DONE |
| M4 | AI Engine, OCR & Services | Gemini RAG chat service, tesseract.js/pdf-parse OCR + AI summary, document checklist backend | M2, M3 | DONE |
| M5 | Frontend System & Auth UI | React SPA setup, Material 3 design system, responsive navigation, landing page, login/registration | None | DONE |
| M6 | Frontend Feature Screens & Web Speech | Dashboard, Scheme Browser, Scheme Detail, Eligibility Checker, AI Chat, OCR Explainer, Checklist, Web Speech voice features | M3, M4, M5 | DONE |
| M7 | Integration & Hardening | Dual track E2E verification, Tier 5 adversarial testing, Forensic Audit verification | M1-M6 | DONE |

## Code Layout
```
D:\KrishiSahayak\
├── backend/
│   ├── src/
│   │   ├── config/       # db.js, env.js
│   │   ├── controllers/  # authController, schemeController, eligibilityController, chatController, documentController, checklistController, bookmarkController, notificationController, profileController
│   │   ├── middleware/   # authMiddleware, validationMiddleware, errorMiddleware
│   │   ├── models/       # User.js, FarmerProfile.js, Scheme.js, ChatMessage.js, Document.js, Checklist.js, Bookmark.js, Notification.js
│   │   ├── routes/       # authRoutes, schemeRoutes, eligibilityRoutes, chatRoutes, documentRoutes, checklistRoutes, bookmarkRoutes, notificationRoutes, profileRoutes
│   │   ├── services/     # smsService, googleAuthService, eligibilityEngine, geminiService, ocrService, ragService
│   │   └── utils/        # helpers, constants, logger
│   ├── scripts/
│   │   └── seedSchemes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components (Button, Input, Card, Modal, Navbar, BottomNav, Sidebar, LoadingSkeleton, Toast, Header)
│   │   ├── pages/        # LandingPage, LoginPage, RegisterPage, DashboardPage, SchemeBrowserPage, SchemeDetailPage, EligibilityPage, ChatPage, DocumentExplainerPage, ChecklistPage, BookmarksPage, NotificationsPage, ProfilePage, SettingsPage, SearchPage
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── services/     # api.js, speechService.js
│   │   ├── styles/       # theme.css, main.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js (or webpack)
└── e2e-tests/
    ├── runner.js
    ├── suites/           # tier1_features.test.js, tier2_boundaries.test.js, tier3_combinations.test.js, tier4_workloads.test.js
    └── TEST_INFRA.md
```

## Interface Contracts

### Auth API
- `POST /api/auth/send-otp` -> `{ phone: string }` => `{ success: true, message: "OTP sent" }`
- `POST /api/auth/verify-otp` -> `{ phone: string, otp: string }` => `{ token: string, user: object, profileCompleted: boolean }`
- `POST /api/auth/google` -> `{ idToken: string }` => `{ token: string, user: object, profileCompleted: boolean }`
- `POST /api/auth/logout` -> Auth header => `{ success: true }`
- `DELETE /api/auth/account` -> Auth header => `{ success: true }`

### Profile API
- `GET /api/profile` -> Auth header => `{ profile: object }`
- `PUT /api/profile` -> Auth header, body fields => `{ profile: object }`

### Scheme API
- `GET /api/schemes?search=&category=&state=&deadline=&sort=&page=&limit=` => `{ schemes: Array, pagination: object }`
- `GET /api/schemes/:id` => `{ scheme: object }`

### Eligibility API
- `POST /api/eligibility/check` -> `{ schemeId: string, farmerProfile?: object }` => `{ status: "eligible"|"partially_eligible"|"not_eligible", score: number, reasons: Array, missingDocuments: Array }`
- `GET /api/eligibility/recommendations` => `{ recommendations: Array }`

### Chat API
- `POST /api/chat` -> `{ message: string, conversationId?: string }` => `{ reply: string, conversationId: string, suggestedPrompts: Array, relevantSchemes: Array }`
- `GET /api/chat/history` => `{ messages: Array }`

### Document API
- `POST /api/documents/upload` -> multipart file => `{ documentId: string, extractedText: string, summary: { benefits: Array, eligibility: Array, requiredDocuments: Array, deadlines: Array } }`
- `GET /api/documents/:id` => `{ document: object }`

### Checklist API
- `GET /api/checklists/:schemeId` => `{ schemeId: string, items: Array, completionPercentage: number }`
- `PUT /api/checklists/:schemeId` => `{ itemIndex: number, completed: boolean }` => updated checklist
