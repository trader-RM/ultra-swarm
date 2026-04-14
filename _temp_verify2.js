const fs = require('fs');
const path = require('path');

const constantsPath = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm', 'src', 'config', 'constants.ts');
const content = fs.readFileSync(constantsPath, 'utf8');

// Search for the specific agents
const targets = ['code_reviewer', 'build_error_resolver', 'e2e_runner', 'chief_of_staff'];
for (const t of targets) {
  const idx = content.indexOf(t);
  if (idx !== -1) {
    // Get surrounding context
    const start = Math.max(0, idx - 30);
    const end = Math.min(content.length, idx + t.length + 30);
    console.log(`Found "${t}" at index ${idx}:`, JSON.stringify(content.substring(start, end)));
  } else {
    console.log(`NOT FOUND: "${t}"`);
  }
}

// Better parsing: find ALL_SUBAGENT_NAMES section
const startIdx = content.indexOf('export const ALL_SUBAGENT_NAMES');
const endIdx = content.indexOf('];', startIdx);
const section = content.substring(startIdx, endIdx + 2);

// Extract quoted strings
const quotedStrings = [...section.matchAll(/['"]([\w_]+)['"]/g)].map(m => m[1]);
console.log('\nTotal names in ALL_SUBAGENT_NAMES:', quotedStrings.length);
const unique = [...new Set(quotedStrings)];
console.log('Unique names:', unique.length);

// Find the 4 "missing" agents
const missing = ['code_reviewer', 'build_error_resolver', 'e2e_runner', 'chief_of_staff'];
for (const m of missing) {
  console.log(`"${m}" in parsed list:`, unique.includes(m));
}