# Tier 5 White-Box Adversarial Coverage Hardening Report

**Working Directory**: `D:\KrishiSahayak\.agents\challenger_frontend_m7`  
**Target Codebase**: `D:\KrishiSahayak\frontend\`  
**Target Build Command**: `npm run build`  
**Status**: Build Verified (PASS: 0 build errors) | 4 Adversarial Findings Documented (2 High, 1 Medium, 1 Hardening)

---

## 1. Observation

### Build Verification Output
`npm run build` executed in `D:\KrishiSahayak\frontend`:
```
> krishisahayak-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 1600 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.85 kB │ gzip:  0.47 kB
dist/assets/index-ahZDQqKF.css    6.16 kB │ gzip:  1.93 kB
dist/assets/index-DcvfoYW2.js   337.48 kB │ gzip: 93.63 kB
✓ built in 6.32s
```

### Dependency Audit (`package.json`)
```json
{
  "name": "krishisahayak-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "vite build --mode production",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "lucide-react": "^0.439.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### Direct Code Observations & Line References

#### 1. `D:\KrishiSahayak\frontend\src\context\AuthContext.jsx` (Lines 8-15)
```javascript
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('krishi_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('krishi_profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
```

#### 2. `D:\KrishiSahayak\frontend\src\services\schemeData.js` (Lines 450-457)
```javascript
export function getBookmarkedSchemeIds() {
  try {
    const data = localStorage.getItem('krishi_bookmarks');
    return data ? JSON.parse(data) : ['pm-kisan', 'kcc'];
  } catch (e) {
    return ['pm-kisan', 'kcc'];
  }
}
```

#### 3. `D:\KrishiSahayak\frontend\src\services\speechService.js` (Lines 46-47)
```javascript
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
```

#### 4. `D:\KrishiSahayak\frontend\src\services\schemeData.js` (Lines 314-325)
```javascript
  const farmerLand = parseFloat(farmerProfile.landSize || '2.0');
  const farmerIncome = parseFloat(farmerProfile.income || '150000');

  // Rule 1: Land size max
  if (rules.maxLandSize) {
    if (farmerLand <= rules.maxLandSize) {
      reasons.push({
        rule: `Land Size Limit (Max ${rules.maxLandSize} Acres)`,
        passed: true,
        message: `Your land holding of ${farmerLand} acres is within the permitted ${rules.maxLandSize} acres limit.`,
      });
...
```

---

## 2. Logic Chain

### Finding 1 [HIGH RISK]: Uncaught `SyntaxError` on Corrupted `localStorage` in `AuthContext.jsx`
- **Observation**: `AuthContext.jsx` calls `JSON.parse(savedUser)` and `JSON.parse(savedProfile)` inside the initial `useState` callback functions without `try...catch` blocks.
- **Logic**: If `localStorage.getItem('krishi_user')` or `'krishi_profile'` contains malformed JSON (e.g. `'undefined'`, `'{invalid'`, `'corrupted_str'`), `JSON.parse()` throws an unhandled `SyntaxError`. Because `AuthProvider` wraps the root application tree (`App.jsx`), this uncaught error causes React initialization to fail instantly, rendering a blank white screen across all 16+ pages.
- **Mitigation Recommendation**: Wrap `JSON.parse` calls in `try...catch` blocks that fallback to `null` and clear the invalid `localStorage` item.

### Finding 2 [HIGH RISK]: Missing `Array.isArray` Check in `schemeData.js` `getBookmarkedSchemeIds()`
- **Observation**: `getBookmarkedSchemeIds()` executes `JSON.parse(data)` inside a `try...catch`, but does not verify whether `parsed` is an Array.
- **Logic**: If `localStorage.getItem('krishi_bookmarks')` contains valid JSON representing a primitive or non-array object (e.g. `"123"`, `"true"`, `"{}"`), `JSON.parse` succeeds without throwing. `getBookmarkedSchemeIds()` then returns `123`, `true`, or `{}`. When pages (`BookmarksPage.jsx`, `SchemeDetailPage.jsx`, `SchemeBrowserPage.jsx`) attempt `bookmarks.includes(scheme.id)`, Javascript throws `TypeError: bookmarks.includes is not a function`, causing unhandled component rendering crashes.
- **Mitigation Recommendation**: Ensure `getBookmarkedSchemeIds()` checks `Array.isArray(data ? JSON.parse(data) : null)` before returning.

### Finding 3 [MEDIUM RISK]: Unchecked Negative Input Boundary in `evaluateEligibility`
- **Observation**: In `schemeData.js` (lines 314-325), `farmerLand` is calculated via `parseFloat(farmerProfile.landSize)`.
- **Logic**: If a negative value (e.g., `-5.0`) is passed into `farmerProfile.landSize`, `farmerLand <= rules.maxLandSize` evaluates to `true` (since `-5.0 <= 5.0`). The system outputs a positive qualification message: *"Your land holding of -5 acres is within the permitted 5 acres limit"*.
- **Mitigation Recommendation**: Sanitize `farmerLand` using `Math.max(0, parseFloat(...))` or return a validation error for negative numbers.

### Finding 4 [HARDENING]: Synchronous Instantiation of SpeechRecognition in Restricted Browsers
- **Observation**: In `speechService.js` line 47, `new SpeechRecognition()` is called synchronously inside `createSTTListener` outside a `try...catch` block.
- **Logic**: If the web application is loaded inside an iframe without microphone permissions or an environment with strict Feature-Policy headers, `new SpeechRecognition()` can throw a synchronous `DOMException / SecurityError` before event handlers are attached.
- **Mitigation Recommendation**: Enclose `new SpeechRecognition()` in a `try...catch` block within `createSTTListener` and invoke `onError` gracefully.

### Verified Audit Assertions (PASS)

1. **Custom Material 3 CSS Design System Verification**:
   - `package.json` confirms **0 third-party UI framework dependencies** (no MUI, Ant Design, Bootstrap, Tailwind, Chakra, Mantine).
   - `styles/theme.css` provides complete Material 3 design tokens: `--color-primary` (`#2E7D32`), `--color-accent` (`#F9A825`), custom dark theme overrides under `[data-theme="dark"]`, 4 elevation shadow levels (`--shadow-sm` through `--shadow-xl`), typography scale, and z-index hierarchy.
   - `styles/main.css` provides custom responsive grid utilities (`.grid-2`, `.grid-3`, `.grid-4`), shimmer animations, and unified form component styles.

2. **External Link Warning Modal (`ExternalLinkModal.jsx`)**:
   - Outbound clicks to government portals (`https://pmkisan.gov.in`, `https://agmarknet.gov.in`, `https://pmfby.gov.in`, `https://soilhealth.dac.gov.in`) are intercepted via state modal in `DashboardPage.jsx` and `SchemeDetailPage.jsx`.
   - Navigation opens via `window.open(targetUrl, '_blank', 'noopener,noreferrer')`, eliminating tabnabbing security risks.

3. **Web Speech API Unsupported / Permission Denied Fallback**:
   - `isSTTSupported()` and `isTTSSupported()` properly guard feature activation across `ChatPage.jsx`, `SchemeBrowserPage.jsx`, `SearchPage.jsx`, and `SchemeDetailPage.jsx`.
   - Clear user warnings (`"Web Speech API is not supported in your browser"`) are displayed when features are unavailable.

---

## 3. Caveats

- **Hardware/Peripheral Testing**: Live hardware microphone input capture was not tested in an interactive browser session during this static white-box execution (verification relied on static analysis and code tracing of `speechService.js`).
- **Browser-Specific Variations**: Safari (iOS WebKit) speech synthesis voice loading behavior relies on `window.speechSynthesis.onvoiceschanged`, which is handled dynamically by fallback checks in `speakText`.

---

## 4. Conclusion

The `KrishiSahayak` frontend is built with high architectural rigor:
1. It features a clean, dependency-free **Custom Material 3 CSS design system**.
2. It exhibits strong security patterns including **External Link Warning Modal with `noopener,noreferrer`**.
3. It builds cleanly with **0 errors** using Vite (`npm run build`).

To achieve complete Tier 5 white-box resilience, the 4 documented findings (specifically the `localStorage` JSON parsing in `AuthContext.jsx` and `schemeData.js`) should be hardened with `try...catch` blocks and `Array.isArray()` checks.

---

## 5. Verification Method

To independently verify this report and reproduce all findings:

### 1. Build Verification
Run the following terminal command inside `D:\KrishiSahayak\frontend`:
```powershell
cd D:\KrishiSahayak\frontend
npm run build
```
*Expected Result*: Build completes with exit code 0 and outputs production bundle assets into `dist/`.

### 2. Reproduce `AuthContext` Corrupted LocalStorage Crash
Open browser developer tools console on `http://localhost:5173` and run:
```javascript
localStorage.setItem('krishi_user', '{invalid_json');
location.reload();
```
*Expected Result*: Uncaught `SyntaxError` in `AuthContext.jsx:10`, causing white screen.

### 3. Reproduce `schemeData` Bookmarks Array Type Crash
Run in browser console:
```javascript
localStorage.setItem('krishi_bookmarks', '"invalid_string"');
location.reload();
```
Navigate to `/bookmarks` or `/schemes`.
*Expected Result*: `TypeError: bookmarks.includes is not a function` in `BookmarksPage.jsx` / `SchemeDetailPage.jsx`.
