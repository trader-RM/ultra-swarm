const { execSync } = require('child_process');
const path = require('path');

// Restore architect.ts from git HEAD
try {
  execSync('git checkout HEAD -- "base/opencode-swarm/src/agents/architect.ts"', {
    cwd: path.join('D:', 'Repos', 'Ultra Swarm'),
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('Restored architect.ts from git HEAD');
} catch (e) {
  console.log('Restore error:', e.message.substring(0, 500));
}

// Verify the file is now valid
const fs = require('fs');
const filePath = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm', 'src', 'agents', 'architect.ts');
const stat = fs.statSync(filePath);
console.log('Restored file size:', stat.size, 'bytes');
const buf = fs.readFileSync(filePath);
console.log('First 4 bytes:', Array.from(buf.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
const content = buf.toString('utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Line 51:', lines[50].substring(0, 120));