const fs = require('fs');
const path = require('path');

const constantsPath = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm', 'src', 'config', 'constants.ts');
const content = fs.readFileSync(constantsPath, 'utf8');

const startIdx = content.indexOf('export const ALL_SUBAGENT_NAMES');
const endIdx = content.indexOf('];', startIdx);
const section = content.substring(startIdx, endIdx + 2);

const quotedStrings = [...section.matchAll(/['"]([\w_]+)['"]/g)].map(m => m[1]);
const unique = [...new Set(quotedStrings)];

console.log('Total unique names in ALL_SUBAGENT_NAMES:', unique.length);
console.log('Names:', unique.join(', '));

// Expected 37 ECC agents
const eccAgents = [
  'code_reviewer', 'security_reviewer', 'cpp_reviewer', 'go_reviewer', 'kotlin_reviewer',
  'java_reviewer', 'rust_reviewer', 'python_reviewer', 'typescript_reviewer', 'csharp_reviewer',
  'flutter_reviewer', 'database_reviewer', 'healthcare_reviewer', 'gan_evaluator', 'opensource_sanitizer',
  'build_error_resolver', 'cpp_build_resolver', 'go_build_resolver', 'kotlin_build_resolver',
  'java_build_resolver', 'rust_build_resolver', 'pytorch_build_resolver', 'dart_build_resolver',
  'tdd_guide', 'e2e_runner', 'refactor_cleaner', 'performance_optimizer', 'gan_generator',
  'opensource_forker', 'opensource_packager', 'planner', 'doc_updater', 'docs_lookup',
  'harness_optimizer', 'loop_operator', 'chief_of_staff', 'gan_planner'
];

const found = eccAgents.filter(a => unique.includes(a));
console.log('\nECC agents found:', found.length, '/37');
const missing = eccAgents.filter(a => !unique.includes(a));
if (missing.length > 0) console.log('MISSING ECC agents:', missing);

// Expected native Swarm agents
const swarmNative = ['explorer', 'sme', 'coder', 'reviewer', 'test_engineer', 'critic', 'critic_sounding_board', 'docs', 'designer'];
const nativeFound = swarmNative.filter(n => unique.includes(n));
console.log('Swarm-native agents found:', nativeFound.length, '/9');

// Check for extras
const extra = unique.filter(n => !eccAgents.includes(n) && !swarmNative.includes(n));
if (extra.length > 0) console.log('Extra agents:', extra);

console.log('\nTotal: native', nativeFound.length, '+ ECC', found.length, '+ extra', extra.length, '=', nativeFound.length + found.length + extra.length);