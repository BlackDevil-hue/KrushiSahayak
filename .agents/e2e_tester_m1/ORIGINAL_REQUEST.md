## 2026-07-31T17:05:26Z

You are the E2E Testing Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\e2e_tester_m1.
Create your working directory D:\KrishiSahayak\.agents\e2e_tester_m1 and initialize progress.md.

Task Objective:
Build the E2E Testing Infrastructure and Opaque-Box Test Suite (Tiers 1-4) for KrishiSahayak based on D:\KrishiSahayak\.agents\ORIGINAL_REQUEST.md.

Instructions:
1. Create directory D:\KrishiSahayak\e2e-tests with test scripts and runner.
2. Implement 4-tier opaque-box test suites:
   - Tier 1: Feature Coverage (>=5 test cases per feature across 16+ frontend screens and backend REST endpoints: Auth OTP/Google, Profile, Schemes list/search/filter, Scheme Details, Eligibility Checker, AI Chat RAG, Document OCR & AI summary, Document Checklist, Bookmarks, Notifications, Web Speech).
   - Tier 2: Boundary & Corner Cases (empty inputs, invalid OTPs, invalid file formats, zero/negative land size, non-existent scheme IDs, max string lengths).
   - Tier 3: Cross-Feature Combinations (pairwise interactions: registration -> eligibility check -> AI chat -> bookmark -> checklist -> notifications).
   - Tier 4: Real-World Application Scenarios (end-to-end user journeys for smallholder farmer, marginal farmer, large farmer discovering & applying for schemes).
3. Create standalone test runner script (e.g. `node e2e-tests/runner.js`) that can execute test assertions against API/backend endpoints and simulated workflows.
4. Create D:\KrishiSahayak\TEST_INFRA.md at project root detailing test philosophy, feature inventory, tier breakdown, and execution instructions.
5. Create D:\KrishiSahayak\TEST_READY.md at project root once test runner and test cases are ready, summarizing test tier counts and feature coverage checklist.
6. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All test implementations must be genuine assertions. DO NOT hardcode passing flags.
7. Run the test runner, document findings and execution results in handoff.md inside D:\KrishiSahayak\.agents\e2e_tester_m1. Send a message to parent when done.
