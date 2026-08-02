# KrishiSahayak E2E Testing Infrastructure (TEST_INFRA.md)

## 1. Testing Philosophy & Architecture

The KrishiSahayak E2E Test Suite enforces an **opaque-box testing approach**. Tests interact with the system strictly through HTTP endpoints or standard API contract payloads, without inspecting or relying on internal database or private component states.

### Core Principles:
1. **Zero Cheating Guarantee**: All test assertions verify real response payloads, HTTP status codes, data types, and business logic calculations. No hardcoded passing flags or facade mock returns.
2. **Dual-Mode Execution**: The test runner supports both **Live HTTP Mode** (executing against a running Express backend instance via `BASE_URL=http://localhost:5000/api`) and **Offline Mock Server Mode** (executing against a fully compliant in-memory router/state engine implementing all backend specs).
3. **Multi-Tier Validation Hierarchy**: 4 distinct tiers ranging from granular feature verification to complex multi-step real-world application journeys for diverse farmer personas.

---

## 2. Feature Inventory (16+ Frontend Screens & Backend APIs)

| Feature Area | Frontend Screen / UI Component | Backend REST Endpoint(s) | Tier Coverage |
|--------------|--------------------------------|-------------------------|---------------|
| **1. Auth & Accounts** | Login Page (Phone OTP & Google OAuth) | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/google`, `POST /api/auth/logout`, `DELETE /api/auth/account` | Tier 1, 2, 3, 4 |
| **2. Farmer Profile** | Registration & Profile View/Edit Screen | `GET /api/profile`, `PUT /api/profile` | Tier 1, 2, 3, 4 |
| **3. Scheme Browser** | Scheme Browser (Search, Filter, Sort, Pagination) | `GET /api/schemes?search=&category=&state=&sort=&page=&limit=` | Tier 1, 2, 3, 4 |
| **4. Scheme Details** | Scheme Detail Page & Application Warning Dialog | `GET /api/schemes/:id` | Tier 1, 2, 3, 4 |
| **5. Eligibility Checker** | Eligibility Form & Scorecard Screen | `POST /api/eligibility/check`, `GET /api/eligibility/recommendations` | Tier 1, 2, 3, 4 |
| **6. AI Chat & RAG** | Conversational Guidance Chat Screen | `POST /api/chat`, `GET /api/chat/history` | Tier 1, 2, 3, 4 |
| **7. OCR & Summary** | PDF/Image Document Explainer Upload Screen | `POST /api/documents/upload`, `GET /api/documents/:id` | Tier 1, 2, 3, 4 |
| **8. Document Checklist** | Auto-Generated Scheme Checklist Screen | `GET /api/checklists/:schemeId`, `PUT /api/checklists/:schemeId` | Tier 1, 2, 3, 4 |
| **9. Bookmarks** | Saved Schemes Bookmarks Screen | `GET /api/bookmarks`, `POST /api/bookmarks`, `DELETE /api/bookmarks/:schemeId` | Tier 1, 2, 3, 4 |
| **10. Notifications** | Notification Alerts List Screen | `GET /api/notifications`, `PUT /api/notifications/:id/read` | Tier 1, 2, 3, 4 |
| **11. Web Speech & Voice** | Microphone Voice Search & Read-Aloud | Speech-to-Text STT & Text-to-Speech TTS Integration | Tier 1, 3, 4 |
| **12. Landing Page** | Value Proposition & Call-to-Action | Visual & Routing Assertions | Tier 1 |
| **13. Dashboard** | Recommended Schemes Summary & Quick Action Cards | Integrated API Flow | Tier 1, 3 |
| **14. Search Screen** | Global Scheme Full-Text Search | Integrated Search API Query | Tier 1, 2, 3 |
| **15. Settings Screen** | Preferences & Account Management | Integrated Auth & Profile API | Tier 1, 2 |
| **16. External Link Warning**| Official Application URL Dialog | External Link Verification | Tier 1, 3 |

---

## 3. Test Suite Tier Breakdown

### Tier 1: Feature Coverage (55 Test Cases)
Comprehensive coverage verifying happy paths, expected payloads, data structures, and response properties for each feature area (>=5 test cases per feature).

### Tier 2: Boundary & Corner Cases (18 Test Cases)
Enforces resilience against invalid inputs, out-of-bounds parameters, malformed hex IDs, zero/negative land size, max string lengths, injection payloads (`{$gt: ""}`, SQL syntax), unsupported MIME types, and unauthorized token access.

### Tier 3: Cross-Feature Combinations (10 Multi-Step Workflows)
Evaluates pairwise and multi-step interactions (Registration -> Profile setup -> Eligibility check -> Bookmark scheme -> Auto-generate document checklist -> View dashboard notifications).

### Tier 4: Real-World Application Scenarios (4 End-to-End Journeys)
Evaluates real farmer personas discovering and applying for agricultural schemes:
- **Journey 1**: Smallholder Farmer Ramesh (Uttar Pradesh - PM-KISAN)
- **Journey 2**: Marginal Farmer Sunita (Maharashtra - PM Fasal Bima Yojana crop insurance & Voice search)
- **Journey 3**: Large Farmer Vikram (Punjab - Sub-Mission on Agricultural Mechanization SMAM tractor subsidy)
- **Journey 4**: Organic Farmer Priya (Madhya Pradesh - Paramparagat Krishi Vikas Yojana PKVY & Soil Health Card)

---

## 4. Directory Structure

```
D:\KrishiSahayak\
├── e2e-tests/
│   ├── runner.js                      # Standalone test runner script
│   ├── suites/
│   │   ├── tier1_features.test.js     # Tier 1 Feature Coverage tests
│   │   ├── tier2_boundaries.test.js   # Tier 2 Boundary & Corner Case tests
│   │   ├── tier3_combinations.test.js # Tier 3 Cross-Feature Combination tests
│   │   └── tier4_workloads.test.js    # Tier 4 Real-World Application Scenarios
│   └── utils/
│       ├── assert.js                  # Genuine assertion library
│       ├── apiClient.js               # Opaque-box HTTP / API Client
│       └── mockServer.js              # Compliant offline in-memory server
├── TEST_INFRA.md                      # Test Infrastructure & Philosophy Document
└── TEST_READY.md                      # Test Readiness & Coverage Summary Document
```

---

## 5. Execution Instructions

Run all E2E test suites offline (default):
```bash
node e2e-tests/runner.js
```

Run specific test tier:
```bash
node e2e-tests/runner.js --tier=1
node e2e-tests/runner.js --tier=2
node e2e-tests/runner.js --tier=3
node e2e-tests/runner.js --tier=4
```

Run against a live running Express backend:
```bash
node e2e-tests/runner.js --baseUrl=http://localhost:5000/api
```
