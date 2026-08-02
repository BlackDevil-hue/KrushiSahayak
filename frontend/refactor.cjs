const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace import
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+'\.\.\/services\/schemeData';/g,
    "import { useSchemes, getBookmarkedSchemeIds, toggleBookmarkSchemeId, evaluateEligibility } from '../hooks/useSchemes';"
  );

  // Inject hook into component body
  // Find "export default function ComponentName() {"
  const componentRegex = /export\s+default\s+function\s+\w+\(\)\s*\{/;
  if (componentRegex.test(content)) {
    if (!content.includes('const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();')) {
      content = content.replace(
        componentRegex,
        match => `${match}\n  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();`
      );
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Refactored ${file}`);
});
