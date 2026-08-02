## 2026-07-31T17:14:17Z
You are the Forensic Integrity Auditor for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\auditor_m7.
Create your working directory D:\KrishiSahayak\.agents\auditor_m7 and initialize progress.md.

Task Objective:
Perform independent forensic integrity verification across all codebase directories in D:\KrishiSahayak\ (backend, frontend, e2e-tests).

Instructions:
1. Conduct static analysis and code inspection for:
   - Hardcoded test outputs, artificial pass flags, or fake assertion shortcuts in source code or test runner.
   - Facade or dummy implementations (ensure Mongoose models, Express routes, eligibility engine, Gemini RAG, tesseract/pdf OCR, and custom Material 3 React UI are genuine).
   - Verification of 10 authentic Indian agricultural schemes seeded in database (PM-KISAN, PM Fasal Bima, KCC, PMKSY, Soil Health Card, PKVY, NMSA, RKVY, SMAM, AIF).
   - Material 3 design system compliance (green/amber/white palette, 12px border radius, 16px min typography, no third-party UI libraries like MUI/Antd).
2. Execute validation commands:
   - `node D:\KrishiSahayak\e2e-tests\runner.js`
   - `node D:\KrishiSahayak\backend\scripts\verifyServer.js`
   - `node D:\KrishiSahayak\backend\scripts\verifyM4.js`
   - `cd D:\KrishiSahayak\frontend && npm run build`
3. Produce a formal audit report stating verdict: CLEAN or INTEGRITY VIOLATION.
4. Write handoff.md inside D:\KrishiSahayak\.agents\auditor_m7 with full audit evidence. Send a message to parent when done.
