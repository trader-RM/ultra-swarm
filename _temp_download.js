const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ultraDir = path.join('D:', 'Repos', 'Ultra Swarm');
const baseDir = path.join(ultraDir, 'base', 'opencode-swarm');
const compareDir = path.join(ultraDir, '_v6.68.0_compare');

// Step 1: Download the npm tarball
console.log('Downloading opencode-swarm@6.68.0...');
try {
  fs.mkdirSync(compareDir, { recursive: true });
  execSync('npm pack opencode-swarm@6.68.0', {
    cwd: compareDir,
    encoding: 'utf8',
    timeout: 60000,
    stdio: 'pipe'
  });
  const files = fs.readdirSync(compareDir);
  const tgz = files.find(f => f.endsWith('.tgz'));
  if (tgz) {
    console.log('Downloaded:', tgz);
    // Extract
    execSync(`tar xzf "${tgz}"`, {
      cwd: compareDir,
      encoding: 'utf8',
      timeout: 30000,
      stdio: 'pipe'
    });
    console.log('Extracted successfully');
    
    // Check structure
    const packageDir = path.join(compareDir, 'package');
    if (fs.existsSync(packageDir)) {
      const srcDir = path.join(packageDir, 'src');
      if (fs.existsSync(srcDir)) {
        console.log('Source directory found');
        // List the key files we care about
        const keyFiles = [
          'src/config/constants.ts',
          'src/agents/architect.ts', 
          'src/agents/index.ts',
          'src/config/agent-categories.ts',
          'src/config/schema.ts'
        ];
        for (const f of keyFiles) {
          const fullPath = path.join(packageDir, f);
          if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            console.log(`  ${f}: ${stat.size} bytes`);
          } else {
            console.log(`  ${f}: NOT FOUND`);
          }
        }
      } else {
        console.log('No src directory in package - this might be a dist-only package');
        const pkgFiles = fs.readdirSync(packageDir);
        console.log('Package contents:', pkgFiles.join(', ').substring(0, 500));
      }
    }
  } else {
    console.log('No .tgz file found in', compareDir);
    console.log('Files:', files.join(', '));
  }
} catch (e) {
  console.log('Error:', e.message.substring(0, 500));
}