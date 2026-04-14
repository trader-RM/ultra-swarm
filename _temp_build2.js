const { execSync } = require('child_process');
const path = require('path');

const cwd = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm');

try {
  const result = execSync('bun run tsc --noEmit', {
    cwd: cwd,
    encoding: 'utf8',
    timeout: 180000,
    stdio: 'pipe'
  });
  console.log('TypeScript build: SUCCESS');
  console.log(result || '(no output = success)');
} catch (e) {
  console.log('TypeScript build: FAILED');
  const stdout = (e.stdout || '').substring(0, 2000);
  const stderr = (e.stderr || '').substring(0, 2000);
  console.log('STDOUT:', stdout);
  console.log('STDERR:', stderr);
  console.log('Exit code:', e.status);
}