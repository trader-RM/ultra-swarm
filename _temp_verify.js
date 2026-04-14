const fs = require('fs');
const path = require('path');

// Verify Task 2.1: ALL_SUBAGENT_NAMES has 37 ECC entries
const constantsPath = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm', 'src', 'config', 'constants.ts');
const content = fs.readFileSync(constantsPath, 'utf8');

// Check ALL_SUBAGENT_NAMES section
const allSubagentMatch = content.match(/export const ALL_SUBAGENT_NAMES\s*=\s*\[([\s\S]*?)\]/);
if (allSubagentMatch) {
  const names = allSubagentMatch[1]
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(s => s.length > 0);
  console.log('ALL_SUBAGENT_NAMES count:', names.length);
  
  // Check for our ECC agents
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
  
  const found = eccAgents.filter(a => names.includes(a));
  console.log('ECC agents in ALL_SUBAGENT_NAMES:', found.length, '/37');
  const missing = eccAgents.filter(a => !names.includes(a));
  if (missing.length > 0) console.log('MISSING:', missing);
} else {
  console.log('ERROR: Could not find ALL_SUBAGENT_NAMES');
}

// Check AGENT_TOOL_MAP
const toolMapMatch = content.match(/code_reviewer.*?\]/s);
console.log('AGENT_TOOL_MAP has code_reviewer entry:', content.includes("'code_reviewer'") || content.includes('"code_reviewer"'));
console.log('AGENT_TOOL_MAP has build_error_resolver entry:', content.includes("'build_error_resolver'") || content.includes('"build_error_resolver"'));
console.log('AGENT_TOOL_MAP has planner entry:', content.includes("'planner'") || content.includes('"planner"'));

console.log('\nFile size:', content.length, 'bytes');