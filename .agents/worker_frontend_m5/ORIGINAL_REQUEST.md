## 2026-07-31T22:37:35Z
<USER_REQUEST>
You are the Frontend Systems Engineer for KrishiSahayak.
Your working directory is D:\KrishiSahayak\.agents\worker_frontend_m5.
Create your working directory D:\KrishiSahayak\.agents\worker_frontend_m5 and initialize progress.md.

Task Objective:
Initialize the React frontend application, custom Material 3 design system (green/white/amber), responsive navigation layouts, reusable UI components, and Auth/Profile screens.

Instructions:
1. Create directory `D:\KrishiSahayak\frontend` and package.json with dependencies (`react`, `react-dom`, `react-router-dom`, `lucide-react` or SVG icons). Setup Vite config or webpack build scripts.
2. Build custom Material 3 design system in `src/styles/theme.css` & `src/styles/main.css`:
   - Primary Green (#2E7D32), Accent Amber (#F9A825), Background (#FFFFFF), Surface (#F5F5F5), Text (#1C1B1F).
   - Rounded cards (12px border-radius), grid spacing (16px/24px), minimum 16px typography, WCAG AA contrast.
   - STRICT RULE: 100% custom CSS. NO third-party UI libraries (no MUI, no Ant Design, no Bootstrap, no Tailwind).
3. Build reusable UI components in `src/components/`:
   - `Button.jsx`, `Input.jsx`, `Select.jsx`, `Card.jsx`, `Modal.jsx`, `Navbar.jsx`, `BottomNav.jsx`, `Sidebar.jsx`, `LoadingSkeleton.jsx`, `Toast.jsx`, `Header.jsx`, `ExternalLinkModal.jsx`.
4. Responsive navigation layout container:
   - Mobile layout (<768px, 360px min) with header and bottom navigation bar.
   - Desktop layout (>=768px, 1440px) with responsive sidebar navigation.
5. Create Context and API service in `src/`:
   - `context/AuthContext.jsx`: Auth state management (user, token, profile, login, verifyOtp, googleAuth, logout).
   - `context/ThemeContext.jsx`: Theme preference.
   - `services/api.js`: Fetch API wrapper with JWT Authorization header injection and error handling.
6. Build Auth & Registration pages in `src/pages/`:
   - `LandingPage.jsx`: Hero banner, value proposition, feature overview cards, CTA buttons.
   - `LoginPage.jsx`: Phone number input + OTP entry form (with dev code hint '123456'), Google OAuth sign-in button.
   - `RegisterPage.jsx`: Complete farmer profile form (name, phone, state, district, crop types, land size in acres, income bracket, category SC/ST/OBC/General, gender, age, farmer type smallholder/marginal/medium/large).
7. Connect routes in `src/App.jsx` with protected route wrapper.
8. MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All UI components, styles, and forms must be authentic custom React code.
9. Verify React setup and component syntax. Document results in handoff.md inside D:\KrishiSahayak\.agents\worker_frontend_m5. Send a message to parent when done.
</USER_REQUEST>
