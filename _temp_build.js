const { execSync } = require('child_process');
const path = require('path');

const cwd = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm');

try {
  execSync('bun run tsc --noEmit', {
    cwd: cwd,
    encoding: 'utf8',
    timeout: 180000,
    stdio: 'pipe'
  });
  console.log('TypeScript build: SUCCESS');
} catch (e) {
  console.log('TypeScript build: FAILED');
  console.log('STDOUT:', (e.stdout || '').substring(0, 2000));
  console.log('STDERR:', (e.stderr || '').substring(0, 2000));
  console.log('Exit code:', e.status);
}